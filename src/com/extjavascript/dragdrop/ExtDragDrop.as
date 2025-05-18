package com.extjavascript.dragdrop
{   
    public class ExtDragDrop
    {
        /** 
         * <inject_script>
         * var script = document.createElement("script");
         * script.setAttribute("src", "com/extjavascript/dragdrop/dragdrop.js");
         * document.head.appendChild(script);
         * </inject_script>
         */
        
        private function ExtDragDrop(){}

        public static function setDragDrop(dropZoneContainer:String, dragZoneContainer:String, callBalckFunc:Function):void {
            window["DND"].setDNDElement(dropZoneContainer,dragZoneContainer, callBalckFunc);
        }

    }
}
