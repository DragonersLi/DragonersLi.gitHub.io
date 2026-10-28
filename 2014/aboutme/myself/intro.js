var $ = function(selector, context) {
	context = context || document;
	return context.querySelector(selector);
}, $$ = function(selector, context) {
	context = context || document;
	return [].slice.call(context.querySelectorAll(selector));
};

HTMLElement.prototype.bind = function(type, fn, capture) {
	this.addEventListener(type, fn, capture || false);
	return this;
};
HTMLElement.prototype.active = function(e) {
	this.classList.add("active");
	return this;
};
HTMLElement.prototype.inactive = function(type, fn, capture) {
	this.classList.remove("active");
	return this;
};


var indexScreen = 0, flagPlayScreen = false;
// 场景的前进与后退
var funPlayScreen = (function() {
	// 私有方法，改变URL
	var _href = function() {
		location.href = location.href.split("#")[0] + "#screen" + indexScreen;	
	};
	return {
		prev: function() {
			if (indexScreen > 0) {
				indexScreen--;
				_href();
			}		
		},
		next: function() {
			if ($("#screen" + (indexScreen + 1))) {
				// 如果一下个场景存在
				indexScreen++;
				_href();
			}
		}
	}
})();

var anchorScreen = function() {
	// 进度场景隐藏
	screenActive && screenActive.inactive();	
	// 根据URL 锚点确定当前的场景
	var href = location.href, anchor = href.split("#")[1];
	// 锚点对应场景元素
	var screenWillActive = null;
	if (anchor != "screen0" && /^screen\d+$/.test(anchor) && (screenWillActive = $("#" + anchor))) {
		// 如果锚点有对应的场景元素
		// 但不包括0场景
		// 该场景激活
		// 开放事件执行
		screenActive = screenWillActive.active();
		indexScreen = anchor.replace("screen", "") * 1 || 0;
		flagPlayScreen = true;	
	} else {
		// 否则，我们认定为第1场景
		// 同时显示播放控件
		// 并设置标识为false, 以便阻断点击以及键盘播放行为
		screenActive = $("#screen1").active();
		indexScreen = 1;
		$("#control").active();
		flagPlayScreen = false;
	}
	var callback = screenActive.getAttribute("data-call");
	if (callback) {
		callback.split("|").forEach(function(name_callback) {
			if (typeof window[name_callback] == "function") window[name_callback].call(screenActive);
		});
			
	}
};
window.addEventListener("load", function() {
	// 进度条结束
	$("#screenLoad").classList.add("finish");
	// 延时片刻，进入动画播放流程
	setTimeout(anchorScreen, 20);
});
// URL地址行为
window.addEventListener("popstate", function() {
	anchorScreen();           
});

// 页面方向快捷键操作
document.addEventListener("keydown", function(event) {
	if (flagPlayScreen == false) return;
	switch (event.keyCode) {
		case 38: case 37: {
			// 向上以及向左
			funPlayScreen.prev();
			event.preventDefault();
			break;
		}
		case 39: case 40: {
			// 向右以及向下
			funPlayScreen.next();
			event.preventDefault();
			break;
		}
	}
});
// 点击页面
document.addEventListener("click", function(event) {
	flagPlayScreen && funPlayScreen.next();	
});

// 如果是href=#screen\d+的a标签，阻止冒泡
$$("a").forEach(function(target) {
	/screen\d+/.test(target.href) && target.bind("click", function(event) {
		event.stopPropagation();
	});
});
	

// 点击播放控件
$("#control").bind("click", function(event) {
	this.inactive();
	flagPlayScreen = true;
	event.stopPropagation();
});

// 绘制山羊
var drawSheep = {
	index: 0,
	ele: {
		prev: $("#drawPrev"),
		next: $("#drawNext"),
		img: $("#drawImg"),
		descr: $("#drawDescr"),
		num: $("#drawStepNum")
	},
	change: function() {
		this.ele.descr.innerHTML = this.data[this.index];
		this.ele.num.innerHTML = this.index + 1;
		this.ele.img.style.top = -1 * this.index * 313 + "px";
	},
	bind: function() {
		var self = this, length = self.data.length;
		this.ele.prev.bind("click", function(event) {			
			if (self.index > 0) {
				self.index--;
				if (self.index == 0) {
					this.disabled = "disabled";
				}
				self.change();
				self.ele.next.removeAttribute("disabled");
			}
			event.stopPropagation();
		});
		this.ele.next.bind("click", function(event) {			
			if (self.index < length - 1) {
				self.index++;
				if (self.index == length - 1) {
					this.disabled = "disabled";
				}
				self.change();
				self.ele.prev.removeAttribute("disabled");
			}
			event.stopPropagation();
		});
	},
	init: function() {
		this.data = window.dataDrawStep;
		if (this.data) this.bind();
	}

};

drawSheep.init();

// 拖动时间轴
var flagTimelineMove = false, dataTimelineMove = {};
$$(".J_timeline").forEach(function(timeline) {
	timeline.bind("mousedown", function(event) {
		dataTimelineMove.pageX = event.pageX;
		dataTimelineMove.left = parseInt(this.style.left) || 0;
		flagTimelineMove = true;
		event.preventDefault();
	});	
	timeline.bind("mousemove", function(event) {
		if (flagTimelineMove == false) return;
		var nowX = event.pageX, left = 0;
		left = dataTimelineMove.left - (dataTimelineMove.pageX - nowX)
		if (left > 0) {
			left = 0;	
		} else if (left < 960 - this.clientWidth) {
			left = 960 - this.clientWidth;
		}
		this.style.left = left + "px";
		event.preventDefault();
	});
	timeline.bind("click", function(event) {
		event.stopPropagation();	
	});
});
document.addEventListener("mouseup", function() {
	flagTimelineMove = false;	
});

// 回调方法

// 最终屏，结束播放触发
// 否则会播放下面的
var fnScreenDisPlay = function() {
	flagPlayScreen = false;
}, fnImageLazyload = function() {
	$$("img", this).forEach(function(image) {
		if (!image.src) {
			image.src = image.getAttribute("data-src");	
		}
	});	
};
// 音效播放
var fnAudioPlay = function() {
	$$("audio", this).forEach(function(audio) {
		var delay = audio.getAttribute("data-delay");
		//alert(delay);return;
		delay? setTimeout(function() { audio.play(); }, delay): audio.play();
	});	
};