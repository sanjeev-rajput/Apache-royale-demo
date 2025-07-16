package com.extjavascript.charts
{   
	public class ChartToJs
	{
		/** 
         * <inject_script>
		 * var script = document.createElement("script");
		 * script.setAttribute("src", "com/extjavascript/charts/Chart.js");
		 * document.head.appendChild(script);
         * </inject_script>
		 */


        private function ChartToJs(){}
        
        
        public static function get chartObj():Object {
            return window["Chart"];
        }
        
        
    }
}