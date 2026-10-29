/* 独立播放器：校验模型依赖后启动，切换时由父页面销毁整个 iframe。 */
(async function () {
  'use strict';
  var params = new URLSearchParams(location.search);
  var token = params.get('token');
  function report(status) { parent.postMessage({type: 'yilia-live2d', token: token, status: status}, location.origin); }
  var failed = false;
  function fail(error) {
    if (failed) return;
    failed = true;
    console.warn('[live2d]', error);
    report('error');
  }
  window.addEventListener('error', fail);
  window.addEventListener('unhandledrejection', fail);
  try {
    var model = new URL(params.get('model'), location.href);
    if (model.origin !== location.origin) throw new Error('模型必须位于本站');
    var response = await fetch(model.href);
    if (!response.ok) throw new Error('模型配置不可用');
    var data = await response.json();
    var files = [data.model, data.physics, data.pose].concat(data.textures || []);
    Object.keys(data.motions || {}).forEach(function (group) {
      data.motions[group].forEach(function (item) { files.push(item.file); if (item.sound) files.push(item.sound); });
    });
    (data.expressions || []).forEach(function (item) { files.push(item.file); });
    await Promise.all(files.filter(Boolean).map(async function (file) {
      var url = new URL(file, model);
      if (url.origin !== location.origin || !(await fetch(url.href)).ok) throw new Error('模型资源不可用');
    }));
    if (!window.L2Dwidget) throw new Error('播放器不可用');
    var scale = Number(params.get('scale'));
    L2Dwidget.init({model:{jsonPath:model.href,scale:scale > 0 ? scale : 1}, display:{position:'right',width:innerWidth,height:innerHeight,hOffset:0,vOffset:0}, mobile:{show:true,scale:1}, react:{opacityDefault:0.7,opacityOnHover:0.8}, log:false});
    var deadline = Date.now() + 12000;
    while (!document.querySelector('canvas') && !failed && Date.now() < deadline) {
      await new Promise(function (resolve) { setTimeout(resolve, 100); });
    }
    if (!document.querySelector('canvas')) throw new Error('播放器画布未创建');
    if (!failed) report('ready');
  } catch (error) {
    fail(error);
  }
})();
