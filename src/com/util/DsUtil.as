package com.util {

    
    public class DsUtil{
        private static var urlQueryVars:Object = null;
        private static var mPath:String = null;
        
        private static function setQueryString():void{
            urlQueryVars = {};
            var query:String = location.search.substring(1);
            if(query){
                var vars:Array = query.split("&");
                for (var i:int=0;i<vars.length;i++) {
                    var pair:Array = vars[i].split("=");
                    urlQueryVars[pair[0]] = decodeURIComponent(pair[1]);
                }
            }
        }

        public static function getQueryString(parameter:String):String{
            if(urlQueryVars == null)setQueryString();
            return urlQueryVars[parameter]; 
        }

        public static function isMobile():Boolean {
          var ontouch:Boolean = "ontouchstart" in window;
          return ontouch;
        }

        public static function isValidUrl(urlStr:String):Boolean {
            var isValid:Boolean = false;
            var pattern:RegExp = new RegExp(
                '^([a-zA-Z]+:\\/\\/)?' + // protocol
                '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
                '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR IP (v4) address
                '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
                '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
                '(\\#[-a-z\\d_]*)?$', // fragment locator
                'i'
                );
            var isRelativeUrl:Boolean = (urlStr.trim().length >3 && urlStr.indexOf("/")>0 ) ? true : false;
            var isExternalUrl:Boolean =  pattern.test(urlStr);
            (isRelativeUrl || isExternalUrl) ? isValid=true : isValid=false;
            return isValid;
        }

        public static function csvFileToJsonObj(rawData:Object):Array{
            var jsonData:Array=[];
            var headers:Array = [];
            var rows:Array = rawData.split("\r\n");               
            for (var i:int = 0; i < rows.length; i++) {
                var cells:Array = rows[i].split(",");
                var rowData:Object = {};
                for(var j:int=0;j<cells.length;j++){
                    if(i==0){
                        var headerName:String = cells[j].trim();
                        headers.push(headerName);
                    }else{
                        var key:Object = headers[j];
                        if(key){
                            rowData[key] = (cells[j]).trim();
                        }
                    }
                }
                if(i!=0){
                    jsonData.push(rowData);
                }
            }
            return jsonData;
        }

    public static function csvFileToArrayObj(rawData:Object):Array {
        var allTextLines:Array = rawData.split(/\r\n|\n/);
        var headers:Array = allTextLines[0].split(',');
        var lines:Array = [];

        for (var i:int=1; i<allTextLines.length; i++) {
            var data:Array = allTextLines[i].split(',');
            if (data.length == headers.length) {

                var tarr:Array = [];
                for (var j:int=0; j<headers.length; j++) {
                    tarr.push(headers[j]+":"+data[j]);
                }
                lines.push(tarr);
            }
        }
        return lines;
    }

        /**
         * remove \n\r from the string
         */
        public static function remvoeNewlineAndTab(i:String):String{
            var result:String;
            result = i.replace(/(\r\n|\n|\r)/gm, ""); 
            return result;
        }
    }
}