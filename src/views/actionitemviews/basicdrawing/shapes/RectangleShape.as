package views.actionitemviews.basicdrawing.shapes {
    import org.apache.royale.svg.elements.Rect;
    import org.apache.royale.core.IChild;

    public class RectangleShape implements IDrawableShape {
        private var _shape:Rect;
        private var _startX:Number;
        private var _startY:Number;
        private var _lastX:Number;
        private var _lastY:Number;

        public function create(startX:Number, startY:Number, endX:Number, endY:Number, color:String):IChild {
            _shape = new Rect();
            _startX = startX;
            _startY = startY;
            _lastX = startX;
            _lastY = startY;
            update(endX, endY);
            _shape.fill = color;
            return _shape;
        }

        public function update(endX:Number, endY:Number):void {
            _shape.x = Math.min(_startX, endX);
            _shape.y = Math.min(_startY, endY);
            _shape.width = Math.abs(endX - _startX);
            _shape.height = Math.abs(endY - _startY);
        }

        public function hitTest(x:Number, y:Number):Boolean {
            return x >= _shape.x && x <= _shape.x + _shape.width &&
                   y >= _shape.y && y <= _shape.y + _shape.height;
        }

        public function move(dx:Number, dy:Number):void {
            _shape.x += dx;
            _shape.y += dy;
        }

        // Helper to get the current shape position for dynamic updates
        public function get currentX():Number {
            return _shape.x;
        }

        public function get currentY():Number {
            return _shape.y;
        }

        public function get width():Number {
            return _shape.width;
        }

        public function get height():Number {
            return _shape.height;
        }

        public function setColor(color:String):void {
            _shape.fill = color;
        }

        public function get shape():IChild {
            return _shape;
        }


    }
}
