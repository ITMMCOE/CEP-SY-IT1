const mongoose=require('mongoose');
const  Schema=mongoose.Schema;

const appoint=new Schema({
    doctorName:{
     type:String,
        required:true,
    },
    patientName:{
         type:String,
        required:true,
    },
    date:{
       type:String,
        required:true,
    },
    slot:{
        type:String,
        required:true,
    },
    phoneNo:{
        type:Number
    }
    ,
    BookedAt:{
        type:Date,
        default:Date.now(),
     },
   
});
Appoint=mongoose.model("Appoint",appoint);
module.exports=Appoint;