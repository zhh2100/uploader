 /*H5上传 zepto扩展  jquery扩展
 用法
$(".camera-area").fileUpload({
	"url": "upload.php",
	"file": "myFile"
});

 */
(function($) {
	var settings = {
		'thumb_template'	: ".thumb_template",//预览模板
		'fileToUpload'		: ".fileToUpload",//上传输入框
		'upload_progress'	: ".upload_progress",//上传进度
		"url"				: "uploader.php",	//上传接收文件
		"file"				: "myFile"			//上传<input name=
	};
	var upload_arr={};//上传图片  预览图的id=>上传文件名
	var upload_id=0;//上传图片id
	var lock=false;//上传锁定
	$.extend($.fn, {
		fileUpload: function(opts) {
			this.each(function(){
				if(opts){
					$.extend(settings, opts);
				}
				var $self = $(this);
				//在body最后加个用于组装预览的id
				$('body').append('<span id="tmp_thumb_template123" style="display:none;"></span>');				
				var doms = {
					"fileToUpload": $self.find(settings.fileToUpload),
					"thumb_wrap": $self.find(settings.thumb_template).wrap('<span/>').parent(),
					"tmp_thumb_template": $('#tmp_thumb_template123'),
					"progress": $self.find(settings.upload_progress)
				};
				doms.tmp_thumb_template.html(doms.thumb_wrap.html());
				doms.thumb_wrap.html('');//清空装预览
								
				var funs = {
					//选择文件，获取文件大小，也可以在这里获取文件格式，限制用户上传非要求格式的文件
					"fileSelected": function() {
						var files = (doms.fileToUpload)[0].files;
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
						var files = (doms.fileToUpload)[0].files;
						var count = files.length;
						for (var index = 0; index < count; index++) {
							fd.append(opts.file, files[index]); //将文件添加到表单数据中
							funs.previewImage(files[index]); //上传前预览图片，也可以通过其他方法预览txt
						}
						var xhr = new XMLHttpRequest();
						xhr.upload.addEventListener("progress", funs.uploadProgress, false); //监听上传进度
						xhr.addEventListener("load", funs.uploadComplete, false);
						xhr.addEventListener("error", opts.uploadFailed, false);
						xhr.open("POST", opts.url);
						xhr.send(fd);
					},
					//文件预览
					"previewImage": function(file) {
						var img = document.createElement("img");
						img.file = file;
						doms.tmp_thumb_template.find(settings.thumb_template).html(img);
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
							doms.progress.html(percentComplete.toString() + '%');
						}
					},
					"uploadComplete": function(evt) {
						doms.thumb_wrap.append(doms.tmp_thumb_template.html());
						var last_id='more_thumb_'+ ((upload_id++)+1);
						var last_elem=doms.thumb_wrap.children(settings.thumb_template+':last');
						last_elem.attr('id',last_id);
						upload_arr[last_id]=evt.target.responseText;						
						//添加鼠标放上去删除样式
						last_elem.css('position','relative');
						last_elem.append('<p class="thumb_mask123" style="position:absolute;top:0;left:0;width:100%;height:100%;margin:0;text-align: center;line-height:100%;font-size:13px;color:#fff;background:#3b3b3b;filter:alpha(opacity=20);    opacity:.8;display:none;cursor:pointer;">删除</p>');
						last_elem.children('.thumb_mask123').css('line-height',last_elem.height()+'px');
						$(settings.thumb_template).hover(
							function() {								
								$(this).children('.thumb_mask123').show();
							},
							function() {
								$(this).children('.thumb_mask123').hide();
							}
						);
						last_elem.children('.thumb_mask123').click(function(){
							last_elem.remove();
							upload_arr[last_elem.attr('id')]=null;
							funs.alertObj(upload_arr);
							alert(funs.count(upload_arr));
						});
						lock=false;
					}

				};
				doms.fileToUpload.on("change",
					function() {
						doms.progress.find("span").width("0");
						funs.fileSelected();
				});
			});
		}
	});
})(jQuery);
