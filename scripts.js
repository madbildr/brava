import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";

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
const auth = getAuth(app);

function navigateTo(page) {
    window.location.href = `${page}.html`;
}

let currentFactIndex = 0;
const facts = [
    "Did you know? The fastest goal in football history was scored in 2.8 seconds!",
    "Football was played on the moon in 1971 by Apollo 14 astronaut Alan Shepard.",
    "The first footballs were made from pig bladders!",
    "Brazil is the only country to have played in every World Cup.",
    "The longest football match lasted 35 hours and ended with a score of 401-392!"
];

// Authentication handling
const userInfo = document.getElementById("user-info");
const signInForm = document.getElementById("sign-in-form");
const userNameSpan = document.getElementById("user-name");
const signOutBtn = document.getElementById("sign-out-btn");
const signInBtn = document.getElementById("sign-in-btn");
const signUpBtn = document.getElementById("sign-up-btn");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

onAuthStateChanged(auth, (user) => {
    if (user) {
        userInfo.style.display = "block";
        signInForm.style.display = "none";
        userNameSpan.textContent = user.displayName || "User";
    } else {
        userInfo.style.display = "none";
        signInForm.style.display = "block";
    }
});

signInBtn.addEventListener("click", () => {
    const email = emailInput.value;
    const password = passwordInput.value;
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            console.log("Signed in:", userCredential.user);
        })
        .catch((error) => {
            alert("Sign-in error: " + error.message);
        });
});

signUpBtn.addEventListener("click", () => {
    const email = emailInput.value;
    const password = passwordInput.value;
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            // Prompt for name during sign-up
            const name = prompt("Please enter your name:");
            if (name) {
                updateProfile(user, { displayName: name })
                    .then(() => console.log("Profile updated with name:", name))
                    .catch((error) => console.error("Error updating profile:", error));
            }
        })
        .catch((error) => {
            alert("Sign-up error: " + error.message);
        });
});

signOutBtn.addEventListener("click", () => {
    signOut(auth)
        .then(() => console.log("Signed out"))
        .catch((error) => alert("Sign-out error: " + error.message));
});