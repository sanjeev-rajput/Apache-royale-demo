package com.model{

    import org.apache.royale.net.HTTPService;
    import org.apache.royale.net.HTTPConstants;
    import org.apache.royale.events.Event;
    import com.util.preloader.DsPreloader;
    import org.apache.royale.debugging.throwError;
    import com.util.AppAlert;
    import com.util.ServerColdStartManager;

    public class ServiceLoader{

        private var _callBack:Function;
        private var _errorCallback:Function;
        private var _service:HTTPService=null;
        public static const DATA_TYPE_JSON:String = "json";
        public static const DATA_TYPE_TEXT:String = "text";
        public static const DATA_TYPE_XML:String = "xml";
        private var _dataType:String = null;
        private var _reqMethod:String = "GET"
        private var _contentType:String=null;
        private var _reqData:*;
        private var _headers:Array;
        private static var _isFirstConnect:Boolean = true;


        public function ServiceLoader():void {
            _service = new HTTPService();
        }

        private function isServerReq(url:String):Boolean {
            if (url.indexOf("api/") != -1) {
                return true;
            }else{
                return false;
            }
        }

        public function loadJData(url:String, callBack:Function, dataType:String=DATA_TYPE_JSON, errCallBack:Function=null, randUrl:Boolean=true):void{
            if(isServerReq(url) && _isFirstConnect) {
                ServerColdStartManager.showWakeUpMessage();
                _isFirstConnect = false;
            }
            _callBack = callBack;
            if (_callBack == null) {
                throwError('Callback function cannot be null');
            }
            if(errCallBack){
                _errorCallback = errCallBack;
            }
            
            _service.method = _reqMethod;
            _dataType = dataType;
            if(_contentType)_service.contentType = _contentType;
            if (_headers) _service.headers = _headers;

            if(randUrl){
                (url.indexOf("?")==-1) ?  _service.url = url + "?" + Math.random() : _service.url = url + "&" + Math.random();
            }else{
                _service.url = url;
            }

            _service.addEventListener(HTTPConstants.COMPLETE, completeJdataHandler);
            _service.addEventListener(HTTPConstants.IO_ERROR, errorEventHandler)
            //_service.url = url + "?" + Math.random();
           
            DsPreloader.instance.showPreloader("serviceLoader");
            _service.send();

        }

        private function completeJdataHandler(event:Event):void{
            if(isServerReq(_service.url)) {
                ServerColdStartManager.showConnectedMessage();
            }
            DsPreloader.instance.remvoePreloader("serviceLoader");
            if(_service.status == 0){
                AppAlert.show(AppAlert.ERROR, "Unable to connect!!! Pelase check you network (internet) connection !!!")
                return;
            }
            
           if(_dataType == DATA_TYPE_JSON) _callBack(JSON.parse(_service.data));
           if(_dataType == DATA_TYPE_TEXT) _callBack(_service.data);
           if (_dataType == DATA_TYPE_XML) _callBack(new XML(_service.data));
        }

        private function errorEventHandler(event:Event):void{
           DsPreloader.instance.remvoePreloader("serviceLoader");
           AppAlert.show(AppAlert.ERROR, "errorEventHandler ERROR!!! <br>" + event.target)
           if(_errorCallback !=null)_errorCallback(event);
        }

        public function set reqMethod(value:String):void {
            _reqMethod = value;
        }


        public function sendReqData():void {
            if (_service) {
                _service.send();
            } else {
                trace("Service not initialized.");
            }
        }


        public function set contentType(value:String):void {
            _contentType = value;
        }

        public function set headers(value:Array):void {
           _headers = value;
        }

        public function cancel():void {
            if(_service) {
                _service.dispose();
                _service = null;
            }
        }


        public function set reqData(value:*):void {
            _reqData = value;
            if (_reqData) {
                if (_contentType && _contentType.toLowerCase() == "application/json") {
                    // Don't parse it — just assign as-is, let Royale/browser serialize
                    trace(_reqData)
                    _service.contentData = _reqData;
                } else {
                    _service.contentData = _reqData;
                }
            }
        }

    }
}