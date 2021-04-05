const Joi = require("joi");
const mongoose = require("mongoose");
slideSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        minlength:4,
        maxlength:2048
    },
    filename:{
        type: String,
        required:true,
        minlength:12,
        maxlength:2048
    },
    imagepath:{
        type:String,
        required:true
    },
    filepath:{
        type:String,
        minlength:10,
        required:true
    },
    author:{
        type:String,
        required:false,
        default:""
    },
    created_at:{
        type:Date,
        default:Date.now 
        },
    updated_at:{
        type:Date, 
        default:Date.now
    }
});

function validateSlide   (slide){
    const schema = Joi.object(
        {
            name:Joi.string(),
            created_at:Joi.date(),
            updated_at:Joi.date(),
            author:Joi.string() 
        }
    );
        return schema.validate(slide);
}

const Slide = mongoose.model("Slides", slideSchema);
exports.Slide = Slide;
exports.validateSlide = validateSlide;