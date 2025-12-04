const mongoose=require('mongoose')

const invoiceSchema=mongoose.Schema({
    user:{
type:mongoose.Schema.ObjectId,
ref:'user'
    },
    price:{
type:Number
    },
    description:{
type:String
    },
    status:{
        type:String,
        enum:['Paid','Unpaid'],
        default:'Unpaid'
    },
    paidDate:{
        type:Date
    }
},{
    timestamps:true
})

const invoiceModel=mongoose.model('invoice',invoiceSchema)

module.exports=invoiceModel;