package views.actionitemviews.basicdrawing.shapes {
    import org.apache.royale.core.IChild;

    public interface IDrawableShape {
        function create(startX:Number, startY:Number, endX:Number, endY:Number, color:String):IChild;
        function hitTest(x:Number, y:Number):Boolean;
        function move(dx:Number, dy:Number):void;
        function get shape():IChild;
        function update(endX:Number, endY:Number):void;
        function setColor(color:String):void;
    }
}