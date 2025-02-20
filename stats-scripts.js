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
    const briefViewBtn = document.getElementById("brief-view-btn");
    const detailedViewBtn = document.getElementById("detailed-view-btn");
    const briefStats = document.getElementById("brief-stats");
    const detailedStats = document.getElementById("detailed-stats");
    const ratingsTableBody = document.getElementById("ratings-table-body");
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

            // Brief stats
            const total = ratings.length;
            const avg = ratings.length > 0 ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1) : 0;
            const beerCounts = {};
            ratings.forEach(r => beerCounts[r.beerBrand] = (beerCounts[r.beerBrand] || 0) + 1);
            const favoriteBeerName = Object.keys(beerCounts).length > 0
                ? Object.keys(beerCounts).reduce((a, b) => beerCounts[a] > beerCounts[b] ? a : b)
                : "None yet";
            const locationCounts = {};
            ratings.forEach(r => locationCounts[r.location] = (locationCounts[r.location] || 0) + 1);
            const favoriteLocationName = Object.keys(locationCounts).length > 0
                ? Object.keys(locationCounts).reduce((a, b) => locationCounts[a] > locationCounts[b] ? a : b)
                : "None yet";

            totalBeers.textContent = total;
            avgRating.textContent = avg;
            favoriteBeer.textContent = favoriteBeerName;
            favoriteLocation.textContent = favoriteLocationName;

            // Detailed stats table
            ratingsTableBody.innerHTML = "";
            ratings.forEach(rating => {
                const tr = document.createElement("tr");
                const date = rating.timestamp ? new Date(rating.timestamp.toMillis()).toLocaleDateString() : "Unknown";
                tr.innerHTML = `
                    <td>${date}</td>
                    <td>${rating.beerBrand}</td>
                    <td>${rating.rating}</td>
                    <td>${rating.location}</td>
                `;
                ratingsTableBody.appendChild(tr);
            });

            userStats.style.display = "block";
            notSignedIn.style.display = "none";
        } catch (error) {
            console.error("Error loading stats:", error);
            notSignedIn.innerHTML = "<p>Error loading stats. Please try again later.</p>";
        }
    }

    // Toggle views
    function showBriefStats() {
        briefStats.style.display = "block";
        detailedStats.style.display = "none";
        briefViewBtn.classList.add("active");
        detailedViewBtn.classList.remove("active");
    }

    function showDetailedStats() {
        briefStats.style.display = "none";
        detailedStats.style.display = "block";
        briefViewBtn.classList.remove("active");
        detailedViewBtn.classList.add("active");
    }

    briefViewBtn.addEventListener("click", showBriefStats);
    detailedViewBtn.addEventListener("click", showDetailedStats);

    onAuthStateChanged(auth, (user) => {
        if (user) {
            loadUserStats(user);
            showBriefStats(); // Default to brief view
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