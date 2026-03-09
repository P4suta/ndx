/**
 * Post-build script: extracts the inlined JS from dist/index.html
 * and produces dist/ndx.html — a self-contained HTML card that can
 * be pasted directly into any blog platform's HTML card.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const html = readFileSync('dist/index.html', 'utf-8');

const scriptMatch = html.match(
	/<script[^>]*>([\s\S]*?)<\/script>\s*<\/head>/,
);
if (!scriptMatch) {
	console.error('Could not extract <script> from dist/index.html');
	process.exit(1);
}

const js = scriptMatch[1];

const embed = `<!-- ndx v1.0.0 | MIT License | https://github.com/P4suta/ndx -->
<ndx-calc>
  <p style="padding:1em;text-align:center;color:#666;">
    ND Filter Calculator requires JavaScript.
  </p>
</ndx-calc>
<script>(()=>{${js}})()</script>
`;

writeFileSync('dist/ndx.html', embed);

const kb = (Buffer.byteLength(embed) / 1024).toFixed(1);
console.log(`Embeddable snippet → dist/ndx.html (${kb} KB)`);
