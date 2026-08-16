
//新建文章后自动打开编辑器
var spawn = require('child_process').exec;
// Hexo 2.x 用户复制这段
//hexo.on('new', function(path){
//  spawn('start  "markdown编辑器绝对路径.exe" ' + path);
//});
// Hexo 3 用户复制这段
hexo.on('new', function(data){
  spawn('start  "D:\WorkPlace\MarkdownPad\MarkdownPad2.exe" ' + data.path);
});

//为每篇文章增加永久链接！
// Add a tail to every post from tail.md
// Great for adding copyright info
/*
var fs = require('fs');
hexo.extend.filter.register('before_post_render', function(data){
    if(data.copyright == false) return data;
    var file_content = fs.readFileSync('tail.md');
    if(file_content && data.content.length > 50) 
    {
        data.content += file_content;
        var permalink = '\n本文永久链接：' + data.permalink;
        data.content += permalink;
    }
    return data;
});
*/

var fs = require('fs');

hexo.extend.filter.register('before_post_render', function(data){
	// 只处理 source/_posts 下的 Markdown 文章。
	// Hexo 也会让部分可渲染静态资源经过该过滤器；如果不限制范围，
	// 下面的 Markdown 分隔符会被追加到 JavaScript，导致浏览器执行报错。
	if (!data.source || !data.source.replace(/\\/g, '/').startsWith('_posts/')) {
		return data;
	}

	if(data.copyright == false) return data;
	
	// Add seperate line
	data.content += '\n___\n';
	
	// Try to read tail.md
	try {
		var file_content = fs.readFileSync('tail.md');
		if(file_content && data.content.length > 50) 
		{
			data.content += file_content;
		}
	} catch (err) {
		if (err.code !== 'ENOENT') throw err;
		
		// No process for ENOENT error
	}

  	// 添加具体文章链接, 不需要去掉即可
	var permalink = '';//'\n本文永久链接：' + data.permalink;
	data.content += permalink;
  
	return data;
});
