/*
 * File purpose / 文件说明
 * 用途：监听指针操作并绘制全站鼠标星光效果。
 * 加载：themes/yilia/layout/_partial/after-footer.ejs 以 defer 引入。
 * 依赖：static/css/mouse-stars.css 定义效果层样式；改动后检查点击穿透和移动端行为。
 */
(function (window, document) {
  'use strict';

  if (window.__mouseStarsInstalled || !document.body) return;
  window.__mouseStarsInstalled = true;

  var finePointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)');
  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  var layer = document.createElement('div');
  var stars = [];
  var points = [];
  var target = { x: 0, y: 0 };
  var frame = 0;
  var lastMove = 0;
  var hasPosition = false;
  var i;

  layer.id = 'mouse-stars';
  layer.setAttribute('aria-hidden', 'true');
  for (i = 0; i < 4; i += 1) {
    var star = document.createElement('span');
    star.className = 'mouse-star';
    star.textContent = '*';
    layer.appendChild(star);
    stars.push(star);
    points.push({ x: 0, y: 0 });
  }
  document.body.appendChild(layer);

  function hide() {
    layer.classList.remove('is-active');
    if (frame) window.cancelAnimationFrame(frame);
    frame = 0;
    hasPosition = false;
  }

  function render(now) {
    frame = 0;
    if (now - lastMove > 420) {
      hide();
      return;
    }

    points[0].x = target.x;
    points[0].y = target.y;
    for (var index = 1; index < points.length; index += 1) {
      points[index].x += (points[index - 1].x - points[index].x) * 0.22;
      points[index].y += (points[index - 1].y - points[index].y) * 0.22;
    }
    for (var j = 0; j < stars.length; j += 1) {
      stars[j].style.transform = 'translate3d(' + points[j].x + 'px,' + points[j].y + 'px,0)';
    }
    frame = window.requestAnimationFrame(render);
  }

  function onMouseMove(event) {
    if ((finePointer && !finePointer.matches) || (reducedMotion && reducedMotion.matches)) {
      hide();
      return;
    }

    target.x = event.clientX + 5;
    target.y = event.clientY + 15;
    if (!hasPosition) {
      for (var index = 0; index < points.length; index += 1) {
        points[index].x = target.x;
        points[index].y = target.y;
      }
      hasPosition = true;
    }
    lastMove = window.performance.now();
    layer.classList.add('is-active');
    if (!frame) frame = window.requestAnimationFrame(render);
  }

  window.addEventListener('mousemove', onMouseMove, { passive: true });
  document.addEventListener('mouseleave', hide);
  window.addEventListener('blur', hide);
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) hide();
  });
  if (reducedMotion) {
    if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', hide);
    else if (reducedMotion.addListener) reducedMotion.addListener(hide);
  }
}(window, document));
