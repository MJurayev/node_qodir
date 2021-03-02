const { number, string } = require("joi");
const Joi = require("joi");
const mongoose = require("mongoose");
posterSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        minlength:4,
        maxlength:2048
    },
    description:{
        type:String,
    },
    imagepath:{
        type:String
    },
    filename:{
        type: String,
        required:true,
        minlength:12,
    },
    filepath:{
        type:String,
        minlength:10,
        required:true
    },
    created_at:{type:Date,default:Date.now },
    updated_at:{type:Date, default:Date.now}
});

function validatePoster(poster){
    const schema = Joi.object(
        {
            name:Joi.string(),
            // bookFileName:Joi.string(),
            // bookFilePath:Joi.string(),
            description:Joi.string(),
            created_at:Joi.date(),
            updated_at:Joi.date()
        }
    );
        return schema.validate(poster);
}

const Poster = mongoose.model("Posters", posterSchema);
exports.Poster = Poster;
exports.validatorPoster = validatePoster;