import "./styles/base.css";
import "./styles/site.css";
import flupWordmark from "./assets/flup-wordmark.png";
import flupAppIcon from "./assets/flup-ios-icon.png";
import flupForegroundIcon from "./assets/flup-ios-icon-foreground.png";
import { escapeHtml } from "./lib/html.js";
import { fetchWaitlistStats, lookupWaitlist, signupWaitlist } from "./lib/api.js";
import { buildReferralLink, getReferralCodeFromUrl, getRewardProgress } from "./lib/referral-state.js";
import {
  buildHeroStatLoadingMarkup,
  buildHeroStatMarkup,
  buildHeroStatUnavailableMarkup,
  buildWaitlistPositionLabel,
} from "./lib/waitlist-stats.js";
import {
  getSavedReferralCode,
  getSavedWaitlistState,
  saveReferralCode,
  saveWaitlistState
} from "./lib/storage.js";

const app = document.querySelector("#app");

const savedReferralCode = getReferralCodeFromUrl(window.location.href) ?? getSavedReferralCode();
const savedWaitlistState = getSavedWaitlistState();

if (savedReferralCode) {
  saveReferralCode(window.localStorage, savedReferralCode);
}

app.innerHTML = `
  <main class="shell">
    <div class="ambient ambient-one" aria-hidden="true"></div>
    <div class="ambient ambient-two" aria-hidden="true"></div>
    <div class="ambient ambient-three" aria-hidden="true"></div>

    <header class="topbar">
      <div class="brand-lockup">
        <img class="brand-app-icon" src="${flupAppIcon}" alt="FLUP app icon" />
        <img class="brand-wordmark" src="${flupWordmark}" alt="FLUP wordmark" />
      </div>
    </header>

    <section class="hero" aria-labelledby="hero-title">
      <div class="hero-copy">
        <h1 id="hero-title" aria-label="Follow Up. Stay top of mind.">
          <span class="hero-title-line">
            <span class="hero-title-mark-wrap">
              <img class="hero-title-mark" src="${flupForegroundIcon}" alt="FLUP hero icon" />
            </span>
            <span class="hero-title-rest">ollow Up.</span>
          </span>
          <span class="hero-title-line hero-title-line--secondary">Stay top of mind.</span>
        </h1>
        <p class="subcopy">A smarter way to keep relationships warm and your network moving.</p>
        <p class="hero-stat" id="hero-stat">${buildHeroStatLoadingMarkup()}</p>

        <div class="hero-actions">
          <div class="hero-panel-stack">
            <section class="signup-panel" aria-labelledby="signup-title">
              <div class="signup-stage" id="signup-stage">
                <div class="signup-copy">
                  <h2 id="signup-title" aria-label="Be first to hear when FLUP goes live.">
                    <span>Be first to hear when</span>
                    <img class="inline-wordmark" src="${flupWordmark}" alt="" aria-hidden="true" />
                    <span>goes live.</span>
                  </h2>
                </div>

                <form class="waitlist-form" id="waitlist-form">
                  <label for="email">Email</label>
                  <input id="email" name="email" type="email" autocomplete="email" placeholder="you@example.com" required />
                  <label for="first-name">First name <span class="field-optional">(optional)</span></label>
                  <input id="first-name" name="firstName" type="text" autocomplete="given-name" placeholder="Name" />
                  <button type="submit">Join the waitlist</button>
                </form>

                <p class="reward-hint">Refer 5 friends for early access.</p>

                <button class="lookup-button" id="lookup-toggle" type="button">Already joined? Check your status</button>
              </div>

              <div class="lookup-stage" id="lookup-stage" hidden>
                <button class="back-button" id="lookup-back" type="button" aria-label="Back to signup">← Back</button>
                <div class="signup-copy lookup-copy">
                  <h2>Check your status</h2>
                </div>

                <section class="lookup-panel" id="lookup-panel">
                  <form class="lookup-form" id="lookup-form">
                    <label for="lookup-email">Lookup email</label>
                    <input id="lookup-email" name="email" type="email" autocomplete="email" placeholder="you@example.com" required />
                    <button type="submit">Find my invite</button>
                  </form>
                </section>
              </div>

              <p class="form-message" id="form-message" aria-live="polite" hidden></p>
            </section>

            <section class="result-card" id="result-card" hidden aria-live="polite"></section>
          </div>
        </div>
      </div>
    </section>

    <footer class="footer">
      <p>Copyright 2026 FLUP</p>
    </footer>
  </main>
`;

const waitlistForm = document.querySelector("#waitlist-form");
const lookupForm = document.querySelector("#lookup-form");
const lookupBack = document.querySelector("#lookup-back");
const lookupPanel = document.querySelector("#lookup-panel");
const lookupToggle = document.querySelector("#lookup-toggle");
const lookupStage = document.querySelector("#lookup-stage");
const heroStat = document.querySelector("#hero-stat");
const resultCard = document.querySelector("#result-card");
const formMessage = document.querySelector("#form-message");
const signupStage = document.querySelector("#signup-stage");
let resultActionTimeoutId = null;

function setMessage(message, tone = "neutral") {
  formMessage.hidden = !message;
  formMessage.dataset.tone = tone;
  formMessage.textContent = message;
}

function setResultActionFeedback(message, tone = "neutral") {
  const feedback = resultCard.querySelector("#result-action-feedback");

  if (!feedback) {
    return;
  }

  if (resultActionTimeoutId) {
    window.clearTimeout(resultActionTimeoutId);
    resultActionTimeoutId = null;
  }

  feedback.hidden = !message;
  feedback.dataset.tone = tone;
  feedback.textContent = message;

  if (message) {
    resultActionTimeoutId = window.setTimeout(() => {
      feedback.hidden = true;
      feedback.textContent = "";
      delete feedback.dataset.tone;
      resultActionTimeoutId = null;
    }, 2200);
  }
}

function shouldShowShareAction() {
  return typeof navigator.share === "function" && window.matchMedia("(max-width: 760px)").matches;
}

async function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  document.body.append(textarea);
  textarea.select();

  const copied = document.execCommand("copy");
  textarea.remove();

  if (!copied) {
    throw new Error("Clipboard write failed");
  }
}

function setCardMode(mode) {
  const showLookup = mode === "lookup";

  signupStage.hidden = showLookup;
  lookupStage.hidden = !showLookup;
}

function updateHeroStat(totalSignups) {
  heroStat.innerHTML = buildHeroStatMarkup(totalSignups);
}

function renderResultCard(payload) {
  const progress = getRewardProgress(payload.referralCount ?? 0, payload.rewardTarget ?? 5);
  const referralLink = payload.referralLink ?? buildReferralLink(payload.referralCode);
  const showShareAction = shouldShowShareAction();
  const heading = progress.unlocked ? "Early access unlocked" : "You’re on the list";
  const bodyCopy = progress.unlocked
    ? "You hit the early-access threshold."
    : `Invite ${progress.remaining} more ${progress.remaining === 1 ? "friend" : "friends"} to unlock early access.`;
  const hasStats = Number.isFinite(payload.waitlistPosition) || Number.isFinite(payload.totalSignups);
  const resultStatsMarkup = hasStats
    ? `
      <div class="result-stats">
        ${
          Number.isFinite(payload.waitlistPosition)
            ? `<p class="result-stat result-stat--highlight">${escapeHtml(buildWaitlistPositionLabel(payload.waitlistPosition))}</p>`
            : ""
        }
      </div>
    `
    : "";

  resultCard.hidden = false;
  resultCard.dataset.referralLink = referralLink;
  resultCard.innerHTML = `
    <div class="result-header">
      <p class="eyebrow">Your invite</p>
      <h3>${escapeHtml(heading)}</h3>
    </div>
    <p class="result-email">Signed up with <strong>${escapeHtml(payload.email ?? "")}</strong></p>
    ${resultStatsMarkup}
    <p class="result-copy">${escapeHtml(bodyCopy)}</p>
    <div class="result-stack result-stack--link">
      <p><strong>Referral link</strong></p>
      <div class="result-link-row">
        <a class="result-link" href="${escapeHtml(referralLink)}">${escapeHtml(referralLink)}</a>
        <div class="result-link-actions">
          <button class="result-action-button" type="button" data-result-action="copy">Copy link</button>
          ${
            showShareAction
              ? '<button class="result-action-button result-action-button--secondary" type="button" data-result-action="share">Share</button>'
              : ""
          }
        </div>
      </div>
      <p class="result-action-feedback" id="result-action-feedback" aria-live="polite" hidden></p>
    </div>
    <div class="progress-row" aria-label="Referral progress">
      <span>${progress.current}/${progress.target} successful referrals</span>
      <div class="progress-track"><span class="progress-fill" style="width: ${progress.percent}%"></span></div>
    </div>
  `;
}

resultCard.addEventListener("click", async (event) => {
  const actionButton = event.target.closest("[data-result-action]");

  if (!(actionButton instanceof HTMLButtonElement)) {
    return;
  }

  const referralLink = resultCard.dataset.referralLink;

  if (!referralLink) {
    return;
  }

  const { resultAction } = actionButton.dataset;

  actionButton.disabled = true;

  try {
    if (resultAction === "copy") {
      await copyToClipboard(referralLink);
      setResultActionFeedback("Link copied.");
      return;
    }

    if (resultAction === "share" && typeof navigator.share === "function") {
      await navigator.share({
        title: "Join FLUP",
        text: "Join the FLUP waitlist.",
        url: referralLink
      });
    }
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return;
    }

    setResultActionFeedback(
      resultAction === "share" ? "Couldn’t open share sheet." : "Couldn’t copy link.",
      "error"
    );
  } finally {
    actionButton.disabled = false;
  }
});

if (savedWaitlistState) {
  renderResultCard(savedWaitlistState);
  if (Number.isFinite(savedWaitlistState.totalSignups)) {
    updateHeroStat(savedWaitlistState.totalSignups);
  }
}

fetchWaitlistStats()
  .then((payload) => {
    updateHeroStat(payload.totalSignups);
  })
  .catch(() => {
    heroStat.innerHTML = buildHeroStatUnavailableMarkup();
  });

lookupToggle.addEventListener("click", () => {
  setCardMode("lookup");
  const lookupInput = document.querySelector("#lookup-email");
  lookupInput.focus();
});

lookupBack.addEventListener("click", () => {
  setCardMode("signup");
  const signupInput = document.querySelector("#email");
  signupInput.focus();
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
    updateHeroStat(response.totalSignups);
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
    updateHeroStat(response.totalSignups);
    setMessage("Found your waitlist invite.");
  } catch (error) {
    setMessage(error.message, "error");
  }
});
