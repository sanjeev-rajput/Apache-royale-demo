package views.actionitemviews.basicdrawing.shapes {
    import org.apache.royale.svg.elements.Line;
    import org.apache.royale.core.IChild;

    public class LineShape implements IDrawableShape {
        private var _shape:Line;
        private var _startX:Number;
        private var _startY:Number;

        public function create(startX:Number, startY:Number, endX:Number, endY:Number, color:String):IChild {
            _shape = new Line();
            _startX = startX;
            _startY = startY;
            update(endX, endY);
            _shape.stroke = color;
            _shape.strokeWidth = "5";
            return _shape;
        }

        public function update(endX:Number, endY:Number):void {
            _shape.x1 = _startX;
            _shape.y1 = _startY;
            _shape.x2 = endX;
            _shape.y2 = endY;
        }

        public function hitTest(x:Number, y:Number):Boolean {
            var line:Line = _shape as Line;
            var x1:Number = Number(line.x1);
            var y1:Number = Number(line.y1);
            var x2:Number = Number(line.x2);
            var y2:Number = Number(line.y2);

            // Line segment vector
            var dx:Number = x2 - x1;
            var dy:Number = y2 - y1;
            var lengthSq:Number = dx * dx + dy * dy;

            if (lengthSq == 0) {
                // Degenerate line (a point)
                var distToPoint:Number = Math.sqrt((x - x1)*(x - x1) + (y - y1)*(y - y1));
                return distToPoint <= 5;
            }

            // Projection factor
            var t:Number = ((x - x1) * dx + (y - y1) * dy) / lengthSq;
            t = Math.max(0, Math.min(1, t));

            // Projection point on the line
            var projX:Number = x1 + t * dx;
            var projY:Number = y1 + t * dy;

            // Distance from click to line
            var dist:Number = Math.sqrt((x - projX) * (x - projX) + (y - projY) * (y - projY));
            return dist <= 5;
        }


        public function move(dx:Number, dy:Number):void {
            var line:Line = _shape as Line;
            line.x1 = Number(line.x1) + dx;
            line.y1 = Number(line.y1) + dy;
            line.x2 = Number(line.x2) + dx;
            line.y2 = Number(line.y2) + dy;
        }
        public function setColor(color:String):void {
            _shape.stroke = color;
        }

        public function get shape():IChild {
            return _shape;
        }
    }
}
