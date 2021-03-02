const mongoose = require('mongoose')
const Joi = require('joi')

const resultSchema = new mongoose.Schema({
    user_id:{
        type:String,
        required:true
    },
    quiz_id:{
        type:String,
        required:true
    },
    result:{
        type:Number,
        required:true
    },
    maxResult:{
        type:Number,
        required:true
    }
})

function validationSchemaQuizResult(quizResult){
    const quizValidSchema = Joi.object({
        user_id:Joi.string().required(),
        quiz_id:Joi.string().required(),
        result:Joi.number().required(),
        maxResult:Joi.number().required()
    })
    return quizValidSchema.validate(quizResult)
}
const Result = mongoose.model('quiz_results', resultSchema)
exports.validationSchemaQuizResult = validationSchemaQuizResult
exports.Result = Result