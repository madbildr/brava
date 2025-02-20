import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";
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
    const userStats = document.getElementById("user-stats");
    const notSignedIn = document.getElementById("not-signed-in");
    const userNameSpan = document.getElementById("user-name");
    const totalBeers = document.getElementById("total-beers");
    const avgRating = document.getElementById("avg-rating");
    const favoriteBeer = document.getElementById("favorite-beer");
    const favoriteLocation = document.getElementById("favorite-location");
    const backBtn = document.getElementById("back-btn");
    const signInRedirect = document.getElementById("sign-in-redirect");

    async function loadUserStats(user) {
        if (!user) return;

        const userName = user.displayName || "User";
        userNameSpan.textContent = userName;

        // Query Firestore for user's beer ratings
        const q = query(collection(db, "beerRatings"), where("name", "==", userName));
        try {
            const querySnapshot = await getDocs(q);
            const ratings = querySnapshot.docs.map(doc => doc.data());

            // Calculate stats
            const total = ratings.length;
            const avg = ratings.length > 0 ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1) : 0;

            // Most frequent beer
            const beerCounts = {};
            ratings.forEach(r => beerCounts[r.beerBrand] = (beerCounts[r.beerBrand] || 0) + 1);
            const favoriteBeerName = Object.keys(beerCounts).length > 0
                ? Object.keys(beerCounts).reduce((a, b) => beerCounts[a] > beerCounts[b] ? a : b)
                : "None yet";

            // Most frequent location
            const locationCounts = {};
            ratings.forEach(r => locationCounts[r.location] = (locationCounts[r.location] || 0) + 1);
            const favoriteLocationName = Object.keys(locationCounts).length > 0
                ? Object.keys(locationCounts).reduce((a, b) => locationCounts[a] > locationCounts[b] ? a : b)
                : "None yet";

            // Update UI
            totalBeers.textContent = total;
            avgRating.textContent = avg;
            favoriteBeer.textContent = favoriteBeerName;
            favoriteLocation.textContent = favoriteLocationName;

            userStats.style.display = "block";
            notSignedIn.style.display = "none";
        } catch (error) {
            console.error("Error loading stats:", error);
            notSignedIn.innerHTML = "<p>Error loading stats. Please try again later.</p>";
        }
    }

    onAuthStateChanged(auth, (user) => {
        if (user) {
            loadUserStats(user);
        } else {
            userStats.style.display = "none";
            notSignedIn.style.display = "block";
        }
    });

    backBtn.addEventListener("click", () => {
        window.location.href = "index.html";
    });

    signInRedirect.addEventListener("click", () => {
        window.location.href = "index.html";
    });
});