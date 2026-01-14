const filemodel = require('../filemodel');
const userModel=require('../user')
const jwt=require('jsonwebtoken')
const argon2 = require('argon2');

module.exports.userLogin = async (req, res) => {
    let { ...data } = req.body;
    
    try {
        // Validate input
        if (!data.email || !data.password) {
            return res.status(400).json({
                error: "Email and password are required"
            });
        }

        // Find user by email
        let userFound = await userModel.findOne({ email: data.email });
        if (!userFound) {
            return res.status(400).json({
                error: "User not found"
            });
        }

        // Verify password using argon2
        const isPasswordValid = await argon2.verify(userFound.password, data.password);
        if (!isPasswordValid) {
            return res.status(400).json({
                error: "Invalid password"
            });
        }

        // Convert to plain object and remove password
        userFound = userFound.toObject();
        const { password, ...userWithoutPassword } = userFound;

        // Generate JWT token (without password)
        let token = await jwt.sign(userWithoutPassword, process.env.JWT_KEY, {
            expiresIn: '7d'
        });

        return res.status(200).json({
            user: userWithoutPassword,
            token
        });

    } catch (e) {
        console.log(e.message);
        return res.status(400).json({
            error: "Error occurred while trying to login"
        });
    }
};


module.exports.userRegister = async (req, res) => {
    let { ...data } = req.body;
    
    try {
        // Validate required fields
        if (!data.email || !data.password) {
            return res.status(400).json({
                error: "Email and password are required"
            });
        }

        // Check if user already exists
        let alreadyExists = await userModel.findOne({ email: data.email });
        if (alreadyExists) {
            return res.status(400).json({
                error: "User already exists"
            });
        }

        // Hash password with argon2
        data.password = await argon2.hash(data.password);

        // Create user with hashed password
        let user = await userModel.create(data);
        user = user.toObject();

        // Generate JWT token (without password)
        const { password, ...userWithoutPassword } = user;
        let token = await jwt.sign(userWithoutPassword, process.env.JWT_KEY, {
            expiresIn: '7d'
        });

        // Don't send password in response
        return res.status(200).json({
            user: userWithoutPassword,
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

        // Find user
        let userFound = await userModel.findOne({ email });
        if (!userFound) {
            return res.status(400).json({
                error: "User not found"
            });
        }

        // ✅ HASH THE PASSWORD BEFORE SAVING
        const hashedPassword = await argon2.hash(password);

        // Update password with hashed version
        await userModel.updateOne(
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