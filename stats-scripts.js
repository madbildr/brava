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

// Hugging Face API configuration with your token
const HF_API_TOKEN = "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";
const HF_API_URL = "https://api-inference.huggingface.co/models/distilgpt2";

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
    const chatMessages = document.getElementById("chat-messages");
    const chatInput = document.getElementById("chat-input");
    const chatSendBtn = document.getElementById("chat-send-btn");

    let userRatings = [];

    async function loadUserStats(user) {
        if (!user) return;

        const userName = user.displayName || "User";
        userNameSpan.textContent = userName;

        const q = query(collection(db, "beerRatings"), where("name", "==", userName));
        try {
            const querySnapshot = await getDocs(q);
            userRatings = querySnapshot.docs.map(doc => doc.data());

            const total = userRatings.length;
            const avg = total > 0 ? (userRatings.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1) : 0;
            const beerCounts = {};
            userRatings.forEach(r => beerCounts[r.beerBrand] = (beerCounts[r.beerBrand] || 0) + 1);
            const favoriteBeerName = Object.keys(beerCounts).length > 0
                ? Object.keys(beerCounts).reduce((a, b) => beerCounts[a] > beerCounts[b] ? a : b)
                : "None yet";
            const locationCounts = {};
            userRatings.forEach(r => locationCounts[r.location] = (locationCounts[r.location] || 0) + 1);
            const favoriteLocationName = Object.keys(locationCounts).length > 0
                ? Object.keys(locationCounts).reduce((a, b) => locationCounts[a] > locationCounts[b] ? a : b)
                : "None yet";

            totalBeers.textContent = total;
            avgRating.textContent = avg;
            favoriteBeer.textContent = favoriteBeerName;
            favoriteLocation.textContent = favoriteLocationName;

            ratingsTableBody.innerHTML = "";
            userRatings.forEach(rating => {
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

    async function sendChatMessage() {
        if (!chatInput || !chatMessages || !chatSendBtn) {
            console.error("Chat elements not found:", { chatInput, chatMessages, chatSendBtn });
            return;
        }

        const message = chatInput.value.trim();
        if (!message) return;

        const userMsg = document.createElement("p");
        userMsg.textContent = `You: ${message}`;
        chatMessages.appendChild(userMsg);
        chatInput.value = "";
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Improved prompt with explicit instruction
        const context = userRatings.map(r =>
            `${r.beerBrand}: Rated ${r.rating}/10 on ${r.timestamp ? new Date(r.timestamp.toMillis()).toLocaleDateString() : "Unknown"} at ${r.location}`
        ).join("; ");
        const prompt = `You are an AI analyzing beer ratings. Here’s the user’s data: ${context}. The user asked: "${message}". Provide a concise, relevant response based on this data.`;

        try {
            const response = await fetch(HF_API_URL, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${HF_API_TOKEN}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    inputs: prompt,
                    parameters: { max_length: 150, temperature: 0.7, top_p: 0.9 }
                })
            });

            if (!response.ok) throw new Error(`API error: ${response.status}`);

            const data = await response.json();
            console.log("Raw API response:", data); // Debug
            const aiResponse = data[0]?.generated_text?.replace(prompt, "").trim() || "I couldn’t come up with a good answer.";

            const aiMsg = document.createElement("p");
            aiMsg.textContent = `AI: ${aiResponse}`;
            chatMessages.appendChild(aiMsg);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        } catch (error) {
            console.error("Error with Hugging Face API:", error);
            const errorMsg = document.createElement("p");
            errorMsg.textContent = `AI: Oops, I hit a snag. Try again?`;
            chatMessages.appendChild(errorMsg);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    if (chatSendBtn) {
        chatSendBtn.addEventListener("click", sendChatMessage);
    } else {
        console.error("chatSendBtn not found in DOM");
    }
    if (chatInput) {
        chatInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") sendChatMessage();
        });
    } else {
        console.error("chatInput not found in DOM");
    }

    onAuthStateChanged(auth, (user) => {
        if (user) {
            loadUserStats(user).then(showBriefStats);
        } else {
            userStats.style.display = "none";
            notSignedIn.style.display = "block";
        }
    });

    backBtn.addEventListener("click", () => window.location.href = "index.html");
    signInRedirect.addEventListener("click", () => window.location.href = "index.html");
});