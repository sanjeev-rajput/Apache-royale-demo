package  views.actionitemviews.games.keybordgame
{
    import org.apache.royale.events.KeyboardEvent;
    import org.apache.royale.events.Event;

    import org.apache.royale.jewel.Label;
    import org.apache.royale.utils.Timer;
    import org.apache.royale.jewel.Image;
    import org.apache.royale.html5.AudioElement;
    import org.apache.royale.events.MouseEvent;
    import views.actionitemviews.games.iGame;

    public class Controller implements iGame
    {

        private var basket:Image;
        private var basketPosX:int = 350;
        private var basketSpeed:int = 30;
        private var basketPosY:int = 20;

        private var balls:Array = [];
        private var score:int = 0;

        private var gameTimer:Timer;
        private var isGameOver:Boolean = false;

        // private var warningLine:HTMLDivElement;
        private var warningThickness:int = 2;
        private var intervalIds:Array = new Array();

        private var catchSound:AudioElement;
        private var dropSound:AudioElement;
        private var gameStage:KeyGame;

        public function Controller(ui:KeyGame):void {
            gameStage = ui;
            init();
        }

        private function init():void
        {
            createBasket();
            setupKeyboardControls();
            setupGameTimer();
            intervalIds.push(setInterval(spawnBall, 2000));
            updateWarningArea();
            initSound();
            gameStage.resetBtn.addEventListener(MouseEvent.CLICK, resetGame);
        }

        private function initSound():void
        {
            catchSound = new AudioElement();
            catchSound.src = "audio/catch.mp3";
            dropSound = new AudioElement();
            dropSound.src = "audio/drop.mp3";
            catchSound.volume = dropSound.volume = 0.5;
        }

        private function createBasket():void
        {
            basket = new Image();
            basket.width = 100;
            basket.height = 50;
            basket.src = "img/basket.png";
            basket.element.style.position = "absolute";
            updateBasketPosition();
            basket.element.style.transition = "left 0.2s linear";
            gameStage.addElement(basket);
        }

        private function setupKeyboardControls():void
        {
            document.addEventListener(KeyboardEvent.KEY_DOWN, onKeyDown);
        }

        private function setupGameTimer():void
        {
            gameTimer = new Timer(30);
            gameTimer.addEventListener("timer", onGameTick);
            gameTimer.start();
        }

        private function onKeyDown(e:KeyboardEvent):void
        {
            if (isGameOver)return;
                
            if (e.key == "ArrowLeft")
            {
                basketPosX = Math.max(0, basketPosX - basketSpeed);
            }
            else if (e.key == "ArrowRight")
            {
                basketPosX = Math.min(gameStage.width - basket.width, basketPosX + basketSpeed);
            }
            updateBasketPosition();
        }

        private function spawnBall():void
        {
            if (isGameOver)
                return;
            var ball:Image = new Image();
            ball.width = 30;
            ball.height = 30;
            ball.src = "img/ball.png";
            ball.element.style.position = "absolute";
            ball.element.style.left = (Math.random() * (gameStage.width - ball.width)) + "px";
            ball.element.style.top = "0px";
            gameStage.addElement(ball);
            balls.push(ball);
        }

        private function onGameTick(event:Event):void
        {
            for (var i:int = balls.length - 1; i >= 0; i--)
            {
                var ball:Image = balls[i];
                var currentTop:int = parseInt(ball.element.style.top) || 0;
                currentTop += 5;
                ball.element.style.top = currentTop + "px";

                var ballX:int = parseInt(ball.element.style.left) || 0;
                var ballY:int = currentTop;

                var basketTop:int = gameStage.height - basketPosY - basket.height;
                var basketBottom:int = gameStage.height - basketPosY;

                if (ballY + ball.height >= basketTop && ballY <= basketBottom &&
                        ballX + ball.width > basketPosX && ballX < basketPosX + basket.width)
                {
                    removeBall(ball, true);
                }
                else if (ballY > gameStage.height)
                {
                    removeBall(ball, false);
                }
            }
        }

        private function removeBall(ball:Image, isCatched:Boolean):void
        {
            var ballX:int = parseInt(ball.element.style.left) || 0;
            var ballY:int = parseInt(ball.element.style.top) || 0;

            if (isCatched)
            {
                showPointsAnimation("+10", basketPosX + basket.width / 2, gameStage.height - (basketPosY + basket.height), "green");
                basket.element.classList.add('gameBlurBasket');
                setTimeout(function():void
                    {
                        basket.element.classList.remove('gameBlurBasket');
                    }, 200);
                score += 10;
                catchSound.play();
                gameStage.removeElement(ball);
            }
            else
            {
                ball.src = "img/blast.png";
                showPointsAnimation("-10", ballX, ballY, "red");
                score -= 10;
                dropSound.play();
                setTimeout(gameStage.removeElement, 500, ball);
                if (score % -30 == 0)
                {
                    basketPosY += 20;
                    updateBasketPosition();
                    updateWarningArea();
                }
            }

            gameStage.scoreLabel.text = "Score: " + score;
            balls.splice(balls.indexOf(ball), 1);
        }

        private function showPointsAnimation(pointsText:String, x:int, y:int, color:String):void
        {
            var pointsLabel:Label = new Label();
            pointsLabel.text = pointsText;
            pointsLabel.element.style.position = "absolute";
            pointsLabel.element.style.left = x + "px";
            pointsLabel.element.style.top = y + "px";
            pointsLabel.element.style.color = color;
            pointsLabel.element.style.fontWeight = "bold";
            pointsLabel.element.style.transition = "top 1s ease-out, opacity 1s ease-out";
            gameStage.addElement(pointsLabel);

            setTimeout(function():void
                {
                    pointsLabel.element.style.top = (y - 50) + "px";
                    pointsLabel.element.style.opacity = "0";
                }, 10);

            setTimeout(function():void
                {
                    gameStage.removeElement(pointsLabel);
                }, 200);
        }

        private function updateBasketPosition():void
        {
            basket.element.style.bottom = basketPosY + "px";
            basket.element.style.left = basketPosX + "px";

            if (basketPosY >= gameStage.height - basket.height - 50)
            {
                isGameOver = true;
                showGameOver();
            }
        }

        private function showGameOver():void
        {
            gameStage.gmOvr.visible = true;
            gameTimer.stop();
            gameStage.resetBtn.visible = true;
        }

        private function updateWarningArea():void
        {
            gameStage.warningArea.height = basketPosY;
            gameStage.warningArea.y = 600 - basketPosY;
            if (basketPosY >= gameStage.height - 200)
            {
                gameStage.warningArea.fill = 'orange';
            }
            else if (basketPosY >= gameStage.height / 2)
            {
                gameStage.warningArea.fill = 'yellow';
            }
            else
            {
                gameStage.warningArea.fill = 'green';
            }
        }

        private function resetGame():void {
            // Reset score, basket position, etc.
            isGameOver = false;
            gameStage.resetBtn.visible = false;
            score = 0;
            basketPosX = 350;
            basketPosY = 20;
            gameStage.scoreLabel.text = "Score: 0";
            gameStage.gmOvr.visible = false;
            updateBasketPosition();
            updateWarningArea();
            for each (var ball:Image in balls) {
                gameStage.removeElement(ball);
            }
            balls = [];
            gameTimer.start();
        }

        public function disposeGame():void {
            if(gameTimer){
                gameTimer.stop();
                gameTimer.removeAllListeners();
                gameTimer = null;
            }
            for each(var i:int in intervalIds){
                clearInterval(i);
            }
        }

    }

}