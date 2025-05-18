//fully working just make an object of this class and add it to UIbase component 
// initially i wrote it as a component but later i dicided not to use it in this application insted use mxml+as
package com.comp.drawing{
    import org.apache.royale.core.UIBase;
    import org.apache.royale.html.ComboBox;
    import org.apache.royale.html.TextInput;
    import org.apache.royale.html.Label;

    import org.apache.royale.html.Group;
    import org.apache.royale.events.MouseEvent;

    import org.apache.royale.svg.elements.Rect;
    import org.apache.royale.svg.elements.Circle;
    import org.apache.royale.svg.elements.Line;
    import org.apache.royale.svg.elements.Svg;
    import com.unhurdle.spectrum.Button;
    import org.apache.royale.core.IChild;

    public class DrawingCanvasComponent extends UIBase
    {
        private var svgCanvas:Svg;
        private var shapeSelector:ComboBox;
        private var colorInput:TextInput;
        private var clearButton:Button;

        private var currentShape:String = "rectangle";
        private var currentColor:String = "#ff0000";

        private var selectedShape:IChild = null;
        private var dragOffsetX:Number;
        private var dragOffsetY:Number;

        private var startX:Number;
        private var startY:Number;

        private var previewShape:Object; // holds current preview element

        public function DrawingCanvasComponent()
        {
            super();
        }

        override public function addedToParent():void
        {
            super.addedToParent();

            var toolGroup:Group = new Group();
            toolGroup.percentWidth = 100;

            var shapeLabel:Label = new Label();
            shapeLabel.text = "Shape:";
            toolGroup.addElement(shapeLabel);

            shapeSelector = new ComboBox();
            shapeSelector.dataProvider = ["rectangle", "circle", "line"];
            shapeSelector.selectedIndex = 0;
            shapeSelector.addEventListener("change", function():void
                {
                    currentShape = shapeSelector.selectedItem as String;
                });
            toolGroup.addElement(shapeSelector);

            var colorLabel:Label = new Label();
            colorLabel.text = "Color (hex):";
            toolGroup.addElement(colorLabel);

            colorInput = new TextInput();
            colorInput.text = "#ff0000";
            colorInput.addEventListener("change", function():void
                {
                    currentColor = colorInput.text;
                });
            toolGroup.addElement(colorInput);

            clearButton = new Button();
            clearButton.text = "Clear";
            clearButton.addEventListener(MouseEvent.CLICK, function():void
                {

                    resetCanvas();

                });
            toolGroup.addElement(clearButton);

            addElement(toolGroup);
            resetCanvas();

        }

        private function resetCanvas():void
        {
            if (svgCanvas)
                removeElement(svgCanvas);
            svgCanvas = new Svg();
            svgCanvas.width = 600;
            svgCanvas.height = 400;
            svgCanvas.style = "border: 1px solid #ccc; margin-top:10px;";
            svgCanvas.addEventListener(MouseEvent.MOUSE_DOWN, onMouseDown);
            svgCanvas.addEventListener(MouseEvent.MOUSE_MOVE, onMouseMove);
            svgCanvas.addEventListener(MouseEvent.MOUSE_UP, onMouseUp);
            addElement(svgCanvas);
        }

        private function onMouseDown(event:MouseEvent):void
        {
            startX = event.localX;
            startY = event.localY;
            selectedShape = getShapeUnderPoint(event.localX, event.localY);

            if (selectedShape)
            {
                if (selectedShape is Rect)
                {
                    dragOffsetX = startX - Rect(selectedShape).x;
                    dragOffsetY = startY - Rect(selectedShape).y;
                }
                else if (selectedShape is Circle)
                {
                    dragOffsetX = startX - Number(Circle(selectedShape).cx);
                    dragOffsetY = startY - Number(Circle(selectedShape).cy);
                }
                else if (selectedShape is Line)
                {
                    dragOffsetX = startX - Number(Line(selectedShape).x1);
                    dragOffsetY = startY - Number(Line(selectedShape).y1);
                }
                return;
            }

            previewShape = null; // if not moving
            previewShape = null;
        }

        private function onMouseMove(event:MouseEvent):void
        {
            if (selectedShape)
            {
                var moveX:Number = event.localX - dragOffsetX;
                var moveY:Number = event.localY - dragOffsetY;

                if (selectedShape is Rect)
                {
                    Rect(selectedShape).x = moveX;
                    Rect(selectedShape).y = moveY;
                }
                else if (selectedShape is Circle)
                {
                    Circle(selectedShape).cx = moveX.toString();
                    Circle(selectedShape).cy = moveY.toString();
                }
                else if (selectedShape is Line)
                {
                    var dx:Number = event.localX - startX;
                    var dy:Number = event.localY - startY;

                    Line(selectedShape).x1 = (Number(Line(selectedShape).x1) + dx).toString();
                    Line(selectedShape).y1 = (Number(Line(selectedShape).y1) + dy).toString();
                    Line(selectedShape).x2 = (Number(Line(selectedShape).x2) + dx).toString();
                    Line(selectedShape).y2 = (Number(Line(selectedShape).y2) + dy).toString();

                    startX = event.localX;
                    startY = event.localY;
                }
                return;
            }
            if (event.buttonDown)
            {
                var endX:Number = event.localX;
                var endY:Number = event.localY;

                // Remove old preview
                if (previewShape)
                    svgCanvas.removeElement(previewShape as IChild);

                // Draw new preview shape
                switch (currentShape)
                {
                    case "rectangle":
                        var rect:Rect = new Rect();
                        rect.x = Math.min(startX, endX);
                        rect.y = Math.min(startY, endY);
                        rect.width = Math.abs(endX - startX);
                        rect.height = Math.abs(endY - startY);
                        rect.fill = currentColor;
                        rect.opacity = "0.4";
                        svgCanvas.addElement(rect);
                        previewShape = rect;
                        break;

                    case "circle":
                        var circle:Circle = new Circle();
                        var r:Number = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)) / 2;
                        circle.cx = ((startX + endX) / 2).toString();
                        circle.cy = ((startY + endY) / 2).toString();
                        circle.r = r.toString();
                        circle.fill = currentColor;
                        circle.opacity = "0.4";
                        svgCanvas.addElement(circle);
                        previewShape = circle;
                        break;

                    case "line":
                        var line:Line = new Line();
                        line.x1 = startX.toString();
                        line.y1 = startY.toString();
                        line.x2 = endX.toString();
                        line.y2 = endY.toString();
                        line.stroke = currentColor;
                        line.strokeWidth = "2";
                        line.opacity = "0.4";
                        svgCanvas.addElement(line);
                        previewShape = line;
                        break;
                }
            }
        }

        private function onMouseUp(event:MouseEvent):void
        {
            var endX:Number = event.localX;
            var endY:Number = event.localY;
            if (selectedShape)
            {
                selectedShape = null;
                return;
            }
            // Remove preview shape
            if (previewShape)
                svgCanvas.removeElement(previewShape as IChild);

            // Final shape
            switch (currentShape)
            {
                case "rectangle":
                    var rect:Rect = new Rect();
                    rect.x = Math.min(startX, endX);
                    rect.y = Math.min(startY, endY);
                    rect.width = Math.abs(endX - startX);
                    rect.height = Math.abs(endY - startY);
                    rect.fill = currentColor;
                    svgCanvas.addElement(rect);
                    break;

                case "circle":
                    var circle:Circle = new Circle();
                    var r:Number = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)) / 2;
                    circle.cx = ((startX + endX) / 2).toString();
                    circle.cy = ((startY + endY) / 2).toString();
                    circle.r = r.toString();
                    circle.fill = currentColor;
                    svgCanvas.addElement(circle);
                    break;

                case "line":
                    var line:Line = new Line();
                    line.x1 = startX.toString();
                    line.y1 = startY.toString();
                    line.x2 = endX.toString();
                    line.y2 = endY.toString();
                    line.stroke = currentColor;
                    line.strokeWidth = "2";
                    svgCanvas.addElement(line);
                    break;
            }

            previewShape = null;
        }

        private function getShapeUnderPoint(x:Number, y:Number):IChild
        {
            for (var i:int = svgCanvas.numElements - 1; i >= 0; i--)
            {
                var shape:IChild = svgCanvas.getElementAt(i);

                if (shape is Rect)
                {
                    var rect:Rect = shape as Rect;
                    if (x >= rect.x && x <= rect.x + rect.width &&
                            y >= rect.y && y <= rect.y + rect.height)
                        return rect;
                }
                else if (shape is Circle)
                {
                    var cx:Number = Number(Circle(shape).cx);
                    var cy:Number = Number(Circle(shape).cy);
                    var r:Number = Number(Circle(shape).r);
                    var dx:Number = x - cx;
                    var dy:Number = y - cy;
                    if (Math.sqrt(dx * dx + dy * dy) <= r)
                        return shape;
                }
                else if (shape is Line)
                {
                    // Basic proximity check for line selection
                    var lx1:Number = Number(Line(shape).x1);
                    var ly1:Number = Number(Line(shape).y1);
                    var lx2:Number = Number(Line(shape).x2);
                    var ly2:Number = Number(Line(shape).y2);
                    if (Math.abs((ly2 - ly1) * x - (lx2 - lx1) * y + lx2 * ly1 - ly2 * lx1) /
                            Math.sqrt(Math.pow(ly2 - ly1, 2) + Math.pow(lx2 - lx1, 2)) < 5)
                        return shape;
                }
            }
            return null;
        }

    }
}
