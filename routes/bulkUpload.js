const express = require('express');
const router = express.Router();
const multer = require('multer');
const XLSX = require('xlsx');
const RetentionData = require('../retentiondata'); 
const {middleware} = require('../util/middleware'); 


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/bulk-upload', middleware, upload.single('employeeFile'), async (req, res) => {
    try {
        if (!req.file) {
          console.log('❌ No file uploaded');
          return res.status(400).json({ 
            success: false,
            error: 'No file uploaded' 
          });
        }
    
        console.log('File details:', {
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size
        });
    
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
    
        console.log(`📊 Parsed ${data.length} rows from file`);
    
        if (data.length === 0) {
          return res.status(400).json({ 
            success: false,
            error: 'No data found in file' 
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

        const firstRow = data[0];
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
        
      
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        
      
        const recordsToProcess = [];
        
        for (let i = 0; i < data.length; i++) {
          const row = data[i];
          
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
            
            
            let splitName = employeeName.includes(',') ? 
              employeeName.split(',') : 
              employeeName.split(' ');
    
            let lastName = splitName[0]?.trim() || '';
            let firstName = splitName[1]?.trim() || '';
    
          
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
              cityStateZip
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
    
    
        if (duplicateRecords.length > 0 || failedRecords.length > 0) {
          console.log(`❌ Validation failed: ${duplicateRecords.length} duplicates, ${failedRecords.length} errors`);
          
          return res.status(400).json({
            success: false,
            error: duplicateRecords.length > 0 
              ? `Found ${duplicateRecords.length} duplicate employee(s) uploaded within the last month`
              : `Found ${failedRecords.length} invalid record(s)`,
            summary: {
              total: data.length,
              successful: 0,
              failed: failedRecords.length,
              duplicates: duplicateRecords.length
            },
            duplicates: duplicateRecords.length > 0 ? duplicateRecords : undefined,
            failedRecords: failedRecords.length > 0 ? failedRecords : undefined
          });
        }
    
     
        let processedCount = 0;
        
        for (const record of recordsToProcess) {
          try {
            const employeeData = {
              name: record.employeeName,
              email: record.email || `no-email-${Date.now()}-${record.rowIndex}@example.com`,
              phone: record.phone,
              job_class: record.jobClass,
              address: record.addressLine,
              city_state_zip: record.cityStateZip,
              employement_status: 'Active',
              categoryScores: {
                'schedule & workload': 0,
                'money & compensation': 0,
                'job satisfaction': 0,
                'family & work-life balance': 0,
                'communication & leadership': 0,
                'lack of rest': 0
              },
              overallScore: 0,
              riskLevel: 'Low',
              possibleImprovedScore: 0
            };
    
            const savedEmployee = await RetentionData.create(employeeData);
            successfulRecords.push({
              name: record.employeeName,
              email: record.email,
              id: savedEmployee._id
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
    
        console.log(`✅ Upload complete: ${processedCount}/${data.length} successful`);
    
        return res.json({
          success: true,
          message: `Processed ${processedCount} employees successfully`,
          summary: {
            total: data.length,
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

module.exports = router;