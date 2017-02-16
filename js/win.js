;
(function () {
  var Win = function (obj) {
    if (!(this instanceof Win)) throw new Error("Instance required");
    this.id = obj.id || this.id;
    this.width = obj.width || this.width || 400;
    this.height = obj.height || this.height || 300;
    this.top = obj.top || this.top || 50;
    this.left = obj.left || this.left || 50;
    this.color = obj.color || this.color || "#515c6b";

    this.resizable = obj.resizable || this.resizable || true;
    this.title = obj.title || this.title;
    this.btnGroup = obj.btnGroup || this.btnGroup || [1, 1, 1];

    var bf = function () {
      return true;
    };
    this.group = obj.group || "wins";
    this.preOpen = obj.preOpen || this.preOpen || bf;
    this.postOpen = obj.postOpen || this.postOpen || bf;
    this.preClose = obj.preClose || this.preClose || bf;
    this.postClose = obj.postClose || this.postClose || bf;
    this.onMouseDown = obj.onMouseDown || this.onMouseDown || bf;
    this.onClick = obj.onClick || this.onClick || bf;
    this.onDrag = obj.onDrag || this.onDrag || bf; //(e, left, top)
    this.onDragMouseUp = obj.onDragMouseUp || this.onDragMouseUp || bf;
    this.onResize = obj.onResize || this.onResize || bf;
    this.preMaximize = obj.preMaximize || this.preMaximize || bf;
    this.postMaximize = obj.postMaximize || this.postMaximize || bf;
    this.preReMaximize = obj.preReMaximize || this.preReMaximize || bf;
    this.postReMaximize = obj.postReMaximize || this.postReMaximize || bf;
    this.preMinimize = obj.preMinimize || this.preMinimize || bf;
    this.postMinimize = obj.postMinimize || this.postMinimize || bf;

    this.containerId = obj.containerId || "window_container";
    var id = this.id;
    this._DOM(id);
    this.id = id;
    this.win = this.$(id);
    this.content = this.$(id + "_content");

    this._CSS();

    this._drag();
    if (this.resizable) this._resize();
    this._clicks();

  };
  Win.prototype = {
    _DOM: function (id) {
      var html = '<div class="dragger" id="' + id + '_dragger"></div>';
      if (this.title)
        html += '<div class="title" id="' + id + '_title">' + this.title + '<div>';
      if (this.resizable)
        html += '<div class="resize" id="' + id + '_resize">' +
        '<div class="bar left"></div>' +
        '<div class="bar top"></div>' +
        '<div class="bar right"></div>' +
        '<div class="bar bottom"></div>' +
        '<div class="dot left-top"></div>' +
        '<div class="dot right-top"></div>' +
        '<div class="dot right-bottom"></div>' +
        '<div class="dot left-bottom"></div>' +
        '</div>';
      html += '<div class="btn-bar">';
      if (this.btnGroup[0])
        html += '<div class="btn btn-minimize" id="' + id + '_minimize"><div></div></div>';
      if (this.btnGroup[1])
        html += '<div class="btn btn-maximize" id="' + id + '_maximize"><div></div></div>';
      if (this.btnGroup[2])
        html += '<div class="btn btn-close" id="' + id + '_close"><div></div></div>';
      html += '</div><div class="content" id="' + id + '_content"></div>';
      var win = document.createElement("div");
      win.id = id;
      win.className = "window";
      win.innerHTML = html;
      this.$(this.containerId).appendChild(win);
    },
    _CSS: function () {
      var css = this.win.style,
        wins = window[this.group];
      css.width = this.width + "px";
      css.height = this.height + "px";
      css.top = this.top + "px";
      css.left = this.left + "px";
      css.backgroundColor = this.color;
      css.border = "1px solid " + this.color;
      if (wins) {
        if (wins.global) {
          var g = wins.global;
          if (wins.length === 0) {
            g.count = 1;
            g.z_index = 10000;
            this.index = 0;
          } else {
            var preWin = wins[g.count - 1].win; //前一个窗口取消选中选中
            this.unselect(preWin);
            this.index = g.count++;
            css.zIndex = ++g.z_index;
          }
          g.historyCount++;
        } else {
          //该组第一个窗口
          this.index = 0;
          wins.global = {};
          var g = wins.global;
          g.count = 1;
          g.z_index = 10000;
          g.historyCount = 1;
          css.zIndex = 10000;
          //点击document时最前窗口取消选中
          var self = this;
          this.addEvent(document, "mousedown", function () {
            var wins = window[self.group];
            if (wins.length === 0) return;
            var win = wins[wins.length - 1].win;
            self.unselect(win);
          });
        }
      } else {
        /**
         * Win 实例需要放入数组内, 并在初始化时传入数组名称
         */
        throw new Error("instance" + this.id + " not in array group");
      }
    },
    _drag: function () {
      var self = this,
        win = this.win;
      this.addEvent(this.$(this.id + "_dragger"), "mousedown", function (e) {
        e = e || window.event;
        if (e.button == 2) return;
        var dragger = self.$(self.id + "_dragger");
        self.addClass(dragger, "dragging"); //保持鼠标形状
        var d = document,
          x = e.clientX || e.offsetX,
          y = e.clientY || e.offsetY,
          top = win.offsetTop,
          left = win.offsetLeft,
          moved,
          max = false,
          btn = self.$(self.id + "_maximize");
        if (btn && self.hasClass(btn, "max")) max = true;
        var dmove = function (e) {
            e = e || window.event;
            if (e.clientX === x && e.clientY === y) return;
            var b = document.body,
              tx = e.clientX - x + left,
              ty = e.clientY - y + top;
            if (!self.onDrag(e, tx, ty)) return;
            if (max) { //窗口最大化时拖动，缩放为原大小，但位置跟随鼠标
              max = false;
              self.removeClass(btn, "max");
              var css = win.style;
              css.width = self.width + "px";
              css.height = self.height + "px";
              css.top = b.scrollTop + "px";
              var t1 = self.width,
                t2 = b.clientWidth;
              if (x < t1 / 2)
                left = 0;
              else if (x > t2 - t1 / 2)
                left = t2 - t1;
              else
                left = x - t1 / 2;
              left = left + b.scrollLeft;
              css.left = left + "px";
              self.left = left;
              self.$(self.id + "_resize").style.visibility = "visible";
            } else {
              win.style.left = tx + "px";
              win.style.top = ty + "px";
            }
            moved = true;
          },
          dup = function () {
            self.removeClass(dragger, "dragging");
            self.removeEvent(d, "mousemove", dmove);
            self.removeEvent(d, "mouseup", dup);
            var _top = win.offsetTop,
              _left = win.offsetLeft;
            if (_top < -10 && self.btnGroup[1]) {
              self.maximize();
              self.top = 0;
            } else if (_top < 0) {
              self.top = 0;
              win.style.top = 0;
            } else if (moved) {
              self.top = _top;
              self.left = _left;
            }
          };
        self.addEvent(d, "mousemove", dmove);
        self.addEvent(d, "mouseup", dup);
      });
    },
    _resize: function () {
      var self = this,
        win = this.win;
      this.addEvent(this.$(this.id + "_resize"), "mousedown", function (e) {
        e = e || window.event;
        if (e.button == 2) return;
        var tg = e.srcElement ? e.srcElement : e.target,
          cls = tg.className.split(" ")[1],
          d = document,
          x = e.clientX || e.offsetX,
          y = e.clientY || e.offsetY,
          top = win.offsetTop,
          left = win.offsetLeft,
          width = win.offsetWidth,
          height = win.offsetHeight;
        var dmove = function (e) {
            e = e || window.event;
            if (!self.onResize(e)) return;
            var varianceX, varianceY,
              css = win.style;
            if (cls.indexOf("left") != -1) {
              varianceX = e.clientX - x;
              css.width = (width - varianceX) + "px";
              css.left = (left + varianceX) + "px";
            } else if (cls.indexOf("right") != -1) {
              varianceX = e.clientX - x;
              css.width = (width + varianceX) + "px";
            }
            if (cls.indexOf("top") != -1) {
              varianceY = e.clientY - y;
              css.height = (height - varianceY) + "px";
              css.top = (top + varianceY) + "px";
            } else if (cls.indexOf("bottom") != -1) {
              varianceY = e.clientY - y;
              css.height = (height + varianceY) + "px";
            }
          },
          dup = function () {
            self.removeEvent(d, "mousemove", dmove);
            self.removeEvent(d, "mouseup", dup);
            self.width = win.offsetWidth;
            self.height = win.offsetHeight;
            self.top = win.offsetTop;
            self.left = win.offsetLeft;
            if (self.top < -10) {
              var _height = d.body.clientHeight,
                css = win.style;
              self.top = 0;
              css.top = 0;
              css.height = _height + "px";
            } else if (self.top < 0) {
              self.top = 0;
              win.style.top = 0;
            }
          };
        self.addEvent(d, "mousemove", dmove);
        self.addEvent(d, "mouseup", dup);
      });
    },
    _clicks: function () {
      var self = this;
      this.$(this.id + "_dragger").ondblclick = function (e) {
        e = e || window.event;
        self.stopPropagation(e);
        if (self.btnGroup[1]) self.maximize();
      };
      if (this.btnGroup[0])
        this.$(this.id + "_minimize").onclick = function (e) {
          e = e || window.event;
          self.stopPropagation(e);
          self.minimize();
        };
      if (this.btnGroup[1])
        this.$(this.id + "_maximize").onclick = function (e) {
          e = e || window.event;
          self.stopPropagation(e);
          self.maximize();
        };
      if (this.btnGroup[2])
        this.$(this.id + "_close").onclick = function (e) {
          e = e || window.event;
          self.stopPropagation(e);
          self.close();
        };
      this.win.onclick = function (e) {
        e = e || window.event;
        self.stopPropagation(e);
        self.onClick(e);
      };
      this.win.onmousedown = function (e) {
        e = e || window.event;
        self.stopPropagation(e);
        self.pushToFront();
        self.onMouseDown(e);
      };
    },
    maximize: function () {
      var win = this.win,
        b = document.body,
        btn = this.$(this.id + "_maximize"),
        css = win.style;
      if (!this.hasClass(btn, "max")) { //最大化
        if (!this.preMaximize()) return this;
        css.width = b.clientWidth + "px";
        css.height = b.clientHeight + "px";
        css.top = b.scrollTop + "px";
        css.left = b.scrollLeft + "px";
        this.addClass(btn, "max");
        this.$(this.id + "_resize").style.visibility = "hidden";
        if (this.top < 0) this.top = 0;
        var t = b.clientWidth - this.width;
        if (this.left > t) this.left = t + b.scrollLeft;
        t = b.clientHeight;
        if (this.top > t - 45) this.top = t - 45 + b.scrollTop;
        this.postMaximize();
      } else { //还原
        if (!this.preReMaximize()) return this;
        css.width = this.width + "px";
        css.height = this.height + "px";
        css.top = this.top + "px";
        css.left = this.left + "px";
        this.removeClass(btn, "max");
        this.$(this.id + "_resize").style.visibility = "visible";
        this.postReMaximize();
      }
      return this;
    },
    minimize: function () {
      if (!this.preMinimize()) return this;
      this._minimize();
      this.postMinimize();
      return this;
    },
    _minimize: function () {
      console.warn("minimize is not implemented");
    },
    reMinimize: function () {
      console.warn("reMinimize is not implemented");
    },
    close: function () {
      if (!this.preClose()) return this;
      this._close();
      this.postClose();
      return this;
    },
    _close: function () {
      var wins = window[this.group],
        i = this.index,
        win = wins[i].win;
      win.parentNode.removeChild(win);
      wins.splice(i, 1);
      for (; i < wins.length; i++) {
        wins[i].index--;
      }
      wins.global.count--;
      if (wins.length > 0) {
        var win2 = wins[wins.length - 1].win;
        this.select(win2);
      }
    },
    //把窗口放到数组末尾、最前显示
    pushToFront: function () {
      var win = this.win,
        wins = window[this.group],
        css = win.style,
        g = wins.global;
      if (wins.length === 0 || css.zIndex == g.z_index || wins.length === 1) {
        if (this.hasClass(win, "unselected")) {
          this.select(win);
        }
        return this;
      }
      var i = this.index;
      wins.splice(i, 1);
      wins.push(this);
      this.index = wins.length - 1;
      var preWin = wins[wins.length - 2].win;
      this.select().unselect(preWin);
      for (; i < wins.length - 1; i++) {
        wins[i].index--;
      }
      return this;
    },
    //把窗口放到数组头部、最后显示
    pushToHead: function () {
      var win = this.win,
        wins = window[this.group],
        css = win.style;
      if (!wins || wins.length < 2) return this;
      var g = wins.global,
        i = this.index,
        t = i;
      for (; t > 0; t--) {
        wins[t] = wins[t - 1];
        wins[t].index++;
      }
      wins[0] = this;
      wins[0].index = 0;
      css.zIndex = wins[1].win.style.zIndex - 1;
      var frontWin = wins[wins.length - 1].win; //最前显示的窗口
      this.unselect().select(frontWin);
      return this;
    },

    unselect: function (win) {
      var _win = win || this.win;
      if (this.addClass(_win, "unselected")) {
        var css = _win.style;
        css.backgroundColor = "#fff";
        css.border = "1px solid " + "#b5b9c0";
      }
      return this;
    },
    select: function (win) {
      var _win = win || this.win;
      this.removeClass(_win, "unselected");
      var css = _win.style;
      css.backgroundColor = this.color;
      css.border = "1px solid " + this.color;
      css.zIndex = ++wins.global.z_index;
      return this;
    },
    addEvent: function (ele, type, cb) {
      if (ele.addEventListener) {
        ele.addEventListener(type, cb, false);
      } else if (ele.attachEvent) {
        ele.attachEvent('on' + type, cb);
      } else {
        ele['on' + type] = cb;
      }
    },
    removeEvent: function (ele, type, cb) {
      if (ele.removeEventListener) {
        ele.removeEventListener(type, cb, false);
      } else if (ele.detachEvent) {
        ele.detachEvent('on' + type, cb);
      } else {
        ele['on' + type] = null;
      }
    },
    stopPropagation: function (e) {
      if (e.stopPropagation) {
        e.stopPropagation();
      } else {
        e.cancelBubble = true;
      }
    },

    $: function (s) {
      return document.getElementById(s);
    },
    addClass: function (obj, cls) {
      if (this.hasClass(obj, cls)) return false;
      var obj_class = obj.className,
        blank = (obj_class !== '') ? ' ' : '';
      added = obj_class + blank + cls;
      obj.className = added;
      return true;
    },
    removeClass: function (obj, cls) {
      var obj_class = ' ' + obj.className + ' ';
      obj_class = obj_class.replace(/(\s+)/gi, ' ');
      var removed = obj_class.replace(' ' + cls + ' ', ' ');
      removed = removed.replace(/(^\s+)|(\s+$)/g, '');
      obj.className = removed;
    },
    hasClass: function (obj, cls) {
      var classes = obj.className,
        class_lst = classes.split(/\s+/);
      x = 0;
      for (; x < class_lst.length; x++) {
        if (class_lst[x] == cls) {
          return true;
        }
      }
      return false;
    }
  };

  window["Win"] = Win;
})();
