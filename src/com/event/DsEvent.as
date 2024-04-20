package com.event {
    import org.apache.royale.events.EventDispatcher;

    public class DsEvent extends EventDispatcher{

        public static const IFRAMECLOSED:String = "iframeclosed";
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