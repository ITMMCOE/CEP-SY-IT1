//const { required } = require("joi");
const mongoose=require("mongoose");
//const { max, type } = require("../schema(joy)");
const Schema=mongoose.Schema;
ReviewSchema= new Schema(
    {
    Comment:{
        type:String,
        required:true,
         },
     rating:{
        type:Number,
        default:3,
        min:1,
        max:5,
     },   
     CreatedAt:{
        type:Date,
        default:Date.now(),
     },
      author :{
      type: Schema.Types.ObjectId,
      ref:"User",//ref:Schema Name
     } ,
});
Review=mongoose.model("Review",ReviewSchema)
module.exports=Review;
