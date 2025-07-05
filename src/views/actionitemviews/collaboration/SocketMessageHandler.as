// SocketMessageHandler.as
package views.actionitemviews.collaboration {
    import views.actionitemviews.collaboration.MessageItem;
    import org.apache.royale.collections.ArrayList;
    import org.apache.royale.html.TextInput;
    import org.apache.royale.core.UIBase;
    import com.unhurdle.spectrum.Label;
    import com.unhurdle.spectrum.TextField;
    import org.apache.royale.jewel.VGroup;

    public class SocketMessageHandler {

        private var myUserId:String;
        private var outputContainer:UIBase;
        private var userList:ArrayList;
        private var usrNosLabel:Label;
        private var inputField:TextField;

        public function SocketMessageHandler(input:TextField, output:VGroup) {
            this.outputContainer = output;
            this.inputField = input;
        }

        internal function handleWelcome(data:Object):void {
            myUserId = data.userId;
            appendMessage(myUserId, "Welcome to the collaboration room! You are: " + myUserId);
        }


        internal function handleChatMessage(sender:String, message:String):void {
            appendMessage(sender, message);
        }

        internal function handleError(message:String):void {
            appendMessage("System", message);
            inputField.disabled = true;
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
