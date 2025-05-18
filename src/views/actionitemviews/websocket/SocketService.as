package views.actionitemviews.websocket 
{

    public class SocketService{

        private var ws:WebSocket;
        private var _url:String = "http://localhost:8080";
        private var _isConnected:Boolean = false;
        public function SocketService():void {
        }
        
        public function connectWebSocket():void{  
            ws = new WebSocket(_url); 
            ws.addEventListener('open', connectionOpenEvtHandler);
            ws.addEventListener('message', connectionMessageEvtHandler);
            ws.addEventListener('close', connectionCloseEvtHandler);
            ws.addEventListener('error', connectionErrorEvtHandler);

            ws.addEventListener('counter', counterEvtHandler)    
        }

        public function disconnectWebSocket():void {
            ws.close();
        }

        private function connectionOpenEvtHandler():void {
            console.log('Connected to the WebSocket server');
            ws.send('Hello Server!');
        }

        private function connectionMessageEvtHandler(e:*):void {
            console.log('Message from server:', e.data);
            var data:Object = JSON.parse(e.data);
            if (data.type === "counter") {
                console.log("Counter value:", data.value);
            } else {
                console.log("Other message:", data);
            }
        }

        private function connectionCloseEvtHandler():void {
            console.log('Disconnected from the WebSocket server');
        }

        private function connectionErrorEvtHandler(e:*):void {
            console.error('WebSocket error:', e);
        }

        private function counterEvtHandler(e:*):void{
            console.log(e.data);
        }

        private function onSend(event:MouseEvent):void{
            if (ws && ws.readyState == 1){
                // ws.send(input.text);
                // log.text += "Sent: " + input.text + "\n";
                // input.text = "";
            }
            else{
                //log.text += "WebSocket not ready\n";
            }
        }

    }
    
}