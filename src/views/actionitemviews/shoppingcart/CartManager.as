package views.actionitemviews.shoppingcart{
    import com.unhurdle.spectrum.Toast;
    import org.apache.royale.jewel.Group;

    public class CartManager {
        private static var _instance:CartManager = null;
        private var _cartItems:Array = [];
        private var _view:Group;

        public function CartManager() {
            if (_instance) {
                throw new Error("CartManager is a singleton and cannot be instantiated multiple times.");
            }
        }

        public static function get instance():CartManager {
            if (!_instance) {
                _instance = new CartManager();
            }
            return _instance;
        }

        public function set view(v:Group):void {
            _cartItems = [];
            _view = v;
        }

        public function get cartItems():Array {
            return _cartItems;
        }


        public function addToCart(id:String):void {
            var existing:Object = _cartItems.find(function(item:Object, index:int, arr:Array):Boolean {
                return item.id == id;
            });

            var p:Product = ProductManager.instance.getProductById(id);
            if (parseInt(p.qt.text) == 0) {
                p.alpha = 0.5;
                var snk:Toast = new Toast();
                snk.flavor = Toast.INFO
                snk.text = "No more items left in stock";
                snk.autoClose = 2000;
                snk.show();
                return;
            }
            var qty:int = parseInt(p.qt.text);
            p.qt.text = (qty - 1).toString();

            if (existing) {
                existing.qty++;
                
            } else {
                for each (var product:Object in ProductManager.instance.products) {
                    if (product.id == id) {
                        var item:Object = {
                            id: product.id,
                            name: product.title,
                            price: product.price,
                            img: product.filename,
                            qty: 1,
                            maxQty: product.qty
                        };
                        _cartItems.push(item);
                        break;
                    }
                }
            }
            updateCartUI();
        }

        private function updateCartUI():void {
            while(_view.numElements > 0) {
                _view.removeElement(_view.getElementAt(0));
            }

            for (var i:int = 0; i < _cartItems.length; i++) {
                var item:Object = _cartItems[i];
                var cItem:CartItem = new CartItem();
                //item.callBackFunc = cartItemCallBackFunc;// cahgen to dispatch event
                cItem.addEventListener(CartItem.ITEM_REMOVED, cartItemRemoveHandler)
                cItem.addEventListener(CartItem.ITEM_QTY_CHANGED, cartItemQtyChangeHandler)
                cItem.data = item;
                _view.addElement(cItem);
            }
            CheckoutManager.instance.updaPriceTotal();
        }

        private function cartItemRemoveHandler(cItem:Object):void {
            var p:CartItem = cItem.item as CartItem;    
            p.qt.value = 0;    
            _cartItems = _cartItems.filter(function(item:Object, index:int, arr:Array):Boolean {
                return item.id != p.id;
            });
            updateCartUI();
            ProductManager.instance.updateProductViewQty(p);
        }

        private function cartItemQtyChangeHandler(cItem:Object):void{
            var item:CartItem = cItem.item as CartItem;
            var qty:int = item.qt.value
            if (qty == 0) {
                    var obj:Object = new Object;
                    obj.item = item;
                    cartItemRemoveHandler(obj);
                }else{
                    var existing:Object = _cartItems.find(function(i:Object, index:int, arr:Array):Boolean {
                        return i.id == item.id;
                    });
                    if(existing)existing.qty = qty;
                    ProductManager.instance.updateProductViewQty(item)
                }
            CheckoutManager.instance.updaPriceTotal();
        }

        // changed below code to dispatch event manner
        /*private function cartItemCallBackFunc(action:String, p:Product, qty:String = null):void {
            if (action == CartItem.ITEM_REMOVED) {
                _cartItems = _cartItems.filter(function(item:Object, index:int, arr:Array):Boolean {
                    return item.id != p.id;
                });
                updateCartUI();
                ProductManager.instance.resetProductToDefault(p);
            }

            if (action == CartItem.ITEM_QTY_CHANGED) {
                if (parseInt(qty) == 0) {
                    cartItemCallBackFunc(CartItem.ITEM_REMOVED, p);
                }else{
                    var pQty:int = parseInt(ProductManager.instance.getProductDataById(p.id).qty);
                    ProductManager.instance.getProductById(p.id).qt.text = (pQty - parseInt(qty)).toString()
                    ProductManager.instance.getProductById(p.id).alpha = 1.0;

                }
                CheckoutManager.instance.updaPriceTotal();
            } 
        }*/
    }
    
}