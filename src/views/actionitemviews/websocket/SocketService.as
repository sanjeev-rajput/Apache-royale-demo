package views.actionitemviews.websocket 
{

    import org.apache.royale.collections.ArrayList;

    public class SocketService{

        private var ws:WebSocket;
        private var _url:String = "http://localhost:3000";
        private var _isConnected:Boolean = false;
        private var _callBackFunction:Function=null;
        public function SocketService():void {
        }
        
        public function addCAllBackFunction(callBackFunction:Function):void {
            _callBackFunction = callBackFunction;
        }
        public function connectWebSocket():void{  
            if(_callBackFunction == null){
                console.error("CallBack function is not set");
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
            ws.send('Hello Server!');
        }

        private function connectionMessageEvtHandler(e:*):void {
            var data:Object = JSON.parse(e.data);
            console.log("Message from server:", data);
            _callBackFunction(data);
        }

        private function connectionCloseEvtHandler():void {
            console.log('Disconnected from the WebSocket server');
        }

        private function connectionErrorEvtHandler(e:*):void {
            console.error('WebSocket error:', e);
        }

        private function onSend(event:MouseEvent):void{
        
        }

    }
    
}