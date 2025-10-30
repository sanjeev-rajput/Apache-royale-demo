package com.util {
    import com.unhurdle.spectrum.Toast;
    import org.apache.royale.utils.Timer;
    import org.apache.royale.events.Event;

    public class ServerColdStartManager {
        private static var toast:Toast;
        private static var timer:Timer;
        private static var countdown:int = 60;
        private static var isNodeStarted:Boolean = false;

        public static function showWakeUpMessage():void {
            if (toast || isNodeStarted) return; // Already showing or connected
            toast = new Toast();
            toast.text = "Waking up server... please wait (60s)";
            toast.flavor = Toast.INFO;
            toast.show();

            countdown = 60;
            timer = new Timer(1000);
            timer.addEventListener(Timer.TIMER, updateCountdown);
            timer.start();
        }

        private static function updateCountdown(e:Event):void {
            countdown--;
            if (toast) toast.text = "Waking up server... please wait (" + countdown + "s)";
            if (countdown <= 0) stopCountdown();
        }

        public static function showConnectedMessage():void {
            if(isNodeStarted) return;
            stopCountdown();
            isNodeStarted = true;
            if (toast) {
                toast.text = "✅ Connected successfully.";
                toast.flavor = Toast.SUCCESS;
                setTimeout(function():void {
                    toast.hide()
                    toast = null;  
                }, 2000)
            }
        }

        private static function stopCountdown():void {
            if (timer) {
                timer.stop();
                timer = null;
            }
        }

        public static function reset():void {
            isNodeStarted = false;
            if (toast) {
                toast.hide();
                toast = null;
            }
            if (timer) {
                timer.stop();
                timer = null;
            }
        }
    }
}
