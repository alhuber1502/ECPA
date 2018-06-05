<?php

$post="";
$ph=fopen("php://input", "rb");
while (!feof($ph)) {
	$post .= fread($ph, 4096);
}
fclose($ph);

$filePathAndName = $_GET["file"];
if($filePathAndName){
	$fp = fopen($filePathAndName, "w+");
	if($fp) {
		fputs($fp, $post);
		fclose($fp);
		echo "Saved $filename";
	} else {
		echo "Failed to save $filename";
	}
}

?>