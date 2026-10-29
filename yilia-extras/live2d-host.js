/* 配置驱动的本地看板娘；每次切换替换 iframe，释放旧播放器。 */
(function () {
  'use strict';
  if (window.yiliaLive2DController) return;
  var options = window.yiliaLive2DOptions || {};
  var models = options.models || {};
  var rotation = options.rotation || {};
  var selected = models[options.selected] ? options.selected : 'hibiki';
  var sequence = Array.isArray(rotation.models) ? rotation.models.filter(function (name) { return !!models[name]; }) : [];
  if (sequence.indexOf(selected) < 0) sequence.unshift(selected);
  var randomMode = rotation.enable && rotation.mode === 'random' && sequence.length > 1;
  if (randomMode) selected = sequence[Math.floor(Math.random() * sequence.length)];
  var current = selected, frame, timer, timeout, serial = 0;
  var rotationIndex = sequence.indexOf(selected);
  var mobile = window.matchMedia('(max-width: 767px)');
  function number(value, fallback) { value = Number(value); return Number.isFinite(value) ? value : fallback; }
  function show(name, keepRotationIndex) {
    if (mobile.matches || !models[name]) return;
    if (!keepRotationIndex && sequence.indexOf(name) >= 0) rotationIndex = sequence.indexOf(name);
    var model = models[name];
    var next = document.createElement('iframe');
    var token = String(++serial);
    current = name;
    next.title = '动态看板娘';
    next.className = 'yilia-live2d-frame';
    next.dataset.model = name;
    next.dataset.token = token;
    next.style.cssText = 'position:fixed;z-index:50;border:0;background:transparent;right:' + number(options.hOffset, 105) + 'px;bottom:' + number(model.vOffset, number(options.vOffset, 0)) + 'px;width:' + Math.max(1, number(model.width, 145)) + 'px;height:' + Math.max(1, number(model.height, 315)) + 'px';
    var url = new URL(options.frameUrl, location.href);
    url.searchParams.set('model', model.path);
    url.searchParams.set('scale', Math.max(0.1, number(model.scale, number(options.scale, 1))));
    url.searchParams.set('token', token);
    next.src = url.href;
    if (frame) frame.remove();
    frame = next;
    document.body.appendChild(next);
    clearTimeout(timeout);
    timeout = setTimeout(function () { fallback(token); }, 20000);
  }
  function fallback(token) {
    if (!frame || frame.dataset.token !== token) return;
    clearTimeout(timeout);
    if (current !== 'hibiki' && models.hibiki) show('hibiki', true);
    else { frame.remove(); frame = null; }
  }
  window.addEventListener('message', function (event) {
    if (event.origin !== location.origin || !frame || event.source !== frame.contentWindow || !event.data || event.data.type !== 'yilia-live2d' || event.data.token !== frame.dataset.token) return;
    if (event.data.status === 'ready') clearTimeout(timeout);
    if (event.data.status === 'error') fallback(event.data.token);
  });
  function start() {
    clearInterval(timer);
    clearTimeout(timeout);
    if (frame) { frame.remove(); frame = null; }
    if (mobile.matches) return;
    show(current, true);
    if (rotation.enable && sequence.length > 1) timer = setInterval(function () {
      if (randomMode) {
        var candidates = sequence.filter(function (name) { return name !== current; });
        rotationIndex = sequence.indexOf(candidates[Math.floor(Math.random() * candidates.length)]);
      } else {
        rotationIndex = (rotationIndex + 1) % sequence.length;
      }
      show(sequence[rotationIndex], true);
    }, Math.max(1, number(rotation.interval_seconds, 60)) * 1000);
  }
  if (mobile.addEventListener) mobile.addEventListener('change', start);
  else mobile.addListener(start);
  window.yiliaLive2DController = {show: show};
  start();
})();
