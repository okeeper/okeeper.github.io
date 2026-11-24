import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import MarkdownIt from 'markdown-it';
import markdownMath from '@vscode/markdown-it-katex';
import { load, JSON_SCHEMA } from 'js-yaml';
import { parseFragment, serialize } from 'parse5';

const options = { html: true, linkify: true, breaks: true };
const markdown = new MarkdownIt(options);
const mathMarkdown = new MarkdownIt(options).use(markdownMath.default, { throwOnError: false });

function plainText(node) {
  if (node.nodeName === '#text') return node.value;
  if (['script', 'style', 'annotation'].includes(node.tagName)) return '';
  return (node.childNodes || []).map(plainText).join('');
}

function renderBody(body, math) {
  const document = parseFragment((math ? mathMarkdown : markdown).render(body));
  const toc = [];
  const ids = new Set();
  const paragraphs = [];

  function visit(node) {
    if (/^h[1-6]$/.test(node.tagName)) {
      const text = plainText(node).trim();
      const attribute = node.attrs.find(({ name }) => name === 'id');
      // Hexo treated Chinese enumeration and sentence stops as word boundaries.
      const slug = text.toLowerCase().replace(/[、。]/g, ' ')
        .replace(/[^\p{L}\p{N}_\s-]/gu, '').trim().replace(/[\s-]+/g, '-');
      const base = attribute?.value || slug || 'section';
      let id = base;
      for (let n = 2; ids.has(id); n++) id = base + '-' + n;
      ids.add(id);
      if (attribute) attribute.value = id;
      else node.attrs.push({ name: 'id', value: id });
      if (text) toc.push({ id, text, level: Number(node.tagName.slice(1)) });
    }
    if (node.tagName === 'p') {
      const text = plainText(node).trim();
      if (text) paragraphs.push(text);
    }
    for (const child of node.childNodes || []) visit(child);
  }
  visit(document);
  // The old Hexo theme linked its top-level sections as #toc-heading-1, #toc-heading-2, …
  const oldSections = document.childNodes.filter(node => /^h[1-4]$/.test(node.tagName));
  oldSections.forEach((node, index) => {
    const legacyId = 'toc-heading-' + (index + 1);
    if (!ids.has(legacyId)) {
      const anchor = parseFragment('<span id="' + legacyId + '" aria-hidden="true"></span>').childNodes[0];
      node.childNodes.unshift(anchor);
    }
  });
  const text = plainText(document).replace(/\s+/g, ' ').trim();
  const han = text.match(/\p{Script=Han}/gu)?.length ?? 0;
  const words = text.match(/[\p{Script=Latin}\p{N}]+/gu)?.length ?? 0;
  const intro = paragraphs.find(p => p.length >= 12) || paragraphs[0] || text;
  return {
    html: serialize(document), toc, text,
    minutes: Math.max(1, Math.ceil(han / 400 + words / 225)),
    summary: intro.length > 110 ? intro.slice(0, 109) + '…' : intro,
  };
}

function validateUrl(value) {
  if (typeof value !== 'string' || !/^\/(?:[^/\\?#%]+\/)+$/.test(value) ||
      value.split('/').some(part => part === '.' || part === '..' || part.startsWith('.'))) {
    throw new Error('url 请使用站内固定链接，例如 /notes/my-post/。');
  }
  return value;
}

function dateString(value, field) {
  const pattern = /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2}))?$/;
  if (typeof value !== 'string' || !pattern.test(value) || !Number.isFinite(Date.parse(value))) {
    throw new Error(field + ' 请使用 YYYY-MM-DD 或带时区的 ISO 8601 时间。');
  }
  const day = value.slice(0, 10);
  if (new Date(day).toISOString().slice(0, 10) !== day) throw new Error(field + ' 包含无效日期。');
  return value;
}

function labels(values, field) {
  if (values == null) return [];
  if (!Array.isArray(values) || values.some(v => typeof v !== 'string' || !v.trim())) {
    throw new Error(field + ' 必须是字符串数组。');
  }
  return [...new Set(values.map(v => v.trim()))];
}

function readPost(file) {
  const raw = readFileSync(file, 'utf8').replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  const parts = /^---\n([\s\S]*?)\n---(?:\n|$)/.exec(raw);
  if (!parts) throw new Error('缺少 YAML 文章头部。');
  const meta = load(parts[1], { schema: JSON_SCHEMA });
  if (!meta || typeof meta.title !== 'string' || !meta.title.trim()) throw new Error('缺少文章标题。');
  const result = renderBody(raw.slice(parts[0].length), meta.math === true);
  const date = dateString(meta.date, 'date');
  return {
    ...result, title: meta.title.trim(), url: validateUrl(meta.url), date,
    updated: dateString(meta.updated ?? date, 'updated'),
    categories: labels(meta.categories, 'categories'), tags: labels(meta.tags, 'tags'),
    summary: meta.summary?.trim() || result.summary, cover: meta.cover || '',
    hasMath: result.html.includes('class="katex"'),
  };
}

export function loadPosts(folder) {
  const posts = [];
  for (const filename of readdirSync(folder, { recursive: true }).sort()) {
    if (!filename.endsWith('.md')) continue;
    const file = path.join(folder, filename);
    try {
      posts.push(readPost(file));
    } catch (error) {
      throw new Error(file + ': ' + error.message, { cause: error });
    }
  }
  return posts.sort((a, b) => Date.parse(b.date) - Date.parse(a.date) || a.url.localeCompare(b.url));
}
