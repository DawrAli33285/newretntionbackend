const router=require('express').Router();
const {getPassCode,calculatePrice,payForUpload,payForCredits}=require('../controller/payment')
const {middleware}=require('../util/middleware')
router.post('/getPassCode',getPassCode)
router.post('/calculate-price',middleware,calculatePrice)
router.post('/create-payment-intent',middleware,payForUpload)
router.post('/payForCredits',middleware,payForCredits)
module.exports=router;