package models
{
  import org.apache.royale.routing.HashRouter;

  public class Theme
  {
    /**
     * static class
     */
    private function Theme(){}
    public static var app:AsJsWasm;
    public static function getTheme():String{
      return app.colorstop;
    }
    public static function setTheme(value:String):void{
      app.colorstop = value;
      if(!router.routeState.parameters){
        router.routeState.parameters = {};
      }
      router.routeState.parameters["colorstop"] = value;
      router.setState();
    }
    public static function getSize():String{
      return app.appScale;
    }
    public static function setSize(value:String):void{
      app.appScale = value;
      if(!router.routeState.parameters){
        router.routeState.parameters = {};
      }
      router.routeState.parameters["appScale"] = value;
      router.setState();
      
    }
    public static var router:HashRouter;
  }
}