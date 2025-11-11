// --- Load default dashboard on page load ---
window.addEventListener('DOMContentLoaded', () => {
  loadPage(null, 'dashboard');
  // Set first link as active on load
  document.querySelector('.sidebar a').classList.add('active');
});

// --- Function to load selected section dynamically ---
function loadPage(e, page) {
  // Prevent default behavior if event exists
  if (e) e.preventDefault();
  
  const content = document.getElementById('content');
  const links = document.querySelectorAll('.sidebar a');

  // Remove 'active' class from all links
  links.forEach(link => link.classList.remove('active'));

  // Add 'active' class to the clicked link (only if event exists)
  if (e && e.target) {
    e.target.classList.add('active');
  }

  // Load page content
  switch (page) {
    case 'dashboard':
      content.innerHTML = `
        <h2>Dashboard</h2>
        <div class="cards">
          <div class="card"><h3>Total Doctors</h3><p>${doctCount}</p></div>
          <div class="card"><h3>Total Patients</h3><p>${userCount}</p></div>
          
        </div>
      `;
      break;

    case 'doctors':
      let doctorRows = '';
      
      // Generate table rows dynamically from doctors array
      if (doctors && doctors.length > 0) {
        doctorRows = doctors.map(doctor => {
          const statusColor = doctor.status === 'Verified' ? '#28a745' : '#dc3545';
          
          return `
            <tr>
              <td>${doctor._id || 'N/A'}</td>
              <td>${doctor.name || 'N/A'}</td>
              <td>${doctor.Speciality|| 'N/A'}</td>
              <td style="background-color: ${statusColor}; color: white; font-weight: bold; text-align: center;">
                ${doctor.status|| 'Pending'}
              </td>
              <td>
                <button class="button small" onclick='showDoctorInfo(${JSON.stringify(doctor).replace(/'/g, "&apos;")})'>View Info</button>
                <button class="button small red" onclick='deleteDoctor("${doctor._id}")'>Delete</button>
              </td>
            </tr>
          `;
        }).join('');
      } else {
        doctorRows = '<tr><td colspan="5" style="text-align:center;">No doctors found</td></tr>';
      }

      content.innerHTML = `
        <h2>Manage Doctors</h2>
        <table>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Specialization</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
          ${doctorRows}
        </table>

        <!-- Modal for Doctor Info -->
        <div id="doctorModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:1000;">
          <div style="position:relative; top:50%; left:50%; transform:translate(-50%, -50%); background:white; padding:30px; border-radius:10px; max-width:500px; box-shadow:0 4px 6px rgba(0,0,0,0.3);">
            <h2 style="margin-top:0;">Doctor Information</h2>
            <div id="doctorInfoContent"></div>
            <button class="button" onclick="closeDoctorModal()" style="margin-top:20px;">Close</button>
          </div>
        </div>
      `;
      break;

    case 'patients':
      console.log('Patients data:', patients);
      
      let patientRows = '';
      
      // Generate table rows dynamically from patient array
      if (patients && patients.length > 0) {
        patientRows = patients.map(p => {
          // Get last appointment date if available
          const lastAppointment = (p.appointment && p.appointment.visited && p.appointment.visited.length > 0) 
            ? new Date(p.appointment.visited[p.appointment.visited.length - 1]).toLocaleDateString() 
            : 'No appointments yet';
          
          return `
            <tr>
              <td>${p._id || 'N/A'}</td>
              <td>${p.username || 'N/A'}</td>
              <td>${p.age || 'N/A'}</td>
              <td>${lastAppointment}</td>
              <td>
                <button class="button small" onclick='showPatientInfo(${JSON.stringify(p).replace(/'/g, "&apos;")})'>View Info</button>
                <button class="button small red" onclick='deletePatient("${p._id}")'>Delete</button>
              </td>
            </tr>
          `;
        }).join('');
      } else {
        patientRows = '<tr><td colspan="5" style="text-align:center;">No patients found</td></tr>';
      }
      
      content.innerHTML = `
        <h2>Manage Patients</h2>
        <table>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Age</th>
            <th>Last Appointment</th>
            <th>Actions</th>
          </tr>
          ${patientRows}
        </table>

        <!-- Modal for Patient Info -->
        <div id="patientModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:1000;">
          <div style="position:relative; top:50%; left:50%; transform:translate(-50%, -50%); background:white; padding:30px; border-radius:10px; max-width:500px; box-shadow:0 4px 6px rgba(0,0,0,0.3);">
            <h2 style="margin-top:0;">Patient Information</h2>
            <div id="patientInfoContent"></div>
            <button class="button" onclick="closePatientModal()" style="margin-top:20px;">Close</button>
          </div>
        </div>
      `;
      break;

    case 'appointments':
      content.innerHTML = `
        <h2>Appointments</h2>
        <table>
          <tr><th>ID</th><th>Doctor</th><th>Patient</th><th>Date</th><th>Status</th></tr>
          <tr><td>A201</td><td>Dr. Ramesh Kumar</td><td>Neha Sharma</td><td>2025-10-08</td><td>Completed</td></tr>
          <tr><td>A202</td><td>Dr. Sneha Iyer</td><td>Rahul Mehta</td><td>2025-10-09</td><td>Scheduled</td></tr>
          <tr><td>A203</td><td>Dr. Aman Gupta</td><td>Priya Das</td><td>2025-10-10</td><td>Pending</td></tr>
        </table>
      `;
      break;

    case 'transactions':
      content.innerHTML = `
        <h2>Handle Transactions</h2>
        <p>Manage payments and refunds below:</p>

        <table id="transactionTable">
          <tr><th>Transaction ID</th><th>User</th><th>Type</th><th>Amount</th><th>Status</th><th>Actions</th></tr>
          <tr>
            <td>T501</td><td>Neha Sharma</td><td>Payment</td><td>₹800</td><td>Successful</td>
            <td><button class="button small" onclick="contactCustomer('Neha Sharma')">Contact Customer</button></td>
          </tr>
          <tr>
            <td>T502</td><td>Rahul Mehta</td><td>Refund</td><td>₹500</td><td>Pending</td>
            <td>
              <button class="button small" onclick="processRefund('T502')">Process Refund</button>
              <button class="button small red" onclick="rejectRefund('T502')">Reject Refund</button>
              <button class="button small" onclick="contactCustomer('Rahul Mehta')">Contact Customer</button>
            </td>
          </tr>
          <tr>
            <td>T503</td><td>Priya Das</td><td>Payment</td><td>₹1200</td><td>Processing</td>
            <td><button class="button small" onclick="contactCustomer('Priya Das')">Contact Customer</button></td>
          </tr>
        </table>

        <div id="output" style="margin-top:20px; font-weight:bold; color:#0077b6;"></div>
      `;
      break;

    case 'reports':
      content.innerHTML = `
        <h2>Reports & Analytics</h2>
        <table>
          <tr><th>Report Type</th><th>Summary</th></tr>
          <tr><td>Monthly Appointments</td><td>120 appointments booked this month</td></tr>
          <tr><td>Revenue</td><td>Total ₹1,45,000 collected</td></tr>
          <tr><td>Refunds</td><td>₹12,000 refunded this month</td></tr>
        </table>
      `;
      break;

    case 'settings':
      content.innerHTML = `
        <h2>Settings</h2>
        <p>Customize admin preferences below:</p>

        <div class="settings-form">
          <label>Dashboard Color: </label>
          <input type="color" id="themeColor" value="#0077b6" />
          <button class="button small" onclick="applyTheme()">Apply Theme</button>
        </div>

        <div class="settings-form">
          <label>Access Role: </label>
          <select id="accessRole">
            <option>Admin</option>
            <option>Manager</option>
            <option>Viewer</option>
          </select>
          <button class="button small" onclick="setAccess()">Set Access</button>
        </div>

        <div id="settingsOutput" style="margin-top:20px; font-weight:bold; color:#0077b6;"></div>
      `;
      break;
  }
}

// --- Doctor Info Modal Functions ---
function showDoctorInfo(doctor) {
  const modal = document.getElementById('doctorModal');
  const content = document.getElementById('doctorInfoContent');

  if (modal && content) {
    content.innerHTML = `
      <p><strong>ID:</strong> ${doctor._id || 'N/A'}</p>
      <p><strong>Name:</strong> ${doctor.name || 'N/A'}</p>
      <p><strong>Clinic Name:</strong> ${doctor.clinicName || 'N/A'}</p>
      <p><strong>Specialization:</strong> ${doctor.Speciality || 'N/A'}</p>
      <p><strong>Status:</strong> <span style="color: ${doctor.status === 'Verified' ? '#28a745' : '#dc3545'}; font-weight: bold;">${doctor.status || 'Pending'}</span></p>
      <p><strong>Email:</strong> ${doctor.email || 'N/A'}</p>
      <p><strong>Phone:</strong> ${doctor.phoneNumber || 'N/A'}</p>
      <p><strong>Experience:</strong> ${doctor.Experience || 'N/A'} years</p>
      <p><strong>Qualification:</strong> ${doctor.qualification || 'N/A'}</p>
      <p><strong>Clinic Address:</strong> ${doctor.address || 'N/A'}</p>
      &nbsp;&nbsp;&nbsp;&nbsp;
      &nbsp;

          <div class="cert-wrapper">
      <button class="view-button" onclick="toggleImage()">
            <span id="buttonLabel">View Certificate</span>
        </button>
        
        <div class="image-container" id="imageBox">
            <button class="exit-button" onclick="hideImage()">&times;</button>
            <img src=${doctor.Degree.url} alt="Certificate of Achievement">
        </div>
    </div>
       
       <form action="/Admin"  method="post">
        <input type="text" hidden name="doctorId" value="${doctor._id}">
        <button id="verifyButton" type="submit"> Verify</button>
        </form>
     

    `;
    modal.style.display = 'block';

    const verifyButton = document.querySelector("#verifyButton");
    if (doctor.status === "Verified") {
      verifyButton.classList.add("hide");
    }

  }
}

function closeDoctorModal() {
  const modal = document.getElementById('doctorModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// --- Patient Info Modal Functions ---
function showPatientInfo(patientData) {
  const modal = document.getElementById('patientModal');
  const content = document.getElementById('patientInfoContent');

  if (modal && content) {
    // Calculate total appointments
    const scheduledCount = (patientData.appointment && patientData.appointment.Sheduled) 
      ? patientData.appointment.Sheduled.length 
      : 0;
    const visitedCount = (patientData.appointment && patientData.appointment.visited) 
      ? patientData.appointment.visited.length 
      : 0;
      
    const totalAppointments = scheduledCount + visitedCount;

    // Get last appointment date
    const lastAppointment = (patientData.appointment && patientData.appointment.visited && patientData.appointment.visited.length > 0) 
      ? new Date(patientData.appointment.visited[patientData.appointment.visited.length - 1]).toLocaleDateString() 
      : 'No appointments yet';

    content.innerHTML = `
      <p><strong>ID:</strong> ${patientData._id || 'N/A'}</p>
      <p><strong>Name:</strong> ${patientData.username || 'N/A'}</p>
      <p><strong>Age:</strong> ${patientData.age || 'N/A'}</p>
      <p><strong>Email:</strong> ${patientData.email || 'N/A'}</p>
      <p><strong>Phone:</strong> ${patientData.phoneNo || 'N/A'}</p>
      <p><strong>Last Appointment:</strong> ${lastAppointment}</p>
      <p><strong>Total Appointments:</strong> ${totalAppointments}</p>
      <p><strong>Scheduled Appointments:</strong> ${scheduledCount}</p>
      <p><strong>Completed Appointments:</strong> ${visitedCount}</p>
    `;
    modal.style.display = 'block';
  }
}

function closePatientModal() {
  const modal = document.getElementById('patientModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// --- Delete Functions ---
function deleteDoctor(doctorId) {
  if (confirm('Are you sure you want to delete this doctor?')) {
    // Create a form and submit it to delete the doctor
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `/Admin/doctor/${doctorId}?_method=DELETE`;
    
    document.body.appendChild(form);
    form.submit();
  }
}

function deletePatient(patientId) {
  if (confirm('Are you sure you want to delete this patient?')) {
    // Create a form and submit it to delete the patient
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `/Admin/patient/${patientId}?_method=DELETE`;
    
    document.body.appendChild(form);
    form.submit();
  }
}

// --- Transactions page interactivity ---
function processRefund(id) {
  const output = document.getElementById('output');
  if (output) {
    output.innerText = `Refund for ${id} processed successfully.`;
  }
}

function rejectRefund(id) {
  const output = document.getElementById('output');
  if (output) {
    output.innerText = `Refund for ${id} has been rejected.`;
  }
}

function contactCustomer(name) {
  const output = document.getElementById('output');
  if (output) {
    output.innerText = `Contact email sent to ${name}.`;
  }
}

// --- Settings page interactivity ---
function applyTheme() {
  const color = document.getElementById('themeColor').value;
  const header = document.querySelector('header');
  const sidebar = document.querySelector('.sidebar');
  const settingsOutput = document.getElementById('settingsOutput');
  
  if (header) header.style.backgroundColor = color;
  if (sidebar) sidebar.style.backgroundColor = darken(color, 0.25);
  if (settingsOutput) settingsOutput.innerText = 'Dashboard theme updated successfully.';
}

function setAccess() {
  const role = document.getElementById('accessRole').value;
  const settingsOutput = document.getElementById('settingsOutput');
  if (settingsOutput) {
    settingsOutput.innerText = `Access level set to: ${role}`;
  }
}

// --- Helper function to darken colors ---
function darken(hex, percent) {
  const num = parseInt(hex.replace("#", ""), 16);
  let r = (num >> 16) - percent * 255;
  let g = ((num >> 8) & 0x00FF) - percent * 255;
  let b = (num & 0x0000FF) - percent * 255;

  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));

  return "#" + (1 << 24 | (r << 16) | (g << 8) | b).toString(16).slice(1);
}


//image
 function toggleImage() {
            const imageBox = document.getElementById('imageBox');
            const buttonLabel = document.getElementById('buttonLabel');
            
            if (imageBox.classList.contains('active')) {
                imageBox.classList.remove('active');
                buttonLabel.textContent = 'View Certificate';
            } else {
                imageBox.classList.add('active');
                buttonLabel.textContent = 'Hide Certificate';
            }
        }

        function hideImage() {
            const imageBox = document.getElementById('imageBox');
            const buttonLabel = document.getElementById('buttonLabel');
            imageBox.classList.remove('active');
            buttonLabel.textContent = 'View Certificate';
        }