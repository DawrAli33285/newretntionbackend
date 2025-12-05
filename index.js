const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const axios = require('axios');
const scoring = require('./scoringLogic');
const mongoose=require('mongoose')
const adminRoutes=require('./routes/admin')
const userRoutes=require('./routes/user')
const paymentRoutes=require('./routes/payment')
const invoiceRoutes=require('./routes/invoice')
const {middleware}=require('./util/middleware')

const xlsx = require('xlsx')
const cors=require('cors');
const usermodel = require('./user');

require('dotenv').config();
const app = express();
const upload = multer({ dest: '/tmp/public/files/uploads' });

app.use(express.json());
app.use(cors())


// mongoose.connect('mongodb://127.0.0.1/newrentation');

  mongoose.connect('mongodb+srv://dawar:dawar@cluster0.51eap22.mongodb.net');

function cleanup(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Cleaned up temporary file: ${filePath}`);
    }
  } catch (err) {
    console.error('Error cleaning up file:', err);
  }
}

app.use(adminRoutes)
app.use(userRoutes)
app.use(paymentRoutes)
app.use(invoiceRoutes)
app.post('/api/enrich', upload.single('employeeFile'),middleware, async (req, res) => {
 
  let filePath = req.file.path;
  

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Get creditsUsed from request body
    const { creditsUsed, paymentIntentId,recordCount } = req.body;
    let user=await usermodel.findOne({_id:req.user._id})

    if(user.credits<creditsUsed){
      return res.status(400).json({
        error:"Insufficient credits"
      })
    }
    console.log('Credits to deduct:', creditsUsed);

    // Deduct credits if they were used
    if (creditsUsed && parseFloat(creditsUsed) > 0) {
      const updatedUser = await usermodel.findByIdAndUpdate(
        req.user._id,
        {
          $inc: {
            credits: -(parseFloat(creditsUsed))
          }
        },
        { new: true } // Return updated document
      );
      console.log('Credits after deduction:', updatedUser.credits);
    }

    const inputFileName = req.file.originalname; 
    const fileExt = req.file.originalname.split('.').pop().toLowerCase();
    const employees = [];

    if (fileExt === 'csv') {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => employees.push(row))
        .on('end', async () => {
          const {results,passcode} = await scoring.processEmployees(employees, req.user, inputFileName,recordCount);
          cleanup(filePath);
          return res.json({
            results,
            passcode
           });
        });
    } else if (fileExt === 'xlsx') {
     
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);
      
      const {results,passcode} = await scoring.processEmployees(data, req.user._id, inputFileName,recordCount);
      cleanup(filePath);
     return res.json({
      results,
      passcode
     });
    } else {
      cleanup(filePath);
      res.status(400).json({ error: 'Unsupported file type' });
    }
  } catch (error) {
    cleanup(filePath);
    console.error('Error processing file:', error);
    res.status(500).json({ error: 'Error processing file' });
  }
})
app.listen(5000, () => console.log('Server running on port 5000'));