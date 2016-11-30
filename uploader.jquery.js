 /*H5上传 zepto扩展  jquery扩展
 用法
$(".camera-area").fileUpload({
	"url": "upload.php",
	"file": "myFile"
});


 */
(function($) {
	var settings = {
		"url"				: "uploader.php",	//上传接收文件		必选
		"file"				: "myFile",			//上传<input name=	必选
		'fileToUpload'		: ".fileToUpload",	//上传输入框		必选
		'thumb_template'	: ".thumb_template",//预览模板			必选
		'upload_progress'	: ".upload_progress",//上传进度										可选
		'save'				: ".save",			//保存已上传图片 $().attr('value',1.jpg|2.jpg)	可选
		'id'				: "data-id",//当前元素内attr('data-id') 可以传一个id值到uploader.php以绑定库记录		可选
		"is_multi"			: "true",			//上传多张图片 缩略图多张append,单张替换
		"is_del"			: "true"			//上传图片是否能删除   加遮罩删除按钮
	};
	$.extend($.fn, {
		fileUpload: function(opts) {
			this.each(function(){
				var upload_arr={};//上传图片  预览图的id=>上传文件名
				var lock=false;//上传锁定
				if(opts){
					$.extend(settings, opts);
				}
				var $self = $(this);
				//在body最后加个用于组装预览的id
				if($('#tmp_thumb_template123').length==0)
					$('body').append('<span id="tmp_thumb_template123" style="display:none;"></span>');				
				var variable= {
					"fileToUpload": $self.find(settings.fileToUpload),
					"thumb_wrap": $self.find(settings.thumb_template).wrap('<span/>').parent(),
					"tmp_thumb_template": $('#tmp_thumb_template123'),
					"progress": $self.find(settings.upload_progress),
					"save": $self.find(settings.save),
					"id": $self.attr(settings.id),
					"upload_id": 0,
				};
				variable.tmp_thumb_template.html(variable.thumb_wrap.html());
				variable.thumb_wrap.html('');//清空装预览
								
				var funs = {
					//选择文件，获取文件大小，也可以在这里获取文件格式，限制用户上传非要求格式的文件
					"fileSelected": function() {
						var files = (variable.fileToUpload)[0].files;
						var count = files.length;
						for (var index = 0; index < count; index++) {
							var file = files[index];
							var fileSize = 0;
							if (file.size > 1024 * 1024) fileSize = (Math.round(file.size * 100 / (1024 * 1024)) / 100).toString() + 'MB';
							else fileSize = (Math.round(file.size * 100 / 1024) / 100).toString() + 'KB';
						}
						funs.uploadFile();
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
						for (var index = 0; index < count; index++) {
							fd.append(settings.file, files[index]); //将文件添加到表单数据中
							funs.previewImage(files[index]); //上传前预览图片，也可以通过其他方法预览txt
						}
						//追加一个ID供上传程序
						if(variable.id){
							fd.append('id',variable.id);
						}
						var xhr = new XMLHttpRequest();
						xhr.upload.addEventListener("progress", funs.uploadProgress, false); //监听上传进度
						xhr.addEventListener("load", funs.uploadComplete, false);
						xhr.addEventListener("error", funs.uploadFailed, false);
						xhr.open("POST", settings.url);
						xhr.send(fd);
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
						alert('上传失败！');
					},
					"uploadComplete": function(evt) {
						if(evt.target.responseText==''){
							alert('上传失败！');
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
})(jQuery);