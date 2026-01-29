const mongoose=require('mongoose')

// const connection=mongoose.connect(`mongodb://127.0.0.1/prototype`)

const connection=mongoose.connect('mongodb+srv://dawarali:dawarali@cluster0.ijo1mym.mongodb.net/')

module.exports=connection;