const mongoose = require('mongoose');

const retentionDataSchema = new mongoose.Schema({

  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }, 
  phone: String,

  last_hire_date: String,
  job_start: String,
  termination_date: String,
  original_hire: String,  
  seniority_date: String, 
  
 
  termination_reason: String,
  employement_status: { type: String, required: true },
  job_title: String,
  department: String,
  facility: String,

 
  date_of_birth: String,


  categoryScores: {
    'schedule & workload': { type: Number, default: 0 },
    'money & compensation': { type: Number, default: 0 },
    'job satisfaction': { type: Number, default: 0 },
    'family & work-life balance': { type: Number, default: 0 },
    'communication & leadership': { type: Number, default: 0 },
    'lack of rest': { type: Number, default: 0 }
  },
  
  
  
  overallScore: { type: Number, required: true, default: 0 },

 
  riskLevel: { type: String, default: 'Low' },
  improvementArea: String,
  possibleImprovedScore: { type: Number, default: 0 }
}, {
  timestamps: true, 
  strict: false 
});

retentionDataSchema.index({ email: 1 });
retentionDataSchema.index({ name: 1 });
retentionDataSchema.index({ overallScore: 1 });

const RetentionData = mongoose.model('RetentionData', retentionDataSchema);

module.exports = RetentionData;