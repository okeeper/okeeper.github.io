function xml(value) {
  return String(value).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '')
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&apos;');
}

export function writeFeeds(write, { site, posts, pages }) {
  const absolute = url => new URL(url, site.url).href;
  const header = '<?xml version="1.0" encoding="utf-8"?>\n';
  const timestamp = date => new Date(date).toISOString();
  const newest = posts.length ? Math.max(...posts.map(p => Date.parse(p.updated))) : Date.now();
  const entry = p => `<entry>
    <title>${xml(p.title)}</title><id>${xml(absolute(p.url))}</id><link href="${xml(absolute(p.url))}"/>
    <published>${timestamp(p.date)}</published><updated>${timestamp(p.updated)}</updated>
    <summary>${xml(p.summary)}</summary>${p.tags.map(t => `<category term="${xml(t)}"/>`).join('')}
    <content type="html" xml:base="${xml(absolute(p.url))}">${xml(p.html)}</content>
  </entry>`;
  write('/atom.xml', header + `<feed xmlns="http://www.w3.org/2005/Atom">
    <title>${xml(site.title)}</title><id>${xml(absolute('/'))}</id><updated>${timestamp(newest)}</updated>
    <link href="${xml(absolute('/atom.xml'))}" rel="self"/><link href="${xml(absolute('/'))}"/>
    <author><name>${xml(site.author)}</name></author>
    ${posts.slice(0, 20).map(entry).join('\n')}
  </feed>`);

  const updated = new Map(posts.map(p => [p.url, p.updated]));
  function sitemap(urls) {
    return header + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
      urls.map(url => `<url><loc>${xml(absolute(url))}</loc>${updated.has(url) ? '<lastmod>' + timestamp(updated.get(url)) + '</lastmod>' : ''}</url>`).join('\n') +
      '\n</urlset>';
  }
  write('/sitemap.xml', sitemap(pages.filter(url => url !== '/404.html')));
  write('/baidusitemap.xml', sitemap(posts.map(p => p.url)));
  write('/baidu_urls.txt', posts.map(p => absolute(p.url)).join('\n') + '\n');

  const search = posts.map(({ title, url, date, categories, tags, summary, text }) =>
    ({ title, url, date, categories, tags, summary, text }));
  write('/search.json', JSON.stringify(search));
  write('/search.xml', header + '<search>\n' + posts.map(p =>
    `<entry><title>${xml(p.title)}</title><link href="${xml(p.url)}"/><url>${xml(p.url)}</url><content type="html">${xml(p.html)}</content></entry>`
  ).join('\n') + '\n</search>');
}
