const { User } = require('../models/User.model');
const { Visit } = require('../models/Visitors.model')
const express = require('express');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const router = express.Router();
const _ = require('lodash');

router.post('/', async (req, res) => {
    const { error } = validate(req.body);
    if (error)
        return res.status(400).send(error.details[0].message);

    let user = await User.findOne({ payload: req.body.payload, isVerified:true });
    if (!user)
        return res.status(400).send('Email yoki telefon raqam noto\'g\'ri');

    const isValidPassword = await bcrypt.compare(req.body.password, user.password);
    if (!isValidPassword)
        return res.status(400).send(' yoki parol noto\'g\'ri');

    const token = user.generateAuthToken();
    const date = new Date()
    const visitor = new Visit({date:`${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`, user_id:user._id})
    await visitor.save()
    return res.status(200).header('x-auth-token', token).send(JSON.stringify({"_token":token}));
});

function validate(req) {
    console.log(req)
    const schema = Joi.object({
        authType:Joi.string().required(),

        payload:req.authType =='email' ? Joi.string()
                .max(255)
                .min(5)
                .email({minDomainSegments:2}) : Joi.string().min(5).max(255).required(),
        password: Joi.string().min(5).max(255).required(),
        login:Joi.string().required()
    });
    return schema.validate(req);
}

module.exports = router; 