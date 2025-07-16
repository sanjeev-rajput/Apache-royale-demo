package com.controller{
    
    import org.apache.royale.jewel.PopUp;
    
    import org.apache.royale.core.UIBase;
    import org.apache.royale.events.CloseEvent;
    import org.apache.royale.events.Event;

    public class PopupManager extends PopUp{
        private static var _instance:PopupManager;
        
        private function PopupManager(){
            // Constructor code
            if (_instance) {
                throw new Error("Singleton class, use getInstance() method.");
            }
            _instance = this;
        }

        public static function getInstance():PopupManager {
            if (!_instance) {
                _instance = new PopupManager();
            }
            return _instance;
        }

        
        public function createPopup(popup:Object, ui:UIBase, w:int=490, h:int=392):void {
            // Logic to show the popup based on the type
            //trace("Showing popup of type: " + popupType);
            //fe.imgUrl = "https://picsum.photos/" + getRndNum(300, 500) + "/" + getRndNum(500, 800)
			popup.width = w;
			popup.height = h;
            _instance.content = popup as UIBase;
            _instance.modal = true;
            ui.addElement(_instance);
            _instance.open = true;
        }
        
        public function reomovePopup():void {
            // Logic to hide the currently displayed popup
            _instance.dispatchEvent(new Event(CloseEvent.CLOSE));
            _instance.open = false;
            trace("Hiding current popup");
        }
    }

}