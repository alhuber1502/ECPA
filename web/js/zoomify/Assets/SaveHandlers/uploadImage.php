<?php
// Data start example: 'zoomifySavedImage,data:image/jpeg;base64,iVBOR...' or 'data:image/png;base64,iVBOR...'

$rawData = file_get_contents("php://input");

$beginData = strpos($rawData, "fileToUpload") + 17;
$endData = strpos($rawData, "==");
$postData = substr($rawData, $beginData, $endData - $beginData);

$delim0 = strpos($postData, ",");
$delim1 = strpos($postData, "image/") + 6;
$delim2 = strpos($postData, ";");
$delim3 = strpos($postData, ",", $delim2);

if ($delim0 && $delim1 && $delim2 && $delim3) {
	$fileNameTest = substr($postData, 0, $delim0);
	$fileName = (isset($fileNameTest)) ? $fileNameTest : 'zoomifySavedImage';
	$fileFormat = substr($postData, $delim1, $delim2 - $delim1);
	$fileExtension = ($fileFormat == 'jpeg') ? 'jpg' : $fileFormat;
	$fileName = $fileName . '.' . $fileExtension;

	$filteredCanvasData = substr($postData, $delim3 + 1);
	if (isset($filteredCanvasData)) {
		$unencodedData = base64_decode($filteredCanvasData);
		$fp = fopen($fileName, 'wb');
		fwrite($fp, $unencodedData);
		fclose($fp );

		// Debug option: replace $fp and fwrite lines above with the following:
		//$fp = fopen('ztest.txt', 'wb');
		//fwrite($fp, $fileNameTest . '   ' . $fileName . '   ' . $fileFormat . '   ' . $filteredCanvasData);
	}
}

?>