"use strict";

var _ThemeManager;
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
// Theme management
var ThemeManager = /*#__PURE__*/function () {
  function ThemeManager() {
    _classCallCheck(this, ThemeManager);
    _defineProperty(this, "state", void 0);
    _defineProperty(this, "THEME_KEY", 'theme-preference');
    this.state = {
      isDark: this.getInitialThemeState()
    };
    this.applyTheme();
  }
  return _createClass(ThemeManager, [{
    key: "getInitialThemeState",
    value: function getInitialThemeState() {
      var savedTheme = localStorage.getItem(this.THEME_KEY);
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
  }, {
    key: "applyTheme",
    value: function applyTheme() {
      document.documentElement.setAttribute('data-theme', this.state.isDark ? 'dark' : 'light');
      localStorage.setItem(this.THEME_KEY, this.state.isDark ? 'dark' : 'light');
    }
  }, {
    key: "toggleTheme",
    value: function toggleTheme() {
      this.state.isDark = !this.state.isDark;
      this.applyTheme();
    }
  }, {
    key: "getCurrentTheme",
    value: function getCurrentTheme() {
      return this.state.isDark;
    }
  }], [{
    key: "getInstance",
    value: function getInstance() {
      if (!ThemeManager.instance) {
        ThemeManager.instance = new ThemeManager();
      }
      return ThemeManager.instance;
    }
  }]);
}(); // DOM Elements
_ThemeManager = ThemeManager;
_defineProperty(ThemeManager, "instance", void 0);
var themeToggle = document.querySelector('.theme-toggle');
var themeIcon = document.querySelector('.theme-toggle__icon');

// Event Listeners
function initializeThemeToggle() {
  if (!themeToggle || !themeIcon) return;
  var themeManager = ThemeManager.getInstance();

  // Set initial icon
  updateThemeIcon(themeManager.getCurrentTheme());
  themeToggle.addEventListener('click', function () {
    themeManager.toggleTheme();
    updateThemeIcon(themeManager.getCurrentTheme());
  });
}
function updateThemeIcon(isDark) {
  if (!themeIcon) return;
  themeIcon.textContent = isDark ? '☀️' : '🌙';
}

// Initialize
document.addEventListener('DOMContentLoaded', function () {
  initializeThemeToggle();
});