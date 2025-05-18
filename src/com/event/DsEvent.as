package com.event {
    import org.apache.royale.events.EventDispatcher;

    public class DsEvent extends EventDispatcher{

        public static const IFRAMECLOSED:String = "iframeclosed";
        public static const IFRAMEOPENED:String = "iframeopened";
        public static const FETCH_DATA_EVENT:String = "fetchDataEvent";
        public static const CLEAR_UI_EVENT:String = "clearuievent";
        public static const UI_COMPONENT_EVENT:String = "uicomponentevent";
        public static const TOC_DATA_TABLE_EVENT:String = "tocdatatableevent"
        private static var _instance:DsEvent = null;
        private function DsEvent(forcer : SingletonEnforcer):void{ }

        public static function get instance():DsEvent{
            if(_instance == null){
                _instance = new DsEvent(new SingletonEnforcer());
            }
            return _instance;
        }


        public function dispatch(type:String, data:Object=null):void {
            var obj:Object = new Object;
            obj.type = type;
            obj.data = data;
            this.dispatchEvent(obj);
        }

    }


}

internal class SingletonEnforcer{} 