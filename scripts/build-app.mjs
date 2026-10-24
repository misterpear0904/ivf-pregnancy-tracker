import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const [css, js, template] = await Promise.all([
  readFile(resolve(root, 'app/src/styles.css'), 'utf8'),
  readFile(resolve(root, 'app/src/app.js'), 'utf8'),
  readFile(resolve(root, 'app/src/index.html'), 'utf8')
]);

if (js.includes('</script>')) throw new Error('JS contains a literal </script>; escape it before inlining.');
if (css.includes('</style>')) throw new Error('CSS contains a literal </style>; escape it before inlining.');

const out = template.replace('/*__CSS__*/', () => css).replace('/*__JS__*/', () => js);
await mkdir(resolve(root, 'app'), { recursive: true });
await writeFile(resolve(root, 'app/index.html'), out, 'utf8');
const kb = (Buffer.byteLength(out, 'utf8') / 1024).toFixed(1);
console.log(`Built app/index.html (${kb} KB)`);
