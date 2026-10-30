import { readFile, writeFile } from 'node:fs/promises';

const assets = new URL('../assets/', import.meta.url);
const sprite = (await readFile(new URL('zuni-idle.png', assets))).toString('base64');

function header({ width, height, nameSize, nameY, roleY, foxX, foxY, scale, margin }) {
  const ground = height - 30;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" role="img" aria-labelledby="title desc">
  <title id="title">Dozun — Back-end developer</title>
  <desc id="desc">Dozun and Zuni, his orange pixel fox.</desc>
  <defs><clipPath id="fox"><rect width="80" height="80"/></clipPath></defs>
  <style>
    .frames { image-rendering: pixelated; animation: idle 1.6s steps(8, end) infinite; }
    @keyframes idle { to { transform: translateX(-640px); } }
    @media (prefers-reduced-motion: reduce) { .frames { animation: none; } }
  </style>
  <rect width="${width}" height="${height}" fill="#0d1117"/>
  <g font-family="'Segoe UI',Helvetica,Arial,sans-serif">
    <text x="${margin + 4}" y="${nameY - nameSize - 18}" font-family="Consolas,'Courier New',monospace" font-size="${width < 700 ? 17 : 15}" fill="#8b949e">@iamdwn</text>
    <text x="${margin}" y="${nameY}" font-size="${nameSize}" font-weight="650" letter-spacing="-6" fill="#f0f2f4">Dozun</text>
    <text x="${margin + 4}" y="${roleY}" font-family="Consolas,'Courier New',monospace" font-size="${width < 700 ? 18 : 20}" fill="#b3b8bf">Back-end developer</text>
  </g>
  <path d="M${margin + 4} ${ground}H${width - margin}" stroke="#30363d"/>
  <path d="M${margin + 4} ${ground}h52" stroke="#f47b39" stroke-width="3"/>
  <g transform="translate(${foxX} ${foxY}) scale(${scale})">
    <g clip-path="url(#fox)"><image class="frames" width="640" height="80" href="data:image/png;base64,${sprite}"/></g>
  </g>
</svg>
`;
}

await writeFile(new URL('fox-header.svg', assets), header({
  width: 1000, height: 310, nameSize: 146, nameY: 208, roleY: 252,
  foxX: 650, foxY: -32, scale: 4, margin: 28,
}));
await writeFile(new URL('fox-header-mobile.svg', assets), header({
  width: 640, height: 270, nameSize: 100, nameY: 168, roleY: 210,
  foxX: 358, foxY: 6, scale: 3, margin: 20,
}));
console.log('Built desktop and mobile profile headers from the original Zuni sprite.');
