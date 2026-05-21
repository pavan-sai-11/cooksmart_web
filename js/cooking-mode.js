// CookSmart - Cooking Mode Logic

// Global variables
let steps       = [];
let currentStep = 0;


// --------------------------------
// MAIN — LOAD ON PAGE START
// --------------------------------

document.addEventListener("DOMContentLoaded", () => {

    // Get saved dish from LocalStorage
    const dish = getData(KEYS.DISH);

    if (!dish) {
        window.location.href = "index.html";
        return;
    }

    // Get cooking steps from dish data
    if (
        dish.analyzedInstructions &&
        dish.analyzedInstructions.length > 0 &&
        dish.analyzedInstructions[0].steps.length > 0
    ) {
        steps = dish.analyzedInstructions[0].steps;
    } else {
        steps = [{
            number: 1,
            step: "No step by step instructions available. Please follow the video below."
        }];
    }

    // Load first step
    showStep(0);

    // Load YouTube video
    loadVideo(dish.title);
});


// --------------------------------
// SHOW A SPECIFIC STEP
// --------------------------------

function showStep(index) {

    const step = steps[index];

    // Update step number
    document.getElementById("stepNumber").textContent
        = `STEP ${step.number}`;

    // Update step text
    document.getElementById("stepText").textContent
        = step.step;

    // Update progress bar
    const percent = Math.round(((index + 1) / steps.length) * 100);
    document.getElementById("progressFill").style.width
        = percent + "%";

    // Update step counter
    document.getElementById("stepCounter").textContent
        = `Step ${index + 1} of ${steps.length}`;
}


// --------------------------------
// STEP NAVIGATION
// --------------------------------

function nextStep() {
    if (currentStep < steps.length - 1) {
        currentStep++;
        showStep(currentStep);
    } else {
        // Last step — show completion
        showCompletion();
    }
}

function prevStep() {
    if (currentStep > 0) {
        currentStep--;
        showStep(currentStep);
    }
}


// --------------------------------
// LOAD YOUTUBE VIDEO
// Filters for long videos only
// No shorts, no reels
// --------------------------------

async function loadVideo(dishName) {

    const url = `${CONFIG.YOUTUBE_BASE}/search`
        + `?key=${CONFIG.YOUTUBE_KEY}`
        + `&q=${encodeURIComponent(dishName + " recipe cooking")}`
        + `&part=snippet`
        + `&type=video`
        + `&videoDuration=long`
        + `&relevanceLanguage=en`
        + `&maxResults=1`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("YouTube API failed");

        const data = await response.json();

        if (data.items && data.items.length > 0) {
            const videoId = data.items[0].id.videoId;
            const title   = data.items[0].snippet.title;

            document.getElementById("videoContainer").innerHTML = `
                <div class="video-label">📹 ${title}</div>
                <iframe
                    src="https://www.youtube.com/embed/${videoId}"
                    frameborder="0"
                    allowfullscreen>
                </iframe>
            `;
        } else {
            document.getElementById("videoContainer").innerHTML = `
                <div class="video-placeholder">
                    📹 No video found for this dish
                </div>
            `;
        }

    } catch (error) {
        document.getElementById("videoContainer").innerHTML = `
            <div class="video-placeholder">
                📹 Could not load video
            </div>
        `;
    }
}


// --------------------------------
// SHOW COMPLETION PAGE
// --------------------------------

function showCompletion() {

    // Hide cooking view
    document.getElementById("cookingView").style.display    = "none";

    // Show completion view
    document.getElementById("completionView").style.display = "block";

    // Update title with dish name
    const dish = getData(KEYS.DISH);
    if (dish) {
        document.getElementById("completionTitle").textContent
            = `${dish.title} is Ready! 🎉`;
    }

    // Update profile
    updateProfile();

    // Check achievements
    checkAchievements();
}


// --------------------------------
// UPDATE PROFILE AFTER COOKING
// --------------------------------

function updateProfile() {

    let profile = getData(KEYS.PROFILE) || {
        name:        "Student",
        totalDishes: 0,
        streak:      0,
        lastCooked:  null,
    };

    // Add one dish
    profile.totalDishes++;

    // Update streak
    const today    = new Date().toDateString();
    const lastDate = profile.lastCooked;

    if (lastDate === null) {
        profile.streak = 1;
    } else {
        const diffDays = Math.round(
            (new Date() - new Date(lastDate)) / (1000 * 60 * 60 * 24)
        );

        if (diffDays === 1)      profile.streak++;
        else if (diffDays > 1)   profile.streak = 1;
    }

    profile.lastCooked = today;
    saveData(KEYS.PROFILE, profile);
}


// --------------------------------
// CHECK ACHIEVEMENTS
// --------------------------------

function checkAchievements() {

    const profile      = getData(KEYS.PROFILE);
    let   achievements = getData(KEYS.ACHIEVEMENTS) || [];
    const popup        = document.getElementById("achievementPopup");
    let   newOne       = null;

    if (profile.totalDishes === 1 && !achievements.includes("first_cook")) {
        achievements.push("first_cook");
        newOne = "🏅 First Cook — Cooked your first dish!";
    }
    else if (profile.totalDishes >= 10 && !achievements.includes("ten_dishes")) {
        achievements.push("ten_dishes");
        newOne = "🏅 10 Dishes — You are getting good!";
    }
    else if (profile.streak >= 7 && !achievements.includes("week_warrior")) {
        achievements.push("week_warrior");
        newOne = "🏅 Week Warrior — 7 day cooking streak!";
    }
    else if (profile.totalDishes >= 50 && !achievements.includes("hostel_chef")) {
        achievements.push("hostel_chef");
        newOne = "🏅 Hostel Chef — 50 dishes cooked!";
    }

    if (newOne) {
        saveData(KEYS.ACHIEVEMENTS, achievements);
        popup.textContent   = newOne;
        popup.style.display = "block";
        showToast(newOne, "success");
    }
}


// --------------------------------
// SAVE BUDGET ENTRY
// --------------------------------

function saveBudgetEntry() {

    const input  = document.getElementById("spentInput");
    const amount = parseFloat(input.value);

    if (!amount || amount <= 0) {
        showToast("Please enter a valid amount", "error");
        return;
    }

    const dish = getData(KEYS.DISH);
    const name = dish ? dish.title : "Unknown Dish";

    let budget = getData(KEYS.BUDGET) || {
        monthly: 3000,
        spent:   0,
        history: [],
    };

    budget.spent += amount;
    budget.history.push({
        dish:   name,
        amount: amount,
        date:   new Date().toLocaleDateString(),
    });

    saveData(KEYS.BUDGET, budget);
    showToast("Budget updated ✅", "success");
    input.value = "";
}