import { readFile, writeFile } from 'node:fs/promises';

const directory = new URL('../profile-3d-contrib/', import.meta.url);
const source = await readFile(new URL('profile-night-green.svg', directory), 'utf8');
const palette = {
  '#00000f': '#0d1117',
  '#eeeeff': '#d1d9e0',
  '#aaaaaa': '#8b949e',
  '#444444': '#30363d',
  '#178600': '#b66d44',
  '#f1e05a': '#d6ae78',
  '#47a042': '#dc8952',
};

let themed = source.replace(/#[0-9a-f]{6}\b/gi, color => palette[color.toLowerCase()] ?? color);
themed = themed.replace(/rgb\(\s*(\d+),\s*(\d+),\s*(\d+)\)/g, (color, red, green, blue) => {
  const [r, g, b] = [red, green, blue].map(Number);
  if (r === 255 && g === 200 && b === 55) return '#f0bc8a';
  if (r === g && g === b) return `rgb(${Math.round(r * .65)}, ${Math.round(g * .72)}, ${Math.round(b * .84)})`;
  if (g > r && g > b) {
    return `rgb(${Math.round(g * .8 + 60)}, ${Math.round(g * .46 + 30)}, ${Math.round(g * .28 + 20)})`;
  }
  return color;
});
themed = themed.replace(/<animate\b[^>]*>[\s\S]*?<\/animate>/g, '');
themed = themed.replace('<svg ', '<svg role="img" aria-label="Dozun GitHub contribution history in three dimensions" ');
await writeFile(new URL('profile-graphite.svg', directory), themed);
console.log('Generated profile-3d-contrib/profile-graphite.svg');
