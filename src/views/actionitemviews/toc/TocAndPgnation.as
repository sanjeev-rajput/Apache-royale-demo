package views.actionitemviews.toc {
    import com.unhurdle.spectrum.Accordion;
    import com.comp.pagination.Pagination;
    import com.model.ServiceLoader;
    import com.util.DsUtil;
    import org.apache.royale.collections.ArrayList;
    import org.apache.royale.jewel.ImageIcon;
    import views.ContentLoaderIframe;
    import org.apache.royale.jewel.Container;
    import org.apache.royale.jewel.HGroup;
    import org.apache.royale.jewel.supportClasses.scrollbar.ScrollingViewport;
    import com.unhurdle.spectrum.AccordionSection;
    import org.apache.royale.core.IBead;
    import com.unhurdle.spectrum.AccordionContent;
    import org.apache.royale.events.MouseEvent;
    import com.event.DsEvent;
    import com.unhurdle.spectrum.Switch;

    public class TocAndPgnation{

        private var accUi:Accordion = null;
        private var pgNationSelectedPage:int=0;
        private var pgNation:Pagination = null;
        private static const EDIT:String = 'Edit';
        private static const MOVE:String = 'Move';
        private var vg:Container;
        private var pgNationCtr:HGroup;
        private var addx:String=null;
        private var pgToolEventObj:Object;
        private var _isEditModeOn:Boolean = false;
        private var _isMoveModeOn:Boolean = false;
        private var _tocDataSet:Array;


        public function TocAndPgnation(ctr:Container, pgCtr:HGroup):void {
            vg = ctr;
            pgNationCtr = pgCtr;
            
        }


        public function loadAndUpdateAccData(obj:Object):void {
            addx = obj.data.addx;
            var sldr:ServiceLoader = new ServiceLoader();
            sldr.loadJData("config/"+obj.data.url, function loadHandler(e:Object):void {
                //renderAccUi(DsUtil.csvFileToJsonObj(e));
                parseDataToPegination(DsUtil.csvFileToJsonObj(e));
            }, ServiceLoader.DATA_TYPE_TEXT)
            }

        private function parseDataToPegination(data:Array):void{
            _tocDataSet = data;
            var arrList:ArrayList = new ArrayList();
            var subjName:String = "";
            var arr:Array = null;
            for(var i:int=0; i<=data.length-1; i++){
                var sName:String = data[i]["Grade"];
                if(sName != subjName){
                    if(arr) arrList.addItem(arr);
                    arr = new Array();
                    subjName = sName;
                }
                arr.push(data[i])
            }
            pgNationSelectedPage = 0;
            pgNation = null;
            if(addx == 'showpgtools')addPeginationTool(MOVE);
            pgNation = new Pagination();
            pgNationCtr.addElement(pgNation);
            if(addx == 'showpgtools')addPeginationTool(EDIT)
            pgNation.addEventListener(Pagination.PAGINATION_CHANGE_EVENT, function():void{
                if(pgNationSelectedPage == pgNation.getCurrentPage()){
                    return;
                }
                pgNationSelectedPage = pgNation.getCurrentPage();
                renderAccUi(arrList[pgNation.getCurrentPage()-1] as Array)  
            })
            pgNation.setTotalPages(arrList.length)
            pgNation.setCurrentPage(1);
        }

        private function renderAccUi(data:Array):void{
            if(accUi !=null)vg.removeElement(accUi);
            accUi = new Accordion();
            accUi.percentWidth=100;
            accUi.height=window.innerHeight - 100;
            var bd:ScrollingViewport = new ScrollingViewport();
            accUi.addBead(bd as IBead)
                var subjName:String = "";
                var accSection:AccordionSection = null;
            for(var i:int=0; i<=data.length-1; i++){
                var sName:String = data[i]["Grade"];
                if(sName != subjName){
                    if(accSection)accUi.addElement(accSection);
                    accSection = new AccordionSection();
                    accSection.headerText.big()
                    accSection.headerText = sName;
                    subjName = sName;
                }
                var content:AccordionContent = new AccordionContent();
                content.className = "accItem tocText";
                content.height = 50;
                //content.text = i+1 +".  |  " + data[i]["Topic"] + " :: " + data[i]["Subtopic"] + " :: " + data[i]["Activity Type"] + " :: " + data[i]["Activity Name"];
                var tb:tableData = new tableData();
                var objModel:Object = new Object();
                objModel.dataSet = data[i];
                objModel.isEditModeOn = _isEditModeOn;
                objModel.isMoveModeOn = _isMoveModeOn;
                objModel.callBack = tbDataCallBack;
                tb.model = objModel;
                
                content.addElement(tb);
                accSection.addElement(content);
            }
            accUi.addElement(accSection);
            vg.addElement(accUi);
            accSection.open = true;
            accSection.disabled = true;                
        }

        private function tbDataCallBack(item:Object):void {
            //TODO - update toc model according to pgtool actions
            var idx:int = _tocDataSet.indexOf(item)
            trace('id from callback'+idx)
        }

        private function tocItemClickHanler(e:MouseEvent):void{
            var accContent:tableData = e.currentTarget as tableData;
            ContentLoaderIframe.instance.loadPage(accContent.model['url']);
            e.preventDefault();
        }

        private function addPeginationTool(t:String):void {
            var sw:Switch = new Switch();
            sw.onLabel = t + " on";
            sw.offLabel = t + " off";
            sw.addEventListener(MouseEvent.CLICK, ptoolEventHandler)
            pgNationCtr.addElement(sw);
        }

        private function ptoolEventHandler(e:MouseEvent):void {
            var isChecked:Boolean = (e.target as Switch).checked;
            var label:String = (e.target as Switch).onLabel.split(' ')[0];
            if(label == EDIT)_isEditModeOn=isChecked;
            if(label == MOVE)_isMoveModeOn=isChecked;
            var obj:Object = new Object();
            obj.isChecked = isChecked;
            obj.label = label;
            DsEvent.instance.dispatch(DsEvent.TOC_DATA_TABLE_EVENT, obj)   
        }
    }
    
}