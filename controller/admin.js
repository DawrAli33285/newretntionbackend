const adminModel = require("../admin");
const jwt=require('jsonwebtoken');
const usermodel = require("../user");
const filemodel = require("../filemodel");
const { default: mongoose } = require("mongoose");

module.exports.adminLogin=async(req,res)=>{
    let {...data}=req.body;
try{
let adminFound=await adminModel.findOne({email:data.email})
if(!adminFound){
return res.status(400).json({
    error:"Admin not found"
})
}
let password=await adminModel.findOne({password:data.password})
if(!password){
    return res.status(400).json({
        error:"Invalid password"
    })
}

adminFound=adminFound.toObject();
let token=await jwt.sign(adminFound,process.env.JWT_KEY)

return res.status(200).json({
    admin:adminFound,
    token
})

}catch(e){
    console.log(e.message)
    return res.status(400).json({
        error:"Error occured while trying to login"
    })
}
}

module.exports.adminRegister=async(req,res)=>{
    let {...data}=req.body;
try{
let alreadyExists=await adminModel.findOne({email:data.email})
if(alreadyExists){
    return res.status(400).json({
        error:"Admin already exists"
    })
}
let admin=await adminModel.create(data)
admin=admin.toObject()
let token=await jwt.sign(admin,process.env.JWT_KEY)

return res.status(200).json({
    admin,
    token
})

}catch(e){
    console.log(e.message)
    return res.status(400).json({
        error:"Error occured while trying to register"
    })
}
}

module.exports.resetPassword=async(req,res)=>{
    let {...data}=req.body;
try{

    let adminFound=await adminModel.findOne({email:data.email})
    if(!adminFound){
        return res.status(400).json({
            error:"Admin not found"
        })
    }
    await adminModel.updateOne({email:data.email},{
        $set:{
            password:data.password
        }
    })
return res.status(200).json({
    message:"Password reset sucessfully"
})

}catch(e){
    console.log(e.message)
    return res.status(400).json({
        error:"Error occured while trying to reset"
    })
}
}

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