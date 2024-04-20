package com.controller {

    import com.util.DsUtil;
    import com.unhurdle.spectrum.Alert;


    public class MainUiController{

        private var _MainUi:AsJsWasm = null;

        public function MainUiController(ui:AsJsWasm):void {
            if(_MainUi == null) _MainUi = ui;
            init();
            initEventListeners();
        }

        private function initEventListeners():void{
            window.addEventListener('contextmenu', disableContextMenu)
        }
        private function disableContextMenu(e:Event):void{
            e.preventDefault();
            e.stopImmediatePropagation();
            e.stopPropagation();

        }

        private function init():void {
            if(DsUtil.isMobile()){
                var warning:Alert = new Alert();
                warning.content="Please keep your mobile in landscape mode";
                warning.closeText = "Close";
                warning.showOverlay = true;
                warning.show();
            }
            
        }

    }
}