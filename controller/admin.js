const adminModel = require("../admin");
const jwt=require('jsonwebtoken');
const usermodel = require("../user");
const filemodel = require("../filemodel");
const { default: mongoose } = require("mongoose");
const nodemailer=require('nodemailer');
const invoiceModel = require("../invoice");
const argon2 = require('argon2');

module.exports.adminLogin = async (req, res) => {
  let { ...data } = req.body;
  
  try {
      // Validate input
      if (!data.email || !data.password) {
          return res.status(400).json({
              error: "Email and password are required"
          });
      }

      // Find admin by email
      let adminFound = await adminModel.findOne({ email: data.email });
      if (!adminFound) {
          return res.status(400).json({
              error: "Admin not found"
          });
      }

      // Verify password using argon2
      const isPasswordValid = await argon2.verify(adminFound.password, data.password);
      if (!isPasswordValid) {
          return res.status(400).json({
              error: "Invalid password"
          });
      }

      // Convert to plain object and remove password
      adminFound = adminFound.toObject();
      const { password, ...adminWithoutPassword } = adminFound;

      // Generate JWT token (without password)
      let token = await jwt.sign(adminWithoutPassword, process.env.JWT_KEY, {
          expiresIn: '7d'
      });

      return res.status(200).json({
          admin: adminWithoutPassword,
          token
      });

  } catch (e) {
      console.log(e.message);
      return res.status(400).json({
          error: "Error occurred while trying to login"
      });
  }
};


module.exports.adminRegister = async (req, res) => {
  let { ...data } = req.body;
  
  try {
      // Validate required fields
      if (!data.email || !data.password) {
          return res.status(400).json({
              error: "Email and password are required"
          });
      }

      // Check if admin already exists
      let alreadyExists = await adminModel.findOne({ email: data.email });
      if (alreadyExists) {
          return res.status(400).json({
              error: "Admin already exists"
          });
      }

      // Hash password with argon2
      data.password = await argon2.hash(data.password);

      // Create admin with hashed password
      let admin = await adminModel.create(data);
      admin = admin.toObject();

      // Generate JWT token (without password)
      const { password, ...adminWithoutPassword } = admin;
      let token = await jwt.sign(adminWithoutPassword, process.env.JWT_KEY, {
          expiresIn: '7d'
      });

      // Don't send password in response
      return res.status(200).json({
          admin: adminWithoutPassword,
          token
      });

  } catch (e) {
      console.log(e.message);
      return res.status(400).json({
          error: "Error occurred while trying to register"
      });
  }
};

module.exports.resetPassword = async (req, res) => {
  let { email, password } = req.body;
  
  try {
      // Validate input
      if (!email || !password) {
          return res.status(400).json({
              error: "Email and password are required"
          });
      }

      // Validate password length
      if (password.length < 6) {
          return res.status(400).json({
              error: "Password must be at least 6 characters"
          });
      }

      // Find admin
      let adminFound = await adminModel.findOne({ email });
      if (!adminFound) {
          return res.status(400).json({
              error: "Admin not found"
          });
      }

      // ✅ HASH THE PASSWORD BEFORE SAVING
      const hashedPassword = await argon2.hash(password);

      // Update password with hashed version
      await adminModel.updateOne(
          { email }, 
          {
              $set: {
                  password: hashedPassword
              }
          }
      );

      return res.status(200).json({
          message: "Password reset successfully"
      });

  } catch (e) {
      console.log(e.message);
      return res.status(500).json({
          error: "Error occurred while trying to reset password",
          details: e.message
      });
  }
};

module.exports.getUsers=async(req,res)=>{
    try{
let users=await usermodel.find({})
return res.status(200).json({
    users
})
    }catch(e){
        console.log(e.message)
        return res.status(400).json({
            error:"Error occured while trying to fetch users"
        })
    }
}

module.exports.updateUser=async(req,res)=>{
    const {...data}=req.body;
    console.log(data)
    const {id}=req.params;

    try{

        const found = await usermodel.findOne({
            $expr: { $eq: [{ $toString: "$_id" }, id] }
          });
          console.log("FOUND:", found);

        let updated = await usermodel.updateOne(
            {
              $expr: {
                $eq: [
                  { $toString: "$_id" },  
                  id                      
                ]
              }
            },
            {
              $set: data
            }
          )
          
          console.log(updated)

return res.status(200).json({
    message:"User updated sucessfully"
})
    }catch(e){
        console.log(e.message)
        return res.status(400).json({
            error:"Error occured while trying to update user"
        })
    }
}




module.exports.deleteUser=async(req,res)=>{
   
    const {id}=req.params;
    console.log(id)
    try{
await usermodel.findByIdAndDelete(id)

return res.status(200).json({
    message:"User deleted sucessfully"
})
    }catch(e){
        console.log(e.message)
        return res.status(400).json({
            error:"Error occured while trying to delete user"
        })
    }
}



module.exports.deleteFile=async(req,res)=>{
   
    const {id}=req.params;
    console.log(id)
    try{
await filemodel.deleteOne({_id:id})

return res.status(200).json({
    message:"File deleted sucessfully"
})
    }catch(e){
        console.log(e.message)
        return res.status(400).json({
            error:"Error occured while trying to delee file"
        })
    }
}



module.exports.updateFile=async(req,res)=>{
    const {...data}=req.body;
    const {id}=req.params;
    try{
await filemodel.findByIdAndUpdate(id,{
    $set:data
})

return res.status(200).json({
    message:"File updated sucessfully"
})
    }catch(e){
        return res.status(400).json({
            error:"Error occured while trying to file user"
        })
    }
}




module.exports.getFiles=async(req,res)=>{
    try{
let files=await filemodel.find({}).populate('user')
return res.status(200).json({
    files
})
    }catch(e){
        console.log(e.message)
        return res.status(400).json({
            error:"Error occured while trying to fetch files"
        })
    }
}


function generateUniquePasscode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
module.exports.sendPassCode=async(req,res)=>{
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



module.exports.getDashboardStats = async (req, res) => {
    try {
      // Get current date and previous month date
      const now = new Date();
      const firstDayOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const firstDayOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  
      // ===== TOTAL USERS =====
      const totalUsers = await usermodel.countDocuments();
      const usersLastMonth = await usermodel.countDocuments({
        createdAt: { $lt: firstDayOfCurrentMonth }
      });
      const usersThisMonth = totalUsers - usersLastMonth;
      const userGrowthPercentage = usersLastMonth > 0 
        ? Math.round((usersThisMonth / usersLastMonth) * 100) 
        : 0;
  
      // ===== ACTIVE USERS (users who uploaded files in last 30 days) =====
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const activeUserFiles = await filemodel.find({
        createdAt: { $gte: thirtyDaysAgo }
      }).distinct('user');
      const activeUsers = activeUserFiles.length;
  
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      const previousActiveUserFiles = await filemodel.find({
        createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
      }).distinct('user');
      const previousActiveUsers = previousActiveUserFiles.length;
      const activeUserGrowthPercentage = previousActiveUsers > 0
        ? Math.round(((activeUsers - previousActiveUsers) / previousActiveUsers) * 100)
        : 0;
  
      // ===== TOTAL FILES =====
      const totalFiles = await filemodel.countDocuments();
      const filesLastMonth = await filemodel.countDocuments({
        createdAt: { $lt: firstDayOfCurrentMonth }
      });
      const filesThisMonth = totalFiles - filesLastMonth;
      const fileGrowthPercentage = filesLastMonth > 0
        ? Math.round((filesThisMonth / filesLastMonth) * 100)
        : 0;
  
      // ===== STORAGE USED (mock calculation - you may need to implement actual file size tracking) =====
      // Since you don't have file size in schema, we'll estimate or you can add it
      const averageFileSize = 2.5; // MB - adjust based on your files
      const storageUsed = (totalFiles * averageFileSize).toFixed(2);
      const storageGrowthPercentage = 0; // You can calculate this if you track sizes
  
      // ===== MONTHLY GROWTH DATA (last 6 months) =====
      const monthlyData = [];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextMonthDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        
        const usersInMonth = await usermodel.countDocuments({
          createdAt: { $gte: monthDate, $lt: nextMonthDate }
        });
        
        const filesInMonth = await filemodel.countDocuments({
          createdAt: { $gte: monthDate, $lt: nextMonthDate }
        });
  
        monthlyData.push({
          month: monthNames[monthDate.getMonth()],
          users: usersInMonth,
          files: filesInMonth
        });
      }
  
      // ===== RECENT ACTIVITY (last 10 activities) =====
      const recentFiles = await filemodel.find()
        .populate('user', 'email')
        .sort({ createdAt: -1 })
        .limit(10);
  
      const recentUsers = await usermodel.find()
        .sort({ createdAt: -1 })
        .limit(5);
  
      // Combine and sort activities
      const activities = [];
  
      // Add file uploads
      recentFiles.forEach(file => {
        activities.push({
          email: file.user?.email || 'Unknown user',
          action: 'Uploaded file',
          time: file.createdAt,
          type: 'file'
        });
      });
  
      // Add new user registrations
      recentUsers.forEach(user => {
        activities.push({
          email: user.email,
          action: 'Registered',
          time: user.createdAt,
          type: 'user'
        });
      });
  
      // Sort by time and limit to 10
      activities.sort((a, b) => new Date(b.time) - new Date(a.time));
      const recentActivity = activities.slice(0, 10).map(activity => ({
        email: activity.email,
        action: activity.action,
        time: activity.time
      }));
  
      // ===== RESPONSE =====
      res.status(200).json({
        success: true,
        stats: {
          totalUsers: {
            count: totalUsers,
            growth: userGrowthPercentage
          },
          activeUsers: {
            count: activeUsers,
            growth: activeUserGrowthPercentage
          },
          totalFiles: {
            count: totalFiles,
            growth: fileGrowthPercentage
          },
          storageUsed: {
            size: storageUsed,
            growth: storageGrowthPercentage
          }
        },
        monthlyGrowth: monthlyData,
        recentActivity: recentActivity
      });
  
    } catch (error) {
      console.error('Dashboard stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching dashboard statistics',
        error: error.message
      });
    }
  };


  module.exports.sendInvoice = async (req, res) => {
    let { userId, price, description } = req.body;
    try {
      // Get user email
      const user = await usermodel.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      // Create invoice
      const invoice = await invoiceModel.create({
        user: userId,
        price,
        description
      });
  
      const mailOptions = {
        from: 'orders@enrichifydata.com',
        to: user.email,
        subject: `New Invoice - Payment Required`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <!-- Header -->
            <div style="background-color: #3b82f6; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Invoice Notification</h1>
              <p style="color: #dbeafe; margin-top: 10px; font-size: 16px;">Payment Request</p>
            </div>
  
            <!-- Timestamp -->
            <div style="padding: 20px; background-color: #f9fafb; border-bottom: 2px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">Invoice generated on</p>
              <h2 style="margin: 5px 0 0 0; color: #1f2937; font-size: 20px;">${new Date().toLocaleString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</h2>
            </div>
  
            <!-- Invoice Information -->
            <div style="padding: 30px;">
              <h3 style="color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; margin-top: 0;">
                Invoice Details
              </h3>
  
              <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <tr>
                  <td style="padding: 12px; background-color: #f9fafb; width: 35%; font-weight: 600; color: #1f2937;">Invoice ID</td>
                  <td style="padding: 12px; border: 1px solid #e5e7eb; color: #4b5563; font-family: monospace;">#${invoice._id.toString().slice(-8).toUpperCase()}</td>
                </tr>
                <tr>
                  <td style="padding: 12px; background-color: #f9fafb; font-weight: 600; color: #1f2937;">Customer Email</td>
                  <td style="padding: 12px; border: 1px solid #e5e7eb; color: #4b5563;">${user.email}</td>
                </tr>
                <tr>
                  <td style="padding: 12px; background-color: #f9fafb; font-weight: 600; color: #1f2937;">Payment Status</td>
                  <td style="padding: 12px; border: 1px solid #e5e7eb; color: #f59e0b; font-weight: 600;">⏳ Unpaid</td>
                </tr>
              </table>
  
              <!-- Amount Section -->
              <h3 style="color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; margin-top: 35px;">
                Amount Due
              </h3>
  
              <div style="margin-top: 20px; padding: 25px; background-color: #f9fafb; border: 2px solid #3b82f6; border-radius: 8px; text-align: center;">
                <p style="margin: 0 0 15px 0; color: #1f2937; font-size: 16px; font-weight: 600;">Total Amount:</p>
                <div style="background-color: #3b82f6; color: #ffffff; padding: 15px; border-radius: 6px; font-size: 32px; font-weight: bold; font-family: Arial, sans-serif;">
                  $${price.toFixed(2)}
                </div>
                <p style="margin: 15px 0 0 0; color: #6b7280; font-size: 14px;">Please process this payment at your earliest convenience</p>
              </div>
  
              ${description ? `
              <!-- Description Section -->
              <div style="margin-top: 25px; padding: 20px; background-color: #f0f9ff; border-left: 4px solid #3b82f6; border-radius: 4px;">
                <h4 style="margin: 0 0 10px 0; color: #1f2937; font-size: 16px;">Invoice Description:</h4>
                <p style="margin: 0; color: #4b5563; line-height: 1.6;">${description}</p>
              </div>
              ` : ''}
  
              <!-- Payment Instructions -->
              <div style="margin-top: 30px; padding: 20px; background-color: #ecfdf5; border-left: 4px solid #10b981; border-radius: 4px;">
                <h4 style="margin: 0 0 15px 0; color: #1f2937;">Payment Instructions:</h4>
                <ol style="margin: 0; color: #1f2937; line-height: 1.8; padding-left: 20px;">
                  <li>Log in to your account dashboard</li>
                  <li>Navigate to the "Invoices" section</li>
                  <li>Find this invoice and click "Pay Now"</li>
                  <li>Complete the payment process</li>
                </ol>
              </div>
  
              <!-- Important Notes -->
              <div style="margin-top: 25px; padding: 15px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                <p style="margin: 0 0 10px 0; color: #92400e; font-weight: 600;">⚠️ Important Information</p>
                <ul style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6; padding-left: 20px;">
                  <li>This invoice is due for immediate payment</li>
                  <li>Please keep this email for your records</li>
                  <li>Contact support if you have any questions</li>
                  <li>Payment confirmation will be sent once processed</li>
                </ul>
              </div>
  
              <!-- Support Section -->
              <div style="margin-top: 25px; padding: 20px; background-color: #f9fafb; border-radius: 8px; text-align: center;">
                <p style="margin: 0; color: #6b7280; font-size: 14px;">Need help with this invoice?</p>
                <p style="margin: 10px 0 0 0; color: #3b82f6; font-weight: 600; font-size: 16px;">Contact our support team</p>
              </div>
            </div>
  
            <!-- Footer -->
            <div style="background-color: #1f2937; padding: 25px; text-align: center;">
              <p style="margin: 0; color: #e5e7eb; font-size: 14px;">
                Thank you for your business! We appreciate your prompt payment.
              </p>
              <p style="margin: 15px 0 0 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} Your Company Name. All rights reserved.
              </p>
              <p style="margin: 10px 0 0 0; color: #9ca3af; font-size: 11px;">
                This is an automated notification. Please do not reply to this email.
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
      
      return res.status(200).json({
        message: "Invoice sent successfully",
        invoice: invoice
      });
  
    } catch (e) {
      console.log(e.message);
      return res.status(400).json({
        error: "Error occurred while trying to send invoice"
      });
    }
  };


  module.exports.getAllInvoices=async(req,res)=>{
    try{
let invoices=await invoiceModel.find({}).populate('user')
return res.status(200).json({
  invoices
})
    }catch(e){
      console.log(e.message)
      return res.status(400).json({
        error:"Error occured while trying to get invoices"
      })
    }
  }