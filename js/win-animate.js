;(function(){
  var AnimateWin = function(obj){
    //阻止已实现方法向上传递
    var bf = function(){return true};
    this.anWinPreClose = obj.preClose|| this.anWinPreClose ||bf;
    this.anWinOnDrag = obj.onDrag|| this.anWinOnDrag ||bf;
    this.anWinOnDragMouseUp = obj.onDragMouseUp|| this.anWinOnDragMouseUp ||bf;
    this.anWinPreMaximize = obj.onMaximize|| this.anWinPreMaximize ||bf;
    this.anWinPreReMaximize = obj.preReMaximize|| this.anWinPreReMaximize ||bf;
    this.anWinPreMinimize = obj.preMinimize|| this.anWinPreMinimize ||bf;
    this.preReMinimize = obj.preReMinimize|| this.preReMinimize ||bf;
    obj.onMinimize = null;
    obj.onMaximize = null;
    obj.onDragMouseUp = null;
    obj.onDrag = null;
    obj.preClose = null;
    Win.call(this, obj)
  };
  AnimateWin.prototype = Object.create(Win.prototype)
  AnimateWin.prototype.preClose = function(){
    if(!this.anWinPreClose()) return;
    var self = this,
      g = window[this.group].global;
    if(!g.an_fadeCloseFlag){
      var css = this.win.style,
        c_css = this.content.style,
        width, height, left, top,
        lasting = 150;
        i=0;
      this.fadeOut(this.win, lasting, 0);
      if(this.hasClass(this.$(this.id+"_maximize"), "max")){
        var b=document.body
        width = b.clientWidth;
        height = b.clientHeight;
        left = 0;
        top = 0;
      }else {
        width = self.width;
        height = self.height;
        left = self.left;
        top = self.top;
      }
      for(;i<10;i++){
        ;(function(i){
          var i = i;
          window.setTimeout(function(){
            css.width = width*(100-1*(i+1))/100 +"px";
            css.left = left+ (width-(+css.width.replace("px","")))/2 +"px";
            css.height = height*(100-1*(i+1))/100 +"px";
            css.top = top+ (height-(+css.height.replace("px","")))/2 +"px";
            c_css.height = +css.height.replace("px","")-29 + "px";
          }, (i+1)*lasting/11)
        })(i)
      }
      var caller = arguments.callee.caller;
      window.setTimeout(function(){
        g.an_fadeCloseFlag = 1;
        caller.call(self, null);
        g.an_fadeCloseFlag = 0;
      }, lasting)
      return false;
    }
    return true;
  };
  AnimateWin.prototype.onDrag = function(e, left, top) {
    if(!this.anWinOnDrag(e, left, left)) return;
    if((top<-10||e.pageX<3)&&!document.getElementById("window_maximize_cover")){
      var g = window[this.group].global;
      if(!g.an_maxCoverFlag){
        g.an_maxCoverFlag = 1;
        var cover = document.createElement("div"),
          b = document.body;
        cover.innerHTML = '<div class="window-animate maximize-cover" id="window_maximize_cover"><div class="cover-inner"></div></div>';
        b.appendChild(cover);
        cover = document.getElementById("window_maximize_cover");
        var css = cover.style;
        if(top<=-10){
          var cw = b.clientWidth,
            vh = b.clientHeight,
            _mx = e.pageX-7,
            mx_ = cw -_mx-7,
            lasting = 200,
            i=0;
          if(_mx>cw) _mx=cw-7
          else if(_mx<0) _mx=7
          var _various = _mx/10,
            various_ = mx_/10,
            variousY = (vh-14)/10;
          g.an_maxCoverChanging = 1;
          window.setTimeout(function(){
            g.an_maxCoverChanging = null;
          }, lasting);
          for(;i<10;i++){
            ;(function(i){
              window.setTimeout(function(){
                css.left = _mx-(i+1)*_various+7 +"px";
                css.width = (i+1)*_various + (i+1)*various_-7 +"px";
                css.height = (i+1)*variousY + "px";
              }, i*lasting/10)
            })(i)
          }
        }else if(e.pageX<=3&&top>-10){
          var cw = b.clientWidth,
            vh = b.clientHeight,
            mx_ = cw/2-7,
            _my = e.pageY-7,
            my_ = vh-_my-14,
            lasting = 200,
            i=0;
          if(_my>vh) _my=vh-7
          else if(_my<0) _my=7
          var _various = _my/10,
            various_ = my_/10,
            variousX = (cw/2-14)/10;
          g.an_maxCoverChanging = 1;
          window.setTimeout(function(){
            g.an_maxCoverChanging = null;
          }, lasting);
          for(;i<10;i++){
            ;(function(i){
              window.setTimeout(function(){
                css.top = _my-(i+1)*_various+7 +"px";
                css.width = (i+1)*variousX + "px";
                css.height = (i+1)*_various + (i+1)*various_ +"px";
              }, i*lasting/10)
            })(i)
          }
        }
        css.visibility = "visible";
        css.zIndex = g.z_index-1;
        document.addEventListener("mouseup",function(){
          var _cover = document.getElementById("window_maximize_cover"),
            callee = arguments.callee;
          if(_cover){
            _cover = _cover.parentNode;
            _cover.parentNode.removeChild(_cover);
            removeCallee = arguments.callee;
          }
          document.removeEventListener("mouseup", callee);
          g.an_maxCoverFlag = 0;
        },false);
      }
    }else if (document.getElementById("window_maximize_cover")&&e.pageX>15&&top>3) {
      var _cover = document.getElementById("window_maximize_cover").parentNode;
      _cover.parentNode.removeChild(_cover);
      window[this.group].global.an_maxCoverFlag = 0;
    }else if (document.getElementById("window_maximize_cover")) {
      var g = window[this.group].global,
        css = document.getElementById("window_maximize_cover").style,
        b = document.body,
        bw = b.clientWidth-14,
        bh = b.clientHeight-14,
        cw = +css.width.replace("px",""),
        ch = +css.height.replace("px",""),
        lasting = 200,
        i=0;
      if(e.pageX<=15&&top<=3){
        if(cw>bw-10&&!g.an_maxCoverChanging){//全屏
          g.an_maxCoverChanging = 1;
          window.setTimeout(function(){
            g.an_maxCoverChanging = null;
          }, lasting);
          for(;i<10;i++){
            ;(function(i){
              window.setTimeout(function(){
                css.width = (cw-(i+1)*bw/20) + "px";
                css.height = (ch-(i+1)*bh/20) + "px";
              }, i*lasting/10)
            })(i)
          }
        }else if(ch>bh-10&&!g.an_maxCoverChanging){//半屏
          g.an_maxCoverChanging = 1;
          window.setTimeout(function(){
            g.an_maxCoverChanging = null;
          }, lasting);
          for(;i<10;i++){
            ;(function(i){
              window.setTimeout(function(){
                css.height = (ch-(i+1)*bh/20) + "px";
              }, i*lasting/10)
            })(i)
          }
        }
      }else if (e.pageX<=15&&top>3) {
        if(ch<bh/2+10&&!g.an_maxCoverChanging){
          g.an_maxCoverChanging = 1;
          window.setTimeout(function(){
            g.an_maxCoverChanging = null;
          }, lasting);
          for(;i<10;i++){
            ;(function(i){
              window.setTimeout(function(){
                css.height = (ch+(i+1)*bh/20) + "px";
              }, i*lasting/10)
            })(i)
          }
        }
      }else if (e.pageX>15&&top<=3) {
        if(cw<bw/2+10&&!g.an_maxCoverChanging){
          g.an_maxCoverChanging = 1;
          window.setTimeout(function(){
            g.an_maxCoverChanging = null;
          }, lasting);
          for(;i<10;i++){
            ;(function(i){
              window.setTimeout(function(){
                css.width = (cw+(i+1)*bw/20) + "px";
                css.height = (ch+(i+1)*bh/20) + "px";
              }, i*lasting/10)
            })(i)
          }
        }
      }
    }
    if(this.onDrag2) this.onDrag2(e);
    return true;
  }
  AnimateWin.prototype.onDragMouseUp = function(e){
    this.anWinOnDragMouseUp(e);
    this.halfWidthMax(e);
  }
  AnimateWin.prototype.halfWidthMax = function(e){
    if(e.pageX>=15)return;
    var css = this.win.style,
      win = this.win,
      b = document.body,
      cover = document.getElementById("window_maximize_cover");
    if(cover&&+cover.style.height.replace("px","")<b.clientHeight/2+10){//四分一屏
      css.height = b.clientHeight/2+"px";
      css.width = b.clientWidth/2+"px";
      css.top = b.scrollTop+"px";
      css.left = b.scrollLeft+"px";
      this.content.style.height = (win.clientHeight-29)+"px";
      if(this.top<0) this.top = 0;
      if(this.top>b.clientHeight-45) this.top = b.clientHeight - 45;
      this.onDrag2 = this.resetSize;
    }else if(cover&&+cover.style.width.replace("px","")<b.clientWidth-10){//半屏
      css.height = b.clientHeight+"px";
      css.width = b.clientWidth/2+"px";
      css.top = b.scrollTop+"px";
      css.left = b.scrollLeft+"px";
      this.content.style.height = (win.clientHeight-29)+"px";
      if(this.top<0) this.top = 0;
      if(this.top>b.clientHeight-45) this.top = b.clientHeight - 45;
      this.onDrag2 = this.resetSize;
    }
  }
  AnimateWin.prototype.resetSize = function(e){
    var css = this.win.style,
      b = document.body;
    css.width = this.width +"px";
    css.height = this.height +"px";
    this.content.style.height = (this.height-29)+"px";
    css.top = b.scrollTop +"px";
    this.onDrag2 = null;
  }
  AnimateWin.prototype.preMaximize = function(e){
    if(!this.anWinPreMaximize())return;
    var self = this,
      g = window[this.group].global;
    if(!g.an_maximizeFlag){
      var win = this.win,
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
            t = (1-(i+1)/times)
            css.left = left*t +"px";
            css.top = top*t +"px";
            css.width = bw - left*t-10 +"px";
            css.height = bh - top*t-10 +"px";
            self.$(self.id+"_content").style.height = bh - top*t-10 -29 +"px";
          }, i*lasting/times)
        })(i)
      }
      var caller = arguments.callee.caller;
      window.setTimeout(function(){
        g.an_maximizeFlag = 1;
        caller.call(self, e);
        g.an_maximizeFlag = 0;
      }, lasting)
      return false;
    }else {
      return true;
    }
  }
  AnimateWin.prototype.preReMaximize = function(){
    if(!this.anWinPreReMaximize())return;
    var g = window[this.group].global;
    if(!g.an_maximizeFlag){
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
          }, i*lasting/10)
        })(i)
      }
      window.setTimeout(function(){
        css.width = self.width+"px";
        css.height = self.height+"px";
        self.$(self.id+"_content").style.height = self.height-29 +"px";
      },10)
      var caller = arguments.callee.caller;
      window.setTimeout(function(){
        g.an_maximizeFlag = 1;
        caller.call(self, null);
        g.an_maximizeFlag = 0;
      }, lasting)
      return false;
    }else {
      return true;
    }
  }
  AnimateWin.prototype.preMinimize = function(){
    if(!this.anWinPreMinimize())return;
    var g = window[this.group].global;
    if(!g.an_preMinimizeFlag){
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
        lasting = 200,
        times = 15,
        i=0,
        btn = this.$(this.id+"_maximize");
      if(this.hasClass(btn, "max")){
        height = bh;
        width = bw;
        left = 0;
        top = 0;
      }
      y = bh -height -top -aimBottom;
      x = left -aimLeft;
      this.fadeOut(this.win, lasting, 0);
      for(;i<times;i++){
        ;(function(i){
          window.setTimeout(function(){
            var t = (1+i)/times;
            css.left = left -x*t +"px";
            css.top = top +(y+height/2)*t  +"px";
            css.height = height*(1-t/2) +"px";
            css.width = width*(1-t/2) +"px";
            self.$(self.id+"_content").style.height = height*(1-t/2) -29 +"px";
          }, i*lasting/times)
        })(i)
      }
      var caller = arguments.callee.caller;
      window.setTimeout(function(){
        g.an_preMinimizeFlag = 1;
        caller.call(self, null);
        g.an_preMinimizeFlag = null;
      }, lasting)
      return false;
    }else {
      return true;
    }
  }
  // AnimateWin.prototype.minimize = function(){
  //   console.log("implement minimize");
  // }
  AnimateWin.prototype.reMinimize = function(){
    if(!this.preReMinimize())return;
    this.reorder();
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
      lasting = 200,
      times = 10,
      i=0,
      btn = this.$(this.id+"_maximize");
    y = bh -height -top -fromBottom;
    x = left -fromLeft;
    _x = Math.pow(2, -0.004*Math.abs(x)) *x;
    _y = Math.pow(2, -0.004*Math.abs(y)) *y;
    if(Math.abs(y)<50) _y= 50 *y/Math.abs(y)
    if(this.hasClass(btn, "max")){
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
          css.left = left -_x +_x*(1+i)/times +"px";
          css.top = top +_y +height*0.15*(1-(1+i)/times) -_y*(1+i)/times  +"px";
          css.height = height*0.85 +(height*0.15)*(1+i)/times +"px";
          css.width = width*0.85 +(width*0.15)*(1+i)/times +"px";
          self.$(self.id+"_content").style.height = height*0.85 +(height*0.15)*(1+i)/times -29 +"px";
        }, i*lasting/times)
      })(i)
    }
    window.setTimeout(function(){
      self.fadeIn(self.win, lasting, 1);
    }, 20)
    return false;
    window.setTimeout(function(){
      self.postReMinimize();
    }, lasting+50)
  }
  window["AnimateWin"] = AnimateWin;
})()
