/*
 * File purpose / 文件说明
 * 用途：调整时间轴嵌入框架的高度与交互布局。
 * 加载：themes/yilia/layout/timeline.ejs 引入。
 * 使用：依赖模板中的时间轴 iframe；修改后检查页面滚动与内容完整性。
 */
(function attachTimelineFrame() {
  const frame = document.querySelector('#js-content #timeline-resource-frame');
  if (!frame) return;

  let sizeObserver;
  let connectedDocument;

  function connect() {
    if (sizeObserver) sizeObserver.disconnect();

    let childDocument;
    try {
      childDocument = frame.contentDocument;
    } catch (_) {
      return;
    }
    if (!childDocument) return;
    if (childDocument === connectedDocument) return;

    const content = childDocument.querySelector('.page');
    if (!content) return;
    connectedDocument = childDocument;

    function fitHeight() {
      if (!frame.isConnected) return;
      const height = Math.ceil(content.offsetTop + content.offsetHeight + 24);
      frame.style.height = Math.max(height, 500) + 'px';
    }

    fitHeight();
    if ('ResizeObserver' in window) {
      sizeObserver = new ResizeObserver(fitHeight);
      sizeObserver.observe(content);
    } else {
      childDocument.addEventListener('toggle', fitHeight, true);
      window.addEventListener('resize', fitHeight);
    }

    childDocument.addEventListener('click', function (event) {
      const anchor = event.target.closest && event.target.closest('a[href]');
      if (!anchor || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const destination = new URL(anchor.href, frame.contentWindow.location.href);
      if (destination.origin !== window.location.origin) return;

      const childUrl = frame.contentWindow.location;
      if (destination.pathname === childUrl.pathname && destination.search === childUrl.search && destination.hash) {
        const target = childDocument.getElementById(decodeURIComponent(destination.hash.slice(1)));
        if (!target) return;
        event.preventDefault();
        const scrollHost = document.querySelector('#container');
        if (scrollHost) {
          const top = scrollHost.scrollTop + frame.getBoundingClientRect().top - scrollHost.getBoundingClientRect().top + target.getBoundingClientRect().top - 16;
          scrollHost.scrollTo({ top: top, behavior: 'smooth' });
        } else {
          const top = window.scrollY + frame.getBoundingClientRect().top + target.getBoundingClientRect().top - 16;
          window.scrollTo({ top: top, behavior: 'smooth' });
        }
        return;
      }

      event.preventDefault();
      const siteLink = document.createElement('a');
      siteLink.href = destination.href;
      siteLink.hidden = true;
      document.body.appendChild(siteLink);
      siteLink.click();
      siteLink.remove();
    }, true);
  }

  frame.addEventListener('load', connect);
  if (frame.contentDocument && frame.contentDocument.readyState === 'complete') connect();
})();
