package views.actionitemviews.basicdrawing {
    import org.apache.royale.svg.elements.Svg;
    import org.apache.royale.core.WrappedHTMLElement;

    public class ExportHelper {

        public static function exportSVGAsPNG(svgCanvas:Svg, fileName:String = "drawing.png"):void {
            var svgElement:WrappedHTMLElement = svgCanvas.element;
            var serializer:* = new window["XMLSerializer"]();
            var svgString:String = serializer.serializeToString(svgElement);

            var img:* = new window["Image"]();
            img.onload = function():void {
                var canvas:* = window["document"].createElement("canvas");
                canvas.width = svgCanvas.width;
                canvas.height = svgCanvas.height;

                var ctx:* = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);

                var pngDataUrl:String = canvas.toDataURL("image/png");

                var a:* = window["document"].createElement("a");
                a.href = pngDataUrl;
                a.download = fileName;
                window["document"].body.appendChild(a);
                a.click();
                window["document"].body.removeChild(a);
            };

            // Proper encoding of SVG string into base64 data URI
            var encodedData:String = window["btoa"](unescape(encodeURIComponent(svgString)));
            img.src = "data:image/svg+xml;base64," + encodedData;
        }
    }
}
