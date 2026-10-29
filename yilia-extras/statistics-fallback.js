/* 统计服务未及时返回时，避免数字位置一直显示空白。 */
setTimeout(function () {
  ['busuanzi_site_pv', 'busuanzi_site_uv', 'busuanzi_page_pv'].forEach(function (id) {
    var element = document.getElementById(id);
    if (element && element.textContent.trim() === '加载中') element.textContent = '暂不可用';
  });
}, 10000);
