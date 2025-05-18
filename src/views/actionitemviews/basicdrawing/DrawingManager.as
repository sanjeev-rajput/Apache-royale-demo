package views.actionitemviews.basicdrawing {
    import org.apache.royale.svg.elements.Svg;
    import org.apache.royale.core.IChild;
    import com.unhurdle.spectrum.Container;
    import org.apache.royale.events.MouseEvent;
    import views.actionitemviews.basicdrawing.shapes.*;
    import org.apache.royale.svg.elements.Rect;
    import org.apache.royale.svg.elements.Circle;
    import org.apache.royale.svg.elements.Line;
    

    public class DrawingManager {
        private var svgCanvas:Svg;
        private var container:Container;
        private var currentShapeType:String = "Rectangle";
        private var currentColor:String = "#ffcc99";
        private var drawingShape:IDrawableShape;
        private var startX:Number;
        private var startY:Number;
        private var isDrawing:Boolean = false;
        private var mode:String = "draw"; // or "select"
        public static var DRAW:String = "draw";
        public static const SELECT:String = "select";
        private var selectedShape:IDrawableShape;
        private var lastMouseX:Number;
        private var lastMouseY:Number;
        private var shapes:Array = [];
        private var selectionRect:Rect;


        

        public function DrawingManager(host:Container):void {
            container = host;
            initCanvas();
        }

        public function set shapeType(value:String):void {
            currentShapeType = value;
        }

        public function set color(value:String):void {
            currentColor = value;
            changeSelectedShapeColor(value);
        }

        public function set drawingMode(value:String):void {
            mode = value; // "draw" or "select"
            updateCursor();
        }

        public function get canvas():Svg{
            return svgCanvas;
        }

        public function initCanvas():void {
            if(svgCanvas)container.removeElement(svgCanvas);
            svgCanvas = new Svg();
            svgCanvas.width = 800;
            svgCanvas.height = 600;
            svgCanvas.style = "border: 1px solid #ccc;";
            container.addElement(svgCanvas);

            svgCanvas.addEventListener(MouseEvent.MOUSE_DOWN, onMouseDown);
            svgCanvas.addEventListener(MouseEvent.MOUSE_MOVE, onMouseMove);
            svgCanvas.addEventListener(MouseEvent.MOUSE_UP, onMouseUp);
        }

        private function onMouseDown(e:MouseEvent):void {
            startX = e.localX;
            startY = e.localY;
            lastMouseX = startX;
            lastMouseY = startY;
            if (mode == "draw") {
                drawingShape = getShapeInstance();
                var shapeElement:IChild = drawingShape.create(startX, startY, startX, startY, currentColor);
                svgCanvas.addElement(shapeElement);
                shapes.push(drawingShape); // track this shape
            } else if (mode == "select") {
                selectedShape = findShapeAtPoint(startX, startY);
                if(selectedShape){
                    svgCanvas.removeElement(selectedShape.shape);
                    svgCanvas.addElement(selectedShape.shape);
                    showSelection(selectedShape)
                }else{
                    if (selectionRect) {
                        svgCanvas.removeElement(selectionRect);
                        selectionRect = null;
                    }
                }
            }
            isDrawing = true;
            trace(mode)
        }

        private function onMouseMove(e:MouseEvent):void {
            if (!isDrawing) return;

            if (mode == "draw" && drawingShape) {
                drawingShape.update(e.localX, e.localY);
            } else if (mode == "select" && selectedShape) {
                var dx:Number = e.localX - lastMouseX;
                var dy:Number = e.localY - lastMouseY;
                selectedShape.move(dx, dy);
                lastMouseX = e.localX;
                lastMouseY = e.localY;
                if (selectionRect) {
                    var bounds:Object = getShapeBounds(selectedShape);
                    selectionRect.x = bounds.x;
                    selectionRect.y = bounds.y;
                    selectionRect.width = bounds.width;
                    selectionRect.height = bounds.height;
                }
            }
        }

        private function onMouseUp(e:MouseEvent):void {
            isDrawing = false;
            drawingShape = null;
            //selectedShape = null;
            // if (selectionRect) {
            //     svgCanvas.removeElement(selectionRect);
            //     selectionRect = null;
            // }
        }

        private function getShapeInstance():IDrawableShape {
            switch (currentShapeType) {
                case "Rectangle": return new RectangleShape();
                case "Circle": return new CircleShape();
                case "Line": return new LineShape();
                case "Freehand": return new FreehandShape();
                default: return new RectangleShape();
            }
        }

        private function findShapeAtPoint(x:Number, y:Number):IDrawableShape {
            for (var i:int = shapes.length - 1; i >= 0; i--) {
                if (shapes[i].hitTest(x, y)) return shapes[i];
                }
            return null;
        }

        private function updateCursor():void {
            switch (mode) {
                case "draw":
                    svgCanvas.element.style.cursor = "crosshair"; // or "cell", "copy"
                    break;
                case "move":
                    svgCanvas.element.style.cursor = "move";
                    break;
                default:
                    svgCanvas.element.style.cursor = "default";
                    break;
            }
        }

        private function showSelection(shape:IDrawableShape):void {
            if (selectionRect) {
                svgCanvas.removeElement(selectionRect);
                selectionRect = null;
            }

            var bounds:Object = getShapeBounds(shape);
            selectionRect = new Rect();
            selectionRect.x = bounds.x;
            selectionRect.y = bounds.y;
            selectionRect.width = bounds.width;
            selectionRect.height = bounds.height;
            selectionRect.fill = "none";
            selectionRect.stroke = "#00f";
            selectionRect.strokeWidth = "2";
            selectionRect.style = "stroke-dasharray:4,2;";

            svgCanvas.addElement(selectionRect);
        }

        private function getShapeBounds(shape:IDrawableShape):Object {
            var s:Object = shape.shape;
            if (s is Rect) {
                return { x: s.x, y: s.y, width: s.width, height: s.height };
            } else if (s is Circle) {
                var cx:Number = Number(s.cx);
                var cy:Number = Number(s.cy);
                var r:Number = Number(s.r);
                return { x: cx - r, y: cy - r, width: r * 2, height: r * 2 };
            } else if (s is Line) {
                var x1:Number = Number(s.x1);
                var y1:Number = Number(s.y1);
                var x2:Number = Number(s.x2);
                var y2:Number = Number(s.y2);
                return {x: Math.min(x1, x2), y: Math.min(y1, y2), width: Math.abs(x2 - x1),height: Math.abs(y2 - y1)};
            }
            // Fallback
            return { x: 0, y: 0, width: 0, height: 0 };
        }

        public function changeSelectedShapeColor(color:String):void {
            if (selectedShape && selectedShape.shape) {
                currentColor = color;
                selectedShape.setColor(color);
            }
        }


    }
}