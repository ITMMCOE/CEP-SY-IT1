module.exports.isuserLoggedIn=(req,res,next)=>{  
     if(!req.isAuthenticated()){
      req.session.redirectUrl=req.originalUrl;
   req.flash("fail","Please login first ...");
    return res.redirect(`/userAuth`);
   }
   next();
}

module.exports.isDoctLoggedIn=(req,res,next)=>{  
     if(!req.isAuthenticated()){
      req.session.redirectUrl=req.originalUrl;
   req.flash("fail","Please login first ...");
    return res.redirect(`/compAuth`);
   }
   next();
}

module.exports.saveRedirectUrl=(req,res,next)=>{
  if(req.session.redirectUrl){
    res.locals.redirectUrl=req.session.redirectUrl;
  }
  else{
     res.locals.redirectUrl="/";
  }
  next();
}

module.exports.isScheduleSet=(req,res,next)=>{
   if(res.locals.role=="doctor" && req.user && !req.user.Degree.url){
      
   }
}