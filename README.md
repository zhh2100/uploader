<pre>
https://github.com/qqtxt/uploader
兼容jquery1.7+ 2,3都支持 
新增canvas压缩  支持canvas就可以压缩图片后上传，100kb内图片不作压缩  app内用过 兼容性好

$(".camera-area").fileUpload({
	"url": "uploader.php",
	"file": "myFile"
});


$(".camera-area").fileUpload({
		"url"				: "uploader.php",	//上传接收文件				必选
		"file"				: "myFile",			//上传给后台接收的$_FILES['myFile']['name'] <input name=	必选
		'fileToUpload'		: ".fileToUpload",	//上传输入框,选择文件用		必选
		'thumb_template'	: ".thumb_template",//预览模板					必选
		'upload_progress'	: ".upload_progress",//上传进度											可选
		'save'				: ".save",			//保存已上传图片名 $().attr('value',1.jpg|2.jpg)	可选
		'id'				: "data-id",//当前元素内attr('data-id') 可以传一个id值到uploader.php以绑定库记录		可选
		"is_multi"			: "true",			//上传多张图片 缩略图多张append,单张替换
		"is_del"			: "true",			//上传图片是否能删除   加遮罩删除按钮
		"preCheck"			: function(files){return true;},//上传前检查
		"preComplete"		: function(evt){return true;},//上传完成之前
		"complete"			: function(){}		//上传完成后的函数
});


ImageResizer({
	resizeMode:"auto"//压缩模式，总共有三种  auto,width,height auto表示自动根据最大的宽度及高度等比压缩，width表示只根据宽度来判断是否需要等比例压缩，height类似。  
	,dataSource:"" //数据源。数据源是指需要压缩的数据源，有三种类型，image图片元素，base64字符串，canvas对象，还有选择文件时候的file对象。。。  
	,dataSourceType:"image" //image  base64 canvas
	,maxWidth:500 //允许的最大宽度
	,maxHeight:500 //允许的最大高度。
	,onTmpImgGenerate:function(img){} //当中间图片生成时候的执行方法。。这个时候请不要乱修改这图片，否则会打乱压缩后的结果。  
	,success:function(resizeImgBase64,canvas){
	}//压缩成功后图片的base64字符串数据。
});
</pre>