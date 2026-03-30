import "./styles/base.css";
import "./styles/site.css";
import { valuePoints } from "./lib/content.js";
import { escapeHtml } from "./lib/html.js";
import { lookupWaitlist, signupWaitlist } from "./lib/api.js";
import { buildReferralLink, getReferralCodeFromUrl, getRewardProgress } from "./lib/referral-state.js";
import {
  getSavedReferralCode,
  getSavedWaitlistState,
  saveReferralCode,
  saveWaitlistState
} from "./lib/storage.js";

const app = document.querySelector("#app");

const valueMarkup = valuePoints
  .map(
    ({ title, description }) => `
      <article class="value-card">
        <h2>${title}</h2>
        <p>${description}</p>
      </article>
    `
  )
  .join("");

const savedReferralCode = getReferralCodeFromUrl(window.location.href) ?? getSavedReferralCode();
const savedWaitlistState = getSavedWaitlistState();

if (savedReferralCode) {
  saveReferralCode(window.localStorage, savedReferralCode);
}

app.innerHTML = `
  <main class="shell">
    <header class="topbar">
      <span class="brand-mark" aria-hidden="true">F</span>
      <span class="brand-copy">FLUP</span>
    </header>

    <section class="hero" aria-labelledby="hero-title">
      <div class="hero-copy">
        <p class="eyebrow">Waitlist now open</p>
        <h1 id="hero-title">Follow up like it matters.</h1>
        <p class="subcopy">A smarter way to keep relationships warm and your network moving.</p>
      </div>

      <aside class="hero-note" aria-label="Launch promise">
        <p class="hero-note-title">Get on the list</p>
        <p>Join for launch updates now. Hit five successful referrals and unlock early access.</p>
      </aside>
    </section>

    <section class="value-grid" aria-label="Why FLUP">
      ${valueMarkup}
    </section>

    <section class="signup-panel" aria-labelledby="signup-title">
      <div class="signup-copy">
        <p class="eyebrow">Join early</p>
        <h2 id="signup-title">Get launch updates before everyone else.</h2>
      </div>

      <form class="waitlist-form" id="waitlist-form">
        <label for="email">Email</label>
        <input id="email" name="email" type="email" autocomplete="email" required />
        <label for="first-name">First name <span class="field-optional">(optional)</span></label>
        <input id="first-name" name="firstName" type="text" autocomplete="given-name" />
        <button type="submit">Join the waitlist</button>
      </form>

      <button class="lookup-button" id="lookup-toggle" type="button">Check your status</button>

      <section class="lookup-panel" id="lookup-panel" hidden>
        <form class="lookup-form" id="lookup-form">
          <label for="lookup-email">Lookup email</label>
          <input id="lookup-email" name="email" type="email" autocomplete="email" required />
          <button type="submit">Find my invite</button>
        </form>
      </section>

      <section class="result-card" id="result-card" hidden aria-live="polite"></section>
      <p class="form-message" id="form-message" aria-live="polite"></p>
    </section>
  </main>
`;

const waitlistForm = document.querySelector("#waitlist-form");
const lookupForm = document.querySelector("#lookup-form");
const lookupPanel = document.querySelector("#lookup-panel");
const lookupToggle = document.querySelector("#lookup-toggle");
const resultCard = document.querySelector("#result-card");
const formMessage = document.querySelector("#form-message");

function setMessage(message, tone = "neutral") {
  formMessage.dataset.tone = tone;
  formMessage.textContent = message;
}

function renderResultCard(payload) {
  const progress = getRewardProgress(payload.referralCount ?? 0, payload.rewardTarget ?? 5);
  const referralLink = payload.referralLink ?? buildReferralLink(payload.referralCode);
  const heading = progress.unlocked ? "Early access unlocked" : "You’re on the list";
  const bodyCopy = progress.unlocked
    ? "You hit the early-access threshold."
    : `Invite ${progress.remaining} more ${progress.remaining === 1 ? "friend" : "friends"} to unlock early access.`;

  resultCard.hidden = false;
  resultCard.innerHTML = `
    <div class="result-header">
      <p class="eyebrow">Your invite</p>
      <h3>${escapeHtml(heading)}</h3>
    </div>
    <p class="result-copy">${escapeHtml(bodyCopy)}</p>
    <div class="result-stack">
      <p><strong>Referral link</strong></p>
      <a class="result-link" href="${escapeHtml(referralLink)}">${escapeHtml(referralLink)}</a>
    </div>
    <div class="progress-row" aria-label="Referral progress">
      <span>${progress.current}/${progress.target} successful referrals</span>
      <div class="progress-track"><span class="progress-fill" style="width: ${progress.percent}%"></span></div>
    </div>
  `;
}

if (savedWaitlistState) {
  renderResultCard(savedWaitlistState);
}

lookupToggle.addEventListener("click", () => {
  lookupPanel.hidden = !lookupPanel.hidden;

  if (!lookupPanel.hidden) {
    const lookupInput = document.querySelector("#lookup-email");
    lookupInput.focus();
  }
});

waitlistForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(waitlistForm);
  const payload = {
    email: String(formData.get("email") ?? ""),
    firstName: String(formData.get("firstName") ?? ""),
    referralCode: savedReferralCode ?? null
  };

  setMessage("Joining the waitlist...");

  try {
    const response = await signupWaitlist(payload);
    saveWaitlistState(window.localStorage, response);
    renderResultCard(response);
    setMessage(response.status === "existing" ? "You were already on the list. Here’s your link." : "You’re on the list.");
  } catch (error) {
    setMessage(error.message, "error");
  }
});

lookupForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(lookupForm);
  const payload = {
    email: String(formData.get("email") ?? "")
  };

  setMessage("Looking up your referral status...");

  try {
    const response = await lookupWaitlist(payload);
    saveWaitlistState(window.localStorage, response);
    renderResultCard(response);
    setMessage("Found your waitlist invite.");
  } catch (error) {
    setMessage(error.message, "error");
  }
});
