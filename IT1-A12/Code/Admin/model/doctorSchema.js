const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const Credentials=require("./authenticate");
const Review=require("./reviewSchema");
const { required, types, string } = require('joi');
const Admin = require('./DoctorAdmin');
const doctorSchema=new Schema({

    name:{
         type:String,
       // required:true,
    },
    
    password:{
         type:String,
       // required:true,
    },
   
    email:{
         type:String,
        //required:true,
    },
    rating:{
         type:Number,
        
    },
    Experience:{
         type:String,
       // required:true,
    },
    fees:{
        type:Number,
       //required:true,

    },
    
    aboutMe:{
       type:String,
    },
    phoneNumber:{
        type:Number,
       // required:true
    },
    availAppoint:{
        
    },
    clinicName:{
        type:String,
       // required:true,
    },
    
    clinicCord:{
        lon:{
            type:Number

        },
        lat:{
          type:Number
        }
    },
    Speciality:{
        type:String,
        //required:true,
    },
    practice_Size:{
        type:Number,
        //required:true
    }
    ,
    qualification:{
        type:String,

    },
    address:{
        type:String,
        //required:true,
    }
    ,
    website:{
      type:String,
    },

   /* opendays:{
        startDay:{
            type:String,
       
           
        },
        endDay:{
           type:String,
        
        }

    },*/
  
    schedule:[
     {

       day:{type:String},
      timeSlots:[
        {
        startTime:{type:String},
        endTime:{type:String},
        }

      ]
    } 
    ]
  
    

    ,
   Reviews:[
      {
      type: Schema.Types.ObjectId,
      ref:"Review",//from review model Id is gona come
      },
     ], 
   status:String,
});

const DoctorModel=mongoose.model("DoctorSchema",doctorSchema);
module.exports=DoctorModel;



/*
{
  firstname: 'Atharva',
  lastname: 'Desai',
  practicename: 'hh',
  qualification: 'hjh',
  Experience: 'uu',
  specialty: 'Psychiatry & Mental Health',
  size: '6',
  fees: '88',
  compAdd: 'B1/1 Shivtara garden Society, Near Gananjay society Kothrud, pune',
  lat: '18.5014804',
  lon: '73.8060649',
  startDay: 'Tue',
  endDay: 'Tue',
  startTime: '04:09',
  endTime: '03:09',
  aboutMe: 'hj'
}*/
