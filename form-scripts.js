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

function saveCurrentStep() {
    const inputs = steps[currentStep].querySelectorAll('input, textarea');
    inputs.forEach(input => formData[input.name] = input.value);
}

function updateStep() {
    steps.forEach(step => step.classList.remove('active'));
    steps[currentStep].classList.add('active');
}

function nextStep() {
    saveCurrentStep();
    if (currentStep < steps.length - 1) {
        currentStep++;
        updateStep();
    } else {
        submitForm(formData);
    }
}

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

document.getElementById("next1").addEventListener("click", nextStep);
// Add similar event listeners for other buttons.

function initMap() {
    const map = new google.maps.Map(document.getElementById("map"), { center: { lat: 0, lng: 0 }, zoom: 3 });
    const autocomplete = new google.maps.places.Autocomplete(document.getElementById("location"));
    autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        map.setCenter(place.geometry.location);
    });
}
window.initMap = initMap;

document.addEventListener("DOMContentLoaded", () => {
    const steps = document.querySelectorAll(".step");
    const nextButtons = document.querySelectorAll(".next-btn");
    let currentStepIndex = 0;

    function updateStepDisplay() {
        steps.forEach((step, index) => {
            step.classList.toggle("active", index === currentStepIndex);
        });
    }

    nextButtons.forEach((button, index) => {
        button.addEventListener("click", () => {
            // Prevent moving forward if the current step is invalid
            const inputs = steps[currentStepIndex].querySelectorAll("input, textarea");
            let valid = true;

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

    // Initialize step display
    updateStepDisplay();
});

