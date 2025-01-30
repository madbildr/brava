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

function updateFact() {
    const factElement = document.querySelector('.fact p');
    factElement.textContent = facts[currentFactIndex];
}

function nextFact() {
    currentFactIndex = (currentFactIndex + 1) % facts.length;
    updateFact();
}

function prevFact() {
    currentFactIndex = (currentFactIndex - 1 + facts.length) % facts.length;
    updateFact();
}

// Initialize with the first fact
document.addEventListener('DOMContentLoaded', () => {
    updateFact();
});
