const Airtable = require('airtable');

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

function determineRiskLevel(overallScore) {
  if (overallScore <= 3) return 'High';
  if (overallScore <= 6) return 'Medium';
  return 'Low';
}

// Converts MM/DD/YYYY → YYYY-MM-DD for Airtable Date fields
// Returns null for empty, 'N/A', or invalid values
function toDate(val) {
  if (!val || val === 'N/A' || val === '') return null;
  const parts = val.split('/');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
  }
  return val; // already in YYYY-MM-DD or other format
}

function buildFields(employeeData) {
  return {
    'Name':               employeeData.name               || '',
    'Email':              employeeData.email              || '',
    'Phone':              employeeData.phone              || '',
    'Job Title':          employeeData.job_title          || '',
    'Department':         employeeData.department         || '',
    'Facility':           employeeData.facility           || '',
    'Organization':       employeeData.organization       || '',
    'Division':           employeeData.division           || '',
    'Hire Date':          toDate(employeeData.hireDate),
    'Term Date':          toDate(employeeData.termDate),
    'Termination Reason': employeeData.termination_reason || '',
    'Employment Status':  employeeData.employement_status || '',
    'Date of Birth':      toDate(employeeData.date_of_birth),
    'Salary Range':       employeeData.salaryRange        || '',

    // Scores
    'Overall Score':      employeeData.overallScore      || 0,
    'Retention Score':    employeeData.retentionScore    || 0,
    'Right Fit':          employeeData.rightFitCandidate || false,
    'Work Life Score':    employeeData.categoryScores?.['work life']  || 0,
    'Family Score':       employeeData.categoryScores?.['family']     || 0,
    'Finance Score':      employeeData.categoryScores?.['finances']   || 0,
    'Schedule Score':     employeeData.categoryScores?.['schedule']   || 0,
    'Risk Level':         determineRiskLevel(employeeData.overallScore),

    // Points breakdown
    'Age Points':         employeeData.agePoints      || 0,
    'Distance Points':    employeeData.distancePoints || 0,
    'Tenure Points':      employeeData.tenurePoints   || 0,
    'Turnover Points':    employeeData.turnoverPoints || 0,
    'Finance Points':     employeeData.financePoints  || 0,
    'Schedule Points':    employeeData.schedulePoints || 0,
    'WLB Points':         employeeData.wlbPoints      || 0,
    'Family Points':      employeeData.familyPoints   || 0,

    // Social Media
    'LinkedIn URL':       employeeData.socialData?.linkedin_url       || '',
    'LinkedIn Username':  employeeData.socialData?.linkedin_username  || '',
    'Twitter URL':        employeeData.socialData?.twitter_url        || '',
    'Twitter Username':   employeeData.socialData?.twitter_username   || '',
    'Facebook URL':       employeeData.socialData?.facebook_url       || '',
    'Facebook Username':  employeeData.socialData?.facebook_username  || '',
  };
}

async function saveToAirtable(employeeData) {
  try {
    const table = base(process.env.AIRTABLE_TABLE_ID);

    const existing = await table.select({
      filterByFormula: `{Email} = "${employeeData.email}"`
    }).firstPage();

    if (existing.length > 0) {
      await table.update(existing[0].id, buildFields(employeeData));
      console.log(`✅ Airtable updated: ${employeeData.name}`);
    } else {
      await table.create(buildFields(employeeData));
      console.log(`✅ Airtable created: ${employeeData.name}`);
    }
  } catch (error) {
    console.error(`❌ Airtable error for ${employeeData.name}:`, error.message);
  }
}

module.exports = { saveToAirtable };