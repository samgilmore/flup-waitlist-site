import "./styles/base.css";
import "./styles/site.css";
import { valuePoints } from "./lib/content.js";

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

      <form class="waitlist-form">
        <label for="email">Email</label>
        <input id="email" name="email" type="email" autocomplete="email" required />
        <button type="submit">Join the waitlist</button>
      </form>

      <button class="lookup-button" type="button">Check your status</button>
    </section>
  </main>
`;
