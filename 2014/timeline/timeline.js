// /job/ is the single source of resume data. Keep this standalone timeline in sync with it.
(async function loadResumeTimeline() {
  const status = document.getElementById('load-state');

  function find(source, selector) {
    const element = source.querySelector(selector);
    if (!element) throw new Error('简历缺少内容：' + selector);
    return element;
  }

  function fillTimeline(source, sourceSelector, targetId, countId) {
    const sourceItems = Array.from(source.querySelectorAll(sourceSelector));
    if (!sourceItems.length) throw new Error('简历时间轴内容为空：' + sourceSelector);

    const target = document.getElementById(targetId);
    sourceItems.forEach((item, index) => {
      const details = document.createElement('details');
      details.className = 'timeline-item';
      details.open = index === 0;

      const summary = document.createElement('summary');
      summary.className = 'timeline-item__summary';

      const date = document.createElement('span');
      date.className = 'timeline-item__date';
      date.textContent = find(item, '.resume-card__date').textContent.trim();

      const heading = document.createElement('span');
      heading.className = 'timeline-item__heading';

      const title = document.createElement('strong');
      title.className = 'timeline-item__title';
      title.textContent = find(item, '.resume-card__title').textContent.trim();

      const role = document.createElement('span');
      role.className = 'timeline-item__role';
      role.textContent = find(item, '.resume-card__role').textContent.trim();

      const toggle = document.createElement('span');
      toggle.className = 'timeline-item__toggle';
      toggle.setAttribute('aria-hidden', 'true');

      heading.append(title, role);
      summary.append(date, heading, toggle);

      const body = find(item, '.resume-card__body').cloneNode(true);
      body.className = 'timeline-item__body';
      details.append(summary, body);
      target.appendChild(details);
    });

    document.getElementById(countId).textContent = sourceItems.length;
  }

  try {
    const response = await fetch('/job/', { credentials: 'same-origin' });
    if (!response.ok) throw new Error('HTTP ' + response.status);

    const resume = new DOMParser().parseFromString(await response.text(), 'text/html');
    const source = find(resume, '.resume-page');
    const name = find(source, '.resume-hero h1').textContent.trim();
    const role = find(source, '.resume-hero__role').textContent.trim();
    document.title = '职业时间轴 · ' + name;
    document.getElementById('hero-intro').textContent = name + ' · ' + role;

    const meta = document.getElementById('hero-meta');
    find(source, '.resume-meta').querySelectorAll('.resume-meta__row').forEach((row) => {
      meta.appendChild(row.cloneNode(true));
    });

    const sourcePortrait = source.querySelector('.resume-hero__portrait');
    if (sourcePortrait) {
      const portraitSlot = document.getElementById('hero-portrait-slot');
      const portraitButton = document.createElement('button');
      portraitButton.className = 'hero__portrait-button';
      portraitButton.type = 'button';
      portraitButton.setAttribute('aria-label', '点击查看头像大图');
      const portrait = document.createElement('img');
      portrait.className = 'hero__portrait';
      portrait.src = sourcePortrait.getAttribute('src');
      portrait.alt = sourcePortrait.getAttribute('alt') || name + '的头像';
      const caption = document.createElement('span');
      caption.className = 'hero__portrait-caption';
      caption.textContent = '点击查看大图';
      portraitButton.append(portrait, caption);
      portraitSlot.appendChild(portraitButton);

      const preview = document.getElementById('portrait-preview');
      preview.querySelector('img').src = portrait.src;
      portraitButton.addEventListener('click', () => {
        // 嵌入站内时使用父页面的图库，避免弹窗居中到整张长 iframe 的中间。
        if (window.parent !== window && window.parent.PhotoSwipe && window.parent.PhotoSwipeUI_Default) {
          const gallery = new window.parent.PhotoSwipe(
            window.parent.document.querySelector('.pswp'),
            window.parent.PhotoSwipeUI_Default,
            [{
              src: portrait.src,
              w: Number(sourcePortrait.dataset.width) || 1080,
              h: Number(sourcePortrait.dataset.height) || 1920,
              title: portrait.alt
            }],
            { index: 0 }
          );
          gallery.init();
          return;
        }
        preview.showModal();
      });
      preview.querySelector('.portrait-preview__close').addEventListener('click', () => preview.close());
      preview.addEventListener('click', (event) => {
        if (event.target === preview) preview.close();
      });
    }

    const advantages = find(source, '.resume-advantages');
    document.getElementById('advantages-list').append(...Array.from(advantages.children, (item) => item.cloneNode(true)));

    fillTimeline(source, '.resume-timeline__item--work', 'work-list', 'work-count');
    fillTimeline(source, '.resume-timeline__item--project', 'project-list', 'project-count');

    document.querySelectorAll('.section').forEach((section) => { section.hidden = false; });
    status.hidden = true;
    if (location.hash) {
      const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (target) target.scrollIntoView();
    }
  } catch (error) {
    console.error('时间轴加载失败', error);
    status.innerHTML = '简历内容暂时无法读取。请直接查看 <a href="/job/">完整简历</a>。';
  }
})();
