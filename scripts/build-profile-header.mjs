import { readFile, writeFile } from 'node:fs/promises';
import { loadFoxSprite } from './fox-sprite.mjs';

const assets = new URL('../assets/', import.meta.url);
const sprite = await loadFoxSprite();
const [logo, wordmark] = await Promise.all(['Dozun-orbit.svg', 'Dozun-original-wordmark-light.svg'].map(async file => {
  const data = await readFile(new URL(`brand/${file}`, assets));
  return `data:image/svg+xml;base64,${data.toString('base64')}`;
}));

function header({ width, height, brandScale, brandY, handleY, roleY, foxX, scale, margin }) {
  const ground = height - 30;
  const foxY = ground - 79 * scale - 1;
  const brandX = margin + 4;
  const nameX = brandX + 44 * brandScale;
  const nameWidth = 116 * brandScale;
  const nameHeight = 32 * brandScale;
  const nameY = brandY - 2 * brandScale;
  const nameBox = `x="${nameX}" y="${nameY}" width="${nameWidth}" height="${nameHeight}"`;
  const shimmerWidth = 44 * brandScale;
  const shimmerTravel = nameWidth + shimmerWidth;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" role="img" aria-labelledby="title desc">
  <title id="title">Dozun — Back-end developer</title>
  <desc id="desc">Dozun and Zuni, his orange pixel fox.</desc>
  <defs>
    <clipPath id="fox"><rect width="80" height="80"/></clipPath>
    <image id="brand-name" ${nameBox} href="${wordmark}"/>
    <mask id="name-mask" ${nameBox} maskUnits="userSpaceOnUse" style="mask-type:alpha"><use href="#brand-name"/></mask>
    <linearGradient id="name-shine" x1="0" y1="0" x2="1" y2=".2">
      <stop offset="0" stop-color="#f5b887" stop-opacity="0"/>
      <stop offset=".32" stop-color="#f5b887" stop-opacity=".35"/>
      <stop offset=".5" stop-color="#ffffff"/>
      <stop offset=".68" stop-color="#fff4df" stop-opacity=".5"/>
      <stop offset="1" stop-color="#fff4df" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <style>
    .frames { image-rendering: pixelated; animation: idle 1.6s steps(8, end) infinite; }
    .name-shimmer { opacity: 0; animation: name-shimmer 6s ease-in-out infinite; }
    @keyframes idle { to { transform: translateX(-640px); } }
    @keyframes name-shimmer {
      0%, 12% { transform: translateX(0); opacity: 0; }
      16% { opacity: 1; }
      42% { transform: translateX(${shimmerTravel}px); opacity: 1; }
      46%, 100% { transform: translateX(${shimmerTravel}px); opacity: 0; }
    }
    @media (prefers-reduced-motion: reduce) {
      .frames, .name-shimmer { animation: none; }
      .name-shimmer { display: none; }
    }
  </style>
  <rect width="${width}" height="${height}" fill="#0d1117"/>
  <g font-family="'Segoe UI',Helvetica,Arial,sans-serif">
    <text x="${brandX}" y="${handleY}" font-family="Consolas,'Courier New',monospace" font-size="${width < 700 ? 17 : 15}" fill="#8b949e">@iamdwn</text>
    <image x="${brandX}" y="${brandY}" width="${32 * brandScale}" height="${28 * brandScale}" href="${logo}"/>
    <use href="#brand-name"/>
    <g mask="url(#name-mask)" aria-hidden="true">
      <rect class="name-shimmer" x="${nameX - shimmerWidth}" y="${nameY}" width="${shimmerWidth}" height="${nameHeight}" fill="url(#name-shine)"/>
    </g>
    <text x="${margin + 4}" y="${roleY}" font-family="Consolas,'Courier New',monospace" font-size="${width < 700 ? 18 : 20}" fill="#b3b8bf">Back-end developer</text>
  </g>
  <path d="M${margin + 4} ${ground}H${width - margin}" stroke="#30363d"/>
  <path d="M${margin + 4} ${ground}h52" stroke="#f47b39" stroke-width="3"/>
  <g transform="translate(${foxX} ${foxY}) scale(${scale})">
    <g clip-path="url(#fox)"><image class="frames" width="640" height="80" href="${sprite}"/></g>
  </g>
</svg>
`;
}

await writeFile(new URL('fox-header.svg', assets), header({
  width: 1000, height: 310, brandScale: 3, brandY: 108, handleY: 44, roleY: 252,
  foxX: 650, scale: 4, margin: 28,
}));
await writeFile(new URL('fox-header-mobile.svg', assets), header({
  width: 640, height: 270, brandScale: 2, brandY: 94, handleY: 50, roleY: 210,
  foxX: 358, scale: 3, margin: 20,
}));
console.log('Built profile headers with Zuni cleanup and name shimmer.');
