const mongoose = require('mongoose')
const Joi = require('joi')
const questionSchema = new mongoose.Schema({
    questionString:{
        type:String,
        required:true,
    },
    answerA:{
        type:String, 
        required:true
    },
    answerB:{
        type:String, 
        required:true
    },
    answerC:{
        type:String, 
        required:true
    },
    answerD:{
        type:String, 
        required:true
    },
    correctAnswer:{
        type:Number,
        required:true
    }
})
const quizSchema = new mongoose.Schema({
    //savol qaysi mavzuga tegishli ekanligini bildiruvchi text
    quizName:{
        type:String,
        // unique:true,
        required:true
    },
    questions:{
        type:[questionSchema],
        required:true
    }
})
function quizValidate(quiz){
    const questionValidationSchema = Joi.object({
        questionString:Joi.string().required(),
        answerA:Joi.string().required(),
        answerB:Joi.string().required(),
        answerC:Joi.string().required(),
        answerD:Joi.string().required(),
        correctAnswer:Joi.number().min(1).max(4).required()
    })

    const quizValidationSchema = Joi.object({
        quizName:Joi.string().required(),
        questions:Joi.array().items(questionValidationSchema)
    })
    return quizValidationSchema.validate(quiz)
}
const Quiz = mongoose.model('quiz', quizSchema)
const Question = mongoose.model('question', questionSchema)
exports.Quiz = Quiz
exports.validator = quizValidate
exports.Question = Question