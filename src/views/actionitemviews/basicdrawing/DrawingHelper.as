//TO DO - this class is becoming out of control due to too much of functionalaty
//TO DO - devide this class, each shape to have saperate class with some common function as an interface
package views.actionitemviews.basicdrawing{
    public class DrawingHelper{
        import org.apache.royale.events.MouseEvent;
        import org.apache.royale.core.IChild;
        import org.apache.royale.svg.elements.Rect;
        import org.apache.royale.svg.elements.Circle;
        import org.apache.royale.svg.elements.Line;
        import org.apache.royale.svg.elements.Svg;
        import com.unhurdle.spectrum.Container;
        import org.apache.royale.svg.elements.Path;

        private var startX:int;
        private var startY:int;
        private var previewShape:Object; // holds current preview element
        private var svgCanvas:Svg;
        private var drawingCtr:Container;
        private var selectedShape:IChild = null;
        private var dragOffsetX:Number;
        private var dragOffsetY:Number;
        private var freehandPath:Path;
        private var pathD:String;



        private var currentShape:String = "Rectangle";
        private var currentColor:String = "#ffcc99";
        public function set _currentShape(value:String):void{
            currentShape = value;
        }
        public function set _currentColor(value:String):void{
            currentColor = value;
        }


        public function DrawingHelper(containerRef:Container):void {
            drawingCtr = containerRef;
            initSvgCanvas();
        }

        
        public function initSvgCanvas():void {
            if(svgCanvas)drawingCtr.removeElement(svgCanvas);
            svgCanvas = new Svg();
            svgCanvas.width = 800;
            svgCanvas.height = 600;
            svgCanvas.id = 'svgCanvas';
            drawingCtr.addElement(svgCanvas);
            svgCanvas.addEventListener(MouseEvent.MOUSE_DOWN, svgMouseEventHandler);
            svgCanvas.addEventListener(MouseEvent.MOUSE_MOVE, svgMouseEventHandler);
            svgCanvas.addEventListener(MouseEvent.MOUSE_UP, svgMouseEventHandler);
        }

        private function svgMouseEventHandler(e:MouseEvent):void {
            var eventType:String = e.type;
            var endX:int;
            var endY:int;
            var rect:Rect;
            var circle:Circle;
            var line:Line;
            var radious:int;
            if(eventType == MouseEvent.MOUSE_DOWN){   
                startX = e.localX;
                startY = e.localY;
                selectedShape = getShapeUnderPoint(e.localX, e.localY);
                if (selectedShape){
                    svgCanvas.removeElement(selectedShape);
                    svgCanvas.addElement(selectedShape);
                    
                    if (selectedShape is Rect){
                        dragOffsetX = startX - Rect(selectedShape).x;
                        dragOffsetY = startY - Rect(selectedShape).y;
                    }
                    else if (selectedShape is Circle){
                        dragOffsetX = startX - Number(Circle(selectedShape).cx);
                        dragOffsetY = startY - Number(Circle(selectedShape).cy);
                    }
                    else if (selectedShape is Line){
                        dragOffsetX = startX - Number(Line(selectedShape).x1);
                        dragOffsetY = startY - Number(Line(selectedShape).y1);
                    }
                    return;
                }
                if (currentShape == "Freehand") {
                    pathD = "M" + e.localX + " " + e.localY;
                    freehandPath = new Path();
                    freehandPath.d = pathD;
                    freehandPath.stroke = currentColor;
                    freehandPath.strokeWidth = "5";
                    freehandPath.fill = "none";
                    svgCanvas.addElement(freehandPath);
                }
                previewShape = null;
            }
            // end of mouse down event
            if(eventType == MouseEvent.MOUSE_MOVE){
                if (currentShape == "Freehand" && freehandPath && e.buttonDown) {
                    pathD += " L" + e.localX + " " + e.localY;
                    freehandPath.d = pathD;
                    return;
                }

                if (selectedShape){
                var moveX:Number = e.localX - dragOffsetX;
                var moveY:Number = e.localY - dragOffsetY;

                if (selectedShape is Rect){
                    Rect(selectedShape).x = moveX;
                    Rect(selectedShape).y = moveY;
                }
                else if (selectedShape is Circle){
                    Circle(selectedShape).cx = moveX.toString();
                    Circle(selectedShape).cy = moveY.toString();
                }
                else if (selectedShape is Line){
                    var dx:Number = e.localX - startX;
                    var dy:Number = e.localY - startY;

                    Line(selectedShape).x1 = (Number(Line(selectedShape).x1) + dx).toString();
                    Line(selectedShape).y1 = (Number(Line(selectedShape).y1) + dy).toString();
                    Line(selectedShape).x2 = (Number(Line(selectedShape).x2) + dx).toString();
                    Line(selectedShape).y2 = (Number(Line(selectedShape).y2) + dy).toString();

                    startX = e.localX;
                    startY = e.localY;
                }
                else if (selectedShape is Path) {
                    var tokens:Array = Path(selectedShape).d.split(" ");
                    var newTokens:Array = [];
                    var dxx:Number = e.localX - startX;
                    var dyy:Number = e.localY - startY;

                    for (var i:int = 0; i < tokens.length; i++) {
                        var token:String = tokens[i];

                        if (token == "M" || token == "L") {
                            newTokens.push(token);
                        } else {
                            var val:Number = Number(token);
                            if (!isNaN(val)) {
                                // X/Y pairs alternate: even index = X, odd = Y
                                if ((i % 3) == 1) newTokens.push((val + dxx).toFixed(2)); // X
                                else if ((i % 3) == 2) newTokens.push((val + dyy).toFixed(2)); // Y
                                else newTokens.push(token); // keep commands
                            } else {
                                newTokens.push(token);
                            }
                        }
                    }

                    Path(selectedShape).d = newTokens.join(" ");
                    startX = e.localX;
                    startY = e.localY;
                }
                return;
            }
                
            if(!e.buttonDown)return;
            endX = e.localX;
            endY = e.localY;
            if (previewShape) svgCanvas.removeElement(previewShape as IChild);
            switch (currentShape){
                case "Rectangle":
                    rect = new Rect();
                    rect.x = Math.min(startX, endX);
                    rect.y = Math.min(startY, endY);
                    rect.width = Math.abs(endX - startX);
                    rect.height = Math.abs(endY - startY);
                    rect.fill = currentColor;
                    rect.opacity = "0.4";
                    svgCanvas.addElement(rect);
                    previewShape = rect;
                    break;
                case "Circle":
                    circle = new Circle();
                    radious = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)) / 2;
                    circle.cx = ((startX + endX) / 2).toString();
                    circle.cy = ((startY + endY) / 2).toString();
                    circle.r = radious.toString();
                    circle.fill = currentColor;
                    circle.opacity = "0.4";
                    svgCanvas.addElement(circle);
                    previewShape = circle;
                    break;
                case "Line":
                    line = new Line();
                    line.x1 = startX.toString();
                    line.y1 = startY.toString();
                    line.x2 = endX.toString();
                    line.y2 = endY.toString();
                    line.stroke = currentColor;
                    line.strokeWidth = "3";
                    line.opacity = "0.4";
                    svgCanvas.addElement(line);
                    previewShape = line;
                    break;  
                }
            }
            // end of mouse move event
            if(eventType ==  MouseEvent.MOUSE_UP){
                endX = e.localX;
                endY = e.localY;
                if (selectedShape){
                    selectedShape = null;
                    return;
                }
                // Remove preview shape
                if (previewShape)svgCanvas.removeElement(previewShape as IChild);
                switch (currentShape){
                    case "Rectangle":
                        rect = new Rect();
                        rect.x = Math.min(startX, endX);
                        rect.y = Math.min(startY, endY);
                        rect.width = Math.abs(endX - startX);
                        rect.height = Math.abs(endY - startY);
                        rect.fill = currentColor;
                        svgCanvas.addElement(rect);
                        break;

                    case "Circle":
                        circle = new Circle();
                        radious = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)) / 2;
                        circle.cx = ((startX + endX) / 2).toString();
                        circle.cy = ((startY + endY) / 2).toString();
                        circle.r = radious.toString();
                        circle.fill = currentColor;
                        svgCanvas.addElement(circle);
                        break;

                    case "Line":
                        line = new Line();
                        line.x1 = startX.toString();
                        line.y1 = startY.toString();
                        line.x2 = endX.toString();
                        line.y2 = endY.toString();
                        line.stroke = currentColor;
                        line.strokeWidth = "3";
                        svgCanvas.addElement(line);
                        break;
                    case "Freehand":
                        freehandPath = null;
                        pathD = "";
                        break;
                }
                previewShape = null;
            }
        }

        private function getShapeUnderPoint(x:Number, y:Number):IChild{
            for (var i:int = svgCanvas.numElements - 1; i >= 0; i--){
                var shape:IChild = svgCanvas.getElementAt(i);

                if (shape is Rect){
                    var rect:Rect = shape as Rect;
                    if (x >= rect.x && x <= rect.x + rect.width &&
                        y >= rect.y && y <= rect.y + rect.height)
                        return rect;
                }
                else if (shape is Circle){
                    var cx:Number = Number(Circle(shape).cx);
                    var cy:Number = Number(Circle(shape).cy);
                    var r:Number = Number(Circle(shape).r);
                    var dx:Number = x - cx;
                    var dy:Number = y - cy;
                    if (Math.sqrt(dx*dx + dy*dy) <= r)
                        return shape;
                }
                else if (shape is Line){
                    // Basic proximity check for line selection
                    var lx1:Number = Number(Line(shape).x1);
                    var ly1:Number = Number(Line(shape).y1);
                    var lx2:Number = Number(Line(shape).x2);
                    var ly2:Number = Number(Line(shape).y2);
                    if (Math.abs((ly2 - ly1) * x - (lx2 - lx1) * y + lx2 * ly1 - ly2 * lx1) /
                        Math.sqrt(Math.pow(ly2 - ly1, 2) + Math.pow(lx2 - lx1, 2)) < 5)
                        return shape;
                }
                else if (shape is Path) {
                    var path:Path = shape as Path;
                    var segments:Array = path.d.split("L");

                    // First segment is "M x y"
                    var firstPoint:Array = segments[0].replace("M", "").split(" ");
                    var lastX:Number = Number(firstPoint[0]);
                    var lastY:Number = Number(firstPoint[1]);

                    for (var j:int = 1; j < segments.length; j++) {
                        var point:Array = segments[j].split(" ");
                        var nextX:Number = Number(point[0]);
                        var nextY:Number = Number(point[1]);

                        // Check if mouse is near the segment
                        var distance:Number = Math.abs((nextY - lastY) * x - (nextX - lastX) * y + nextX * lastY - nextY * lastX) /
                                            Math.sqrt(Math.pow(nextY - lastY, 2) + Math.pow(nextX - lastX, 2));
                        if (distance < 5) return shape;

                        lastX = nextX;
                        lastY = nextY;
                    }
                }

            }
            return null;
        }
    }
}