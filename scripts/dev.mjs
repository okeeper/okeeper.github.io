import { spawnSync } from 'node:child_process';
import { createReadStream, existsSync, readFileSync, statSync, watch } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = join(root, 'dist');
const { values } = parseArgs({ options: {
  port: { type: 'string', default: process.env.PORT || '4173' },
  host: { type: 'string', default: '127.0.0.1' },
} });
const port = Number(values.port);
if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('端口范围为 0 到 65535。');
const browsers = new Set();
const liveReload = '<script>new EventSource("/__blog_updates").onmessage=()=>location.reload()</script>';
const mime = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8', '.md': 'text/markdown; charset=utf-8',
  '.svg': 'image/svg+xml', '.webp': 'image/webp',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
  '.avif': 'image/avif', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff',
};

function rebuild() {
  const run = spawnSync(process.execPath, [join(root, 'scripts/build.mjs')], { stdio: 'inherit' });
  if (run.status === 0) {
    for (const connection of browsers) connection.write('data: built\n\n');
  } else {
    console.error('构建失败。修正源文件并保存后，将自动重试。');
  }
}

const server = createServer((request, response) => {
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }
  try {
    const url = new URL(request.url, 'http://localhost');
    if (url.pathname === '/__blog_updates') {
      response.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' });
      response.write(': connected\n\n');
      browsers.add(response);
      response.on('close', () => browsers.delete(response));
      return;
    }
    const name = decodeURIComponent(url.pathname);
    let file = resolve(output, '.' + name);
    if (name.includes('\0') || (file !== output && !file.startsWith(output + sep))) {
      response.writeHead(400).end();
      return;
    }
    if (statSync(file, { throwIfNoEntry: false })?.isDirectory()) {
      if (!url.pathname.endsWith('/')) {
        response.writeHead(301, { Location: url.pathname + '/' + url.search }).end();
        return;
      }
      file = join(file, 'index.html');
    }
    if (!existsSync(file)) {
      response.statusCode = 404;
      file = join(output, '404.html');
    }
    if (!existsSync(file)) {
      response.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' }).end('等待首次成功构建');
      return;
    }
    const ext = extname(file);
    response.setHeader('Content-Type', mime[ext] || 'application/octet-stream');
    response.setHeader('Cache-Control', 'no-store');
    if (request.method === 'HEAD') response.end();
    else if (ext === '.html') response.end(readFileSync(file, 'utf8').replace('</body>', liveReload + '</body>'));
    else createReadStream(file).on('error', () => response.destroy()).pipe(response);
  } catch {
    response.writeHead(400).end();
  }
});

let timer;
function changed() {
  clearTimeout(timer);
  timer = setTimeout(rebuild, 150);
}
rebuild();
const sourceDirs = ['content', 'site', 'scripts', 'public'];
const watched = new Map();
function attach(source) {
  watched.get(source)?.close();
  if (existsSync(join(root, source))) watched.set(source, watch(join(root, source), { recursive: true }, changed));
}
sourceDirs.forEach(attach);
watch(root, (event, name) => {
  if (name === 'CNAME') changed();
  if (event === 'rename' && sourceDirs.includes(name)) {
    attach(name);
    changed();
  }
});
server.listen(port, values.host, () => {
  console.log('本地预览 http://' + values.host + ':' + server.address().port + '/');
});
