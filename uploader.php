<?php
session_start();
if(empty($_REQUEST['act'])){
	if (isset($_FILES['myFile'])) {
		//扩展名
		$ext=strtolower(substr($_FILES['myFile']['name'],strrpos($_FILES['myFile']['name'],'.')));
		//唯一临时文件名
		if(in_array($ext,array('.jpg','.png','.gif'))){
			list($usec, $sec) = explode(" ", microtime());
			$name=$sec.intval($usec*10000000).$ext;
			if(move_uploaded_file($_FILES['myFile']['tmp_name'], $_SERVER['DOCUMENT_ROOT'].'/'.$name)){
				echo $name;
			}
		}
	}
	echo '';
}
