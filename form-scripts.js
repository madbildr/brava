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
        { name: "Heineken", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Heineken_logo.svg/120px-Heineken_logo.svg.png" },
        { name: "Guinness", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Guinness-logo.svg/120px-Guinness-logo.svg.png" },
        { name: "Budweiser", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Budweiser_logo.svg/120px-Budweiser_logo.svg.png" },
        { name: "Corona", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Corona_Extra_logo.svg/120px-Corona_Extra_logo.svg.png" },
        { name: "Stella Artois", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Stella_Artois_logo.svg/120px-Stella_Artois_logo.svg.png" },
        { name: "Pilsner Urquell", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Pilsner_Urquell_logo.svg/120px-Pilsner_Urquell_logo.svg.png" },
        { name: "Coors Light", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Coors_Light_logo.svg/120px-Coors_Light_logo.svg.png" },
        { name: "Miller Lite", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Miller_Lite_logo.svg/120px-Miller_Lite_logo.svg.png" },
        { name: "Peroni", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Peroni_Nastro_Azzurro_logo.svg/120px-Peroni_Nastro_Azzurro_logo.svg.png" },
        { name: "Carlsberg", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Carlsberg_logo.svg/120px-Carlsberg_logo.svg.png" },
        { name: "Foster's", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Foster%27s_Lager_logo.svg/120px-Foster%27s_Lager_logo.svg.png" },
        { name: "Lagunitas IPA", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Lagunitas_Brewing_Company_logo.svg/120px-Lagunitas_Brewing_Company_logo.svg.png" },
        { name: "Blue Moon", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Blue_Moon_logo.svg/120px-Blue_Moon_logo.svg.png" },
        { name: "Samuel Adams", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Samuel_Adams_logo.svg/120px-Samuel_Adams_logo.svg.png" },
        { name: "Modelo Especial", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Modelo_Especial_logo.svg/120px-Modelo_Especial_logo.svg.png" },
        { name: "Sapporo", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Sapporo_Beer_logo.svg/120px-Sapporo_Beer_logo.svg.png" },
        { name: "Asahi", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Asahi_Breweries_logo.svg/120px-Asahi_Breweries_logo.svg.png" },
        { name: "Beck's", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Beck%27s_logo.svg/120px-Beck%27s_logo.svg.png" }
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
            successPopup.style.display = "block";
            document.getElementById("beer-form").reset();
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

    const stars = document.querySelectorAll(".star-rating span");
    const selectedRating = document.getElementById("selected-rating");
    const ratingInput = document.getElementById("rating");

    stars.forEach(star => {
        star.addEventListener("click", () => {
            const value = parseInt(star.getAttribute("data-value"), 10);
            selectedRating.textContent = value;
            ratingInput.value = value;

            // Explicitly set selected class for stars up to the clicked value
            stars.forEach((s, index) => {
                if (index < value) {
                    s.classList.add("selected");
                } else {
                    s.classList.remove("selected");
                }
            });
        });
    });
});