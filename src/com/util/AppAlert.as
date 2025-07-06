package com.util
{
    
    import org.apache.royale.jewel.Alert;

    public class AppAlert{
        public static const INFO:String = "🟢 Info: 🟢";
        public static const WARNING:String = "📢 Warning: 📢";
        public static const ERROR:String = "⚠️ Error: ⚠️";

        private function AppAlert():void{

        }

        public static function show(type:String, msg:String):void {
            if(type == INFO) msg = "<font color='blue'>" + msg ;
            else if(type == WARNING) msg = "<font color='orange'>" + msg ;
            else if(type == ERROR) msg = "<font color='red'>" + msg ;
            Alert.show(msg, type)
            
            
        }
    }
}