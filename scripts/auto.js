var spawn = require('child_process').exec;
// Hexo 2.x 用户复制这段
//hexo.on('new', function(path){
//  spawn('start  "markdown编辑器绝对路径.exe" ' + path);
//});
//D:\WorkPlace\MarkdownPad\MarkdownPad2.exe 是MakdownPad编辑器在我本地的路径！
// Hexo 3 用户复制这段
hexo.on('new', function(data){
    spawn('start  "D:\\Program\\Coding\\Microsoft VS Code\\Code.exe" ' + data.path);
});