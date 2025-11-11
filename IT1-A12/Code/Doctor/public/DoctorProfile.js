// Global variables and functions (accessible from HTML)
let infoWindow;
let geocoder;
let googleMapsLoaded = false;
let editingEnabled = false;

// Load Google Maps API dynamically
function loadGoogleMapsAPI() {
    return new Promise((resolve, reject) => {
        // Check if already loaded
        if (window.google && window.google.maps) {
            googleMapsLoaded = true;
            initMap();
            resolve();
            return;
        }

        // Create script element
        const script = document.createElement('script');
        script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDrI3IiYteS0XnhqlWGwHluR8zXCqrY6FU';
        script.async = true;
        script.defer = true;

        script.onload = function() {
            googleMapsLoaded = true;
            initMap();
            resolve();
        };

        script.onerror = function() {
            reject(new Error('Failed to load Google Maps API. Please check your internet connection.'));
        };

        document.head.appendChild(script);
    });
}

// Initialize map
function initMap() {
    if (window.google && window.google.maps) {
        infoWindow = new google.maps.InfoWindow();
        geocoder = new google.maps.Geocoder();
      
    }
}

// Geocode function
async function geocode(request) {
    try {
        if (!geocoder) {
            throw new Error("Geocoder not initialized");
        }

        const result = await geocoder.geocode(request);
        const { results } = result;

        if (!results || results.length === 0) {
            throw new Error("No results found for the address");
        }

        const latitude = results[0].geometry.location.lat();
        const longitude = results[0].geometry.location.lng();

        const pos = {
            latitude,
            longitude,
        };
       
        return pos;
    } catch (e) {
        console.error("Geocoding failed:", e);
        alert("Geocoding failed: " + e.message);
        return null;
    }
}

// Edit-Val Setter
const valSetter = (cliName, add, fee, lon, lat, website, aboutMe) => {
    const fees = document.querySelector(".fees");
    const clinicName = document.querySelector(".clinicName");
    const address = document.querySelector(".address");
    const lonField = document.querySelector(".lon");
    const latField = document.querySelector(".lat");
    const websiteField = document.querySelector(".website");
    const aboutMeField = document.querySelector(".aboutMe");

    if (fees) fees.value = fee;
    if (clinicName) clinicName.value = cliName;
    if (address) address.value = add;
    if (lonField) lonField.value = lon;
    if (latField) latField.value = lat;
    if (websiteField) websiteField.value = website;
    if (aboutMeField) aboutMeField.value = aboutMe;
};

// GLOBAL FUNCTION - Toggle Editing (called from HTML)
function toggleEditing() {
    const locationLink = document.querySelector(".location-link");
    const revSection = document.querySelector(".review-section");
    
    if (locationLink && revSection) {
        if (locationLink.style.display != "none" && revSection.style.display != "none") {
            locationLink.style.display = "none";
            revSection.style.display = "none";
        } else {
            locationLink.style.display = "";
            revSection.style.display = "";
        }
    }

    editingEnabled = !editingEnabled;
    const fields = document.querySelectorAll('[data-editable="true"]');
    const editBtn = document.getElementById('editBtn');

    fields.forEach(field => {
        field.contentEditable = editingEnabled;
    });

    if (editBtn) {
        editBtn.innerText = editingEnabled ? "Disable Editing" : "Enable Editing";
        editBtn.style.background = editingEnabled ? "#dc3545" : "#007BFF";
    }
}

// GLOBAL FUNCTION - Save Profile (called from HTML)
async function saveProfile() {
    try {
        const fields = document.querySelectorAll('[data-editable="true"]');
        const editform = document.querySelector("#editForm");
        let profileData = [];

        fields.forEach(field => {
            console.log(field);
            profileData.push(field.innerText.trim());
        });


          
        // Show loading state
        const originalAlert = alert;
       

        // Ensure Google Maps is loaded before geocoding
        if (!googleMapsLoaded) {
            await loadGoogleMapsAPI();
        }

        // Geocoding
        const p = await geocode({ address: profileData[3]});
     
        if (p) {
            console.log("Geocoded coordinates:", p);
            valSetter(
                profileData[1],
                profileData[3],
                profileData[2],
                p.longitude,
                p.latitude,
                profileData[5],
                profileData[0]
            );

            alert("Profile saved successfully!");
            
            if (editform) {
                editform.submit();
            }
        } else {
            alert("Failed to geocode address. Please check the address and try again.");
        }

        // Disable editing after save
        if (editingEnabled) {
            toggleEditing();
        }
    } catch (error) {
        console.error("Error saving profile:", error);
        alert("Failed to save profile. Error: " + error.message);
    }
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    const Bookbtn = document.querySelector(".book-btn");
    const availabilityButtons = document.querySelectorAll('.availability-btn');
    let appointDay = document.querySelector("#appointment_day");
    let lastClickedButton = null;

    // Store the original color of the button
    const originalColor = "#5cb85c";
    const activeColor = "#17d737";

    // Initially hide the Book Appointment button
    if (Bookbtn) {
        Bookbtn.classList.add("hide");
    }

    // Add event listener for each availability button
    if (availabilityButtons.length > 0) {
        availabilityButtons.forEach(button => {
            button.addEventListener("click", function() {
                if (appointDay) {
                    appointDay.value = this.innerText;
                }

                // If the same button is clicked again, toggle the visibility
                if (lastClickedButton === button) {
                    if (Bookbtn) {
                        Bookbtn.classList.toggle("hide");
                    }
                    button.style.backgroundColor = originalColor;
                } else {
                    // Show the Book Appointment button
                    if (Bookbtn) {
                        Bookbtn.classList.remove("hide");
                    }
                    button.style.backgroundColor = activeColor;

                    // Reset the background color of all other buttons
                    availabilityButtons.forEach(b => {
                        if (b !== button) {
                            b.style.backgroundColor = originalColor;
                        }
                    });
                }

                lastClickedButton = button;
            });
        });
    }

    // Getting schedule info
    if (Bookbtn) {
        Bookbtn.addEventListener("submit", (e) => {
            e.preventDefault();
        });
    }

    // ============================================
    // APPOINTMENT BOOKING FUNCTIONALITY
    // ============================================
    const availabilityBtns = document.querySelectorAll('.availability-btn');
    const appointmentDayInput = document.getElementById('appointment_day');
    const bookBtn = document.getElementById('bookBtn');
    const appointmentForm = document.getElementById('appointmentForm');

    // Handle availability button clicks
    if (availabilityBtns.length > 0) {
        availabilityBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                // Don't select if in editing mode
                if (editingEnabled) {
                    return;
                }

                // Remove selected class from all buttons
                availabilityBtns.forEach(b => b.classList.remove('selected'));

                // Add selected class to clicked button
                this.classList.add('selected');

                // Get the day from data attribute
                const day = this.getAttribute('data-day');
                const time = this.getAttribute('data-time');
                
                if (appointmentDayInput) {
                    appointmentDayInput.value = day;
                }

                // Enable and update book button
                if (bookBtn) {
                    bookBtn.disabled = false;
                    bookBtn.textContent = `Book Appointment for ${day}`;
                }
            });
        });
    }

    // Handle appointment form submission
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', function(e) {
            e.preventDefault();

            if (!appointmentDayInput || !appointmentDayInput.value) {
                alert('Please select a day for your appointment');
                return;
            }

            const selectedDay = appointmentDayInput.value;

            alert(`Appointment Request Submitted!\n\nDay: ${selectedDay}\n\nYou will receive a confirmation email shortly.`);

            // Reset selection
            availabilityBtns.forEach(b => b.classList.remove('selected'));
            if (appointmentDayInput) appointmentDayInput.value = '';
            if (bookBtn) {
                bookBtn.disabled = true;
                bookBtn.textContent = 'Select a day to book appointment';
            }
        });
    }

    // Prevent appointment selection while editing
    document.addEventListener('click', function(e) {
        if (editingEnabled && e.target.classList.contains('availability-btn')) {
            e.stopPropagation();
        }
    });
});