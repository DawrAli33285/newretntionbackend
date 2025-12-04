const router=require('express').Router();
const {userRegister,userLogin,getCurrentCredits,resetPassword,getAllFiles}=require('../controller/user');
const { middleware } = require('../util/middleware');

router.post('/register',userRegister)
router.post('/login',userLogin)
router.post('/userresetPassword',resetPassword)
router.get('/get-files',middleware,getAllFiles)
router.get('/getCurrentCredits',middleware,getCurrentCredits)

module.exports=router;