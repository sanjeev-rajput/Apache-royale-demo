package views.actionitemviews.shoppingcart {


    import com.model.ServiceLoader;
    import org.apache.royale.debugging.throwError;
    import org.apache.royale.events.MouseEvent;
    import org.apache.royale.icons.FontAwesomeToggleIcon;

    public class Controller {
        private var _view:ShoppingMain;
        public function Controller(view:ShoppingMain) {
            _view = view;
            _view.cartArea.height -= _view.checkoutArea.height
            loadData();
            setupCartDropTarget();
            initEvents();
        }

        private function loadData():void {
            var sldr:ServiceLoader = new ServiceLoader();
            sldr.loadJData("config/ShoppingProduct.json", loadHandler, ServiceLoader.DATA_TYPE_JSON, errorHandler, false);
        }

        private function loadHandler(d:JSON):void {
            ProductManager.instance.products = d;
            ProductManager.instance.renderProductList(_view.productList);
            CartManager.instance.view = _view.cartArea;
            CheckoutManager.instance.view = _view.checkoutArea;
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

        private function initEvents():void {
            _view.sortUiByPrice.addEventListener(MouseEvent.CLICK, sortUiEventHandler);
            _view.sortUiByQty.addEventListener(MouseEvent.CLICK, sortUiEventHandler)
        }

        private function sortUiEventHandler(e:MouseEvent):void {
            var sUi:FontAwesomeToggleIcon = e.currentTarget as FontAwesomeToggleIcon;
            if(sUi.id == 'sortUiByPrice'){
                if(sUi.flipVertical)ProductManager.instance.shortProductListBy(ProductManager.SORT_BY_PRICE, ProductManager.DESCENDING);
                if(!sUi.flipVertical)ProductManager.instance.shortProductListBy(ProductManager.SORT_BY_PRICE, ProductManager.ASCENDING);
                sUi.flipVertical = !sUi.flipVertical;
            }
            if(sUi.id == 'sortUiByQty'){
                if(sUi.flipVertical)ProductManager.instance.shortProductListBy(ProductManager.SORT_BY_QUANTITY, ProductManager.DESCENDING);
                if(!sUi.flipVertical)ProductManager.instance.shortProductListBy(ProductManager.SORT_BY_QUANTITY, ProductManager.ASCENDING);
                sUi.flipVertical = !sUi.flipVertical;
            }
        }

    }

}