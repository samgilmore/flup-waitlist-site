import "./styles/base.css";
import "./styles/admin.css";
import { escapeHtml } from "./lib/html.js";
import {
  createAdminClient,
  fetchAdminWaitlist,
  signInAdmin,
  signOutAdmin,
  updateAdminUserStatus
} from "./lib/admin-api.js";

const adminApp = document.querySelector("#admin-app");
const client = createAdminClient();

adminApp.innerHTML = `
  <main class="admin-shell">
    <section class="admin-auth" id="admin-auth">
      <section class="admin-panel admin-panel--auth">
        <div class="admin-copy">
          <p class="eyebrow">Hidden route</p>
          <h1>Admin sign in</h1>
          <p>Protected FLUP waitlist controls for reviewing signups, referrals, and early-access eligibility.</p>
        </div>

        <form class="admin-form" id="admin-form">
          <label for="admin-email">Admin email</label>
          <input id="admin-email" name="email" type="email" autocomplete="email" required />

          <label for="admin-password">Password</label>
          <input id="admin-password" name="password" type="password" autocomplete="current-password" required />

          <div class="admin-form-actions">
            <button type="submit">Try sign in</button>
          </div>
        </form>

        <p class="admin-message" id="admin-message" aria-live="polite" hidden></p>
      </section>
    </section>

    <section class="admin-dashboard" id="admin-dashboard" hidden>
      <section class="admin-panel admin-panel--dashboard">
        <div class="admin-toolbar">
          <div>
            <p class="eyebrow">Waitlist overview</p>
            <h2>Signups and referrals</h2>
          </div>
          <button class="secondary-button" id="sign-out-button" type="button">Sign out</button>
        </div>

        <form class="admin-filters" id="admin-filters">
          <label for="admin-search">Search</label>
          <input id="admin-search" name="search" type="search" placeholder="Search by email" />

          <label for="admin-threshold">Threshold</label>
          <select id="admin-threshold" name="threshold">
            <option value="">All users</option>
            <option value="5">5+ referrals</option>
            <option value="10">10+ referrals</option>
          </select>

          <div class="admin-filter-actions">
            <button type="submit">Refresh data</button>
          </div>
        </form>

        <div class="admin-table-shell">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Referrals</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody id="admin-table-body">
              <tr>
                <td colspan="5">Sign in to load waitlist data.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="admin-message admin-message--dashboard" id="admin-dashboard-message" aria-live="polite" hidden></p>
      </section>
    </section>
  </main>
`;

const adminForm = document.querySelector("#admin-form");
const authPanel = document.querySelector("#admin-auth");
const dashboard = document.querySelector("#admin-dashboard");
const adminMessage = document.querySelector("#admin-message");
const dashboardMessage = document.querySelector("#admin-dashboard-message");
const adminTableBody = document.querySelector("#admin-table-body");
const filtersForm = document.querySelector("#admin-filters");
const signOutButton = document.querySelector("#sign-out-button");
const rewardThreshold = 5;
const statusOptions = [
  ["waiting", "Waiting"],
  ["early_access", "Early access"],
  ["invited", "Invited"],
  ["archived", "Archived"]
];

function setMessage(message, tone = "neutral") {
  const target = dashboard.hidden ? adminMessage : dashboardMessage;
  const inactive = dashboard.hidden ? dashboardMessage : adminMessage;

  inactive.hidden = true;
  inactive.textContent = "";
  inactive.dataset.tone = "neutral";

  target.hidden = !message;
  target.dataset.tone = tone;
  target.textContent = message;
}

function setAdminState(mode) {
  const signedIn = mode === "dashboard";
  authPanel.hidden = signedIn;
  dashboard.hidden = !signedIn;
}

function getFriendlyError(error) {
  if (!(error instanceof Error)) {
    return "Unable to load admin access.";
  }

  if (/(401|admin access denied|invalid admin session|jwt|forbidden)/i.test(error.message)) {
    return "This account is not authorized for the admin dashboard.";
  }

  return error.message;
}

function renderEmptyState(message) {
  adminTableBody.innerHTML = `
    <tr>
      <td colspan="5">${escapeHtml(message)}</td>
    </tr>
  `;
}

function renderRow(row) {
  const statusMarkup = statusOptions
    .map(
      ([value, label]) => `
        <option value="${value}" ${row.status === value ? "selected" : ""}>${label}</option>
      `
    )
    .join("");
  const eligibilityMarkup =
    row.referral_count >= rewardThreshold
      ? `<span class="admin-pill">Eligible for early access</span>`
      : "";

  return `
    <tr data-user-id="${row.id}">
      <td>
        <div class="admin-user-cell">
          <strong>${escapeHtml(row.email)}</strong>
          <span>${escapeHtml(row.first_name || "No first name yet")}</span>
        </div>
      </td>
      <td>
        <div class="admin-referral-cell">
          <strong>${row.referral_count}</strong>
          ${eligibilityMarkup}
        </div>
      </td>
      <td>
        <select class="admin-status-select" aria-label="Update status for ${escapeHtml(row.email)}">
          ${statusMarkup}
        </select>
      </td>
      <td>${new Date(row.created_at).toLocaleDateString()}</td>
      <td>
        <button class="admin-save-button" type="button">Save</button>
      </td>
    </tr>
  `;
}

function renderRows(rows) {
  if (!rows.length) {
    renderEmptyState("No matching users yet.");
    return;
  }

  adminTableBody.innerHTML = rows.map((row) => renderRow(row)).join("");
}

async function loadTable() {
  const formData = new FormData(filtersForm);
  const params = {
    search: String(formData.get("search") ?? ""),
    threshold: String(formData.get("threshold") ?? "")
  };

  const rows = await fetchAdminWaitlist(client, params);
  renderRows(rows);
}

adminForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(adminForm);

  try {
    setMessage("Signing in...");
    await signInAdmin(client, {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? "")
    });
    await loadTable();
    setAdminState("dashboard");
    setMessage("Admin session active.");
  } catch (error) {
    await signOutAdmin(client);
    setAdminState("auth");
    renderEmptyState("Sign in to load waitlist data.");
    setMessage(getFriendlyError(error), "error");
  }
});

filtersForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    setMessage("Refreshing waitlist data...");
    await loadTable();
    setMessage("Waitlist data refreshed.");
  } catch (error) {
    setMessage(error.message, "error");
  }
});

signOutButton.addEventListener("click", async () => {
  await signOutAdmin(client);
  setAdminState("auth");
  renderEmptyState("Sign in to load waitlist data.");
  setMessage("Signed out.");
});

adminTableBody.addEventListener("click", async (event) => {
  const button = event.target.closest(".admin-save-button");

  if (!button) {
    return;
  }

  const row = button.closest("tr");
  const select = row?.querySelector(".admin-status-select");

  if (!row || !select) {
    return;
  }

  button.disabled = true;
  select.disabled = true;

  try {
    setMessage("Saving status change...");
    await updateAdminUserStatus(client, {
      userId: row.dataset.userId,
      status: select.value
    });
    await loadTable();
    setMessage("Waitlist status updated.");
  } catch (error) {
    setMessage(error.message, "error");
  } finally {
    button.disabled = false;
    select.disabled = false;
  }
});

async function initializeAdminSession() {
  if (client.missingConfig) {
    setMessage("Add your Supabase frontend environment variables to enable admin access.", "error");
    return;
  }

  try {
    const sessionResult = await client.auth.getSession();

    if (!sessionResult.data.session) {
      setAdminState("auth");
      renderEmptyState("Sign in to load waitlist data.");
      return;
    }

    await loadTable();
    setAdminState("dashboard");
    setMessage("Admin session restored.");
  } catch (error) {
    await signOutAdmin(client);
    setAdminState("auth");
    renderEmptyState("Sign in to load waitlist data.");
    setMessage(getFriendlyError(error), "error");
  }
}

initializeAdminSession();
