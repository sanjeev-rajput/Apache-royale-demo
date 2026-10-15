package views.actionitemviews.googleauth
{

    import org.apache.royale.storage.LocalStorage;

    public class GoogleAuthController{

        private var clientId:String = "325321481422-922iubijkj20tscc4ghhgqkibglglbvf.apps.googleusercontent.com";
        private var redirectUri:String = "https://sanjeev-rajput.github.io/Apache-royale-demo/";
        private var scopes:String = "profile email openid";
        
        private static var instance:GoogleAuthController;
        private var isLoggedIn:Boolean = false;
        private var gAuth:LocalStorage;
        private var userDetails:Object;

        public static const LOGIN_COMPLETE:String = "loginComplete";
        public static const LOGIN_REQUIRED:String = "loginRequired";

        private function GoogleAuthController(){
            if(instance){
                throw new Error("Singleton class. Use getInstance() to get the single instance of this class.");
            }
            gAuth = new LocalStorage();
        }

        public static function getInstance():GoogleAuthController{
            if(!instance){
                instance = new GoogleAuthController();
            }
            return instance;
        }

        // -----------------------------------------------------
        // Trigger Google login
        // -----------------------------------------------------
        public function login():void{
            var authUrl:String =
                "https://accounts.google.com/o/oauth2/v2/auth" +
                "?response_type=token" +
                "&client_id=" + encodeURIComponent(clientId) +
                "&redirect_uri=" + encodeURIComponent(redirectUri) +
                "&scope=" + encodeURIComponent(scopes) +
                "&prompt=select_account";
            window.location = authUrl as Location
            gAuth.setItem("sanjeev", "12345")
        }

        /** Parse access_token from URL when user returns */
        public function extractAccessTokenFromUrl():String{
            var hash:String = window.location.hash;
            
            if (hash && hash.indexOf("access_token") != -1)
            {
                var parts:Array = hash.substring(1).split("&");
                for each (var p:String in parts)
                {
                    var kv:Array = p.split("=");
                    if (kv[0] == "access_token") return kv[1];
                }
            }
            return null;
        }

        /** Make API call using the OAuth token 
        public function getUserProfile(token:String, callback:Function):void{
            var script:String = 
            "function(token) {" +
            " return fetch('https://www.googleapis.com/oauth2/v3/userinfo', {" +
            "   headers: { Authorization: 'Bearer ' + token }" +
            " }).then(r=>r.json());" +
            "}";

            ExternalInterface.call(script, token, function(data:Object):void {
                callback(data);
            });
        }*/

        // -----------------------------------------------------
        // Load token from localStorage
        // -----------------------------------------------------
        public function checkExistingLogin():Boolean{
            var tokenStr:Object = gAuth.getItem("sanjeev");

            if (!tokenStr || tokenStr == "null")
            {
                console.log("no login token found");
                isLoggedIn = false;
            }

            try {
                console.log("login token found", tokenStr);
                isLoggedIn = true;
                setLoginDetails(tokenStr);
            }
            catch (e:Error)
            {
                console.log("no login token found"+e.message, "Error!!!");
                isLoggedIn = false;
                
            }
            return isLoggedIn;
        }

        public function getLoginDetails():Object{
            return userDetails;
        }

        private function setLoginDetails(info:Object):void{
            userDetails = info;
        }

        // -----------------------------------------------------
        // Clear tokens
        // -----------------------------------------------------
        public function logout():void{
            isLoggedIn = false;
            gAuth.removeItem("sanjeev");
        }
    }
}
