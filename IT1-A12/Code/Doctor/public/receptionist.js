// --- Load default dashboard on page load ---
window.addEventListener('DOMContentLoaded', () => {
  loadPage(null, 'dashboard');
  // Set first link as active on load
  document.querySelector('.sidebar a').classList.add('active');
});


function getDay(date){
  
 let f= new Date(date);
return days[f.getDay()];
}


function getInfo(){
let info={};
weekDays.forEach((days) => {
  info[days] = {};  // Creates info.Monday, info.Tuesday, etc.
   
  //creating timeslots

   slots.forEach((slot)=>{
    info[days][slot]=[];
   });
 
});

//inserting Patients

AllappointmentInfo.forEach((patient)=>{
 let patientSlot=patient.slot;
 let Day=getDay(patient.date);
 info[Day][patientSlot].push(patient.patientName);

 
});
//console.log(info.Saturday["9:00 - 10:00"]);
 console.log(info);
return info;
}

//dummy info
const appointments =getInfo();


console.log(weekDays);
// ====== MAIN ROUTER ======
function loadPage(e, page) {
  const content = document.getElementById('content');
  const links = document.querySelectorAll('.sidebar a');
  links.forEach(l => l.classList.remove('active'));
  if (e) e.target.classList.add('active');

  // Route to appropriate handler
  switch (page) {
    case 'dashboard':
      renderDashboard(content);
      break;
    case 'appointments':
      renderAppointmentsPage(content);
      break;
    case 'book':
      renderBookingForm(content);
      break;
  
  }
}


//sample data


// ====== DASHBOARD ROUTE ======
async function renderDashboard(container) {
  try {
   
    
    container.innerHTML = `
      <h2>Receptionist Dashboard</h2>
      <div class="cards">
        <div class="card"><h3>Total Appointments</h3><br><p>${doctorinfo.MyAppointmnets.walkin.length + doctorinfo.MyAppointmnets.onlineBooked.length}</p></div>
        <div class="card"><h3>Online Booked patients</h3><p>${doctorinfo.MyAppointmnets.onlineBooked.length}</p></div>
        <div class="card"><h3>Walk-In Patients</h3><br><p>${doctorinfo.MyAppointmnets.walkin.length}</p></div>
      </div>
    `;
  } catch (err) {
    console.error(err);
    container.innerHTML = `
      <h2>Receptionist Dashboard</h2>
      <div class="cards">
        <div class="card"><h3>Total Appointments</h3><p>0</p></div>
        <div class="card"><h3>Online Booked patients</h3><p>0</p></div>
        <div class="card"><h3>Walk-In Patients</h3><p>0</p></div>
      </div>
    `;
  }
}

 // WEEKLY SLOT-VIEW APPOINTMENT SYSTEM
;



// Initialize empty structure
/*weekDays.forEach(day => {
  appointments[day] = {};
  slots.forEach(slot => (appointments[day][slot] = []));
});*/

// ====== APPOINTMENTS ROUTE ======
async function renderAppointmentsPage(container) {
  try {
   
  } catch (err) {
    console.error("Failed to load appointments:", err);
  }
  
  let tabs = `
    <div class="tabs">
      ${weekDays.map((d, i) => `<button class="button small" id="tab-${d}" onclick="showDay('${d}')">${d}</button>`).join("")}
    </div>
    <div id="appointmentsTable"></div>
  `;
  container.innerHTML = `<h2>Weekly Appointments</h2>${tabs}`;
  showDay(weekDays[0]);
  document.getElementById(`tab-${weekDays[0]}`).classList.add("active");
}

function showDay(day) {
  document.querySelectorAll(".tabs button").forEach(btn => btn.classList.remove("active"));
  document.getElementById(`tab-${day}`).classList.add("active");

  const tableDiv = document.getElementById("appointmentsTable");
  let html = `
    <h3>${day}</h3>
    <table>
      <thead>
        <tr>
          <th>Time Slot</th>
          <th>Patients</th>
          <th>Density</th>
        </tr>
      </thead>
      <tbody>
  `;
 console.log(day);
  slots.forEach(slot => {
    const count = appointments[day][slot].length;
    let densityClass = "empty";
    if (count >= 6 && count < 10) densityClass = "medium";
    else if (count >=10 ) densityClass = "full";
  
    html += `
      <tr>
        <td>${slot}</td>
        <td>${appointments[day][slot].join(", ") || "—"}</td>
        <td>
          <div class="slot-density">
            <div class="${densityClass}" style="width:${Math.min(count * 15, 100)}%"></div>
          </div>
        </td>
      </tr>
    `;
  });

  html += "</tbody></table>";
  tableDiv.innerHTML = html;
}

// ====== BOOKING ROUTE ======
function renderBookingForm(container) {
  container.innerHTML = `
    <h2>Add New Appointment</h2>
    <form id="bookingForm" action="/find/${doctorId}/receptionist" method="post">
      <label>Patient Name</label>
      <input type="text" id="patientName" name="name" required>
      
      <label for="dateInput">Date</label>
     <input type="date" name="date" required id="dateInput">

     
       
      <label>Time Slot</label>
      <select id="slotSelect" name="slot" required>
        ${slots.map(s => `<option value="${s}">${s}</option>`).join("")}
      </select>

      <button type="submit" " class="button">Add Appointment</button>
    </form>
  `;

  document.getElementById("bookingForm").onsubmit = async (e) => {
    e.preventDefault();
    const name = document.getElementById("patientName").value.trim();
    
    const slot = document.getElementById("slotSelect").value;

    if (!name) return alert("Please enter patient name.");
     alert(`Pateint appointment has booked successfully on ${name} at slot ${slot}...`);
    document.getElementById("bookingForm").submit();
  };
}

//dates upto 30 days next
   const dateInput = document.getElementById('dateInput');
        const today = new Date();
        
        // Set min to today, max to 1 month from today
        const nextMonth = new Date(today);
        nextMonth.setDate(nextMonth.getDate() + 30);
        
        dateInput.min = today.toISOString().split('T')[0];
        dateInput.max = nextMonth.toISOString().split('T')[0];



   

// ====== HELPER FUNCTIONS ======


async function contactPatient(patientInfo) {
  try {
    alert(`
      PATIENT INFORMATION:-
          Name:- ${patientInfo.patientName}
      Date:- ${patientInfo.date}
      Slot:- ${patientInfo.slot}
      Phone Number:- ${patientInfo.phoneNo || 'N/A'}
    `);

  } catch (err) {
    console.error(err);
    alert(`Contacting ${patientInfo}...`);
  }
}