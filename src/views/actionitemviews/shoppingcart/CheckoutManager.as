package views.actionitemviews.shoppingcart{

    import org.apache.royale.jewel.Label;
    import org.apache.royale.jewel.Group;
    import org.apache.royale.jewel.Button;
    import org.apache.royale.jewel.beads.controls.Disabled;

    public class CheckoutManager {
        private static var _instance:CheckoutManager = null;
        private var _view:Group;
        private var _priceLbl:Label;
        private var _btnChkout:Button;

        private function CheckoutManager() {
            if (_instance) {
                throw new Error("CheckoutManager is a singleton and cannot be instantiated multiple times.");
            }
        }

        public static function get instance():CheckoutManager {
            if (!_instance) {
                _instance = new CheckoutManager();
            }
            return _instance;
        }

        public function set view(v:Group):void {
            _view = v;
            for(var i:int=0; i<=_view.numElements-1; i++){
                if(_view.getElementAt(i).element.id == "totalLabel") _priceLbl = _view.getElementAt(i) as Label
                if(_view.getElementAt(i).element.id == "btnCheckout") _btnChkout = _view.getElementAt(i) as Button
                var db:Disabled = new Disabled();
                _btnChkout.addBead(db);
                db.disabled = true;
            }
            
        }

        public function updaPriceTotal():void {
            var totalPrice:Number = 0;
            
            for each (var item:Object in CartManager.instance.cartItems) {
                totalPrice += item.price * item.qty;
            }
            _priceLbl.html = "Total: $" + totalPrice.toFixed(2);
            var db:Disabled = Disabled(_btnChkout.getBeadByType(Disabled))

            totalPrice == 0 ? db.disabled = true : db.disabled =false ;
            totalPrice == 0 ? _btnChkout.style = "color:null; cursor:null;" : _btnChkout.style = "color:red; cursor:pointer;";
            
        }

        public function checkout():void {
            // Implement checkout logic here
            // For example, process payment, clear cart, etc.
        }
    }
    
}