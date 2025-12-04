const router=require('express').Router();
const {getAllInvoices,getUserInvoices}=require('../controller/invoice')
const {middleware}=require('../util/middleware')

router.get('/getAllInvoices',getAllInvoices)
router.get('/getUserInvoices',middleware,getUserInvoices)


module.exports=router;