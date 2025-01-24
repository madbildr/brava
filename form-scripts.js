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

function nextStep() {
    saveCurrentStep();
    if (currentStep < steps.length - 1) {
        currentStep++;
        updateStep();
    } else {
        submitForm(formData);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const nextButtons = document.querySelectorAll(".next-btn");
    let currentStepIndex = 0;

    // Initialize step display
    updateStep();

    // Event listeners for the "Next" buttons
    nextButtons.forEach((button) => {
        button.addEventListener("click", () => {
            // Validate inputs in the current step
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

            // Save data for current step
            saveCurrentStep();

            // Move to next step if valid
            if (currentStepIndex < steps.length - 1) {
                currentStepIndex++;
                updateStep();
            } else {
                // If it's the last step, submit the form
                submitForm(formData);
            }
        });
    });

    // Function to update which step is visible
    function updateStep() {
        steps.forEach((step, index) => {
            step.classList.toggle("active", index === currentStepIndex);
        });
    }
});
