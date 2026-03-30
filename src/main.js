import "./styles/base.css";
import "./styles/site.css";

const app = document.querySelector("#app");

app.innerHTML = `
  <main class="shell">
    <section class="hero" aria-labelledby="hero-title">
      <p class="eyebrow">FLUP waitlist</p>
      <h1 id="hero-title">Follow up like it matters.</h1>
      <p class="subcopy">A smarter way to keep relationships warm and your network moving.</p>

      <form class="waitlist-form">
        <label for="email">Email</label>
        <input id="email" name="email" type="email" autocomplete="email" required />
        <button type="submit">Join the waitlist</button>
      </form>
    </section>
  </main>
`;
