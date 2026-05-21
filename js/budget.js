// CookSmart - Budget Tracker Logic


// --------------------------------
// LOAD ON PAGE START
// --------------------------------

document.addEventListener("DOMContentLoaded", () => {
    loadBudgetPage();
});


// --------------------------------
// LOAD FULL BUDGET PAGE
// --------------------------------

function loadBudgetPage() {

    const budget = getData(KEYS.BUDGET) || {
        monthly: 0,
        spent:   0,
        history: [],
    };

    // Fill budget input with saved value
    if (budget.monthly > 0) {
        document.getElementById("budgetInput").value
            = budget.monthly;
    }

    // Update overview cards
    updateOverview(budget);

    // Update history list
    renderHistory(budget.history);
}


// --------------------------------
// SET MONTHLY BUDGET
// --------------------------------

function setMonthlyBudget() {

    const input  = document.getElementById("budgetInput");
    const amount = parseFloat(input.value);

    // Validate
    if (!amount || amount <= 0) {
        showToast("Please enter a valid budget", "error");
        return;
    }

    // Get existing budget data
    let budget = getData(KEYS.BUDGET) || {
        monthly: 0,
        spent:   0,
        history: [],
    };

    // Update monthly limit
    budget.monthly = amount;
    saveData(KEYS.BUDGET, budget);

    showToast(`Budget set to ₹${amount} ✅`, "success");

    // Refresh page display
    loadBudgetPage();
}


// --------------------------------
// ADD EXPENSE MANUALLY
// --------------------------------

function addExpense() {

    const dish   = document.getElementById("expenseDish").value.trim();
    const amount = parseFloat(
        document.getElementById("expenseAmount").value
    );

    // Validate
    if (!dish) {
        showToast("Please enter dish name", "error");
        return;
    }

    if (!amount || amount <= 0) {
        showToast("Please enter valid amount", "error");
        return;
    }

    // Get existing budget
    let budget = getData(KEYS.BUDGET) || {
        monthly: 0,
        spent:   0,
        history: [],
    };

    // Add to spent total
    budget.spent += amount;

    // Add to history
    budget.history.push({
        id:     Date.now(),
        dish:   dish,
        amount: amount,
        date:   new Date().toLocaleDateString(),
    });

    saveData(KEYS.BUDGET, budget);

    // Clear inputs
    document.getElementById("expenseDish").value   = "";
    document.getElementById("expenseAmount").value = "";

    showToast(`₹${amount} added for ${dish}`, "success");

    // Refresh display
    loadBudgetPage();
}


// --------------------------------
// DELETE EXPENSE
// --------------------------------

function deleteExpense(id) {

    let budget = getData(KEYS.BUDGET) || {
        monthly: 0,
        spent:   0,
        history: [],
    };

    // Find the item to get its amount
    const item = budget.history.find(h => h.id === id);

    if (item) {
        // Subtract from spent total
        budget.spent -= item.amount;
        if (budget.spent < 0) budget.spent = 0;

        // Remove from history
        budget.history = budget.history.filter(h => h.id !== id);

        saveData(KEYS.BUDGET, budget);
        showToast("Expense removed", "warning");
        loadBudgetPage();
    }
}


// --------------------------------
// UPDATE OVERVIEW CARDS
// --------------------------------

function updateOverview(budget) {

    const remaining = budget.monthly - budget.spent;

    // Update cards
    document.getElementById("totalBudget").textContent
        = "₹" + budget.monthly;

    document.getElementById("totalSpent").textContent
        = "₹" + budget.spent.toFixed(2);

    document.getElementById("totalRemaining").textContent
        = "₹" + (remaining > 0 ? remaining.toFixed(2) : 0);

    // Update progress bar
    updateProgressBar(budget);

    // Show warning if over budget
    showBudgetWarning(budget);
}


// --------------------------------
// UPDATE PROGRESS BAR
// --------------------------------

function updateProgressBar(budget) {

    if (budget.monthly === 0) return;

    const percent = Math.min(
        Math.round((budget.spent / budget.monthly) * 100),
        100
    );

    const bar = document.getElementById("budgetBar");
    bar.style.width = percent + "%";

    // Change color based on usage
    if (percent >= 90) {
        bar.style.background = "var(--danger)";
    } else if (percent >= 70) {
        bar.style.background = "var(--warning)";
    } else {
        bar.style.background = "var(--success)";
    }

    // Update labels
    document.getElementById("progressPercent").textContent
        = percent + "%";

    document.getElementById("progressText").textContent
        = `${percent}% of budget used`;
}


// --------------------------------
// SHOW BUDGET WARNING
// --------------------------------

function showBudgetWarning(budget) {

    // Remove existing warning if any
    const existing = document.querySelector(".budget-warning");
    if (existing) existing.remove();

    if (budget.monthly === 0) return;

    const percent = (budget.spent / budget.monthly) * 100;

    // Show warning when over 80%
    if (percent >= 80) {

        const warning = document.createElement("div");
        warning.className = "budget-warning";

        if (percent >= 100) {
            warning.textContent
                = "⚠️ You have exceeded your monthly budget!";
        } else {
            warning.textContent
                = `⚠️ Warning — You have used ${Math.round(percent)}% of your budget`;
        }

        // Insert before history section
        const heading = document.querySelector(".section-heading");
        heading.before(warning);
    }
}


// --------------------------------
// RENDER HISTORY LIST
// --------------------------------

function renderHistory(history) {

    const list = document.getElementById("historyList");

    if (!history || history.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <div class="icon">💰</div>
                <h3>No expenses yet</h3>
                <p>Start cooking to track your spending</p>
            </div>
        `;
        return;
    }

    // Show newest first
    const sorted = [...history].reverse();

    let html = `<div class="history-list">`;

    sorted.forEach(item => {
        html += `
            <div class="history-item">
                <div class="history-left">
                    <div class="history-dish">
                        🍽️ ${item.dish}
                    </div>
                    <div class="history-date">
                        📅 ${item.date}
                    </div>
                </div>
                <div class="history-right">
                    <span class="history-amount">
                        ₹${item.amount}
                    </span>
                    <button
                        class="history-delete"
                        onclick="deleteExpense(${item.id})">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    });

    html += `</div>`;
    list.innerHTML = html;
}