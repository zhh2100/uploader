 /*H5上传 zepto扩展  jquery扩展     增加了压缩，最大宽高设置在391行   去掉压缩99行与100行对掉注释
 用法
$(".camera-area").fileUpload({
	"url": "upload.php",
	"file": "myFile"
});


 */
(function($) {
	var settings = {
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
	};
	var compress_num=0;//已压缩多少张图
	$.extend($.fn, {
		fileUpload: function(opts){
			this.each(function(){
				var upload_arr={};//上传图片  预览图的id=>上传文件名
				var lock=false;//上传锁定
				if(opts){
					$.extend(settings, opts);
				}
				var $self = $(this);
				//在body最后加个用于组装预览的id
				var thumb_length=$('.tmp_thumb_template').length;
				$('body').append('<span class="tmp_thumb_template" id="tmp_thumb_template'+thumb_length+'" style="display:none;"></span>');
				var variable= {
					"fileToUpload": $self.find(settings.fileToUpload),
					"thumb_wrap": $self.find(settings.thumb_template).wrap('<span/>').parent(),
					"tmp_thumb_template": $('#tmp_thumb_template'+thumb_length),
					"progress": $self.find(settings.upload_progress),
					"save": $self.find(settings.save),
					"id": $self.attr(settings.id),
					"upload_id": 0,
				};
				variable.tmp_thumb_template.html(variable.thumb_wrap.html());
				//variable.thumb_wrap.html('');//清空装预览
								
				var funs = {
					//选择文件，获取文件大小，也可以在这里获取文件格式，限制用户上传非要求格式的文件
					"fileSelected": function() {
						var files = (variable.fileToUpload)[0].files;
						var count = files.length;
						var fileSize = 0;
						for (var index = 0; index < count; index++) {
							var file = files[index];
							fileSize += file.size;
							//console.log(file);
						}
						if(settings.preCheck(files)){//上传前检查
							funs.uploadFile();
						}
					},
					"alertObj":function(obj){ 
						var description = ""; 
						for(var i in obj){ 
							var property=obj[i]; 
							description+=i+" = "+property+"\n"; 
						} 
						alert(description); 
					},
					//把上传图片写入attr  uploadAttr=1.jpg|2.jpg
					"writeUploadAttr":function(){ 
						var uploadAttr = ""; 
						for(var i in upload_arr){ 
							if(upload_arr[i]!==null && typeof(upload_arr[i])=='string'){
								var property=upload_arr[i]; 
								uploadAttr+=uploadAttr ? "|"+property : property; 
							}
						}
						//默认写到当前id上
						variable.save.length ? variable.save.attr('value',uploadAttr) :$self.attr('value',uploadAttr);
					},
					"count": function() {
						var num=0;
						for(k in upload_arr)if(upload_arr[k]!==null)num++;
						return num;
					},
					//异步上传文件
					"uploadFile": function() {
						if(lock) return false;
						lock=true;
						var fd = new FormData(); //创建表单数据对象
						var files = (variable.fileToUpload)[0].files;
						var count = files.length;
						compress_num=0;
						for (var index = 0; index < count; index++) {
							compress(settings.file,fd,files[index]);
							//fd.append(settings.file, files[index]);compress_num++; //将文件添加到表单数据中
							funs.previewImage(files[index]); //上传前预览图片，也可以通过其他方法预览txt
						}						
						//追加一个ID供上传程序
						if(variable.id){
							fd.append('id',variable.id);
						}
						variable.progress.show();//显示上传进度
						var uploadImg=function(){
							if(compress_num==count){
								var xhr = new XMLHttpRequest();
								xhr.upload.addEventListener("progress", funs.uploadProgress, false); //监听上传进度
								xhr.addEventListener("load", funs.uploadComplete, false);
								xhr.addEventListener("error", funs.uploadFailed, false);
								xhr.open("POST", settings.url);
								xhr.send(fd);
							}else setTimeout(uploadImg,100);
						};
						uploadImg();
					},
					//文件预览
					"previewImage": function(file) {
						var img = document.createElement("img");
						img.file = file;
						variable.tmp_thumb_template.find(settings.thumb_template).html(img);
						// 使用FileReader方法显示图片内容
						var reader = new FileReader();
						reader.onload = (function(aImg) {
							return function(e) {
								aImg.src = e.target.result;
							};
						})(img);
						reader.readAsDataURL(file);
					},
					"uploadProgress": function(evt) {
						if (evt.lengthComputable) {
							var percentComplete = Math.round(evt.loaded * 100 / evt.total);
							variable.progress.html(percentComplete.toString() + '%');
						}
					},
					"uploadFailed": function(evt) {
						//console.log(evt);
						alert('上传失败,请重试！');
						lock=false;
					},
					"uploadComplete": function(evt) {
						if(settings.preComplete(evt)==false){
							lock=false;
							return;
						}
						if(evt.target.responseText==''){
							alert('上传失败,请重试！');
							lock=false;
							return;
						}
						//是否上传多张图片
						if(settings.is_multi=='true'){
							variable.thumb_wrap.append(variable.tmp_thumb_template.html());
							variable.upload_id++;
						}else{
							variable.thumb_wrap.html(variable.tmp_thumb_template.html());
							variable.upload_id=1;
						}						
						var last_elem=$self.find(settings.thumb_template).last();
						last_elem.attr('data-id',variable.upload_id);
						upload_arr[variable.upload_id]=evt.target.responseText;//保存上传图片
						//如果需要添加鼠标放上去删除图片 加删除遮罩  
						if(settings.is_del=='true'){
							last_elem.css('position','relative');
							last_elem.append('<p class="thumb_mask123" style="position:absolute;top:0;left:0;width:100%;height:100%;margin:0;text-align: center;line-height:100%;font-size:13px;color:#fff;background:#3b3b3b;filter:alpha(opacity=20);    opacity:.8;display:none;cursor:pointer;">删除</p>');
							last_elem.children('.thumb_mask123').css('line-height',last_elem.height()+'px');
							last_elem.hover(
								function() {								
									$(this).children('.thumb_mask123').show();
								},
								function() {
									$(this).children('.thumb_mask123').hide();
								}
							);
							last_elem.children('.thumb_mask123').click(function(){
								last_elem.remove();
								upload_arr[last_elem.attr('data-id')]=null;
								funs.writeUploadAttr();
								//funs.alertObj(upload_arr);alert(funs.count(upload_arr));
							});
						}
						lock=false;
						funs.writeUploadAttr();
						settings.complete($self);
						//variable.progress.html('');
					}

				};
				variable.fileToUpload.on("change",
					function() {
						variable.progress.html('');
						funs.fileSelected();
				});
			});
		}
	});
	
	/**
	 * 这是基于html5的前端图片工具，压缩工具。
	 */
	var ImageResizer=function(opts){
		var settings={
			resizeMode:"auto"//压缩模式，总共有三种  auto,width,height auto表示自动根据最大的宽度及高度等比压缩，width表示只根据宽度来判断是否需要等比例压缩，height类似。  
			,dataSource:"" //数据源。数据源是指需要压缩的数据源，有三种类型，image图片元素，base64字符串，canvas对象，还有选择文件时候的file对象。。。  
			,dataSourceType:"image" //image  base64 canvas
			,maxWidth:500 //允许的最大宽度
			,maxHeight:500 //允许的最大高度。
			,onTmpImgGenerate:function(img){} //当中间图片生成时候的执行方法。。这个时候请不要乱修改这图片，否则会打乱压缩后的结果。  
			,success:function(resizeImgBase64,canvas){
			}//压缩成功后图片的base64字符串数据。
		};
		var appData={};
		$.extend(settings,opts);
		
		var innerTools={
			getBase4FromImgFile:function(file,callBack){
				var reader = new FileReader();
				reader.onload = function(e) {
					var base64Img= e.target.result;
					if(callBack){
						callBack(base64Img);
					}
				};
				reader.readAsDataURL(file);
			},

			//--处理数据源。。。。将所有数据源都处理成为图片对象，方便处理。
			getImgFromDataSource:function(datasource,dataSourceType,callback){
				var _me=this;
				var img1=new Image();
				if(dataSourceType=="img"||dataSourceType=="image"){
					img1.src=$(datasource).attr("src");
				}
				else if(dataSourceType=="base64"){
					img1.src=datasource;
				}
				else if(dataSourceType=="canvas"){
					img1.src = datasource.toDataURL("image/jpeg");
				}
				else if(dataSourceType=="file"){
					_me.getBase4FromImgFile(function(base64str){
						img1.src=base64str;
					});
				}
				if(callback){
					img1.onload = function(){
						callback(img1);
					}
				}			
			},

			//计算图片的需要压缩的尺寸。当然，压缩模式，压缩限制直接从setting里面取出来。
			getResizeSizeFromImg:function(img){
				var _img_info={
					w:$(img)[0].naturalWidth,
					h:$(img)[0].naturalHeight
				};

				var _resize_info={
				   w:0,
				   h:0
				};

				if(_img_info.w <= settings.maxWidth && _img_info.h <= settings.maxHeight){
					return _img_info;
				}
				if(settings.resizeMode=="auto"){
					var _percent_scale=parseFloat(_img_info.w/_img_info.h);
					var _size1={
						w:0,
						h:0
					};
					var _size_by_mw={
						w:settings.maxWidth,
						h:parseInt(settings.maxWidth/_percent_scale)
					};
					var _size_by_mh={
						w:parseInt(settings.maxHeight*_percent_scale),
						h:settings.maxHeight
					};
					if(_size_by_mw.h <= settings.maxHeight){
						return _size_by_mw;
					}
					if(_size_by_mh.w <= settings.maxWidth){
						return _size_by_mh;
					}

					return {
						w:settings.maxWidth,
						h:settings.maxHeight
					};
				}
				if(settings.resizeMode=="width"){
					if(_img_info.w<=settings.maxWidth){
						return _img_info;
					 }
					var _size_by_mw={
						w:settings.maxWidth
						,h:parseInt(settings.maxWidth/_percent_scale)
					};
					return _size_by_mw;
				}
				if(settings.resizeMode=="height"){
					if(_img_info.h<=settings.maxHeight){
						return _img_info;
					}
					var _size_by_mh={
						w:parseInt(settings.maxHeight*_percent_scale)
						,h:settings.maxHeight
					};
					return _size_by_mh;
				}
			},

			//--将相关图片对象画到canvas里面去。
			drawToCanvas:function(img,theW,theH,realW,realH,callback){
				var canvas = document.createElement("canvas");
				canvas.width=theW;
				canvas.height=theH;
				var ctx = canvas.getContext('2d');
				ctx.drawImage(img,
					0,//sourceX,
					0,//sourceY,
					realW,//sourceWidth,
					realH,//sourceHeight,
					0,//destX,
					0,//destY,
					theW,//destWidth,
					theH//destHeight
				);

				//--获取base64字符串及canvas对象传给success函数。
				var base64str=canvas.toDataURL("image/png");
				if(callback){
					callback(base64str,canvas);
				}
			}
		};

		//--开始处理。
		innerTools.getImgFromDataSource(settings.dataSource,settings.dataSourceType,function(_tmp_img){
			var __tmpImg=_tmp_img;
			settings.onTmpImgGenerate(_tmp_img);

			//--计算尺寸。
			var _limitSizeInfo=innerTools.getResizeSizeFromImg(__tmpImg);
			var _img_info={
				w:$(__tmpImg)[0].naturalWidth,
				h:$(__tmpImg)[0].naturalHeight
			};

			innerTools.drawToCanvas(__tmpImg,_limitSizeInfo.w,_limitSizeInfo.h,_img_info.w,_img_info.h,function(base64str,canvas){  
			  settings.success(base64str,canvas);
			});
		});

		var returnObject={


		};

		return returnObject;
	};
	
	//base64转为blob
	var dataURLtoBlob=function(dataurl){
		var arr=dataurl.split(','),mime=arr[0].match(/:(.*?);/)[1], bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
		while(n--){
			u8arr[n] = bstr.charCodeAt(n);
		}
		return new Blob([u8arr], {type:mime});
	};	
	var compress=function(myFile,fd,oFile){		
		var imgSize = oFile.size;
		if(imgSize < 50 * 1024){//小于50Kb不压缩
			fd.append(myFile, oFile);
			compress_num++;
		}else{//图片压缩处理
			var reader   = new FileReader();
			reader.onload = function(e) {
				var base64Img= e.target.result;
				//--执行resize。
				var _ir=ImageResizer({
					resizeMode:"auto",
					dataSource:base64Img,
					dataSourceType:"base64",
					maxWidth:1000, //允许的最大宽度
					maxHeight:1000, //允许的最大高度。
					success:function(resizeImgBase64,canvas){
						var blob = dataURLtoBlob(resizeImgBase64);
						if(blob.size<imgSize){
							fd.append(myFile, blob, oFile['name']);							
						}else{
							fd.append(myFile, oFile);
						}
						compress_num++;
					}
				});
			};
			reader.readAsDataURL(oFile);
		}

	}	
	
})(jQuery);








