const invoiceModel = require("../invoice")

module.exports.getAllInvoices=async(req,res)=>{
    try{
let invoices=await invoiceModel.find({}).populate('user')
return res.status(200).json({
    invoices
})
    }catch(e){
        console.log(e.message)
        return res.status(400).json({
            error:"Error occured while trying to get all invoices"
        })
    }
}


module.exports.getUserInvoices=async(req,res)=>{
    try{
let invoices=await invoiceModel.find({user:req.user._id}).populate('user')
return res.status(200).json({
    invoices
})
    }catch(e){
        console.log(e.message)
        return res.status(400).json({
            error:"Error occured while trying to get user invoices"
        })
    }
}








