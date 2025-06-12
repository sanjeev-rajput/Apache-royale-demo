package views.actionitemviews.shoppingcart {


    import com.model.ServiceLoader;
    import org.apache.royale.debugging.throwError;
    import com.unhurdle.spectrum.Toast;

    public class Controller {
        private var _view:ShoppingMain;
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
            ProductManager.instance.products = d;
            ProductManager.instance.renderProductList(_view.productList);
            CartManager.instance.view = _view.cartArea;
            CheckoutManager.instance.priceLbl = _view.totalLabel;
        }

        private function errorHandler():void {
            throwError("failed to load shopping data");
        }

        private function setupCartDropTarget():void {
            _view.cartArea.element.addEventListener("dragover", function(e:*):void {
                e.preventDefault();
            });

            _view.cartArea.element.addEventListener("drop", function(e:*):void {
                var id:String = e.dataTransfer.getData("text/plain");
                CartManager.instance.addToCart(id);
            });
        }

    }

}