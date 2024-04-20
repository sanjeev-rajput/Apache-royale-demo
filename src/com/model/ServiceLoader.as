package com.model{

    import org.apache.royale.net.HTTPService;
    import org.apache.royale.net.HTTPConstants;
    import org.apache.royale.jewel.Alert;
    import org.apache.royale.events.Event;
    import com.util.preloader.DsPreloader;

    public class ServiceLoader{

        private var _callBack:Function;
        private var _service:HTTPService;
        public static const J_SON:String = "json";
        public static const X_ML:String = "xml";
        public static const T_EXT:String = "text";
        private var _dataType:String = null;
        
        public function ServiceLoader():void {

        }

        public function loadJData(url:String, callBack:Function, dataType:String=J_SON):void{
            _callBack = callBack;
            _service = new HTTPService();
            _dataType = dataType;
            (url.indexOf("?")==-1) ?  _service.url = url + "?" + Math.random() : _service.url = url + "&" + Math.random();
            _service.addEventListener(HTTPConstants.COMPLETE, completeJdataHandler);
            _service.addEventListener(HTTPConstants.IO_ERROR, errorEventHandler)
            //_service.url = url + "?" + Math.random();
            
           
            DsPreloader.instance.showPreloader("serviceLoader");
            _service.send();

        }

        private function completeJdataHandler(event:Event):void{
            //trace(_service.status);
            DsPreloader.instance.remvoePreloader("serviceLoader");
            if(_service.status == 0){
                Alert.show("Pelase check you network (internet) connection !!!", "Unable to connect");
                return;
            }
            
           if(_dataType == J_SON) _callBack(JSON.parse(_service.data));
           if(_dataType == T_EXT) _callBack(_service.data);
        }

        private function errorEventHandler(event:Event):void{
           DsPreloader.instance.remvoePreloader("serviceLoader");
           trace("errorEventHandler ERROR!!!" + event.target)
        }


    }
}