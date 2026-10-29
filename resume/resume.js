/* 动态简历：编辑同目录 resume.md 即可更新正文；动画和样式在此文件维护。 */
(function () {
  'use strict';

  var codeOutput = document.getElementById('codeOutput');
  var resumeOutput = document.getElementById('resumeOutput');
  var animatedStyle = document.getElementById('animatedStyle');
  var skipButton = document.getElementById('skipButton');
  var replayButton = document.getElementById('replayButton');
  var styleCode = [
    '/* 你好，欢迎查看我的动态简历。 */\n',
    '/* 先让页面拥有柔和的过渡。 */\n',
    '.resume-page * { transition: color .2s, background-color .2s, border-color .2s; }\n\n',
    '/* 给简历加一点层次。 */\n',
    '.editor-resume { box-shadow: 0 18px 42px rgba(0, 0, 0, .22); }\n',
    '.resume-output h1 { color: #116d73; }\n',
    '.resume-output h2 { color: #176f75; }\n\n',
    '/* 接下来，写下我的经历。 */\n'
  ].join('');
  var markdown = '';
  var timer = null;
  var generation = 0;

  function escapeHtml(value) {
    return value.replace(/[&<>"']/g, function (character) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
    });
  }

  function inline(text) {
    return escapeHtml(text)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  }

  function renderMarkdown(source) {
    var lines = source.replace(/\r\n?/g, '\n').split('\n');
    var html = '';
    var inList = false;
    lines.forEach(function (line) {
      var match;
      if ((match = /^!\[([^\]]*)\]\((\/assets\/[^\s)]+)\)$/.exec(line))) {
        if (inList) { html += '</ul>'; inList = false; }
        html += '<img class="resume-portrait" src="' + escapeHtml(match[2]) + '" alt="' + escapeHtml(match[1]) + '">';
      } else if ((match = /^(#{1,3})\s+(.+)$/.exec(line))) {
        if (inList) { html += '</ul>'; inList = false; }
        var level = match[1].length;
        html += '<h' + level + '>' + inline(match[2]) + '</h' + level + '>';
      } else if ((match = /^[-*]\s+(.+)$/.exec(line))) {
        if (!inList) { html += '<ul>'; inList = true; }
        html += '<li>' + inline(match[1]) + '</li>';
      } else if (line.trim()) {
        if (inList) { html += '</ul>'; inList = false; }
        html += '<p>' + inline(line) + '</p>';
      } else if (inList) {
        html += '</ul>';
        inList = false;
      }
    });
    if (inList) { html += '</ul>'; }
    return html;
  }

  function stop() {
    generation += 1;
    if (timer) { clearTimeout(timer); timer = null; }
  }

  function showComplete() {
    stop();
    codeOutput.textContent = styleCode;
    animatedStyle.textContent = styleCode;
    resumeOutput.innerHTML = renderMarkdown(markdown);
    codeOutput.parentNode.scrollTop = 0;
    resumeOutput.parentNode.scrollTop = 0;
  }

  function play() {
    stop();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      showComplete();
      return;
    }
    var current = generation;
    var codeLength = 0;
    var markdownLength = 0;
    codeOutput.textContent = '';
    animatedStyle.textContent = '';
    resumeOutput.innerHTML = '';
    function next() {
      if (current !== generation) { return; }
      if (codeLength < styleCode.length) {
        codeLength = Math.min(styleCode.length, codeLength + 2);
        codeOutput.textContent = styleCode.slice(0, codeLength);
        animatedStyle.textContent = styleCode.slice(0, codeLength);
        codeOutput.parentNode.scrollTop = codeOutput.parentNode.scrollHeight;
        timer = setTimeout(next, 15);
      } else if (markdownLength < markdown.length) {
        markdownLength = Math.min(markdown.length, markdownLength + 12);
        resumeOutput.innerHTML = renderMarkdown(markdown.slice(0, markdownLength));
        resumeOutput.parentNode.scrollTop = resumeOutput.parentNode.scrollHeight;
        timer = setTimeout(next, 15);
      } else {
        codeOutput.parentNode.scrollTop = 0;
        resumeOutput.parentNode.scrollTop = 0;
      }
    }
    next();
  }

  skipButton.addEventListener('click', showComplete);
  replayButton.addEventListener('click', play);
  fetch('./resume.md').then(function (response) {
    if (!response.ok) { throw new Error('简历内容读取失败'); }
    return response.text();
  }).then(function (content) {
    markdown = content;
    play();
  }).catch(function () {
    resumeOutput.innerHTML = '<p class="load-error">简历内容未能加载，请检查 resume.md 文件。</p>';
  });
}());
