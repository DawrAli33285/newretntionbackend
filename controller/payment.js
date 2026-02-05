const adminModel = require("../admin");
const jwt=require('jsonwebtoken');
const usermodel = require("../user");
const filemodel = require("../filemodel");
const { default: mongoose } = require("mongoose");
const nodemailer=require('nodemailer');
const invoiceModel = require("../invoice");
const csv = require('csv-parser');
const XLSX = require('xlsx');
const { Readable } = require('stream');

const { cloudinaryUpload } = require('../util/cloudinary'); 
const fs = require('fs');
const path = require('path');

function generateUniquePasscode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  const generateOutputCSV = (results) => {
    const headers = [
      'Employee Number',
      'Employee Name (Last Suffix, First MI)',
      'Address Line 1 + Address Line 2',
      'City, State Zip Code (Formatted)',
      'E-mail Address',
      'Alternate Email',
      'Home Phone (Formatted)',
      'Work Life Balance',
      'Communication',
      'Financial',
      'Schedule',
      'Final Score',
      'Improvement Areas'
    ];
  
    const csvRows = results.map(emp => {
      return [
        emp.employeeNumber || '',
        emp.name || '',
        emp.address || '',
        emp.cityStateZip || '',
        emp.email || '',
        emp.alternateEmail || '',
        emp.phone || '',
        emp.categoryScores?.['family & work-life balance'] || 0,
        emp.categoryScores?.['communication & leadership'] || 0,
        emp.categoryScores?.['money & compensation'] || 0,
        emp.categoryScores?.['schedule & workload'] || 0,
        emp.overallScore || emp.totalScore || 0,
        emp.improvementArea || 'N/A'
      ];
    });
  
    const csvContent = [headers, ...csvRows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  
    return csvContent;
  };

module.exports.getPassCode=async(req,res)=>{
    let {email,id}=req.body;
    try{
  
  let fileFound=await filemodel.findOne({_id:id})
  let passcode=generateUniquePasscode();
      const mailOptions = {
        from: 'orders@enrichifydata.com',
        to: email,
        subject: `Pass code to download file`,
        html: `
         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background-color: #024a47; padding: 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Your Download Passcode</h1>
      <p style="color: #ecf0f1; margin-top: 10px; font-size: 16px;">Access your purchased file</p>
    </div>
    
    <!-- Timestamp -->
    <div style="padding: 20px; background-color: #f8f9fa; border-bottom: 2px solid #e9ecef;">
      <p style="margin: 0; color: #7f8c8d; font-size: 14px;">Passcode generated on</p>
      <h2 style="margin: 5px 0 0 0; color: #2c3e50; font-size: 20px;">${new Date().toLocaleString()}</h2>
    </div>
  
    <!-- Download Information -->
    <div style="padding: 30px;">
      <h3 style="color: #2c3e50; border-bottom: 2px solid #024a47; padding-bottom: 10px; margin-top: 0;">
        File Download Information
      </h3>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <tr>
          <td style="padding: 12px; background-color: #f8f9fa; width: 35%; font-weight: 600; color: #2c3e50;">File ID</td>
          <td style="padding: 12px; border: 1px solid #dee2e6; color: #495057; font-family: monospace;">${fileFound._id}</td>
        </tr>
        <tr>
          <td style="padding: 12px; background-color: #f8f9fa; font-weight: 600; color: #2c3e50;">Customer Email</td>
          <td style="padding: 12px; border: 1px solid #dee2e6; color: #495057;">${email}</td>
        </tr>
        <tr>
          <td style="padding: 12px; background-color: #f8f9fa; font-weight: 600; color: #2c3e50;">Payment Status</td>
          <td style="padding: 12px; border: 1px solid #dee2e6; color: #27ae60; font-weight: 600;">✅ Paid</td>
        </tr>
      </table>
  
      <!-- Passcode Section -->
      <h3 style="color: #2c3e50; border-bottom: 2px solid #024a47; padding-bottom: 10px; margin-top: 35px;">
        Your Download Passcode
      </h3>
      
      <div style="margin-top: 20px; padding: 25px; background-color: #f8f9fa; border: 2px dashed #024a47; border-radius: 8px; text-align: center;">
        <p style="margin: 0 0 15px 0; color: #2c3e50; font-size: 16px; font-weight: 600;">Use this passcode to download your file:</p>
        <div style="background-color: #024a47; color: #ffffff; padding: 15px; border-radius: 6px; font-size: 24px; font-weight: bold; letter-spacing: 2px; font-family: monospace;">
          ${passcode}
        </div>
        <p style="margin: 15px 0 0 0; color: #7f8c8d; font-size: 14px;">This passcode is required to access your purchased file</p>
      </div>
  
      <!-- Instructions -->
      <div style="margin-top: 30px; padding: 20px; background-color: #e8f4fd; border-left: 4px solid #3498db; border-radius: 4px;">
        <h4 style="margin: 0 0 15px 0; color: #2c3e50;">How to Download Your File:</h4>
        <ol style="margin: 0; color: #2c3e50; line-height: 1.6; padding-left: 20px;">
          <li>Visit our download page</li>
          <li>Enter your email address</li>
          <li>Enter the passcode provided above</li>
          <li>Click "Download File" to access your content</li>
        </ol>
      </div>
  
      <!-- Important Notes -->
      <div style="margin-top: 25px; padding: 15px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
        <p style="margin: 0; color: #856404; font-weight: 600;">🔒 Important Security Notes</p>
        <ul style="margin: 5px 0 0 0; color: #856404; font-size: 14px; padding-left: 20px;">
          <li>Keep this passcode confidential</li>
          <li>Do not share this passcode with others</li>
          <li>This passcode is valid for one-time use only</li>
          <li>Contact support if you encounter any issues</li>
        </ul>
      </div>
    </div>
  
    <!-- Footer -->
    <div style="background-color: #2c3e50; padding: 20px; text-align: center;">
      <p style="margin: 0; color: #ecf0f1; font-size: 12px;">
        Thank you for your purchase! If you have any questions, contact our support team.
      </p>
      <p style="margin: 10px 0 0 0; color: #95a5a6; font-size: 11px;">
        © 2025 Your Company Name. All rights reserved.
      </p>
    </div>
  </div>
        `
    };
  
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'rentsimple159@gmail.com', 
            pass: 'upqbbmeobtztqxyg' 
        }
    });
    
    await transporter.sendMail(mailOptions);
  await filemodel.findByIdAndUpdate(id,{
    $set:{
      paid:true
    }
  })
  
  
    }catch(e){
      console.log(e.message)
      return res.status(400).json({
        error:"Error while trying to send pass code"
      })
    }
}


function generateUniquePasscode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}


const HARDCODED_OUTPUT_DATA = [
  {
    employeeNumber: 3321,
    name: 'Abernathy, Rita K.',
    address: '9790 North 100 West',
    cityStateZip: 'Fountaintown, IN 46130',
    email: 'rabernathy@hancockregional.org',
    alternateEmail: '',
    phone: '(317) 752-2091',
    categoryScores: {
      'family & work-life balance': 7,
      'communication & leadership': 6,
      'money & compensation': 3,
      'schedule & workload': 6
    },
    overallScore: 5.5,
    totalScore: 5.5,
    improvementArea: 'Financial'
  },
  {
    employeeNumber: 7051,
    name: 'Abram, Crystal M.',
    address: '4082 Congaree Ln',
    cityStateZip: 'Indianapolis, IN 46235',
    email: 'cabram@hancockregional.org',
    alternateEmail: 'crystalabram45@gmail.com',
    phone: '(317) 640-9743',
    categoryScores: {
      'family & work-life balance': 4,
      'communication & leadership': 5,
      'money & compensation': 9,
      'schedule & workload': 8
    },
    overallScore: 6.5,
    totalScore: 6.5,
    improvementArea: 'Work Life Balance'
  },
  {
    employeeNumber: 8866,
    name: 'Abrams, Tina J.',
    address: '8538 S. Co. Rd. 200 W',
    cityStateZip: 'Spiceland, IN 47385',
    email: 'tabrams@hancockregional.org',
    alternateEmail: 'tabrams8688@gmail.com',
    phone: '(765) 524-8688',
    categoryScores: {
      'family & work-life balance': 8,
      'communication & leadership': 5,
      'money & compensation': 8,
      'schedule & workload': 7
    },
    overallScore: 7,
    totalScore: 7,
    improvementArea: 'None'
  },
  {
    employeeNumber: 8368,
    name: 'Abu Manneh, Rona',
    address: '10550 Geist View Drive',
    cityStateZip: 'McCordsville, IN 46055',
    email: 'rabu-manneh@hancockregional.org',
    alternateEmail: '',
    phone: '',
    categoryScores: {
      'family & work-life balance': 5,
      'communication & leadership': 2,
      'money & compensation': 4,
      'schedule & workload': 3
    },
    overallScore: 3.5,
    totalScore: 3.5,
    improvementArea: 'Communication, Financial, Schedule'
  },
  {
    employeeNumber: 6885,
    name: 'Acosta, Caitlin',
    address: '2915 Sheffield Dr',
    cityStateZip: 'Indianapolis, IN 46229',
    email: '',
    alternateEmail: '',
    phone: '(608) 839-9957',
    categoryScores: {
      'family & work-life balance': 7,
      'communication & leadership': 8,
      'money & compensation': 1,
      'schedule & workload': 8
    },
    overallScore: 6,
    totalScore: 6,
    improvementArea: 'Financial'
  },
  {
    employeeNumber: 900003,
    name: 'Adams, Debra',
    address: '801 N. State St.',
    cityStateZip: 'Greenfield, IN 46140',
    email: '',
    alternateEmail: '',
    phone: '',
    categoryScores: {
      'family & work-life balance': 10,
      'communication & leadership': 8,
      'money & compensation': 1,
      'schedule & workload': 2
    },
    overallScore: 5.25,
    totalScore: 5.25,
    improvementArea: 'Financial, Schedule'
  },
  {
    employeeNumber: 7579,
    name: 'Adams, Natalie N.',
    address: '1611 Whisler Drive',
    cityStateZip: 'Greenfield, IN 46140',
    email: 'nadams@hancockhealth.org',
    alternateEmail: 'nadams@hancockhealth.org',
    phone: '(317) 414-4477',
    categoryScores: {
      'family & work-life balance': 3,
      'communication & leadership': 1,
      'money & compensation': 1,
      'schedule & workload': 10
    },
    overallScore: 3.75,
    totalScore: 3.75,
    improvementArea: 'Work Life Balance, Communication, Financial'
  },
  {
    employeeNumber: 5706,
    name: 'Adolay, Jennifer L.',
    address: '9917 Wild Turkey Row',
    cityStateZip: 'McCordsville, IN 46055',
    email: 'jadolay@hancockregional.org',
    alternateEmail: 'adolayp@comcast.net',
    phone: '',
    categoryScores: {
      'family & work-life balance': 7,
      'communication & leadership': 8,
      'money & compensation': 1,
      'schedule & workload': 9
    },
    overallScore: 6.25,
    totalScore: 6.25,
    improvementArea: 'Financial'
  },
  {
    employeeNumber: 6725,
    name: 'Aitken, Madison O.',
    address: '4029 E 1100 N',
    cityStateZip: 'Pendleton, IN 46064',
    email: 'MGELLINGER@HANCOCKREGIONAL.ORG',
    alternateEmail: 'madisongellinger2016@gmail.com',
    phone: '(317) 617-8903',
    categoryScores: {
      'family & work-life balance': 8,
      'communication & leadership': 5,
      'money & compensation': 8,
      'schedule & workload': 4
    },
    overallScore: 6.25,
    totalScore: 6.25,
    improvementArea: 'Schedule'
  }
];


module.exports.calculatePrice = async (req, res) => {
  try {
    const { recordCount } = req.body;
    const file = req.file; 
    
    console.log('Record Count:', recordCount);
    console.log('File:', file);
    
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    if (!recordCount || recordCount <= 0) {
      return res.status(400).json({ error: 'Invalid record count' });
    }
    
    const PER_RECORD_FEE = 295; 
    
    const totalAmount = recordCount * PER_RECORD_FEE;

   
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const inputFileName = `input_${timestamp}_${randomString}${path.extname(file.originalname)}`;
    
   
    const csvContent = generateOutputCSV(HARDCODED_OUTPUT_DATA);
    
   
    const tempOutputPath = path.join('/tmp', `output_${Date.now()}.csv`);
    fs.writeFileSync(tempOutputPath, csvContent);
    

    const outputCloudinaryResult = await cloudinaryUpload(tempOutputPath);
    
    if (!outputCloudinaryResult.url) {
      return res.status(500).json({ error: 'Failed to upload output to Cloudinary' });
    }
    
  
    const passcode = 'DEMO2024';
    
    
    const newFile = await filemodel.create({
      file: inputFileName,
      user: req.user._id,
      paid: true,
      passcode: passcode,
      output: outputCloudinaryResult.url,
      recordCount: recordCount.toString()
    });
    
  
    const newInputPath = path.join('/tmp/public/files', inputFileName);
    fs.renameSync(file.path, newInputPath);
    
    
    fs.unlinkSync(tempOutputPath);
    
    return res.json({ 
      totalAmount,
      recordCount,
      perRecordFee: PER_RECORD_FEE,
      fileId: newFile._id
    });
  } catch (error) {
    console.error('Error calculating price:', error);
    return res.status(500).json({ error: 'Failed to calculate price' });
  }
}

module.exports.payForUpload=async(req,res)=>{
  try {
    const { amount, recordCount } = req.body;
    const stripe = require('stripe')("sk_test_51OwuO4LcfLzcwwOYsXYljgE1gUyGnLFvjewSf1NG9CsrSqTsxm7n7ppmZ2ZIFL01ptVDhuW7LixPggik41wWmOyE00RjWnYxUA"); // Add your Stripe secret key


    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

   
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd',
      metadata: {
        recordCount: recordCount,
        userId: req.user.id 
      }
    });

   return res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
   return res.status(500).json({ error: 'Failed to create payment intent' });
  }
}

module.exports.payForCredits = async (req, res) => {
  try {
    const { amount, recordCount, invoiceId } = req.body;
    const stripe = require('stripe')("sk_test_51OwuO4LcfLzcwwOYsXYljgE1gUyGnLFvjewSf1NG9CsrSqTsxm7n7ppmZ2ZIFL01ptVDhuW7LixPggik41wWmOyE00RjWnYxUA");

    if (!amount || amount < 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

   
    const user = await usermodel.findById(req.user._id);
    const userCredits = user.credits || 0;
    
  
    const invoice = await invoiceModel.findById(invoiceId);
    const originalAmount = invoice.price * 100; 
    
    
    let creditsUsed = 0;
    if (userCredits > 0) {
      creditsUsed = Math.min(userCredits, originalAmount / 100);
    }

    
    const [paymentIntent, invoiceUpdate, userUpdate] = await Promise.all([
      amount > 0 ? stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        metadata: {
          recordCount: recordCount,
          userId: req.user.id,
          creditsUsed: creditsUsed
        }
      }) : null,
      invoiceModel.findByIdAndUpdate(invoiceId, {
        $set: {
          status: 'Paid',
          paidDate: new Date(),
          creditsUsed: creditsUsed
        }
      }),
      usermodel.findByIdAndUpdate(req.user._id, {
        $inc: {
          credits: -(creditsUsed) 
        }
      })
    ]);

    return res.json({
      clientSecret: paymentIntent ? paymentIntent.client_secret : null,
      paymentIntentId: paymentIntent ? paymentIntent.id : null,
      creditsUsed: creditsUsed,
      finalAmount: amount / 100
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return res.status(500).json({ error: 'Failed to create payment intent' });
  }
}


module.exports.deductCredits = async (req, res) => {
  const { creditsToDeduct } = req.body;

  try {
    await usermodel.findByIdAndUpdate(
      req.user._id,
      {
        $inc: { credits: -creditsToDeduct }
      },
      { new: true }
    );

    return res.status(200).json({
      message: "Credits deducted successfully"
    });
  } catch (e) {
    console.log(e.message);
    return res.status(400).json({
      error: "Error occurred while trying to deduct credits"
    });
  }
};





//heere


const parseCSV = (buffer) => {
  return new Promise((resolve, reject) => {
    const results = [];
    const stream = Readable.from(buffer.toString());
    
    stream
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
};


const parseExcel = (buffer) => {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(worksheet);
};


const filterEmployees = (employees, filters) => {
  let filtered = [...employees];

  if (filters.department && filters.department !== 'all') {
    filtered = filtered.filter(emp => emp.Department === filters.department);
  }

  if (filters.jobClass && filters.jobClass !== 'all') {
    filtered = filtered.filter(emp => emp['Job Class'] === filters.jobClass);
  }

  if (filters.organization && filters.organization !== 'all') {
    filtered = filtered.filter(emp => emp.Organization === filters.organization);
  }

  if (filters.division && filters.division !== 'all') {
    filtered = filtered.filter(emp => emp.Division === filters.division);
  }

  if (filters.hireDate && filters.hireDate !== 'all') {
    filtered = filtered.filter(emp => emp['Hire Date'] === filters.hireDate);
  }

  if (filters.termDate && filters.termDate !== 'all') {
    filtered = filtered.filter(emp => emp['Term Date'] === filters.termDate);
  }

  if (filters.salaryRange && filters.salaryRange !== 'all') {
    filtered = filtered.filter(emp => emp['Salary Range'] === filters.salaryRange);
  }

  return filtered;
};

module.exports.filterAndCount = async (req, res) => {
  try {
    const file = req.file;
    const filters = req.body.filters ? JSON.parse(req.body.filters) : {};
    
    console.log('File:', file);
    console.log('Filters:', filters);
    
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!file.buffer) {
      return res.status(400).json({ error: 'File buffer not found' });
    }

    let employees = [];
    
    
    if (file.mimetype === 'text/csv') {
      employees = await parseCSV(file.buffer);
    } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
               file.mimetype === 'application/vnd.ms-excel') {
      employees = parseExcel(file.buffer);
    } else {
      return res.status(400).json({ error: 'Invalid file type. Please upload CSV or Excel file.' });
    }

    console.log('Total employees in file:', employees.length);

   
    const filteredEmployees = filterEmployees(employees, filters);
    
    console.log('Filtered employees:', filteredEmployees.length);

   
    const validRecords = filteredEmployees.filter(emp => {
      const employeeName = emp['Employee Name (Last Suffix, First MI)'];
      return employeeName && employeeName.trim().length > 0;
    });

    const recordCount = validRecords.length;
    const PER_RECORD_FEE = 295; 
    const totalAmount = recordCount * PER_RECORD_FEE;

    const tempId = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    
   
    global.tempFilteredData = global.tempFilteredData || {};
    global.tempFilteredData[tempId] = {
      data: filteredEmployees,
      expiresAt: Date.now() + 3600000 
    };

    res.json({
      recordCount,
      totalAmount,
      perRecordFee: PER_RECORD_FEE,
      originalCount: employees.length,
      filteredCount: filteredEmployees.length,
      validRecordCount: recordCount,
      tempId,
      appliedFilters: filters,
      filteredEmployees: validRecords 
    });
  } catch (error) {
    console.error('Error filtering and counting:', error);
    res.status(500).json({ error: 'Error processing file: ' + error.message });
  }
};

