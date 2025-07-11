package views.actionitemviews.websocket 
{


    import com.model.Config;
    import com.util.AppAlert;

    public class SocketService{

        private var ws:WebSocket;
        //private var _url:String = "http://localhost:3000";
        //private var _url:String = "wss://apache-roayle-demo-app.onrender.com";
        private var _url:String = Config.wsUrl;
        private var _isConnected:Boolean = false;
        private var _callBackFunction:Function=null;
        private var _statusUpdateCallback:Function = null;
        private static var _isFirstConnect:Boolean = true;


        public static const SUBSCRIBE_WIKI:String="subscribe_wiki";
        public static const SUBSCRIBE_COLLABARATION:String = "subscribe_collabaration";
        public static const SUBSCRIBE_STOCK:String="subscribe_stock";
        private var _subscribeWithObj:Object = null;
        private var _subscribeType:String = null;
        public function SocketService():void {
        }
        public function setStatusUpdateCallback(callback:Function):void {
            _statusUpdateCallback = callback;
        }

        
        public function addCAllBackFunction(callBackFunction:Function):void {
            _callBackFunction = callBackFunction;
        }

        public function connectWebSocket(type:String=null, obj:Object=null):void{  
            if (_isFirstConnect) {
                _isFirstConnect = false;
                SocketServiceHelper.showWakeUpMessage();
            }

            if (_statusUpdateCallback != null) _statusUpdateCallback("✅ Connected successfully.");
            if(type)_subscribeType = type;
            if(obj)_subscribeWithObj = obj;
            if(_callBackFunction == null){
                AppAlert.show(AppAlert.ERROR, "CallBack function is not set");
                return;
            }
            // ✅ Avoid reconnecting if already connected
            if (_isConnected && ws) {
                subscribeWs(); // Just send subscription message again
                return;
            }
            ws = new WebSocket(_url);
            ws.addEventListener('open', connectionOpenEvtHandler);
            ws.addEventListener('message', connectionMessageEvtHandler);
            ws.addEventListener('close', connectionCloseEvtHandler);
            ws.addEventListener('error', connectionErrorEvtHandler); 
        }

        public function disconnectWebSocket():void {
            if (ws) {
                ws.removeEventListener('open', connectionOpenEvtHandler);
                ws.removeEventListener('message', connectionMessageEvtHandler);
                ws.removeEventListener('close', connectionCloseEvtHandler);
                ws.removeEventListener('error', connectionErrorEvtHandler);
                ws.close();
                ws = null;
            }
        }

        private function connectionOpenEvtHandler():void {
             _isConnected = true;
            SocketServiceHelper.showConnectedMessage();
            subscribeWs();
            console.log('Connected to the WebSocket server');
            _isConnected=true;
            subscribeWs();
        }

        private function subscribeWs():void {
            console.log(_subscribeWithObj)
            if(_subscribeType == SUBSCRIBE_WIKI)ws.send(JSON.stringify({type: _subscribeType}));
            if(_subscribeType == SUBSCRIBE_COLLABARATION)ws.send(JSON.stringify({type: _subscribeType,shape: 'rect'}));
            if(_subscribeType == SUBSCRIBE_STOCK)ws.send(JSON.stringify({type: _subscribeType, length :_subscribeWithObj.length}));
        }

        private function connectionMessageEvtHandler(e:*):void {
            var data:Object = JSON.parse(e.data);
            _callBackFunction(data);
        }

        private function connectionCloseEvtHandler():void {
            _isConnected=false;
            console.log('Disconnected from the WebSocket server');
        }

        private function connectionErrorEvtHandler(e:*):void {
            AppAlert.show(AppAlert.ERROR, 'WebSocket error: <br>' +  e);
        }

        public function get connected():Boolean {
            return _isConnected;
        }
        /*
        WebSocket.readyState has the following states:
        0: CONNECTING
        1: OPEN ✅
        2: CLOSING
        3: CLOSED
        */
        public function sendToSocket(obj:Object):void {
            if (ws && ws.readyState == 1) {
                ws.send(JSON.stringify(obj));
            } else {
                AppAlert.show(AppAlert.ERROR, "WebSocket is not open. Cannot send message.");
                // Optional: Retry later or queue the message
            }
        }


    }
    
}