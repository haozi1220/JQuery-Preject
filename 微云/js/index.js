/***********右边文件区***************/
window.onload=function(){
    var content = tools.$('.content')[0];
    var right_main=document.getElementsByClassName('content_right_right_main')[0];
    var allDiv_right=right_main.getElementsByTagName('div');
    var alertDialog = tools.$('.alertDialog')[0];
    /******************根据数据生成结构函数*************/
    function creatHtml(data){
        var newDiv=document.createElement('div');
        newDiv.innerHTML='<span></span><i class="icon file"></i><p>'+data.title+'</p>';
        newDiv.setAttribute("data-file-id",data.id);          //为新的div设置class
        return newDiv;
    }
    /***********************新建文件夹函数*****************************/
    function newHtml(){
        var newDiv=document.createElement('div');
        newDiv.innerHTML='<span></span><i class="icon file"></i><input type="text" value="" style="border:1px solid blue;background:#fff;"/>';
        var text=newDiv.getElementsByTagName('input')[0];//获取input 
        return newDiv;
    };
    /**************************封装span点击函数***************************************/
    function spanClick(obj){
        var span=obj.firstElementChild;//获取传入参数的第一个子级label
        span.status=true;              //设置label自身的开关
        span.onclick=function(){
            if(this.status){
                obj.className="divactive"; //设置传入div的className
                this.className="active2";//设置label的className
            }else{
                obj.className="";
                this.className="";      //清空className
            }
            whoSelect(this);
            this.status=!this.status;       //重置开关
        }
    }
    /********************************封装谁被选中函数********************************************/
    var arr=[];         //定义一个空数组，用来存放被选中的label
    function whoSelect(obj2){
        console.log(obj2);
        if(obj2.status){
            arr.push(obj2.parentNode);  //obj2的父级给push进数组
        }else{
            arr.pop(obj2.parentNode);   //如果没被选中就把obj2的父级删除
        }
        console.log(arr);
        //判断被选中的元素的长度
        if(arr.length===allDiv_right.length){
            checkAllState();        //调用checkAll的状态函数
        }else{
            checkAllState2();
        }
        return arr;
    }
    /********************清除状态函数***************************/
    function clearState(){
        checkAll.className="";
        for(var i=0;i<allDiv_right.length;i++){
            allDiv_right[i].className="";
            allDiv_right[i].firstElementChild.className="";//清空span的class
            allDiv_right[i].firstElementChild.status=true;//每个span的开关设为真
            arr.pop(allDiv_right[i]);       //把数组中所有的div删除掉。把length归零
        }
    }
    /***********************封装框选函数****************************/
    function getRect(obj){
        return obj.getBoundingClientRect();
    }
    function duang(obj1,obj2){
        var obj1Info = getRect(obj1);   
        var obj2Info = getRect(obj2);   
        //obj1的上下左右
        var obj1L = obj1Info.left;
        var obj1R = obj1Info.right;
        var obj1T = obj1Info.top;
        var obj1B = obj1Info.bottom;
        //obj2的上下左右
        var obj2L = obj2Info.left;
        var obj2R = obj2Info.right;
        var obj2T = obj2Info.top;
        var obj2B = obj2Info.bottom;
        //排除掉没碰上的区域
        if( obj1R < obj2L || obj1L > obj2R || obj1B < obj2T || obj1T > obj2B){
            return false;
        }else{
            return true;
        }
    }
    /****************************checkAll的状态函数********************************/
    function checkAllState(){
        checkAll.className="active3";
        checkAll.checked=true;      //长度相等时全选按钮被选中
        checkAll.status=false;
    }
    function checkAllState2(){
        checkAll.className="";
        checkAll.checked=false;      //长度相等时全选按钮被选中
        checkAll.status=true;
    }


    /**************************弹出阴影层和询问提示框函数******************************/
    function popup (argument) {
        //弹出提示框和阴影层
        var shadow = tools.$('#shadow');        //获取阴影层
        var login = tools.$('#login');          //获取询问框
        var sure = tools.$('#sure');            //获取确定键
        var abolish = tools.$('#abolish');      //获取取消键
        var closeBtn = tools.$('.closeBtn')[0];    //获取关闭按钮
        shadow.style.display = 'block';
        login.style.display = 'block';
        Drag (login) ;                    //调用拖动函数
        //点击取消按钮或者关闭按钮
        abolish.onclick = closeBtn.onclick = function  (argument) {
            // 阴影层和询问框消失
            shadow.style.display = 'none';
            login.style.display = 'none';
        }
        //点击确定按钮
        sure.onclick = function  (argument) {
            delectData();                               //调用删除数据函数
            //隐藏阴影层和询问框
            shadow.style.display = 'none';
            login.style.display = 'none';
            checkAllState2();       //重置全选按钮的状态
            //顶部提示框的状态
            alertDialog.innerHTML="<img src="+'image/delect.png'+">" ;
            MTween(alertDialog,{top:0},500,"linear",function(){
                setTimeout(function(){
                     MTween(alertDialog,{top:-32},500,"linear");    //定时延迟，收回小提示框
                }, 1000); 
            });  
        }
    }
    /****************************删除数据函数****************************/
    function delectData (argument) {
        for(var j=0;j< arr.length;j++){
            var allDivId = arr[j].getAttribute('data-file-id') ;    //获取被选中元素的id
            data.files.forEach(function  (elem , index) {           //循环数据中的files
                if(elem.id == allDivId) {
                    data.files.splice(index,1);              //找出相同的id让从数据中删除对应的数据
                    right_main.removeChild(arr[j]);
                }
            });
        }
    }
    /**************************************询问框拖动函数************************************/
    function Drag (dragElement) {
        // 给拖动元素添加down事件处理
        dragElement.onmousedown = function (ev) {
            //计算很出鼠标距离被拖动元素的左边和上边距离
            var disX = ev.clientX - dragElement.offsetLeft ;
            var disY = ev.clientY - dragElement.offsetHeight ;
            //在document下移动过程中
            document.onmousemove = function (ev) {
                
                //计算被拖动元素在document中的实时坐标位置
                var l = ev.clientX - disX ;
                var t = ev.clientY - disY ;

                dragElement.style.left = l + "px" ;
                dragElement.sytle.top = t + "px" ;
            }
        }
    }

/*******************************功能实现区***************************************/
    //循环数据渲染已有结构
    for(var i=0;i<data.files.length;i++){
        if(data.files[i].pid===0){
            right_main.appendChild(creatHtml(data.files[i]));
        }    
    };
    //给每一个div添加点击处理
    for(var i=0;i<allDiv_right.length;i++){
        spanClick(allDiv_right[i]);
    }
    //点击新建按钮
    var right_top=document.getElementsByClassName('content_right_top')[0];
    var allLi=right_top.getElementsByTagName('li');
    var len=allLi.length;                           //定义len用于给新建的div不同的id
    allLi[5].onmouseup=function(ev){
        var Div=newHtml();  
        right_main.appendChild(Div); 
        var text=Div.getElementsByTagName('input')[0];
        text.focus();           //给输入框获取焦点
        this.a=true;
        text.onblur=function(){
            if(text.value==""){
                right_main.removeChild(Div);
                return ;                    //组织程序继续运行
            }else{
                //新建的同时，新建一条数据放进数据中，新生成的div的id是新数据的id
                var obj={
                    'id':++len,
                    'pid':0,
                    'title':text.value,
                    'type':"file"
                }
                data.files.push(obj);                       //把新的数据添加进整个data.files中
                //生成的div的innerHTML
                Div.innerHTML='<span></span><i class="icon file"></i><p>'+obj.title+'</p>';
                Div.setAttribute("data-file-id",obj.id);        //给新建的文件设置id

                //新建成功后顶部小提示框的处理
                alertDialog.innerHTML="<img src="+'image/create.png'+">" ;  //新建文件夹成功后提示框内容
                MTween(alertDialog,{top:0},500,"linear",function(){
                    setTimeout(function(){
                         MTween(alertDialog,{top:-32},500,"linear");
                    }, 1000); 
                });

                //
                clearState();                                   //调用清除状态函数
                spanClick(Div);                                 //调用span的点击函数
                checkAll.checked=false;
                checkAll.status=true;
            } 
            allLi[5].a=false;
        }
    }
    //点击全选按钮
    var contentRight=document.getElementsByClassName('content_right_right_top')[0];
    var checkAllp=contentRight.getElementsByTagName('p')[0];
    var checkAll=checkAllp.getElementsByTagName('a')[0];
    checkAll.status=true; 
    checkAll.onclick=function(){
        //循环所有的div
        for(var i=0;i<allDiv_right.length;i++){
            var span=allDiv_right[i].firstElementChild;
            if(checkAll.status){
                this.className="active3";       //给全选按钮添加className
                arr.push(allDiv_right[i]);            //把所有被选中的div push进数组
                allDiv_right[i].className="divactive";   //设置传入div的className
                span.className="active2";//设置span的className
                span.status=false;
            }else{
                arr.pop(allDiv_right[i]);   //把所有的div 给pop出数组
                this.className="";          //清空全选按钮的class
                allDiv_right[i].className="";//每个div的class也清空
                span.className="";           //清空每个span的class
                span.status=true;
            }
        }
        checkAll.status=!checkAll.status;
    }
    /***************框选***********************/
    //在document下鼠标按下时
    document.onmousedown=function(ev){
        if(allLi[5].a) return;
        //定义个新的div
        var newDiv=null;
        var disX=ev.clientX;        //获取鼠标按下时的left值
        var disY=ev.clientY;        //获取鼠标按下时的top值
        //在document下鼠标移动时的事件处理
        document.onmousemove=function(ev){
            //给新生的div规定最小的显示区域，如果小于这个最小区域则不出现
            if(Math.abs(ev.clientX-disX)>20 || Math.abs(ev.clientY-disY)>20){
                //为了防止生成多个div，在此做一下判断
                if(!newDiv){
                    newDiv = document.createElement("div"); //新创建div
                    newDiv.className = "dialog";            //给新的div添加类
                    newDiv.style.left = disX + "px";        
                    newDiv.style.top = disX + "px";         //新的div开始的位置
                    document.body.appendChild(newDiv);      //把新的div插入到document中
                }
                newDiv.style.width = Math.abs(ev.clientX - disX) + "px";    //新div的宽
                newDiv.style.height = Math.abs(ev.clientY - disY) + "px";   //新div的高
                newDiv.style.left = Math.min(ev.clientX , disX)+1 + "px"; 
                newDiv.style.top = Math.min(ev.clientY , disY)+1 + "px";//两者取最小值作为最后的定位值
                //for循环所有的div，进行框选碰撞
                for(var i=0;i<allDiv_right.length;i++){
                    if(duang(newDiv,allDiv_right[i])){
                        allDiv_right[i].className="divactive"; //设置传入div的className
                        allDiv_right[i].firstElementChild.className="active2";//设置label的className
                        allDiv_right[i].firstElementChild.status=false;
                    }else{
                        //重置所有的状态
                        allDiv_right[i].className=""; 
                        allDiv_right[i].firstElementChild.className="";
                        allDiv_right[i].firstElementChild.status=true;
                    }
                }
                for(var j=0;j< allDiv_right.length;j++){
                    var checkDiv=tools.$('.divactive');
                    if(checkDiv.length===allDiv_right.length){
                        checkAllState();
                    }else{
                        checkAllState2();
                    }
                    arr.push(allDiv_right[j]) ;         //把选中的元素push进数组
                }
            }
        }
        document.onmouseup = function (){
            document.onmousemove = null;
            if( newDiv ){
                document.body.removeChild(newDiv);
            }
        }
        ev.preventDefault();    //清除浏览器的默认行为
    }
/**************************点击删除********************************/
/*
    判断有没有选中元素，有选中元素时才可以执行删除,没有选中元素则顶部的小提示框显示出来并显示相应的
    提示内容
        如果有选中元素：则弹出删除提示框询问是否删除文件
            1.点击确定之后才可以删除选中的文件
            2.点击关闭或者取消之后则不删除元素    
 */
    //点击删除按钮
    allLi[4].onclick = function (){
        if(arr.length===0){                 //没有被选中的元素
            alertDialog.innerHTML="<img src="+'image/tip1.jpg'+">" ; 
             MTween(alertDialog,{top:0},500,"linear",function(){
                setTimeout(function(){
                     MTween(alertDialog,{top:-32},500,"linear");    //定时延迟，收回小提示框
                }, 1000); 
            });   
        }else{                      //有选中元素的时候
            popup();
        }
    }





















}

