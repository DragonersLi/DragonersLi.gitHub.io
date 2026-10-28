(function () {
  'use strict';

  const name = (new URLSearchParams(location.search).get('name') || 'xxx').trim().slice(0, 30) || 'xxx';
  const start = document.querySelector('.start');
  const moon = document.querySelector('.moon');
  const reunion = document.querySelector('#reunion');
  const chooseText = document.querySelector('.choose_txt'); 
  const sparkles = Array.from(document.querySelectorAll('.bgtt li'));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.title = name + '：不同的团圆，相同的思念'; 

  if (!reducedMotion) {
    let frame = 1;
    const frames = [2, 3, 4];
    const reunionTimer = setInterval(function () {
      reunion.firstElementChild.className = 'fadeInOut t' + frame;
      frame = frames.shift();
      if (frame === undefined) clearInterval(reunionTimer);
    }, 1500);

    setInterval(function () {
      sparkles.forEach(function (item) { item.classList.remove('bgttFadeInOut'); });
      sparkles[Math.floor(Math.random() * sparkles.length)].classList.add('bgttFadeInOut');
    }, 2000);
  }

  start.addEventListener('click', function () {
    start.disabled = true;
    moon.classList.add('fadeOut');
    start.classList.remove('zoomIn2', 'time6');
    start.classList.add('zoomOut');

    setTimeout(function () {
      start.hidden = true;
      chooseText.style.display = 'block';
      chooseText.querySelector('.ct1').classList.add('act');
      chooseText.querySelectorAll('.ct2 li').forEach(function (item) { item.classList.add('fadeIn'); });
      greeting.hidden = false;
      greeting.classList.add('fadeIn');
    }, reducedMotion ? 0 : 1000);
  });
})();
