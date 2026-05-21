// CookSmart - Profile Page Logic

// All achievements definition
const ALL_ACHIEVEMENTS = [
    {
        id:   "first_cook",
        icon: "🏅",
        name: "First Cook",
        desc: "Cook your first dish",
    },
    {
        id:   "ten_dishes",
        icon: "🍽️",
        name: "10 Dishes",
        desc: "Cook 10 dishes total",
    },
    {
        id:   "week_warrior",
        icon: "🔥",
        name: "Week Warrior",
        desc: "Cook 7 days in a row",
    },
    {
        id:   "hostel_chef",
        icon: "👨‍🍳",
        name: "Hostel Chef",
        desc: "Cook 50 dishes total",
    },
    {
        id:   "budget_master",
        icon: "💰",
        name: "Budget Master",
        desc: "Stay under budget for a month",
    },
    {
        id:   "saver",
        icon: "🌱",
        name: "Smart Saver",
        desc: "Save 5 recipes to cookbook",
    },
];

// Title based on dishes cooked
const TITLES = [
    { min: 0,  title: "Beginner Cook"  },
    { min: 5,  title: "Home Cook"      },
    { min: 15, title: "Smart Saver"    },
    { min: 30, title: "Budget Master"  },
    { min: 50, title: "Hostel Chef"    },
];


// --------------------------------
// LOAD ON PAGE START
// --------------------------------

document.addEventListener("DOMContentLoaded", () => {
    loadProfile();
    loadAchievements();
    loadCookbook();
    loadPreferences();
});


// --------------------------------
// LOAD PROFILE STATS
// --------------------------------

function loadProfile() {

    const profile = getData(KEYS.PROFILE) || {
        name:        "Student",
        totalDishes: 0,
        streak:      0,
        lastCooked:  null,
    };

    // Update name
    document.getElementById("profileName").textContent
        = profile.name || "Student";

    // Update title based on dishes cooked
    const title = getTitle(profile.totalDishes);
    document.getElementById("profileTitle").textContent
        = title;

    // Update stats
    document.getElementById("statDishes").textContent
        = profile.totalDishes;

    document.getElementById("statStreak").textContent
        = profile.streak + "🔥";

    // Saved recipes count
    const cookbook = getData(KEYS.COOKBOOK) || [];
    document.getElementById("statSaved").textContent
        = cookbook.length;
}


// --------------------------------
// GET TITLE BASED ON DISHES
// --------------------------------

function getTitle(dishes) {
    let title = TITLES[0].title;

    TITLES.forEach(t => {
        if (dishes >= t.min) title = t.title;
    });

    return title;
}


// --------------------------------
// SAVE NAME
// --------------------------------

function saveName() {

    const input = document.getElementById("nameInput");
    const name  = input.value.trim();

    if (!name) {
        showToast("Please enter your name", "error");
        return;
    }

    let profile = getData(KEYS.PROFILE) || {
        name:        "Student",
        totalDishes: 0,
        streak:      0,
        lastCooked:  null,
    };

    profile.name = name;
    saveData(KEYS.PROFILE, profile);

    // Update display
    document.getElementById("profileName").textContent = name;

    input.value = "";
    showToast("Name saved ✅", "success");
}


// --------------------------------
// LOAD ACHIEVEMENTS
// --------------------------------

function loadAchievements() {

    const unlocked     = getData(KEYS.ACHIEVEMENTS) || [];
    const grid         = document.getElementById("achievementsGrid");

    let html = "";

    ALL_ACHIEVEMENTS.forEach(a => {
        const isUnlocked = unlocked.includes(a.id);

        html += `
            <div class="achievement-card ${isUnlocked ? "unlocked" : "locked"}">
                <div class="achievement-icon">
                    ${isUnlocked ? a.icon : "🔒"}
                </div>
                <div>
                    <div class="achievement-name">${a.name}</div>
                    <div class="achievement-desc">${a.desc}</div>
                </div>
            </div>
        `;
    });

    grid.innerHTML = html;
}


// --------------------------------
// LOAD COOKBOOK
// --------------------------------

function loadCookbook() {

    const cookbook = getData(KEYS.COOKBOOK) || [];
    const list     = document.getElementById("cookbookList");

    if (cookbook.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <div class="icon">❤️</div>
                <h3>No saved recipes</h3>
                <p>Save recipes from dish detail page</p>
            </div>
        `;
        return;
    }

    let html = `<div class="cookbook-grid">`;

    cookbook.forEach(recipe => {
        html += `
            <div class="cookbook-card"
                onclick="goToRecipe(${recipe.id})">
                <img
                    src="${recipe.image}"
                    alt="${recipe.title}"
                    onerror="this.src='https://via.placeholder.com/300x130?text=No+Image'"
                />
                <div class="cookbook-card-name">
                    ❤️ ${recipe.title}
                </div>
            </div>
        `;
    });

    html += `</div>`;
    list.innerHTML = html;
}

// Go to dish detail from cookbook
function goToRecipe(id) {
    localStorage.setItem("cs_recipe_id", id);
    window.location.href = "dish-detail.html";
}


// --------------------------------
// LOAD PREFERENCES
// --------------------------------

function loadPreferences() {

    const prefs = getData(KEYS.PREFS) || {};

    document.getElementById("prefVeg").checked
        = prefs.vegetarian || false;

    document.getElementById("prefVegan").checked
        = prefs.vegan || false;

    document.getElementById("prefGluten").checked
        = prefs.glutenFree || false;

    document.getElementById("prefDairy").checked
        = prefs.dairyFree || false;
}


// --------------------------------
// SAVE PREFERENCES
// --------------------------------

function savePreferences() {

    const prefs = {
        vegetarian: document.getElementById("prefVeg").checked,
        vegan:      document.getElementById("prefVegan").checked,
        glutenFree: document.getElementById("prefGluten").checked,
        dairyFree:  document.getElementById("prefDairy").checked,
    };

    saveData(KEYS.PREFS, prefs);
    showToast("Preferences saved ✅", "success");
}


// --------------------------------
// RESET ALL DATA
// --------------------------------

function resetAll() {

    // Confirm before deleting
    const confirm = window.confirm(
        "Are you sure? This will delete all your data."
    );

    if (!confirm) return;

    // Clear all LocalStorage keys
    Object.values(KEYS).forEach(key => {
        localStorage.removeItem(key);
    });

    localStorage.removeItem("cs_darkmode");
    localStorage.removeItem("cs_recipe_id");
    localStorage.removeItem("cs_search_type");
    localStorage.removeItem("cs_search_value");

    showToast("All data reset ✅", "success");

    // Reload page
    setTimeout(() => {
        window.location.reload();
    }, 1000);
}