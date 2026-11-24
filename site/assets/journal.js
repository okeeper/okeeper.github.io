(() => {
  const dialog = document.querySelector('#search-dialog');
  const input = document.querySelector('#search-q');
  const status = document.querySelector('#search-status');
  const results = document.querySelector('#search-results');
  let index;
  let pending;

  function showMatches() {
    if (!index) return;
    const query = input.value.trim().toLocaleLowerCase();
    const terms = query.split(/\s+/).filter(Boolean);
    const matches = [];
    for (const entry of index) {
      if (!terms.every(term => entry.searchText.includes(term))) continue;
      const score = terms.reduce((total, term) => total + (entry.title.toLocaleLowerCase().includes(term) ? 3 : 0)
        + (entry.labels.includes(term) ? 1 : 0), 0);
      matches.push({ entry, score });
    }
    matches.sort((a, b) => b.score - a.score);
    const limit = query ? 25 : 5;
    status.textContent = !query ? '最近发布' : !matches.length ? '没有找到相关文章，可以试试其他关键词。'
      : matches.length > limit ? `找到 ${matches.length} 篇，显示最相关的 ${limit} 篇。` : `找到 ${matches.length} 篇相关文章。`;
    results.replaceChildren();
    for (const { entry } of matches.slice(0, limit)) {
      const link = document.createElement('a');
      link.href = entry.url;
      const title = document.createElement('strong');
      title.textContent = entry.title;
      const info = document.createElement('small');
      info.textContent = [entry.date.slice(0,10), ...entry.categories].join(' · ');
      link.append(info,title);
      const li = document.createElement('li');
      li.append(link);
      results.append(li);
    }
  }

  async function openSearch() {
    if (dialog.open) return;
    dialog.showModal();
    input.focus();
    if (!index) {
      status.textContent = '正在载入文章索引…';
      try {
        pending ??= fetch('/search.json').then(response => {
          if (!response.ok) throw new Error('index unavailable');
          return response.json();
        }).then(posts => posts.map(post => {
          const labels = [...post.tags, ...post.categories].join(' ').toLocaleLowerCase();
          return { ...post, labels, searchText: [post.title, labels, post.summary, post.text].join(' ').toLocaleLowerCase() };
        }));
        index = await pending;
      } catch {
        pending = undefined;
        status.textContent = '暂时无法载入索引。重新打开搜索可重试。';
        const archive = document.createElement('a');
        archive.href = '/archives/';
        archive.textContent = '浏览文章归档 →';
        const item = document.createElement('li');
        item.append(archive);
        results.replaceChildren(item);
        return;
      }
    }
    showMatches();
  }
  document.querySelector('[data-search]').addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    openSearch();
  });
  document.addEventListener('keydown', event => {
    if (event.key !== '/' || event.altKey || event.ctrlKey || event.metaKey || event.isComposing ||
        event.target.closest('input,textarea,[contenteditable]')) return;
    event.preventDefault();
    openSearch();
  });
  document.querySelector('[data-close]').addEventListener('click', () => dialog.close());
  results.addEventListener('click', event => {
    if (event.target.closest('a') && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
      history.replaceState({ ...history.state, blogSearch: input.value }, '');
    }
  });
  window.addEventListener('pageshow', () => {
    if (typeof history.state?.blogSearch === 'string') {
      input.value = history.state.blogSearch;
      if (!dialog.open) openSearch();
      else showMatches();
    }
  });
  dialog.addEventListener('close', () => {
    if (typeof history.state?.blogSearch === 'string') {
      const { blogSearch, ...rest } = history.state;
      history.replaceState(rest, '');
    }
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
  input.addEventListener('input', showMatches);
})();
