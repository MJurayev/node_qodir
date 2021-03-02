const Joi = require("joi");
const mongoose = require("mongoose");
bookSchema = new mongoose.Schema({
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
        minlength:4
    },
    category:{
        type:String, 
        minlength:4
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

function validateBook(book){
    const schema = Joi.object(
        {
            name:Joi.string(),
            created_at:Joi.date(),
            updated_at:Joi.date(),
            // imagepath:Joi.string().required(),
            author:Joi.string(),
            category:Joi.string()
        }
    );
        return schema.validate(book);
}

const Book = mongoose.model("Books", bookSchema);
exports.Book = Book;
exports.validatorBook = validateBook;