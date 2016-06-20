<?php
define('FILE_BOM', "\xef\xbb\xbf");// alternative define('FILE_BOM', "");
define('FILE_CMOD', 0660);         // falls möglich define('FILE_CMOD', 0600);
define('FILE_MAX_SIZE', 100000);   // in Byte
ini_set('display_errors',0); error_reporting(0);


class jsEncode {

    /**
     * Encodes or decodes string according to key
     * 
     * @access public
     * @param mixed $str
     * @param mixed $decodeKey
     * @return string
     */
     
    public function encodeString($str,$decodeKey) {
         $result = "";
         for($i = 0;$i < strlen($str);$i++) {
            $a = $this->_getCharcode($str,$i);
            $b = $a ^ $decodeKey;
            $result .= $this->_fromCharCode($b);
         }
        
         return $result;
      }
    
      /**
       * PHP replacement for JavaScript charCodeAt.
       * 
       * @access private
       * @param mixed $str
       * @param mixed $i
       * @return string
       */
      private function _getCharcode($str,$i) {
           return $this->_uniord(substr($str, $i, 1));
      }
    
      /**
       * Gets character from code.
       * 
       * @access private
       * @return string
       */
      private function _fromCharCode(){
        $output = '';
        $chars = func_get_args();
        foreach($chars as $char){
          $output .= chr((int) $char);
        }
        return $output;
      }
    
    
      /**
       * Multi byte ord function.
       * 
       * @access private
       * @param mixed $c
       * @return mixed
       */
      private function _uniord($c) {
          $h = ord($c{0});
          if ($h <= 0x7F) {
              return $h;
          } else if ($h < 0xC2) {
              return false;
          } else if ($h <= 0xDF) {
              return ($h & 0x1F) << 6 | (ord($c{1}) & 0x3F);
          } else if ($h <= 0xEF) {
              return ($h & 0x0F) << 12 | (ord($c{1}) & 0x3F) << 6 | (ord($c{2}) & 0x3F);
          } else if ($h <= 0xF4) {
              return ($h & 0x0F) << 18 | (ord($c{1}) & 0x3F) << 12 | (ord($c{2}) & 0x3F) << 6 | (ord($c{3}) & 0x3F);
          } else {
              return false;
          }
      }
}

function appendFile($file_name, $append_string, $password, $file_max_size=FILE_MAX_SIZE) {

  if (file_exists($file_name)) { chmod($file_name, FILE_CMOD); $fileSize = filesize($file_name);
  } else { $fileSize = 0;
  }
  if ($fileSize + strlen($append_string) > $file_max_size) {
    echo json_encode(array('error' => 'Max file size reached'));
    exit;
  }
  if ($fileSize == 0) { $append_string = FILE_BOM . $append_string;}
  if (file_put_contents($file_name, $append_string, FILE_APPEND) === false) {
    echo json_encode(array('error' => 'Could not write to file'));
  } else {
    echo json_encode(array('success' => true));
  } chmod($file_name, FILE_CMOD);
}

function getContentFromFile($password, $file) {
  $encoder = new jsEncode();
  $content = file_get_contents($file);
  //return $content;
  return $encoder->encodeString($content, $password);
}

//Default pass for now
$password = "abc";


//----- MAIN
if (isset($_POST['name']) && isset($_POST['text'])) {
	appendFile('messages.txt', $_POST['text'], $password);
}

else if (isset($_POST['password'])) {
  echo json_encode(array('content' => getContentFromFile($_POST['password'], 'messages.txt')));
}