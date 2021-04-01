const express = require('express')
const auth = require('../middleware/auth')
const { Quiz, Question, validator} = require('../models/Quiz.model')
const { Result } = require('../models/QuizResult.model')
const router = express.Router()

router.get('/', auth , async (req, res)=>{
    const quiz =await Quiz.find()
    return res.send(quiz)
})

router.get('/:id', auth , async (req, res)=>{
    const quiz = await Quiz.findOne({_id:{$eq:req.params.id}})
    return res.send(quiz)
})
router.post('/',auth, async (req, res)=>{
    console.log(req.body)
    const {error} = validator(req.body)
    if(error)
        return res.status(400).send(error.details[0].message)
    const quiz = new Quiz({
        quizName:req.body.quizName,
        questions: req.body.questions
    })
    const savedQuiz = await quiz.save()
    if(!savedQuiz)
        return res.send("Ma'lumotlarni saqlash paytida xato yuz berdi")
    return res.send(savedQuiz)
})

router.delete('/:id', auth,async (req, res)=>{
    const quiz = await Quiz.findByIdAndDelete({_id:req.params.id})
    if(quiz)
        return res.send(quiz)
    return res.send("Berilgan Idga mos savol topilmadi")
})

router.post('/check',auth ,async (req, res)=>{
    var answers = req.body.answers
    // console.log(answers)
    const quiz = await Quiz.findOne({_id:{$eq:req.body._id}})
    const correctAnswers = await answers.filter( x=>quiz.questions.find((question)=>(question._id == x._id && question.correctAnswer==x.answer) ? question :''))
    
    console.log(req.user)
    const saveResult = new Result({
        user_id:req.user._id,
        quiz_id:quiz._id,
        result:correctAnswers.length,
        maxResult:quiz.questions.length
    })
    const saveR = await saveResult.save()
    if(saveR)
    return res.send(`Your mark is ${correctAnswers.length}/${quiz.questions.length}`)
    
    res.send('Error while document writing')
    //write quiz result to database
})

module.exports = router