package views.actionitemviews.shoppingcart {


    import com.model.ServiceLoader;
    import org.apache.royale.debugging.throwError;
    import com.unhurdle.spectrum.Toast;

    public class Controller {
        private var _view:ShoppingMain;
        private var cartItems:Array = [];
        [Bindable]
        public var products:JSON;
        private var pIdx:int = 0;
        public function Controller(view:ShoppingMain) {
            _view = view;
            _view.cartArea.height -= _view.checkoutArea.height
            loadData();
            setupCartDropTarget();
        }

        private function loadData():void {
            var sldr:ServiceLoader = new ServiceLoader();
            sldr.loadJData("config/ShoppingProduct.json", loadHandler, ServiceLoader.DATA_TYPE_JSON, errorHandler, false);
        }

        private function loadHandler(d:JSON):void {
            products = d;
            addPid();
            renderProductList();
        }

        private function addPid():void {
            for each (var product:Object in products) {
                product.id = pIdx.toString();
                pIdx++;
            }
        }

        private function errorHandler():void {
            throwError("failed to load shopping data");
        }

        private function renderProductList():void {
            for each (var product:Object in products) {
                var p:Product = new Product();
                p.data = product;
                _view.productList.addElement(p);

            }
        }

        private function setupCartDropTarget():void {
            _view.cartArea.element.addEventListener("dragover", function(e:*):void {
                e.preventDefault();
            });

            _view.cartArea.element.addEventListener("drop", function(e:*):void {
                var id:String = e.dataTransfer.getData("text/plain");
                addToCart(id);
            });
        }

        private function addToCart(id:String):void {
            var existing:Object = cartItems.find(function(item:Object, index:int, arr:Array):Boolean {
                return item.id == id;
            });

            var p:Product = findProductById(id);
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
                for each (var product:Object in products) {
                    if (product.id == id) {
                        var item:Object = {
                            id: product.id,
                            name: product.title,
                            price: product.price,
                            img: product.filename,
                            qty: 1
                        };
                        cartItems.push(item);
                        break;
                    }
                }
            }
            updateCartUI();
        }

        private function updateCartUI():void {
            while(_view.cartArea.numElements > 0) {
                _view.cartArea.removeElement(_view.cartArea.getElementAt(0));
            }

            var total:Number = 0;

            for (var i:int = 0; i < cartItems.length; i++) {
                var item:Object = cartItems[i];
                total += item.price * item.qty;
                var cItem:CartItem = new CartItem();
                item.removeFunc = removeItemFromCart;
                cItem.data = item;
                _view.cartArea.addElement(cItem);
            }

            _view.totalLabel.text = "Total: $" + total.toFixed(2);
        }

        private function removeItemFromCart(id:String):void {
            cartItems = cartItems.filter(function(item:Object, index:int, arr:Array):Boolean {
                return item.id != id;
            });
            updateCartUI();
        }

        private function findProductById(id:String):Product {
            var items:int = _view.productList.numElements;
            for (var i:int = 0; i < items; i++) {
                var product:Product = _view.productList.getElementAt(i) as Product;
                if (product.id == id) {
                    return product;
                }
            }
            return null;
        }
    }

}