import { readFile, writeFile } from 'node:fs/promises';

const assets = new URL('../assets/', import.meta.url);
const groups = [
  { name: 'Languages', items: [['csharp', 'C#'], ['java', 'Java'], ['typescript', 'TypeScript'], ['javascript', 'JavaScript'], ['c', 'C']] },
  { name: 'Data', items: [
    ['microsoftsqlserver', 'SQL Server'], ['postgresql', 'PostgreSQL'], ['mysql', 'MySQL'],
    ['oracle', 'Oracle'], ['mariadb', 'MariaDB'], ['mongodb', 'MongoDB'], ['apachehive', 'Apache Hive'],
  ] },
  { name: 'Tools', items: [['docker', 'Docker'], ['git', 'Git'], ['linux', 'Linux'], ['githubactions', 'GitHub Actions']] },
];
const icons = new Map(await Promise.all(groups.flatMap(group => group.items).map(async ([id]) => {
  let svg = await readFile(new URL(`tech/${id}.svg`, assets), 'utf8');
  if (id === 'mysql') svg = svg.replaceAll('#00618A', '#73bdd5');
  if (id === 'microsoftsqlserver') svg = svg.replaceAll('#ee352c', '#f08b7e');
  if (id === 'java') svg = svg.replaceAll('#0074BD', '#5db0df');
  if (id === 'oracle') svg = svg.replace('0 0 128 128', '0 50.5 27 27');
  if (id === 'mariadb') svg = svg.replaceAll('#003545', '#82b8c4');
  if (id === 'apachehive') svg = svg.replace('<path ', '<path fill="#f3d858" ');
  return [id, `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`];
})));
const logo = (await readFile(new URL('zunios-logo.svg', assets))).toString('base64');
const farm = (await readFile(new URL('zunios-farm.jpg', assets))).toString('base64');
const esc = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;');
const text = (x, y, label, size = 18, color = '#d1d9e0', extra = '') => `<text x="${x}" y="${y}" font-size="${size}" fill="${color}" ${extra}>${esc(label)}</text>`;
const icon = (id, x, y, size) => `<image x="${x}" y="${y}" width="${size}" height="${size}" href="${icons.get(id)}"/>`;

function svg(width, height, title, body, extra = '') {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title" font-family="'Segoe UI',Helvetica,Arial,sans-serif">
<title id="title">${esc(title)}</title>
${extra}
${body}
</svg>\n`;
}

function stack(mobile) {
  const w = mobile ? 640 : 1000;
  const heights = groups.map(group => 80 + Math.ceil(group.items.length / 2) * 64);
  const desktopRows = Math.max(...groups.map(group => group.items.length));
  const h = mobile ? heights.reduce((sum, height) => sum + height, 0) : 96 + desktopRows * 48;
  const column = w / 3;
  let body = `<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="14" fill="#12171e" stroke="#2a333f"/>`;
  body += '<g font-family="Arial,Helvetica,sans-serif">';
  let mobileTop = 0;
  groups.forEach((group, index) => {
    const left = mobile ? 0 : index * column;
    const top = mobile ? mobileTop : 0;
    if (index) {
      body += mobile
        ? `<path d="M24 ${top}H${w - 24}" stroke="#2a333f"/>`
        : `<path d="M${left} 24V${h - 24}" stroke="#2a333f"/>`;
    }
    body += text(left + 26, top + (mobile ? 39 : 40), group.name, mobile ? 25 : 18, '#e6edf3', 'font-weight="600" font-family="Arial,Helvetica,sans-serif"');
    body += `<path d="M${left + 26} ${top + (mobile ? 52 : 54)}h24" stroke="#ef9053" stroke-width="2"/>`;
    group.items.forEach(([id, name], i) => {
      const x = mobile ? 26 + (i % 2) * 306 : left + 26;
      const y = top + (mobile ? 73 + Math.floor(i / 2) * 64 : 77 + i * 48);
      const box = mobile ? 46 : 38;
      const size = mobile ? 32 : 26;
      body += `<rect x="${x}" y="${y}" width="${box}" height="${box}" rx="8" fill="#1c2530"/>`;
      body += icon(id, x + (box - size) / 2, y + (box - size) / 2, size);
      body += text(x + box + (mobile ? 15 : 13), y + (mobile ? 31 : 25), name, mobile ? 23 : 18, '#d1d9e0', 'font-family="Arial,Helvetica,sans-serif"');
    });
    mobileTop += heights[index];
  });
  body += '</g>';
  const technologies = groups.map(group => group.items.map(([, name]) => name).join(', ')).join('; ');
  return svg(w, h, `Stack — ${technologies}.`, body);
}

function project(kind, mobile) {
  const isOS = kind === 'zunios';
  const w = mobile ? 640 : 1000;
  const h = mobile ? 256 : 192;
  const padding = 32;
  const headerSize = mobile ? 64 : 56;
  const logoScale = headerSize / 56;
  const descriptionY = mobile ? 144 : 120;
  const footerY = h - padding;
  const artCenterX = w - (mobile ? 128 : 184);
  const artCenterY = 96;
  let defs = '';
  let body = `<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="14" fill="#12171e" stroke="#2a333f"/>`;
  body += `<path d="M${padding} 1h64" stroke="${isOS ? '#71cbe1' : '#f3a769'}" stroke-width="2"/>`;
  body += '<g font-family="Arial,Helvetica,sans-serif">';
  if (isOS) {
    body += `<image x="${padding}" y="${padding}" width="${headerSize}" height="${headerSize}" href="data:image/svg+xml;base64,${logo}" style="image-rendering:pixelated"/>`;
    body += text(padding + 74 * logoScale, padding + headerSize / 2 + (mobile ? 12 : 10), 'ZuniOS 2.0', mobile ? 36 : 31, '#edf1f5', 'font-weight="600" letter-spacing="-.8"');
    body += text(padding, descriptionY, 'OS-style portfolio', mobile ? 25 : 19, '#b2bdca');
    if (mobile) {
      body += text(padding, footerY - 30, 'Next.js  ·  TypeScript  ·  Tailwind CSS', 21, '#9aa7b7');
      body += text(padding, footerY, 'Zustand  ·  Framer Motion', 21, '#9aa7b7');
    } else {
      body += text(padding, footerY, 'Next.js  ·  TypeScript  ·  Tailwind CSS  ·  Zustand  ·  Framer Motion', 15, '#9aa7b7');
    }
    const thumbWidth = mobile ? 208 : 256;
    const thumbHeight = thumbWidth * 9 / 16;
    const thumbBox = `x="${w - padding - thumbWidth}" y="${artCenterY - thumbHeight / 2}" width="${thumbWidth}" height="${thumbHeight}"`;
    defs = `<defs><clipPath id="farm-crop"><rect ${thumbBox} rx="9"/></clipPath></defs>`;
    body += `<image ${thumbBox} clip-path="url(#farm-crop)" href="data:image/jpeg;base64,${farm}"/>`;
  } else {
    body += `<g transform="translate(${padding} ${padding}) scale(${logoScale})"><rect width="56" height="56" rx="13" fill="#30231c" stroke="#65452f"/><path d="M14 15h28v20H28l-9 7v-7h-5Z" fill="none" stroke="#f0a66e" stroke-width="2"/><path d="m21 23 4 3-4 3m9 0h5" stroke="#f0a66e" stroke-width="2" fill="none"/></g>`;
    body += text(padding + 74 * logoScale, padding + headerSize / 2 + (mobile ? 12 : 10), 'Bọ Chán', mobile ? 36 : 31, '#edf1f5', 'font-weight="600" letter-spacing="-.8"');
    body += text(padding, descriptionY, 'Personal chatbot', mobile ? 25 : 19, '#b2bdca');
    body += text(padding, footerY, 'Botpress', mobile ? 21 : 15, '#9aa7b7');
    const s = mobile ? .7 : 1;
    const x = artCenterX - 168 * s / 2;
    const y = artCenterY - 136 * s / 2;
    body += `<g transform="translate(${x} ${y}) scale(${s})" shape-rendering="crispEdges">
      <path d="M0 16h16V0h136v16h16v72h-16v16H80v16H64v16H48v-32H16V88H0Z" fill="#2a211c" stroke="#a36840" stroke-width="2"/>
      <path d="m32 37 16 16-16 16m34 0h32" fill="none" stroke="#eaaa78" stroke-width="5"/>
      <rect x="115" y="56" width="12" height="12" fill="#eaaa78"/>
    </g>`;
  }
  body += '</g>';
  return svg(w, h, isOS ? 'ZuniOS 2.0 — OS-style portfolio. A fox on the floating island. Next.js, TypeScript, Tailwind CSS, Zustand, Framer Motion.' : 'Bọ Chán — personal chatbot powered by Botpress.', body, defs);
}

function nav(kind, label) {
  const symbols = {
    portfolio: '<rect x="0" y="0" width="24" height="17" rx="2"/><path d="M7 23h10m-5-6v6"/>',
    repositories: '<path d="M2 2h17v22H2Zm4 0v22m15-17h3v17h-3M10 7h5m-5 5h5"/>',
    email: '<rect x="0" y="3" width="26" height="19" rx="2"/><path d="m1 4 12 10L25 4"/>',
  };
  return svg(300, 64, label, `<rect x=".5" y=".5" width="299" height="63" rx="8" fill="${kind === 'portfolio' ? '#251d18' : '#141a22'}" stroke="${kind === 'portfolio' ? '#754b30' : '#303b49'}"/>
    <g class="symbol" transform="translate(25 20)" stroke="#edaa77" stroke-width="1.6" fill="none">${symbols[kind]}</g>
    ${text(71, 40, label, 22, '#dce3eb', 'class="label" font-weight="500"')}`, '<style>@media(max-width:180px){.symbol{display:none}.label{font-size:34px;text-anchor:middle;transform:translateX(79px)}}</style>');
}

for (const mobile of [false, true]) {
  const suffix = mobile ? '-mobile' : '';
  await writeFile(new URL(`stack${suffix}.svg`, assets), stack(mobile));
  for (const kind of ['zunios', 'chat']) await writeFile(new URL(`project-${kind}${suffix}.svg`, assets), project(kind, mobile));
}
for (const [kind, label] of [['portfolio', 'Portfolio'], ['repositories', 'Repositories'], ['email', 'Email']]) {
  await writeFile(new URL(`nav-${kind}.svg`, assets), nav(kind, label));
}
console.log('Built stack, project cards, and navigation assets.');
