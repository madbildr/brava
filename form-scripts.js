import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getFirestore, collection, addDoc, Timestamp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCEL4hFepEBcCJ9MpTiHeDWZYYdiH3qol4",
    authDomain: "brava-8d79e.firebaseapp.com",
    projectId: "brava-8d79e",
    storageBucket: "brava-8d79e.firebasestorage.app",
    messagingSenderId: "1046018244812",
    appId: "1:1046018244812:web:3b6de346e4face1bf5c269",
    measurementId: "G-45LV2F2Z7D"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let currentStep = 0;
const steps = document.querySelectorAll('.step');
const formData = {};

// Save the current step data
function saveCurrentStep() {
    const inputs = steps[currentStep].querySelectorAll('input, textarea');
    inputs.forEach(input => formData[input.name] = input.value);
}

// Update active step
function updateStep() {
    steps.forEach(step => step.classList.remove('active'));
    steps[currentStep].classList.add('active');
}

// Move to the next step
function nextStep() {
    saveCurrentStep();
    if (currentStep < steps.length - 1) {
        currentStep++;
        updateStep();
    } else {
        submitForm(formData);
    }
}

// Submit form to Firestore
async function submitForm(data) {
    try {
        await addDoc(collection(db, "beers"), {
            ...data,
            timestamp: Timestamp.now(),
        });
        alert("Submitted successfully!");
        location.reload();
    } catch (error) {
        console.error("Error:", error);
        alert("Submission failed!");
    }
}

// Initialize Google Maps
function initMap() {
    const mapElement = document.getElementById("map");
    if (mapElement) {
        const map = new google.maps.Map(mapElement, { center: { lat: 0, lng: 0 }, zoom: 3 });
        const autocomplete = new google.maps.places.Autocomplete(document.getElementById("location"));
        autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            map.setCenter(place.geometry.location);
        });
    } else {
        console.error("Map element not found.");
    }
}

window.initMap = initMap;

document.addEventListener("DOMContentLoaded", () => {
    const nextButtons = document.querySelectorAll(".next-btn");
    const submitButton = document.getElementById("submit-button");
    let currentStepIndex = 0;

    // Update step display
    function updateStepDisplay() {
        steps.forEach((step, index) => {
            step.classList.toggle("active", index === currentStepIndex);
        });
    }

    // Handle next button click
    nextButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const inputs = steps[currentStepIndex].querySelectorAll("input, textarea");
            let valid = true;

            // Input validation
            inputs.forEach((input) => {
                if (input.value.trim() === "") {
                    input.classList.add("error");
                    valid = false;
                } else {
                    input.classList.remove("error");
                }
            });

            if (!valid) return;

            // Move to the next step
            if (currentStepIndex < steps.length - 1) {
                currentStepIndex++;
                updateStepDisplay();
            }
        });
    });

    // Handle submit button click
    submitButton.addEventListener("click", () => {
        // Save the last step's data before submitting
        saveCurrentStep();

        // Gather form data from all steps
        const allData = {};
        steps.forEach((step) => {
            const inputs = step.querySelectorAll("input, textarea");
            inputs.forEach((input) => {
                if (input.name) {
                    allData[input.name] = input.value;
                }
            });
        });

        // Log the complete form data to console (for testing)
        console.log("Form data:", allData);

        // Submit to Firestore
        submitForm(allData);
    });

    // Initialize step display
    updateStepDisplay();
});
