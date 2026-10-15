package views.actionitemviews.searchlist
{
    public class LstModel{
        
        private static var _instance:LstModel;
        private var _listData:JSON;
        private var _allCountryDetails:Array = new Array()
        
        private function LstModel(){
        }

        public static function get instance():LstModel {
            if (!_instance) {
                _instance = new LstModel();
            }
            return _instance;
        }
        
        public function set listData(data:JSON):void{
            _listData = data;
            setAllCountryDetails();
        }
        public function get listData():JSON{
            return _listData;
        }

        public function getCountryDetailsByKey(key:String):Array{
            return allCountryDetails.map(function(item:Object):* {
                return item[key];
            });
        }

        public function get allCountryDetails():Array{
            return _allCountryDetails;
        }

        private function setAllCountryDetails():void {
            for each(var i:Object in listData){
                var cDetails:Object = new Object();
                cDetails.flag = i.flag.url_png;
                cDetails.name = i['names'].common;
                if(i.capitals && i.capitals.length > 0) {
                    cDetails.capital = i.capitals[0]['name'];
                } else {
                    cDetails.capital = "N/A";
                }


                cDetails.region = i.region;
                //cDetails.languages = i.languages;
                _allCountryDetails.push(cDetails);
                _allCountryDetails.sortOn('name');
            }
        }
    }
}