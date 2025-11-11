const API_BASE_URL = 'http://localhost:3000';
const ENABLE_SMS = true; // Set to false to skip SMS and just submit form

function getDay(date) { 
    let f = new Date(`${date}`);
    return days[f.getDay()];
}

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    // Set minimum date to today
    const dateInput = document.getElementById('dateInput');
    if (dateInput) {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        dateInput.min = today;
    }

    // Back button handler
    const backBtn = document.querySelector('.back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.history.back();
        });
    }

    // Form validation feedback
    document.querySelectorAll('.form-input').forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value.trim() === '') {
                this.style.borderColor = '#ef4444';
            } else {
                this.style.borderColor = '#d1d5db';
            }
        });

        input.addEventListener('input', function() {
            this.style.borderColor = '#d1d5db';
        });
    });

    // Form submission handler
    const payForm = document.querySelector(".Pay");
    if (payForm) {
        payForm.addEventListener("submit", async function(e) {
            e.preventDefault(); // Prevent default form submission
            
            // Get form values
            const patientName = document.getElementById('patientName').value.trim();
            const phoneNumber = document.getElementById('phoneNumber').value.trim();
            const appointmentDate = document.getElementById('dateInput').value.trim();
            const slotSelect = document.getElementById("slotSelect").value.trim();
            
            // Validation
            if (!patientName || !phoneNumber || !appointmentDate || !slotSelect) {
                alert('⚠️ Please fill in all required fields');
                return;
            }

            // Phone validation - MUST start with +91
            if (!phoneNumber.startsWith('+91')) {
                alert('⚠️ Phone number must start with +91\nExample: +919876543210');
                return;
            }
            
            // Extract only digits after +91
            const phoneDigits = phoneNumber.slice(3).replace(/\D/g, '');
            
            // Must be exactly 10 digits after +91
            if (phoneDigits.length !== 10) {
                alert('⚠️ Please enter exactly 10 digits after +91\nExample: +919876543210');
                return;
            }
            
            // First digit must be 6-9
            if (!phoneDigits.match(/^[6-9]/)) {
                alert('⚠️ Indian mobile numbers must start with 6, 7, 8, or 9\nExample: +919876543210');
                return;
            }
            
            // Final normalized phone
            const normalizedPhone = '+91' + phoneDigits;
            
            const btn = document.querySelector('.continue-btn');
            const originalBtnText = btn.textContent;
            btn.textContent = 'Processing...';
            btn.disabled = true;
            
            // Calculate day of week and populate hidden field
            const selectedDay = getDay(appointmentDate);
            const dayInput = document.querySelector("#day");
            if (dayInput) {
                dayInput.value = selectedDay;
            }
            
            // Combine date and slot into appointmentTime for backend compatibility
            const appointmentTime = `${appointmentDate}T${slotSelect}`;
            const appointmentTimeInput = document.getElementById('appointmentTime');
            if (appointmentTimeInput) {
                appointmentTimeInput.value = appointmentTime;
            }
            
            // If SMS is disabled, just submit the form
            if (!ENABLE_SMS) {
                payForm.submit();
                return;
            }
            
            try {
                // Format date nicely for SMS
                const dateObj = new Date(appointmentDate);
                const formattedDate = dateObj.toLocaleDateString('en-IN', { 
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                });
                
                // Send appointment SMS using the dedicated endpoint
                const response = await fetch(`${API_BASE_URL}/send-appointment-sms`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        phone: normalizedPhone,
                        name: patientName,
                        date: formattedDate,
                        time: slotSelect
                    })
                });

                // Check if response is OK
                if (!response.ok) {
                    // Still submit form even if SMS fails
                    payForm.submit();
                    return;
                }

                const result = await response.json();
                
                // Submit the form to backend regardless of SMS status
                payForm.submit();
                
            } catch (error) {
                console.error('SMS Error:', error);
                // Submit form even on error - don't block user from booking
                payForm.submit();
            }
        });
    }
});