const router=require('express').Router();
const {getPassCode,deductCredits,calculatePrice,payForUpload,payForCredits}=require('../controller/payment')
const {middleware}=require('../util/middleware')
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
router.post('/getPassCode',getPassCode)
router.post('/calculate-price', middleware, upload.single('file'), calculatePrice)
router.post('/create-payment-intent',middleware,payForUpload)
router.post('/payForCredits',middleware,payForCredits)
router.post('/deductCredits',middleware,deductCredits)
module.exports=router;