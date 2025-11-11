
const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const passportLocalMongose=require("passport-local-mongoose");

const CredentialsSchema=new  Schema({

    email:{
        type:String,
        required:true,
        
    }

})
CredentialsSchema.plugin(passportLocalMongose);

const CredentialsModel=mongoose.model("Credentials",CredentialsSchema);
module.exports=CredentialsModel;
