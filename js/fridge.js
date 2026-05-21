// CookSmart - Fridge Tracker Logic


// --------------------------------
// LOAD ON PAGE START
// --------------------------------

document.addEventListener("DOMContentLoaded", () => {
    renderFridge();
});


// --------------------------------
// ADD INGREDIENT
// --------------------------------

function addIngredient() {

    // Get input values
    const name   = document.getElementById("ingName").value.trim();
    const qty    = document.getElementById("ingQty").value.trim();
    const expiry = document.getElementById("ingExpiry").value;

    // Validate — all fields required
    if (!name || !qty || !expiry) {
        showToast("Please fill all fields", "error");
        return;
    }

    // Get existing fridge items
    let fridge = getData(KEYS.FRIDGE) || [];

    // Add new item
    fridge.push({
        id:     Date.now(), // unique id using timestamp
        name:   name,
        qty:    qty,
        expiry: expiry,
    });

    // Save to LocalStorage
    saveData(KEYS.FRIDGE, fridge);

    // Clear inputs
    document.getElementById("ingName").value   = "";
    document.getElementById("ingQty").value    = "";
    document.getElementById("ingExpiry").value = "";

    showToast(`${name} added to fridge ✅`, "success");

    // Refresh fridge display
    renderFridge();
}


// --------------------------------
// DELETE INGREDIENT
// --------------------------------

function deleteIngredient(id) {

    let fridge = getData(KEYS.FRIDGE) || [];

    // Remove item with matching id
    fridge = fridge.filter(item => item.id !== id);

    saveData(KEYS.FRIDGE, fridge);
    showToast("Item removed", "warning");
    renderFridge();
}


// --------------------------------
// GET ITEM STATUS
// Based on days until expiry
// --------------------------------

function getStatus(expiryDate) {

    const today    = new Date();
    today.setHours(0, 0, 0, 0);

    const expiry   = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);

    const daysLeft = Math.ceil(
        (expiry - today) / (1000 * 60 * 60 * 24)
    );

    if (daysLeft < 0)  return { status: "expired", days: daysLeft, label: "Expired" };
    if (daysLeft <= 2) return { status: "soon",    days: daysLeft, label: `Expires in ${daysLeft} day(s)` };
    return              { status: "fresh",   days: daysLeft, label: `Fresh — ${daysLeft} days left` };
}


// --------------------------------
// CALCULATE FRIDGE HEALTH
// --------------------------------

function calcHealth(fridge) {

    if (fridge.length === 0) return 100;

    let freshCount = 0;

    fridge.forEach(item => {
        const { status } = getStatus(item.expiry);
        if (status === "fresh") freshCount++;
    });

    return Math.round((freshCount / fridge.length) * 100);
}


// --------------------------------
// RENDER FRIDGE
// Main display function
// --------------------------------

function renderFridge() {

    const fridge = getData(KEYS.FRIDGE) || [];

    // Update health score
    updateHealthScore(fridge);

    // Update expiry alerts
    updateAlerts(fridge);

    // Render items list
    const list = document.getElementById("fridgeList");

    if (fridge.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <div class="icon">🧊</div>
                <h3>Your fridge is empty</h3>
                <p>Add ingredients to start tracking</p>
            </div>
        `;
        return;
    }

    // Sort items — expired first, then soon, then fresh
    const sorted = fridge.sort((a, b) => {
        const order = { expired: 0, soon: 1, fresh: 2 };
        return order[getStatus(a.expiry).status]
             - order[getStatus(b.expiry).status];
    });

    let html = `<div class="fridge-list">`;

    sorted.forEach(item => {
        const { status, label } = getStatus(item.expiry);

        html += `
            <div class="fridge-item ${status}">
                <div class="fridge-item-info">
                    <div class="fridge-item-name">
                        ${getStatusEmoji(status)} ${item.name}
                    </div>
                    <div class="fridge-item-qty">
                        ${item.qty}
                    </div>
                    <div class="fridge-item-expiry">
                        ${label}
                    </div>
                </div>
                <button
                    class="fridge-item-delete"
                    onclick="deleteIngredient(${item.id})">
                    🗑️
                </button>
            </div>
        `;
    });

    html += `</div>`;
    list.innerHTML = html;
}


// --------------------------------
// UPDATE HEALTH SCORE DISPLAY
// --------------------------------

function updateHealthScore(fridge) {

    const score   = calcHealth(fridge);
    const bar     = document.getElementById("healthBar");
    const scoreEl = document.getElementById("healthScore");
    const msgEl   = document.getElementById("healthMsg");

    scoreEl.textContent      = score + "%";
    bar.style.width          = score + "%";

    // Change bar color based on score
    if (score >= 70) {
        bar.style.background = "var(--success)";
        msgEl.textContent    = "Your fridge is in great shape! 🟢";
    } else if (score >= 40) {
        bar.style.background = "var(--warning)";
        msgEl.textContent    = "Some items need attention 🟡";
    } else {
        bar.style.background = "var(--danger)";
        msgEl.textContent    = "Several items are expiring or expired 🔴";
    }
}


// --------------------------------
// UPDATE EXPIRY ALERTS
// --------------------------------

function updateAlerts(fridge) {

    const alertDiv   = document.getElementById("expiryAlert");
    const recipeBtn  = document.getElementById("expiringRecipeSection");

    const expiring = fridge.filter(item => {
        const { status } = getStatus(item.expiry);
        return status === "soon" || status === "expired";
    });

    if (expiring.length === 0) {
        alertDiv.style.display  = "none";
        recipeBtn.style.display = "none";
        return;
    }

    // Build alert messages
    let html = "";

    // Expired items
    const expired = expiring.filter(
        i => getStatus(i.expiry).status === "expired"
    );

    if (expired.length > 0) {
        const names = expired.map(i => i.name).join(", ");
        html += `
            <div class="expiry-alert danger">
                🔴 Expired: ${names} — Please discard these items
            </div>
        `;
    }

    // Expiring soon items
    const soon = expiring.filter(
        i => getStatus(i.expiry).status === "soon"
    );

    if (soon.length > 0) {
        const names = soon.map(i => i.name).join(", ");
        html += `
            <div class="expiry-alert warning">
                🟡 Use Soon: ${names} — Expiring within 2 days
            </div>
        `;
    }

    alertDiv.innerHTML    = html;
    alertDiv.style.display = "block";

    // Show find recipes button for soon items
    if (soon.length > 0) {
        recipeBtn.style.display = "block";
    }
}


// --------------------------------
// FIND RECIPES WITH EXPIRING ITEMS
// Calls Spoonacular with expiring
// ingredient names
// --------------------------------

async function findRecipesWithExpiring() {

    const fridge = getData(KEYS.FRIDGE) || [];

    // Get only expiring soon items
    const expiring = fridge
        .filter(item => getStatus(item.expiry).status === "soon")
        .map(item => item.name);

    if (expiring.length === 0) {
        showToast("No expiring items found", "warning");
        return;
    }

    // Join ingredient names for API
    const ingredients = expiring.join(",");

    showToast("Finding recipes...", "success");

    // Save search and go to results
    localStorage.setItem("cs_search_type",  "query");
    localStorage.setItem("cs_search_value", expiring[0]);
    window.location.href = "results.html";
}


// --------------------------------
// HELPER — STATUS EMOJI
// --------------------------------

function getStatusEmoji(status) {
    if (status === "fresh")   return "🟢";
    if (status === "soon")    return "🟡";
    if (status === "expired") return "🔴";
    return "";
}