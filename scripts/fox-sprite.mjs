import { readFile, writeFile } from 'node:fs/promises';

export async function loadFoxSprite() {
  const assets = new URL('../assets/', import.meta.url);
  const source = (await readFile(new URL('zuni-idle.png', assets))).toString('base64');
  const cuts = JSON.parse(await readFile(new URL('zuni-cleanup.json', assets), 'utf8'));
  const path = cuts.flatMap((spans, frame) => spans.map(([x, y, width]) =>
    `M${frame * 80 + x} ${y}h${width}v1h-${width}Z`
  )).join('');
  const bellyWidths = [7, 7, 8, 8, 8, 8, 7, 7];
  const bellyPath = (y, height = 1) => bellyWidths.map((width, frame) =>
    `M${frame * 80 + 37} ${y}h${width}v${height}h-${width}Z`
  ).join('');
  const paws = bellyWidths.flatMap((_, frame) => [26, 48].map(x =>
    `M${frame * 80 + x} 78h7v1h-7Z`
  )).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="80" viewBox="0 0 640 80" shape-rendering="crispEdges">
<title>Zuni — eight idle frames with clean edges and continuous belly fur</title>
<defs><mask id="cleanup" maskUnits="userSpaceOnUse" x="0" y="0" width="640" height="80" style="mask-type:luminance"><rect width="640" height="80" fill="white"/><path d="${path}" fill="black"/></mask></defs>
<image width="640" height="80" href="data:image/png;base64,${source}" mask="url(#cleanup)" style="image-rendering:pixelated"/>
<path d="${bellyPath(63, 2)}" fill="#fff5e3"/>
<path d="${bellyPath(65)}" fill="#241416"/>
<path d="${paws}" fill="#060504"/>
</svg>\n`;
  await writeFile(new URL('zuni-idle-clean.svg', assets), svg);
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}
