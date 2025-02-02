// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCEL4hFepEBcCJ9MpTiHeDWZYYdiH3qol4",
    authDomain: "brava-8d79e.firebaseapp.com",
    projectId: "brava-8d79e",
    storageBucket: "brava-8d79e.appspot.com",
    messagingSenderId: "1046018244812",
    appId: "1:1046018244812:web:3b6de346e4face1bf5c269",
    measurementId: "G-45LV2F2Z7D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Google Maps Variables
let map;
let marker;
let autocomplete;

document.addEventListener("DOMContentLoaded", () => {
    const steps = document.querySelectorAll(".step");
    let currentStep = 0;

    // Initialize Google Maps
    initMap();

    // Predefined list of beers with logos
    const beers = [
        { name: "Heineken", logo: "https://dutchkingsday.com/sponsor/heineken/heineken-logo-2023/" },
        { name: "Guinness", logo: "https://via.placeholder.com/30" },
        { name: "Budweiser", logo: "https://via.placeholder.com/30" },
        { name: "Corona", logo: "https://via.placeholder.com/30" },
        { name: "Stella Artois", logo: "https://via.placeholder.com/30" },
        { name: "IPA", logo: "https://via.placeholder.com/30" },
        { name: "Pilsner", logo: "https://via.placeholder.com/30" },
        { name: "Pale Ale", logo: "https://via.placeholder.com/30" },
    ];

    const beerInput = document.getElementById("beer-brand");
    const dropdownList = document.getElementById("beerDropdown");

    // Populate dropdown with beer options
    function populateDropdown(filter = "") {
        dropdownList.innerHTML = ""; // Clear existing options
        const filteredBeers = beers.filter(beer =>
            beer.name.toLowerCase().includes(filter.toLowerCase())
        );

        filteredBeers.forEach(beer => {
            const option = document.createElement("div");
            option.innerHTML = `
                <img src="${beer.logo}" alt="${beer.name}">
                <span>${beer.name}</span>
            `;
            option.addEventListener("click", () => {
                beerInput.value = beer.name; // Set input value to selected beer
                dropdownList.classList.remove("show"); // Hide dropdown
            });
            dropdownList.appendChild(option);
        });
    }

    // Show dropdown when input is focused
    beerInput.addEventListener("focus", () => {
        populateDropdown();
        dropdownList.classList.add("show");
    });

    // Filter dropdown options as user types
    beerInput.addEventListener("input", (e) => {
        populateDropdown(e.target.value);
    });

    // Close the dropdown if the user clicks outside
    document.addEventListener("click", (e) => {
        if (!e.target.matches(".dropbtn") && !e.target.closest(".dropdown-content")) {
            dropdownList.classList.remove("show");
        }
    });

    // Step Navigation Functions
    function updateStep() {
        steps.forEach((step, index) => {
            step.classList.toggle("active", index === currentStep);
        });
    }


    function nextStep() {
        const currentInputs = steps[currentStep].querySelectorAll("input");
        let isValid = true;

        currentInputs.forEach(input => {
            if (!input.value.trim()) {
                input.classList.add("error");
                isValid = false;
            } else {
                input.classList.remove("error");
            }
        });

        if (isValid && currentStep < steps.length - 1) {
            currentStep++;
            updateStep();
        }
    }

    function prevStep() {
        if (currentStep > 0) {
            currentStep--;
            updateStep();
        }
    }

    // Event Listeners for Buttons
    document.querySelectorAll(".next-btn").forEach(button => {
        button.addEventListener("click", nextStep);
    });

    document.querySelectorAll(".prev-btn").forEach(button => {
        button.addEventListener("click", prevStep);
    });

    // Form Submission
    document.getElementById("beer-form").addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = {
            name: document.getElementById("name").value,
            beerBrand: document.getElementById("beer-brand").value,
            rating: parseInt(document.getElementById("rating").value, 10),
            location: document.getElementById("location").value,
            timestamp: serverTimestamp()
        };

        try {
            await addDoc(collection(db, "beerRatings"), formData);
            alert("Form submitted successfully!");
            console.log("Form Data:", formData);

            document.getElementById("beer-form").reset();
            currentStep = 0;
            updateStep();
        } catch (error) {
            console.error("Error adding document: ", error);
            alert("Failed to submit the form. Please try again.");
        }
    });

    // Google Maps Initialization
    function initMap() {
        map = new google.maps.Map(document.getElementById("map"), {
            center: { lat: 51.454514, lng: -2.587910 },
            zoom: 8,
        });

        autocomplete = new google.maps.places.Autocomplete(document.getElementById("location"));
        autocomplete.bindTo("bounds", map);

        // Use the deprecated Marker class (temporary solution)
        marker = new google.maps.Marker({
            map,
            position: null, // Initially no position
        });

        autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            if (!place.geometry) {
                console.log("No details available for input: '" + place.name + "'");
                return;
            }

            if (place.geometry.viewport) {
                map.fitBounds(place.geometry.viewport);
            } else {
                map.setCenter(place.geometry.location);
                map.setZoom(17);
            }

            // Update the marker's position
            marker.setPosition(place.geometry.location);
        });
    }

    // Star Rating Functionality
    const stars = document.querySelectorAll(".star-rating span");
    const selectedRating = document.getElementById("selected-rating");

    stars.forEach(star => {
        star.addEventListener("click", () => {
            const value = star.getAttribute("data-value");
            selectedRating.textContent = value;

            // Highlight selected stars
            stars.forEach((s, index) => {
                if (index < value) {
                    s.classList.add("selected");
                } else {
                    s.classList.remove("selected");
                }
            });

            // Update the hidden input value
            document.getElementById("rating").value = value;
        });
    });
});