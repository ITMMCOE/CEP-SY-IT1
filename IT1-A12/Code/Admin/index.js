const exp=require("express");
const app=exp();
const port=3030;

const ejs=require("ejs");
const path=require("path");
const methodOvverride=require("method-override");
app.use(methodOvverride("_method"));
app.set('view engine','ejs');
app.use(exp.urlencoded({ extended: true })); 
app.set("views",path.join(__dirname,"views"));
app.use(exp.static(path.join(__dirname,"public")));
const ejsMate=require("ejs-mate");
const { default: mongoose } = require("mongoose");
app.engine("ejs",ejsMate);
let doctModel=require("./model/doctorSchema");
let Admin=require("./model/DoctorAdmin");
let User=require("./model/user_schema");
const { count } = require("console");
const DoctorModel = require("./model/doctorSchema");
const { use } = require("react");


app.listen(port,()=>{
    "Hey this is admin Portal..."
});

  async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/Doctor");
    }
    main().then(()=>{
        console.log("connected To Doctor");
    }).catch((err)=>{
        console.log(err);
    });


async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/DoctorAdmin");
    }
    main().then(()=>{
        console.log("connected");
    }).catch((err)=>{
        console.log(err);
    });

 

/*app.get("/Admin",async(req,res)=>{
    /*let doctInfo=await doctModel.find({});
    let user=await UserModel.find({});
    let doctCount=0,userCount=0;
   doctInfo.map(()=>doctCount++);
    user.map(()=>userCount++);
   console.log(doctCount,"  ",userCount);
    let inf='8';*/
    //res.render("Adminindex.ejs",{doctCount:doctCount,userCount:userCount});
   // res.send("hh");
//});*/

app.get("/Admin", async (req, res) => {
let info= await getAdminInfo();
//let doctorar=await doctModel.findById("68ed455c141a38a618cd5028");
let doctCount=await countnum(info.VerifiedDoc);
let patientCounnt=await countnum(info.patient);
 verifiedSetter(info);
 NotverifiedSetter(info);

 //let totalAppointments=await countnum(info.patient.appointment);
 //console.log(totalAppointments);
     await info.save();
      let g=[...info.VerifiedDoc,...info.notVerifiedDoc]
 console.log(g[0].Degree);
//console.log(info);
  // console.log(doctorar); 
 //await PatientSetter();
  res.render("Adminindex.ejs", { 
    doctCount: doctCount,
    userCount: patientCounnt,
    activeSection: 'dashboard',
    doctors:[...info.VerifiedDoc,...info.notVerifiedDoc],
    patient:info.patient,
  });
});


app.post("/Admin",async(req,res)=>{
  console.log(req.body);
  let info=await Admin.findById("68ebd62db97acc11cc8e9314").populate("notVerifiedDoc");

  let unverifiedDocs=info.notVerifiedDoc;
  
  let docToVerfy=unverifiedDocs.map((x)=>{
    if(x._id==req.body.doctorId){
      return x;
    }
  });
   delete docToVerfy[0].__v;
 
  const updatedDocts = await doctModel.create(docToVerfy[0]);
   


   //upading Verified[];
     info.VerifiedDoc.push(req.body.doctorId);

    
    //updating notVerified 
   info.notVerifiedDoc=info.notVerifiedDoc.filter((x)=>{
  
   if(x._id.toString() !== req.body.doctorId){
    return x;
   }
  });
    //console.log(info.notVerifiedDoc);
    //console.log(info.VerifiedDoc);
  await info.save();


 console.log("Operation done...")
res.redirect("/Admin");
});


app.get("/Admin/:section", async (req, res) => {
  res.render("Adminindex.ejs", { 
    doctCount: 15,
    userCount: 42,
    activeSection: req.params.section
  });
});

//Deleting User
app.delete("/Admin/patient/:patientId",async(req,res)=>{
  let userId=req.params.patientId;

  let info=await Admin.findById("68ebd62db97acc11cc8e9314");
  let newpatient=info.patient.filter((x)=>{
    if(x._id!=userId){
      return x;
    }
  });
  info.patient=newpatient;
  await info.save();
  await User.findByIdAndDelete(userId);
  
  res.redirect("/Admin");
});


//Deleting Doctor
//Deleting Doctor
//Deleting Doctor
app.delete("/Admin/doctor/:doctorId", async(req, res) => {
  try {
    const doctorId = req.params.doctorId;

    // Use $pull to directly remove the ObjectId from both arrays
    await Admin.findByIdAndUpdate(
      "68ebd62db97acc11cc8e9314",
      {
        $pull: {
          notVerifiedDoc: doctorId,
          VerifiedDoc: doctorId
        }
      }
    );

    // Delete the doctor from the Doctor collection
    await doctModel.findByIdAndDelete(doctorId);

    console.log("Doctor deleted successfully");
    res.redirect("/Admin");

  } catch (err) {
    console.error("Error deleting doctor:", err);
    res.status(500).send("Internal Server Error");
  }
});




let getAdminInfo=async()=>{
let info=await Admin.findById("68ebd62db97acc11cc8e9314")
  .populate("VerifiedDoc")
  .populate("notVerifiedDoc")
  .populate("patient");

  return info;
}




let countnum=async(arr)=>{
  let countt=0;
 arr.map(()=>countt++);
 console.log(countt);
 return countt;
}

let NotverifiedSetter=async(info)=>{
  info.notVerifiedDoc.map((ele)=>{
      ele.status="Not Verified";
    });
    
}


let verifiedSetter=async(info)=>{
  info.VerifiedDoc.map((ele)=>{
      ele.status="Verified";
    });

}

let remov_V=(data)=>{
if(data){
  const finalarr=data.map((x)=>{
  const {__v,...rest}=x;
  return rest;
  });
  return finalarr;
}

return [];
}


let PatientSetter=async()=>{

  const dummyUsers = [
  {
    username: "alice_wonder",
    email: "alice@example.com",
    phoneNo: 1234567890,
    age: 28,
    appointment: {
      Sheduled: [],
      visited: []
    }
  },
  {
    username: "bob_builder",
    email: "bob@example.com",
    phoneNo: 2345678901,
    age: 35,
    appointment: {
      Sheduled: [],
      visited: []
    }
  },
  {
    username: "charlie_delta",
    email: "charlie@example.com",
    phoneNo: 3456789012,
    age: 30,
    appointment: {
      Sheduled: [],
      visited: []
    }
  },
  {
    username: "daisy_river",
    email: "daisy@example.com",
    phoneNo: 4567890123,
    age: 26,
    appointment: {
      Sheduled: [],
      visited: []
    }
  },
  {
    username: "eddie_rock",
    email: "eddie@example.com",
    phoneNo: 5678901234,
    age: 40,
    appointment: {
      Sheduled: [],
      visited: []
    }
  },
  {
    username: "fiona_glow",
    email: "fiona@example.com",
    phoneNo: 6789012345,
    age: 22,
    appointment: {
      Sheduled: [],
      visited: []
    }
  },
  {
    username: "george_bliss",
    email: "george@example.com",
    phoneNo: 7890123456,
    age: 31,
    appointment: {
      Sheduled: [],
      visited: []
    }
  }
];
const createdUsers = await User.insertMany(dummyUsers);

let info=await Admin.findById("68ebd62db97acc11cc8e9314")
  .populate("VerifiedDoc")
  .populate("notVerifiedDoc")
  .populate("patient");
   info.patient = createdUsers.map(user => user._id);
  await info.save();
  console.log(info.patient);
}