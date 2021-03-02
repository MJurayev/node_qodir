const Joi = require('joi')
const mongoose = require('mongoose')

VerifySchema =new mongoose.Schema({
    //type: email or phone options
    type:{
        type:String,
        required:true,
        minlength:4,
        maxlength:6
    },
    //veryfication payload "+998xxaaabbcc" or "example@example.com"
    payload:{
        type:String,
        required:true,
    },
    //Veryfication code
    code:{
        type:String,
        required:true
    }
})

const validateVerify=(x)=>{
    const joiSchema = Joi.object({
        type:Joi.string().required(),
        payload:Joi.string().required(),
        code:Joi.number().required(),
    })
    return joiSchema.validate(x)
}
const Verytification = mongoose.model('verytification', VerifySchema)
module.exports.Verytification = Verytification
module.exports.validateVerify = validateVerify