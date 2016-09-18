(function ($){
    function Drag(element,options){
        //传过来的对象需要深克隆一份
        /*
            limit:是否可以拖出可视区范围
                true ：不可以拖出
                false : 可以拖出可视区(默认)
         */
        //给拖动插件设置默认
        this.defaults = {
            limit:false             //默认可以拖出可视区
        }
        //深克隆一份传过来的options 
        $.extend(true,this.defaults,options) ;
        //$.isPlainObject(this.defaults.x) jquery下的判断是否是一个对象函数
        /*
            如果有自定义的拖动范围，x , y是两个对象，更改默认的limit
         */
        if( $.isPlainObject(this.defaults.x) || $.isPlainObject(this.defaults.y) ){
            this.defaults.limit = false ;
        }

        this.element = element ;
        //拖拽的目标是不是要移动的目标或者另外一个元素移动
        this.target = this.defaults.moveObj && $(this.defaults.moveObj) || this.element ; 
        this.disX = this.disY = 0 ;
        this.dragStatus = 0 ; //初始化拖动状态，只调用，状态为0
        this.init() ;  
    }
    //drag原型
    Drag.prototype = {
        constructor:Drag ,
        //初始化函数
        init:function (){
            //要改变this.downFn这个函数中的this指向,指向构造函数中this，
            //把this.downFn中this改变成当前init中的this
            this.element.on("mousedown",$.proxy(this.downFn,this)) ;//改变this指向
        },
        downFn:function (ev){
            this.disX = ev.pageX - this.target.offset().left ;
            this.disY = ev.pageY - this.target.offset().top ;
            //开始拖拽，this.dragStatus状态为1
            this.dragStatus = 1 ;
            //调用状态改变函数
            this.dragChangeStatusFn() ;
            $(document).on('mousemove',$.proxy(this.moveFn,this));
            $(document).on('mouseup',$.proxy(this.upFn,this));
            ev.preventDefault() ;

        },
        moveFn:function (ev){

            this.dragStatus = 2 ; //正在拖拽的状态设为2
            this.x = ev.pageX - this.disX ;
            this.y = ev.pageY - this.disY ;

            this.limitFn() ;        //限制范围函数
            this.target.css({
                left:this.x,
                top:this.y ,
            });
            this.dragChangeStatusFn() ;
        },
        upFn:function (){
            //清除移动和鼠标抬起事件处理
            $(document).off('mousemove',this.moveFn);   
            $(document).off('mouseup',this.upFn);

            this.dragStatus = 3 ; //拖拽完成状态为3
            this.dragChangeStatusFn() ;
        },
        //状态改变函数
        dragChangeStatusFn:function (){
            switch( this.dragStatus ){
                case 1:
                    this.element.trigger("dragStart");
                break;
                case 2:
                    this.element.trigger("dragMove");
                break;
                case 3:
                    this.element.trigger("dragOver");
                break;
            }
        },
        //限制范围函数
        limitFn:function (){
            var minX = 0,maxX = 0 ,minY = 0,maxY = 0;
            if( this.defaults.limit ){
                var clientW = $(window).width();
                var clientH = $(window).height();

                minX = 0;
                minY = 0;
                //元素的宽度
                maxX = clientW - this.element.outerWidth();
                maxY = clientH - this.element.outerHeight();
            }
            if( $.isPlainObject(this.defaults.x) ){
                minX = this.defaults.x.min;
                maxX = this.defaults.x.max;
            }
            if( $.isPlainObject(this.defaults.y) ){
                minY = this.defaults.y.min;
                maxY = this.defaults.y.max;
            }

            

            if( this.x < minX  ){
                this.x = minX;
            }
            if( this.x > maxX ){
                this.x = maxX;
            }
            if( this.y < minY  ){
                this.y = minY;
            }
            if( this.y > maxY  ){
                this.y = maxY;
            }   
        }
    }


    $.fn.drag = function (options){
        new Drag(this,options);
    }
})(jQuery) ;

