// SocketMessageHandler.as
package views.actionitemviews.collaboration {
    import views.actionitemviews.collaboration.MessageItem;
    import org.apache.royale.jewel.VGroup;
    import com.unhurdle.spectrum.TextField;
    import com.util.AppAlert;

    public class SocketMessageHandler {

        private var myUserId:String;
        private var outputContainer:VGroup;
        private var inputField:TextField;

        public function SocketMessageHandler(input:TextField, output:VGroup) {
            this.inputField = input;
            this.outputContainer = output;
        }

        public function process(data:Object):void {
            if (data.type == "welcome") {
                myUserId = data.userId;
                handleWelcome(data);
            } else if (data.type == "subscribe_collabaration") {
                handleChatMessage(data.sender, data.text);
            } else if (data.type == "error") {
                handleError(data.message);
            }
        }

        private function handleWelcome(data:Object):void {
            myUserId = data.userId;
            appendMessage(myUserId, "Welcome to the collaboration room! You are: " + myUserId);
        }


        private function handleChatMessage(sender:String, message:String):void {
            appendMessage(sender, message);
        }

        private function handleError(message:String):void {
            appendMessage("System", message);
            inputField.disabled = true;
            AppAlert.show(AppAlert.ERROR, message)
        }

        private function appendMessage(userId:String, msg:String):void {
            var msgItem:MessageItem = new MessageItem();
            msgItem.myself = (userId == myUserId);
            msgItem.setData(userId, msg);
            outputContainer.addElement(msgItem);
            scrollToBottom();
        }

        private function scrollToBottom():void {
            if (outputContainer.element)
                outputContainer.element.scrollTop = outputContainer.element.scrollHeight;
        }
    }
}
