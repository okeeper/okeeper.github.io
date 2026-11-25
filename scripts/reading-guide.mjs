import { identity } from '../site/identity.mjs';
import { selectedWriting } from '../site/selected-writing.mjs';

function inlineText(text) {
  return text.replace(/\s+/g, ' ').trim().replace(/[\\[\]*_`<>]/g, '\\$&');
}

function link(title, href) {
  // Parentheses can be part of a valid permalink and are delimiters in Markdown.
  const destination = href.replaceAll('(', '%28').replaceAll(')', '%29');
  return `[${inlineText(title)}](${destination})`;
}

export function writeReadingGuide(write, { site, posts }) {
  const absolute = path => new URL(path, site.url).href;
  const author = link(identity.name + '（' + identity.handle + '）', absolute(identity.profilePath));
  const title = '# ' + inlineText(site.title);
  const articleIndex = [];
  let currentYear;

  for (const post of posts) {
    const publishedDay = post.date.slice(0, 10);
    const original = link('网页原文', absolute(post.url));
    const updated = Date.parse(post.updated) > Date.parse(post.date) ? '\n- 更新 ' + post.updated : '';
    write(post.markdownUrl, `# ${inlineText(post.title)}\n\n- 作者 ${author}\n- 发表 ${post.date}${updated}\n- ${original}\n\n${post.body}`);

    const year = publishedDay.slice(0, 4);
    if (year !== currentYear) {
      articleIndex.push('', '## ' + year, '');
      currentYear = year;
    }
    articleIndex.push(`- ${publishedDay} · ${link(post.title, absolute(post.markdownUrl))} · ${original}`);
  }
  write('/articles.md', title + ' · 文章目录\n\n按发表日期倒序排列。点击文章标题可读取 Markdown 正文。\n' + articleIndex.join('\n') + '\n');

  const selected = selectedWriting(posts);
  const guide = [
    title, '', '> ' + identity.description, '',
    '文章的 Markdown 版本保留发表日期、作者和网页原文链接。引用时可使用网页原文链接。', '',
    '## 作者', '',
    '- ' + link('作者介绍', absolute(identity.profilePath)),
    '- ' + link('个人简历', identity.resume),
    '- ' + link('GitHub 主页', identity.github), '',
    '## 文章', '',
    '- ' + link('全部文章的 Markdown 目录', absolute('/articles.md')),
    '- ' + link('按主题浏览', absolute('/categories/')),
    '- ' + link('按时间浏览', absolute('/archives/')),
  ];
  if (selected.length) {
    guide.push('', '## 代表文章', '', ...selected.map(post => '- ' + link(post.title, absolute(post.markdownUrl))));
  }
  guide.push('', '## Optional', '',
    '- ' + link('最近更新的 Atom 订阅', absolute('/atom.xml')),
    '- ' + link('HTML 网页站点地图', absolute('/sitemap.xml')), '');
  write('/llms.txt', guide.join('\n'));
}
