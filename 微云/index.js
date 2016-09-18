//获取元素
var box = tools.$("#box"),
	popup = tools.$("#popup"),
	newSet = tools.$("#newSet"),
	checkAll = tools.$("#checkAll"),
	fileBox = tools.$("#fileBox"),
	files = tools.$("div", fileBox),
	allInput = tools.$(".checkbox", fileBox),
	allText = tools.$(".text", fileBox),
	allStrong = tools.$("strong", fileBox);
	toolBarR = tools.$(".toolBarR")[0];
	toolBtns = tools.$("a",toolBarR);
	popupTips = tools.$(".popupTips", popup)[0];
	emptyTip = tools.$("#emptyTip");
	centerMenu = tools.$(".centerMenu")[0];
	fileType = tools.$(".fileType")[0];
var fileInput = tools.$("input",tools.$(".file")[0])[0];
fileInput.onmouseover = function(){
	fileType.style.display = "block";
}
fileInput.onmouseout = function(){
	fileType.style.display = "none";	
}
var isBlock = true;
toolBtns[0].onclick = function(){
	if(isBlock){
		this.style.backgroundColor = "#fff";
		this.title = "显示目录树";
		centerMenu.style.display = 'none';
		fileBox.style.marginLeft = 0;
	}else{
		this.style.backgroundColor = "#e0e4ed";
		this.title = "隐藏目录树";
		centerMenu.style.display = 'block';
		fileBox.style.marginLeft = '172px';
	}
	isBlock = !isBlock;
}
var dialogP = tools.$('.dialogP')[0];
function hasOrNot() { //文件区域没有文件的时候，文件区域显示暂无文件
	if(!fileBox.innerHTML) {
		emptyTip.style.display = "block";
	}else{
		emptyTip.style.display = "none";
	}
}
//获取所有的文件夹
var allFiles = tools.$("div", fileBox);
var rename = tools.$("#rename");
//点击删除文件夹，弹出遮罩
var deleteB = tools.$("#delete"),
	shadow = tools.$("#shadow"),
	centerDialog = tools.$("#dialog"),
	dialogTitle = tools.$("span", centerDialog)[0];
	sureBtns = tools.$("#sureBtns"),
	isSureBtn = tools.$("input", sureBtns),
	deleteFile = tools.$("#deleteFile"),
	cancelX = tools.$("i", deleteFile)[0];
var tree = tools.$(".tree")[0];
shadow.onmousedown = function(ev) {
		ev.stopPropagation()
	}
	//弹出的tips(图片)，放在一个数组里
var arrImg = ['img/删除未选中文件提示.png', 'img/删除文件成功提示.png', 'img/新建成功提示.png', 'img/新建重名提示.png', 'img/重命名成功提示.png', 'img/重命名未选文件提示.png', 'img/重命名重名提示.png', 'img/重命名多选提示.png', 'img/移动未选中文件提示.png', 'img/移动成功提示.png', 'img/部分移动失败提示.png'];
//左侧列表的移入，移除事件处理
var navList = tools.$("#navList");
var navListLis = tools.$("a", navList);
for(var i = 0; i < navListLis.length; i++) {
	navListLis[i].onmouseover = function() {
		this.style.backgroundColor = "#ced4e0";
	}
	navListLis[i].onmouseout = function() {
		this.style.backgroundColor = "";
	}
}
//右键出现的菜单，点击其它地方，把菜单移出
function rightClick(){
	if(rightClickM) { //点击document的时候，如果有右键菜单显示，就把右键菜单移出body，同时设为null
		document.body.removeChild(rightClickM);
		rightClickM = null;
	}
}
//高度自适应
var centerContent = tools.$("#centerContent");
changeH();
function changeH() {
	var clientH = tools.view().H; //可视区的height
	centerContent.style.height = clientH - centerContent.offsetTop + 'px';
}
window.onresize = function() {
	changeH();
}
var datas = data.files;
var initId = 0;
var preId = 0;
//------------------------------文件区域渲染------------------------------
function filesHtml(datas, initId) {
	var childs = dataAction.getChildsById(datas, initId);
	var str = '';
	for(var h = 0; h < childs.length; h++) {
		str += addHtml.createFileHtml(childs[h]);
	}
	return str;
}
fileBox.innerHTML = filesHtml(datas, initId);
addEventFile();
//-----------------------------文件点击事件处理----------------------------
function addEventFile() {
	checkAll.style.backgroundPositionY = "-270px"; //点击文件时，全选是不勾选的
	for(var i = 0; i < files.length; i++) {
		files[i].onclick = function(ev) {
			if(ev.target.nodeName === "SPAN" || rename.onOff) return;
			var fileId = this.dataset.fileId; //找到这个文件的id
			var childs = dataAction.getChildsById(datas, fileId);
			var str = '';
			for(var i = 0; i < childs.length; i++) {
				str += addHtml.createFileHtml(childs[i]);
			}
			//新添加的内容，没有事件处理
			fileBox.innerHTML = str;
			//生成完结构后，让文件有点击事件处理程序
			addEventFile();
			//点击文件时，导航区域以及文件区域结构的渲染
			renderHtml(fileId);
			hasOrNot();
		};
		addEvent(files[i]); //添加移入移出事件处理
		check(); //按钮点击事件处理
	}
}
//--------------------------导航区：根据数据生成文件导航的结构----------------------------
var fileNav = tools.$(".file-nav")[0];
//文件导航区域结构
fileNav.innerHTML = addHtml.createNavHtml(datas, initId);
//--------------------------点击导航区进行切换文件----------------------------------------
//点击导航区域，用事件委托方法找到a，通过点击导航区域，目标源为a时切换到a下相应的子级
fileNav.addEventListener("click", function(ev) {
	var target = ev.target;
	if(target = tools.parents(target, 'a')) {
		var fileId = target.dataset.fileId; //找到当前点击的a的行间自定义属性的id，通过这个id找到a下面的child
		var childs = dataAction.getChildsById(datas, fileId);
		renderHtml(fileId);
	}
}, false);
//--------------------------------------左侧树形菜单----------------------------------------
tree.innerHTML = addHtml.createTreeHtml(datas, -1);
tree.addEventListener('click', function(ev) {
	var target = ev.target;
	if(target.nodeName == "I") {//如果点击的是三角，就不执行后面的代码
		return;
	}
	if(target = tools.parents(target, ".treeTitle")) {
		var fileId = target.dataset.fileId;
		renderHtml(fileId);
	}
}, false)
//-----------------------------------左侧菜单栏的小三角-------------------------------------
var shanjiao = tools.$("i",tree);
for(var k = 0,len = shanjiao.length;k < len;k++){
	shanjiao[k].state = true;
	shanjiao[0].state = false;//默认第一个是展开状态，状态应该是false
	shanjiao[0].className = 'icon';
	shanjiao[k].onmousedown = function(ev){
		ev.stopPropagation();
		console.log("123")
		var parents = tools.parents(this, ".treeTitle");
		var oUl = parents.nextElementSibling;
		if(oUl){
			if(this.state){
				this.className = "icon";
				oUl.style.display = "block";
			}else{
				this.className = "";
				oUl.style.display = "none";
			}
			this.state = !this.state;
		}
	}
}
//渲染文件区和导航区
function renderHtml(fileId) {
	fileBox.innerHTML = filesHtml(datas, fileId);
	fileNav.innerHTML = addHtml.createNavHtml(datas, fileId);
	var treeT = tools.getTreeById('treeTitle', fileId);
	if(treeT.nextElementSibling.innerHTML){
		treeT.nextElementSibling.style.display = 'block';
		var oneIco = tools.$("i",treeT)[0];
		oneIco.className = "icon";
		oneIco.state = false;
	}
	var pre = tools.getTreeById('treeTitle', preId);
	tools.removeClass(pre, 'bg');
	tools.addClass(treeT, 'bg');
	preId = fileId;
	addEventFile(); //文件点击事件处理
	hasOrNot(); //判断文件区域是否为空，为空时，显示无文件，提醒上传，否则隐藏
}
for(var i = 0; i < files.length; i++) {
	addEvent(files[i]);
}
//------------------------------------文件移入移出事件处理----------------------------------
//把添加的事件封装在一个函数中，除了已有的文件有点击事件处理，新建的文件也有事件处理
function addEvent(file) { //files移入移出事件处理
	file.onmouseover = function() {
		if(file.firstElementChild.style.backgroundPositionY == "-421px" || isDrag) return;
		tools.addClass(this, 'skyblue');
		if(this.lastElementChild.innerHTML) {
			this.firstElementChild.style.display = "block";
		} else {
			this.firstElementChild.style.display = "none";
		}
	}
	file.onmouseout = function() {
		if(file.firstElementChild.style.backgroundPositionY == "-421px") return;
		tools.removeClass(this, 'skyblue');
		this.firstElementChild.style.display = "none";
	}
}
//按钮初始的样式
function allDefault() {
	checkAll.style.backgroundPositionY = "-270px";
	for(var j = 0; j < allInput.length; j++) {
		allInput[j].style.backgroundPositionY = "-370px";
		tools.removeClass(allFiles[j], 'blue');
		tools.removeClass(allFiles[j], 'skyblue');
		allInput[j].style.display = "none";
		allInput[j].state = true;
	}
}
//----------------------------------------点击新建文件夹-----------------------------
newSet.onmousedown = function(ev) {
	emptyTip.style.display = 'none';
	ev.stopPropagation();
	//点击新建文件时，循环查看所有的文件名的名字，如果有为空的进行替换
	if(allFiles[0] && !allStrong[0].innerHTML) {
		fileBox.removeChild(allStrong[0].parentNode);
	}
	rightClick();
}
newSet.onmouseup = function(ev) {
		if(rename.onOff){//处理点击过重命名，再点击新建，重命名的那个文件上的输入框隐藏，strong显示
			rename.onOff = false;
			for(var t = 0; t < allFiles.length;t++){
				if(allText[t]){
					allText[t].nextElementSibling.style.display = 'block';
					allText[t].style.display = "none";
				}
			}
		}
		this.onOff = true;
		ev.stopPropagation();
		var newId = new Date().getTime();
		var newFile = document.createElement("div");
		newFile.dataset.fileId = newId;
		newFile.innerHTML = '<span class="checkbox"></span><input type="text" class="text" value="" /><strong></strong>';
		fileBox.insertBefore(newFile, fileBox.firstElementChild);
		addEvent(newFile); //给新建的文件夹添加事件处理
		check();
		var textV = tools.$(".text", newFile)[0];
		var oStrong = tools.$("strong", newFile)[0];
		textV.focus(); //焦点在input身上
		textV.onmousedown = function(ev) {
			ev.stopPropagation();
		}
	}
	//-----------------------------有新建时，点击document和回车-------------------------------
function down() {
	var pathNavSpan = tools.$("span", fileNav)[0];
	if(allInput[0].nextElementSibling.style.display == "none") return;
	var text = tools.$(".text", fileBox)[0];
	var textValue = text.value.trim();
	var first = fileBox.firstElementChild;
	var pid = pathNavSpan.dataset.fileId; //找到当前新建文件的父级的id
	if(!allInput[0].nextElementSibling.value.trim()) {
		fileBox.removeChild(files[0]);
	} else if(dataAction.reName(datas, pid, textValue)) { //文件重名弹出提示，同时移除该重名的文件
		popupTips.src = arrImg[3];
		remark();
		fileBox.removeChild(first);
	} else {
		var newDiv = {
			id: first.dataset.fileId,
			pid: pid,
			title: textValue,
			type: "file"
		}
		datas.unshift(newDiv);
		allStrong[0].innerHTML = allInput[0].nextElementSibling.value;
		allStrong[0].style.display = "block";
		allInput[0].nextElementSibling.style.display = "none";
		popupTips.src = arrImg[2];
		remark();
		var trees = tools.getTreeById('treeTitle', pid);
		var leftTree = trees.nextElementSibling;
		leftTree.innerHTML += addHtml.createOneTreeHtml(datas, newDiv); //把新建成功的单个文件渲染在树形菜单中
		hasOrNot();
		addEventFile(); //给新建好的文件添加点击事件处理
		checkAll.style.backgroundPositionY = "-270px"; //不管全选有没有被勾选，新建成功时都为不选中
		var treeT = tools.getTreeById('treeTitle', pid); //通过pid找到对应的tree，判断tree前是否有图标，没有应该给加上
		var treeIco = tools.$("i", treeT)[0];
		if(treeIco.className == "noTreeIco") { //
			tools.removeClass(treeIco, 'noTreeIco');
		}
	}
	newSet.onOff = false;
}
//点击document,在有新建的情况下执行相应的代码
document.addEventListener('mousedown', function(ev) {
	ev.preventDefault();
	if(newSet.onOff && !remove.onOff) {
		down();
		if(!fileBox.innerHTML){
			emptyTip.style.display = 'block'
		}
	}
}, false);
//点击回车，调用封装的函数（如果有文件名，就新建成功，否则失败）
document.onkeydown = function(ev) {
		if(newSet.onOff && ev.keyCode == 13) {
			down();
		}
	}
	//--------------------判断已勾选文件的length是否等于所有文件的length，给定全选是否为勾选---------------
function selected() {
	if(allInput.length && whichSelect().length == allInput.length) {
		checkAll.style.backgroundPositionY = "-320px";
	} else {
		checkAll.style.backgroundPositionY = "-270px";
	}
}
//-----------------------------------点击每一个小按钮--------------------------
function check() {
	for(var j = 0; j < allInput.length; j++) {
		allInput[j].state = true;
		allInput[j].onmousedown = function(ev) {
			if(ev.target === "document") return;
			if(rightClickM){
				document.body.removeChild(rightClickM);
				rightClickM = null;
				tools.addClass(this.parentNode,'skyblue')
			}
			for(var i = 0; i < allFiles.length; i++) {
				if(allInput[i].nextElementSibling) {
					allInput[i].nextElementSibling.style.display = "none";
					allStrong[i].style.display = "block";
				}
			}
			ev.stopPropagation();
			if(!allInput[0].nextElementSibling.value) {
				fileBox.removeChild(files[0]);
			} //新建没成功时，勾选小按钮，remove未添加名字的文件
			if(this.state) {
				this.style.backgroundPositionY = "-421px";
				tools.addClass(this.parentNode, 'blue');
			} else {
				this.style.backgroundPositionY = "-370px";
				tools.removeClass(this.parentNode, 'blue');
			}
			this.state = !this.state;
			selected(); //判断选中的文件的length是否与whichselect中的length一样
		}
	}
}
check();
//----------------------------------点击全选按钮---------------------------------------
//点击全选，所有文件也相应的被勾选或不勾选；所有文件被选中的同时，给文件添加背景颜色
checkAll.onmouseup = function(ev) {
	ev.stopPropagation()
}
checkAll.onmousedown = function(ev) { //backgroundPositionY = "-320px"时，是为勾选的状态
		if(!fileBox.firstElementChild) return;
		if(!fileBox.firstElementChild) { //没有文件时，全选不能被选中了
			checkAll.style.backgroundPositionY = "-270px";
			return;
		}
		if(!allInput[0].nextElementSibling.value.trim()) {
			fileBox.removeChild(files[0]);
		}
		for(var k = 0; k < allText.length; k++) { //点击过重命名，此时全选时，应把点击重命名时文件上的样式清除
			allText[k].style.display = "none";
			allStrong[k].style.display = "block";
		}
		if(this.style.backgroundPositionY == "-320px") {
			checkAll.style.backgroundPositionY = "-270px";
			for(var t = 0; t < allInput.length; t++) {
				allInput[t].style.backgroundPositionY = "-370px";
				tools.removeClass(allInput[t].parentNode, 'blue');
				allInput[t].style.display = "none";
				allInput[t].state = true;
			}
		} else {
			checkAll.style.backgroundPositionY = "-320px";
			for(var t = 0; t < allInput.length; t++) {
				allInput[t].style.backgroundPositionY = "-421px";
				tools.addClass(allInput[t].parentNode, 'blue');
				allInput[t].style.display = "block";
				allInput[t].state = false;
			}
		}
		ev.stopPropagation();
	}
	//----------------------------------封装一个whichSelect函数，记录那些文件被选中------------------
function whichSelect() {
	var arr = [];
	for(var k = 0; k < allInput.length; k++) {
		if(allInput[k].style.backgroundPositionY == "-421px") {
			arr.push(allInput[k].parentNode);
		}
	}
	return arr;
}
//-------------------------------------------小提醒框---------------------------
function remark() {
	popup.style.top = 0;
	popup.style.transition = ".5s";
	setTimeout(function() {
		popup.style.top = "-42px";
	}, 2000)
}
//----------------------------------------点击删除按钮--------------------------
deleteB.onmousedown = function(ev) {
	ev.stopPropagation();
	if(!fileBox.firstElementChild) return;
	rightClick();
	if(!allInput[0].nextElementSibling.value) { //删除无效文件
		fileBox.removeChild(files[0]);
	}
	if(whichSelect().length == 0) {
		popupTips.src = arrImg[0];
		remark(); 
	}else{
		if(rename.onOff){
			rename.onOff = false;
			for(var u = 0; u < allText.length; u++) {
				if(allText[u]) { //-------------------------
					tools.addClass(allText[u].parentNode, 'blue');
					allText[u].previousElementSibling.style.backgroundPositionY = '-421px';
					allText[u].nextElementSibling.style.display = "block";
					allStrong[u].innerHTML = allStrong[u].previousElementSibling.value;
					allText[u].style.display = "none";
				}
			}
		}
		deleteFn();
	}
}
function deleteFn() {
	deleteB.onOff = true;
	shadow.style.display = "block";
	var preId = 0;
	dialog({
		title: "删除文件",
		content: addHtml.deleteDialogHtml(),
		okFn: function() {
			var arr = [];
			for(var h = 0; h < whichSelect().length; h++) {
				var fileId = whichSelect()[h].dataset.fileId;
				var trees = tools.getTreeById("treeTitle", fileId);
				arr.push(fileId);
				fileBox.removeChild(whichSelect()[h]);
				h--;
				trees.parentNode.parentNode.removeChild(trees.parentNode);
			}
			checkAll.style.backgroundPositionY = "-270px"; //全选不选中
			dataAction.batchDelect(datas, arr); //删除数组中的所有对应数据
			var current = tools.$(".current-path")[0];
			var curId = current.dataset.fileId; //找到id
			var trees = tools.getTreeById('treeTitle', curId); //通过id找到菜单里的tree
			var pres = tools.getTreeById('treeTitle', preId); //前一个
			tools.removeClass(pres, 'bg');
			tools.addClass(trees, 'bg');
			preId = curId;
			shadow.style.display = "none";
			hasOrNot();
			tree.innerHTML = addHtml.createTreeHtml(datas, -1);
		}
	})
}
//-----------------------------------点击移动到------------------------
var remove = tools.$("#remove");
remove.onmousedown = function(ev) {
	ev.stopPropagation()
	rightClick();
	if(newSet.onOff) {
		if(!allText[0].value) {
			fileBox.removeChild(allText[0].parentNode);
		}
	}
	if(whichSelect().length == 0) {
		popupTips.src = arrImg[8];
		remark();
	} else {
		if(rename.onOff) {
			rename.onOff = false;
			for(var u = 0; u < allText.length; u++) {
				if(allText[u]) { //-------------------------
					tools.addClass(allText[u].parentNode, 'blue');
					allText[u].previousElementSibling.style.backgroundPositionY = '-421px';
					allText[u].nextElementSibling.style.display = "block";
					allStrong[u].innerHTML = allStrong[u].previousElementSibling.value;
					allText[u].style.display = "none";
				}
			}
		}
		clickMoveTo();
	}
}

function clickMoveTo() {
	remove.onOff = true;
	shadow.style.display = "block";
	var moveId = 0; //保存选择要移动文件的id
	var isMove = true; //
	dialog({
		title: '选择存储位置',
		content: addHtml.moveDialogHtml(),
		okFn: function() {
			if(!isMove) {
				//保存接收移动文件的那个文件的所有子文件名
				var childsTitle = dataAction.getChildsById(datas, moveId);
				var status = true;
				for(var t = 0; t < whichSelect().length; t++) {
					status = true;
					//先找到相应的数据，再与这些数据对比title，看是否有重名的，重名的不能移入该文件下了
					var getData = dataAction.getDataById(datas, whichSelect()[t].dataset.fileId);
					for(var j = 0; j < childsTitle.length; j++) {
						if(childsTitle[j].title == getData.title) {
							popupTips.src = arrImg[arrImg.length - 1];
							remark();
							status = false;
							break;
						}
					}
					if(status) { //如果条件成立，没有重名的，就可以移动，把移走的文件的pid改为移入的文件的id
						getData.pid = moveId;
						shadow.style.display = "none";

					}
				}
				var pathSpanId = tools.$(".current-path")[0].dataset.fileId;
				fileBox.innerHTML = filesHtml(datas, pathSpanId); //文件区域从导航的当前级下数据进行渲染
				tree.innerHTML = addHtml.createTreeHtml(datas, -1); //左侧树形菜单的渲染
				tools.removeClass(tools.getTreeById('treeTitle', 0), 'bg');
				tools.addClass(tools.getTreeById('treeTitle', pathSpanId), 'bg');
				addEventFile()
				remove.onOff = false;
			}
			hasOrNot(); //移动后判断文件去还有没有文件，没有就显示   暂无文件
			return isMove;
		}
	})
	dialogP.addEventListener('mousedown',function(ev){
		console.log("dialogP")
		ev.stopPropagation();
	},false)
	var dirTree = tools.$(".dirTree", dialogP)[0];
	dirTree.innerHTML = addHtml.createTreeHtml(datas, -1);
	var allTree = tools.$(".treeTitle", dialogP);
	tools.removeClass(tools.getTreeById("treeTitle", 0, dirTree), "bg");
	var fileName = tools.$('.file-name', dialogP)[0];
	var fileNum = tools.$(".file-num", dialogP)[0];
	var selectFirstId = whichSelect()[0].dataset.fileId;
	var error = tools.$(".error", dialogP)[0]; //错误信息提示
	fileName.innerHTML = dataAction.getDataById(datas, selectFirstId).title;
	if(whichSelect().length > 1) {
		fileNum.innerHTML = '等 ' + whichSelect().length + ' 个文件 ';
	}
	var prevId = 0;
	//点击弹出窗上的树形菜单
	dirTree.addEventListener('mouseover', function(ev) {
		var target = ev.target;
		if(target = tools.parents(target, '.treeTitle')) {
			target.style.backgroundColor = "e7f2fe";
		}
	}, false)
	dirTree.addEventListener('mousedown', function(ev) {
		ev.stopPropagation()
		var target = ev.target;
		if(target = tools.parents(target, '.treeTitle')) {
			isMove = false;
			var clickId = target.dataset.fileId;

			tools.addClass(target, 'bg');
			tools.removeClass(tools.getTreeById("treeTitle", prevId, dirTree), "bg");
			prevId = clickId;
			error.innerHTML = "";
			//				//移动的那个文件的pid
			var firstSelectId = whichSelect()[0].dataset.fileId;
			var parent = dataAction.getParent(datas, firstSelectId);
			if(clickId == parent.id) {
				error.innerHTML = "文件已经在当前文件夹下";
				isMove = true;
			}
			for(var e = 0; e < whichSelect().length; e++) {
				var selectId = whichSelect()[e].dataset.fileId; //找到选择移动到文件的身上的fileId
				var childs = dataAction.getChildsAll(datas, selectId); //找到选择移动到文件的子文件
				for(var l = 0; l < childs.length; l++) {
					if(childs[l].id == clickId) {
						error.innerHTML = "不能移动到本身或子孙元素下";
						isMove = true;
						break;
					}
				}
			}
			moveId = clickId;
		}
	}, false)
}
//-------------------------------------点击重命名----------------------
rename.onmousedown = function(ev) {
	ev.stopPropagation();
}
rename.onmouseup = function(ev) {
	ev.stopPropagation();
	if(!fileBox.firstElementChild) return;
	if(!allInput[0].nextElementSibling.value) { //删除无效文件（没有文件名）
		fileBox.removeChild(files[0]);
	}
	if(whichSelect().length == 0) { //没有选中的文件，提醒请选择文件
		popupTips.src = arrImg[5];
		remark();
	} else if(whichSelect().length >= 2) { //选中文件大于1，提醒只能对单个文件进行命名
		popupTips.src = arrImg[7];
		remark();
	} else { //可以重命名的
		rename.onOff = true; //自定义一个状态
		if(remove.onOff) return; //处理点击重命名，再点击移动到时
		reNameFn();
	}

}







//点击重命名，再点击删除，这是如果点击删除的框，选中的文件就不被选中了，触发了新建的document的onmousedown






function reNameFn() {
	for(var o = 0; o < allFiles.length; o++) {
		if(tools.hasClass(allFiles[o], 'blue')) {
			var oneStrong = allFiles[o].getElementsByTagName("strong")[0];
			var oneInput = allFiles[o].getElementsByTagName("input")[0];
			oneStrong.style.display = "none";
			oneInput.style.display = "block";
			oneInput.className = "text";
			oneInput.select(); //点击重命名时，input中的内容是全部选中的
			oneInput.focus();
			oneInput.onmousedown = function(ev) {
				ev.stopPropagation();
			}
			var fileId = allFiles[o].dataset.fileId; //当前文件夹的自定义fileId
			var parentId = tools.$(".current-path")[0].dataset.fileId; //当前文件夹父级的自定义fileId（即导航路径栏的span身上的fileId）
			var curData = dataAction.getDataById(datas, fileId); //找到道歉要进行重命名文件的数据
			if(shadow)return;
			//封装一个函数，点击document和回车的时候公用的代码
			function fm(ev) {
				ev.stopPropagation()
				state = false;
				rename.onOff = false;
				var va = curData.title; //保存一下相应数据中的title，即value值
				if(!oneInput.value.trim()) { //如果value改成了空的，就重命名无效，回到之前状态
					oneStrong.style.display = "block";
					oneInput.style.display = "none";
					oneStrong.innerHTML = va;
					oneInput.value = va;
					allDefault();
					return; //不走下面的代码了
				}
				curData.title = oneInput.value; //把数据中的title改成当前的value值
				tree.innerHTML = addHtml.createTreeHtml(datas, -1); //重新渲染树形结构
				tools.removeClass(tools.getTreeById("treeTitle", 0), "bg");
				tools.addClass(tools.getTreeById("treeTitle", parentId), "bg"); //给当前id一样的tree添加背景颜色
				allDefault();
				oneStrong.style.display = "block";
				oneInput.style.display = "none";
				oneStrong.innerHTML = oneInput.value;
				//重命名前与重名名后的名字如果一样，就不提醒   重命名成功
				if(oneInput.value.trim() !== va) {
					popupTips.src = arrImg[4];
					remark();
				}
				document.removeEventListener('mousedown', fm, false)
			}
			if(remove.onOff) return;
			document.addEventListener("mousedown", fm, false)
				//点击回车也可以重命名成功
			document.addEventListener('keydown', function(ev) {
				if(ev.keyCode == 13) {
					fm();
				}
			}, false)
		}
	}
}
//-----------------------------剪影----右键菜单------自由选框------------------------

var shadows = null;
var tips = null;
var isDrag = false; //是否在拖拽剪影
var disX = 0;
var disY = 0;
var shadowTarget = null;
var duangObj = null; //用于保存碰到的那个文件
var rightClickM = null;
//点击右键，出现菜单弹框
document.oncontextmenu = function(ev) {
	ev.stopPropagation()
	var target = ev.target;
	if(!tools.parents(target, ".fileItem")) return;
	allDefault();
	if(!rightClickM) { //如果没有右键菜单，点击右键的时候，添加菜单，否则改变菜单的坐标
		rightClickM = addHtml.rightMenu(); //菜单结构渲染
		document.body.appendChild(rightClickM); //塞给body
		rightClickM.style.left = ev.clientX + 'px';
		rightClickM.style.top = ev.clientY + 'px';
	} else {
		rightClickM.style.left = ev.clientX + 'px';
		rightClickM.style.top = ev.clientY + 'px';
	}
	var parentItem = tools.parents(target, ".fileItem");
	tools.addClass(parentItem, 'blue'); //右键点击时所在文件是选中的，添加背景颜色
	parentItem.firstElementChild.style.display = "block";
	parentItem.firstElementChild.style.backgroundPositionY = "-421px"; //按钮时选中的状态
	parentItem.firstElementChild.state = false;
	var rightClick = tools.$(".rightClick")[0];
	var allSpan = tools.$('span', rightClick);
	allSpan[1].onmouseup = function(ev) { //点击菜单栏中的  删除
		deleteFn();
		document.body.removeChild(rightClickM)
		rightClickM = null;
	}
	allSpan[3].onmouseup = function(ev) { //点击菜单栏中的  重命名
		reNameFn();
		document.body.removeChild(rightClickM);
		rightClickM = null;
	}
	allSpan[1].onmousedown = allSpan[2].onmousedown = allSpan[3].onmousedown = function(ev) {
		ev.stopPropagation(); //阻止冒泡
	}
	allSpan[2].onmouseup = function(ev) { //点击菜单栏中的  移动到
		clickMoveTo();
		document.body.removeChild(rightClickM);
		rightClickM = null;
	}
	return false;
}
document.addEventListener("mousedown", function(ev) {
	var target = ev.target;
	if(ev.which == 3 || tools.parents(target, ".dialogP") || 
		tools.parents(target, ".rightClick") || 
		tools.parents(target, ".checked") || tools.parents(target, ".file-nav") || 
		tools.parents(target, ".centerMenu") || deleteB.onOff || remove.onOff) return;
	disX = ev.clientX;
	disY = ev.clientY;
	if(rightClickM) { //点击document的时候，如果有右键菜单显示，就把右键菜单移出body，同时设为null
		document.body.removeChild(rightClickM);
		rightClickM = null;
	}
	if(tools.parents(target, ".fileItem")) { //点击文件的时候，移动出现剪影
		shadows = null;
		document.addEventListener('mousemove', moveFn, false);
		document.addEventListener('mouseup', upFn, false);
		shadowTarget = tools.parents(target, ".fileItem");
		return;
	} else {
		allDefault(); //点击document，回到原来状态（勾选的不被勾选）
	}
	var newDiv = document.createElement("div");
	document.body.insertBefore(newDiv, document.body.firstElementChild);
	newDiv.className = "dialog";
	//移动时计算dialog的宽高
	document.onmousemove = function(ev) {
		if(Math.abs(ev.clientX - disX) < 10) {
			newDiv.style.display = "none";
		} else {
			newDiv.style.display = "block";
		}
		//自由选框的宽高和坐标
		newDiv.style.width = Math.abs(ev.clientX - disX) + 'px';
		newDiv.style.height = Math.abs(ev.clientY - disY) + 'px';
		newDiv.style.left = Math.min(ev.clientX, disX) + 'px';
		newDiv.style.top = Math.min(ev.clientY, disY) + 'px';
		//for循环，看dialog碰到了那些文件，碰到的就选中，否则不选中文件
		for(var i = 0; i < allFiles.length; i++) {
			if(tools.duang(newDiv, allFiles[i])) {
				tools.addClass(allFiles[i], 'blue');
				allInput[i].style.display = "block";
				allInput[i].style.backgroundPositionY = "-421px";
				allInput[i].state = false;
			} else {
				tools.removeClass(allFiles[i], 'blue');
				tools.removeClass(allFiles[i], 'skyblue');
				allInput[i].style.display = "none";
				allInput[i].style.backgroundPositionY = "-370px";
				allInput[i].state = true;
			}
		}
	}
	document.onmouseup = function() {
		document.onmousemove = null;
		var newDiv = tools.$(".dialog")[0];
		if(newDiv) {
			document.body.removeChild(newDiv);
		}
		selected();
	}
	ev.preventDefault(); //清除默认行为
})

function moveFn(ev) {
	if(Math.abs(ev.clientX - disX) < 10) return;
	if(!shadows) {
		shadows = addHtml.moveFileShadow();
		shadows.style.display = "block";
		document.body.appendChild(shadows);
		tips = document.createElement("div");
		tips.style.cssText = 'width:40px;height: 40px;position:absolute;left:0;top:0;'
		document.body.appendChild(tips);
	}
	isDrag = true;
	tips.style.left = ev.clientX + 'px';
	tips.style.top = ev.clientY + 'px';

	shadows.style.left = ev.clientX + 10 + 'px';
	shadows.style.top = ev.clientY + 10 + 'px';
	if(!tools.hasClass(shadowTarget, 'blue')) { //如果托剪影的时候，当前鼠标所在的文件夹没被选中，就选中
		for(var i = 0; i < allFiles.length; i++) { //清空所有
			tools.removeClass(shadowTarget, 'blue');
			tools.removeClass(allFiles[i], 'skyblue');
			tools.removeClass(allFiles[i], 'blue');
			allInput[i].style.display = "none";
			allInput[i].style.backgroundPositionY = '-370px';
			allInput[i].state = true;
		}
		tools.addClass(shadowTarget, 'blue'); //给文件添加背景颜色
		tools.addClass(shadowTarget, 'skyblue');
		var checkOne = shadowTarget.firstElementChild;
		checkOne.style.display = "block";
		checkOne.style.backgroundPositionY = "-421px"; //文件上的按钮时选中的
		checkOne.state = false;
	}
	var sum = tools.$(".sum", shadows)[0];
	sum.innerHTML = whichSelect().length; //剪影上的文件数量
	var icons = tools.$(".icons", shadows)[0];
	var str = '';
	var len = whichSelect().length > 4 ? 4 : whichSelect().length; //计算剪影上小文件的数量，最多为4,

	for(var i = 0; i < len; i++) { //根据len生成小文件剪影
		str += '<i class="icon icon' + i + '"></i> ';
	}

	icons.innerHTML = str;
	duangObj = null; //清空被碰撞元素

	//碰撞检测
	for(var i = 0; i < allFiles.length; i++) {
		//要碰撞的元素是否存在于被选中的数组中
		if(!indexOf(whichSelect(), allFiles[i]) && tools.duang(tips, allFiles[i])) {
			tools.addClass(allFiles[i], 'duangBlue');
			duangObj = allFiles[i];
		} else {
			tools.removeClass(allFiles[i], 'duangBlue');
		}
	}
}

function upFn() {
	isDrag = false; //鼠标抬起的时候，拖拽的状态结束
	document.removeEventListener('mousemove', moveFn, false); //移出document身上的事件
	document.removeEventListener('mouseup', upFn, false);
	if(shadows) { //鼠标抬起时剪影消失，从body里移出，并把shadows = null，以便下次再拖剪影
		shadows.style.display = "none";
		document.body.removeChild(shadows);
		document.body.removeChild(tips);
		shadows = null;
	}
	//判断是否碰上了
	if(duangObj) {
		var moveId = duangObj.dataset.fileId; //被碰撞的文件的dataset.fileId
		var childsTitle = dataAction.getChildsById(datas, moveId); //找到被碰撞文件的子文件title，方便与拖拽的文件的title对比，如果重名，则不能移动
		var onOff = true;
		for(var t = 0; t < whichSelect().length; t++) {
			//找到选中的文件的数据，每次拿出一个跟被碰撞文件的子文件对比title
			var selectData = dataAction.getDataById(datas, whichSelect()[t].dataset.fileId);
			for(var j = 0; j < childsTitle.length; j++) {
				if(childsTitle[j].title == selectData.title) {
					popupTips.src = arrImg[10];
					remark();
					onOff = false;
					break;
				}
			}
			if(onOff) {
				selectData.pid = moveId;
			}
		}
		//重新渲染文件区域，菜单区域
		var curId = tools.$(".current-path")[0].dataset.fileId;
		fileBox.innerHTML = filesHtml(datas, curId)
		tree.innerHTML = addHtml.createTreeHtml(datas, -1);
		tools.removeClass(tools.getTreeById("treeTitle", 0), "bg");
		tools.addClass(tools.getTreeById("treeTitle", curId), "bg");
		addEventFile(); //添加文件点击事件
		duangObj = null;
	}
}

function indexOf(arr, item) {
	for(var i = 0; i < arr.length; i++) {
		if(arr[i] === item) { //碰到自身返回true
			return true;
		}
	}
	return false;
}