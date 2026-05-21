// CookSmart - Results Page Logic

// --------------------------------
// MOOD TO API PARAMS MAPPING
// --------------------------------

const MOOD_PARAMS = {
    tired:      { maxReadyTime: 15 },
    hungry:     { minCalories: 500 },
    healthy:    { maxCalories: 400 },
    muscle:     { minProtein: 30   },
    vegetarian: { diet: "vegetarian" },
    lazy:       { maxIngredients: 5  },
};

const MOOD_LABELS = {
    tired:      "Quick Recipes (Under 15 min)",
    hungry:     "Filling Meals",
    healthy:    "Healthy Options",
    muscle:     "High Protein Recipes",
    vegetarian: "Vegetarian Recipes",
    lazy:       "Minimal Effort Recipes",
};


// --------------------------------
// MAIN — DECIDE WHAT TO SEARCH
// --------------------------------

document.addEventListener("DOMContentLoaded", () => {

    // Read what user selected on home page
    const type  = localStorage.getItem("cs_search_type");
    const value = localStorage.getItem("cs_search_value");

    // If nothing saved, go back home
    if (!type || !value) {
        window.location.href = "index.html";
        return;
    }

    // Call correct function based on type
    if (type === "query")   searchByQuery(value);
    if (type === "cuisine") searchByCuisine(value);
    if (type === "mood")    searchByMood(value);
});


// --------------------------------
// SEARCH BY QUERY
// --------------------------------

async function searchByQuery(query) {

    // Update page title
    document.getElementById("resultsTitle").textContent
        = `Results for "${query}"`;

    // Build API URL
    const url = `${CONFIG.SPOONACULAR_BASE}/recipes/complexSearch`
        + `?apiKey=${CONFIG.SPOONACULAR_KEY}`
        + `&query=${query}`
        + `&number=10`
        + `&addRecipeInformation=true`;

    await fetchAndDisplay(url);
}


// --------------------------------
// SEARCH BY CUISINE
// --------------------------------

async function searchByCuisine(cuisine) {

    document.getElementById("resultsTitle").textContent
        = `${cuisine} Recipes`;

    const url = `${CONFIG.SPOONACULAR_BASE}/recipes/complexSearch`
        + `?apiKey=${CONFIG.SPOONACULAR_KEY}`
        + `&cuisine=${cuisine}`
        + `&number=10`
        + `&addRecipeInformation=true`;

    await fetchAndDisplay(url);
}


// --------------------------------
// SEARCH BY MOOD
// --------------------------------

async function searchByMood(mood) {

    document.getElementById("resultsTitle").textContent
        = MOOD_LABELS[mood] || "Recipes";

    // Get API params for this mood
    const params = MOOD_PARAMS[mood] || {};

    // Build query string from params object
    let paramString = "";
    for (const key in params) {
        paramString += `&${key}=${params[key]}`;
    }

    const url = `${CONFIG.SPOONACULAR_BASE}/recipes/complexSearch`
        + `?apiKey=${CONFIG.SPOONACULAR_KEY}`
        + `&number=10`
        + `&addRecipeInformation=true`
        + paramString;

    await fetchAndDisplay(url);
}


// --------------------------------
// FETCH FROM API AND DISPLAY
// --------------------------------

async function fetchAndDisplay(url) {

    const container = document.getElementById("resultsContainer");

    try {
        // Call Spoonacular API
        const response = await fetch(url);

        // Check if API call worked
        if (!response.ok) throw new Error("API call failed");

        const data = await response.json();

        // If no results found
        if (!data.results || data.results.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="icon">🍽️</div>
                    <h3>No recipes found</h3>
                    <p>Try a different search or cuisine</p>
                </div>
            `;
            return;
        }

        // Display the results
        displayResults(data.results);

    } catch (error) {
        // Show error message
        container.innerHTML = `
            <div class="error-box">
                ⚠️ Could not load recipes. Check your API key or internet connection.
            </div>
        `;
    }
}


// --------------------------------
// DISPLAY RECIPE CARDS
// --------------------------------

function displayResults(recipes) {

    const container = document.getElementById("resultsContainer");

    // Build grid of recipe cards
    let html = `<div class="results-grid">`;

    recipes.forEach(recipe => {

        // Get cooking time
        const time = recipe.readyInMinutes
            ? `⏱ ${recipe.readyInMinutes} min`
            : "⏱ N/A";

        // Get servings
        const servings = recipe.servings
            ? `🍽️ ${recipe.servings} servings`
            : "";

        // Get diet label if any
        const diet = recipe.vegetarian
            ? `<span class="badge badge-success">Vegetarian</span>`
            : "";

        html += `
            <div class="recipe-card" onclick="goToRecipe(${recipe.id})">
                <img
                    src="${recipe.image}"
                    alt="${recipe.title}"
                    onerror="this.src='https://via.placeholder.com/400x180?text=No+Image'"
                />
                <div class="recipe-card-body">
                    <h3>${recipe.title}</h3>
                    <div class="recipe-meta">
                        <span>${time}</span>
                        <span>${servings}</span>
                    </div>
                    <div style="margin-top: 8px;">
                        ${diet}
                    </div>
                </div>
            </div>
        `;
    });

    html += `</div>`;
    container.innerHTML = html;
}


// --------------------------------
// GO TO DISH DETAIL
// --------------------------------

function goToRecipe(recipeId) {
    // Save selected recipe ID
    localStorage.setItem("cs_recipe_id", recipeId);
    // Go to dish detail page
    window.location.href = "dish-detail.html";
}