package views.actionitemviews.basicdrawing.shapes {
    import org.apache.royale.svg.elements.Path;
    import org.apache.royale.core.IChild;

    public class FreehandShape implements IDrawableShape {
        private var _shape:Path;
        private var _pathData:String;
        private var _lastX:Number;
        private var _lastY:Number;

        public function create(startX:Number, startY:Number, endX:Number, endY:Number, color:String):IChild {
            _shape = new Path();
            _pathData = "M " + startX + " " + startY;
            _lastX = startX;
            _lastY = startY;
            _shape.d = _pathData;
            _shape.stroke = color;
            _shape.strokeWidth = "2";
            _shape.fill = "none";
            return _shape;
        }

        public function update(endX:Number, endY:Number):void {
            extendPath(endX, endY);
        }

        public function extendPath(x:Number, y:Number):void {
            // Add line to new point
            _pathData += " L " + x + " " + y;
            _shape.d = _pathData;
            _lastX = x;
            _lastY = y;
        }

        public function hitTest(x:Number, y:Number):Boolean {
            // You could add a rough bounding box check if needed
            return false;
        }

        public function move(dx:Number, dy:Number):void {
            // Moving a freehand path requires parsing and transforming the path data
            // Optional: implement if needed
        }

        public function setColor(color:String):void {
           // _shape.stroke = color;
        }        

        public function get shape():IChild {
            return _shape;
        }


    }
}
