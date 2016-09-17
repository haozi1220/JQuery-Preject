/*************************声明变量区域********************/
(function(){
    var weiyunContent = tools.$(".content")[0] ;                                      //获取大的容器content
    var header = tools.$(".wy_top")[0] ;                                        //获取头部容器
    var fileContent = tools.$(".content_right_right_main")[0] ;                 //获取文件区域容器
    var datas = data.files ;                                                    //得到数据
    var create = tools.$('.create')[0];                                         //获取新建按钮
    //找到指定ID下所有的子级
    //初始化第一层数据id为0
    var initId = 0;
    //获取导航区域容器
    var pathNav = tools.$('.right_top_nav')[0];
    var treeMenu = tools.$(".content_right_left")[0];                           //获取左侧树形菜单容器

    //找到所有的树形菜单的标题 div tree-title
    var treeTitle = tools.$(".tree-title");
    var prevId=0;                            //初始一个变量为0，存储上一个id

    var checkboxs = tools.$('.checkbox',fileContent);                           //获取所有的单选按钮
    var checkedAll = tools.$('.checkedAll')[0] ;                                //获取全选按钮
    var fileItems = tools.$('.file-item',fileContent) ;                         //找到所有的文件

    var fullTipBox = tools.$(".full-tip-box")[0];                               //获取提示框
    var fullText = tools.$(".text",fullTipBox)[0];                              //获取提示框的编辑框 

    //框选变量
    var newDiv = null;
    var disX = disY = 0;

    var delect = tools.$('.delect')[0] ;                                        //获取删除按钮
    var reName = tools.$('.reName')[0] ;                                        //获取重命名按钮

    var move = tools.$('.move')[0] ;                                            //获取移动按钮

    var shadowDrag = null ;                                                     //拖拽文件夹时的透明层
    var isDrag = false ;                                                        //是否有剪影
    var pengObj = null ;                                                        //碰上的元素初始设为null
    var tips = null ;

    var gEmpty = tools.$(".g-empty")[0] ;                                       //获取空文件提示容器

    var menuList = tools.$("#menuList") ;                                       //获取右键菜单
    var menuList_li = tools.$("li",menuList) ;                                           //获取右键菜单里的所有li

    var shadow = tools.$("#shadow") ;                   //获取阴影遮罩
    















/*************************************函数区域**********************************************/   
//---------------------------------------屏幕自适应宽高函数
    function changeHeight (){
         var clinetH = tools.view().H;  //可视区的高
         weiyunContent.style.height = clinetH - header.offsetHeight + "px"; 
    }
//--------------------------------------新建文件成功函数
    function creatFileOk (){
        var first = fileContent.firstElementChild;
        var fileTitle = tools.$(".file-title",first)[0];
        var fileEdtor = tools.$(".file-edtor",first)[0];
        var edtor = tools.$(".edtor",first)[0];

        var edtorVal = edtor.value.trim();              //编辑框的value值

        //导航中最后一个元素
        var pathNavLast = tools.$("span",pathNav)[0];
        var pid = pathNavLast.dataset.fileId;
        //console.log(pathNavLast,pid);
        if( edtorVal === "" ){                      //新建不成功
            fileContent.removeChild(first);         //不成功则把文件从文件区域删除
            emptyFile() ;                           //文件区域没有文件时调用
        }else if(dataAction.reName(datas,pid,edtorVal)){
            fileContent.removeChild(first);     //新建文件名跟已有文件不能重名
        }else{ //新建成功
            fileTitle.innerHTML = edtorVal;     //新建成功则显示title
            fileTitle.style.display = "block";
            fileEdtor.style.display = "none";
            addEventfile();                     //绑定文件点击处理
            //向数据中添加一条新的文件信息
            var newFile = {
                id: first.dataset.fileId,
                pid:pid,
                title:edtorVal,
                type:"file"
            };

            datas.unshift(newFile);

            //提醒
            fullTip("ok","新建文件夹成功");

            //要找到当前这个新建的文件的父级对应的左侧树形菜单，
            //找到下一级 > ul

            var tree = tools.getTreeById("tree-title",pid); //找到父id对应的项
            var nextUl = tree.nextElementSibling;           //获取父id对应的下一个兄弟节点

            nextUl.innerHTML += createTreeLi(datas,newFile);//渲染左侧对应的树形菜单
            tools.removeClass(checkedAll,"checked");        //去掉全选按钮的class

            //给所有的checkbox添加事件处理
            checkboxAddEvent();
        }
        create.isCreateFile = false;            //重置新建按钮的状态
    }
//----------------------------------------封装被选中函数
    function whoSelect(){
        var arr= [] ;                       //定义空数组，存放被选中的文件
        for(var i=0;i< checkboxs.length;i++){
            //判断每一个文件的checkbox身上是否有checked
            if (tools.hasClass(checkboxs[i],'checked')) {  
                arr.push(tools.parents(checkboxs[i],".file-item")) //把它的父级push进数组arr
            };
        }
        return arr ;                        //返回数组
    }
//----------------------------------------给每一个单独的div添加点击处理
    function aloneClick (checkObj) {
        tools.addEvent(checkObj,"click",function (ev){
            var isAddClass = tools.toggleClass(this,"checked");     //判断是否已经添加了class
            if( isAddClass ){                                       //已经添加了class
                if( whoSelect().length === checkboxs.length  ){      //判断被选中元素的length
                    tools.addClass(checkedAll,"checked");
                }
            }else{
                tools.removeClass(checkedAll,"checked");
            }
            ev.stopPropagation();                       //阻止冒泡
        })
        tools.addEvent(checkObj,"mousedown",function (ev){
            ev.stopPropagation();                       //阻止冒泡
        })
    };
//------------------------------------------在新建成功时，生成左侧树形菜单对应的项
    function createTreeLi(datas,tree_childs){
        var level = dataAction.getLevel(datas,tree_childs.id);
        var hasChild = dataAction.hasChilds(datas,tree_childs.id);

        var treeContro = hasChild ? "tree-contro" : "tree-contro-none";
        var html = '';
        html += '<li>'
            +'<div data-file-id="'+tree_childs.id+'" class="tree-title '+treeContro+'" style="padding-left:'+level*14+'px;">'
                +'<span>'
                    +'<strong class="ellipsis">'+tree_childs.title+'</strong>'
                    +'<i class="ico"></i>'
                +'</span>'
            +'</div>'

        html += createTreeHtml(datas,tree_childs.id);

        html += '</li>'
        return html;     
    };
//-----------------------------------------------提示框的封装   
   function fullTip(classNames,message){
        //先瞬间拉回到-32，在运动到0
        fullTipBox.style.top = "-32px";
        //设置延迟定时器
        setTimeout(function (){
           tools.addClass(fullTipBox,classNames);       //给提示框添加class
            fullTipBox.style.transition = ".3s";
            fullTipBox.style.top = 0;     
        },0);

        fullText.innerHTML = message;
        clearTimeout(fullTipBox.timer);
        fullTipBox.timer = setTimeout(function (){  //设置延迟定时器，把顶部提示框拉回-32px位置
            fullTipBox.style.top = "-32px"; 
            tools.removeClass(fullTipBox,classNames);       //给提示框去除class 
        },2000);
    }
//------------------------------------------移动提示框结构封装
    function moveDialogHtml (){
        var html = '<p class="dir-file">\
                        <span class="file-img"></span>\
                        <span class="file-name">老王</span>\
                        <span class="file-num"></span>\
                    </p>\
                    <div class="dir-box">\
                        <div class="cur-dir">\
                            <span>移动到：</span><span class="fileMovePathTo">111</span>\
                        </div>\
                        <div class="dirTree"></div>\
                    </div> '
        return html;
    };
//------------------------------------------移动拖拽剪影函数
    function moveFileShadow(){
        var newDiv = document.createElement("div");
        newDiv.className = 'drag-helper ui-draggable-dragging';

        var html = '<div class="icons">'
                        +'<i class="icon icon0 filetype icon-folder"></i>'  
                    +'</div>'
                    +'<span class="sum">1</span>';

        newDiv.innerHTML = html;
        return newDiv;
    }
//--------------------------------------------空文件提示函数                               
    function emptyFile (){
        var fileItems = tools.$('.file-item',fileContent) ;                         //找到所有的文件
        var len = fileItems.length ;                                                //获取文件区域的文件length
        if( len == 0 ){
            fileContent.style.display = "none" ;                                    //隐藏文件容器
            gEmpty.style.display = "block" ;                                        //显示空文件提示
            tools.removeClass(checkedAll,"checked") ;                               //清除全选按钮的样式
        }else {
            fileContent.style.display = "block" ;
            gEmpty.style.display = "none" ;
        }
    }
//--------------------------------------判断文件区域是否有文件函数
    function hasFileFn (){
        var fileItems = tools.$('.file-item',fileContent) ;                         //找到所有的文件
        var len = fileItems.length ;                                                //获取文件区域的文件length
        //文件区域没有文件时
        if( len == 0 ){
            fileContent.style.display = "block" ;                                    //隐藏文件容器
            gEmpty.style.display = "none" ;                                        //显示空文件提示
        }
    }
//----------------------------------删除文件函数
    function delectFile (){
        delect.delect = true;
        var selectArr = whoSelect();
        if( selectArr.length === 0 ) {
            fullTip("warn","请选择文件");
            delect.delect = false;                          //把删除的状态设为false
        }else{
            shadow.style.display = "block" ;            //显示遮罩层
            //删除 文件区域删除 树形菜单删除
            dialog({
                title:"删除文件",
                content:"确定要删除这个文件夹吗？",
                okFn:function (){                                   //点击确定按钮
                    var idArr = [];                                 //定义一个空的id数组
                    for( var i = 0; i < selectArr.length; i++ ){    //循环被选中的元素
                        fileContent.removeChild(selectArr[i]);      //把被选中的元素从文件区域删除

                        var fileId = selectArr[i].dataset.fileId;   //定义变量存储被选中元素的id

                        var tree = tools.getTreeById("tree-title",fileId);  //通过id找到属性菜单中对应的项

                        tree.parentNode.parentNode.removeChild(tree.parentNode); //从树形菜单中删除对应项

                        idArr.push(fileId);                         //把得到的id push进idArr
                    }
                    dataAction.batchDelect(datas,idArr);            //调用函数根据idArr删除数据中对应的数据  
                    delect.delect = false;                          //把删除的状态设为false
                    shadow.style.display = "none" ;                 //隐藏遮罩层
                    emptyFile() ;                                   //空文件提示函数
                }
            })
        }
    }
//----------------------------------移动文件函数
    function moveFile (){
        var selectArr = whoSelect();
        if( selectArr.length === 0 ) {                              //没有选中文件时，顶部小提示框弹出
            fullTip("warn","请选择要移动的");
        }else{                                                      //有选中文件时
            shadow.style.display = "block" ;                        //显示遮罩层
            move.isMove = true;                                     //移动的过程正在进行时
            var moveId = 0;                                         //保存选择要移动到的文件的id
            var isMove = true;                                      //默认是不可以关闭
            //出现弹框
            dialog({
                title:"选择存储位置",
                content:moveDialogHtml(),
                okFn:function (){
                    //可以移动
                    if( !isMove ){
                        var childsTitle = dataAction.getChildsById(datas,moveId);
                        var a = true;
                        b:for( var i = 0; i < selectArr.length; i++ ){
                             a = true;
                            var getData = dataAction.getDataById(datas,selectArr[i].dataset.fileId);
                            //要移动的数据，不能存在于被移入的数据的子数据中 
                            //判断的依据是数据的 title
                            for( var j = 0; j < childsTitle.length; j++ ){
                                if( childsTitle[j].title == getData.title ){
                                    fullTip("warn","部分移动失败,重名了");
                                    a = false;
                                   // continue b;
                                    break;
                                }
                            }
                            if( a ){
                                 getData.pid = moveId;
                            }  
                        }
                        //文件区域渲染
                        var cur = tools.$(".current-path")[0].dataset.fileId; //导航栏当前打开文件夹的的id
                        fileContent.innerHTML = craatFilesHtml(datas,cur);    //根据这个id重新渲染文件区域
                        addEventfile();                                       //给移动后的每个文件添加点击处理
                        checkboxAddEvent();                         //给每一个checkbox添加点击处理
                        //菜单区域渲染
                        treeMenu.innerHTML = createTreeHtml(datas,-1);
                        //定位到某个菜单上
                        tools.addClass(tools.getTreeById("tree-title",cur),"tree-nav");
                        treeClick() ;                                          //给重新渲染后的树形菜单绑定点击处理
                        move.isMove = false;
                    }
                    shadow.style.display = "none" ;                             //隐藏遮罩层
                    return isMove;       
                }
            }); 

            //弹框的父级
            var fullPop = tools.$(".full-pop")[0];
            //渲染弹框中的树形菜单
            var dirTree = tools.$(".dirTree",fullPop)[0];
            tools.addClass(dirTree,"tree-menu-comm");                           //给渲染出来的菜单添加class
            dirTree.innerHTML = createTreeHtml(datas,-1);                       //渲染dirTree的内容结构
            //填写内容
            var fileName = tools.$(".file-name",fullPop)[0];
            var fileNum = tools.$(".file-num",fullPop)[0];
            var selectFirstId = selectArr[0].dataset.fileId;
            //错误信息提示
            var error = tools.$(".error",fullPop)[0];
            fileName.innerHTML = dataAction.getDataById(datas,selectFirstId).title; //显示被移动文件夹的名字
            if( selectArr.length>1 ){
                fileNum.innerHTML = '等 '+selectArr.length+' 个文件 ';          //显示有几个文件夹被移动
            }


            var prevId = 0;
            tools.addEvent(dirTree,"click",function (ev){                       //给弹框里的树形菜单添加点击处理
                var target = ev.target;
                if( target = tools.parents(target,".tree-title") ){
                    isMove = false;
                    //点击菜单的那个id
                    var clickFileId = target.dataset.fileId;
                    tools.removeClass(tools.getTreeById("tree-title",prevId,dirTree),"tree-nav");
                    tools.addClass(target,"tree-nav");
                    prevId = clickFileId;
                    error.innerHTML = "";
                    //被移动的元素的父id
                    var firstSelectId = selectArr[0].dataset.fileId;
                    var parent = dataAction.getParent(datas,firstSelectId);

                    if( clickFileId == parent.id ){
                        error.innerHTML = "文件已经在当前文件夹下";
                        isMove = true;
                    }
                    for( var i = 0; i < selectArr.length; i++ ){
                        //找到选中元素的所有的子孙数据
                        var selectId = selectArr[i].dataset.fileId;
                        var childs = dataAction.getChildsAll(datas,selectId);

                        for( var j = 0; j < childs.length; j++ ){
                            if( childs[j].id == clickFileId ){
                                error.innerHTML = "不能移动到本身或子孙元素下";
                                isMove = true;
                                break;
                            }
                        }
                    }
                    moveId = clickFileId;
                } 
            })
        }
    }
//----------------------------------重命名函数
    function reFileName (){
        var selectArr = whoSelect() ;                                           //获取被选中元素
        if(selectArr.length == 0){
            fullTip("warn","请选择文件") ;                                      //没有选中文件时
        }else if( selectArr.length > 1 ){
            fullTip("warn","只能对一个文件重命名！") ;
        }else {
            reName.onOff = true ;                                   //正在重命名
            var first = selectArr[0] ;
            var fileTitle = tools.$(".file-title",first)[0];       //获取新建文件夹的title
            var fileEdtor = tools.$(".file-edtor",first)[0];       //获取新建文件的编辑框

            fileTitle.style.display = "none";                   //隐藏title部分
            fileEdtor.style.display = "block";                  //显示编辑框

            var edtor = tools.$(".edtor",first)[0];             //获取input
            /*edtor.focus();*/ 
            edtor.value = fileTitle.innerHTML ;                 //编辑框内容 
            edtor.select() ;                                    //内容出去全选状态
            
             ////////点击输入框的时候,阻止冒泡
            tools.addEvent(edtor,"click",function (ev){
                ev.stopPropagation();    
            });
            tools.addEvent(edtor,"mousedown",function (ev){
                ev.stopPropagation();    
            });                       
        }
    }
//---------------------------------重命名填入内容好的函数
    function reNameCon(){
        var selectArr = whoSelect() ;           //获取被选中的元素              
        var first = selectArr[0] ;
        var fileTitle = tools.$(".file-title",first)[0];       //获取新建文件夹的title
        var fileEdtor = tools.$(".file-edtor",first)[0];       //获取新建文件的编辑框
        var edtor = tools.$(".edtor",first)[0] ;    
        var edtorVal = edtor.value.trim();              //获取输入框内容

        var pathNavLast = tools.$("span",pathNav)[0];   //导航中最后一个元素span
        var pid = pathNavLast.dataset.fileId;           //当前创建的元素的pid就是导航区域的最后一个span的id

        if( edtorVal == "" || edtorVal == fileTitle.innerHTML ){    //输入框为空或者跟原名相同
            fileTitle.style.display = "block";                   //显示title部分
            fileEdtor.style.display = "none";                  //隐藏编辑框
            
        }else if( dataAction.reName(datas,pid,edtorVal) ){      //与其他文件重名时
            fileTitle.style.display = "block";                   //显示title部分
            fileEdtor.style.display = "none";                  //隐藏编辑框
            fullTip("warn","与原有文件名有冲突！") ;
        }else {
            //重命名成功时，要更改树形菜单里的对应文件的title
            var selectId = first.dataset.fileId ;               //获取被重命名的元素的id 
            var thisData = dataAction.getDataById(datas,selectId) ; //找到要重命名的这条数据
            thisData.title = edtorVal ;                 //更改这条数据的title
            fileTitle.innerHTML = edtorVal ;           //更改文件区域的文件名
            fileTitle.style.display = "block";                   //显示title部分
            fileEdtor.style.display = "none";                  //隐藏编辑kuang
            fullTip("ok","重命名成功！") ;
            //重新渲染树形菜单
            treeMenu.innerHTML = createTreeHtml(datas,-1);
            treeClick() ;                           //调用树形菜单点击处理函数
            reName.onOff = false ;                  //重命名的开关设为false
        }
    }
 
//----------------------------------拖拽文件函数
    function moveFileFn(ev){
        //鼠标在移动中超出一定范围后在产生剪影
        if(Math.abs(ev.clientX - disX) > 10 || Math.abs(ev.clientY - disY) > 10){
            if(!shadowDrag){                                                    //没有剪影存在
                shadowDrag = moveFileShadow() ;                                 //创建剪影
                document.body.appendChild(shadowDrag) ; 
                shadowDrag.style.display = "block" ;
                tips = document.createElement('div') ;
                tips.style.cssText = 'width:30px;height: 30px;position:absolute;left:0;top:0;' ;
                document.body.appendChild(tips) ;
            }
            isDrag = true ;                                                     //正在拖拽剪影
            tips.style.left = ev.clientX + "px" ;
            tips.style.top = ev.clientY + "px" ;
            shadowDrag.style.left = ev.clientX + 5 +"px" ;
            shadowDrag.style.top = ev.clientY + 5 +"px" ;

            if (!tools.hasClass(shadowTarget,"file-checked")) {
                //清空所有的
                for(var i=0;i< fileItems.length;i++){
                    tools.removeClass(fileItems[i],"file-checked") ;
                    tools.removeClass(checkboxs[i],"checked") ;
                }

                tools.addClass(shadowTarget,"file-checked") ;                   //给有剪影的元素添加Class
                var checkbox = tools.$('.checkbox',shadowTarget)[0] ;
                tools.addClass(checkbox,"checked") ;                            //添加选中class
            };

            //计数
            var selectArr = whoSelect() ;                                       //被选中元素
            var sum = tools.$(".sum",shadowDrag)[0];        
            var icons = tools.$(".icons",shadowDrag)[0];
            sum.innerHTML = selectArr.length ;                                  //显示拖拽元素的个数
            var str = '' ;
            var len = selectArr.length > 4 ? 4 : selectArr.length ;//判断被选中的元素个数大于4就取4，小于4就取length
            for(var i=0;i< len;i++){
                 str+= '<i class="icon icon'+i+' filetype icon-folder"></i>' ; //出现对应的个数的i标签
             } 
             icons.innerHTML = str ;

             pengObj = null ;                       //被碰撞元素                     
             //碰撞检测
             for(var i=0;i< fileItems.length;i++){
                //要碰撞的元素是否存在于被选中的元素中
                 if(!indexOf(selectArr,fileItems[i]) && duang(tips,fileItems[i])){
                    fileItems[i].style.background = "skyblue";
                    pengObj = fileItems[i];                                     //找到被碰撞元素
                 }else {
                    fileItems[i].style.background = "" ;                        //没有被碰到
                 }
             }
        }

    }
//-----------------------------------判断函数
    function indexOf(arr,item){
        for( var i = 0; i < arr.length; i++ ){
            if( arr[i] === item ){
            return true;
            }
        }  
        return false;
    }
//-----------------------------------鼠标从文件夹上抬起时的处理
    function upFileFn(){
        //清除document上的鼠标移动和抬起时的事件处理 
        tools.removeEvent(document,"mousemove",moveFileFn) ;
        tools.removeEvent(document,"mouseup",upFileFn) ;
        if(shadowDrag){                                                         //如果剪影存在，就删除
            document.body.removeChild(shadowDrag) ;
            document.body.removeChild(tips) ;
            shadowDrag = null ;
        }

        //如果被碰撞的元素存在，把被选中元素的父id设为被碰撞的元素的对应的id
        if(pengObj){
            var moveId = pengObj.dataset.fileId ;                               //定义被碰撞元素的id
            var selectArr = whoSelect() ;                                       //定义被选中的元素
            var childsTitle = dataAction.getChildsById(datas,moveId) ;          //获取被碰撞元素的所有子级
            var a =true ;                                                       //定义一个状态开关
            //循环被选中的所有元素，获取每一个被选中元素的子级
            for(var i=0;i< selectArr.length;i++){
                a = true ;
                var getData = dataAction.getDataById(datas,selectArr[i].dataset.fileId) ;   //得到被选中元素的子级数据
                //根据数据的title判断要移动到的目标是不是被移动元素的子级，如果是，则不能移动
                for(var j=0;j< childsTitle.length;j++){                         //循环被碰撞元素子级title
                    if(childsTitle[i].title == getData.title){
                        fullTip("warn","部分移动失败,重名了");                   //重名时
                        a = false ;                                              //状态开关设为false
                        break ;                                                  //打断执行
                    }

                }
                //根据a的状态判断是否要更改被移动元素的父id
                if(a) getData.pid = moveId ;
            }

             //文件区域渲染
            var cur = tools.$(".current-path")[0].dataset.fileId;               //导航栏当前打开文件夹的的id
            fileContent.innerHTML = craatFilesHtml(datas,cur);                  //根据这个id重新渲染文件区域
            addEventfile();                                       //给移动后的每个文件添加点击处理
            checkboxAddEvent();                         //给每一个checkbox添加点击处理
            //菜单区域渲染
            treeMenu.innerHTML = createTreeHtml(datas,-1);
            treeClick() ;                               //树形菜单重新绑定点击处理
            //定位到某个菜单上
            tools.addClass(tools.getTreeById("tree-title",cur),"tree-nav");  
            pengObj = null ;                                                    //被碰撞元素设为空
        }
        isDrag = false ;                                                        //默认没有剪影
    }
//----------------------------------------根据数据生成一个文件结构
    function creatHTML (item) {
        var html = '<div class="file-item" data-file-id='+item.id+'>'
                       +' <strong class="checkbox"></strong>'
                        +'<i class="icon file"></i>'
                        +'<p>'
                           +'<span class="file-title">'+item.title+'</span>'
                            +'<span class="file-edtor">'
                                +'<input type="text" class="edtor" />'
                           +' </span>'
                        +'</p>'
                    +'</div>';
        return html;
    }

//-----------------------------------------循环那到数据放到文件区域
    function craatFilesHtml (datas,id) {
        var childs = dataAction.getChildsById(datas,id);            //通过传入的id找到对应id下的所有子级
        var str = '';
        for(var i=0;i<childs.length;i++){
            str+=creatHTML(childs[i]);          //调用生成单个div函数
        }
        return str ;
    };

//--------------------------------------------封装文件点击处理函数
    function addEventfile (argument) {
        //for循环所有divs,给每一个div添加点击处理
        for(var i=0;i<divs.length;i++){
            tools.addEvent(divs[i],"click",function(){
                var fileId = this.dataset.fileId ;       //找到对应文件的id
                var childs = dataAction.getChildsById(datas,fileId); //通过id找到对应的所有的子级
                fileContent.innerHTML = craatFilesHtml (datas,fileId) ; //把子级文件文件渲染到容器里
                emptyFile() ;
                addEventfile ();                            //生成结构或调用点击处理函数
                checkboxAddEvent();                         //给每一个checkbox添加点击处理
                pathNav.innerHTML = creatNavHtml(datas,fileId);     //渲染头部导航区域

                //当点击文件时，左侧树形菜单指向对应的title
                var prev = tools.getTreeById("tree-title",prevId);
                var tree = tools.getTreeById("tree-title",fileId);
                   tools.removeClass(prev,"tree-nav");
                   tools.addClass(tree,"tree-nav");
                   prevId = fileId;
            });
        }   
    }

//-------------------------------------------渲染文件区域函数
    function creatNavHtml (datas,id) {
        //传入一个初始id，找到对应的所有的父级，用reverse把所有的父级颠倒顺序
        var parents = dataAction.getParentsById(datas,id).reverse();

         //根据数据生成文件导航的结构
        var str = '';
        //["微云","我的音乐","周杰伦"]
        //最后一个使用span来包含的

        var zIndex = parents.length+10;

        for( var i = 0; i < parents.length-1; i++ ){
           str += '<a href="javascript:;"'
           +' style="z-index:'+(zIndex--)+'" data-file-id="'+parents[i].id+'">'+parents[i].title+'</a>';
                                     
        }
        str += '<span class="current-path" style="z-index:'+zIndex+'" data-file-id="'+id+'">'+parents[parents.length-1].title+'</span>';   
        return str;
    } 
//--------------------------------------------左侧树形菜单点击处理函数
   function treeClick (){
        //给左侧属性菜单添加点击处理
       for( var i = 0; i < treeTitle.length; i++ ){ //循环所有的树形菜单名称
         tools.addEvent(treeTitle[i],"click",function (){           //添加点击处理
            var fileId = this.dataset.fileId;
            //点击导航区域渲染文件区域的内容
            fileContent.innerHTML = craatFilesHtml(datas,fileId);
            var fileItems = tools.$('.file-item',fileContent) ;                         //找到所有的文件
            var len = fileItems.length ;                                               //获取文件区域的文件length

            if( len == 0 ){                                         //文件区域为空时
                fileContent.style.display = "none" ;
                gEmpty.style.display = "block" ;
            }else {                                                 //不为空
                fileContent.style.display = "block" ;
                gEmpty.style.display = "none" ;
                addEventfile ();                                //给文件区域的文件添加点击处理
                checkboxAddEvent();                         //给每一个checkbox添加点击处理
            } 
           //点击导航区域渲染点击导航区域
            pathNav.innerHTML = creatNavHtml(datas,fileId);

            var prev = tools.getTreeById("tree-title",prevId);
            var tree = tools.getTreeById("tree-title",fileId);
               tools.removeClass(prev,"tree-nav");
               tools.addClass(tree,"tree-nav");
               prevId = fileId;
            
         })
       }
       tools.getTreeById("tree-title",2)
   }
//-------------------------------------------------渲染左侧树形菜单区域
    function createTreeHtml(datas,id){
        var tree_childs = dataAction.getChildsById(datas,id);   //通过指定的id获得指定id下所有子级

        var html =   '<ul>';
        for( var i = 0; i < tree_childs.length; i++ ){
            var level = dataAction.getLevel(datas,tree_childs[i].id);//获取当前id在数据中的第几层
           
            var treeNav = id === -1 ? "tree-nav" : ""; //判断当前id是否有子级，有就添加类tree-nav          
            //判断某个id下是否有子级
            var hasChild = dataAction.hasChilds(datas,tree_childs[i].id);
            //有子级就添加tree-contro，没有就添加tree-contro-none
            var treeContro = hasChild ? "tree-contro" : "tree-contro-none";

            html += '<li>'
                +'<div data-file-id="'+tree_childs[i].id+'" class="tree-title '+treeNav+' '+treeContro+'" style="padding-left:'+level*14+'px;">'
                    +'<span>'
                        +'<strong class="ellipsis">'+tree_childs[i].title+'</strong>'
                        +'<i class="ico"></i>'
                    +'</span>'
                +'</div>'

            html += createTreeHtml(datas,tree_childs[i].id);

            html += '</li>'

        }
        html += '</ul>';
        return html;
   }
//----------------------------------全选按钮函数
    function checkedAllClick (){
        tools.addEvent(checkedAll,'mousedown',function (ev){
            var fileItems = tools.$('.file-item',fileContent) ;                         //找到所有的文件
            var len = fileItems.length ;                                                //获取文件区域的文件length
            if( len == 0 ) return ;                                  
            var isAddClass = tools.toggleClass(this,"checked");        //是否要添加class
            if( isAddClass ){                                          //已添加上对应的class
                for( var i = 0; i < fileItems.length; i++ ){
                    //在对应的文件和对应的checkbox上添加class属性
                    tools.addClass(fileItems[i],"file-checked");        
                    tools.addClass(checkboxs[i],"checked");
                }
            }else{                                                      //没有添加对应的class
                for( var i = 0; i < fileItems.length; i++ ){
                    //从对应的元素身上移出对应的class属性
                    tools.removeClass(fileItems[i],"file-checked");
                    tools.removeClass(checkboxs[i],"checked");
                }
            }
            ev.stopPropagation();                           //阻止冒泡  
        });
    }
//------------------------------------单选按钮点击处理函数
    function checkboxAddEvent(){
        for(var i=0;i< checkboxs.length;i++){
            aloneClick(checkboxs[i]) ;
        }
    };
//----------------------------------------------框选函数
    function moveFn(ev){ 
        if( Math.abs(ev.clientX - disX) > 20 ||  Math.abs(ev.clientY - disY) > 20 ){
            if( !newDiv ){                                  //判断是否有newDiv
                newDiv = document.createElement("div");
                newDiv.className = "selectTab";
                newDiv.style.left = disX + "px";
                newDiv.style.top = disX + "px";
                document.body.appendChild(newDiv);
            }
            //newDiv的样式
            newDiv.style.width = Math.abs(ev.clientX - disX) + "px";
            newDiv.style.height = Math.abs(ev.clientY - disY) + "px";
            //newDiv的定位坐标
            newDiv.style.left = Math.min(ev.clientX , disX)+1 + "px";
            newDiv.style.top = Math.min(ev.clientY , disY)+1 + "px";

            for( var i = 0; i < fileItems.length; i++ ){
                if( duang(newDiv,fileItems[i]) ){                //碰上的改变状态

                   tools.addClass(fileItems[i],"file-checked");
                   tools.addClass(checkboxs[i],"checked");
                }else{                                            //没有被碰上
                   tools.removeClass(fileItems[i],"file-checked");
                   tools.removeClass(checkboxs[i],"checked");
                }
            }
        }  
    }
//-----------------------------------------------框选鼠标抬起函数
    function upFn(){ 
        tools.removeEvent(document,"mousemove",moveFn);
        tools.removeEvent(document,"mouseup",upFn);
        if( newDiv ) document.body.removeChild(newDiv); //删除框选div

        if( whoSelect().length === checkboxs.length ){  //所有的元素都碰上，处于全选状态
            tools.addClass(checkedAll,"checked");       //全选按钮被勾选
        }
    }




/*************************************功能区************************************/
//*****************************绑定一个resize
    tools.addEvent(window,"resize",changeHeight);
//*****************************************利用事件委托给div添加移入处理
    tools.addEvent(fileContent,"mouseover",function (ev){
        var target = ev.target;                             //获取事件目标元素
        if( target = tools.parents(target,".file-item") ){  //目标元素时父级时
          tools.addClass(target,"file-checked");            //添加class
        }
    });
//*****************************************利用事件委托给所有的文件div添加鼠标移出处理    
    tools.addEvent(fileContent,"mouseout",function (ev){
        var target = ev.target;
        if( target = tools.parents(target,".file-item") ){  //判断事件源是否是父级元素
            //找到这个元素中的checkbox
            var checkbox = tools.$(".checkbox",target)[0];  //获取有checkbox的class属性的元素

            if( !tools.hasClass(checkbox,"checked") ){      //checkbox没有被选中
                 tools.removeClass(target,"file-checked");  //则删除父级元素的class属性
            }
        }
    });
//*******************************************把文件渲染到容器里
    fileContent.innerHTML = craatFilesHtml (datas,initId) ;     
    var divs = tools.$ ('.file-item',fileContent)   ;           //找到容中所有的已经生成的文件div
//********************************************调用添加点击处理程序给每个文件添加点击处理
    addEventfile(); 
//******************************文件导航区     
    pathNav.innerHTML = creatNavHtml(datas,initId);

//************利用事件委托，把点击处理添加在文件导航区域的容器pathNav
    tools.addEvent(pathNav,"click",function (ev){
        var target = ev.target;                            //找出事件源

        if( target.nodeName === "A" ){                     //判断事件源是不是a标签
            var fileId = target.dataset.fileId;            //获取事件源身上的id
            fileContent.style.display = "block" ;          //显示文件区域
            gEmpty.style.display = "none" ;                //隐藏空文件提示
            //点击导航区域渲染文件区域的内容
            fileContent.innerHTML = craatFilesHtml(datas,fileId);
            addEventfile ();                                //给文件区域的文件添加点击处理
            checkboxAddEvent();                         //给每一个checkbox添加点击处理
            //点击导航区域渲染点击导航区域
            pathNav.innerHTML = creatNavHtml(datas,fileId);

            //左侧对应树形菜单的操作
            var prev = tools.getTreeById("tree-title",prevId);
            var tree = tools.getTreeById("tree-title",fileId);
               tools.removeClass(prev,"tree-nav");
               tools.addClass(tree,"tree-nav");
               prevId = fileId;
        }
    });
//********************************渲染左侧树形菜单
   treeMenu.innerHTML = createTreeHtml(datas,-1);
   treeClick() ;                                        //调用给左侧树形菜单添加点击处理
//********************************单选全选处理
    //给全选按钮添加点击处理
    checkedAllClick () ;
    //给每一个checkbox添加点击处理
    checkboxAddEvent();  
//*********************************新建文件夹   
    tools.addEvent(create,"click",function (ev){
        hasFileFn() ;                               //调用判断函数
        //判断是否有文件在新建中，如果有，就停止执行下面的操作
        if( this.isCreateFile ){
            return;
        }
        this.isCreateFile  = true;              
        //在fileContent之前要出现一个文件
        var html = creatHTML({              //给新建的文件一个结构跟id
            id:tools.uuid()
        });

        fileContent.innerHTML = html + fileContent.innerHTML;  //新建的文件插入到之前文件的前面
        var first = fileContent.firstElementChild;             //获取文件区域的新建的文件
        var fileTitle = tools.$(".file-title",first)[0];       //获取新建文件夹的title
        var fileEdtor = tools.$(".file-edtor",first)[0];       //获取新建文件的编辑框

        fileTitle.style.display = "none";                   //隐藏title部分
        fileEdtor.style.display = "block";                  //显示编辑框

        var edtor = tools.$(".edtor",first)[0];             //获取input
        edtor.focus();                                      //新建时让input获的焦点

        //给input绑定点击处理和鼠标按下处理
        tools.addEvent(edtor,"click",function (ev){
            ev.stopPropagation();                           //阻止冒泡   
        });
        tools.addEvent(edtor,"mousedown",function (ev){
            ev.stopPropagation();                           //阻止冒泡   
        });
    });
//***********************点击document，判断是否新建或者重命名
    tools.addEvent(document,"mousedown",function (){
        if( create.isCreateFile ){                          //判断新建开关的状态
            creatFileOk() ;             //调用新建成功函数
        }
        if( reName.onOff ){
            //调用重命名函数
            reNameCon() ;
        }
        
    });
//**************************敲回车键新建文件成功
    tools.addEvent(document,"keydown",function(ev){
        if( create.isCreateFile && ev.keyCode == 13 ){
            creatFileOk() ;             //调用新建成功函数
        };

        if( reName.onOff && ev.keyCode == 13 ){
            reNameCon() ;       //调用重命名成功函数
        }
    })
//**************************************框选
    var shadowTarget = null ;
    tools.addEvent(document,"mousedown",function (ev){
        var target = ev.target;                         //获取目标源
        ev.preventDefault(); 
        //如果目标源是以下几种情况，则不能拉出框选框
        if( tools.parents(target,".handleFile") || 
            tools.parents(target,".content_right_left")  ||
            tools.parents(target,".lay-aside")  || checkboxs.length === 0
            || delect.delect || move.isMove
          ){
            return;
        }

        newDiv = null;
        disX = ev.clientX;
        disY = ev.clientY;

         //拖拽移动
        if( tools.parents(target,".file-item") ){
            tools.addEvent(document,"mousemove",moveFileFn);
            tools.addEvent(document,"mouseup",upFileFn);
            shadowTarget = tools.parents(target,".file-item");
            return;
        }

        tools.addEvent(document,"mousemove",moveFn);
        tools.addEvent(document,"mouseup",upFn);

        //鼠标按下时，清除全选按钮和所有checkbox的状态
        for( var i = 0; i < fileItems.length; i++ ){
            tools.removeClass(fileItems[i],"file-checked");
            tools.removeClass(checkboxs[i],"checked");
        }
        tools.removeClass(checkedAll,"checked");   
    })
//**********************************点击删除文件
    tools.addEvent(delect,"click",delectFile);
//**********************************点击移动文件
    tools.addEvent(move,"click",moveFile) ;
//*********************************点击重命名按钮
    tools.addEvent(reName,"click",reFileName);
//***********************************鼠标右击事件
    document.onclick = function (ev){
        menuList.style.display = "none" ;
    };
    document.oncontextmenu = function (ev){
        ev.preventDefault() ;
        var len = whoSelect().length ;      //被选中元素长度
        var target = ev.target ;            //获取事件源
        target = tools.parents(target,".file-item") ;       //获取事件源的父级
        var checkbox = tools.$(".checkbox",target)[0] ;         //获取span
        //如果点击的不是鼠标右键，就不执行一下代码
        if( ev.button != 2 ) return ;
        if( len <= 1 ){
            if( target ){
                //显示右键菜单并定位
                menuList.style.display = "block" ;
                menuList.style.left = ev.clientX + "px" ;
                menuList.style.top = ev.clientY + "px" ; 
                //暴力清空所有的样式，给当前右击的文件加上样式
                for(var i=0;i< divs.length;i++){
                    tools.removeClass(checkboxs[i],"checked") ;
                    tools.removeClass(divs[i],"file-checked") ;
                }
                tools.addClass(target,"file-checked") ;
                tools.addClass(checkbox,"checked") ;
            }
        }else if( len === divs.length ){
            //显示右键菜单并定位
            menuList.style.display = "block" ;
            menuList.style.left = ev.clientX + "px" ;
            menuList.style.top = ev.clientY + "px" ; 
        }else {
            //选中几个文件的时候,判断当前点击的文件是否选中,
            //如果当前选中,在自己身上右键的时候,显示右键,
            //不在自己身上右键的时候,清空所有的,只在当前点击的自己身上勾选上
            if( tools.hasClass( checkbox,"checked" ) ){
                //给当前文件加上样式
                tools.addClass(target,"file-checked") ;
                tools.addClass(checkbox,"checked") ;
            }else {
                //如果不在被选中的文件当中，全部清空
                 for(var i=0;i< divs.length;i++){
                    tools.removeClass(checkboxs[i],"checked") ;
                    tools.removeClass(divs[i],"file-checked") ;
                }
                tools.addClass(target,"file-checked") ;
                tools.addClass(checkbox,"checked") ;
            }
             //显示右键菜单并定位
            menuList.style.display = "block" ;
            menuList.style.left = ev.clientX + "px" ;
            menuList.style.top = ev.clientY + "px" ; 
        }
    }
    //***************************给右键菜单添加移入移出点击处理
    for(var i=0;i< menuList_li.length;i++){
        tools.addEvent(menuList_li[i],"mousemove",function (ev){
            tools.addClass( this,"bg" ) ;        //给移入当前元素添加class
        });
        tools.addEvent(menuList_li[i],"mouseout",function (ev){
            tools.removeClass( this,"bg" ) ;        //给移入当前元素添加class
        });
    }
    //添加点击删除
    tools.addEvent(menuList_li[0],"mousedown",function (ev){
        ev.stopPropagation() ;
    }) ;
    tools.addEvent(menuList_li[0],"mouseup", delectFile) ;
    //点击移动到
    tools.addEvent(menuList_li[1],"mousedown",function (ev){
        ev.stopPropagation() ;
    }) ;
    tools.addEvent(menuList_li[1],"mouseup",moveFile) ;
    //点击重命名
    tools.addEvent(menuList_li[2],"mousedown",function (ev){
        ev.stopPropagation() ;
    }) ;
    tools.addEvent(menuList_li[2],"mouseup",reFileName) ;

    
}())
