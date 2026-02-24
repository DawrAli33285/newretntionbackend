const axios = require('axios');
const keywordData = require('./risk_keywords.json');
const XLSX = require('xlsx');
const path = require('path');
const {cloudinaryUpload}=require('./util/cloudinary')
const fs = require('fs');
const API_KEY = '49174427b558d2af53e538f950d775f5';
const BASE_URL = 'https://api.social-searcher.com/v2/search';

const peopledatalabs = require('@api/peopledatalabs');
const RetentionData = require('./retentiondata');
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
    'Work Life Balance': emp.categoryScores['family & work-life balance'] || 0,
    'Communication': emp.categoryScores['communication & leadership'] || 0,
    'Financial': emp.categoryScores['money & compensation'] || 0,
    'Schedule': emp.categoryScores['schedule & workload'] || 0,
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
  try {
    
    const allPosts = [];
    
    // LinkedIn posts
    if (socialMedia.linkedin_url) {
      try {
       
        const linkedinOptions = {
          method: 'GET',
          url: `https://linkedin-api8.p.rapidapi.com/get-profile-posts?username=${socialMedia.linkedin_username}`,
          headers: {
            'x-rapidapi-key': '423577dcd1msh3e31e9d469ec9a7p154656jsneec34d2c7ecd',
            'x-rapidapi-host': 'linkedin-api8.p.rapidapi.com'
          }
        };

        const linkedinResponse = await axios.request(linkedinOptions);
        console.log('LinkedIn response:', linkedinResponse.data);
        
        const linkedinPosts = linkedinResponse.data.data
          ?.filter(post => post?.text || post?.resharedPost?.text)
          .map(post => ({
            text: post.text || post.resharedPost.text,
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
            'x-rapidapi-key': '074cf77d1amsh7dcb0779569cf53p13dfc9jsn48c665c8ed27',
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
            'x-rapidapi-key': '074cf77d1amsh7dcb0779569cf53p13dfc9jsn48c665c8ed27',
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


function generateUniquePasscode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}


async function processEmployees(employees, user, inputFileName,recordCount) {
  const results = [];

  for (const emp of employees) {
    try {
     
      let totalCategoryScore = 0;
      let validCategories = 0;
  
        let employeeName = emp['Employee Name (Last Suffix, First MI)'] ? 
        emp['Employee Name (Last Suffix, First MI)'] : 
        emp['Employee Name (Last Suffix,First MI)'];

        if(!employeeName){
          console.log("Employee does not have a name")
          continue;
        }

      let splitName = employeeName?.includes(',') ? 
        employeeName.split(',') : 
        employeeName.split(' ');
 
      let firstName = splitName[0].trim();
      let lastName = splitName[1].trim();
      let email = emp['E-mail Address'] ? emp['E-mail Address'] : emp['Alternate Email'];
      let phone = emp['Home Phone (Formatted)'];
      const refinedPhone = "+" + phone.replace(/\D/g, "");
      let companyName = emp['Company Name'] ? emp['Company Name'] : emp['Company '];
      let birth_date = emp['Date of Birth'];
      let financeScore = parseFloat(emp['Finance Score (1-10)']) || 0;
      let scheduleScore = parseFloat(emp['Schedule Score (1-10)']) || 0;
      let wlbScore = parseFloat(emp['Work Life Balance Score (1-10)']) || 0;
      let familyScore = parseFloat(emp['Family Score (1-10)']) || 0;

      const options = {
        method: 'GET',
        url: `https://api.peopledatalabs.com/v5/person/identify?name=${employeeName}&first_name=${firstName}&phone=${phone}&last_name=${lastName}&email=${email}&company=${companyName}&birth_date=${birth_date}&pretty=false&titlecase=false&include_if_matched=false`,
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
          'X-API-Key': '96daa17b289fb6f8c7bce95a15303c8d29b3e8cf4415e8247a8753008de5331b'
        }
      };
      
      const data = await axios.request(options);

      let twitterUsername = null;
      let linkedinUsername = null;
      let facebookUsername = null;

      console.log("PDL DATA")
      console.log(data?.data?.matches[0]?.data)

      if (data?.data?.matches[0]?.data?.linkedin_username) {
        linkedinUsername = data?.data?.matches[0]?.data?.linkedin_username;
      }
      if (data?.data?.matches[0]?.data?.twitter_username) {
        twitterUsername = data?.data?.matches[0]?.data?.twitter_username;
      }
      if (data?.data?.matches[0]?.data?.facebook_username) {
        facebookUsername = data?.data?.matches[0]?.data?.facebook_username;
      }

      if (!birth_date) {
        console.log(`Skipping ${employeeName} - missing Date of Birth`);
        continue;
      }
      if (!financeScore && !scheduleScore && !wlbScore && !familyScore) {
        console.log(`Skipping ${employeeName} - missing all social scores`);
        continue;
      }
      
      if (!data?.data?.matches[0]?.data?.profiles) {
        continue;
      }


         const socialMedia = {
        linkedin_url: data?.data?.matches[0]?.data?.linkedin_url || null,
        linkedin_username: linkedinUsername || null,
        twitter_url: data?.data?.matches[0]?.data?.twitter_url || null,
        twitter_username: twitterUsername || null,
        facebook_url: data?.data?.matches[0]?.data?.facebook_url || null,
        facebook_username: facebookUsername || null
      };


      const allPosts = await fetchAllSocialMediaPosts(socialMedia);
 
      const categoryScores = {};
      let categoriesCount = 0;
    
      
      for (const [category, keywordMap] of Object.entries(keywordData)) {
        let categoryScore = 0;
    
      
        for (const [phrase, weight] of Object.entries(keywordMap)) {
           
            let totalCount = 0;
            for (const post of allPosts) {
                const cleanedText = cleanText(post.text);
                const matches = (cleanedText.match(new RegExp(phrase, 'g')) || []).length;
                totalCount += matches;
            }
            
            
            categoryScore += totalCount * weight;
        }
    
        categoryScores[category] = categoryScore;
        totalCategoryScore += categoryScore;
        validCategories++;
    }
    
 
    const overallScore = validCategories > 0 
        ? parseFloat(((totalCategoryScore / (validCategories * 100)) * 100).toFixed(2))
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
let employeeData = {
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
  categoryScores: categoryScores || {},
  overallScore: overallScore || 0,
  phone: phone || 'N/A',
  financeScore: financeScore,
  scheduleScore: scheduleScore,
  wlbScore: wlbScore,
  familyScore: familyScore
};


if (startDateKey) {
  employeeData[startDateKey] = startDateValue;
}


results.push(employeeData);

  await RetentionData.create(employeeData);


    } catch (e) {
      console.log(`Error processing employee: ${e.message}`);
      const defaultResult = createDefaultResult(emp);
      results.push(defaultResult);
      try {
        await RetentionData.create(defaultResult);
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
    phone: emp['Home Phone (Formatted)'] || 'N/A',
    
    // Engagement scores (flat structure)
    'schedule & workload': 0,
    'money & compensation': 0,
    'job satisfaction': 0,
    'family & work-life balance': 0,
    'communication & leadership': 0,
    'lack of rest': 0,
    
    // Scores and risk assessment
    totalScore: 0,
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
module.exports = { processEmployees };