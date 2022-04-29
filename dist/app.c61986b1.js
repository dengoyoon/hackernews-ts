// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"app.ts":[function(require,module,exports) {
"use strict"; // Typing 하는 방법 두 가지 : Type Alias , Interface
// Union 타입으로 선언을 해야하면 Interface는 쓰지 못함. Type Alias 사용해야한다.

var ajax = new XMLHttpRequest();
var NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json';
var CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json';
var container = document.getElementById('root');
var store = {
  currentPage: 1,
  feeds: []
}; // 이런식으로 class화 시키는것이 현재 기능으로는 비효율적이긴 하지만 앞으로 커지는 기능에 대한 대비로 이렇게 하는 것이 좋다
// class Api {
//   url : string;
//   ajax : XMLHttpRequest;
//   constructor(url : string) {
//     this.url = url;
//     this.ajax = new XMLHttpRequest();
//   }
//   protected getRequest<AjaxResponseType>() : AjaxResponseType {
//     this.ajax.open('GET', this.url, false);
//     this.ajax.send();
//     // 경우에 따라서 반환하는 값이 NewsFeed[]일때도, NewsDetail일때도 있는 상황
//     return JSON.parse(this.ajax.response);
//   }
// }

function applyApiMixins(targetClass, baseClasses) {
  // 일단 이해하긴 어렵고 그냥 역할을 이용하면 좋을듯, 다중 상속을 지원하기 위함 (합성시키기)
  baseClasses.forEach(function (baseClass) {
    Object.getOwnPropertyNames(baseClass.prototype).forEach(function (name) {
      var descriptor = Object.getOwnPropertyDescriptor(baseClass.prototype, name);

      if (descriptor) {
        Object.defineProperty(targetClass.prototype, name, descriptor);
      }
    });
  });
} // 믹스인 방법
// 이 방법으로 코드의 상속 구현이 유연해질 수 있다.
// extends는 다중상속을 지원하지 않음


var Api =
/** @class */
function () {
  function Api() {}

  Api.prototype.getRequest = function (url) {
    var ajax = new XMLHttpRequest();
    ajax.open('GET', url, false);
    ajax.send(); // 경우에 따라서 반환하는 값이 NewsFeed[]일때도, NewsDetail일때도 있는 상황

    return JSON.parse(ajax.response);
  };

  return Api;
}(); // class NewsFeedApi extends Api {
//   getData() : NewsFeed[] {
//     return this.getRequest<NewsFeed[]>();
//   }
// }
// 믹스인 방법


var NewsFeedApi =
/** @class */
function () {
  function NewsFeedApi() {}

  NewsFeedApi.prototype.getData = function () {
    return this.getRequest(NEWS_URL);
  };

  return NewsFeedApi;
}(); // class NewsDetailApi extends Api {
//   getData() : NewsDetail {
//     return this.getRequest<NewsDetail>();
//   }
// }
// 믹스인 방법


var NewsDetailApi =
/** @class */
function () {
  function NewsDetailApi() {}

  NewsDetailApi.prototype.getData = function (id) {
    return this.getRequest(CONTENT_URL.replace('@id', id));
  };

  return NewsDetailApi;
}();

; // TypeScript 컴파일러에게 이 두가지가 합성될것임을 알려주는 코드

;
applyApiMixins(NewsFeedApi, [Api]);
applyApiMixins(NewsDetailApi, [Api]); // 제네릭을 이용하면 A,B,C,D 유형의 인풋값에 대해서 A유형엔 A유형으로 반환 할 수 있게 해준다,

var getData = function getData(url) {
  ajax.open('GET', url, false);
  ajax.send(); // 경우에 따라서 반환하는 값이 NewsFeed[]일때도, NewsDetail일때도 있는 상황

  return JSON.parse(ajax.response);
};

var updateView = function updateView(template) {
  if (container) {
    // type guard
    container.innerHTML = template;
  } else {
    console.log("ERROR");
  }
};

var makeFirstFeedForReadState = function makeFirstFeedForReadState(feeds) {
  // 처음 피드 데이터를 받아오면서 read속성을 false값으로 초기화해서 부여하기 위한 함수
  for (var i = 0; i < feeds.length; i++) {
    feeds[i].read = false;
  }

  return feeds;
};

var makeComment = function makeComment(comments) {
  var commentString = [];

  for (var i = 0; i < comments.length; i++) {
    var comment = comments[i];
    commentString.push("\n      <div style=\"padding-left: ".concat(comment.level * 40, "px;\" class=\"mt-4\">\n        <div class=\"text-gray-400\">\n          <i class=\"fa fa-sort-down mr-2\"></i>\n          <strong>").concat(comment.user, "</strong> ").concat(comment.time_ago, "\n        </div>\n        <p class=\"text-gray-700\">").concat(comment.content, "</p>\n      </div>      \n    "));

    if (comment.comments.length > 0) {
      commentString.push(makeComment(comment.comments));
    }
  }

  return commentString.join('');
};

var displayNewsFeed = function displayNewsFeed() {
  var api = new NewsFeedApi();
  var newsFeeds = store.feeds;

  if (newsFeeds.length == 0) {
    newsFeeds = store.feeds = makeFirstFeedForReadState(api.getData());
  }

  var template = "\n    <div class=\"bg-gray-600 min-h-screen\">\n      <div class=\"bg-white text-xl\">\n        <div class=\"mx-auto px-4\">\n          <div class=\"flex justify-between items-center py-6\">\n            <div class=\"flex justify-start\">\n              <h1 class=\"font-extrabold\">Hacker News</h1>\n            </div>\n            <div class=\"items-center justify-end\">\n              <a href=\"#/page/@prev_page\" class=\"text-gray-900\">\n                Previous\n              </a>\n              <a href=\"#/page/@next_page\" class=\"text-gray-900 ml-4\">\n                Next\n              </a>\n            </div>\n          </div> \n        </div>\n      </div>\n      <div class=\"p-4 text-2xl text-gray-700\">\n        @news_list        \n      </div>\n    </div>\n  ";
  var newsList = [];
  var maxPageNumber = newsFeeds.length / 10;

  for (var i = (store.currentPage - 1) * 10; i < store.currentPage * 10; i++) {
    newsList.push("\n            <div class=\"p-6 ".concat(newsFeeds[i].read ? 'bg-green-600' : 'bg-white', " mt-6 rounded-lg shadow-md transition-colors duration-500 hover:bg-green-100\">\n            <div class=\"flex\">\n                <div class=\"flex-auto\">\n                <a href=\"#/detail/").concat(newsFeeds[i].id, "\">").concat(newsFeeds[i].title, "</a>  \n                </div>\n                <div class=\"text-center text-sm\">\n                <div class=\"w-10 text-white bg-green-300 rounded-lg px-0 py-2\">").concat(newsFeeds[i].comments_count, "</div>\n                </div>\n            </div>\n            <div class=\"flex mt-3\">\n                <div class=\"grid grid-cols-3 text-sm text-gray-500\">\n                <div><i class=\"fas fa-user mr-1\"></i>").concat(newsFeeds[i].user, "</div>\n                <div><i class=\"fas fa-heart mr-1\"></i>").concat(newsFeeds[i].points, "</div>\n                <div><i class=\"far fa-clock mr-1\"></i>").concat(newsFeeds[i].time_ago, "</div>\n                </div>  \n            </div>\n            </div>    \n      "));
  }

  template = template.replace('@news_list', newsList.join(''));
  template = template.replace('@prev_page', String(store.currentPage - 1 > 1 ? store.currentPage - 1 : 1));
  template = template.replace('@next_page', String(store.currentPage + 1 > maxPageNumber ? maxPageNumber : store.currentPage + 1));
  updateView(template);
};

var displayNewsDetail = function displayNewsDetail() {
  // 앵커태그의 해시가 변경되었을때 이벤트가 발생한다.
  // 해시를 CONTENT_URL의 id란에 넣고 API를 호출해야함
  // 해시를 주소에서 가져와야 하는데 주소 맨끝에 해시가 붙어있으니까 코드는 다음과 같다
  var id = location.hash.substring(9);
  var api = new NewsDetailApi();

  for (var i = 0; i < store.feeds.length; i++) {
    if (store.feeds[i].id == Number(id)) {
      store.feeds[i].read = true;
      break;
    }
  }

  var newsContent = api.getData(id);
  var template = "\n    <div class=\"bg-gray-600 min-h-screen pb-8\">\n      <div class=\"bg-white text-xl\">\n        <div class=\"mx-auto px-4\">\n          <div class=\"flex justify-between items-center py-6\">\n            <div class=\"flex justify-start\">\n              <h1 class=\"font-extrabold\">Hacker News</h1>\n            </div>\n            <div class=\"items-center justify-end\">\n              <a href=\"#/page/".concat(store.currentPage, "\" class=\"text-gray-500\">\n                <i class=\"fa fa-times\"></i>\n              </a>\n            </div>\n          </div>\n        </div>\n      </div>\n\n      <div class=\"h-full border rounded-xl bg-white m-6 p-4 \">\n        <h2>").concat(newsContent.title, "</h2>\n        <div class=\"text-gray-400 h-20\">\n          ").concat(newsContent.content, "\n        </div>\n\n        @comments\n\n      </div>\n    </div>\n    ");
  template = template.replace('@comments', makeComment(newsContent.comments));
  updateView(template);
};

var router = function router() {
  var routePath = location.hash;

  if (routePath == '') {
    // #만 있으면 그냥 빈 문자열 ''로 나온다.
    displayNewsFeed();
  } else if (routePath.indexOf('/page') >= 0) {
    store.currentPage = Number(routePath.substring(7));
    displayNewsFeed();
  } else {
    displayNewsDetail();
  }
};

window.addEventListener('hashchange', router);
router();
},{}],"../../../.config/yarn/global/node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "53977" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../../../.config/yarn/global/node_modules/parcel-bundler/src/builtins/hmr-runtime.js","app.ts"], null)
//# sourceMappingURL=/app.c61986b1.js.map