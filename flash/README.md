# HTML5 互动动画馆

直接打开 `index.html` 或 `flash.html` 即可使用，浏览器不需要 Flash 插件、服务器或网络连接。12 个原始 SWF 被嵌入 `flash.html`，由 Ruffle 的 Canvas/WebAssembly 播放器执行，保留原有鼠标和触摸互动。此实现仍包含原始 SWF 数据，不是纯 JavaScript 重写。

修改动画列表或样式时编辑 `flash.template.html.in`；替换 SWF 后，在此目录运行 `python3 build_h5.py` 重新生成 `flash.html`。生成脚本使用相邻 `../ruffle` 目录中的本地播放器文件，不会联网下载。`flash.html` 内附 Ruffle 的 MIT 许可证文本。
