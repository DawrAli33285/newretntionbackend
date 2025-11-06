const router=require('express').Router();
const {adminLogin,adminRegister,getUsers,resetPassword}=require('../controller/admin')

router.post('/adminLogin',adminLogin)
router.post('/adminRegister',adminRegister)
router.post('/resetPassword',resetPassword)
router.get('/getUsers',getUsers)

module.exports=router;