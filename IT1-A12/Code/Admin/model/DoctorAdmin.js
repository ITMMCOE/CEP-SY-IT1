const mongoose=require('mongoose');
const DoctorSchema=require("./doctorSchema");
const { ref } = require('joi');
const Schema=mongoose.Schema;

const DoctorAdmin=new Schema({
    VerifiedDoc:[
        {
            type:Schema.Types.ObjectId,
            ref:"DoctorSchema",
            
        },   
    ],
     notVerifiedDoc:[
        {
            type:Schema.Types.ObjectId,
            ref:"DoctorSchema",
        }   
    ],
    patient:[
        {
            type:Schema.Types.ObjectId,
            ref:"User"
        }
    ]
});

const Admin= mongoose.model("Admin",DoctorAdmin);
module.exports=Admin;
/*
68ebb0a2bade66f2336456c9
68ebb0a2bade66f2336456c8
68ebb0a2bade66f2336456c7*/