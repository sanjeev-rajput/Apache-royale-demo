package com.util
{
    public class DictionaryUtil
    {
        private var _map:Object;

        public function DictionaryUtil()
        {
            _map = {};
        }

        public function get(key:String):*
        {
            return _map[key];
        }

        public function set(key:String, value:*):void
        {
            _map[key] = value;
        }

        public function has(key:String):Boolean
        {
            return _map.hasOwnProperty(key);
        }

        public function remove(key:String):void
        {
            delete _map[key];
        }

        public function clear():void
        {
            for (var key:String in _map)
            {
                delete _map[key];
            }
        }

        public function keys():Array
        {
            var result:Array = [];
            for (var key:String in _map)
            {
                result.push(key);
            }
            return result;
        }
    }
}
