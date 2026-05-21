// CookSmart - Dish Detail Page Logic

// Substitutes data — based on common cooking knowledge
const SUBSTITUTES = {
    "egg":          "Use 1 mashed banana or 1 tbsp flax seeds + 3 tbsp water",
    "butter":       "Use equal amount of coconut oil or ghee",
    "milk":         "Use coconut milk or almond milk",
    "cream":        "Use milk + butter mixed together",
    "curd":         "Use milk + few drops of lemon juice",
    "cheese":       "Use paneer crumbled or nutritional yeast",
    "flour":        "Use rice flour or oat flour",
    "sugar":        "Use honey or jaggery in same amount",
    "oil":          "Use butter or ghee",
    "soy sauce":    "Use coconut aminos or worcestershire sauce",
    "lemon":        "Use same amount of white vinegar",
    "garlic":       "Use garlic powder — half the amount",
    "onion":        "Use onion powder or shallots",
    "tomato":       "Use tomato paste with some water",
    "paneer":       "Use tofu as direct substitute",
    "bread crumbs": "Use crushed crackers or oats",
};


// --------------------------------
// MAIN — LOAD DISH ON PAGE LOAD
// --------------------------------

document.addEventListener("DOMContentLoaded", () => {

    // Get saved recipe ID
    const recipeId = localStorage.getItem("cs_recipe_id");

    // If no ID found go back
    if (!recipeId) {
        window.location.href = "index.html";
        return;
    }

    // Fetch full recipe details from API
    fetchDishDetail(recipeId);
});


// --------------------------------
// FETCH DISH DETAIL FROM API
// --------------------------------

async function fetchDishDetail(id) {

    const url = `${CONFIG.SPOONACULAR_BASE}/recipes/${id}/information`
        + `?apiKey=${CONFIG.SPOONACULAR_KEY}`
        + `&includeNutrition=true`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed");

        const dish = await response.json();

        // Save full dish data for cooking mode
        saveData(KEYS.DISH, dish);

        // Now display everything
        displayDish(dish);

    } catch (error) {
        document.getElementById("dishContainer").innerHTML = `
            <div class="error-box">
                ⚠️ Could not load dish details. Please try again.
            </div>
        `;
    }
}


// --------------------------------
// DISPLAY FULL DISH
// --------------------------------

function displayDish(dish) {

    const container = document.getElementById("dishContainer");

    // Get nutrition values safely
    const nutrients  = dish.nutrition ? dish.nutrition.nutrients : [];
    const calories   = getNutrient(nutrients, "Calories");
    const protein    = getNutrient(nutrients, "Protein");
    const carbs      = getNutrient(nutrients, "Carbohydrates");
    const fat        = getNutrient(nutrients, "Fat");
    const fiber      = getNutrient(nutrients, "Fiber");

    // Check if already saved in cookbook
    const cookbook  = getData(KEYS.COOKBOOK) || [];
    const isSaved   = cookbook.some(r => r.id === dish.id);

    container.innerHTML = `

        <!-- Dish Image -->
        <img
            class="dish-img"
            src="${dish.image}"
            alt="${dish.title}"
            onerror="this.src='https://via.placeholder.com/800x280?text=No+Image'"
        />

        <!-- Title -->
        <h1 class="dish-title">${dish.title}</h1>

        <!-- Meta Info -->
        <div class="dish-meta">
            <span>⏱ ${dish.readyInMinutes} min</span>
            <span>🍽️ ${dish.servings} servings</span>
            <span>${dish.vegetarian ? "🌱 Vegetarian" : "🍗 Non-Vegetarian"}</span>
            <span>${dish.vegan ? "🌿 Vegan" : ""}</span>
        </div>

        <!-- Save Button -->
        <button
            class="save-btn ${isSaved ? "saved" : ""}"
            id="saveBtn"
            onclick="toggleSave(${dish.id}, '${dish.title}', '${dish.image}')">
            ${isSaved ? "❤️ Saved" : "🤍 Save to Cookbook"}
        </button>


        <!-- NUTRITION SECTION -->
        <div class="dish-section">
            <h2>📊 Nutritional Info (per serving)</h2>
            <div class="nutrition-grid">
                ${nutritionRow("Calories", calories, "kcal", 800)}
                ${nutritionRow("Protein",  protein,  "g",    50)}
                ${nutritionRow("Carbs",    carbs,    "g",    100)}
                ${nutritionRow("Fat",      fat,      "g",    70)}
                ${nutritionRow("Fiber",    fiber,    "g",    30)}
            </div>
        </div>


        <!-- INGREDIENTS SECTION -->
        <div class="dish-section">
            <h2>🥬 Ingredients</h2>
            <div class="ingredient-list" id="ingredientList">
                ${buildIngredientList(dish.extendedIngredients)}
            </div>

            <!-- Readiness Score -->
            <div class="readiness-box" id="readinessBox">
                <div class="readiness-percent" id="readinessPercent">100%</div>
                <div class="readiness-text">You have all ingredients!</div>
            </div>
        </div>


        <!-- SUBSTITUTES SECTION -->
        <div class="dish-section" id="substituteSection" style="display:none;">
            <h2>🔄 Substitute Suggestions</h2>
            <div id="substituteList"></div>
        </div>


        <!-- MISSING ITEMS SECTION -->
        <div class="dish-section" id="missingSection" style="display:none;">
            <h2>🛒 Order Missing Ingredients</h2>
            <p style="font-size:13px; color:var(--text-sub); margin-bottom:12px;">
                Keep this list open while ordering:
            </p>
            <div id="missingList"></div>

            <!-- Platform Buttons -->
            <div class="platform-grid">
                <button class="platform-btn" onclick="openPlatform('blinkit')">
                    🟡 Blinkit
                </button>
                <button class="platform-btn" onclick="openPlatform('bigbasket')">
                    🟢 BigBasket
                </button>
                <button class="platform-btn" onclick="openPlatform('instamart')">
                    🔵 Instamart
                </button>
                <button class="platform-btn" onclick="openPlatform('zepto')">
                    🟣 Zepto
                </button>
            </div>
        </div>


        <!-- ACTION BUTTONS -->
        <div class="action-row">
            <button class="btn btn-primary" onclick="startCooking()">
                👨‍🍳 Start Cooking
            </button>
        </div>
    `;

    // Set up checkbox listeners after HTML is built
    setupCheckboxes();
}


// --------------------------------
// BUILD INGREDIENT CHECKLIST
// --------------------------------

function buildIngredientList(ingredients) {
    let html = "";

    ingredients.forEach((ing, index) => {
        // Format amount nicely
        const amount = ing.measures.metric.amount.toFixed(1);
        const unit   = ing.measures.metric.unitShort || "";

        html += `
            <div class="ingredient-item" id="ing-${index}">
                <input
                    type="checkbox"
                    id="check-${index}"
                    checked
                    onchange="updateReadiness()"
                />
                <label for="check-${index}">
                    ${ing.name} — ${amount} ${unit}
                </label>
            </div>
        `;
    });

    return html;
}


// --------------------------------
// CHECKBOX LOGIC — UPDATE READINESS
// --------------------------------

function setupCheckboxes() {
    // Run once on load to set initial state
    updateReadiness();
}

function updateReadiness() {

    const items      = document.querySelectorAll(".ingredient-item");
    const total      = items.length;
    let   haveCount  = 0;
    const missing    = [];

    items.forEach((item, index) => {
        const checkbox = document.getElementById(`check-${index}`);
        const label    = item.querySelector("label");

        if (checkbox.checked) {
            // User has this ingredient
            haveCount++;
            item.classList.remove("missing");
        } else {
            // User is missing this ingredient
            item.classList.add("missing");
            missing.push(label.textContent.trim());
        }
    });

    // Calculate readiness percentage
    const percent = Math.round((haveCount / total) * 100);

    // Update readiness box
    document.getElementById("readinessPercent").textContent = percent + "%";
    document.querySelector(".readiness-text").textContent =
        percent === 100
            ? "You have all ingredients! Ready to cook 🎉"
            : `${total - haveCount} ingredient(s) missing`;

    // Show or hide substitutes and missing sections
    if (missing.length > 0) {
        showSubstitutes(missing);
        showMissingItems(missing);
    } else {
        document.getElementById("substituteSection").style.display = "none";
        document.getElementById("missingSection").style.display    = "none";
    }
}


// --------------------------------
// SHOW SUBSTITUTE SUGGESTIONS
// --------------------------------

function showSubstitutes(missingItems) {

    const section = document.getElementById("substituteSection");
    const list    = document.getElementById("substituteList");

    let html = "";
    let found = false;

    missingItems.forEach(item => {
        // Get ingredient name only (remove amount)
        const name = item.split("—")[0].trim().toLowerCase();

        // Check if we have a substitute
        const sub = findSubstitute(name);

        if (sub) {
            found = true;
            html += `
                <div class="substitute-item">
                    <div class="sub-missing">❌ Missing: ${name}</div>
                    <div class="sub-suggestion">✅ Use: ${sub}</div>
                </div>
            `;
        }
    });

    if (found) {
        section.style.display = "block";
        list.innerHTML = html;
    } else {
        section.style.display = "none";
    }
}

// Find substitute from our SUBSTITUTES object
function findSubstitute(ingredientName) {
    for (const key in SUBSTITUTES) {
        if (ingredientName.includes(key)) {
            return SUBSTITUTES[key];
        }
    }
    return null;
}


// --------------------------------
// SHOW MISSING ITEMS LIST
// --------------------------------

function showMissingItems(missingItems) {

    const section = document.getElementById("missingSection");
    const list    = document.getElementById("missingList");

    section.style.display = "block";

    let html = "";
    missingItems.forEach(item => {
        html += `
            <div style="
                padding: 10px 14px;
                background: var(--bg);
                border-radius: 8px;
                border: 1px solid var(--border);
                margin-bottom: 8px;
                font-size: 14px;
            ">
                ❌ ${item}
            </div>
        `;
    });

    list.innerHTML = html;
}


// --------------------------------
// OPEN GROCERY PLATFORM
// --------------------------------

function openPlatform(platform) {
    const urls = {
        blinkit:   "https://blinkit.com",
        bigbasket: "https://www.bigbasket.com",
        instamart: "https://www.swiggy.com/instamart",
        zepto:     "https://www.zepto.com",
    };
    window.open(urls[platform], "_blank");
}


// --------------------------------
// SAVE TO COOKBOOK
// --------------------------------

function toggleSave(id, title, image) {
    let cookbook = getData(KEYS.COOKBOOK) || [];
    const btn    = document.getElementById("saveBtn");

    const exists = cookbook.some(r => r.id === id);

    if (exists) {
        // Remove from cookbook
        cookbook = cookbook.filter(r => r.id !== id);
        btn.textContent = "🤍 Save to Cookbook";
        btn.classList.remove("saved");
        showToast("Removed from Cookbook", "warning");
    } else {
        // Add to cookbook
        cookbook.push({ id, title, image });
        btn.textContent = "❤️ Saved";
        btn.classList.add("saved");
        showToast("Saved to Cookbook ❤️", "success");
    }

    saveData(KEYS.COOKBOOK, cookbook);
}


// --------------------------------
// START COOKING
// --------------------------------

function startCooking() {
    window.location.href = "cooking-mode.html";
}


// --------------------------------
// HELPERS
// --------------------------------

// Get a specific nutrient value from nutrients array
function getNutrient(nutrients, name) {
    const found = nutrients.find(n => n.name === name);
    return found ? Math.round(found.amount) : 0;
}

// Build one nutrition bar row
function nutritionRow(label, value, unit, max) {
    const percent = Math.min(Math.round((value / max) * 100), 100);
    return `
        <div class="nutrition-row">
            <span class="nutrition-label">${label}</span>
            <span class="nutrition-value">${value}${unit}</span>
            <div class="progress-wrap">
                <div class="progress-fill" style="width: ${percent}%"></div>
            </div>
        </div>
    `;
}