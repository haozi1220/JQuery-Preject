(function($){
    function Dialog(options){

        options = options || {} ;
        defaults = {
            title:options.title || "这是一个弹框" ,
            content:options.content || "请输入要弹出的内容" ,
        }

        var dialogObj = {
            html:function (){
                return $('<div id="box"><h2 id="title">'+defaults.title+'<span id="close">X</span></h2><div id="content">'+defaults.content+'</div><div id="footer"><span id="sure">确定</span><span id="cancle">取消</span></div></div>').appendTo("body") ; 
            },
            init:function (){
                var obj = {
                    limit:true ,
                    moveObj:"#box" 
                }
                $("#box h2").drag(obj) ;
            },
            addEvent:function (){
                $("#close").on("click",function(){
                    $("div").remove("#box") ;
                })
                $("#cancle").on("click",function(){
                    $("div").remove("#box") ;
                })
            }
        }
        dialogObj.html() ;
        dialogObj.init() ;
        dialogObj.addEvent() ;
    }

    $.fn.dialog = function (options){
        new Dialog(options) ;
    }
})(jQuery)

