
if(process.env.NODE_ENV !="production"){
     require("dotenv").config();
}

const GMapAPIkey = process.env.GOOGLE_CLOUD_API_KEY;

const exp = require("express");
const app = exp();
const port = 3000;
const info = require("./init/info");
const ejs = require("ejs");
const path = require("path");
const methodOverride = require("method-override");
const cors = require('cors');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const specialtyCategories=require("./init/speciality");
const multer  = require('multer');
const {storage}=require("./cloudConfig");
const upload = multer({ storage });



/*const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    
    cb(null, file.originname);
  }
});*/


// ==================== TWILIO SETUP ====================
const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE = process.env.TWILIO_PHONE_NUMBER;

const twilioClient = (TWILIO_SID && TWILIO_TOKEN && TWILIO_PHONE) 
    ? twilio(TWILIO_SID, TWILIO_TOKEN) 
    : null;

// In-memory OTP storage
const otpStore = {};

if (twilioClient) {
    console.log('✅ Twilio initialized');
} else {
    console.log('⚠️ Twilio disabled - missing credentials');
}
// ==================== END TWILIO SETUP ====================

app.use(methodOverride("_method"));
app.use(cors({
    origin: 'http://localhost:3000', // या आपका frontend URL
    credentials: true
}));
app.use(bodyParser.json());
app.use(exp.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "views"));
app.use(exp.static(path.join(__dirname, "public")));

const ejsMate = require("ejs-mate");
app.engine("ejs", ejsMate);

const doctModel = require("./model/doctorSchema");
const Admin = require("./model/DoctorAdmin");
const Review = require("./model/reviewSchema");
const User = require("./model/user_schema");
const appoint = require("./model/appointment");
const flash = require("connect-flash");
const session = require("express-session");
const localStrategy=require("passport-local");
const { default: mongoose } = require("mongoose");
const passport = require("passport");
const e = require("connect-flash");
const { redirect } = require("react-router-dom");
const { fail } = require("assert");
const {isDoctLoggedIn,isuserLoggedIn ,saveRedirectUrl}=require("./middleware");
app.use('/uploads', exp.static('uploads'));



let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const sessionOptions = {
    secret: 'majhasecretString',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: Date.now() + 6 * 24 * 60 * 60 * 1000,
        maxAge: 6 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
};

// ==================== DATABASE CONNECTION ====================
async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/Doctor");
}
main().then(() => {
    console.log("Connected to Doctor DB");
}).catch((err) => {
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

let emailNpass = [];

// ==================== CORRECT MIDDLEWARE ORDER ====================

// 1. SESSION FIRST
app.use(session(sessionOptions));

// 2. FLASH
app.use(flash());

// 3. PASSPORT INITIALIZATION
app.use(passport.initialize());
app.use(passport.session());

// 4. PASSPORT STRATEGIES
passport.use(
  'user-local',
  new localStrategy(
    { usernameField: 'email', passwordField: 'password' },
    User.authenticate()
  )
);

passport.use(
  'doctor-local',
  new localStrategy(
    { usernameField: 'email', passwordField: 'password' },
    doctModel.authenticate()
  )
);

// 5. UNIFIED SERIALIZATION
passport.serializeUser((user, done) => {
  let userType = 'User';
  
  if (user.phoneNumber !== undefined && user.clinicName !== undefined) {
    userType = 'Doctor';
  }
  
  console.log(`✅ Serializing ${userType}:`, user._id);
  
  done(null, { 
    id: user._id.toString(), 
    type: userType 
  });
});


passport.deserializeUser(async (data, done) => {
  try {
    let user = null;
    
    if (data.type === 'User') {
      user = await User.findById(data.id);
      console.log(`✅ Deserialized User:`, user?.username);
    } else if (data.type === 'Doctor') {
      user = await doctModel.findById(data.id);
      console.log(`✅ Deserialized Doctor:`, user?.name);
    }
    
    if (!user) {
      console.log(`❌ User not found: ${data.id}`);
      return done(null, false);
    }
    
    done(null, user);
  } catch (err) {
    console.error('❌ Deserialization error:', err);
    done(err, null);
  }
});



// 6. CUSTOM MIDDLEWARE (AFTER PASSPORT.SESSION)
app.use(async (req, res, next) => {
  try {
    res.locals.success = req.flash("success");
    res.locals.fail = req.flash("fail");
    res.locals.currUser = req.user;
    
    if (req.user) {
      // Check if it's a user (has phoneNo)
      if (req.user.phoneNo !== undefined) {
        res.locals.role = "user";
      }
      // Check if it's a doctor (has phoneNumber)
      else if (req.user.phoneNumber !== undefined) {
        res.locals.role = "doctor";
      } else {
        res.locals.role = null;
      }
      
      console.log(`✅ Logged in as ${res.locals.role}:`, req.user._id);
    } else {
      res.locals.currUser = null;
      res.locals.role = null;
    }

    next();
  } catch (err) {
    console.error("❌ Error in middleware:", err);
    res.locals.currUser = null;
    res.locals.role = null;
    next();
  }
});

// ==================== OTP ROUTES ====================

// Send OTP
app.post("/send-otp", async (req, res) => {
    try {
        const { phone } = req.body;

        if (!phone || !phone.startsWith('+91') || phone.length !== 13) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid phone number format' 
            });
        }

        if (otpStore[phone] && Date.now() < otpStore[phone].expiresAt - 9 * 60 * 1000) {
            return res.status(400).json({ 
                success: false, 
                message: 'OTP already sent. Please wait before requesting again.' 
            });
        }

        const otp = Math.floor(1000 + Math.random() * 9000).toString();

        otpStore[phone] = {
            otp: otp,
            expiresAt: Date.now() + 10 * 60 * 1000,
            attempts: 0,
            verified: false
        };
      
        console.log(`📱 OTP for ${phone}: ${otp}`);

        if (twilioClient) {
            try {
                await twilioClient.messages.create({
                    body: `Your OTP is: ${otp}. Valid for 10 minutes. Do not share this OTP.`,
                    from: TWILIO_PHONE,
                    to: phone
                });
                console.log(`✅ SMS sent to ${phone}`);
            } catch (twilioError) {
                console.error('❌ Twilio Error:', twilioError.message);
            }
        }

        res.json({ 
            success: true, 
            message: 'OTP sent to ' + phone
        });

    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to send OTP' 
        });
    }
});

// Verify OTP
app.post("/verify-otp", (req, res) => {
    try {
        const { phone, otp } = req.body;

        if (!phone || !otp) {
            return res.status(400).json({ 
                success: false, 
                message: 'Phone and OTP required' 
            });
        }

        if (!otpStore[phone]) {
            return res.status(400).json({ 
                success: false, 
                message: 'OTP not sent. Please request OTP first.' 
            });
        }

        const storedData = otpStore[phone];

        if (Date.now() > storedData.expiresAt) {
            delete otpStore[phone];
            return res.status(400).json({ 
                success: false, 
                message: 'OTP expired. Request a new one.' 
            });
        }

        if (storedData.attempts >= 3) {
            delete otpStore[phone];
            return res.status(400).json({ 
                success: false, 
                message: 'Too many attempts. Request a new OTP.' 
            });
        }

        if (storedData.otp !== otp) {
            storedData.attempts++;
            return res.status(400).json({ 
                success: false, 
                message: `Invalid OTP. ${3 - storedData.attempts} attempts remaining.` 
            });
        }

        storedData.verified = true;

        res.json({ 
            success: true, 
            message: 'Phone verified successfully' 
        });

    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Verification failed' 
        });
    }
});

// ==================== MAIN ROUTES ====================



// Index route
app.get("/", async (req, res) => {

  await updateprevApp();
    res.render("main.ejs", { info });
});

app.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "You are logged out successfully!");
        res.redirect("/"); 
    });
});


app.get("/userAuth", async(req, res) => {

 
    res.render("userlogin.ejs");
});

app.post("/userAuth",saveRedirectUrl,passport.authenticate('user-local',{failureRedirect:"/userAuth",failureFlash:true}),
(req, res) => {
      
    req.flash("success",'Welcome to Medlink!...');
    res.redirect(res.locals.redirectUrl);
});

app.get("/compAuth", (req, res) => {
    res.render("compLogin.ejs");
});

app.post("/compAuth",saveRedirectUrl,passport.authenticate('doctor-local',{failureRedirect:"/compAuth",failureFlash:true}),(req, res) => {
     req.flash("success",'Welcome to Medlink!...');
     console.log(req.user);
    res.redirect('/');
});

// User Registration GET
app.get("/Userreg", async (req, res) => {
    res.render("register.ejs");
});

// User Registration POST
app.post("/Userreg", async (req, res) => {
    try {
        const { username, email, password, phoneNo, age } = req.body;
        const phone = '+91' + phoneNo;

        let existingUser = await User.findOne({ email: email });
        if (existingUser) {
            req.flash("fail", "Email already registered");
            return res.redirect("/Userreg");
        }

       existingUser = await User.findOne({ phoneNo: phoneNo });

        let newuser = new User({
            username: username,
            email: email,
            phoneNo: phoneNo,
            age: age,
            appointment: {
                Sheduled: [],
                visited: []
            }
        });

        let newlyAddedUser = await User.register(newuser,password);
         console.log(newlyAddedUser);
         delete newlyAddedUser.__v;

        let admin = await Admin.findById("68ebd62db97acc11cc8e9314");
        admin.patient.push(newlyAddedUser._id);
        await admin.save();

        delete otpStore[phone];

        if (twilioClient) {
            try {
                await twilioClient.messages.create({
                    body: `Welcome ${username}! You have been successfully registered. You can now login to your account.`,
                    from: TWILIO_PHONE,
                    to: phone
                });
                console.log(`✅ Welcome SMS sent to ${phone}`);
            } catch (twilioError) {
                console.error('❌ Welcome SMS failed:', twilioError.message);
            }
        }

          req.login(newlyAddedUser,(err,next)=>{
            if(err){
                next(err);
            }
            req.flash("success","Welcome to Medlink");
            return res.redirect("/");
        });

    } catch (err) {
        console.error(err);
        req.flash("fail", "Registration failed."+err);
        res.redirect("/Userreg");
    }
});

// Doctor Registration GET
app.get("/doctorreg", (req, res) => {
    emailNpass = [];
    res.render("doctreg.ejs");
});

// Doctor Registration POST
app.post("/doctorreg", (req, res) => {
    try {
        const { email, password, phoneNo } = req.body;
        const phone = '+91' + phoneNo;
        emailNpass=[email,password,phoneNo];

        if (!otpStore[phone] || !otpStore[phone].verified) {
            req.flash("fail", "Please verify your phone number with OTP first");
            return res.redirect("/doctorreg");
        }
        
        if (!email || !password || !phoneNo) {
            req.flash("fail", "All fields are required");
            return res.redirect("/doctorreg");
        }
        
        if (password.length < 6) {
            req.flash("fail", "Password must be at least 6 characters");
            return res.redirect("/doctorreg");
        }
        
        if (email && password && phoneNo) {
            emailNpass = [];
            emailNpass.push(email);
            emailNpass.push(password);
            emailNpass.push(phone);
        }
        
        delete otpStore[phone];
        
        req.flash("success", "Phone verified! Enter information about your clinic..");
        res.redirect("/CompInfo");
    } catch (e) {
        console.log(e);
        req.flash("fail", "PLEASE TRY AGAIN TO REGISTER");
        res.redirect("/doctorreg");
    }
});


//get Scheduele
app.get("/schedule",(req,res)=>{
    res.render("Schedule.ejs");
});

app.post("/schedule",(req,res)=>{
    console.log("hh",req.body);
    res.redirect("/schedule");
});



app.get("/CompInfo", (req, res) => {
           if(emailNpass.length===0){
           return res.redirect("/doctorreg");
           }
         console.log(emailNpass);
    res.render("getDoctInfo.ejs", { GMapAPIkey,specialtyCategories });
});

app.post("/CompInfo",upload.single('file'), async (req, res) => {
    try {
        let newInfo = req.body;
        
          if (!req.file) {
            return res.send("Please upload a file");
        }
       
        if (req.body.firstname && emailNpass!=[]) {
            let newComp = new doctModel({
                email: emailNpass[0],
                name: `${newInfo.firstname} ${newInfo.lastname}`,
                Experience: newInfo.Experience,
                fees: newInfo.fees,
                aboutMe: newInfo.aboutMe,
                phoneNumber: emailNpass[2],
                clinicName: newInfo.ClinicName,
                clinicCord: {
                    lon: newInfo.lon,
                    lat: newInfo.lat,
                },
                Speciality: newInfo.specialty,
                practice_Size: newInfo.size,
                qualification: newInfo.qualification,
                address: newInfo.compAdd,
                Degree:{
                    url:req.file.path,
                    filename:req.file.filename,
                }
            });
            
            let newDoc = await doctModel.register(newComp,emailNpass[1]);
              delete  newComp.__v;
     
            let info = await Admin.findById("68ebd62db97acc11cc8e9314").populate("notVerifiedDoc");
            let notverdocs = info.notVerifiedDoc;

            notverdocs.push(newDoc._id);
            await info.save();
             emailNpass=[];

          req.login(newDoc,(err,next)=>{
            if(err){
                next(err);
            }
           req.flash("success", "YOU HAVE BEEN REGISTERED SUCCESSFULLY!...IT TAKES 3-4 DAYS TO INITIALISE YOUR ACCOUNT");
            return res.redirect("/");
        });
    
       }
    } catch (e) {
        console.log("ERROR:-", e);
        req.flash("fail",e )
        res.redirect("/CompInfo");
    }
});

app.get("/help", (req, res) => {
    res.render("help.ejs");
});

app.get("/find", async (req, res) => {
    let doctInfoall = await doctModel.find({});
    let verfiedDocs = await Admin.findById("68ebd62db97acc11cc8e9314")
        .populate("VerifiedDoc")
        .populate("notVerifiedDoc")
        .populate("patient");
    let arr = verfiedDocs.VerifiedDoc;

    const doctInfo = arr.filter(d1 =>
        doctInfoall.some(d2 =>
            d1.name === d2.name &&
            d1.email === d2.email
        )
    );

    roundoff(doctInfo);
    res.render("findDoctor.ejs", { doctInfo,specialtyCategories });
});

app.post("/find", async (req, res) => {
    try {
        let doctInfo;
        let { Speciality, Experience, rating, doctName } = req.body;

        if (doctName != '') {
            doctInfo = await doctModel.find({ name: { $eq: doctName } });
            roundoff(doctInfo);
        } else if (Speciality != 'Specialty' && doctName == '') {
            doctInfo = await doctModel.find({ Speciality: { $eq: Speciality } });
            roundoff(doctInfo);
        } else if (Experience != 'Experience' && doctName == '' && Speciality == 'Specialty') {
            let expYrslowerLimit = parseInt(Experience);
            let expYrsUppLimit = parseInt(Experience) == 10 ? Infinity : parseInt(Experience) + 5;
            doctInfo = await doctModel.find({});
            doctInfo = doctInfo.filter((p) => {
                let doctExp = parseInt(p.Experience);
                return doctExp >= expYrslowerLimit && doctExp <= expYrsUppLimit;
            });
            roundoff(doctInfo);
        } else if (rating != 'Sort by Rating' && Speciality == 'Specialty' && doctName == '' && Experience == 'Experience') {
            let doctInfo = await doctModel.find({});
            roundoff(doctInfo);
            doctInfo.forEach((ele) => {
                if (ele.rating < parseInt(rating)) {
                    doctInfo.splice(doctInfo.indexOf(ele), 1);
                }
            });
            res.render("findDoctor.ejs", { doctInfo });
        } else {
            doctInfo = await doctModel.find({});
            roundoff(doctInfo);
        }

        res.render("findDoctor.ejs", { doctInfo,specialtyCategories });
    } catch (err) {
        console.log(err);
        req.flash("fail", "Fail to apply filter...:(");
        res.redirect("/find");
    }
});

app.get("/notify", isuserLoggedIn,async(req, res) => {
    let user=await User.findById(req.user._id)
    .populate({
        path:"appointment",
        populate:{
            path:"Sheduled",
        }
    });
     let uppcomingSched=user.appointment.Sheduled;
     
    for (let ap of uppcomingSched) {
      let doctinfo=await doctModel.findOne({name: `${ap.doctorName}`});
      ap.fees=doctinfo.fees;
      ap.speciality=doctinfo.Speciality;
      
      
     };

      console.log(uppcomingSched);
    res.render("notification.ejs",{uppcomingSched});
});


app.get("/doctProfile",isDoctLoggedIn,async(req,res)=>{
   
   try{ 
   
     let info = await doctModel.findById(res.locals.currUser._id).populate({
        path: 'Reviews',
        populate: {
            path: "author",
        }
    });

    let reviews = info.Reviews;
    info.website = "Xyz.com";

    let sumofrating = 0;
    let totalreviews = reviews.length;
    reviews.map((x) => { sumofrating += x.rating });
    info.rating = (sumofrating / totalreviews).toFixed(1);
    await info.save;

    res.render("DoctorProfile.ejs", { info, GMapAPIkey, reviews });
}
catch(err){
    console.log(err);
    res.send(err)
} 
   
});

app.get("/userProfile",isuserLoggedIn, async (req, res) => {

   /* let userinfo = await User.findById(res.locals.currUser._id).populate({
       path: "appointment",
       populate:{
        path:"Sheduled",
       }
    });*/

    
    let userinfo = await User.findById(res.locals.currUser._id)
    .populate("appointment.Sheduled")
    .populate("appointment.visited");
    
  

    let { username, age, phoneNo, email } = userinfo;
  
    let SchedulappointmentInfos=userinfo.appointment.Sheduled;
    let visitedappointInfos=userinfo.appointment.visited;
    
    for (const x of visitedappointInfos) {
  let doctInfo = await doctModel.findOne({ name: x.doctorName });
  if (!doctInfo) {
    console.warn(`Doctor not found for ${x.doctorName}`);
    x.doctorId="68f08f7cefd43844fc2b538b";
    continue; 
  }
  console.log(doctInfo._id);
  x.doctorId = doctInfo._id;
}


    /*let newAppoint=new appoint({
          
    doctorName: "Dr. Aditi Sharma",
    patientName: "Ravi Kumar",
    date: "2025-10-28",
    slot: "09:00 AM - 09:30 AM",
    phoneNo: 9876543210,
    BookedAt: new Date("2025-10-26T09:15:00Z")

    });
    let newlyVisitAppoint=await appoint.insertOne(newAppoint);
    userinfo.appointment.visited.push(newlyVisitAppoint._id);
    await userinfo.save();*/
    console.log(visitedappointInfos);

    
    res.render("userProfile.ejs", { username, age, phoneNo, email,visitedappointInfos,SchedulappointmentInfos });
});

app.post("/userProfile",async(req,res)=>{
   let { appointId }= req.body;
   let appointt=await appoint.findById(appointId);

   let userinfo=await User.findById(req.user._id);
   
   let ScheduledApp=userinfo.appointment.Sheduled;
   userinfo.appointment.Sheduled=ScheduledApp.filter((x)=>{
    if(x!=appointId){
        return x;
    }
   });
   

   await userinfo.save();
   await appoint.findOneAndDelete(appointt) ; 
 res.redirect(`/userProfile`);

});


app.put('/userprofile',isuserLoggedIn ,async (req, res) => {
    try {
        const { username, phoneNo, age } = req.body;
    
        let updatedInfo = await User.findByIdAndUpdate(res.locals.currUser._id, {
            username: username,
            phoneNo: phoneNo,
            age: age,
        }, { new: true });
       
        req.flash("success", "Info updated...");
        res.redirect("/userProfile");
    } catch (err) {
        console.log(err);
        req.flash("fail", 'Error to Update:-' + err);
        res.redirect("/userProfile");
    }
});

app.get("/find/:id", async (req, res) => {
    let info = await doctModel.findById(req.params.id).populate({
        path: 'Reviews',
        populate: {
            path: "author",
        }
    });
    let reviews = info.Reviews;
    info.website = "Xyz.com";

    let sumofrating = 0;
    let totalreviews = reviews.length;
    reviews.map((x) => { sumofrating += x.rating });
    info.rating = (sumofrating / totalreviews).toFixed(1);
    
    await info.save();
    
    res.render("DoctorProfile.ejs", { info, GMapAPIkey, reviews });
});

app.put("/find/:id", async (req, res) => {
    let { clinicName, address, fees, lon, lat, website, aboutMe } = req.body;
    try {
        let doctInfo = await doctModel.findByIdAndUpdate(req.params.id, {
            clinicName: clinicName,
            fees: fees,
            address: address,
            clinicCord: {
                lon: lon,
                lat: lat,
            },
            website: website,
            aboutMe: aboutMe,
        }, { new: true });
        console.log("Info updated");
        req.flash("success", "Information updates successfully!..");

        let adminInfo = await Admin.findById("68ebd62db97acc11cc8e9314");

        adminInfo.VerifiedDoc = adminInfo.VerifiedDoc.map((x) => {
            if (x._id.toString() === req.params.id) {
                delete doctInfo.__v;
                return doctInfo._id;
            }
            return x._id;
        });

        await adminInfo.save();

    } catch (e) {
        console.log("error has occurred..." + e);
        req.flash("fail", "Unable to edit your Data!..");
    }

    res.redirect(`/find/${req.params.id}`);
});

app.post("/find/:id", async (req, res) => {
    console.log(req.body);
    let DummyUserid = '68ef8b57054bee42b0500507';
    let newReview = new Review({
        Comment: req.body.comment,
        rating: req.body.rating,
        author: DummyUserid,
    });

    let reviewAdded = await Review.insertOne(newReview);
    console.log(reviewAdded);
    let doctor = await doctModel.findById(req.params.id);
    console.log(doctor);
    doctor.Reviews.push(reviewAdded._id);
    await doctor.save();

    req.flash("success", "Your Review added successfully..");
    res.redirect(`/find/${req.params.id}`);
});

app.post("/find/:id/book",isuserLoggedIn ,async (req, res) => {
    res.redirect(`/find/${req.params.id}/book`);
});

app.get("/find/:id/book",isuserLoggedIn,async (req, res) => {
    const slots = [
        "9:00 - 10:00",
        "10:00 - 11:00",
        "11:00 - 12:00",
        "12:00 - 1:00",
        "2:00 - 3:00",
        "3:00 - 4:00",
        "4:00 - 5:00"
    ];
    let info = await doctModel.findById(req.params.id);
    let id = req.params.id;
    let { fees, name, Speciality } = info;
    res.render("ConfNPay.ejs", { fees, name, Speciality, id, slots, days });
});

app.post("/find/:id/book/pay", async (req, res) => {
    try {
        let doctorId = req.params.id;

     
   let userinfo=await User.findById(res.locals.currUser._id);
        let doctinfo = await doctModel.findById(doctorId);
        let { patientName, phoneNo, date, slot } = req.body;
 
        const inputDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        inputDate.setHours(0, 0, 0, 0);
        
        if (inputDate < today) {
            req.flash("fail", "Cannot book appointment for past dates!");
            return res.redirect(`/find/${req.params.id}/book`);
        }



        let newAppoint = new appoint({
            doctorName: doctinfo.name,
            patientName: patientName,
            date: date,
            slot: slot,
            phoneNo: phoneNo,
        });

        let newSavedapp = await newAppoint.save();
        delete newSavedapp.__v;

        doctinfo.MyAppointmnets.onlineBooked.push(newSavedapp._id);
        await doctinfo.save();

        userinfo.appointment.Sheduled.push(newSavedapp._id);
          
       await userinfo.save();
    

        if (phoneNo) {
            const formattedDate = new Date(date).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });

            setTimeout(async () => {
                try {
                    if (twilioClient) {
                        await twilioClient.messages.create({
                            body: `Hi ${patientName}, your appointment with ${doctinfo.name} is confirmed on ${formattedDate} at ${slot}.`,
                            from: TWILIO_PHONE,
                            to: phoneNo.startsWith('+91') ? phoneNo : '+91' + phoneNo
                        });
                        console.log(`✅ SMS sent to ${phoneNo}`);
                    }
                } catch (err) {
                    console.error('❌ SMS failed (non-blocking):', err.message);
                }
            }, 0);
        }

        req.flash("success", "Appointment booked successfully! SMS confirmation sent.");
        res.redirect(`/find/${doctorId}`);

    } catch (err) {
        req.flash("fail", "Failed to book appointment, please try again...");
        console.error(err);
        res.redirect(`/find/${req.params.id}`);
    }
});

app.get("/find/:id/receptionist", isDoctLoggedIn,async (req, res) => {
    try {
        const doctorId = req.params.id;
        let doctorinfo = await doctModel.findById(doctorId)
            .populate("MyAppointmnets.onlineBooked")
            .populate("MyAppointmnets.walkin")
            .populate("Reviews");
     console.log(doctorId);
        const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const slots = [
            "9:00 - 10:00",
            "10:00 - 11:00",
            "11:00 - 12:00",
            "12:00 - 1:00",
            "2:00 - 3:00",
            "3:00 - 4:00",
            "4:00 - 5:00"
        ];
        let AllappointmentInfo = [...doctorinfo.MyAppointmnets.onlineBooked, ...doctorinfo.MyAppointmnets.walkin];
        let onlineBookedApp = doctorinfo.MyAppointmnets.onlineBooked;

        res.render("receptionist.ejs", { doctorId, doctorinfo, weekDays, slots, AllappointmentInfo, days, onlineBookedApp });
    } catch (err) {
        console.error(err);
    }
});

app.post("/find/:doctorId/receptionist",isDoctLoggedIn ,async (req, res) => {
    try {
        const doctorId = req.params.doctorId;
        console.log(req.body);
        let doctorinfo = await doctModel.findById(doctorId);

        let walkInPatients = new appoint({
            doctorName: doctorinfo.name,
            patientName: req.body.name,
            date: req.body.date,
            slot: req.body.slot,
        });
        let newpatient = await walkInPatients.save();
        delete newpatient.__v;
        doctorinfo.MyAppointmnets.walkin.push(newpatient._id);
        await doctorinfo.save();

        res.redirect(`/find/${doctorId}/receptionist`);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to add appointment" });
    }
});

app.get("/find/:id/map" ,async (req, res) => {
    let coord = await doctModel.findById(req.params.id);
    let { clinicCord } = coord;
    let lon = clinicCord.lon;
    let lat = clinicCord.lat;
    let id = req.params.id;
    res.render("showMap.ejs", { GMapAPIkey, lat, lon, id });
});

// ==================== HELPER FUNCTIONS ====================

let roundoff = (modeldata) => {
    modeldata.forEach((x) => {
        x.rating = Math.round(x.rating);
        if (x.rating < 0) {
            x.rating = 0;
        }
    });
};

let whoIsUser = async (currId) => {
  try {
    // Check if valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(currId)) {
      console.log("Invalid ObjectId");
      return null;
    }

    // Check in User collection
    let isUser = await User.findById(currId);
    if (isUser) {
      console.log("Found in User collection");
      return "user";
    }

    // Check in Doctor collection
    let isDoctor = await doctModel.findById(currId);
    if (isDoctor) {
      console.log("Found in Doctor collection");
      return "doctor";
    }

    // Not found in either collection
    console.log("ID not found in any collection");
    return null;

  } catch (error) {
    console.error("Error in whoIsUser:", error);
    return null;
  }
}


let defaultDeggSetter=async()=>{
 let alldoct=await doctModel.find({});
    alldoct.forEach(async(doc)=>{
        if(!doc.Degree.url && !doc.Degree.filename){
         doc.Degree.url ="https://sayingimages.com/wp-content/uploads/you-dont-remember-what-u-studied-graduation-meme.jpg",
         doc.Degree.filename="Degree";
         await doc.save();
    }
    });
  
   console.log(alldoct);

}

//updating
 
let updateprevApp=async()=>{
     let users=await User.find({});
 for (let user of users) {
  let sched = user.appointment.Sheduled || [];
  let visited = user.appointment.visited || [];

  for (let schApp of sched) {
    let appointm = await appoint.findById(schApp._id);

    if (!appointm) {
      
      continue;
    }
    let bookeddate = new Date(appointm.date);
    let todaysDate = new Date();

    if (bookeddate < todaysDate) {
      visited.push(schApp._id);
      sched = sched.filter(x => x._id.toString() !== schApp._id.toString());
      user.appointment.Sheduled = sched;
      user.appointment.visited = visited;
      await user.save();
    }
  }
}
}

// ==================== SERVER START ====================

app.listen(port, (req, res) => {
    console.log(`\n✅ Server running on http://localhost:${port}`);
    console.log(`📝 OTPs will be sent via Twilio SMS`);
    console.log(`📝 OTPs will also be logged to console for debugging\n`);
});


/*let addAdmin=async()=>{
  let newadmin=new Admin({
     VerifiedDoc:[],
         notVerifiedDoc:[],
        patient:[]
  });
 let newAdd= await Admin.insertOne(addAdmin);

 console.log(newAdd);   

}*/