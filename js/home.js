// CookSmart - Home Page Logic

// --------------------------------
// SEARCH
// --------------------------------

// When user presses Enter in search box
function handleEnter(event) {
    if (event.key === "Enter") goToSearch();
}

// Go to results page with search query
function goToSearch() {
    const query = document.getElementById("searchInput").value.trim();

    // Don't search if empty
    if (!query) {
        showToast("Please enter a dish name", "error");
        return;
    }

    // Save search type and value, then go to results
    localStorage.setItem("cs_search_type", "query");
    localStorage.setItem("cs_search_value", query);
    window.location.href = "results.html";
}


// --------------------------------
// CUISINE SELECTION
// --------------------------------

// When user clicks a cuisine card
function goToCuisine(cuisine) {
    localStorage.setItem("cs_search_type", "cuisine");
    localStorage.setItem("cs_search_value", cuisine);
    window.location.href = "results.html";
}


// --------------------------------
// MOOD SELECTION
// --------------------------------

// Mood settings — each mood maps to API filters
const MOOD_SETTINGS = {
    tired:      { maxReadyTime: 15, label: "Quick Recipes" },
    hungry:     { minCalories: 500, label: "Filling Meals" },
    healthy:    { maxCalories: 400, label: "Healthy Options" },
    muscle:     { minProtein: 30,   label: "High Protein"  },
    vegetarian: { diet: "vegetarian", label: "Vegetarian"  },
    lazy:       { maxIngredients: 5, label: "Minimal Effort" },
};

// When user clicks a mood card
function goToMood(mood) {
    localStorage.setItem("cs_search_type", "mood");
    localStorage.setItem("cs_search_value", mood);
    window.location.href = "results.html";
}


// --------------------------------
// STATS BAR
// --------------------------------

// Load and display stats from LocalStorage
function loadStats() {

    // Streak
    const profile = getData(KEYS.PROFILE);
    const streak  = profile ? profile.streak : 0;
    const dishes  = profile ? profile.totalDishes : 0;
    document.getElementById("streakVal").textContent = streak;
    document.getElementById("dishVal").textContent   = dishes;

    // Budget remaining
    const budget = getData(KEYS.BUDGET);
    if (budget) {
        const remaining = budget.monthly - budget.spent;
        document.getElementById("budgetVal").textContent = "₹" + remaining;
    }

    // Fridge health
    const fridge = getData(KEYS.FRIDGE) || [];
    if (fridge.length > 0) {
        const score = calcFridgeHealth(fridge);
        document.getElementById("fridgeVal").textContent = score + "%";
    }
}

// Calculate fridge health percentage
function calcFridgeHealth(items) {
    const today = new Date();
    let freshCount = 0;

    items.forEach(item => {
        const expiry = new Date(item.expiry);
        const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
        if (daysLeft > 2) freshCount++;
    });

    return Math.round((freshCount / items.length) * 100);
}


// --------------------------------
// RUN ON PAGE LOAD
// --------------------------------
document.addEventListener("DOMContentLoaded", () => {
    loadStats();
});