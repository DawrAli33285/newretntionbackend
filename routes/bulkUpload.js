const express = require('express');
const router = express.Router();
const multer = require('multer');
const XLSX = require('xlsx');
const RetentionData = require('../retentiondata'); 
const {middleware} = require('../util/middleware'); 

const {filterAndCount}=require('../controller/payment')
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });



const ageBands = [
  { min: 15, max: 19, points: 15 },
  { min: 20, max: 24, points: 10 },
  { min: 25, max: 34, points: 7  },
  { min: 35, max: 44, points: 5  },
  { min: 45, max: 54, points: 3  },
  { min: 55, max: 64, points: 1  },
  { min: 65, max: 120, points: -1 },
];

const tenureBands = [
  { min: 0,    max: 3,    points: 15 },
  { min: 4,    max: 6,    points: 10 },
  { min: 7,    max: 12,   points: 7  },
  { min: 13,   max: 24,   points: 5  },
  { min: 25,   max: 36,   points: 3  },
  { min: 37,   max: 60,   points: -1 },
  { min: 61,   max: 9999, points: -5 },
];

const distanceBands = [
  { min: 0,   max: 5,    points: 15  },
  { min: 6,   max: 10,   points: 10  },
  { min: 11,  max: 20,   points: 7   },
  { min: 21,  max: 30,   points: 5   },
  { min: 31,  max: 50,   points: 3   },
  { min: 51,  max: 100,  points: -5  },
  { min: 101, max: 9999, points: -15 },
];

const socialMap = {
  1: 7, 2: 5, 3: 3, 4: 2, 5: 1,
  6: 0, 7: -1, 8: -3, 9: -5, 10: -7
};

// Default turnover points by department (update per client)
const departmentTurnoverPoints = {
  'Nursing':           9,
  'Physical Therapy':  6,
  'Administration':    6,
};

const lookupBand = (bands, value) => {
  const band = bands.find(b => value >= b.min && value <= b.max);
  return band ? band.points : 0;
};

const calculateAge = (dob) => {
  if (!dob) return null;
  const birth = new Date(dob);
  if (isNaN(birth)) return null;
  const ageDiff = Date.now() - birth.getTime();
  return Math.floor(ageDiff / (365.25 * 24 * 60 * 60 * 1000));
};

const calculateTenureMonths = (hireDate) => {
  if (!hireDate) return null;
  const hire = new Date(hireDate);
  if (isNaN(hire)) return null;
  return Math.floor((Date.now() - hire.getTime()) / (30.44 * 24 * 60 * 60 * 1000));
};

// Haversine straight-line distance (no API needed)
// Returns miles between two lat/lng points
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 3958.8; // Earth radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Geocode an address using OpenStreetMap (free, no API key)
const geocodeAddress = async (address) => {
  try {
    const encoded = encodeURIComponent(address);
    const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'RetentionApp/1.0' }
    });
    const data = await response.json();
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    }
  } catch (e) {
    console.log('Geocoding failed for address:', address, e.message);
  }
  return null;
};

// Job location — update this to your client's actual address
const JOB_LOCATION = { lat: 39.7851, lon: -85.7763 }; // Greenfield, IN (Hancock Regional)

const scoreEmployee = async (row) => {
  const dob       = row['Date of Birth'] || '';
  const hireDate  = row['Hire Date'] || '';
  const department = row['Department'] || '';
  const address   = row['Address Line 1 + Address Line 2'] || '';
  const cityStateZip = row['City, State Zip Code (Formatted)'] || '';

  const financeRaw  = parseInt(row['Finance Score (1-10)'])          || 5;
  const scheduleRaw = parseInt(row['Schedule Score (1-10)'])         || 5;
  const wlbRaw      = parseInt(row['Work Life Balance Score (1-10)']) || 5;
  const familyRaw   = parseInt(row['Family Score (1-10)'])           || 5;

  // --- Sub-scores ---
  const age          = calculateAge(dob);
  const agePoints    = age !== null ? lookupBand(ageBands, age) : 0;

  const tenureMonths  = calculateTenureMonths(hireDate);
  const tenurePoints  = tenureMonths !== null ? lookupBand(tenureBands, tenureMonths) : 0;

  const turnoverPoints = departmentTurnoverPoints[department] ?? 6; // default 6

  const financePoints  = socialMap[financeRaw]  ?? 0;
  const schedulePoints = socialMap[scheduleRaw] ?? 0;
  const wlbPoints      = socialMap[wlbRaw]      ?? 0;
  const familyPoints   = socialMap[familyRaw]   ?? 0;

  // Distance — geocode employee address
  let distancePoints = 5; // default if geocoding fails
  let distanceMiles  = null;
  try {
    const fullAddress = `${address}, ${cityStateZip}`;
    const coords = await geocodeAddress(fullAddress);
    if (coords) {
      distanceMiles  = Math.round(haversineDistance(coords.lat, coords.lon, JOB_LOCATION.lat, JOB_LOCATION.lon));
      distancePoints = lookupBand(distanceBands, distanceMiles);
    }
  } catch (e) {
    console.log('Distance calc failed:', e.message);
  }

  const retentionScore = agePoints + distancePoints + tenurePoints + turnoverPoints
                       + financePoints + schedulePoints + wlbPoints + familyPoints;

  // Category scores (raw 1-10 for display)
  const categoryScores = {
    finances:    financeRaw,
    schedule:    scheduleRaw,
    'work life': wlbRaw,
    family:      familyRaw,
  };

  // Overall score = average of 4 domain raw scores
  const overallScore = parseFloat(((financeRaw + scheduleRaw + wlbRaw + familyRaw) / 4).toFixed(2));

  // Improvement areas = domains with raw score >= 7 (high risk)
  const domainLabels = { finances: financeRaw, schedule: scheduleRaw, 'work life': wlbRaw, family: familyRaw };
  const improvementArea = Object.entries(domainLabels)
    .filter(([, score]) => score >= 7)
    .map(([label]) => label)
    .join(', ') || 'None';

  return {
    agePoints, distancePoints, tenurePoints, turnoverPoints,
    financePoints, schedulePoints, wlbPoints, familyPoints,
    retentionScore,
    distanceMiles,
    age,
    tenureMonths,
    categoryScores,
    overallScore,
    totalScore: overallScore,
    improvementArea,
  };
};

router.post('/bulk-upload', middleware, async (req, res) => {
  try {
      
      const { employees, recordCount } = req.body;
      
      console.log('📊 Received filtered employees:', employees?.length);
      console.log('Expected record count:', recordCount);
      
      if (!employees || !Array.isArray(employees)) {
        console.log('❌ No employees data provided');
        return res.status(400).json({ 
          success: false,
          error: 'No employees data provided' 
        });
      }
  
      console.log(`📊 Processing ${employees.length} filtered employees`);
  
      if (employees.length === 0) {
        return res.status(400).json({ 
          success: false,
          error: 'No employees to process' 
        });
      }

      // Validate required columns
      const requiredColumns = [
        'Employee Name (Last Suffix, First MI)',
        'Address Line 1 + Address Line 2',
        'City, State Zip Code (Formatted)',
        'E-mail Address',
        'Hire Date',
        'Term Date',
        'Organization',
        'Division',
        'Department',
        'Job Class'
      ];

      const firstRow = employees[0];
      const fileColumns = Object.keys(firstRow);
      const missingColumns = requiredColumns.filter(col => !fileColumns.includes(col));

      if (missingColumns.length > 0) {
        console.log('❌ Missing required columns:', missingColumns);
        return res.status(400).json({
          success: false,
          error: `Missing ${missingColumns.length} required column${missingColumns.length > 1 ? 's' : ''} in the uploaded file`,
          missingColumns: missingColumns,
          foundColumns: fileColumns,
          message: `The following required columns are missing:\n\n${missingColumns.map(col => `• ${col}`).join('\n')}\n\nPlease add these columns to your file and try again.`
        });
      }

      console.log('✓ All required columns present');
  
      const successfulRecords = [];
      const failedRecords = [];
      const duplicateRecords = [];
      
      // Check duplicates within the last month
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      
      // Process filtered employees
      const recordsToProcess = [];
      
      for (let i = 0; i < employees.length; i++) {
        const row = employees[i];
        
        try {
          let employeeName = row['Employee Name (Last Suffix, First MI)'] || 
                            row['Employee Name (Last Suffix,First MI)'] || 
                            row['Employee Name'];
          
          const phone = row['Home Phone (Formatted)'] || row['Phone'] || '';
          const email = row['E-mail Address'] || row['Email'] || '';
          
          console.log(`Validating row ${i + 1}: ${employeeName || 'No name'}`);
  
          if (!employeeName) {
            console.log(`❌ Row ${i + 1}: Missing employee name`);
            failedRecords.push({
              row: i + 1,
              name: 'Unknown',
              reason: 'Missing employee name'
            });
            continue;
          }
          
          // Check for duplicates in database
          let existingEmployee = null;

          if (email) {
            existingEmployee = await RetentionData.findOne({ 
              email: email,
              createdAt: { $gte: oneMonthAgo } 
            }).sort({ createdAt: -1 }); 
          }
          
          if (!existingEmployee && phone && phone.trim() !== '') {
            existingEmployee = await RetentionData.findOne({ 
              phone: phone,
              createdAt: { $gte: oneMonthAgo }
            }).sort({ createdAt: -1 }); 
          }
  
          if (existingEmployee) {
            const daysSinceLastEntry = Math.floor((new Date() - existingEmployee.createdAt) / (1000 * 60 * 60 * 24));
            console.log(`⚠️ Duplicate found in DB: ${employeeName} (${email || phone || 'no email/phone'}) - Last entry was ${daysSinceLastEntry} days ago`);
            
            duplicateRecords.push({
              row: i + 1,
              name: employeeName,
              email: email,
              phone: phone,
              reason: `Employee already exists in database (last uploaded ${daysSinceLastEntry} days ago)`
            });
            continue;
          }
          
          // Parse name
          let splitName = employeeName.includes(',') ? 
            employeeName.split(',') : 
            employeeName.split(' ');
  
          let lastName = splitName[0]?.trim() || '';
          let firstName = splitName[1]?.trim() || '';
  
          // Get other fields
          const alternateEmail = row['Alternate Email'] || '';
          const jobClass = row['Job Class'] || row['Job Title'] || '';
          
          const addressLine = row['Address Line 1 + Address Line 2'] || 
                             row['Address Line 1'] || '';
          const cityStateZip = row['City, State Zip Code (Formatted)'] || 
                              row['City State Zip'] || '';
  
                              recordsToProcess.push({
                                rowIndex: i + 1,
                                employeeName,
                                email,
                                phone,
                                jobClass,
                                addressLine,
                                cityStateZip,
                                rawRow: row   
                              });
        } catch (error) {
          console.log(`✗ Error validating row ${i + 1}:`, error.message);
          
          failedRecords.push({
            row: i + 1,
            name: row['Employee Name (Last Suffix, First MI)'] || 'Unknown',
            reason: error.message
          });
        }
      }
  
      // If there are duplicates or failed records, return error
      if (duplicateRecords.length > 0 || failedRecords.length > 0) {
        console.log(`❌ Validation failed: ${duplicateRecords.length} duplicates, ${failedRecords.length} errors`);
        
        return res.status(400).json({
          success: false,
          error: duplicateRecords.length > 0 
            ? `Found ${duplicateRecords.length} duplicate employee(s) uploaded within the last month`
            : `Found ${failedRecords.length} invalid record(s)`,
          summary: {
            total: employees.length,
            successful: 0,
            failed: failedRecords.length,
            duplicates: duplicateRecords.length
          },
          duplicates: duplicateRecords.length > 0 ? duplicateRecords : undefined,
          failedRecords: failedRecords.length > 0 ? failedRecords : undefined
        });
      }
  
      // Process and save employees
      let processedCount = 0;
      
      for (const record of recordsToProcess) {
        try {
          // Run scoring engine on original row data
          const scores = await scoreEmployee(record.rawRow);

          const riskLevel = scores.overallScore >= 7 ? 'High Risk'
                          : scores.overallScore >= 4 ? 'Medium Risk'
                          : 'Low Risk';

          const employeeData = {
            name: record.employeeName,
            email: record.email || `no-email-${Date.now()}-${record.rowIndex}@example.com`,
            phone: record.phone,
            job_class: record.jobClass,
            address: record.addressLine,
            city_state_zip: record.cityStateZip,
            employement_status: record.rawRow['Employment Status'] || 'Active',
            department: record.rawRow['Department'] || '',
            division: record.rawRow['Division'] || '',
            organization: record.rawRow['Organization'] || '',
            hireDate: record.rawRow['Hire Date'] || '',
            termDate: record.rawRow['Term Date'] || '',
            dateOfBirth: record.rawRow['Date of Birth'] || '',
            salaryRange: record.rawRow['Salary Range'] || '',
            // Scoring breakdown
            agePoints:      scores.agePoints,
            distancePoints: scores.distancePoints,
            tenurePoints:   scores.tenurePoints,
            turnoverPoints: scores.turnoverPoints,
            financePoints:  scores.financePoints,
            schedulePoints: scores.schedulePoints,
            wlbPoints:      scores.wlbPoints,
            familyPoints:   scores.familyPoints,
            retentionScore: scores.retentionScore,
            distanceMiles:  scores.distanceMiles,
            categoryScores: scores.categoryScores,
            overallScore:   scores.overallScore,
            riskLevel,
            improvementArea: scores.improvementArea,
            possibleImprovedScore: Math.round(scores.overallScore * 0.8),
          };
          const savedEmployee = await RetentionData.create(employeeData);
          successfulRecords.push({
            id:              savedEmployee._id,
            employeeNumber:  savedEmployee.employeeNumber,
            name:            record.employeeName,
            email:           record.email,
            phone:           record.phone,
            address:         record.addressLine,
            city_state_zip:  record.cityStateZip,
            organization:    record.rawRow['Organization'] || '',
            division:        record.rawRow['Division'] || '',
            department:      record.rawRow['Department'] || '',
            job_class:       record.jobClass,
            hireDate:        record.rawRow['Hire Date'] || '',
            termDate:        record.rawRow['Term Date'] || '',
            salaryRange:     record.rawRow['Salary Range'] || '',
            dateOfBirth:     record.rawRow['Date of Birth'] || '',
            // All scoring fields from scoreEmployee()
            agePoints:       scores.agePoints,
            distancePoints:  scores.distancePoints,
            tenurePoints:    scores.tenurePoints,
            turnoverPoints:  scores.turnoverPoints,
            financePoints:   scores.financePoints,
            schedulePoints:  scores.schedulePoints,
            wlbPoints:       scores.wlbPoints,
            familyPoints:    scores.familyPoints,
            retentionScore:  scores.retentionScore,
            distanceMiles:   scores.distanceMiles,
            tenureMonths:    scores.tenureMonths,
            categoryScores:  scores.categoryScores,
            overallScore:    scores.overallScore,
            improvementArea: scores.improvementArea,
            rightFitCandidate: false, // set your logic here if needed
          });
          processedCount++;
  
          console.log(`✓ Saved employee ${record.rowIndex}: ${record.employeeName}`);
  
        } catch (error) {
          console.log(`✗ Error saving employee ${record.rowIndex}:`, error.message);
          
          failedRecords.push({
            row: record.rowIndex,
            name: record.employeeName,
            reason: error.message
          });
        }
      }
  
      console.log(`✅ Upload complete: ${processedCount}/${employees.length} successful`);
  
      return res.json({
        success: true,
        message: `Processed ${processedCount} employees successfully`,
        summary: {
          total: employees.length,
          successful: successfulRecords.length,
          failed: 0,
          duplicates: 0
        },
        successfulRecords: successfulRecords
      });
  
    } catch (error) {
      console.error('❌ Bulk upload error:', error);
      console.error('Error stack:', error.stack);
      
      return res.status(500).json({ 
        success: false,
        error: 'Failed to process file',
        details: error.message 
      });
    }
});
router.post('/filter-and-count',middleware,upload.single('file'),filterAndCount)

module.exports = router;