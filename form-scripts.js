import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-functions.js";

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
const functions = getFunctions(app);

document.addEventListener("DOMContentLoaded", () => {
    const steps = document.querySelectorAll(".step");
    let currentStep = 0;
    let mapInitialized = false;
    const nameInput = document.getElementById("name");
    const successPopup = document.getElementById("success-popup");

    const beers = [
        { name: "Heineken", logo: "assets/beer-logos/heineken.png" },
        { name: "Guinness", logo: "assets/beer-logos/guinness.png" },
        { name: "Budweiser", logo: "assets/beer-logos/budweiser.png" },
        { name: "Corona", logo: "assets/beer-logos/corona.png" },
        { name: "Stella Artois", logo: "assets/beer-logos/stella-artois.png" },
        { name: "IPA (Generic)", logo: "assets/beer-logos/ipa.png" },
        { name: "Pilsner Urquell", logo: "assets/beer-logos/pilsner-urquell.png" },
        { name: "Pale Ale (Generic)", logo: "assets/beer-logos/pale-ale.png" },
        { name: "Coors Light", logo: "assets/beer-logos/coors-light.png" },
        { name: "Miller Lite", logo: "assets/beer-logos/miller-lite.png" },
        { name: "Peroni", logo: "assets/beer-logos/peroni.png" },
        { name: "Carlsberg", logo: "assets/beer-logos/carlsberg.png" },
        { name: "Foster's", logo: "assets/beer-logos/fosters.png" },
        { name: "Lagunitas IPA", logo: "assets/beer-logos/lagunitas-ipa.png" },
        { name: "Blue Moon", logo: "assets/beer-logos/blue-moon.png" },
        { name: "Samuel Adams", logo: "assets/beer-logos/samuel-adams.png" },
        { name: "Modelo Especial", logo: "assets/beer-logos/modelo-especial.png" },
        { name: "Sapporo", logo: "assets/beer-logos/sapporo.png" },
        { name: "Asahi", logo: "assets/beer-logos/asahi.png" },
        { name: "Beck's", logo: "assets/beer-logos/becks.png" }
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
            option.innerHTML = `<img src="${beer.logo}" width="30" height="30" alt="${beer.name}"><span>${beer.name}</span>`;
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

    const initializeMap = httpsCallable(functions, "initializeMap");
    function initMap() {
        if (mapInitialized || !window.google || !window.google.maps) {
            console.error("Google Maps API not fully loaded yet");
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

    function loadGoogleMapsScript(apiKey) {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
    }

    function updateStep() {
        steps.forEach((step, index) => {
            step.classList.toggle("active", index === currentStep);
            if (index === 3 && index === currentStep && !mapInitialized) {
                initializeMap().then(result => {
                    loadGoogleMapsScript(result.data.apiKey);
                }).catch(error => {
                    console.error("Error initializing map:", error);
                    document.getElementById("map").innerHTML = "Error loading map.";
                });
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
            successPopup.style.display = "block";
            document.getElementById("beer-form").reset();
            document.getElementById("beer-emoji-display").textContent = "";
            currentStep = 0;
            mapInitialized = false;
            updateStep();
            setTimeout(() => {
                successPopup.style.display = "none";
                window.location.href = "index.html";
            }, 2000);
        } catch (error) {
            console.error("Error adding document: ", error);
            alert("Failed to submit the form. Please try again.");
        }
    });

    const ratingButtons = document.querySelectorAll("#rating-buttons button");
    const beerEmojiDisplay = document.getElementById("beer-emoji-display");
    const selectedRating = document.getElementById("selected-rating");
    const ratingInput = document.getElementById("rating");

    ratingButtons.forEach(button => {
        button.addEventListener("click", () => {
            const value = parseInt(button.getAttribute("data-value"), 10);
            selectedRating.textContent = value;
            ratingInput.value = value;
            beerEmojiDisplay.textContent = "🍺".repeat(value);
            ratingButtons.forEach(btn => btn.classList.remove("selected"));
            button.classList.add("selected");
        });
    });
});