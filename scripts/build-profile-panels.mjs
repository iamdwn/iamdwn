import { readFile, writeFile } from 'node:fs/promises';

const assets = new URL('../assets/', import.meta.url);
const groups = [
  { name: 'Languages', items: [['csharp', 'C#'], ['java', 'Java'], ['typescript', 'TypeScript'], ['javascript', 'JavaScript'], ['c', 'C']] },
  { name: 'Data', items: [['microsoftsqlserver', 'SQL Server'], ['postgresql', 'PostgreSQL'], ['mysql', 'MySQL']] },
  { name: 'Tools', items: [['docker', 'Docker'], ['git', 'Git'], ['linux', 'Linux'], ['githubactions', 'GitHub Actions']] },
];
const icons = new Map(await Promise.all(groups.flatMap(group => group.items).map(async ([id]) => {
  let svg = await readFile(new URL(`tech/${id}.svg`, assets), 'utf8');
  if (id === 'mysql') svg = svg.replaceAll('#00618A', '#73bdd5');
  if (id === 'microsoftsqlserver') svg = svg.replaceAll('#ee352c', '#f08b7e');
  if (id === 'java') svg = svg.replaceAll('#0074BD', '#5db0df');
  return [id, `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`];
})));
const fox = (await readFile(new URL('zuni-idle.png', assets))).toString('base64');
const logo = (await readFile(new URL('zunios-logo.svg', assets))).toString('base64');
const esc = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;');
const text = (x, y, label, size = 18, color = '#d1d9e0', extra = '') => `<text x="${x}" y="${y}" font-size="${size}" fill="${color}" ${extra}>${esc(label)}</text>`;
const arrow = (x, y, size = 18) => `<path d="M${x} ${y + size}l${size}-${size}m-${size} 0h${size}v${size}" stroke="#f3a769" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>`;
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
  const h = mobile ? heights.reduce((sum, height) => sum + height, 0) : 336;
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
  return svg(w, h, 'Stack — C#, Java, TypeScript, JavaScript, C; SQL Server, PostgreSQL, MySQL; Docker, Git, Linux, GitHub Actions.', body);
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
  let body = `<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="14" fill="#12171e" stroke="#2a333f"/>`;
  body += `<path d="M${padding} 1h64" stroke="${isOS ? '#a99bf5' : '#f3a769'}" stroke-width="2"/>`;
  body += '<g font-family="Arial,Helvetica,sans-serif">';
  if (isOS) {
    body += `<image x="${padding - 4 * logoScale}" y="${padding - 8 * logoScale}" width="${220 * logoScale}" height="${72 * logoScale}" href="data:image/svg+xml;base64,${logo}"/>`;
    body += text(padding, descriptionY, 'OS-style portfolio', mobile ? 25 : 19, '#b2bdca');
    if (mobile) {
      body += text(padding, footerY - 30, 'Next.js  ·  TypeScript  ·  Tailwind CSS', 21, '#9aa7b7');
      body += text(padding, footerY, 'Zustand  ·  Framer Motion', 21, '#9aa7b7');
    } else {
      body += text(padding, footerY, 'Next.js  ·  TypeScript  ·  Tailwind CSS  ·  Zustand  ·  Framer Motion', 15, '#9aa7b7');
    }
    const s = mobile ? .66 : 1;
    const x = artCenterX - 233 * s / 2;
    const y = artCenterY - 146 * s / 2;
    body += `<g transform="translate(${x} ${y}) scale(${s})">
      <rect x="9" y="9" width="224" height="137" rx="9" fill="#0a0e14" stroke="#292d3d"/>
      <rect width="224" height="137" rx="9" fill="#171927" stroke="#47415f"/>
      <path d="M0 25h224" stroke="#47415f"/>
      <g fill="#8e87ae"><circle cx="15" cy="13" r="2.5"/><circle cx="25" cy="13" r="2.5"/><circle cx="35" cy="13" r="2.5"/></g>
      ${text(204, 17, 'ZuniOS', 9, '#a99cbf', 'text-anchor="end"')}
      <rect x="15" y="40" width="93" height="72" rx="4" fill="#0d1117" stroke="#343044"/>
      <path d="m27 55 5 4-5 4m10 0h6M27 78h49m-49 10h33" stroke="#b1a3dc" stroke-width="1.5"/>
      <g transform="translate(121 37) scale(.9)"><g clip-path="url(#fox)"><image width="640" height="80" href="data:image/png;base64,${fox}" style="image-rendering:pixelated"/></g></g>
      <rect x="83" y="121" width="60" height="9" rx="3" fill="#454059"/>
    </g>`;
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
  body += arrow(w - padding - 17, padding, 17);
  return svg(w, h, isOS ? 'ZuniOS — OS-style portfolio. Next.js, TypeScript, Tailwind CSS, Zustand, Framer Motion.' : 'Bọ Chán — personal chatbot powered by Botpress.', body, '<defs><clipPath id="fox"><rect width="80" height="80"/></clipPath></defs>');
}

function nav(kind, label) {
  const symbols = {
    portfolio: '<rect x="0" y="0" width="24" height="17" rx="2"/><path d="M7 23h10m-5-6v6"/>',
    repositories: '<path d="M2 2h17v22H2Zm4 0v22m15-17h3v17h-3M10 7h5m-5 5h5"/>',
    email: '<rect x="0" y="3" width="26" height="19" rx="2"/><path d="m1 4 12 10L25 4"/>',
  };
  return svg(300, 64, label, `<rect x=".5" y=".5" width="299" height="63" rx="8" fill="${kind === 'portfolio' ? '#251d18' : '#141a22'}" stroke="${kind === 'portfolio' ? '#754b30' : '#303b49'}"/>
    <g class="symbol" transform="translate(25 20)" stroke="#edaa77" stroke-width="1.6" fill="none">${symbols[kind]}</g>
    ${text(71, 40, label, 22, '#dce3eb', 'class="label" font-weight="500"')}
    <g class="arrow">${arrow(265, 24, 13)}</g>`, '<style>@media(max-width:180px){.symbol,.arrow{display:none}.label{font-size:34px;text-anchor:middle;transform:translateX(79px)}}</style>');
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
