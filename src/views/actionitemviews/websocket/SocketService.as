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

        public static const SUBSCRIBE_WIKI:String="subscribe_wiki";
        public static const SUBSCRIBE_COLLABARATION:String = "subscribe_collabaration";
        private var _subscribeType:String = null;
        public function SocketService():void {
        }
        
        public function addCAllBackFunction(callBackFunction:Function):void {
            _callBackFunction = callBackFunction;
        }

        public function connectWebSocket(type:String):void{  
            _subscribeType = type;
            if(_callBackFunction == null){
                AppAlert.show(AppAlert.ERROR, "CallBack function is not set");
                return;
            }
            ws = new WebSocket(_url); 
            ws.addEventListener('open', connectionOpenEvtHandler);
            ws.addEventListener('message', connectionMessageEvtHandler);
            ws.addEventListener('close', connectionCloseEvtHandler);
            ws.addEventListener('error', connectionErrorEvtHandler); 
        }

        public function disconnectWebSocket():void {
            ws.close();
        }

        private function connectionOpenEvtHandler():void {
            console.log('Connected to the WebSocket server');
            _isConnected=true;
            subscribeWs();
        }

        private function subscribeWs():void {
            if(_subscribeType == SUBSCRIBE_WIKI)ws.send(JSON.stringify({type: _subscribeType}));
            if(_subscribeType == SUBSCRIBE_COLLABARATION)ws.send(JSON.stringify({type: _subscribeType,shape: 'rect'}));
        }

        private function connectionMessageEvtHandler(e:*):void {
            var data:Object = JSON.parse(e.data);
            //console.log("Message from server:", data);
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

        public function sendToSocket(obj:Object):void {
            ws.send(JSON.stringify(obj));
        }

    }
    
}