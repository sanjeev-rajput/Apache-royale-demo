package com.util.preloader {

    import org.apache.royale.jewel.SimpleLoader;
    
    import com.unhurdle.spectrum.Application;

    public class DsPreloader{

        private static var _instance:DsPreloader = null;
        private var loaderObj:Array = new Array();
        private var counter:int=0;
        private var _mainUi:Application = null;

        private function DsPreloader(enforcer : SingletonEnforcer):void{ }

        public static function get instance():DsPreloader{
            if(_instance == null){
                _instance = new DsPreloader(new SingletonEnforcer());
            }
            return _instance;
        }

        public function getPreloader(uid:String, h:int=10, w:int=10, x:int=0, y:int=0):SimpleLoader {
           // removeAllPreloader();
            var p:SimpleLoader = new SimpleLoader();
            p.height = h;
            p.width = w;
            p.x = x - w;
            p.y = y - h;
            p.style = "position : relative";
            p.emphasis = "primary";
            p.indeterminate=true;
            p.id = uid + '*-*' + Math.random();
            loaderObj.push(p);
            return p;
        }

        public function remvoePreloader(uid:String):void {
            trace('preloader '+loaderObj.length);
            for each(var i:Object in loaderObj){
                if((i.id).split('*-*')[0] == uid){
                    /*trace("dspreloader id found"+i.id);
                    i.parent.removeElement(i);
                    loaderObj.shift();
                    //break;*/
                    i.parent.removeElement(i);
                    var idx:uint = loaderObj.indexOf(i);
                    loaderObj.splice(idx, 1);
                    break;
                }
            }
            
        }

        private function removeAllPreloader():void {
            if(loaderObj.length <= 0)return;
            for each(var i:Object in loaderObj){
                try{
                    i.parent.removeElement(i);
                }catch(e:Error){}
            }
        }

        public function set mainUi(ui:Application):void{
            if(_mainUi == null)_mainUi = ui;
        }

        public function showPreloader(id:String):void {
            _mainUi.addElement(getPreloader(id,100,100,_mainUi.width/2, _mainUi.height/2));
            trace(_mainUi)
        }
    }
}

internal class SingletonEnforcer{} 