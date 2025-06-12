package views.actionitemviews.shoppingcart{

    import org.apache.royale.jewel.HGroup;
    import org.apache.royale.jewel.Label;

    public class CheckoutManager {
        private static var _instance:CheckoutManager = null;
        private var _priceLbl:Label;

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

        public function set priceLbl(v:Label):void {
            _priceLbl = v;
        }

        public function updaPriceTotal():void {
            var totalPrice:Number = 0;
            for each (var item:Object in CartManager.instance.cartItems) {
                totalPrice += item.price * item.qty;
            }
            _priceLbl.html = "Total: $" + totalPrice.toFixed(2);
        }

        public function checkout():void {
            // Implement checkout logic here
            // For example, process payment, clear cart, etc.
        }
    }
    
}