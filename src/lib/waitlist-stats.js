export const WAITLIST_EXTERNAL_OFFSET = 1004;

const countFormatter = new Intl.NumberFormat("en-US");

export function formatCount(value) {
  return countFormatter.format(Math.max(0, Number(value) || 0));
}

export function buildPublicTotalLabel(totalSignups) {
  return `${formatCount(totalSignups)} people already joined`;
}

export function buildWaitlistPositionLabel(waitlistPosition) {
  return `You’re #${formatCount(waitlistPosition)} on the list`;
}

export function buildHeroStatMarkup(totalSignups) {
  return `
    <span class="hero-stat-number">${formatCount(totalSignups)}</span>
    <span class="hero-stat-label">people already joined</span>
  `;
}

export function buildHeroStatLoadingMarkup() {
  return `
    <span class="hero-stat-number hero-stat-number--loading" data-state="loading" aria-hidden="true"></span>
    <span class="hero-stat-label">Loading live count...</span>
  `;
}

export function buildHeroStatUnavailableMarkup() {
  return `
    <span class="hero-stat-number hero-stat-number--loading" data-state="unavailable" aria-hidden="true"></span>
    <span class="hero-stat-label">Live count unavailable</span>
  `;
}
