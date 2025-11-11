const mongoose=require('mongoose');
const  Schema=mongoose.Schema;
const passportLocalMongoose=require("passport-local-mongoose");

const { required, types } = require('joi');
const UserSchema=new Schema({

    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
  
    
    phoneNo:{
        type:String,
        required:true
    },
    age:{
        type:Number,
        required:true,
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
     ],
     

}

});

UserSchema.plugin(passportLocalMongoose,{
      usernameField: 'email'
});
const User= mongoose.model("User",UserSchema);
module.exports=User;


