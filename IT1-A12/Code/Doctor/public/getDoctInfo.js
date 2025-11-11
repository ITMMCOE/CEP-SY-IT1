

let infoWindow;
let addressinp=document.querySelector("#compAdd");
const API_KEY = window.APP_CONFIG.googleMapsApiKey;
const locationButton=document.querySelector(".curLoc");
const form=document.querySelector("form");
//const input=document.querySelector("inp");





//current location
 function initMap() 
 {
  infoWindow = new google.maps.InfoWindow();
  locationButton.addEventListener("click", async() => {
    
    console.log(navigator.geolocation);
    if (navigator.geolocation) {
     navigator.geolocation.getCurrentPosition(

        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          infoWindow.setPosition(pos);
          infoWindow.setContent("Location found.");
           // console.log(pos);//coordinates
           //we are not seting lat and lng here  because what if after warde user change the address and not clicked on set curr location(Wrong coordinates will be pass) 
          // document.querySelector("#lat").value=pos.lat;
          // document.querySelector("#lng").value=pos.lng;
            SetAddress(pos.lat, pos.lng);

        },
        () => {
       
        },
      );
    } else {
      // Browser doesn't support Geolocation
      
    }
  });


  //getting address coordinates



  //reverse GEocoding
    let SetAddress=async(lat,lan)=>{
 try{
     const api=`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lan}&location_type=ROOFTOP&result_type=street_address&key=${API_KEY}`;
 const resp= await fetch(api);
  let info= await resp.json();
  let address=info.results[0].formatted_address;
   addressinp.value=`${address}`;
 }       
 catch(e){
  console.log("error encountered ",e);
 }

 }




 
 //geocoding  Beautifully done 
   geocoder = new google.maps.Geocoder();
  let issubmmited=false; 
form.addEventListener("submit",async(e)=>{

  /*if(document.querySelector("#lng").value !='' && document.querySelector("#lat").value !=''){
    return;//We already got coordinates, let the form go to server"
  }*/
   
 e.preventDefault();
 
  const p= await geocode({ address: addressinp.value });
  if(p){
     document.querySelector("#lat").value=p.latitude;
  document.querySelector("#lng").value=p.longitude;
    form.submit();
  }

  else{
    console.log('KUCH TO GADBAD HAI...');
  }
   
 
});


  async function geocode(request) {
  try {
    const result = await geocoder.geocode(request);
    const { results } = result;

    const latitude = results[0].geometry.location.lat();
    const longitude = results[0].geometry.location.lng();

    const pos = {
      latitude,
      longitude,
    };
  

    return pos;   // returns actual object, not undefined
  } catch (e) {
    console.log("reason for failure: " + e);
    return false;
  }
}

}






window.initMap = initMap;