import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "assets", "social");

const RANKS = [
  { id: "pass",       label: "PASS",                color: "#808080", text: "#FFFFFF", tagline: "Skip it." },
  { id: "legit",      label: "LEGIT",               color: "#60C3F5", text: "#0B1620", tagline: "Worth picking up." },
  { id: "big-legit",  label: "BIG LEGIT",           color: "#F4A942", text: "#1A0F00", tagline: "Genuinely great." },
  { id: "certified",  label: "CERTIFIED LEGIT BUY", color: "#C8FF47", text: "#0E1A00", tagline: "Stop what you're doing and buy this." },
];

const BRAND = "LEGIT BUYS";

const escapeXml = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[c]));

function feedSVG({ label, color, text, tagline }) {
  const W = 1080, H = 1080;
  const band = 90;
  const cornerR = 48;
  const labelSize = Math.max(36, Math.min(86, Math.floor(820 / Math.max(label.length, 8) * 1.6)));
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <style>
      .label { font-family: 'Helvetica Neue', Arial, sans-serif; font-weight: 900; letter-spacing: 0.08em; }
      .brand { font-family: 'Helvetica Neue', Arial, sans-serif; font-weight: 800; letter-spacing: 0.32em; }
      .tag   { font-family: 'Helvetica Neue', Arial, sans-serif; font-weight: 600; letter-spacing: 0.04em; font-style: italic; }
    </style>
  </defs>
  <!-- Outer frame: colored band with transparent center -->
  <path d="
    M ${cornerR} 0
    H ${W - cornerR}
    Q ${W} 0 ${W} ${cornerR}
    V ${H - cornerR}
    Q ${W} ${H} ${W - cornerR} ${H}
    H ${cornerR}
    Q 0 ${H} 0 ${H - cornerR}
    V ${cornerR}
    Q 0 0 ${cornerR} 0
    Z
    M ${band} ${band + 40}
    V ${H - band - 40}
    H ${W - band}
    V ${band + 40}
    Z
  " fill="${color}" fill-rule="evenodd"/>

  <!-- Inner accent line -->
  <rect x="${band - 6}" y="${band + 34}" width="${W - 2 * band + 12}" height="6" fill="${text}" opacity="0.18"/>
  <rect x="${band - 6}" y="${H - band - 40}" width="${W - 2 * band + 12}" height="6" fill="${text}" opacity="0.18"/>

  <!-- Rank label on top band -->
  <text x="${W / 2}" y="${band / 2 + 18}" text-anchor="middle" class="label"
        font-size="${labelSize}" fill="${text}">${escapeXml(label)}</text>

  <!-- Bottom: brand + tagline -->
  <text x="${W / 2}" y="${H - band / 2 - 8}" text-anchor="middle" class="brand"
        font-size="36" fill="${text}">${escapeXml(BRAND)}</text>
  <text x="${W / 2}" y="${H - band / 2 + 28}" text-anchor="middle" class="tag"
        font-size="22" fill="${text}" opacity="0.78">${escapeXml(tagline)}</text>

  <!-- Corner stars -->
  ${cornerStar(band / 2, band / 2, text)}
  ${cornerStar(W - band / 2, band / 2, text)}
  ${cornerStar(band / 2, H - band / 2, text)}
  ${cornerStar(W - band / 2, H - band / 2, text)}
</svg>`;
}

function storySVG({ label, color, text, tagline }) {
  const W = 1080, H = 1920;
  const top = 380;
  const bottom = 320;
  // Width budget = W - 160 (80px side padding). Bold all-caps with 0.06em tracking ≈ fontSize * 0.7 per char.
  const labelSize = Math.max(56, Math.min(124, Math.floor((W - 160) / (label.length * 0.7))));
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <style>
      .label { font-family: 'Helvetica Neue', Arial, sans-serif; font-weight: 900; letter-spacing: 0.06em; }
      .brand { font-family: 'Helvetica Neue', Arial, sans-serif; font-weight: 800; letter-spacing: 0.36em; }
      .tag   { font-family: 'Helvetica Neue', Arial, sans-serif; font-weight: 600; letter-spacing: 0.04em; font-style: italic; }
      .small { font-family: 'Helvetica Neue', Arial, sans-serif; font-weight: 700; letter-spacing: 0.24em; }
    </style>
  </defs>

  <!-- Top header band -->
  <rect x="0" y="0" width="${W}" height="${top}" fill="${color}"/>
  <!-- Bottom footer band -->
  <rect x="0" y="${H - bottom}" width="${W}" height="${bottom}" fill="${color}"/>

  <!-- Decorative tick lines -->
  <rect x="60" y="${top - 14}" width="${W - 120}" height="8" fill="${text}" opacity="0.22"/>
  <rect x="60" y="${H - bottom + 6}" width="${W - 120}" height="8" fill="${text}" opacity="0.22"/>

  <!-- Eyebrow tag -->
  <text x="${W / 2}" y="120" text-anchor="middle" class="small"
        font-size="30" fill="${text}" opacity="0.72">REVIEW VERDICT</text>

  <!-- Rank label -->
  <text x="${W / 2}" y="${120 + 50 + labelSize * 0.78}" text-anchor="middle" class="label"
        font-size="${labelSize}" fill="${text}">${escapeXml(label)}</text>

  <!-- Tagline under rank -->
  <text x="${W / 2}" y="${top - 40}" text-anchor="middle" class="tag"
        font-size="32" fill="${text}" opacity="0.86">${escapeXml(tagline)}</text>

  <!-- Footer brand block -->
  <text x="${W / 2}" y="${H - bottom + 130}" text-anchor="middle" class="brand"
        font-size="64" fill="${text}">${escapeXml(BRAND)}</text>
  <text x="${W / 2}" y="${H - bottom + 190}" text-anchor="middle" class="small"
        font-size="28" fill="${text}" opacity="0.7">FOOD &amp; DRINK REVIEWS</text>

  <!-- Star accents -->
  ${cornerStar(90, 90, text, 28)}
  ${cornerStar(W - 90, 90, text, 28)}
  ${cornerStar(90, H - 90, text, 28)}
  ${cornerStar(W - 90, H - 90, text, 28)}
</svg>`;
}

function cornerStar(cx, cy, fill, size = 22) {
  const r1 = size;
  const r2 = size * 0.42;
  const pts = [];
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI / 4) * i - Math.PI / 2;
    const r = i % 2 === 0 ? r1 : r2;
    pts.push(`${(cx + Math.cos(angle) * r).toFixed(2)},${(cy + Math.sin(angle) * r).toFixed(2)}`);
  }
  return `<polygon points="${pts.join(" ")}" fill="${fill}" opacity="0.85"/>`;
}

async function render(svg, outPath) {
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(outPath);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const written = [];
  for (const rank of RANKS) {
    const feed = feedSVG(rank);
    const story = storySVG(rank);
    const feedPath = join(OUT_DIR, `legit-buys-${rank.id}-feed-1080.png`);
    const storyPath = join(OUT_DIR, `legit-buys-${rank.id}-story-1080x1920.png`);
    await render(feed, feedPath);
    await render(story, storyPath);
    // Also dump the SVGs for easy tweaking
    await writeFile(feedPath.replace(/\.png$/, ".svg"), feed);
    await writeFile(storyPath.replace(/\.png$/, ".svg"), story);
    written.push(feedPath, storyPath);
  }
  console.log(`Generated ${written.length} PNGs (+ matching SVGs) in:\n  ${OUT_DIR}`);
  for (const p of written) console.log("  -", p.split("/").slice(-1)[0]);
}

main().catch((e) => { console.error(e); process.exit(1); });
