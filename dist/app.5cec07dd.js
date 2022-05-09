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
})({"src/core/router.ts":[function(require,module,exports) {
"use strict";

var __values = this && this.__values || function (o) {
  var s = typeof Symbol === "function" && Symbol.iterator,
      m = s && o[s],
      i = 0;
  if (m) return m.call(o);
  if (o && typeof o.length === "number") return {
    next: function next() {
      if (o && i >= o.length) o = void 0;
      return {
        value: o && o[i++],
        done: !o
      };
    }
  };
  throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Router =
/** @class */
function () {
  function Router() {
    var _this = this;

    this.setDefaultPage = function (page) {
      _this.defaultRoute = {
        path: '',
        page: page
      };
    };

    this.addRoutePath = function (path, page) {
      _this.routeTable.push({
        path: path,
        page: page
      });
    };

    this.route = function () {
      var e_1, _a;

      var routePath = location.hash; // #만 있으면 그냥 빈 문자열 ''로 나온다.

      if (routePath == '' && _this.defaultRoute) {
        // 디폴트 페이지인 NewsFeedView로 이동.
        // render함수를 실행시킴으로써 updateView가 실행되고 페이지가 innerHTHL로 그려지게 된다. 
        _this.defaultRoute.page.render();
      }

      try {
        for (var _b = __values(_this.routeTable), _c = _b.next(); !_c.done; _c = _b.next()) {
          var routeInfo = _c.value;

          if (routePath.indexOf(routeInfo.path) >= 0) {
            routeInfo.page.render();
            break;
          }
        }
      } catch (e_1_1) {
        e_1 = {
          error: e_1_1
        };
      } finally {
        try {
          if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        } finally {
          if (e_1) throw e_1.error;
        }
      }
    };

    var routePath = location.hash; // 해시의 변경을 감지하고 변경되면 함수 실행.
    // window.addEventListener에서의 this context는 Router 인스턴스가 아니고 함수를 실행하는 주체인 이벤트가 됨 

    window.addEventListener('hashchange', this.route.bind(this));
    this.routeTable = [];
    this.defaultRoute = null;
  }

  return Router;
}();

exports.default = Router;
},{}],"src/core/view.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var View =
/** @class */
function () {
  function View(containerId, template) {
    var _this = this;

    this.updateView = function () {
      if (_this.container) {
        // type guard
        _this.container.innerHTML = _this.renderTemplate;
        _this.renderTemplate = _this.template; // 값이 replace되어 버린 @id들을 다시 원본 템플릿으로 살려놓기 위함
      } else {
        console.log("최상위 컨테이너가 없어 UI를 진행하지 못합니다.");
      }
    };

    this.addHtml = function (htmlString) {
      _this.htmlList.push(htmlString);
    };

    this.getHtml = function () {
      var snapshot = _this.htmlList.join('');

      _this.clearHtmlList();

      return snapshot;
    };

    this.clearHtmlList = function () {
      _this.htmlList = [];
    };

    this.setTemplateData = function (key, value) {
      _this.renderTemplate = _this.renderTemplate.replace("@".concat(key), value);
    };

    var containerElement = document.getElementById(containerId);

    if (!containerElement) {
      throw "최상위 컨테이너가 없어 UI를 진행하지 못합니다.";
    }

    this.container = containerElement;
    this.template = template;
    this.renderTemplate = template;
    this.htmlList = [];
  }

  return View;
}();

exports.default = View;
},{}],"src/config.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CONTENT_URL = exports.NEWS_URL = void 0;
exports.NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json';
exports.CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json';
},{}],"src/core/api.ts":[function(require,module,exports) {
"use strict";

var __extends = this && this.__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NewsDetailApi = exports.NewsFeedApi = exports.Api = void 0;

var config_1 = require("../config");

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
}();

exports.Api = Api;

var NewsFeedApi =
/** @class */
function (_super) {
  __extends(NewsFeedApi, _super);

  function NewsFeedApi() {
    return _super !== null && _super.apply(this, arguments) || this;
  }

  NewsFeedApi.prototype.getData = function () {
    return this.getRequest(config_1.NEWS_URL);
  };

  return NewsFeedApi;
}(Api);

exports.NewsFeedApi = NewsFeedApi; // 믹스인 방법

var NewsDetailApi =
/** @class */
function (_super) {
  __extends(NewsDetailApi, _super);

  function NewsDetailApi() {
    return _super !== null && _super.apply(this, arguments) || this;
  }

  NewsDetailApi.prototype.getData = function (id) {
    return this.getRequest(config_1.CONTENT_URL.replace('@id', id));
  };

  return NewsDetailApi;
}(Api);

exports.NewsDetailApi = NewsDetailApi; // // 믹스인
// function applyApiMixins(targetClass : any, baseClasses : any[]) {
//     baseClasses.forEach(baseClass => {
//       Object.getOwnPropertyNames(baseClass.prototype).forEach(name => {
//         const descriptor = Object.getOwnPropertyDescriptor(baseClass.prototype, name);
//         if (descriptor) {
//           Object.defineProperty(targetClass.prototype, name, descriptor);
//         }
//       });
//     });
//   }
// interface NewsFeedApi extends Api {}; // TypeScript 컴파일러에게 이 두가지가 합성될것임을 알려주는 코드
// interface NewsDetailApi extends Api {};
// applyApiMixins(NewsFeedApi, [Api]);
// applyApiMixins(NewsDetailApi, [Api]);
},{"../config":"src/config.ts"}],"src/page/news-detail-view.ts":[function(require,module,exports) {
"use strict";

var __extends = this && this.__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var view_1 = __importDefault(require("../core/view"));

var api_1 = require("../core/api");

var template = "\n    <div class=\"bg-gray-600 min-h-screen pb-8\">\n        <div class=\"bg-white text-xl\">\n            <div class=\"mx-auto px-4\">\n            <div class=\"flex justify-between items-center py-6\">\n                <div class=\"flex justify-start\">\n                <h1 class=\"font-extrabold\">Hacker News</h1>\n                </div>\n                <div class=\"items-center justify-end\">\n                <a href=\"#/page/@current_page\" class=\"text-gray-500\">\n                    <i class=\"fa fa-times\"></i>\n                </a>\n                </div>\n            </div>\n            </div>\n        </div>\n\n        <div class=\"h-full border rounded-xl bg-white m-6 p-4 \">\n            <h2>@news_content_title</h2>\n            <div class=\"text-gray-400 h-20\">\n            @news_content_content\n            </div>\n            @comments\n        </div>\n    </div>\n    ";

var NewsDetailView =
/** @class */
function (_super) {
  __extends(NewsDetailView, _super);

  function NewsDetailView(containerId, store) {
    var _this = _super.call(this, containerId, template) || this; // override render


    _this.render = function () {
      // 해당 부분은 API가 호출 될때 결정되는 것들 이니까 render함수로 들어오게 됨
      // 앵커태그의 해시가 변경되었을때 이벤트가 발생한다.
      // 해시를 CONTENT_URL의 id란에 넣고 API를 호출해야함
      // 해시를 주소에서 가져와야 하는데 주소 맨끝에 해시가 붙어있으니까 코드는 다음과 같다
      var id = location.hash.substring(9);
      var api = new api_1.NewsDetailApi();
      var newsContent = api.getData(id); // api를 호출할때 id값이 필요해서 NewsFeedView와는 다르게 render에서 실행함.

      _this.store.makeRead(Number(id));

      _this.setTemplateData("comments", _this.makeComment(newsContent.comments));

      _this.setTemplateData('current_page', String(_this.store.currentPage));

      _this.setTemplateData('news_content_title', newsContent.title);

      _this.setTemplateData('news_content_content', newsContent.content);

      _this.updateView();
    };

    _this.makeComment = function (comments) {
      for (var i = 0; i < comments.length; i++) {
        var comment = comments[i];

        _this.addHtml("\n          <div style=\"padding-left: ".concat(comment.level * 40, "px;\" class=\"mt-4\">\n            <div class=\"text-gray-400\">\n              <i class=\"fa fa-sort-down mr-2\"></i>\n              <strong>").concat(comment.user, "</strong> ").concat(comment.time_ago, "\n            </div>\n            <p class=\"text-gray-700\">").concat(comment.content, "</p>\n          </div>      \n        "));

        if (comment.comments.length > 0) {
          _this.addHtml(_this.makeComment(comment.comments));
        }
      }

      return _this.getHtml();
    };

    _this.store = store;
    return _this;
  }

  return NewsDetailView;
}(view_1.default);

exports.default = NewsDetailView;
},{"../core/view":"src/core/view.ts","../core/api":"src/core/api.ts"}],"src/page/news-feed-view.ts":[function(require,module,exports) {
"use strict";

var __extends = this && this.__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var view_1 = __importDefault(require("../core/view"));

var api_1 = require("../core/api");

var NewsFeedView =
/** @class */
function (_super) {
  __extends(NewsFeedView, _super);

  function NewsFeedView(containerId, store) {
    var _this = this;

    var template = "\n        <div class=\"bg-gray-600 min-h-screen\">\n          <div class=\"bg-white text-xl\">\n            <div class=\"mx-auto px-4\">\n              <div class=\"flex justify-between items-center py-6\">\n                <div class=\"flex justify-start\">\n                  <h1 class=\"font-extrabold\">Hacker News</h1>\n                </div>\n                <div class=\"items-center justify-end\">\n                  <a href=\"#/page/@prev_page\" class=\"text-gray-900\">\n                    Previous\n                  </a>\n                  <a href=\"#/page/@next_page\" class=\"text-gray-900 ml-4\">\n                    Next\n                  </a>\n                </div>\n              </div> \n            </div>\n          </div>\n          <div class=\"p-4 text-2xl text-gray-700\">\n            @news_list        \n          </div>\n        </div>\n      ";
    _this = _super.call(this, containerId, template) || this; // 상속을 받으면 상위 클래스의 생성자를 실행시켜주어야 함.
    // override render

    _this.render = function () {
      _this.store.currentPage = Number(location.hash.substring(7) || 1); // default 처리

      for (var i = (_this.store.currentPage - 1) * 10; i < _this.store.currentPage * 10; i++) {
        // 구조 분해 할당 방법
        var _a = _this.store.getFeed(i),
            id = _a.id,
            title = _a.title,
            comments_count = _a.comments_count,
            user = _a.user,
            points = _a.points,
            time_ago = _a.time_ago,
            read = _a.read;

        _this.addHtml("\n            <div class=\"p-6 ".concat(read ? 'bg-green-600' : 'bg-white', " mt-6 rounded-lg shadow-md transition-colors duration-500 hover:bg-green-100\">\n            <div class=\"flex\">\n                <div class=\"flex-auto\">\n                <a href=\"#/detail/").concat(id, "\">").concat(title, "</a>  \n                </div>\n                <div class=\"text-center text-sm\">\n                <div class=\"w-10 text-white bg-green-300 rounded-lg px-0 py-2\">").concat(comments_count, "</div>\n                </div>\n            </div>\n            <div class=\"flex mt-3\">\n                <div class=\"grid grid-cols-3 text-sm text-gray-500\">\n                <div><i class=\"fas fa-user mr-1\"></i>").concat(user, "</div>\n                <div><i class=\"fas fa-heart mr-1\"></i>").concat(points, "</div>\n                <div><i class=\"far fa-clock mr-1\"></i>").concat(time_ago, "</div>\n                </div>  \n            </div>\n            </div>    \n        "));
      }

      _this.setTemplateData("news_list", _this.getHtml()); // 템플릿의 앵커 태그 안의 값들이 변경되면서 해당 버튼을 클릭했을때 hash 변경이 감지될 것.


      _this.setTemplateData("prev_page", String(_this.store.prevPage));

      _this.setTemplateData("next_page", String(_this.store.nextPage));

      _this.updateView();
    };

    _this.store = store;
    _this.api = new api_1.NewsFeedApi();

    if (!_this.store.hasFeeds) {
      _this.store.setFeeds(_this.api.getData());
    }

    return _this;
  }

  return NewsFeedView;
}(view_1.default);

exports.default = NewsFeedView;
},{"../core/view":"src/core/view.ts","../core/api":"src/core/api.ts"}],"src/page/index.ts":[function(require,module,exports) {
"use strict";

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NewsFeedView = exports.NewsDetailView = void 0;

var news_detail_view_1 = require("./news-detail-view");

Object.defineProperty(exports, "NewsDetailView", {
  enumerable: true,
  get: function get() {
    return __importDefault(news_detail_view_1).default;
  }
});

var news_feed_view_1 = require("./news-feed-view");

Object.defineProperty(exports, "NewsFeedView", {
  enumerable: true,
  get: function get() {
    return __importDefault(news_feed_view_1).default;
  }
});
},{"./news-detail-view":"src/page/news-detail-view.ts","./news-feed-view":"src/page/news-feed-view.ts"}],"src/store.ts":[function(require,module,exports) {
"use strict";

var __assign = this && this.__assign || function () {
  __assign = Object.assign || function (t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];

      for (var p in s) {
        if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }
    }

    return t;
  };

  return __assign.apply(this, arguments);
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Store =
/** @class */
function () {
  function Store() {
    var _this = this;

    this.getAllFeeds = function () {
      return _this.feeds;
    };

    this.getFeed = function (position) {
      return _this.feeds[position];
    };

    this.setFeeds = function (feeds) {
      _this.feeds = feeds.map(function (feed) {
        return __assign(__assign({}, feed), {
          read: false
        });
      });
    };

    this.makeRead = function (id) {
      var feed = _this.feeds.find(function (feed) {
        return feed.id == id;
      });

      if (feed) {
        feed.read = true;
      }
    };

    this.feeds = [];
    this._currentPage = 1;
  }

  Object.defineProperty(Store.prototype, "currentPage", {
    // getCurrentPage와 같은 함수를 만들어서 간단한 클래스 정보를 가져오는 것을 하기에 좀 애매하니까
    // getter / setter 라는 문법이 있다.
    get: function get() {
      return this._currentPage;
    },
    set: function set(page) {
      if (page <= 0) return;
      this._currentPage = page;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Store.prototype, "nextPage", {
    get: function get() {
      return this._currentPage + 1;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Store.prototype, "prevPage", {
    get: function get() {
      return this._currentPage - 1 > 1 ? this._currentPage - 1 : 1;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Store.prototype, "numberOfFeeds", {
    get: function get() {
      return this.feeds.length;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Store.prototype, "hasFeeds", {
    get: function get() {
      return this.feeds.length > 0;
    },
    enumerable: false,
    configurable: true
  });
  return Store;
}();

exports.default = Store;
},{}],"src/app.ts":[function(require,module,exports) {
"use strict";

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var router_1 = __importDefault(require("./core/router"));

var page_1 = require("./page");

var store_1 = __importDefault(require("./store")); // 가능하면 이렇게 전역에서 사용할 수 있게 하는 요소는 만들지 않는게 좋음
// const store : Store = {
//   currentPage : 1,
//   feeds : []
// };
// declare global {
//   interface Window {
//     store : Store;
//   }
// }
// window.store = store


var store = new store_1.default();
var router = new router_1.default();
var newsFeedView = new page_1.NewsFeedView('root', store);
var newsDetailView = new page_1.NewsDetailView('root', store);
router.setDefaultPage(newsFeedView);
router.addRoutePath('/page/', newsFeedView);
router.addRoutePath('/detail/', newsDetailView);
router.route();
},{"./core/router":"src/core/router.ts","./page":"src/page/index.ts","./store":"src/store.ts"}],"../../../.config/yarn/global/node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
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
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "59290" + '/');

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
},{}]},{},["../../../.config/yarn/global/node_modules/parcel-bundler/src/builtins/hmr-runtime.js","src/app.ts"], null)
//# sourceMappingURL=/app.5cec07dd.js.map