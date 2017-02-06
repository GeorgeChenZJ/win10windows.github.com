/**
  *
  *  Example of preClose:
  *
  *  function preClose(e){
  *   var self = this,
  *     g = window[this.group].global,
  *     lasting = 150;
  *   if(!g.fadeCloseFlag){
  *   this.fadeOut(this.win, lasting, 0);
  *     var caller = arguments.callee.caller;
  *     window.setTimeout(function(){
  *       g.fadeCloseFlag = 1;
  *       caller.call(self, e);
  *       g.fadeCloseFlag = 0;
  *     }, lasting)
  *     return false;
  *   }
  *   return true;
  * }
  */
;(function(){
  var Win = function(obj){
    if(!this instanceof Win) throw new Error("Instance required");
    this.id = obj.id || this.id;
    this.width = obj.width || this.width || 400;
    this.height = obj.height || this.height || 300;
    this.top = obj.top || this.top || 50;
    this.left = obj.left || this.left || 50;
    this.color = obj.color || this.color || "#515c6b";

    var bf = function(){return true};
    this.group = obj.group || "wins";
    this.preOpen = obj.preOpen|| this.preOpen || bf;
    this.postOpen = obj.postOpen|| this.postOpen || bf;
    this.preClose = obj.preClose|| this.preClose || bf;
    this.postClose = obj.postClose|| this.postClose || bf;
    this.onMouseDown = obj.onMouseDown|| this.onMouseDown || bf;
    this.onClick = obj.onClick|| this.onClick || bf;
    this.onDrag = obj.onDrag|| this.onDrag || bf;//(e, left, top)
    this.onDragMouseUp = obj.onDragMouseUp|| this.onDragMouseUp || bf;
    this.onResize = obj.onResize|| this.onResize || bf;
    this.preMaximize = obj.preMaximize|| this.preMaximize || bf;
    this.postMaximize = obj.postMaximize|| this.postMaximize || bf;
    this.preReMaximize = obj.preReMaximize|| this.preReMaximize || bf;
    this.postReMaximize = obj.postReMaximize|| this.postReMaximize || bf;
    this.preMinimize = obj.preMinimize|| this.preMinimize || bf;
    this.postMinimize = obj.postMinimize|| this.postMinimize || bf;

    this.containerId = obj.containerId || "window_container";
    var id = this.id;
    this.DOM(id);
    this.id = id;
    this.win = this.$(id);
    this.content = this.$(id+"_content");

    this.CSS();

    this.drag();
    this.resize();
    this.clicks();

  };
  Win.prototype = {
    DOM: function(id){
      var html = '<div class="dragger" id="'+id+'_dragger"></div>'+
        '<div class="resize" id="'+id+'_resize">'+
          '<div class="bar left"></div>'+
          '<div class="bar top"></div>'+
          '<div class="bar right"></div>'+
          '<div class="bar bottom"></div>'+
          '<div class="dot left-top"></div>'+
          '<div class="dot right-top"></div>'+
          '<div class="dot right-bottom"></div>'+
          '<div class="dot left-bottom"></div>'+
        '</div>'+
        '<div class="btn-bar">'+
          '<div class="btn btn-minimize" id="'+id+'_minimize"><div></div></div>'+
          '<div class="btn btn-maximize" id="'+id+'_maximize"><div></div></div>'+
          '<div class="btn btn-close" id="'+id+'_close"><div></div></div>'+
        '</div>'+
        '<div class="content" id="'+id+'_content"></div>';
      var win=document.createElement("div");
        win.id = id;
        win.className = "window";
        win.innerHTML = html;
      this.$(this.containerId).appendChild(win);
    },
    CSS: function(){
      var css = this.win.style,
        wins = window[this.group];
      css.width = this.width + "px";
      css.height = this.height + "px";
      css.top = this.top + "px";
      css.left = this.left + "px";
      if(this.color){
        css.backgroundColor = this.color;
        css.border = "1px solid " + this.color;
      }
      this.content.style.height = (this.height-29)+"px";
      if(wins){
        if(wins.global){
          var g = wins.global
          if(wins.length==0){
            g.count = 1;
            g.z_index = 10000;
            this.index = 0;
          }else {
            var preWin = wins[g.count-1].win;
            this.index = g.count++;
            css.zIndex = ++g.z_index;
            if(!this.hasClass(preWin, "unselected")){
              var _css = preWin.style;
              this.addClass(preWin, "unselected");
              _css.backgroundColor = "#fff";
              _css.border = "1px solid " + "#b5b9c0";
            }
          }
          g.historyCount++;
        }else {
          this.index = 0;
          wins.global = {};
          var g = wins.global;
          g.count = 1;
          g.z_index = 10000;
          g.historyCount = 1;
          css.zIndex = 10000;
        }
      }
    },
    drag: function(){
      var self = this,
        win = this.win;
      this.$(this.id+"_dragger").onmousedown = function(e){
        e = e || window.event;
        if(e.button==2)return;
        var dragger = this,
          moving = false;
        self.addClass(dragger, "dragging");//保持鼠标形状
        var d = document,
          x = e.clientX || e.offsetX,
          y = e.clientY || e.offsetY,
          top = win.offsetTop,
          left = win.offsetLeft;
        if(win.setCapture){
          win.setCapture();
        }else if (window.captureEvents) {
          window.captureEvents(Event.MOUSEMOVE||Event.MOUSEUP);
        }
        var btn = self.$(self.id+"_maximize")
        if(!self.hasClass(btn, "max")) moving = true;
        d.onmousemove = function(e){
          e = e || window.event;
          if(e.clientX==x&&e.clientY==y)return;
          var b = document.body,
            tx = e.pageX - x + left - b.scrollLeft,
            ty = e.pageY - y + top - b.scrollTop;
          if(!self.onDrag(e, tx, ty)) return;
          if(!moving){  //窗口最大化时拖动，缩放为原大小，但位置跟随鼠标
            self.removeClass(btn, "max");
            var css = win.style;
            css.width = self.width +"px";
            css.height = self.height +"px";
            self.content.style.height = (self.height-29)+"px";
            css.top = b.scrollTop +"px";
            var t1 = self.width,
              t2 = b.clientWidth;
            if(x<t1/2)
              left = 0;
            else if (x>t2-t1/2)
              left = t2 - t1;
            else
              left = x - t1/2;
            left = (left+b.scrollLeft);
            css.left = left+"px";
            self.left = left;
            self.$(self.id+"_resize").style.visibility="visible";
            self.remain_pos = null;
          }else {
            win.style.left = tx+"px";
            win.style.top = ty+"px";
          }
          moving = true;
        };
        d.onmouseup = function(){
          self.onDragMouseUp(window.event);
          moving = false;
          if(win.releaseCapture){
            win.releaseCapture();
          }else if(window.captureEvents){
            window.captureEvents(Event.MOUSEMOVE||Event.MOUSEUP);
          }
          self.removeClass(dragger, "dragging");
          d.onmousemove = null;
          d.onmouseup = null;
          var _top = win.offsetTop,
            _left = win.offsetLeft;
          if(_top<-10){
            self.remain_pos = true;
            self.maximize(e);
            self.top = 0;
          }else if(_top<0){
            self.top = 0;
            win.style.top = 0;
          }else if(!self.remain_pos){
            self.top = _top;
            self.left = _left;
          }
        }
      }
    },
    resize: function(){
      var self = this,
        win = this.win;
      this.$(this.id+"_resize").onmousedown = function(e){
        e = e || window.event;
        if(e.button==2)return;
        var tg = e.target,
          cls = tg.className.split(" ")[1],
          d = document,
          x = e.clientX || e.offsetX,
          y = e.clientY || e.offsetY,
          top = win.offsetTop,
          left = win.offsetLeft,
          width = win.offsetWidth,
          height = win.offsetHeight,
          content = self.content;
        if(win.setCapture){
          win.setCapture();
        }else if (window.captureEvents){
          window.captureEvents(Event.MOUSEMOVE||Event.MOUSEUP);
        }
        d.onmousemove = function(e){
          e = e || window.event;
          if(!self.onResize(e)) return;
          var varianceX, varianceY,
            css = win.style,
            c_css = content.style;
          if(cls.indexOf("left")!=-1){
            varianceX = e.clientX - x;
            css.width = (width - varianceX) + "px";
            css.left = (left + varianceX) + "px";
          }else if(cls.indexOf("right")!=-1){
            varianceX = e.clientX - x;
            css.width = (width + varianceX) + "px";
          }
          if(cls.indexOf("top")!=-1){
            varianceY = e.clientY - y;
            css.height = (height - varianceY) + "px";
            css.top = (top + varianceY) + "px";
            c_css.height = (height - varianceY - 29) + "px";
          }else if(cls.indexOf("bottom")!=-1){
            varianceY = e.clientY - y;
            css.height = (height + varianceY) + "px";
            c_css.height = (height + varianceY - 29) + "px";
          }
        };
        d.onmouseup = function(){
          if(win.releaseCapture){
            win.releaseCapture();
          }else if(window.captureEvents){
            window.captureEvents(Event.MOUSEMOVE||Event.MOUSEUP);
          }
          d.onmousemove = null;
          d.onmouseup = null;
          self.width = win.offsetWidth;
          self.height = win.offsetHeight;
          self.top = win.offsetTop;
          self.left = win.offsetLeft;
          if(self.top<0){
            if(self.top<-10){
              var _height = d.body.clientHeight,
                css = win.style;
              self.top = 0;
              css.top = 0;
              css.height = _height +"px";
              self.content.style.height = _height-29 +"px";
            }else {
              self.top = 0;
              win.style.top = 0;
            }
          }
        }
      }
    },
    clicks: function(){
      var self = this;
      this.$(this.id+"_maximize").onclick=function(e){
        self.maximize();
      };
      this.$(this.id+"_dragger").ondblclick=function(e){
        self.remain_pos = true;
        self.maximize();
      };
      this.$(this.id+"_minimize").onclick=function(e){
        if(!self.preMinimize())return;
        self.minimize();
        self.postMinimize();
      };
      this.win.onclick=function(e){
        self.onClick(e);
      };
      this.win.onmousedown=function(e){
        e.stopPropagation();
        self.onMouseDown(e);
        self.pushToFront();
      };
      document.onmousedown=function(){
        var wins = window[self.group];
        if(!wins||wins.length==0) return;
        var win = wins[wins.length-1].win,
          css = win.style;
        if(self.hasClass(win, "unselected"))return;
        self.addClass(win, "unselected");
        css = win.style;
        css.backgroundColor = "#fff";
        css.border = "1px solid " + "#b5b9c0";
      };
      this.$(this.id+"_close").onclick=function(e){
        if(!self.preClose()) return;
        self.close();
        self.postClose();
      }
    },
    maximize: function(){
      var win = this.win,
        b = document.body,
        btn = this.$(this.id+"_maximize"),
        css = win.style;
      if(!this.hasClass(btn, "max")){//最大化
        if(!this.preMaximize())return;
        css.width = b.clientWidth+"px";
        css.height = b.clientHeight+"px";
        css.top = b.scrollTop+"px";
        css.left = b.scrollLeft+"px";
        this.content.style.height = (win.clientHeight-29)+"px";
        this.addClass(btn, "max");
        this.$(this.id+"_resize").style.visibility="hidden";
        if(this.top<0) this.top = 0;
        var t = b.clientWidth - this.width;
        if(this.left>t) this.left = t +b.scrollLeft;
        t = b.clientHeight;
        if(this.top>t-45) this.top = t - 45 +b.scrollTop;
        this.postMaximize();
      }else{//还原
        if(!this.preReMaximize())return;
        css.width = this.width+"px";
        css.height = this.height+"px";
        css.top = this.top+"px";
        css.left = this.left+"px";
        this.content.style.height = this.height-29 +"px";
        this.removeClass(btn, "max");
        this.$(this.id+"_resize").style.visibility="visible";
        this.remain_pos = null;
        this.postReMaximize();
      }
    },
    minimize: function(){
      console.warn("minimize is not implemented");
    },
    reMinimize: function(){
      console.warn("reMinimize is not implemented");
    },
    close: function(){
      var wins = window[this.group],
        i=this.index,
        win = wins[i].win
      win.parentNode.removeChild(win);
      wins[i]=null;
      wins.splice(i, 1);
      for(;i<wins.length;i++){
        wins[i].index--;
      }
      wins.global.z_index--;
      wins.global.count--;
      if(wins.length>0){
        var win2 = wins[wins.length-1].win,
          css = win2.style;
        this.removeClass(win2, "unselected");
        css.backgroundColor = this.color;
        css.border = "1px solid " + this.color;
      }
    },
    //把窗口放到数组末尾、最前显示
    pushToFront: function(){
      var win = this.win,
        wins = window[this.group],
        css = win.style;
      if(!wins||wins.length<2) return;
      var g = wins.global;
      if(css.zIndex==g.z_index){
        if(this.hasClass(win,"unselected")){
          this.removeClass(win, "unselected");
          css.backgroundColor = this.color;
          css.border = "1px solid " + this.color;
        }
        return;
      }
      css.zIndex = ++g.z_index;
      var i = this.index;
      wins.splice(i, 1);
      wins.push(this);
      this.index = wins.length-1;
      this.removeClass(win, "unselected");
      css.backgroundColor = this.color;
      css.border = "1px solid " + this.color;
      var preWin = wins[wins.length-2].win;
      this.addClass(preWin, "unselected");
      css = preWin.style;
      css.backgroundColor = "#fff";
      css.border = "1px solid " + "#b5b9c0";
      for(;i<wins.length-1;i++){
        wins[i].index--;
      }
    },
    //把窗口放到数组头部、最后显示
    pushToHead: function(){
      var win = this.win,
        wins = window[this.group],
        css = win.style;
      if(!wins||wins.length<2) return;
      var g = wins.global,
        i = this.index, t=i;
      for(;t>0;t--){
        wins[t] = wins[t-1];
        wins[t].index++;
      }
      wins[0] = this;
      wins[0].index = 0;
      this.addClass(win, "unselected");
      css.backgroundColor = "#fff";
      css.border = "1px solid " + "#b5b9c0";
      css.zIndex = wins[1].win.style.zIndex-1;
      var frontWin = wins[wins.length-1].win;
      this.removeClass(frontWin, "unselected");
      css = frontWin.style;
      css.backgroundColor = this.color;
      css.border = "1px solid " + this.color;
      g.z_index = css.zIndex;
    },

    $: function(s){
      return document.getElementById(s);
    },
    addClass: function(obj, cls){
      if(this.hasClass(obj, cls)) return;
      var obj_class = obj.className,
      blank = (obj_class != '') ? ' ' : '';
      added = obj_class + blank + cls;
      obj.className = added;
    },
    removeClass: function(obj, cls){
      var obj_class = ' '+obj.className+' ';
      obj_class = obj_class.replace(/(\s+)/gi, ' '),
      removed = obj_class.replace(' '+cls+' ', ' ');
      removed = removed.replace(/(^\s+)|(\s+$)/g, '');
      obj.className = removed;
    },
    hasClass: function(obj, cls){
      var classes = obj.className,
      class_lst = classes.split(/\s+/);
      x = 0;
      for(;x<class_lst.length;x++) {
        if(class_lst[x] == cls) {
          return true;
        }
      }
      return false;
    },
    setOpacity: function(ev, v){
            ev.filters ? ev.style.filter = 'alpha(opacity=' + v*100 + ')' : ev.style.opacity = v;
    },
    getOpacity: function(elem){
        var f = elem.style.filter,
          o = f.indexOf('opacity=');
          (o=(elem.style.opacity))==="" ? o=1 : o=+o;
        return elem.filters ? (+f.substring(t+8,t+13))/100 : o;
    },
    fadeIn: function(elem, lasting, opacity){
      var self = this;
      lasting = lasting || 300;
      opacity = opacity || 1;
      elem.style.display = 'block';
      var now_op = self.getOpacity(elem);
      if(opacity<=now_op){
        if(opacity!=now_op&&self.fadeOut)self.fadeOut(elem, lasting, opacity);
        return;
      }
      if(lasting<50){
        self.setOpacity(elem, opacity);
        return;
      }
      var val = now_op,
        frameLast = 32,
        various = (opacity-val)*frameLast/lasting;
      if(opacity!=1&&various>1-opacity){
        if(opacity>=0.96)opacity=0.96;
        various = (1-opacity)-0.01;
        frameLast = various*lasting/(val-opacity)
      }
      val += various;
      ;(function(a){
        self.setOpacity(elem, val);
        val += various;
        if (val <= opacity) {
          window.setTimeout(arguments.callee, frameLast);
        }else {
          self.setOpacity(elem, opacity);
        }
      })();
    },
    fadeOut: function(elem, lasting, opacity){
      var self=this;
      lasting = lasting || 300;
      opacity = opacity || 0;
      var now_op = self.getOpacity(elem);
      if(opacity>=now_op){
        if(opacity!=now_op&&self.fadeIn) self.fadeIn(elem, lasting, opacity);
        return;
      }
      if(lasting<50){
        self.setOpacity(elem, opacity);
        return;
      }
      var val = now_op,
        frameLast = 32,
        various = (val-opacity)*frameLast/lasting;
      if(opacity!=0&&various>opacity) {
        if(opacity<=0.03)opacity=0.03;
        various = opacity-0.01;
        frameLast = various*lasting/(val-opacity)
      }
      val -= various;
      ;(function(){
        self.setOpacity(elem, val);
        val -= various;
        if (val >= opacity) {
            window.setTimeout(arguments.callee, frameLast);
        }else if (val <= 0) {
          self.setOpacity(elem, 0);
          elem.style.display = 'none';
        }else {
          self.setOpacity(elem, opacity);
        }
      })();
    }
  };
  window["Win"] = Win;
})();
