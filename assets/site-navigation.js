(function (window, document) {
    'use strict';

    if (!window || !document || !window.fetch || !window.history || !window.DOMParser || window.__yiliaNavigationInstalled) {
        return;
    }

    var initialContent = document.querySelector('#js-content');
    if (!initialContent || !initialContent.closest || !initialContent.closest('.mid-col')) {
        return;
    }

    var config = window.yiliaConfig || {};
    var rootPath = new window.URL(config.root || '/', window.location.href).pathname;
    var requestId = 0;
    var historyMarker = 'siteNavigation';
    var booleanConfigKeys = ['mathjax', 'isHome', 'isPost', 'isArchive', 'isTag', 'isCategory', 'open_in_new', 'toc_hide_index', 'innerArchive', 'showTags'];
    var explicitTargetedLinks = [];
    var targetedLinks = document.querySelectorAll('a[target]');
    var targetIndex;

    for (targetIndex = 0; targetIndex < targetedLinks.length; targetIndex += 1) {
        explicitTargetedLinks.push(targetedLinks[targetIndex]);
    }

    if (rootPath.charAt(rootPath.length - 1) !== '/') {
        rootPath += '/';
    }

    function normalizeConfigBooleans() {
        var i;
        for (i = 0; i < booleanConfigKeys.length; i += 1) {
            var key = booleanConfigKeys[i];
            if (config[key] === 'true') {
                config[key] = true;
            } else if (config[key] === 'false') {
                config[key] = false;
            }
        }
    }

    normalizeConfigBooleans();

    window.__yiliaNavigationInstalled = true;

    function pageScrollY() {
        return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    }

    function stateWithScroll(state, scrollY) {
        var result = {};
        var key;
        if (state && typeof state === 'object') {
            for (key in state) {
                if (Object.prototype.hasOwnProperty.call(state, key)) {
                    result[key] = state[key];
                }
            }
        }
        result[historyMarker] = true;
        result.scrollY = scrollY;
        return result;
    }

    function saveCurrentScroll() {
        window.history.replaceState(stateWithScroll(window.history.state, pageScrollY()), '', window.location.href);
    }

    if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
    }
    if (!window.history.state || !window.history.state[historyMarker]) {
        window.history.replaceState(stateWithScroll(window.history.state, pageScrollY()), '', window.location.href);
    }

    function findAnchor(node) {
        while (node && node !== document) {
            if (node.nodeType === 1 && String(node.tagName).toLowerCase() === 'a' && node.getAttribute('href') !== null) {
                return node;
            }
            node = node.parentNode;
        }
        return null;
    }

    function isInSite(url) {
        return url.origin === window.location.origin &&
            (url.pathname === rootPath.slice(0, -1) || url.pathname.indexOf(rootPath) === 0);
    }

    function isHtmlPath(url) {
        var extension = /\/[^/]+\.([a-z0-9]{1,8})$/i.exec(url.pathname);
        return !extension || /^(html?|xhtml)$/i.test(extension[1]);
    }

    function rememberExplicitTargets(scope) {
        var links = scope.querySelectorAll('a[target]');
        var i;
        for (i = 0; i < links.length; i += 1) {
            if (explicitTargetedLinks.indexOf(links[i]) === -1) {
                explicitTargetedLinks.push(links[i]);
            }
        }
    }

    function hadExplicitTarget(anchor) {
        return explicitTargetedLinks.indexOf(anchor) !== -1;
    }

    function normalizeThemeTarget(anchor, url) {
        if (anchor.getAttribute('target') && anchor.getAttribute('target').toLowerCase() === '_blank' &&
            !hadExplicitTarget(anchor) && anchor.closest('.article-entry') && isInSite(url) && isHtmlPath(url)) {
            anchor.removeAttribute('target');
        }
    }

    function normalizeInitialThemeTargets() {
        var links = document.querySelectorAll('.article-entry a[target="_blank"]');
        var i;
        for (i = 0; i < links.length; i += 1) {
            try {
                normalizeThemeTarget(links[i], new window.URL(links[i].href, window.location.href));
            } catch (error) {
                // Ignore malformed links and leave their original target untouched.
            }
        }
    }

    // Yilia's open_in_new fix adds _blank to every article-entry link at window load.
    // Remove only that generated target for same-site links; explicit targets stay native.
    window.addEventListener('load', normalizeInitialThemeTargets, false);

    function shouldIntercept(event, anchor) {
        if (!anchor || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
            return false;
        }
        if (anchor.hasAttribute('download')) {
            return false;
        }
        if (anchor.getAttribute('rel') && /(^|\s)external(\s|$)/i.test(anchor.getAttribute('rel'))) {
            return false;
        }

        var url;
        try {
            url = new window.URL(anchor.href, window.location.href);
        } catch (error) {
            return false;
        }
        if ((url.protocol !== 'http:' && url.protocol !== 'https:') || !isInSite(url) || !isHtmlPath(url)) {
            return false;
        }
        normalizeThemeTarget(anchor, url);
        if (anchor.getAttribute('target') && anchor.getAttribute('target').toLowerCase() !== '_self') {
            return false;
        }

        var currentUrl = new window.URL(window.location.href);
        var sameDocument = url.pathname === currentUrl.pathname && url.search === currentUrl.search;
        if (url.hash && sameDocument) {
            return false;
        }
        return url.href !== currentUrl.href;
    }

    function extractPageConfig(parsedDocument) {
        var scripts = parsedDocument.getElementsByTagName('script');
        var keys = ['mathjax', 'isHome', 'isPost', 'isArchive', 'isTag', 'isCategory', 'open_in_new', 'toc_hide_index', 'innerArchive', 'showTags', 'root'];
        var i;
        var j;
        for (i = 0; i < scripts.length; i += 1) {
            var source = scripts[i].textContent || '';
            if (source.indexOf('yiliaConfig') === -1) {
                continue;
            }
            for (j = 0; j < keys.length; j += 1) {
                var keyMatch = new RegExp('\\b' + keys[j] + '\\s*:\\s*').exec(source);
                if (keyMatch) {
                    var rawValue = source.substring(keyMatch.index + keyMatch[0].length).trim();
                    var quote = rawValue.charAt(0);
                    if (quote === '"' || quote === "'") {
                        var endQuote = rawValue.indexOf(quote, 1);
                        if (endQuote > 0) {
                            config[keys[j]] = rawValue.substring(1, endQuote);
                        }
                    } else {
                        var bareValue = rawValue.split(/[},\s]/)[0];
                        if (bareValue) {
                            config[keys[j]] = bareValue;
                        }
                    }
                }
            }
            normalizeConfigBooleans();
            return;
        }
    }

    function isJavascriptType(type) {
        type = (type || '').toLowerCase().replace(/\s*;.*$/, '').trim();
        return !type || type === 'module' || type === 'text/javascript' || type === 'application/javascript' || type === 'text/ecmascript' || type === 'application/ecmascript';
    }

    function executeContentScripts(content, id) {
        var nodes = content.querySelectorAll('script');
        var scripts = [];
        var i;
        for (i = 0; i < nodes.length; i += 1) {
            scripts.push(nodes[i]);
        }

        var chain = window.Promise.resolve();
        scripts.forEach(function (node) {
            chain = chain.then(function () {
                if (id !== requestId || !node.parentNode || !isJavascriptType(node.getAttribute('type'))) {
                    return;
                }
                if (node.hasAttribute('nomodule') && 'noModule' in document.createElement('script')) {
                    node.parentNode.removeChild(node);
                    return;
                }

                var script = document.createElement('script');
                var attributes = node.attributes;
                var index;
                for (index = 0; index < attributes.length; index += 1) {
                    script.setAttribute(attributes[index].name, attributes[index].value);
                }
                script.async = false;

                if (node.hasAttribute('src') || script.type.toLowerCase() === 'module') {
                    return new window.Promise(function (resolve, reject) {
                        script.onload = resolve;
                        script.onerror = function () {
                            reject(new Error('Failed to execute page script: ' + (script.src || 'inline module')));
                        };
                        if (!node.hasAttribute('src')) {
                            script.text = node.textContent || '';
                        }
                        node.parentNode.replaceChild(script, node);
                    });
                }

                script.text = node.textContent || '';
                node.parentNode.replaceChild(script, node);
            }).catch(function (error) {
                if (id === requestId && window.console && window.console.warn) {
                    window.console.warn('[site-navigation] A page script failed; keeping the current player session.', error);
                }
            });
        });
        return chain;
    }

    function enabled(value) {
        return value === true || value === 'true';
    }

    function initFixes(content) {
        var pageNav = content.querySelector('#page-nav');
        if (pageNav && !pageNav.querySelector('.extend.prev')) {
            pageNav.insertAdjacentHTML('afterbegin', '<a class="extend prev disabled" rel="prev">上一页</a>');
        }
        if (pageNav && !pageNav.querySelector('.extend.next')) {
            pageNav.insertAdjacentHTML('beforeend', '<a class="extend next disabled" rel="next">下一页</a>');
        }

        if (enabled(config.open_in_new)) {
            var links = content.querySelectorAll('.article-entry a:not(.article-more-a)');
            var i;
            for (i = 0; i < links.length; i += 1) {
                if (!links[i].getAttribute('target')) {
                    try {
                        var linkUrl = new window.URL(links[i].href, window.location.href);
                        if ((!isInSite(linkUrl) || !isHtmlPath(linkUrl)) && (linkUrl.protocol === 'http:' || linkUrl.protocol === 'https:')) {
                            links[i].setAttribute('target', '_blank');
                        }
                    } catch (error) {
                        // Leave malformed or non-web links unchanged.
                    }
                }
            }
        }
        if (enabled(config.toc_hide_index)) {
            var numbers = content.querySelectorAll('.toc-number');
            var j;
            for (j = 0; j < numbers.length; j += 1) {
                numbers[j].style.display = 'none';
            }
        }

        var about = content.querySelector('#js-aboutme');
        if (about) {
            about.innerHTML = about.innerText || about.textContent;
        }
    }

    function initViewer(content) {
        if (!window.PhotoSwipe || !window.PhotoSwipeUI_Default) {
            return;
        }
        var viewer = document.querySelector('.pswp');
        var images = content.querySelectorAll('.article-entry img:not(.reward-img)');
        var i;
        for (i = 0; i < images.length; i += 1) {
            (function (imageIndex) {
                images[imageIndex].onclick = function () {
                    if (document.querySelector('.left-col.show')) {
                        return;
                    }
                    var items = [];
                    var j;
                    for (j = 0; j < images.length; j += 1) {
                        var image = new window.Image();
                        var element = images[j];
                        var src = element.getAttribute('data-target') || element.getAttribute('src');
                        image.src = src;
                        items.push({
                            src: src,
                            w: image.width || element.width,
                            h: image.height || element.height,
                            title: element.getAttribute('alt')
                        });
                    }
                    var gallery = new window.PhotoSwipe(viewer, window.PhotoSwipeUI_Default, items, { index: imageIndex });
                    gallery.init();
                };
            }(i));
        }
    }

    function shareUrl(template, options) {
        return template.replace(/<%-sUrl%>/g, encodeURIComponent(options.sUrl))
            .replace(/<%-sTitle%>/g, options.sTitle)
            .replace(/<%-sDesc%>/g, options.sDesc)
            .replace(/<%-sPic%>/g, encodeURIComponent(options.sPic));
    }

    function initShare(content) {
        var shareLinks = content.querySelectorAll('.share-sns');
        var image = content.querySelector('.article-entry img');
        var picture = image ? image.getAttribute('src') : '';
        if (picture && !/^(http:|https:)?\/\//.test(picture)) {
            picture = window.location.origin + picture;
        }

        var templates = {
            weibo: 'http://service.weibo.com/share/share.php?url=<%-sUrl%>&title=<%-sTitle%>&pic=<%-sPic%>',
            qq: 'http://connect.qq.com/widget/shareqq/index.html?url=<%-sUrl%>&title=<%-sTitle%>&source=<%-sDesc%>',
            douban: 'https://www.douban.com/share/service?image=<%-sPic%>&href=<%-sUrl%>&name=<%-sTitle%>&text=<%-sDesc%>',
            qzone: 'http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=<%-sUrl%>&title=<%-sTitle%>&pics=<%-sPic%>&summary=<%-sDesc%>',
            facebook: 'https://www.facebook.com/sharer/sharer.php?u=<%-sUrl%>',
            twitter: 'https://twitter.com/intent/tweet?text=<%-sTitle%>&url=<%-sUrl%>',
            google: 'https://plus.google.com/share?url=<%-sUrl%>'
        };
        var i;
        for (i = 0; i < shareLinks.length; i += 1) {
            shareLinks[i].onclick = function () {
                var type = this.getAttribute('data-type');
                if (type === 'weixin') {
                    var box = content.querySelector('.js-wx-box');
                    var mask = content.querySelector('.mask');
                    if (box) {
                        box.classList.add('in');
                        box.classList.add('ready');
                    }
                    if (mask) {
                        mask.classList.add('in');
                    }
                    return;
                }
                if (templates[type]) {
                    window.open(shareUrl(templates[type], {
                        sUrl: window.location.href,
                        sPic: picture,
                        sTitle: document.title,
                        sDesc: document.title
                    }));
                }
            };
        }

        function hideWx() {
            var box = content.querySelector('.js-wx-box');
            var mask = content.querySelector('.mask');
            if (box) {
                box.classList.remove('in');
                box.classList.remove('ready');
            }
            if (mask) {
                mask.classList.remove('in');
            }
        }
        var maskElement = content.querySelector('.mask');
        var closeElement = content.querySelector('.js-modal-close');
        if (maskElement) {
            maskElement.onclick = hideWx;
        }
        if (closeElement) {
            closeElement.onclick = hideWx;
        }
    }

    function initializeContent(content) {
        initFixes(content);
        initViewer(content);
        initShare(content);
        if (window.MathJax && window.MathJax.Hub && window.MathJax.Hub.Queue) {
            window.MathJax.Hub.Queue(['Typeset', window.MathJax.Hub, content]);
        }
        var event;
        if (typeof window.CustomEvent === 'function') {
            event = new window.CustomEvent('yilia:navigation:complete', { detail: { content: content, url: window.location.href } });
            window.dispatchEvent(event);
        }
    }

    function parsePage(html) {
        var parsed = new window.DOMParser().parseFromString(html, 'text/html');
        var midColumn = parsed.querySelector('.mid-col');
        var content = midColumn && midColumn.querySelector('#js-content');
        if (!parsed.title || !content) {
            throw new Error('The destination page does not contain the expected Yilia page structure.');
        }
        return { document: parsed, content: content };
    }

    function fallBack(url, alreadyAtDestination) {
        if (alreadyAtDestination && window.location.href === url.href) {
            window.location.reload();
        } else {
            window.location.assign(url.href);
        }
    }

    function scrollToDestination(url, mode, savedState) {
        if (mode === 'pop') {
            window.scrollTo(0, savedState && savedState.scrollY || 0);
            return;
        }
        if (url.hash) {
            var id;
            try {
                id = decodeURIComponent(url.hash.substring(1));
            } catch (error) {
                id = url.hash.substring(1);
            }
            var target = document.getElementById(id) || document.getElementsByName(id)[0];
            if (target && target.scrollIntoView) {
                target.scrollIntoView();
                return;
            }
        }
        window.scrollTo(0, 0);
    }

    function navigate(url, mode, savedState) {
        var id = ++requestId;
        if (mode === 'push') {
            saveCurrentScroll();
        }

        window.fetch(url.href).then(function (response) {
            if (!response || response.ok === false) {
                throw new Error('Navigation request failed.');
            }
            var contentType = response.headers && response.headers.get && response.headers.get('content-type');
            if (contentType && !/^(text\/html|application\/xhtml\+xml)(?:\s*;|$)/i.test(contentType)) {
                throw new Error('The destination is not an HTML page.');
            }
            return response.text();
        }).then(function (html) {
            if (id !== requestId) {
                return null;
            }
            var page = parsePage(html);
            var currentContent = document.querySelector('#js-content');
            if (!currentContent || !currentContent.parentNode) {
                throw new Error('The current Yilia content container is missing.');
            }

            extractPageConfig(page.document);
            if (mode === 'push') {
                window.history.pushState(stateWithScroll(null, 0), '', url.href);
            }
            var replacement = document.importNode(page.content, true);
            rememberExplicitTargets(replacement);
            currentContent.parentNode.replaceChild(replacement, currentContent);
            document.title = page.document.title;
            return executeContentScripts(replacement, id).then(function () {
                if (id !== requestId) {
                    return null;
                }
                try {
                    initializeContent(replacement);
                    scrollToDestination(url, mode, savedState);
                } catch (error) {
                    if (window.console && window.console.warn) {
                        window.console.warn('[site-navigation] Page enhancement failed; keeping the current player session.', error);
                    }
                }
                return replacement;
            });
        }).catch(function () {
            if (id === requestId) {
                fallBack(url, mode === 'pop');
            }
        });
    }

    document.addEventListener('click', function (event) {
        var anchor = findAnchor(event.target);
        if (!shouldIntercept(event, anchor)) {
            return;
        }
        event.preventDefault();
        navigate(new window.URL(anchor.href, window.location.href), 'push');
    }, false);

    window.addEventListener('popstate', function (event) {
        if (!event.state || !event.state[historyMarker]) {
            return;
        }
        navigate(new window.URL(window.location.href), 'pop', event.state);
    }, false);
}(window, document));
