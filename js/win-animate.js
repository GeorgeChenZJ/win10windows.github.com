;(function(){
  var AnimateWin = function(obj){
    //参数传入方法时阻止已实现方法向上传递
    var bf = function(){return true;};
    this.anWinPreClose = obj.preClose|| this.anWinPreClose ||bf;
    this.anWinOnDrag = obj.onDrag|| this.anWinOnDrag ||bf;
    this.anWinPreMaximize = obj.onMaximize|| this.anWinPreMaximize ||bf;
    this.anWinPreReMaximize = obj.preReMaximize|| this.anWinPreReMaximize ||bf;
    this.anWinPreMinimize = obj.preMinimize|| this.anWinPreMinimize ||bf;
    this.preReMinimize = obj.preReMinimize|| this.preReMinimize ||bf;
    this.postReMinimize = obj.postReMinimize|| this.postReMinimize ||bf;
    obj.onMinimize = null;
    obj.onMaximize = null;
    obj.onDrag = null;
    obj.preClose = null;
    Win.call(this, obj);
  };
  if(!Object.create){
    Object.create = function(proto){
      function F(){}
      F.prototype = proto;
      return new F();
    };
  }
  AnimateWin.prototype = Object.create(Win.prototype);
  AnimateWin.prototype.preClose = function(e){
    var self = this;
    if(!self.PRECLOSE){
      if(!this.anWinPreClose()) return;
      var css = this.win.style,
        width, height, left, top,
        lasting = 150;
        i=0;
      if(this.btnGroup[1]&&this.hasClass(this.$(this.id+"_maximize"), "max")){
        var b=document.body;
        width = b.clientWidth;
        height = b.clientHeight;
        left = 0;
        top = 0;
        lasting = 80;
      }else {
        width = self.width;
        height = self.height;
        left = self.left;
        top = self.top;
      }
      this.fadeOut(this.win, lasting, 0);
      for(;i<10;i++){
        ;(function(i){
          window.setTimeout(function(){
            css.width = width*(100-0.6*(i+1))/100 +"px";
            css.left = left+ (width-(+css.width.replace("px","")))/2 +"px";
            css.height = height*(100-0.6*(i+1))/100 +"px";
            css.top = top+ (height-(+css.height.replace("px","")))/2 +"px";
          }, i*lasting/10);
        })(i);
      }
      var caller = arguments.callee.caller;
      window.setTimeout(function(){
        self.PRECLOSE = true;
        caller.call(self, e);
        delete self.PRECLOSE;
      }, lasting);
      return false;
    }
    return true;
  };
  AnimateWin.prototype.onDrag = function(e, left, top) {
    if(!this.anWinOnDrag(e, left, left)) return false;
    if(!this.resizable||!this.btnGroup[1]) return true; //跳过
    var self = this;
    e.pageX = e.pageX || e.clientX+document.body.scrollLeft;
    e.pageY = e.pageY || e.clientY+document.body.scrollTop;
    if((top<-10||e.pageX<3)&&!document.getElementById("window_maximize_cover")){//显示罩层
      var cover = document.createElement("div"),
        b = document.body;
      cover.innerHTML = '<div class="window-animate maximize-cover" id="window_maximize_cover"><div class="cover-inner"></div></div>';
      b.appendChild(cover);
      cover = document.getElementById("window_maximize_cover");
      var css = cover.style;
      if(top<=-10){
        var cw = b.clientWidth,
          vh = b.clientHeight,
          _mx = e.clientX+b.scrollLeft-7,
          mx_ = cw -_mx-7,
          lasting = 200,
          i=0;
        if(_mx>cw) _mx=cw-7;
        else if(_mx<0) _mx=7;
        var _various = _mx/10,
          various_ = mx_/10,
          variousY = (vh-14)/10;
        self.MAXCOVER = 1;
        window.setTimeout(function(){
          delete self.MAXCOVER;
        }, lasting);
        for(;i<10;i++){
          ;(function(i){
            window.setTimeout(function(){
              css.left = _mx-(i+1)*_various+7 +"px";
              css.width = (i+1)*_various + (i+1)*various_-7 +"px";
              css.height = (i+1)*variousY + "px";
            }, i*lasting/10);
          })(i);
        }
      }else if(e.pageX<=3&&top>-10){
        var cw = b.clientWidth,
          vh = b.clientHeight,
          _my = e.pageY-7,
          my_ = vh-_my-14,
          lasting = 200,
          i=0;
        if(_my>vh) _my=vh-7;
        else if(_my<0) _my=7;
        var _various = _my/10,
          various_ = my_/10,
          variousX = (cw/2-14)/10;
        self.MAXCOVER = 1;
        window.setTimeout(function(){
          delete self.MAXCOVER;
        }, lasting);
        for(;i<10;i++){
          ;(function(i){
            window.setTimeout(function(){
              css.top = _my-(i+1)*_various+7 +"px";
              css.width = (i+1)*variousX + "px";
              css.height = (i+1)*_various + (i+1)*various_ +"px";
            }, i*lasting/10);
          })(i)
        }
      }
      css.visibility = "visible";
      css.zIndex = window[this.group].global.z_index-1;
      // css.backgroundColor = "grey";
      var mup =function(){
        var _cover = document.getElementById("window_maximize_cover"),
        callee = arguments.callee;
        if(_cover){
          self._halfWidthMax(e, _cover);
          _cover.parentNode.parentNode.removeChild(_cover.parentNode);
        }
        self.removeEvent(document, "mouseup", callee);
      };
      this.addEvent(document, "mouseup", mup);//鼠标抬起删除罩层
    }else if (document.getElementById("window_maximize_cover")&&e.pageX>15&&top>3) {//鼠标离开删除罩层
      var _cover = document.getElementById("window_maximize_cover");
      _cover.parentNode.parentNode.removeChild(_cover.parentNode);
    }else if (document.getElementById("window_maximize_cover")) {//改变罩层
      var css = document.getElementById("window_maximize_cover").style,
        b = document.body,
        bw = b.clientWidth-14,
        bh = b.clientHeight-14,
        cw = +css.width.replace("px",""),
        ch = +css.height.replace("px",""),
        lasting = 200,
        i=0;
      if(e.pageX<=15&&top<=3){
        if(cw>bw-10&&!self.MAXCOVER){//全屏
          self.MAXCOVER = 1;
          window.setTimeout(function(){
            delete self.MAXCOVER;
          }, lasting);
          for(;i<10;i++){
            ;(function(i){
              window.setTimeout(function(){
                css.width = (cw-(i+1)*bw/20) + "px";
                css.height = (ch-(i+1)*bh/20) + "px";
              }, i*lasting/10);
            })(i);
          }
        }else if(ch>bh-10&&!self.MAXCOVER){//半屏
          self.MAXCOVER = 1;
          window.setTimeout(function(){
            delete self.MAXCOVER;
          }, lasting);
          for(;i<10;i++){
            ;(function(i){
              window.setTimeout(function(){
                css.height = (ch-(i+1)*bh/20) + "px";
              }, i*lasting/10);
            })(i);
          }
        }
      }else if (e.pageX<=15&&top>3) {
        if(ch<bh/2+10&&!self.MAXCOVER){
          self.MAXCOVER = 1;
          window.setTimeout(function(){
            delete self.MAXCOVER;
          }, lasting);
          for(;i<10;i++){
            ;(function(i){
              window.setTimeout(function(){
                css.height = (ch+(i+1)*bh/20) + "px";
              }, i*lasting/10);
            })(i);
          }
        }
      }else if (e.pageX>15&&top<=3) {
        if(cw<bw/2+10&&!self.MAXCOVER){
          self.MAXCOVER = 1;
          window.setTimeout(function(){
            delete self.MAXCOVER;
          }, lasting);
          for(;i<10;i++){
            ;(function(i){
              window.setTimeout(function(){
                css.width = (cw+(i+1)*bw/20) + "px";
                css.height = (ch+(i+1)*bh/20) + "px";
              }, i*lasting/10);
            })(i);
          }
        }
      }
    }
    if(this.onDrag2) this.onDrag2(e);
    return true;
  };
  AnimateWin.prototype._halfWidthMax = function(e, cover){
    e.pageX = e.pageX || e.clientX + document.body.scrollLeft;
    if(e.pageX>=15)return;
    var css = this.win.style,
      win = this.win,
      b = document.body;
    if(+cover.style.height.replace("px","")<b.clientHeight/2+10){//四分一屏
      css.height = b.clientHeight/2+"px";
      css.width = b.clientWidth/2+"px";
      css.top = b.scrollTop+"px";
      css.left = b.scrollLeft+"px";
      if(this.top<0) this.top = 0;
      if(this.top>b.clientHeight-45) this.top = b.clientHeight - 45;
      this.onDrag2 = this._resetSize;
    }else if(+cover.style.width.replace("px","")<b.clientWidth-10){//半屏
      css.height = b.clientHeight+"px";
      css.width = b.clientWidth/2+"px";
      css.top = b.scrollTop+"px";
      css.left = b.scrollLeft+"px";
      if(this.top<0) this.top = 0;
      if(this.top>b.clientHeight-45) this.top = b.clientHeight - 45;
      this.onDrag2 = this._resetSize;
    }
  };
  AnimateWin.prototype._resetSize = function(e){
    var css = this.win.style,
      b = document.body;
    css.width = this.width +"px";
    css.height = this.height +"px";
    css.top = b.scrollTop +"px";
    this.onDrag2 = null;
  };
  AnimateWin.prototype.preMaximize = function(){
    if(!this.PREMAXIMIZE){
      if(!this.anWinPreMaximize())return;
      var self = this,
        win = this.win,
        css = win.style,
        b = document.body,
        bw = b.clientWidth,
        bh = b.clientHeight,
        left = bw*0.03,
        top = bh*0.03,
        lasting = 100,
        times = 10,
        t,
        i=0;
      for(;i<times;i++){
        ;(function(i){
          window.setTimeout(function(){
            t = (1-(i+1)/times);
            css.left = left*t +"px";
            css.top = top*t +"px";
            css.width = bw - left*t-10 +"px";
            css.height = bh - top*t-10 +"px";
          }, i*lasting/times);
        })(i);
      }
      var caller = arguments.callee.caller;
      window.setTimeout(function(){
        self.PREMAXIMIZE = true;
        caller.call(self, null);
        delete self.PREMAXIMIZE;
      }, lasting);
      return false;
    }else {
      return true;
    }
  };
  AnimateWin.prototype.preReMaximize = function(){
    if(!this.PREREMAXIMIZE){
      if(!this.anWinPreReMaximize())return;
      var win = this.win,
        css = win.style,
        b = document.body,
        bw = b.clientWidth,
        bh = b.clientHeight,
        left = this.left,
        top = this.top,
        self = this,
        lasting = 150,
        i=0;
      for(;i<10;i++){
        ;(function(i){
          window.setTimeout(function(){
            css.left = left -30 +30*(1+i)/10 +"px";
            css.top = top -30 +30*(1+i)/10  +"px";
          }, i*lasting/10);
        })(i);
      }
      window.setTimeout(function(){
        css.width = self.width+"px";
        css.height = self.height+"px";
      },10);
      var caller = arguments.callee.caller;
      window.setTimeout(function(){
        self.PREREMAXIMIZE = true;
        caller.call(self, null);
        delete self.PREREMAXIMIZE;
      }, lasting);
      return false;
    }else {
      return true;
    }
  };
  AnimateWin.prototype.preMinimize = function(){
    if(!this.PREMINIMIZE){
      if(!this.anWinPreMinimize())return;
      var win = this.win,
        css = win.style,
        b = document.body,
        bw = b.clientWidth,
        bh = b.clientHeight,
        left = this.left,
        top = this.top,
        height = this.height,
        width = this.width,
        aimLeft = bw*0.1,
        aimBottom = 0, x, y,
        self = this,
        lasting = 300,
        times = 20,
        i=0,
        btn = this.$(this.id+"_maximize");
      if(btn&&this.hasClass(btn, "max")){
        height = bh;
        width = bw;
        left = 0;
        top = 0;
      }
      y = bh -height -top -aimBottom;
      x = left -aimLeft;
      this.fadeOut(this.win, lasting*0.3, 0.7, function(){
        self.fadeOut(self.win, lasting*0.7, 0);
      });
      for(;i<times;i++){
        ;(function(i){
          window.setTimeout(function(){
            if(i<10){
              var t = (1+i*1.4)/times;
            }else {
              var t = 0.7 + (i-9)*0.03;
            }
            css.left = left -x*t +"px";
            css.top = top +(y+height/2)*t +"px";
            css.height = height*(1-t/2) +"px";
            css.width = width*(1-t/2) +"px";
          }, i*lasting/times);
        })(i);
      }
      var caller = arguments.callee.caller;
      window.setTimeout(function(){
        self.PREMINIMIZE = true;
        caller.call(self, null);
        delete self.PREMINIMIZE;
      }, lasting);
      return false;
    }else {
      return true;
    }
  };
  // AnimateWin.prototype.minimize = function(){
  //   console.log("implement minimize");
  // }
  AnimateWin.prototype.reMinimize = function(){
    if(!this.preReMinimize())return;
    this.pushToFront();
    var win = this.win,
      css = win.style,
      b = document.body,
      bw = b.clientWidth,
      bh = b.clientHeight,
      left = this.left,
      top = this.top,
      height = this.height,
      width = this.width,
      fromLeft = bw*0.1,
      fromBottom = 0, x, y, _x, _y,
      self = this,
      lasting = 150,
      times = 10,
      i=0,
      btn = this.$(this.id+"_maximize");
    y = bh -height -top -fromBottom;
    x = left -fromLeft;
    _x = Math.pow(2, -0.004*Math.abs(x)) *x;
    _y = Math.pow(2, -0.004*Math.abs(y)) *y;
    if(Math.abs(y)<50) _y= 50 *y/Math.abs(y);
    if(btn&&this.hasClass(btn, "max")){
      height = bh;
      width = bw;
      left = 0;
      top = 0;
      _x = -bw*0.08;
      _y = 20;
    }
    for(;i<times;i++){
      ;(function(i){
        window.setTimeout(function(){
          var t = (1+i)/times;
          css.left = left -_x +_x*t +"px";
          css.top = top +_y +height*0.15*(1-t) -_y*(1+i)/times  +"px";
          css.height = height*0.85 +(height*0.15)*t +"px";
          css.width = width*0.85 +(width*0.15)*t +"px";
        }, i*lasting/times);
      })(i);
    }
    window.setTimeout(function(){
      self.fadeIn(self.win, lasting, 1);
    }, 20);
    window.setTimeout(function(){
      self.postReMinimize();
    }, lasting+50);
    return false;
  };
  AnimateWin.prototype.postMinimize = function(){
    this.pushToHead();
  };

  AnimateWin.prototype.setOpacity = function(ev, v){
    ev.filters ? ev.style.filter = 'alpha(opacity=' + v*100 + ')' : ev.style.opacity = v;
  };
  AnimateWin.prototype.getOpacity = function(elem){
    if(elem.filters) {
      var f = elem.style.filter;
      if(f==="")
        return 1;
      return +f.match(/opacity=(\d{1,3})[),]/)[1]/100;
    }
    (o=(elem.style.opacity))==="" ? o=1 : o=+o;
    return o;
  };
  AnimateWin.prototype.fadeIn = function(elem, lasting, opacity, callback){
    var self = this;
    lasting = lasting || 300;
    opacity = opacity || 1;
    elem.style.display = 'block';
    var now_op = self.getOpacity(elem);
    if(opacity<=now_op){
      if(opacity!=now_op&&self.fadeOut)self.fadeOut(elem, lasting, opacity);
      return;
    }
    if(lasting<20){
      self.setOpacity(elem, opacity);
      return;
    }
    var val = now_op,
      frameLast = 20,
      various = (opacity-val)*frameLast/lasting;
    if(opacity!=1&&various>1-opacity){
      if(opacity>=0.96)opacity=0.96;
      various = (1-opacity)-0.01;
      frameLast = various*lasting/(val-opacity);
    }
    val += various;
    ;(function(){
      self.setOpacity(elem, val);
      val += various;
      if (val <= opacity) {
        window.setTimeout(arguments.callee, frameLast);
      }else {
        self.setOpacity(elem, opacity);
        if(callback)callback();
      }
    })();
  },
  AnimateWin.prototype.fadeOut = function(elem, lasting, opacity, callback){
    var self=this;
    lasting = lasting || 300;
    opacity = opacity || 0;
    var now_op = self.getOpacity(elem);
    if(opacity>=now_op){
      if(opacity!=now_op&&self.fadeIn) self.fadeIn(elem, lasting, opacity);
      return;
    }
    if(lasting<20){
      self.setOpacity(elem, opacity);
      return;
    }
    var val = now_op,
      frameLast = 20,
      various = (val-opacity)*frameLast/lasting;
    if(opacity!=0&&various>opacity) {
      if(opacity<=0.03)opacity=0.03;
      various = opacity-0.01;
      frameLast = various*lasting/(val-opacity);
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
        if(callback)callback();
      }else {
        self.setOpacity(elem, opacity);
        if(callback)callback();
      }
    })();
  };
  window["AnimateWin"] = AnimateWin;
})();
