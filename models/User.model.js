const Joi = require("joi");
const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');
const config = require('config');
userSchema = new mongoose.Schema({
    login:{
        type:String,
        required:true,
        unique:true,
        maxlength:30,
        minlength:4
    },
    password:{
        type:String,
        required:true,
        minlength:4,
        maxlength:1024
    },
    authType:{
        type:String,
        minlength:4,
        maxlength:6
    },
    
    payload:{
        type:String,
        required:true,
        minlength:5,
        maxlength:255
    },
    isVerified:{
        type:Boolean,
        default:true
    },
    verifyCode:{
        type:String,
        default:null,
    },
    isAdmin:{
        type:Boolean, 
        default:false
    },
    created_at:{type:Date,default:Date.now },
    updated_at:{type:Date, default:Date.now}
});
userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ _id: this._id, isAdmin: this.isAdmin, login:this.login }, config.get('jwtPrivateKey'));
    return token;
  }
function validateUser(user){
    const schema = Joi.object(
        {
            login:Joi.string().alphanum().required().min(4).max(30),
            password:Joi.string().required().min(4).max(1024),
            authType:Joi.string().required(),
            payload:user.authType ==='email' ? Joi.string().required().min(5).max(255).email({minDomainSegments:2}) :Joi.string().required().min(5).max(14),
            isAdmin:Joi.boolean(),
            created_at:Joi.date(),
            isVerified:Joi.boolean(),
            updated_at:Joi.date()
        }
    );
        return schema.validate(user);
}

function generateCode(n){
    let s="", a=1;
    while(a<=n){
        s+=Math.floor((Math.random()*1000)%10).toString()
        a++
    }
    return s
}


const User = mongoose.model("User", userSchema);
// exports.transporter = transporter
exports.User = User;
exports.validator = validateUser
exports.generateCode = generateCode