const filemodel = require('../filemodel');
const userModel=require('../user')
const jwt=require('jsonwebtoken')

module.exports.userLogin=async(req,res)=>{
    let {...data}=req.body;
try{
let userFound=await userModel.findOne({email:data.email})
if(!userFound){
return res.status(400).json({
    error:"user not found"
})
}
let password=await userModel.findOne({email:data.email,password:data.password})
if(!password){
    return res.status(400).json({
        error:"Invalid password"
    })
}

userFound=userFound.toObject();
let token=await jwt.sign(userFound,process.env.JWT_KEY)

return res.status(200).json({
    user:userFound,
    token
})

}catch(e){
    console.log(e.message)
    return res.status(400).json({
        error:"Error occured while trying to login"
    })
}
}

module.exports.userRegister=async(req,res)=>{
    let {...data}=req.body;
try{
let alreadyExists=await userModel.findOne({email:data.email})
if(alreadyExists){
    return res.status(400).json({
        error:"user already exists"
    })
}
let user=await userModel.create(data)
user=user.toObject()
let token=await jwt.sign(user,process.env.JWT_KEY)

return res.status(200).json({
    user,
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

    let userFound=await userModel.findOne({email:data.email})
    if(!userFound){
        return res.status(400).json({
            error:"user not found"
        })
    }
    await userModel.updateOne({email:data.email},{
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
        error:"Error occured while trying to reset password"
    })
}
}


module.exports.getAllFiles=async(req,res)=>{
    try{
     
let files=await filemodel.find({user:req.user._id}).populate('user')
console.log(files)
return res.status(200).json({
    files
})
    }catch(e){
        console.log(e.message)
        return res.status(400).json({
            error:"Error occured while fetching files"
        })
    }
}


module.exports.getCurrentCredits=async(req,res)=>{
    try{
let user=await userModel.findOne({_id:req.user._id},{credits:1,_id:-1})
return res.status(200).json({
    user
})
    }catch(e){
        console.log(e.message)
        return res.status(400).json({
            error:"Error occured while trying to get credits"
        })
    }
}