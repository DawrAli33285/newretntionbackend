const axios = require('axios');
const keywordData = require('./risk_keywords.json');
const XLSX = require('xlsx');
const path = require('path');
const {cloudinaryUpload}=require('./util/cloudinary')
const fs = require('fs');
const API_KEY = '49174427b558d2af53e538f950d775f5';
const BASE_URL = 'https://api.social-searcher.com/v2/search';
const { saveToAirtable } = require('./airtable');
const peopledatalabs = require('@api/peopledatalabs');
const RetentionData = require('./retentiondata');
const PreHireRetentionData = require('./prehireretentiondata');

const filemodel = require('./filemodel');

peopledatalabs.auth('30d80327aac2828dd4df86eaf9ec379dd5bae8d495490b2c41f4f313ca34adea');

function decayWeight(n) {
  const base = [1.0, 0.5, 0.25];
  const additional = Math.max(n - 3, 0);
  return base
    .concat(Array(additional).fill(0.10))
    .slice(0, n)
    .reduce((a, b) => a + b, 0);
}

function determineRiskLevel(overallScore) {
  // Lower scores = Higher risk (more negative keywords found)
  if (overallScore <= 3) return 'High';
  if (overallScore <= 6) return 'Medium';
  return 'Low';
}

function calculatePossibleImprovement(categoryScores) {
  const scores = Object.values(categoryScores);
  if (scores.length === 0) return 0;
  
  // Find the highest risk category (highest score = most issues)
  const maxScore = Math.max(...scores);
  // Calculate average of other categories
  const otherScores = scores.filter(s => s !== maxScore);
  const avgOthers = otherScores.length > 0 
    ? otherScores.reduce((a, b) => a + b, 0) / otherScores.length 
    : 0;
  
  // Possible improvement if the highest risk category is reduced to average
  return (avgOthers * scores.length / 100 * 10).toFixed(2);
}

function determineCategoryOfConcern(categoryScores) {
  const entries = Object.entries(categoryScores);
  if (entries.length === 0) return 'N/A';
  
  // Find category with highest score (most problematic)
  const highest = entries.reduce((max, curr) => curr[1] > max[1] ? curr : max);
  return highest[0];
}


async function generateOutputFile(results, outputFileName) {
  const outputData = results.map((emp, index) => ({
    'Employee Number': index + 1,
    'Employee Name': emp.name,
   'Work Life Balance': emp.categoryScores['work life'] || 0,
'Communication': emp.categoryScores['family'] || 0,
'Financial': emp.categoryScores['finances'] || 0,
'Schedule': emp.categoryScores['schedule'] || 0,
    'Final Score': emp.overallScore || 0,
    'Improvement Area': '',
    'Risk Level': determineRiskLevel(emp.overallScore),
    'Possible Improvement': calculatePossibleImprovement(emp.categoryScores),
    'Category of Concern': determineCategoryOfConcern(emp.categoryScores)
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(outputData);
  XLSX.utils.book_append_sheet(wb, ws, 'Employee Risk Analysis');
  
  // Use the full path that's passed in
  const dir = path.dirname(outputFileName);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  XLSX.writeFile(wb, outputFileName);
  let cloudfile=await cloudinaryUpload(outputFileName)

  return cloudfile.url
}


// Optimized function to fetch all posts once per employee
async function fetchAllSocialMediaPosts(socialMedia) {
  console.log(`\n  [SCRAPER] Starting social media fetch...`);
  console.log(`  [SCRAPER] LinkedIn URL: ${socialMedia.linkedin_url || 'NONE'}`);
  console.log(`  [SCRAPER] Twitter username: ${socialMedia.twitter_username || 'NONE'}`);
  console.log(`  [SCRAPER] Facebook username: ${socialMedia.facebook_username || 'NONE'}`);

  try {
    const allPosts = [];

    // LinkedIn posts
    if (socialMedia.linkedin_url) {
      console.log(`  [SCRAPER] 🔵 Fetching LinkedIn posts for: ${socialMedia.linkedin_url}`);
      try {
        const linkedinOptions = {
          method: 'GET',
          url: `https://fresh-linkedin-profile-data.p.rapidapi.com/get-profile-posts`,
          params: {
            linkedin_url: socialMedia.linkedin_url,
            type: 'posts'
          },
          headers: {
            'Content-Type': 'application/json',
            'x-rapidapi-key': '0b3e816b4bmsh5fb872b56e6e57cp1bfa08jsn3b9970e67894',
            'x-rapidapi-host': 'fresh-linkedin-profile-data.p.rapidapi.com'
          }
        };
    
        const linkedinResponse = await axios.request(linkedinOptions);
       
    
        const linkedinPosts = linkedinResponse.data.data
          ?.filter(post => post?.text || post?.resharedPost?.text)
          .map(post => ({
            text: post.text || post.resharedPost?.text,
            network: 'linkedin'
          })) || [];
    
   
        allPosts.push(...linkedinPosts);
      } catch (error) {
        console.error('LinkedIn API Error:', error.message);
      }
    }


    // Twitter posts
    if (socialMedia.twitter_username) {
      try {
        const twitterOptions = {
          method: 'GET',
          url: 'https://twitter241.p.rapidapi.com/user',
          params: { username: socialMedia.twitter_username },
          headers: {
            'x-rapidapi-key': '21be0fdbd5mshf654a48f4e51715p1e08cajsnc4a7345c330b',
            'x-rapidapi-host': 'twitter241.p.rapidapi.com'
          }
        };

        const twitterResponse = await axios.request(twitterOptions);
        const userId = twitterResponse.data.result.data.user.result.rest_id;

        const twitterPostOptions = {
          method: 'GET',
          url: 'https://twitter241.p.rapidapi.com/user-tweets',
          params: { user: userId, count: '20' },
          headers: {
            'x-rapidapi-key': '074cf77d1amsh7dcb0779569cf53p13dfc9jsn48c665c8ed27',
            'x-rapidapi-host': 'twitter241.p.rapidapi.com'
          }
        };

        const twitterPostResponse = await axios.request(twitterPostOptions);
        const twitterPosts = twitterPostResponse.data.result.timeline.instructions
          .find(i => i.type === "TimelineAddEntries")?.entries
          ?.filter(entry => entry.entryId?.startsWith("tweet-"))
          .map(entry => ({
            text: entry.content.itemContent.tweet_results.result.legacy.full_text,
            network: 'twitter'
          })) || [];
          
          console.log("twitterposts")
          console.log(twitterPosts)
          console.log(`  [SCRAPER] ✅ Twitter posts fetched: ${twitterPosts.length}`);
        allPosts.push(...twitterPosts);
      } catch (error) {
        console.error('Twitter API Error:', error.message);
      }
    }

    // Facebook posts
    if (socialMedia.facebook_username) {
      try {
        const facebookOptions = {
          method: 'GET',
          url: 'https://facebook-scraper3.p.rapidapi.com/profile/details_url',
          params: { url: socialMedia.facebook_url || `https://facebook.com/${socialMedia.facebook_username}` },
          headers: {
            'x-rapidapi-key': '0b3e816b4bmsh5fb872b56e6e57cp1bfa08jsn3b9970e67894',
            'x-rapidapi-host': 'facebook-scraper3.p.rapidapi.com'
          }
        };

        const facebookResponse = await axios.request(facebookOptions);
      
        const profileId = facebookResponse.data.profile.profile_id;

        const facebookPostOptions = {
          method: 'GET',
          url: 'https://facebook-scraper3.p.rapidapi.com/profile/posts',
          params: { profile_id: profileId },
          headers: {
            'x-rapidapi-key': '074cf77d1amsh7dcb0779569cf53p13dfc9jsn48c665c8ed27',
            'x-rapidapi-host': 'facebook-scraper3.p.rapidapi.com'
          }
        };

        const facebookPostResponse = await axios.request(facebookPostOptions);
        console.log("FACEBOOK POSTS:", facebookPostResponse.data.results);
        
        const facebookPosts = facebookPostResponse.data.results
          ?.filter(post => post.message)  
          .map(post => ({
            text: post.message,
            network: 'facebook'
          })) || [];

          console.log(`  [SCRAPER] ✅ Facebook posts fetched: ${facebookPosts.length}`);
        
        allPosts.push(...facebookPosts);
      } catch (error) {
        console.error('Facebook API Error:', error.message);
      }
    }

    return allPosts;
  } catch (error) {
    console.error('Overall API Error:', error.message);
    return [];
  }
}


function calculateAgePoints(dateOfBirth) {
  if (!dateOfBirth) return 0;
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  if (isNaN(age)) return 0;

  if (age >= 20 && age <= 24) return 10;
  if (age >= 25 && age <= 34) return 7;
  if (age >= 35 && age <= 44) return 5;
  if (age >= 45 && age <= 54) return 3;
  if (age >= 55 && age <= 64) return 1;
  return 0; // 65+
}

function calculateTenurePoints(hireDate) {
  if (!hireDate) return 0;
  const hire = new Date(hireDate);
  const today = new Date();
  const months = (today.getFullYear() - hire.getFullYear()) * 12 + (today.getMonth() - hire.getMonth());

  if (months <= 3)  return 15;
  if (months <= 6)  return 10;
  if (months <= 12) return 7;
  if (months <= 24) return 5;
  if (months <= 36) return 3;
  if (months <= 60) return -1;
  return -1; // 5+ years
}

function calculateFinancePoints(score) {
  if (score <= 2) return 3;
  if (score <= 4) return 2;
  if (score <= 5) return 1;
  if (score <= 6) return 0;
  if (score <= 7) return -1;
  if (score <= 8) return -3;
  return -7; // 9-10
}

function calculateSchedulePoints(score) {
  if (score <= 1) return 7;
  if (score <= 3) return 2;
  if (score <= 5) return 0;
  if (score <= 6) return -1;
  if (score <= 8) return -3;  // ← was -5
  return -5;                   // 9-10
}


function calculateWLBPoints(score) {
  if (score <= 1) return 7;
  if (score <= 3) return 3;
  if (score <= 5) return 1;
  if (score <= 6) return 0;
  if (score <= 8) return -3;
  return -5; // 9-10
}

function calculateFamilyPoints(score) {
  if (score <= 2) return 5;
  if (score <= 4) return 3;
  if (score <= 6) return 0;
  if (score <= 7) return -1;
  if (score <= 8) return -3;
  return -5; // 9-10
}

function calculateTurnoverPoints(termDate) {
  // If employee has a term date, higher turnover risk
  if (termDate && termDate !== 'N/A' && termDate !== '') return 9;
  return 6;
}

function calculateRightFit(retentionScore) {
  return retentionScore >= 20;
}



function generateUniquePasscode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}



function calculateDistancePoints(miles) {
  if (!miles || miles === 0) return 7;
  if (miles <= 5)   return 15;
  if (miles <= 10)  return 10;
  if (miles <= 20)  return 7;
  if (miles <= 30)  return 5;
  if (miles <= 50)  return 3;
  if (miles <= 100) return -5;
  return -10;
}


async function processEmployees(employees, user, inputFileName, recordCount) {
  console.log('\n' + '='.repeat(60));
  console.log(`[PROCESS START] Total employees to process: ${employees.length}`);
  console.log(`[PROCESS START] Input file: ${inputFileName}`);
  console.log(`[PROCESS START] Record count: ${recordCount}`);
  console.log('='.repeat(60));

  const results = [];

  for (const [empIndex, emp] of employees.entries()) {
    console.log('\n' + '-'.repeat(50));
    console.log(`[EMP ${empIndex + 1}/${employees.length}] Starting processing...`);

    try {
      let totalCategoryScore = 0;
      let validCategories = 0;

      let employeeName = emp['Employee Name (Last Suffix, First MI)'] ?
        emp['Employee Name (Last Suffix, First MI)'] :
        emp['Employee Name (Last Suffix,First MI)'];

      if (!employeeName) {
        console.log(`[EMP ${empIndex + 1}] ❌ SKIP - No employee name found`);
        console.log(`[EMP ${empIndex + 1}] Raw row keys:`, Object.keys(emp));
        continue;
      }

      console.log(`[EMP ${empIndex + 1}] 👤 Name: ${employeeName}`);

      let splitName = employeeName?.includes(',') ?
      employeeName.split(',') :
      employeeName.split(' ');
    
    // "Abernathy, Rita K." → splitName[0]=Last, splitName[1]=First
    let lastName, firstName;
    if (employeeName.includes(',')) {
      lastName = splitName[0].trim();
      firstName = splitName[1]?.trim() || '';
    } else {
      firstName = splitName[0].trim();
      lastName = splitName[1]?.trim() || '';
    }

      let email = emp['E-mail Address'] ? emp['E-mail Address'] : emp['Alternate Email'];
      let phone = emp['Home Phone (Formatted)'] || emp['Phone'] || emp['Mobile'] || '';
      let companyName = emp['Company Name'] || emp['Company'] || emp['Organization'] || emp['Entity'] || '';

      let birth_date = emp['Date of Birth'];
      let financeScore = parseFloat(emp['Finance Score (1-10)']) || 0;
      let scheduleScore = parseFloat(emp['Schedule Score (1-10)']) || 0;
      let wlbScore = parseFloat(emp['Work Life Balance Score (1-10)']) || 0;
      let familyScore = parseFloat(emp['Family Score (1-10)']) || 0;


      await saveFileDataToAirtable(emp);

      // ─── Duplicate check via MongoDB ───────────────────────────────
      // if (email) {
      //   const existingRecord = await RetentionData.findOne({ email: email });
      //   if (existingRecord) {
      //     console.log(`[EMP ${empIndex + 1}] ⚠️  DUPLICATE - Email already exists in DB: ${email}`);
      //     await saveIncompleteRecordToAirtable(emp, {
      //       status: null,
      //       message: `Duplicate record — email already exists: ${email}`
      //     }, inputFileName);
      //     continue;
      //   }
      // }
     

      console.log(`[EMP ${empIndex + 1}] 📋 Data extracted:`);


      console.log(`[EMP ${empIndex + 1}] 📋 Data extracted:`);
      console.log(`  - firstName: "${firstName}", lastName: "${lastName}"`);
      console.log(`  - email: "${email}"`);
      console.log(`  - phone: "${phone}"`);
      console.log(`  - birth_date: "${birth_date}"`);
      console.log(`  - company: "${companyName}"`);
      console.log(`  - scores → finance:${financeScore} schedule:${scheduleScore} wlb:${wlbScore} family:${familyScore}`);

      if (!birth_date && !emp.isPreHire) {
        console.log(`[EMP ${empIndex + 1}] ❌ SKIP - Missing Date of Birth`);
        continue;
      }
      if (!emp.isPreHire && !financeScore && !scheduleScore && !wlbScore && !familyScore) {
        console.log(`[EMP ${empIndex + 1}] ❌ SKIP - All social scores are 0/missing`);
        continue;
      }

      // PDL API call
      console.log(`[EMP ${empIndex + 1}] 🔍 Calling PDL API...`);
      const pdlUrl = `https://api.peopledatalabs.com/v5/person/identify?name=${encodeURIComponent(employeeName)}&first_name=${encodeURIComponent(firstName)}&phone=${encodeURIComponent(phone || '')}&last_name=${encodeURIComponent(lastName)}&email=${encodeURIComponent(email || '')}&company=${encodeURIComponent(companyName || '')}${birth_date ? `&birth_date=${encodeURIComponent(birth_date)}` : ''}&pretty=false&titlecase=false&include_if_matched=false`;
      
      console.log(`[EMP ${empIndex + 1}] PDL URL: ${pdlUrl}`);

      const refinedPhone = phone ? "+" + phone.replace(/\D/g, "") : '';

      const options = {
        method: 'GET',
        url: pdlUrl,
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
          'X-API-Key': '96daa17b289fb6f8c7bce95a15303c8d29b3e8cf4415e8247a8753008de5331b'
        }
      };

      console.log(`[EMP ${empIndex + 1}] 🔍 Calling PDL API...`);

      let data;
      try {
        data = await axios.request(options);
        console.log("pdl DATA")
        console.log(JSON.stringify(data.data))  // only the response body, not the full Axios object
        console.log(`[EMP ${empIndex + 1}] ✅ PDL Response status: ${data.status}`);
      } catch (pdlError) {
        const status = pdlError.response?.status;
        const message = pdlError.response?.data?.error?.message || pdlError.message;
      
        console.log(`[EMP ${empIndex + 1}] ❌ PDL API error — status: ${status}, message: ${message}`);
      
        // Save to Airtable Incomplete Records
        await saveIncompleteRecordToAirtable(emp, {
          status: status,
          message: message
        }, inputFileName, emp.isPreHire);
      
        if (status === 402 || status === 429) {
          console.log(`[EMP ${empIndex + 1}] 🚫 PDL quota/rate limit hit. Aborting further processing.`);
          break;
        }
        const defaultResult = createDefaultResult(emp);
        results.push(defaultResult);
        try {
          if (emp.isPreHire) {
            await PreHireRetentionData.create(defaultResult);
          } else {
            await RetentionData.create(defaultResult);
          }
        } catch (dbError) {
          if (dbError.code === 11000) {
            console.log(`Duplicate email skipped: ${dbError.message}`);
          } else {
            console.log(`Error saving default result: ${dbError.message}`);
          }

        }
        continue;


      }

      console.log(`[EMP ${empIndex + 1}] ✅ PDL Response status: ${data.status}`);
      console.log(`[EMP ${empIndex + 1}] PDL matches count: ${data?.data?.matches?.length || 0}`);

      const matchData = data?.data?.matches[0]?.data;
      if (matchData) {
        console.log(`[EMP ${empIndex + 1}] PDL match found:`);
        console.log(`  - linkedin_url: ${matchData.linkedin_url || 'NOT FOUND'}`);
        console.log(`  - linkedin_username: ${matchData.linkedin_username || 'NOT FOUND'}`);
        console.log(`  - twitter_url: ${matchData.twitter_url || 'NOT FOUND'}`);
        console.log(`  - twitter_username: ${matchData.twitter_username || 'NOT FOUND'}`);
        console.log(`  - facebook_url: ${matchData.facebook_url || 'NOT FOUND'}`);
        console.log(`  - facebook_username: ${matchData.facebook_username || 'NOT FOUND'}`);
        console.log(`  - profiles: ${matchData.profiles ? JSON.stringify(matchData.profiles) : 'NONE'}`);
      } else {
        console.log(`[EMP ${empIndex + 1}] ⚠️  PDL - No match data found`);
      }

      let twitterUsername = null;
      let linkedinUsername = null;
      let facebookUsername = null;

      if (matchData?.linkedin_username) linkedinUsername = matchData.linkedin_username;
      if (matchData?.twitter_username) twitterUsername = matchData.twitter_username;
      if (matchData?.facebook_username) facebookUsername = matchData.facebook_username;

      if (!matchData?.profiles) {
        console.log(`[EMP ${empIndex + 1}] ❌ SKIP - PDL found no social profiles`);
        
        
        await saveIncompleteRecordToAirtable(emp, {
          noSocialMedia: true,
          message: 'No social media profiles found'
        }, inputFileName, emp.isPreHire);
        
        continue;
      }

      
    

      const socialMedia = {
        linkedin_url: matchData?.linkedin_url || null,
        linkedin_username: matchData?.linkedin_username || null,
        twitter_url: matchData?.twitter_url || null,
        twitter_username: twitterUsername || null,
        facebook_url: matchData?.facebook_url || null,
        facebook_username: facebookUsername || null
      };

      console.log(`[EMP ${empIndex + 1}] 📡 Social media to scrape:`, JSON.stringify(socialMedia, null, 2));

      const allPosts = await fetchAllSocialMediaPosts(socialMedia);
      console.log(`[EMP ${empIndex + 1}] 📝 Total posts to analyze: ${allPosts.length}`);

      if (allPosts.length === 0) {
        console.log(`[EMP ${empIndex + 1}] ⚠️  WARNING - No posts found, scores will all be 0`);
      }
      const categoryScores = {};
      let categoriesCount = 0;
    
      
      for (const [category, keywordMap] of Object.entries(keywordData)) {
        let categoryScore = 0;
    
      
        let keywordsMatched = 0;
        let weightedSum = 0;
        
        for (const [phrase, weight] of Object.entries(keywordMap)) {
            let totalCount = 0;
            for (const post of allPosts) {
              // Only skip if it's a reshare FROM a company page, not the employee's own post
              const isCompanyReshare = post.reshared === true && 
                                       (post.text?.toLowerCase().includes('prognosticare') &&
                                        post.poster_linkedin_url?.includes('/company/'));
              if (isCompanyReshare) continue;
                const cleanedText = cleanText(post.text);
                const escapedPhrase = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const matches = (cleanedText.match(new RegExp(`\\b${escapedPhrase}\\b`, 'gi')) || []).length;

                totalCount += matches;
            }
            if (totalCount > 0) {
                weightedSum += totalCount * weight;
                keywordsMatched += totalCount;
            }
        }
        
        // Normalize to 0-10 scale
        const rawScore = keywordsMatched > 0 ? weightedSum / keywordsMatched : 0;
        const normalizedScore = Math.min(parseFloat(rawScore.toFixed(2)), 10);
        
        const keyMap = {
          'WorkLifeBalance': 'work life',
          'Communication':   'family',
          'Financial':       'finances',
          'Schedule':        'schedule'
        };
        
        const frontendKey = keyMap[category] || category.toLowerCase();
        categoryScores[frontendKey] = normalizedScore;
        totalCategoryScore += normalizedScore;
        validCategories++;

    }
    
 
    const nonZeroScores = Object.values(categoryScores).filter(s => s > 0);

    const overallScore = nonZeroScores.length > 0
        ? parseFloat((nonZeroScores.reduce((a, b) => a + b, 0) / nonZeroScores.length).toFixed(2))
        : 0;


console.log("data")
console.log(categoryScores)
console.log(overallScore)
let startDateKey = '';
let startDateValue = '';

if (emp['Original Hire']) {
    startDateKey = 'original_hire';
    startDateValue = emp['Original Hire'];
} else if (emp['Seniority Date']) {
    startDateKey = 'seniority_date';
    startDateValue = emp['Seniority Date'];
}


const hireDate = emp['Hire Date'] || emp['Last Hire Date'] || '';
const termDate = emp['Term Date'] || emp['Termination Date'] || '';

const agePoints      = calculateAgePoints(birth_date);
const tenurePoints   = calculateTenurePoints(hireDate);
const turnoverPoints = calculateTurnoverPoints(termDate);


const distanceMiles = parseFloat(emp['Distance (Miles)']) || 0;
const distancePoints = calculateDistancePoints(distanceMiles);
const financePoints  = calculateFinancePoints(financeScore);
const schedulePoints = calculateSchedulePoints(scheduleScore);
const wlbPoints      = calculateWLBPoints(wlbScore);
const familyPoints   = calculateFamilyPoints(familyScore);

const retentionScore = agePoints + distancePoints + tenurePoints + turnoverPoints + financePoints + schedulePoints + wlbPoints + familyPoints;
const rightFitCandidate = calculateRightFit(retentionScore);

let employeeData = {
  name: emp['Employee Name (Last Suffix, First MI)'] || 'N/A',
  email: emp['E-mail Address'] || 'N/A',
  last_hire_date: emp['Last Hire Date'] || emp['Hire Date'] || 'N/A',
  job_start: emp['Job Start'] || 'N/A',
  termination_date: termDate || 'N/A',
  retentionScore,        
  rightFitCandidate,     
  termination_reason: emp['Termination Reason'] || 'N/A',
  employement_status: emp['Employment Status'] || 'N/A',
  date_of_birth: birth_date && birth_date !== 'N/A' ? birth_date : null,
  job_title: matchData?.job_title || emp['Job Title'] || emp['Job Class'] || 'N/A',
  department: emp['Department'] || 'N/A',
  facility: (emp['Facility'] || emp['Entity'] || emp['Subsidiary'] || 'N/A'),
  organization: emp['Organization'] || 'N/A',
  division: emp['Division'] || 'N/A',
  hireDate: hireDate && hireDate !== 'N/A' ? hireDate : null,
  termDate: termDate && termDate !== 'N/A' ? termDate : null,
  salaryRange: emp['Salary Range'] || 'N/A',
  categoryScores: categoryScores || {},
  overallScore: overallScore || 0,
  phone: phone || 'N/A',
  financeScore, scheduleScore, wlbScore, familyScore,
  // Points breakdown
  agePoints, distancePoints, tenurePoints, turnoverPoints,
  financePoints, schedulePoints, wlbPoints, familyPoints,
  // Computed
  retentionScore,
  rightFitCandidate,
  socialData: {
    linkedin_url:      matchData?.linkedin_url      || null,
    linkedin_username: matchData?.linkedin_username || null,
    twitter_url:       matchData?.twitter_url       || null,
    twitter_username:  matchData?.twitter_username  || null,
    facebook_url:      matchData?.facebook_url      || null,
    facebook_username: matchData?.facebook_username || null,
  },
};



if (startDateKey) {
  employeeData[startDateKey] = startDateValue;
}


results.push(employeeData);

if (emp.isPreHire) {
  await PreHireRetentionData.findOneAndUpdate(
    { email: employeeData.email },
    employeeData,
    { upsert: true, new: true }
  );
} else {
  await RetentionData.findOneAndUpdate(
    { email: employeeData.email },
    employeeData,
    { upsert: true, new: true }
  );
}

// Save enriched social media to Airtable
if (emp.isPreHire) {
  await saveEnrichedSocialMediaToAirtable(
    employeeData.email,
    employeeData.socialData,
    data?.data?.matches[0]?.match_score || 0,
    true  // isPreHire flag
  );
} else {
  await saveEnrichedSocialMediaToAirtable(
    employeeData.email,
    employeeData.socialData,
    data?.data?.matches[0]?.match_score || 0
  );
}




    } catch (e) {
      console.log(`Error processing employee: ${e.message}`);
      const defaultResult = createDefaultResult(emp);
      results.push(defaultResult);
      try {
        if (emp.isPreHire) {
          await PreHireRetentionData.create(defaultResult);
        } else {
          await RetentionData.create(defaultResult);
        }
      } catch (dbError) {
        console.log(`Error saving default result to database: ${dbError.message}`);
      }
    }
  }

  console.log("RESULTS AFTER FAILING")
  console.log(results)
  const passcode = generateUniquePasscode();
  
  const outputFileName = `/tmp/public/files/output_${Date.now()}.xlsx`;
  const outputPath = await generateOutputFile(results, outputFileName);

  const fileEntry = await filemodel.create({
    file: inputFileName,
    user: user._id || user,
    paid: true,
    passcode: passcode,
    output:outputPath,
    recordCount
  });

  
  return {results,passcode};
}

function createDefaultResult(emp) {
  return {
    name: emp['Employee Name (Last Suffix, First MI)'] || 'N/A',
    email: emp['E-mail Address'] || 'N/A',
    last_hire_date: emp['Last Hire Date'] || 'N/A',
    job_start: emp['Job Start'] || 'N/A',
    termination_date: emp['Termination Date'] || 'N/A',
    termination_reason: emp['Termination Reason'] || 'N/A',
    employement_status: emp['Employment Status'] || 'N/A',
    date_of_birth: emp['Date of Birth'] || 'N/A',
    job_title: emp['Job Title'] || 'N/A',
    department: emp['Department'] || 'N/A',
    facility: (emp['Facility'] || emp['Entity'] || emp['Subsidiary'] || 'N/A'),
    phone: emp['Home Phone (Formatted)'] || emp['Phone'] || emp['Mobile'] || 'N/A',
    
    // Engagement scores (flat structure)
    'schedule & workload': 0,
    'money & compensation': 0,
    'job satisfaction': 0,
    'family & work-life balance': 0,
    'communication & leadership': 0,
    'lack of rest': 0,
    
    // Scores and risk assessment
    totalScore: 0,
    socialData: {
      linkedin_url:      null,
      linkedin_username: null,
      twitter_url:       null,
      twitter_username:  null,
      facebook_url:      null,
      facebook_username: null,
    },
    overallScore: 0,
    riskLevel: 'Low',
    possibleImprovedScore: 0,
    
    // Nested category scores
    categoryScores: {
      'schedule & workload': 0,
      'money & compensation': 0,
      'job satisfaction': 0,
      'family & work-life balance': 0,
      'communication & leadership': 0,
      'lack of rest': 0
    },
    
    // Additional fields that might be added conditionally
    ...(emp['Original Hire'] && { original_hire: emp['Original Hire'] }),
    ...(emp['Seniority Date'] && { seniority_date: emp['Seniority Date'] })
  };
}

function getLast90Days() {
  const today = new Date();
  const ninetyDaysAgo = new Date(today);
  ninetyDaysAgo.setDate(today.getDate() - 90); 
  return ninetyDaysAgo.toISOString().slice(0, 19).replace('T', ' '); 
}






function cleanText(text) {
  return text.toLowerCase().replace(/[^\w\s]/gi, '');
}



async function saveFileDataToAirtable(emp) {
  try {
    const Airtable = require('airtable');
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
    const table = base(process.env.AIRTABLE_FILE_DATA_TABLE_ID);
    
    // Convert MM/DD/YYYY to YYYY-MM-DD for Airtable
    function toDate(val) {
      if (!val || val === 'N/A' || val === '') return null;
      const parts = val.split('/');
      if (parts.length === 3) {
        return `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
      }
      return val;
    }

    const fields = {
      'Employee Name (Last Suffix, First MI)': emp['Employee Name (Last Suffix, First MI)'] || '',
      'Address Line 1 + Address Line 2': emp['Address Line 1 + Address Line 2'] || '',
      'City, State Zip Code (Formatted)': emp['City, State Zip Code (Formatted)'] || '',
      'E-mail Address': emp['E-mail Address'] || '',
      'Hire Date': toDate(emp['Hire Date']),
      'Term Date': toDate(emp['Term Date']),
      'Organization': emp['Organization'] || '',
      'Division': emp['Division'] || '',
      'Department': emp['Department'] || '',
      'Job Class': emp['Job Class'] || '',
      'Date of Birth': toDate(emp['Date of Birth']),
      'Finance Score (1-10)': parseFloat(emp['Finance Score (1-10)']) || 0,
      'Schedule Score (1-10)': parseFloat(emp['Schedule Score (1-10)']) || 0,
      'Work Life Balance Score (1-10)': parseFloat(emp['Work Life Balance Score (1-10)']) || 0,
      'Family Score (1-10)': parseFloat(emp['Family Score (1-10)']) || 0,
      'Distance (Miles)': parseFloat(emp['Distance (Miles)']) || 0,
    };

    const email = emp['E-mail Address'];
    const existing = await table.select({
      filterByFormula: `{E-mail Address} = "${email}"`
    }).firstPage();

    if (existing.length > 0) {
      await table.update(existing[0].id, fields);
      console.log(`✅ Airtable updated (file data): ${emp['Employee Name (Last Suffix, First MI)']}`);
    } else {
      await table.create(fields);
      console.log(`✅ Airtable created (file data): ${emp['Employee Name (Last Suffix, First MI)']}`);
    }
  } catch (error) {
    console.error(`❌ Airtable error for ${emp['Employee Name (Last Suffix, First MI)']}:`, error.message);
  }
}


async function savePreHireFileDataToAirtable(emp) {
  try {
    const Airtable = require('airtable');
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
    const table = base(process.env.AIRTABLE_PREHIRE_EMPLOYEE);

    const fields = {
      'Candidate (Last, Suffix First MI)': emp['Candidate (Last, Suffix First MI)'] || '',
      'Source Job':                         emp['Source Job'] || '',
      'Opportunity Title':                  emp['Opportunity Title'] || '',
      'Source Job Code':                    emp['Source Job Code'] || '',
      'Department Name':                    emp['Department Name'] || '',
      'Email Address':                      emp['Email Address'] || '',
      'Primary Phone':                      emp['Primary Phone'] || '',
      'Address 1':                          emp['Address 1'] || '',
      'City':                               emp['City'] || '',
      'State/Province Code':                emp['State/Province Code'] || '',
      'Zip/Postal Code':                    emp['Zip/Postal Code'] || '',
    };

    const email = emp['Email Address'];
    const existing = await table.select({
      filterByFormula: `{Email Address} = "${email}"`
    }).firstPage();

    if (existing.length > 0) {
      await table.update(existing[0].id, fields);
      console.log(`✅ Airtable updated (pre-hire): ${emp['Candidate (Last, Suffix First MI)']}`);
    } else {
      await table.create(fields);
      console.log(`✅ Airtable created (pre-hire): ${emp['Candidate (Last, Suffix First MI)']}`);
    }
  } catch (error) {
    console.error(`❌ Airtable error (pre-hire) for ${emp['Candidate (Last, Suffix First MI)']}:`, error.message);
  }
}


async function saveIncompleteRecordToAirtable(emp, pdlError, uploadId, isPreHire = false) {
  console.log(`\n[INCOMPLETE AIRTABLE] ========== START ==========`);
  console.log(`[INCOMPLETE AIRTABLE] isPreHire: ${isPreHire}`);
  console.log(`[INCOMPLETE AIRTABLE] uploadId: ${uploadId}`);
  console.log(`[INCOMPLETE AIRTABLE] emp keys: ${JSON.stringify(Object.keys(emp))}`);
  console.log(`[INCOMPLETE AIRTABLE] pdlError: ${JSON.stringify(pdlError)}`);

  try {
    const Airtable = require('airtable');
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
    
    const tableId = isPreHire 
      ? process.env.AIRTABLE_PREHIRE_ERROR
      : process.env.AIRTABLE_INCOMPLETE_TABLE_ID;

    console.log(`[INCOMPLETE AIRTABLE] tableId resolved: "${tableId}"`);
    console.log(`[INCOMPLETE AIRTABLE] AIRTABLE_PREHIRE_ERROR env: "${process.env.AIRTABLE_PREHIRE_ERROR}"`);
    console.log(`[INCOMPLETE AIRTABLE] AIRTABLE_INCOMPLETE_TABLE_ID env: "${process.env.AIRTABLE_INCOMPLETE_TABLE_ID}"`);
    console.log(`[INCOMPLETE AIRTABLE] AIRTABLE_BASE_ID env: "${process.env.AIRTABLE_BASE_ID}"`);

    if (!tableId) {
      console.error(`[INCOMPLETE AIRTABLE] ❌ tableId is undefined/empty — check your .env file`);
      return;
    }

    const table = base(tableId);

    function toDate(val) {
      if (!val || val === 'N/A' || val === '') return null;
      const parts = val.split('/');
      if (parts.length === 3) {
        return `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
      }
      return val;
    }

    let reason = 'No PDL match found';
    let pdlStatus = null;
    let errorMessage = '';

    if (pdlError) {
      pdlStatus = pdlError.status || null;
      errorMessage = pdlError.message || '';
      
      if (pdlStatus === 404) {
        reason = 'No PDL match found';
      } else if (pdlStatus === 402) {
        reason = 'PDL API error';
        errorMessage = 'Quota exceeded';
      } else if (pdlStatus === 429) {
        reason = 'PDL API error';
        errorMessage = 'Rate limit exceeded';
      } else if (pdlError.noSocialMedia) {
        reason = 'No social media profiles found';
      } else {
        reason = 'PDL API error';
      }
    }

    console.log(`[INCOMPLETE AIRTABLE] reason: "${reason}", pdlStatus: ${pdlStatus}`);

    const employeeName = emp['Employee Name (Last Suffix, First MI)'] || '';


    console.log(`[INCOMPLETE AIRTABLE] employeeName resolved: "${employeeName}"`);
    console.log(`[INCOMPLETE AIRTABLE] emp['Candidate (Last, Suffix First MI)']: "${emp['Candidate (Last, Suffix First MI)']}"`);
    console.log(`[INCOMPLETE AIRTABLE] emp['Employee Name (Last Suffix, First MI)']: "${emp['Employee Name (Last Suffix, First MI)']}"`);

    const nameParts = employeeName.includes(',') 
      ? employeeName.split(',').map(s => s.trim())
      : employeeName.split(' ').map(s => s.trim());
    
    const lastName  = employeeName.includes(',') ? nameParts[0] : (nameParts[1] || '');
    const firstName = employeeName.includes(',') ? (nameParts[1] || '') : nameParts[0];

    console.log(`[INCOMPLETE AIRTABLE] firstName: "${firstName}", lastName: "${lastName}"`);

    const email   = emp['E-mail Address'] || '';
    const phone   = emp['Home Phone (Formatted)'] || emp['Phone'] || '';
    const address = emp['Address Line 1 + Address Line 2'] || '';

    console.log(`[INCOMPLETE AIRTABLE] email: "${email}"`);
    console.log(`[INCOMPLETE AIRTABLE] phone: "${phone}"`);
    console.log(`[INCOMPLETE AIRTABLE] address: "${address}"`);
    

    const fields = {
      'client_id':           process.env.CLIENT_ID || 'default_client',
      'upload_id':           uploadId || Date.now().toString(),
      'record_id':           `REC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      'first_name':          firstName,
      'last_name':           lastName,
      'email':               email,
      'phone':               phone,
     'address':             address,
      'date_of_birth':       toDate(emp['Date of Birth']) || '',
      'reason':              reason,
      'pdl_response_status': pdlStatus,
      'pdl_error_message':   errorMessage,
      'date_flagged':        new Date().toISOString().split('T')[0],
      'review_status':       'Pending Review',
      'admin_notes':         ''
    };

    if (isPreHire) {
      delete fields['date_of_birth'];
      delete fields['admin_notes'];
    }
    console.log(`[INCOMPLETE AIRTABLE] fields to save: ${JSON.stringify(fields)}`);
    console.log(`[INCOMPLETE AIRTABLE] Calling table.create...`);

    await table.create(fields);
    console.log(`✅ [INCOMPLETE AIRTABLE] SUCCESS (${isPreHire ? 'PreHire' : 'Employee'}): ${employeeName} - Reason: ${reason}`);
  } catch (error) {
    const nameKey = isPreHire ? 'Candidate (Last, Suffix First MI)' : 'Employee Name (Last Suffix, First MI)';
    console.error(`❌ [INCOMPLETE AIRTABLE] CATCH ERROR for ${emp[nameKey]}: ${error.message}`);
    console.error(`❌ [INCOMPLETE AIRTABLE] Full error:`, error);
  }

  console.log(`[INCOMPLETE AIRTABLE] ========== END ==========\n`);
}


async function saveEnrichedSocialMediaToAirtable(email, socialData, matchConfidence, isPreHire = false) {
  try {
    const Airtable = require('airtable');
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
    const table = base(isPreHire ? process.env.AIRTABLE_PREHIRE_SOCIAL : process.env.AIRTABLE_ENRICHED_TABLE_ID);

    const fields = {
      'email': email || '',
      'linkedin_url': socialData.linkedin_url || '',
      'linkedin_username': socialData.linkedin_username || '',
      'facebook_url': socialData.facebook_url || '',
      'facebook_username': socialData.facebook_username || '',
      'twitter_url': socialData.twitter_url || '',
      'twitter_username': socialData.twitter_username || '',
      'instagram_url': socialData.instagram_url || '',
      'instagram_username': socialData.instagram_username || '',
      'enrichment_date': new Date().toISOString().split('T')[0],
      'pdl_match_confidence': matchConfidence || 0
    };

    // Check if email already exists
    const existing = await table.select({
      filterByFormula: `{email} = "${email}"`
    }).firstPage();

    if (existing.length > 0) {
      await table.update(existing[0].id, fields);
      console.log(`✅ Airtable (Enriched) updated: ${email}`);
    } else {
      await table.create(fields);
      console.log(`✅ Airtable (Enriched) created: ${email}`);
    }
  } catch (error) {
    console.error(`❌ Airtable error (Enriched) for ${email}:`, error.message);
  }
}


async function processPreHireCandidates(candidates, user, inputFileName, recordCount) {
  console.log("PREHIRE YES");

  // ─── Save original pre-hire data to Airtable BEFORE mapping ───────
  for (const emp of candidates) {
    await savePreHireFileDataToAirtable(emp);
  }

  const mappedCandidates = candidates.map(emp => ({
    'Employee Name (Last Suffix, First MI)': emp['Candidate (Last, Suffix First MI)'] || '',
    'E-mail Address':                        emp['Email Address']     || '',
    'Home Phone (Formatted)':                emp['Primary Phone']     || '',
    'Address Line 1 + Address Line 2':       `${emp['Address 1'] || ''} ${emp['City'] || ''} ${emp['State/Province Code'] || ''} ${emp['Zip/Postal Code'] || ''}`.trim(),
    'Organization':                          emp['Department Name']   || '',
    'Department':                            emp['Department Name']   || '',
    'Job Class':                             emp['Opportunity Title'] || emp['Source Job'] || '',
    'Job Code':                              emp['Source Job Code']   || '',
    'Date of Birth':                  '',
    'Hire Date':                      '',
    'Term Date':                      '',
    'Finance Score (1-10)':           1,
    'Schedule Score (1-10)':          1,
    'Work Life Balance Score (1-10)': 1,
    'Family Score (1-10)':            1,
    'Distance (Miles)':               0,
    'Division':                       '',
    'Salary Range':                   '',
    isPreHire: true,
  }));

  return processEmployees(mappedCandidates, user, inputFileName, recordCount);
}



module.exports = { processEmployees, processPreHireCandidates, fetchAllSocialMediaPosts, keywordData, cleanText };