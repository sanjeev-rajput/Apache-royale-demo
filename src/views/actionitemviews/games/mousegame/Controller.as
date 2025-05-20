package views.actionitemviews.games.mousegame
{
    import org.apache.royale.events.Event;
    import org.apache.royale.jewel.Image;
    import org.apache.royale.utils.Timer;
    import org.apache.royale.html5.AudioElement;
    import org.apache.royale.jewel.Label;
    import org.apache.royale.events.MouseEvent;
    import views.actionitemviews.games.iGame;

    public class Controller implements iGame
    {
        private var gameStage:MouseGame;
        private var basket:Image;
        private var score:int = 0;
        private var stars:Array = [];
        private var redBombs:Array = [];
        private var gameTimer:Timer;
        private var isGameOver:Boolean = false;
        private var catchSound:AudioElement;
        private var failSound:AudioElement;
        private var intervalIds:Array = new Array();
        public function Controller(ui:MouseGame)
        {
            gameStage = ui;
            init();
        }

        private function init():void
        {
            createBasket();
            setupMouseTracking();
            initSound();
            setupGameTimer();
            intervalIds.push(setInterval(spawnStar, 2000));
            intervalIds.push(setInterval(spawnRedBomb, 5000));
            gameStage.warningArea.y = gameStage.height/2;
            gameStage.resetBtn.addEventListener(MouseEvent.CLICK, resetGame);

        }

        private function initSound():void
        {
            catchSound = new AudioElement();
            catchSound.src = "audio/catch.mp3";
            failSound = new AudioElement();
            failSound.src = "audio/drop.mp3";
            catchSound.volume = failSound.volume = 0.5;
        }

        private function createBasket():void
        {
            basket = new Image();
            basket.src = "img/basket.png";
            basket.width = 100;
            basket.height = 50;
            basket.element.style.position = "absolute";
            basket.element.style.bottom = "10px";
            basket.element.style.transition = "left 0.1s linear";
            gameStage.addElement(basket);
            basket.element.style.top = (gameStage.height / 2 - basket.height / 2) + "px";

        }

        private function setupMouseTracking():void
        {
            gameStage.element.addEventListener("mousemove", function(e:*):void {
                if (isGameOver) return;
                var mouseX:int = e.clientX - gameStage.element.getBoundingClientRect().left;
                basket.element.style.left = (mouseX - basket.width / 2) + "px";
            });
        }



        private function setupGameTimer():void
        {
            gameTimer = new Timer(30);
            gameTimer.addEventListener("timer", onGameTick);
            gameTimer.start();
        }

        private function spawnStar():void
        {
            if (isGameOver) return;
            var isBomb:Boolean = Math.random() < 0.2;
            var star:Image = new Image();
            star.width = 30;
            star.height = 30;
            star.src = isBomb ? "img/bomb.png" : "img/star.png";
            star.element.style.position = "absolute";
            star.element.style.left = (Math.random() * (gameStage.width - star.width)) + "px";
            star.element.style.top = "0px";
            gameStage.addElement(star);
            stars.push({image: star, isBomb: isBomb});
        }
        private function spawnRedBomb():void
        {
            if (isGameOver) return;
            var redBomb:Image = new Image();
            redBomb.src = "img/nuke.png";
            redBomb.width = 30;
            redBomb.height = 30;
            redBomb.element.style.position = "absolute";
            redBomb.element.style.left = (Math.random() * (gameStage.width - redBomb.width)) + "px";
            redBomb.element.style.bottom = "0px";
            gameStage.addElement(redBomb);
            redBombs.push(redBomb);
        }


        private function onGameTick(event:Event):void
        {
            for (var i:int = stars.length - 1; i >= 0; i--)
            {
                var obj:Object = stars[i];
                var star:Image = obj.image;
                var isBomb:Boolean = obj.isBomb;

                var currentTop:int = parseInt(star.element.style.top) || 0;
                currentTop += 5;
                star.element.style.top = currentTop + "px";

                var starX:int = parseInt(star.element.style.left) || 0;
                var starY:int = currentTop;
                var basketX:int = parseInt(basket.element.style.left) || 0;
                var basketY:int = parseInt(basket.element.style.top) || 0;

                if (starY + star.height >= basketY && starX + star.width > basketX && starX < basketX + basket.width)
                {
                    handleCatch(obj);
                    continue;
                }
                if (starY > gameStage.height)
                {
                    gameStage.removeElement(star);
                    stars.splice(i, 1);
                }
            }
            for (var j:int = redBombs.length - 1; j >= 0; j--)
            {
                var red:Image = redBombs[j];
                var currentBottom:int = parseInt(red.element.style.bottom) || 0;
                currentBottom += 5;
                red.element.style.bottom = currentBottom + "px";

                var redX:int = parseInt(red.element.style.left) || 0;
                var redY:int = gameStage.height - currentBottom;

                var basketXX:int = parseInt(basket.element.style.left) || 0;
                var basketYY:int = parseInt(basket.element.style.top) || 0;


                // Collision with basket = game over
                if (redY <= basketYY + basket.height &&
                    redY + red.height >= basketYY &&
                    redX + red.width >= basketXX &&
                    redX <= basketXX + basket.width)
                {
                    gameOver();
                    return;
                }

                // Remove if off-screen
                if (redY < -red.height)
                {
                    gameStage.removeElement(red);
                    redBombs.splice(j, 1);
                }
            }
        }

        private function handleCatch(obj:Object):void
        {
            var star:Image = obj.image;
            var isBomb:Boolean = obj.isBomb;
            var starX:int = parseInt(star.element.style.left) || 0;
            var starY:int = parseInt(star.element.style.top) || 0;

            if (isBomb)
            {
                score -= 15;
                failSound.play();
                showPointsAnimation("-10", starX, starY, "red");
            }
            else
            {
                score += 10;
                catchSound.play()
                showPointsAnimation("-10", starX, starY, "green");
            }

            gameStage.removeElement(star);
            stars.splice(stars.indexOf(obj), 1);
            gameStage.scoreLabel.text = "Score: " + score;

            if (score <= -30)
            {
                gameOver();
            }
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

        private function gameOver():void
        {
            isGameOver = true;
            gameTimer.stop();
            gameStage.gmOvr.visible = true;
            gameStage.resetBtn.visible = true;
        }
        public function resetGame():void
        {
            // Reset state
            score = 0;
            isGameOver = false;
            gameStage.scoreLabel.text = "Score: 0";
            gameStage.gmOvr.visible = false;
            gameStage.resetBtn.visible = false;

            // Remove all stars
            for each (var obj:Object in stars)
            {
                gameStage.removeElement(obj.image);
            }
            stars = [];

            // Remove all red bombs
            for each (var red:Image in redBombs)
            {
                gameStage.removeElement(red);
            }
            redBombs = [];
            // Re-center basket (optional if layout changes)
            basket.element.style.left = (gameStage.width / 2 - basket.width / 2) + "px";
            // Restart game timer
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
