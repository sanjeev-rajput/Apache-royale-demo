package com.extjavascript.cryp
{   
	public class CryptoJS
	{
		/** 
         * <inject_script>
		 * var script = document.createElement("script");
		 * script.setAttribute("src", "com/extjavascript/cryp/aes.js");
		 * document.head.appendChild(script);
         * </inject_script>
		 */

        private function CryptoJS(){}
        
        
        private static function get cryptoObj():Object {
            return window["CryptoJS"];
        }
        
        public static function encrypt(txt:String, key:String):String {
            return cryptoObj['AES'].encrypt(txt, key).toString();
        }
        public static function decrypt(txt:String, key:String):String {
            return cryptoObj['AES'].decrypt(txt, key).toString(cryptoObj['enc']['Utf8']);
        }
    }
}