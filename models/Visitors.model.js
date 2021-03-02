const mongoose = require('mongoose')
const Joi = require('joi')

const visitSchema = new mongoose.Schema({
    date:{
        type:String,
        required:true
    },
    user_id:{
        type:String,
        required:true
    }
})

const Visit = mongoose.model('visits', visitSchema)


module.exports.Visit = Visit
