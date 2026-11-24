import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadPosts } from './content.mjs';
import { writeFeeds } from './feeds.mjs';
import { renderHome, renderPost, renderListing, renderPage } from '../site/render.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const dist = join(root, 'dist');
const posts = loadPosts(join(root, 'content/posts'));
const domain = readFileSync(join(root, 'CNAME'), 'utf8').trim();
const pageSize = 12;

function groupBy(items, getKeys) {
  const groups = new Map();
  for (const item of items) {
    for (const key of getKeys(item)) {
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(item);
    }
  }
  return groups;
}

function taxonomyUrls(groups, prefix) {
  const urls = Object.create(null);
  for (const name of groups.keys()) {
    const slug = name.trim().replace(/[\s&/\\?#%]+/g, '-');
    if (!slug || slug.startsWith('.')) throw new Error('无效的分类或标签名称：' + name);
    urls[name] = '/' + prefix + '/' + slug + '/';
  }
  return urls;
}

const categories = groupBy(posts, post => post.categories);
const tags = groupBy(posts, post => post.tags);
const site = {
  title: '神笔君 | Okeeper', author: 'Okeeper', url: 'https://' + domain,
  description: '神笔君的个人博客，记录人工智能、软件工程与技术实践。',
  categoryUrls: taxonomyUrls(categories, 'categories'), tagUrls: taxonomyUrls(tags, 'tags'),
};

// Stage the entire site before replacing dist. Invalid edits leave the last preview intact.
const staging = mkdtempSync(join(root, '.blog-build-'));
const output = join(staging, 'site');
mkdirSync(output);
const pages = [];
function write(url, body) {
  const file = join(output, url.endsWith('/') ? url + 'index.html' : url);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, body, { flag: 'wx' });
}
function page(url, html) {
  write(url, html);
  pages.push(url);
}

function listing(kind, title, filter, base, members, { allOnFirst = false, first = 1 } = {}) {
  const totalPages = Math.max(1, Math.ceil(members.length / pageSize));
  const pageUrl = number => number === 1 ? base : base + 'page/' + number + '/';
  for (let number = first; number <= totalPages; number++) {
    const path = pageUrl(number);
    const pagination = {
      page: number, totalPages,
      prev: number > 1 ? pageUrl(number - 1) : null,
      next: number < totalPages ? pageUrl(number + 1) : null,
    };
    const selection = number === 1 && allOnFirst ? members : members.slice((number - 1) * pageSize, number * pageSize);
    page(path, renderListing({ site, posts: selection, allPosts: posts, title, kind, filter, path, pagination }));
  }
}

try {
  const staticFiles = join(root, 'public');
  if (existsSync(staticFiles)) cpSync(staticFiles, output, { recursive: true });
  cpSync(join(root, 'site/assets'), join(output, 'assets'), { recursive: true });
  if (posts.some(p => p.hasMath)) {
    const katex = join(root, 'node_modules/katex/dist');
    const target = join(output, 'assets/katex');
    mkdirSync(target, { recursive: true });
    cpSync(join(katex, 'katex.min.css'), join(target, 'katex.min.css'));
    cpSync(join(katex, 'fonts'), join(target, 'fonts'), { recursive: true });
  }
  write('/CNAME', domain + '\n');
  write('/.nojekyll', '');
  page('/', renderHome({ site, posts }));
  for (const post of posts) page(post.url, renderPost({ site, post, posts }));

  listing('articles', '文章', '', '/', posts, { first: 2 });
  listing('archives', '文章归档', '', '/archives/', posts, { allOnFirst: true });
  for (const [period, members] of groupBy(posts, p => [p.date.slice(0, 4), p.date.slice(0, 7).replace('-', '/')])) {
    listing('archives', period + ' 归档', period, '/archives/' + period + '/', members);
  }
  for (const [kind, title, groups, urls] of [
    ['categories', '文章分类', categories, site.categoryUrls], ['tags', '文章标签', tags, site.tagUrls],
  ]) {
    const path = '/' + kind + '/';
    page(path, renderListing({ site, allPosts: posts, posts, kind, title, filter: '', path,
      pagination: { page: 1, totalPages: 1, prev: null, next: null } }));
    for (const [name, members] of groups) {
      listing(kind === 'categories' ? 'category' : 'tag', name, name, urls[name], members);
    }
  }
  for (const [kind, title] of Object.entries({ about: '关于', friends: '友情链接', contact: '联系', 404: '页面未找到' })) {
    const path = kind === '404' ? '/404.html' : '/' + kind + '/';
    page(path, renderPage({ site, posts, title, kind, path }));
  }
  writeFeeds(write, { site, posts, pages });
  const previous = join(staging, 'previous');
  if (existsSync(dist)) renameSync(dist, previous);
  try {
    renameSync(output, dist);
  } catch (error) {
    if (existsSync(previous) && !existsSync(dist)) renameSync(previous, dist);
    throw error;
  }
  console.log('已生成 ' + posts.length + ' 篇文章、' + pages.length + ' 个页面 → dist/');
} finally {
  rmSync(staging, { recursive: true, force: true });
}
