const mongoose=require('mongoose');
const  Schema=mongoose.Schema;
const Appoint=require("./appointment");
const UserSchema=new Schema({

    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    phoneNo:{
        type:Number,
        required:true
    },
    age:{
        type:Number,
    }
    ,
    
    appointment:{
        Sheduled:[
             {
            type: Schema.Types.ObjectId,
            ref:"Appoint",
         }
     ],

     visited:[
             {
            type: Schema.Types.ObjectId,
              ref:"Appoint",
         }
     ]

}

});

const User= mongoose.model("User",UserSchema);
module.exports=User;


