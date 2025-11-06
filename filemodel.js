const mongoose=require('mongoose')

const fileSchema=mongoose.Schema({
file:{
    type:String,
    required:true
},
user:{
    type:mongoose.Schema.ObjectId,
    ref:'user'
},
paid:{
    type:Boolean,
    default:false
},
passcode:{
    type:String,
    required:true
},
output:{
    type:String
}

},{timestamps:true})


const filemodel=mongoose.model('file',fileSchema)

module.exports=filemodel;