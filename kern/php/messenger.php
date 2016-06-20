<?php
define('FILE_BOM', "\xef\xbb\xbf");// alternative define('FILE_BOM', "");
define('FILE_CMOD', 0660);         // falls möglich define('FILE_CMOD', 0600);
define('FILE_MAX_SIZE', 100000);   // in Byte

function file_append($file_name, $append_string, $file_max_size=FILE_MAX_SIZE) {
  if (@file_exists($file_name)) { @chmod($file_name, FILE_CMOD); $fileSize = @filesize($file_name);
  } else { $fileSize = 0;
  }
  if ($fileSize + strlen($append_string) > $file_max_size) {
    echo json_encode(array('error' => 'Max file size reached'));
    exit;
  }
  if ($fileSize == 0) { $append_string = FILE_BOM . $append_string;}
  if (@file_put_contents($file_name, $append_string, FILE_APPEND) === false) {
    echo json_encode(array('error' => 'Could not write to file'));
  } else {
    echo json_encode(array('success' => true));
  } @chmod($file_name, FILE_CMOD);
}




//----- MAIN
if ($_POST['name'] && $_POST['text']) {
	file_append('messages.txt', $_POST['text']);
}