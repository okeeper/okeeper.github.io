import { day, dateTag, esc, icon, layout, typeset } from './layout.mjs';

function countTerms(posts, field) {
  const counts = new Map();
  for (const post of posts) for (const name of post[field]) counts.set(name, (counts.get(name) || 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh'));
}
function textLink(label, url, glyph = 'arrow') {
  return `<a class="text-link" href="${esc(url)}">${esc(label)} ${icon(glyph,16)}</a>`;
}
function resumeLink() {
  return `<a class="text-link resume-link" href="https://okeeper.com/resume/" target="_blank" rel="noopener" aria-label="个人简历（在新标签页打开）">个人简历 ${icon('diagonal',15)}</a>`;
}
function topicIcon(topic) {
  return ({'人工智能':'stack','软件笔记':'book','后端&架构':'graph','操作系统原理':'code'})[topic] || 'tag';
}
function authorBox() {
  return `<section class="author-box"><div class="small-heading">关于作者</div>
  <div class="author-line"><img width="54" height="54" src="/assets/author.webp" alt="张跃"><div><strong>张跃 <span lang="en">Okeeper</span></strong><p>程序员 · 架构师</p></div></div>
  <p class="bio">记录人工智能的新进展，也写软件工程和系统架构中的实践。</p>
  <div class="author-links">${textLink('更多关于我','/about/')}${resumeLink()}</div></section>`;
}
function topicBox(posts, site) {
  return `<section class="topic-box"><div class="section-line"><h2>主题索引</h2>${textLink('全部','/categories/')}</div>
  <ul class="topic-list">${countTerms(posts,'categories').slice(0,5).map(([name,count]) =>
    `<li><a href="${esc(site.categoryUrls[name])}"><span class="topic-icon">${icon(topicIcon(name),16)}</span>${esc(name)}<span class="num">${count}</span></a></li>`).join('')}</ul></section>`;
}
function meta(post, {reading = true} = {}) {
  const topic = post.categories[0];
  return `<div class="meta">${topic ? `<span class="topic-name">${esc(topic)}</span><i></i>` : ''}${dateTag(post)}${reading ? `<i></i><span class="read-time">${icon('clock',13)}${post.minutes} 分钟</span>` : ''}</div>`;
}
function postRow(post) {
  return `<article class="post-row"><a class="row-link" href="${esc(post.url)}">
  <div class="row-copy">${meta(post)}<h3>${typeset(post.title)}</h3>${post.summary ? `<p>${esc(post.summary)}</p>` : ''}</div>
  ${post.cover ? `<img class="thumb" src="${esc(post.cover)}" alt="" width="126" height="87" loading="lazy">` : ''}</a></article>`;
}
function feature(post) {
  const isDiagram = !post.cover || post.cover === '/assets/field-cover.webp';
  return `<article class="feature ${isDiagram ? 'diagram' : 'photo'}">
  <div class="feature-text"><div class="feature-kicker"><span class="signal"></span>最新文章${post.categories.length ? `<span class="kicker-slash">/</span><span>${esc(post.categories[0])}</span>` : ''}</div>
  <h1><a href="${esc(post.url)}">${typeset(post.title,true)}</a></h1><p class="standfirst">${esc(post.summary)}</p>
  <div class="feature-bottom"><a class="read-button" href="${esc(post.url)}">阅读文章 ${icon('arrow',17)}</a><div class="meta">${dateTag(post)}<i></i><span>${post.minutes} 分钟阅读</span></div></div></div>
  <div class="feature-art" aria-hidden="true"><img src="${esc(post.cover || '/assets/field-cover.webp')}" width="1000" height="700" alt="" fetchpriority="high"></div></article>`;
}
function topicTabs(posts,site,filter = '') {
  return `<nav class="tabs" aria-label="按主题浏览"><a href="/#articles"${!filter ? ' aria-current="true"' : ''}>全部</a>${countTerms(posts,'categories').slice(0,3).map(([name]) => `<a href="${esc(site.categoryUrls[name])}"${name === filter ? ' aria-current="true"' : ''}>${esc(name)}</a>`).join('')}</nav>`;
}
export function renderHome({posts,site}) {
  const [lead,...rest] = posts;
  return layout({site,active:'home',body:`${lead ? feature(lead) : ''}
  <div class="columns home-columns"><section id="articles" class="feed"><div class="section-line feed-title"><h2>文章手记</h2>${textLink('时间归档','/archives/')}</div>
  ${topicTabs(posts,site)}${rest.slice(0,11).map(postRow).join('') || '<p class="empty">更多文章将在这里更新。</p>'}
  ${posts.length > 12 ? `<div class="paging">${textLink('更早的文章','/page/2/')}</div>` : ''}</section>
  <aside class="rail">${authorBox()}${topicBox(posts,site)}</aside></div>`});
}
function paginationBar(pagination) {
  if (!pagination || pagination.totalPages <= 1) return '';
  return `<nav class="paging" aria-label="文章分页"><span>${pagination.prev ? textLink('上一页',pagination.prev,'left') : ''}</span><span class="num">${pagination.page} / ${pagination.totalPages}</span><span>${pagination.next ? textLink('下一页',pagination.next) : ''}</span></nav>`;
}
function archiveRows(posts) {
  const years = Map.groupBy(posts,p => p.date.slice(0,4));
  return [...years].map(([year,items]) => `<section class="year-block" id="y${year}"><h2>${year}<span>${items.length} 篇</span></h2><ul>${items.map(p =>
    `<li><a href="${esc(p.url)}"><time class="num" datetime="${esc(day(p))}">${esc(day(p).slice(5).replace('-','.'))}</time><span>${typeset(p.title)}</span>${icon('chevron',15)}</a></li>`).join('')}</ul></section>`).join('');
}
function taxonomyPage(rows,urls) {
  return `<ul class="term-grid">${rows.map(([term,count]) => `<li><a href="${esc(urls[term])}"><span>${esc(term)}</span><span class="num">${count} 篇 ${icon('chevron',14)}</span></a></li>`).join('')}</ul>`;
}
export function renderListing({posts,allPosts,site,title,kind,filter,path,pagination}) {
  const fullArchive = kind === 'archives' && !filter && pagination.page === 1;
  const directory = kind === 'categories' || kind === 'tags';
  const pageLabel = ({articles:'文章手记',category:'主题',tag:'标签',archives:'时间索引',categories:'主题索引',tags:'主题索引'})[kind];
  const yearLinks = `<section class="toc-box"><h2>按年份跳转</h2>${[...new Set(posts.map(p => p.date.slice(0,4)))].map(y => `<a href="#y${y}">${y}</a>`).join('')}</section>`;
  const count = kind === 'category' || kind === 'tag' ? allPosts.filter(p => p[kind === 'category' ? 'categories' : 'tags'].includes(filter)).length : posts.length;
  const eyebrow = `<div class="crumb"><a href="/">首页</a> / ${esc(pageLabel)}</div>`;
  const content = directory ? taxonomyPage(countTerms(allPosts,kind),kind === 'tags' ? site.tagUrls : site.categoryUrls) :
    kind === 'archives' ? archiveRows(posts) : posts.map(postRow).join('');
  return layout({site,title,path,active:'archives',body:`<div class="page-intro">${eyebrow}<h1>${esc(title)}${directory ? '' : `<span class="title-count">${count} 篇</span>`}</h1></div>
  <div class="columns inner-columns"><section>${kind === 'category' ? topicTabs(allPosts,site,filter) : ''}${content}${fullArchive ? '' : paginationBar(pagination)}</section>
  <aside class="rail">${fullArchive ? yearLinks : ''}${topicBox(allPosts,site)}</aside></div>`});
}
function tocFor(post, mobile = false) {
  if (!post.toc.length) return '';
  const baseLevel = Math.min(...post.toc.map(t => t.level));
  const items = post.toc.filter(t => t.level <= baseLevel + 1);
  const links = items.map(t => `<a class="level-${t.level === baseLevel ? 'top' : 'sub'}" href="#${esc(t.id)}">${esc(t.text)}</a>`).join('');
  return mobile ? `<details class="mobile-toc"><summary>本文目录</summary><nav aria-label="手机文章目录">${links}</nav></details>` : `<nav class="toc-box reader-toc" aria-label="文章目录"><h2>本文目录</h2>${links}</nav>`;
}
export function renderPost({site,posts,post}) {
  const i = posts.indexOf(post);
  const neighbors = [[posts[i-1],'较新一篇'],[posts[i+1],'较早一篇']].filter(([p]) => p);
  const tags = post.tags.map(t => `<a href="${esc(site.tagUrls[t])}"># ${esc(t)}</a>`).join('');
  return layout({site,title:post.title,description:post.summary,path:post.url,article:true,math:post.hasMath,body:`
  <div class="reading-grid"><article class="reader"><header class="article-head"><div class="crumb"><a href="/">首页</a> / ${post.categories.length ? `<a href="${esc(site.categoryUrls[post.categories[0]])}">${esc(post.categories[0])}</a>` : '文章'}</div>
  <h1>${typeset(post.title,true)}</h1><div class="byline"><a href="/about/"><img src="/assets/author.webp" width="31" height="31" alt="">张跃</a><i></i>${dateTag(post)}<i></i><span>${icon('clock',14)} ${post.minutes} 分钟阅读</span></div></header>
  ${tocFor(post,true)}<div class="prose">${post.html || '<p>此篇原稿未收录正文。</p>'}</div>
  <div class="article-end"><div class="tag-links">${tags}</div>${textLink('讨论这篇文章','https://github.com/okeeper/okeeper.github.io/issues?q=' + encodeURIComponent(post.title),'diagonal')}</div>
  <nav class="neighbor-list" aria-label="相邻文章">${neighbors.map(([p,label]) => `<a href="${esc(p.url)}"><small>${label}</small><strong>${typeset(p.title)}</strong>${icon('arrow')}</a>`).join('')}</nav></article>
  <aside class="reader-rail">${tocFor(post)}${textLink('返回文章归档','/archives/','left')}</aside></div>`});
}

const links = {
  contact: [['电子邮箱','mailto:zhangyue0808@qq.com','zhangyue0808@qq.com'],['备用邮箱','mailto:okeeper.com@gmail.com','okeeper.com@gmail.com'],['GitHub 留言','https://github.com/okeeper/okeeper.github.io/issues','博客讨论区']],
  friends: [['知乎专栏','https://zhuanlan.zhihu.com/okeeper','自然语言处理与深度学习'],['友链交换','/contact/','联系张跃']],
  work: [['开源项目','https://github.com/okeeper','GitHub · okeeper'],['个人项目','http://model-bridge.okeeper.com','ModelBridge / 魔桥']],
};
function linkList(items) {
  return `<ul class="profile-links">${items.map(([label,url,value]) => `<li><a href="${esc(url)}"><span>${esc(label)}</span><strong>${esc(value)}</strong>${icon('diagonal',16)}</a></li>`).join('')}</ul>`;
}
function wechatPanel() {
  const accounts = [
    { name: '个人微信', action: '添加张跃为好友', file: 'wechat-personal.jpg' },
    { name: '公众号「神笔君」', action: '关注技术文章', file: 'wechat-shenbijun.jpg' },
  ];
  return `<section class="wechat-panel" aria-labelledby="wechat-heading"><h2 id="wechat-heading">在微信上找到我</h2>
    <p>用微信扫一扫，或点开二维码查看原图。</p>
    <div class="wechat-codes">${accounts.map(({name, action, file}) => {
      const src = '/images/profile/' + file;
      return `<figure><a class="qr-image" href="${src}" target="_blank" rel="noopener" aria-label="查看${name}二维码原图（在新标签页打开）">
        <img src="${src}" width="192" height="192" alt="${name}二维码"></a>
        <figcaption><strong>${name}</strong><span>${action}</span></figcaption></figure>`;
    }).join('')}</div></section>`;
}
export function renderPage({site,posts,kind,title,path}) {
  let content;
  if (kind === 'about') {
    return layout({site,title,path,active:'about',body:`<div class="profile-page">
      <div class="crumb"><a href="/">首页</a> / 关于</div><div class="about-grid">
      <section class="about-intro"><header class="profile-hero"><img src="/assets/author.webp" alt="张跃" width="96" height="96"><div><h1>张跃 <em>Okeeper</em></h1><p>程序员 · 架构师</p></div></header>
      <div class="profile-copy"><p>我是张跃，网名 Okeeper。这里是我的个人博客，记录人工智能、软件工程和系统架构，也写平时用到的工具与读书笔记。</p></div>${resumeLink()}</section>
      ${wechatPanel()}
      <section class="profile-copy about-details"><h2>工作与学习</h2><p>毕业于 JVTC 软件技术专业。曾在百倍网络负责交易系统的核心开发与架构，后来在菜鸟网络参与国际仓储 WMS 系统研发。</p>
      <p>曾获蓝桥杯 Java 组全国二等奖、江西省一等奖，以及大三学年一等奖学金。</p><h2>项目</h2>${linkList(links.work)}${textLink('联系我','/contact/')}</section>
      </div></div>`});
  }
  if (kind === 'contact') {
    content = `<h1>联系与留言</h1><div class="profile-copy"><p>关于文章、技术交流或友链交换，可以通过以下方式找到我。</p>${linkList(links.contact)}<p>微信 <code>zhangyue0808</code>　QQ <code>610998697</code></p><h2>交换友链</h2><p>来信请附上博客名称、地址、一句话简介和头像链接。</p></div>`;
  } else if (kind === 'friends') {
    content = `<h1>友情链接</h1><div class="profile-copy">${linkList(links.friends)}</div>`;
  } else {
    content = `<h1>页面未找到</h1><div class="profile-copy"><p>这个地址暂时没有文章。你可以到归档中查找标题或主题。</p>${textLink('浏览文章归档','/archives/')}</div>`;
  }
  return layout({site,title,path,active:kind === 'about' ? 'about' : '',body:`
  <div class="columns profile-page"><section><div class="crumb"><a href="/">首页</a> / ${esc(title)}</div>${content}</section><aside class="rail">${topicBox(posts,site)}</aside></div>`});
}
