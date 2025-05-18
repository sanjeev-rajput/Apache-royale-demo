package views.actionitemviews.keybordgame {

    import org.apache.royale.jewel.View;
    import org.apache.royale.events.KeyboardEvent;
    import org.apache.royale.jewel.Image;
    import org.apache.royale.html.elements.Div;
    import org.apache.royale.jewel.Container;
    
    

    public class Controller{
        private var brick:Div;
        private var gameArea:Container;
        private var step:int = 10;

        public function Controller(area:Container, b:Div){
            brick = b;
            gameArea = area;
            document.addEventListener(KeyboardEvent.KEY_DOWN, onKeyDown)
        }

        private function onKeyDown(event:KeyboardEvent):void {
            trace(event.code, event.key)
            trace(gameArea.width, gameArea.height, brick.width, brick.height)
            switch (event.code) {
                case 'ArrowLeft': // left
                    brick.x = Math.max(gameArea.x, brick.x - step);
                    break;
                case 'ArrowRight': // right
                    brick.x = Math.min(gameArea.width - brick.width, brick.x + step);
                    break;
                case 'ArrowUp': // up
                    brick.y = Math.max(gameArea.y, brick.y - step);
                    break;
                case 'ArrowDown': // down
                    brick.y = Math.min(gameArea.height - brick.height, brick.y + step);
                    break;
            }
        }
    }
    
}