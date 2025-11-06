const adminModel = require("../admin");
const jwt=require('jsonwebtoken');
const usermodel = require("../user");

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