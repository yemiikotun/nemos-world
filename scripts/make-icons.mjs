/**
 * Generates the app icons in public/ from one paw-print design.
 * Run with: node scripts/make-icons.mjs
 *
 * - apple-touch-icon.png (180×180): iPhone/iPad "Add to Home Screen"
 * - icon-192.png, icon-512.png: Android and installable web app icons
 * - icon-maskable-512.png: same design with extra padding, so Android can crop
 *   it into a circle or squircle without cutting off the paw
 */
import sharp from 'sharp';

const BG_TOP = '#f2955c';
const BG_BOTTOM = '#d9652b';
const PAW = '#fff7ef';

/** The paw, drawn in a 64×64 box (same shape as the favicon). */
const paw = `
  <ellipse cx="32" cy="42" rx="14" ry="12"/>
  <ellipse cx="13.5" cy="27" rx="5.6" ry="7.6" transform="rotate(-22 13.5 27)"/>
  <ellipse cx="50.5" cy="27" rx="5.6" ry="7.6" transform="rotate(22 50.5 27)"/>
  <ellipse cx="24" cy="14.5" rx="6" ry="8"/>
  <ellipse cx="40" cy="14.5" rx="6" ry="8"/>`;

/** A square icon with the paw scaled so it is `pawSize` pixels wide (of 512). */
function iconSvg(pawSize) {
  const scale = pawSize / 50; // the paw is about 50 units wide in its 64×64 box
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${BG_TOP}"/>
      <stop offset="1" stop-color="${BG_BOTTOM}"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#bg)"/>
  <g fill="${PAW}" transform="translate(256 262) scale(${scale}) translate(-32 -29)">${paw}</g>
</svg>`;
}

const standard = Buffer.from(iconSvg(300));
const maskable = Buffer.from(iconSvg(230)); // stays inside Android's 80% safe zone

const outputs = [
  ['public/apple-touch-icon.png', standard, 180],
  ['public/icon-192.png', standard, 192],
  ['public/icon-512.png', standard, 512],
  ['public/icon-maskable-512.png', maskable, 512],
];

for (const [file, svg, size] of outputs) {
  await sharp(svg).resize(size, size).png({ compressionLevel: 9 }).toFile(file);
  console.log(`wrote ${file} (${size}×${size})`);
}
