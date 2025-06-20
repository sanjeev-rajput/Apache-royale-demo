package views.actionitemviews.shoppingcart {


    import org.apache.royale.jewel.Group;
    import org.apache.royale.debugging.throwError;
    import org.apache.royale.events.MouseEvent;
    import com.controller.PopupManager;
    import org.apache.royale.core.UIBase;
    

    public class ProductManager {
        
        private static var _instance:ProductManager = null;
        private var _view:Group;
        private var _products:JSON;
        private var pIdx:int = 0;
        public static const SORT_BY_PRICE:String = "sortbyprice";
        public static const SORT_BY_QUANTITY:String = "softbyqty";
        public static const ASCENDING:String = "ascending";
        public static const DESCENDING:String = "descending";

        private function ProductManager() {
          
        }

        public static function get instance():ProductManager{
            if(_instance == null){
                _instance = new ProductManager();
            }
            return _instance;
        }

        public function set products(p:JSON):void {
            _products = p;
            addPid();
            
        }

        public function get products():JSON{
            return _products;
        }

        private function addPid():void {
            for each (var product:Object in products) {
                product.id = pIdx.toString();
                pIdx++;
            }
        }

        public function renderProductList(view:Group):void {
            _view = view
            if(!products) {
                throwError("product data is not set");
                return
            }
            for each (var product:Object in products) {
                var p:Product = new Product();
                p.data = product;
                p.addEventListener(MouseEvent.CLICK, pClickHandler);
                _view.addElement(p);
            }
        }

        public function shortProductListBy(sortType:String, sortOrder:String):void {
            var jsonArr:Array = products as Array;
            if(sortType == SORT_BY_PRICE){
                (products as Array).sort(function(a:Object, b:Object):int{
                    if(sortOrder == ASCENDING) return a.price > b.price ? 1 : (a.price < b.price ? -1 : 0);

                    if(sortOrder == DESCENDING) return a.price < b.price ? 1 : (a.price > b.price ? -1 : 0);
                })
            }
            if(sortType == SORT_BY_QUANTITY){
                (products as Array).sort(function(a:Object, b:Object):int{
                    if(sortOrder == ASCENDING)return a.qty-b.qty;
                    if(sortOrder == DESCENDING)return b.qty-a.qty;

                })
            }
            
            while(_view.numElements > 0) {
                _view.removeElement(_view.getElementAt(0));
            }
            renderProductList(_view)
        }

        private function pClickHandler(event:MouseEvent):void {
            var product:Product = event.currentTarget as Product;
            if (product) {
                var p:ProductPreview = new ProductPreview();
                p.data = product.data;
                PopupManager.getInstance().createPopup(p, _view.parent as UIBase, 640, 480)
            }
        }

        public function getProductById(id:String):Product {
            var items:int = _view.numElements;
            for (var i:int = 0; i < items; i++) {
                var product:Product = _view.getElementAt(i) as Product;
                if (product.id == id) {
                    return product;
                }
            }
            return null;
        }

        public function updateProductViewQty(item:CartItem):void {
            var updateQty:int = item.qt.max - item.qt.value;
            getProductById(item.id).qt.text = updateQty.toString();
            getProductDataById(item.id).qty = updateQty;
            getProductById(item.id).alpha = 1.0;
        }

        public function getProductDataById(id:String):Object {
            var existing:Object = (products as Array).find(function(i:Object, index:int, arr:Array):Boolean {
                return i.id == id;
            });
            if(existing){
                return existing;
            }else{
                return null;
            }
        }

    }
    
}