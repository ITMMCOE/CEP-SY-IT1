//const { events } = require("../model/user_schema");

// --- Load default dashboard on page load ---
window.onload = () => loadPage('dashboard');

// --- Function to load selected section dynamically ---
function loadPage(page) {
  const content = document.getElementById('content');
  const links = document.querySelectorAll('.sidebar a');

  // Remove 'active' class from all links
  links.forEach(link => link.classList.remove('active'));

  // Add 'active' class to the clicked link
  //event.target.classList.add('active');

  // Load page content
  switch (page) {
    case 'dashboard':
      content.innerHTML = `
        <h2>Dashboard</h2>
        <div class="cards">
          <div class="card"><h3>Total Doctors</h3><p>${ window.APP_CONFIG.doctorCount}</p></div>
          <div class="card"><h3>Total Patients</h3><p>${window.APP_CONFIG.userCount}</p></div>
          <div class="card"><h3>Appointments Today</h3><p>34</p></div>
        </div>
      `;
      break;

    case 'doctors':
      content.innerHTML = 
      `
        <h2>Manage Doctors</h2>
        <table>
          <tr><th>ID</th><th>Name</th><th>Specialization</th><th>Status</th></tr>
          <tr><td>D101</td><td>Dr. Ramesh Kumar</td><td>Cardiology</td><td>Verified</td></tr>
          <tr><td>D102</td><td>Dr. Sneha Iyer</td><td>Dermatology</td><td>Pending</td></tr>
          <tr><td>D103</td><td>Dr. Aman Gupta</td><td>Orthopedics</td><td>Verified</td></tr>
        </table>
      `;
      break;

    case 'patients':
      content.innerHTML = `
        <h2>Manage Patients</h2>
        <table>
          <tr><th>ID</th><th>Name</th><th>Age</th><th>Last Appointment</th></tr>
          <tr><td>P001</td><td>Neha Sharma</td><td>29</td><td>2025-10-07</td></tr>
          <tr><td>P002</td><td>Rahul Mehta</td><td>41</td><td>2025-10-05</td></tr>
          <tr><td>P003</td><td>Priya Das</td><td>33</td><td>2025-10-08</td></tr>
        </table>
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

// --- Transactions page interactivity ---
function processRefund(id) {
  document.getElementById('output').innerText = `Refund for ${id} processed successfully.`;
}

function rejectRefund(id) {
  document.getElementById('output').innerText = `Refund for ${id} has been rejected.`;
}

function contactCustomer(name) {
  document.getElementById('output').innerText = `Contact email sent to ${name}.`;
}

// --- Settings page interactivity ---
function applyTheme() {
  const color = document.getElementById('themeColor').value;
  document.querySelector('header').style.backgroundColor = color;
  document.querySelector('.sidebar').style.backgroundColor = darken(color, 0.25);
  document.getElementById('settingsOutput').innerText = 'Dashboard theme updated successfully.';
}

function setAccess() {
  const role = document.getElementById('accessRole').value;
  document.getElementById('settingsOutput').innerText = `Access level set to: ${role}`;
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
