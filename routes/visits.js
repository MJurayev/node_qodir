const express = require('express')
const {Visit} = require('../models/Visitors.model')
const { makeError } = require('../utils/makeErrorResponse')
const router = express.Router()

router.get('/',async (req, res)=>{
    const visits =await Visit.find()
    return res.send(visits)
})

router.get('/:date', async (req, res)=>{
    const visits = await Visit.find({date:req.params.date})
    if(!visits)
        return res.send(makeError('Bu sanadagi yozuvlar topilmadi'))
    return res.send(visits)
})


module.exports = router