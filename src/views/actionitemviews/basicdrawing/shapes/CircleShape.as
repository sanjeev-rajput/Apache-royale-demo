package views.actionitemviews.basicdrawing.shapes {
    import org.apache.royale.svg.elements.Circle;
    import org.apache.royale.core.IChild;

    public class CircleShape implements IDrawableShape {
        private var _shape:Circle;
        private var _startX:Number;
        private var _startY:Number;

        public function create(startX:Number, startY:Number, endX:Number, endY:Number, color:String):IChild {
            _shape = new Circle();
            _startX = startX;
            _startY = startY;
            update(endX, endY);
            _shape.fill = color;
            return _shape;
        }

        public function update(endX:Number, endY:Number):void {
            var dx:Number = endX - _startX;
            var dy:Number = endY - _startY;
            var radius:Number = Math.sqrt(dx * dx + dy * dy) / 2;
            _shape.cx = ((_startX + endX) / 2).toString();
            _shape.cy = ((_startY + endY) / 2).toString();
            _shape.r = radius.toString();
        }

        public function hitTest(x:Number, y:Number):Boolean {
            var dx:Number = x - Number(_shape.cx);
            var dy:Number = y - Number(_shape.cy);
            return (dx * dx + dy * dy) <= Number(_shape.r) * Number(_shape.r);
        }

        public function move(dx:Number, dy:Number):void {
            var cx:Number = Number(_shape.cx) + dx;
            var cy:Number = Number(_shape.cy) + dy;
            _shape.cx = cx.toString();
            _shape.cy = cy.toString();
        }
        public function setColor(color:String):void {
            _shape.fill = color;
        }
        
        public function get shape():IChild {
            return _shape;
        }
    }
}
