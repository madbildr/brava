import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCEL4hFepEBcCJ9MpTiHeDWZYYdiH3qol4",
    authDomain: "brava-8d79e.firebaseapp.com",
    projectId: "brava-8d79e",
    storageBucket: "brava-8d79e.appspot.com",
    messagingSenderId: "1046018244812",
    appId: "1:1046018244812:web:3b6de346e4face1bf5c269",
    measurementId: "G-45LV2F2Z7D"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

document.addEventListener("DOMContentLoaded", () => {
    const steps = document.querySelectorAll(".step");
    let currentStep = 0;
    let mapInitialized = false;
    const nameInput = document.getElementById("name");
    const successPopup = document.getElementById("success-popup");

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

    onAuthStateChanged(auth, (user) => {
        if (user) {
            nameInput.value = user.displayName || "User";
            nameInput.disabled = true;
        } else {
            nameInput.value = "";
            nameInput.disabled = false;
            nameInput.setAttribute("required", "true");
        }
    });

    function populateDropdown(filter = "") {
        dropdownList.innerHTML = "";
        const filteredBeers = beers.filter(beer =>
            beer.name.toLowerCase().includes(filter.toLowerCase())
        );
        filteredBeers.forEach(beer => {
            const option = document.createElement("div");
            option.innerHTML = `<img src="${beer.logo}" alt="${beer.name}"><span>${beer.name}</span>`;
            option.addEventListener("click", () => {
                beerInput.value = beer.name;
                dropdownList.classList.remove("show");
            });
            dropdownList.appendChild(option);
        });
        if (filter) dropdownList.classList.add("show");
    }

    beerInput.addEventListener("focus", () => populateDropdown(beerInput.value));
    beerInput.addEventListener("input", (e) => populateDropdown(e.target.value));
    document.addEventListener("click", (e) => {
        if (!beerInput.contains(e.target) && !dropdownList.contains(e.target)) {
            dropdownList.classList.remove("show");
        }
    });

    function initMap() {
        if (mapInitialized || !window.google || !window.google.maps) {
            console.error("Google Maps API not loaded yet");
            return;
        }
        try {
            const map = new google.maps.Map(document.getElementById("map"), {
                center: { lat: 51.454514, lng: -2.587910 },
                zoom: 8,
            });
            const autocomplete = new google.maps.places.Autocomplete(document.getElementById("location"));
            autocomplete.bindTo("bounds", map);
            const marker = new google.maps.Marker({ map, position: null });
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
                marker.setPosition(place.geometry.location);
            });
            mapInitialized = true;
        } catch (error) {
            console.error("Failed to initialize map:", error);
            document.getElementById("map").innerHTML = "Error loading map.";
        }
    }

    function updateStep() {
        steps.forEach((step, index) => {
            step.classList.toggle("active", index === currentStep);
            if (index === 3 && index === currentStep && !mapInitialized) {
                if (window.google && window.google.maps) {
                    initMap();
                } else {
                    const checkGoogleMaps = setInterval(() => {
                        if (window.google && window.google.maps) {
                            clearInterval(checkGoogleMaps);
                            initMap();
                        }
                    }, 100);
                }
            }
        });
    }

    function nextStep() {
        const currentInputs = steps[currentStep].querySelectorAll("input:not([type='hidden'])");
        let isValid = true;
        currentInputs.forEach(input => {
            if (input.hasAttribute('required') && !input.value.trim() && !input.disabled) {
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

    document.querySelectorAll(".next-btn").forEach(button => button.addEventListener("click", nextStep));
    document.querySelectorAll(".prev-btn").forEach(button => button.addEventListener("click", prevStep));

    document.getElementById("beer-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = {
            name: nameInput.value,
            beerBrand: document.getElementById("beer-brand").value,
            rating: parseInt(document.getElementById("rating").value, 10),
            location: document.getElementById("location").value,
            timestamp: serverTimestamp()
        };
        try {
            await addDoc(collection(db, "beerRatings"), formData);
            // Show success popup
            successPopup.style.display = "block";
            document.getElementById("beer-form").reset();
            currentStep = 0;
            mapInitialized = false;
            updateStep();
            // Redirect after 2 seconds (matches animation duration)
            setTimeout(() => {
                successPopup.style.display = "none";
                window.location.href = "index.html";
            }, 2000);
        } catch (error) {
            console.error("Error adding document: ", error);
            alert("Failed to submit the form. Please try again."); // Keep alert for errors
        }
    });

    const stars = document.querySelectorAll(".star-rating span");
    const selectedRating = document.getElementById("selected-rating");
    stars.forEach(star => {
        star.addEventListener("click", () => {
            const value = star.getAttribute("data-value");
            selectedRating.textContent = value;
            document.getElementById("rating").value = value;
            stars.forEach((s, index) => s.classList.toggle("selected", index < value));
        });
    });
});