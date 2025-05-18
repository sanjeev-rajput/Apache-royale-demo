package views.actionitemviews.keybordgame {
    import org.apache.royale.events.Event;
    import org.apache.royale.events.KeyboardEvent;
    import org.apache.royale.html.Label;
    import org.apache.royale.html.supportClasses.ContainerContentArea;
    import org.apache.royale.html.Group;
    import org.apache.royale.core.UIBase;
    import org.apache.royale.utils.Timer;
    import org.apache.royale.jewel.Container;
    
    public class CatchGameRoyale extends Group {
        private var basket:UIBase;
        private var balls:Array = [];
        private var points:int = 0;
        private var scoreLabel:Label;
        private var step:int = 20;
        private var gameWidth:int = 600;
        private var gameHeight:int = 400;
        private var ui:Container;

        public function CatchGameRoyale(u:Container) {
            super();
            ui=u;
            width = gameWidth;
            height = gameHeight;
            style = "background-color: lightblue; position: relative; overflow: hidden;";

            // Create basket
            basket = new UIBase();
            basket.width = 100;
            basket.height = 20;
            basket.x = gameWidth / 2 - basket.width / 2;
            basket.y = gameHeight - 30;
            basket.element.style.backgroundColor = "blue";
            basket.element.style.position = "absolute";
            ui.addElement(basket);

            // Score
            scoreLabel = new Label();
            scoreLabel.text = "Score: 0";
            scoreLabel.x = 10;
            scoreLabel.y = 10;
            ui.addElement(scoreLabel);

            // Key events
            document.addEventListener("keydown", onKeyDown);

            // Timer to create balls
            var ballTimer:Timer = new Timer(1000);
            ballTimer.addEventListener("timer", createBall);
            ballTimer.start();

            // Game loop
            var loopTimer:Timer = new Timer(30);
            loopTimer.addEventListener("timer", gameLoop);
            loopTimer.start();
        }

        private function onKeyDown(e:*):void {
            if (e.key == "ArrowLeft") {
                var newXx:Number = Math.max(0, basket["posX"] - step);
                setPosition(basket, newXx, basket["posY"]);
            } else if (e.key == "ArrowRight") {
                var newX:Number = Math.min(gameWidth - basket.width, basket["posX"] + step);
                setPosition(basket, newX, basket["posY"]);
            }
        }


        private function createBall(e:Event):void {
            var ball:UIBase = new UIBase();
            ball.width = 30;
            ball.height = 30;
            var startX:Number = Math.random() * (gameWidth - 30);
            setPosition(ball, startX, -30);
            ball.element.style.backgroundColor = "red";
            ball.element.style.borderRadius = "50%";
            ball.element.style.position = "absolute";
            ball["points"] = Math.floor(Math.random() * 10) + 1;
            ui.addElement(ball);
            balls.push(ball);
        }

        private function gameLoop(e:Event):void {
            for (var i:int = balls.length - 1; i >= 0; i--) {
                var ball:UIBase = balls[i];
                var newY:Number = ball["posY"] + 3; // slower, smoother
                setPosition(ball, ball["posX"], newY);

                if (checkCollision(ball, basket)) {
                    points += ball["points"];
                    updateScore();
                    removeBall(ball, i);
                } else if (newY > gameHeight) {
                    removeBall(ball, i);
                }
            }
        }
        private function setPosition(obj:UIBase, x:Number, y:Number):void {
            trace(obj)
            obj.element.style.transform = "translate(" + x + "px," + y + "px)";
            obj["posX"] = x;
            obj["posY"] = y;
        }



        private function checkCollision(a:UIBase, b:UIBase):Boolean {
            return !(a.x + a.width < b.x || a.x > b.x + b.width || a.y + a.height < b.y || a.y > b.y + b.height);
        }

        private function updateScore():void {
            scoreLabel.text = "Score: " + points;
        }

        private function removeBall(ball:UIBase, index:int):void {
            ui.removeElement(ball);
            balls.splice(index, 1);
        }
    }
}
