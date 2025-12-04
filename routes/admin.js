const router=require('express').Router();
const {adminLogin,getAllInvoices,sendPassCode,adminRegister,sendInvoice,getDashboardStats,updateFile,deleteFile,getUsers,getFiles,deleteUser,updateUser,resetPassword}=require('../controller/admin')

router.post('/adminLogin',adminLogin)
router.post('/adminRegister',adminRegister)
router.post('/resetPassword',resetPassword)
router.get('/getUsers',getUsers)
router.patch('/updateUser/:id',updateUser)
router.delete('/deleteUser/:id',deleteUser)
router.get('/getFiles',getFiles)
router.patch('/updateFile/:id',updateFile)
router.delete('/deleteFile/:id',deleteFile)
router.get('/dashboard/stats', getDashboardStats);
router.post('/sendPasscode',sendPassCode)
router.post('/sendInvoice',sendInvoice)
router.get('/getAllInvoices',getAllInvoices)



module.exports=router;