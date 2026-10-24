// 自动 COPY 代码开始
function MM_findObj(n, d) { //v4.0
  var p,i,x;  if(!d) d=document; if((p=n.indexOf("?"))>0&&parent.frames.length) {
    d=parent.frames[n.substring(p+1)].document; n=n.substring(0,p);}
  if(!(x=d[n])&&d.all) x=d.all[n]; for (i=0;!x&&i<d.forms.length;i++) x=d.forms[i][n];
  for(i=0;!x&&d.layers&&i<d.layers.length;i++) x=MM_findObj(n,d.layers[i].document);
  if(!x && document.getElementById) x=document.getElementById(n); return x;
}
function JM_cc(ob){
	var obj=MM_findObj(ob); if (obj) { 
	obj.select();js=obj.createTextRange();js.execCommand("Copy");}
	alert("已经复制成功，你可以在任何地方粘贴出去了！");
}

// 自动 COPY 代码结束
document.write('本页地址是：<input name="page_url" value="'+window.location.href+'" size="40"> <input type="button" name="Button" class="button1" value="点这里复制页面网址到我的剪贴板" onClick=JM_cc("page_url")><p>');





