package com.util{
    

    

    public class AsJsUtil{
        public static function copyToClipboard(text:String):void{
            // This function copies the given text to the clipboard.
            COMPILE::JS
            {
                var el:* = document.createElement('textarea');
                el.value = text;
                document.body.appendChild(el);
                el.select();
                document.execCommand('copy');
                document.body.removeChild(el);
            }    
        }

        public static function scrollIntoView(elementId:String):void {
            COMPILE::JS{
                var item:HTMLElement = document.getElementById(elementId) as HTMLElement;
                if(item)item.scrollIntoView()
            }
        }

    }

}