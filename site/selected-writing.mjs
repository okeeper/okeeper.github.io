// Permanent article paths keep this selection stable when a title or filename changes.
const selections = [
  '/hou-duan-jia-gou/ru-he-hua-hao-ruan-jian-jia-gou-tu/',
  '/ruan-jian-bi-ji/qin-ce-you-xiao-qian-duan-xiao-bai-de-wo-0.5-tian-nei-yong-cursor-kai-fa-chu-wei-xin-xiao-cheng-xu/',
  '/hou-duan-jia-gou/flink-ji-zhu-yuan-li/',
];

export function selectedWriting(posts) {
  return selections.map(url => posts.find(post => post.url === url && post.markdownUrl)).filter(Boolean);
}
