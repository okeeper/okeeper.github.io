import { identity } from './identity.mjs';

const icons = {
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  rss: '<path d="M4 5a15 15 0 0 1 15 15M4 11a9 9 0 0 1 9 9"/><circle cx="5" cy="19" r="1" fill="currentColor"/>',
  arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
  diagonal: '<path d="M5 18 18 5M6 5h12v12"/>',
  left: '<path d="M20 12H5m6-6-6 6 6 6"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3 1.5"/>',
  stack: '<path d="m3 8 9-5 9 5-9 5-9-5Zm1 5 8 4.5 8-4.5m-16 4 8 4.5 8-4.5"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  code: '<path d="m8 7-5 5 5 5m8-10 5 5-5 5m-3-13-2 16"/>',
  book: '<path d="M4 4h13a2 2 0 0 1 2 2v14H6a2 2 0 0 1-2-2V4Zm0 12h15M8 4v7l2-1.5 2 1.5V4"/>',
  graph: '<rect x="9" y="3" width="6" height="5" rx="1"/><rect x="2" y="16" width="6" height="5" rx="1"/><rect x="16" y="16" width="6" height="5" rx="1"/><path d="M12 8v4M5 16v-4h14v4"/>',
  tag: '<path d="M4 4h8l8 8-8 8-8-8V4Z"/><circle cx="8.5" cy="8.5" r="1"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M7.5 3v4m9-4v4m-13 3h17"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
};
export function icon(name, size = 18) {
  return `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">${icons[name]}</svg>`;
}
export function esc(text) {
  return String(text ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
}
const words = new Intl.Segmenter('zh-CN', { granularity: 'word' });
export function typeset(text, keepWords = false) {
  const spaced = String(text).replace(/([\p{Script=Han}])([A-Za-z0-9])/gu, '$1 $2').replace(/([A-Za-z0-9])([\p{Script=Han}])/gu, '$1 $2');
  if (!keepWords) return esc(spaced);
  return Array.from(words.segment(spaced), ({segment}) => /^\p{Script=Han}{2,8}$/u.test(segment)
    ? `<span class="title-word">${esc(segment)}</span>` : esc(segment)).join('');
}
export function day(post) {
  return post.date.slice(0,10);
}
const journalDay = new Intl.DateTimeFormat('sv-SE', {
  timeZone:'Asia/Shanghai', year:'numeric', month:'2-digit', day:'2-digit',
});
export function localDate(value) {
  return value.length === 10 ? value : journalDay.format(new Date(value));
}
export function dateTag(post) {
  return `<time datetime="${esc(post.date)}">${esc(day(post).replaceAll('-', '.'))}</time>`;
}
function brand() {
  return `<a class="brand" href="/" aria-label="神笔君 Okeeper 首页"><span class="brand-mark"><img src="/assets/owl.png" alt="" width="21" height="29"></span><strong>神笔君</strong><span class="brand-en" lang="en">Okeeper’s Journal</span></a>`;
}
function header(active) {
  const links = [['首页','/','home'],['文章归档','/archives/','archives'],['关于','/about/','about']];
  return `<header class="mast"><div class="wrap mast-inner">${brand()}<nav aria-label="主导航">${links.map(([label,url,key]) => `<a href="${url}"${key === active ? ' aria-current="page"' : ''}>${label}</a>`).join('')}</nav>
  <div class="head-tools"><a class="search-launch" href="/archives/" data-search aria-label="搜索文章">${icon('search',17)}<span>搜索</span><kbd>/</kbd></a><a class="rss-link" href="/atom.xml" aria-label="RSS 订阅" title="RSS 订阅">${icon('rss',19)}</a></div></div></header>`;
}
function searchDialog() {
  return `<dialog id="search-dialog" aria-labelledby="search-label"><div class="search-top"><h2 id="search-label">搜索文章</h2><button aria-label="关闭搜索" data-close>${icon('close')}</button></div>
  <div class="search-input">${icon('search',20)}<input type="search" id="search-q" placeholder="输入标题、主题或正文关键词" autocomplete="off" aria-label="搜索关键词"></div>
  <p id="search-status" role="status"></p><ul id="search-results" class="search-results"></ul></dialog>`;
}
function absoluteImage(candidate, base) {
  if (!candidate?.src || !URL.canParse(candidate.src,base)) return;
  const url = new URL(candidate.src,base);
  if (url.protocol === 'https:' || url.protocol === 'http:') return {url: url.href, alt: candidate.alt};
}

export function modificationDate(post) {
  return Date.parse(post.updated) > Date.parse(post.date) ? post.updated : undefined;
}

function pageGraph({site, path, canonical, title, description, pageType, post, image}) {
  const absolute = path => new URL(path,site.url).href;
  const home = absolute('/');
  const person = {
    '@type': 'Person', '@id': absolute(identity.profilePath + '#person'),
    name: identity.name, alternateName: [identity.handle, identity.romanizedName], url: absolute(identity.profilePath),
  };
  const website = {'@id': home + '#website'};
  const page = {
    '@type': pageType, '@id': canonical + '#webpage', url: canonical, name: title,
    description, inLanguage: 'zh-CN', isPartOf: website,
  };
  const graph = [page];
  if (path === '/') {
    graph.push({
      ...website, '@type': 'WebSite', name: identity.brand, alternateName: identity.journal,
      url: home, description: identity.description, inLanguage: 'zh-CN', publisher: person,
    });
  }
  if (pageType === 'ProfilePage') {
    page.mainEntity = {'@id': person['@id']};
    graph.push({
      ...person, jobTitle: identity.roles, image: absolute(identity.portrait),
      sameAs: [identity.github, identity.resume], brand: {'@type':'Brand', name:identity.brand},
    });
  }
  if (post) {
    const id = canonical + '#article';
    page.mainEntity = {'@id': id};
    graph.push({
      '@type':'BlogPosting', '@id':id, url:canonical, headline:post.title,
      mainEntityOfPage:{'@id':page['@id']}, inLanguage:'zh-CN', description,
      author:person, publisher:{'@id':person['@id']},
      datePublished:post.date, dateModified:modificationDate(post), image:image?.url,
      articleSection:post.categories.length ? post.categories : undefined,
      keywords:post.tags.length ? post.tags : undefined,
    });
    const trail = [[identity.brand,home]];
    const topic = post.categories[0];
    if (topic) trail.push([topic,absolute(site.categoryUrls[topic])]);
    trail.push([post.title,canonical]);
    page.breadcrumb = {
      '@type':'BreadcrumbList', itemListElement:trail.map(([name,item], index) => ({
        '@type':'ListItem', position:index + 1, name, item,
      })),
    };
  }
  // Embedded JSON-LD is script raw text: HTML entities would alter the JSON values.
  return JSON.stringify({'@context':'https://schema.org','@graph':graph}).replaceAll('<','\\u003c');
}

function metaTag(attribute, name, content) {
  return content ? `<meta ${attribute}="${name}" content="${esc(content)}">` : '';
}

export function layout({site, title, description = identity.description, path = '/', active, post, socialImage,
  pageType = 'WebPage', noindex = false, math = false, body}) {
  const canonicalPath = post?.canonicalUrl || path;
  const canonical = new URL(canonicalPath,site.url).href;
  const primary = canonicalPath === path;
  const article = post && primary && !noindex ? post : undefined;
  const fullTitle = path === '/' ? `${identity.brand} · ${identity.name}（${identity.handle}）的技术博客` : `${title} · ${identity.brand}`;
  const cover = post?.cover ? {src:post.cover, alt:`《${post.title}》封面`} : post?.leadImage;
  const image = absoluteImage(cover || socialImage,canonical);
  const og = (name, content) => metaTag('property',name,content);
  const twitter = (name, content) => metaTag('name',name,content);
  const social = [
    og('og:type', post ? 'article' : pageType === 'ProfilePage' ? 'profile' : 'website'),
    og('og:locale','zh_CN'), og('og:site_name',identity.brand), og('og:url',canonical),
    og('og:title',fullTitle), og('og:description',description),
    og('og:image',image?.url), og('og:image:alt',image?.alt),
    twitter('twitter:card', image && post ? 'summary_large_image' : 'summary'),
    twitter('twitter:title',fullTitle), twitter('twitter:description',description),
    twitter('twitter:image',image?.url), twitter('twitter:image:alt',image?.alt),
  ];
  if (article) social.push(
    og('article:author',new URL(identity.profilePath,site.url).href),
    og('article:published_time',article.date), og('article:modified_time',modificationDate(article)),
    og('article:section',article.categories[0]), ...article.tags.map(tag => og('article:tag',tag)),
  );
  const graph = primary && !noindex
    ? pageGraph({site,path,canonical,title:title || fullTitle,description,pageType,post:article,image})
    : null;
  return `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(fullTitle)}</title><meta name="description" content="${esc(description)}"><meta name="author" content="${esc(identity.name)}"><meta name="theme-color" content="#f7f8f4"><meta name="robots" content="${noindex ? 'noindex,follow' : 'max-image-preview:large'}">
<link rel="canonical" href="${esc(canonical)}">${social.join('')}
<link rel="icon" href="/favicon.png"><link rel="alternate" type="application/atom+xml" title="神笔君 RSS" href="/atom.xml"><link rel="describedby" type="text/plain" href="/llms.txt">
${post?.markdownUrl ? `<link rel="alternate" type="text/markdown" href="${esc(new URL(post.markdownUrl,site.url).href)}">` : ''}
${graph ? `<script type="application/ld+json">${graph}</script>` : ''}
<link rel="stylesheet" href="/assets/journal.css">${math ? '<link rel="stylesheet" href="/assets/katex/katex.min.css">' : ''}<script defer src="/assets/journal.js"></script></head><body>
<a class="skip" href="#main">跳至正文</a>${header(active)}
<main id="main" class="wrap">${body}</main>
<footer><div class="wrap foot"><span>© ${esc(identity.name)} · ${esc(identity.handle)}</span><nav aria-label="页脚导航"><a href="/friends/">友链</a><a href="/contact/">联系</a><a href="${esc(identity.github)}" rel="me">GitHub ${icon('diagonal',13)}</a><a href="/atom.xml">RSS ${icon('rss',13)}</a></nav></div></footer>${searchDialog()}</body></html>`;
}
