const adminModel = require("../admin");
const jwt=require('jsonwebtoken');
const usermodel = require("../user");
const filemodel = require("../filemodel");
const { default: mongoose } = require("mongoose");
const nodemailer=require('nodemailer');
const invoiceModel = require("../invoice");



function generateUniquePasscode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

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


module.exports.calculatePrice=async(req,res)=>{
  try{
    try {
      const { recordCount } = req.body;
      
      if (!recordCount || recordCount <= 0) {
        return res.status(400).json({ error: 'Invalid record count' });
      }
      
      // Define your pricing model
      const BASE_FEE = 500; // $5.00 in cents
      const PER_RECORD_FEE = 50; // $0.50 per record in cents
      
      // Calculate total amount
      const totalAmount = BASE_FEE + (recordCount * PER_RECORD_FEE);
      
     return res.json({ 
        totalAmount,
        recordCount,
        baseFee: BASE_FEE,
        perRecordFee: PER_RECORD_FEE
      });
    } catch (error) {
      console.error('Error calculating price:', error);
      res.status(500).json({ error: 'Failed to calculate price' });
    }
  
  }catch(e){
    console.log(e.message)
    return res.status(400).json({
      error:"Error occured while trying to calculate price"
    })
  }
}



module.exports.payForUpload=async(req,res)=>{
  try {
    const { amount, recordCount } = req.body;
    const stripe = require('stripe')("sk_test_51OwuO4LcfLzcwwOYsXYljgE1gUyGnLFvjewSf1NG9CsrSqTsxm7n7ppmZ2ZIFL01ptVDhuW7LixPggik41wWmOyE00RjWnYxUA"); // Add your Stripe secret key


    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Create a PaymentIntent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd',
      metadata: {
        recordCount: recordCount,
        userId: req.user.id // Assuming you have user info from auth middleware
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

    // Get user's current credits
    const user = await usermodel.findById(req.user._id);
    const userCredits = user.credits || 0;
    
    // Calculate original amount from invoice
    const invoice = await invoiceModel.findById(invoiceId);
    const originalAmount = invoice.price * 100; // Convert to cents
    
    // Calculate credits used
    let creditsUsed = 0;
    if (userCredits > 0) {
      creditsUsed = Math.min(userCredits, originalAmount / 100);
    }

    // Use Promise.all to execute all operations together
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
          credits: -(creditsUsed) // Deduct credits used
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
