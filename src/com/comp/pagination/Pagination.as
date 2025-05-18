package com.comp.pagination
{
    import org.apache.royale.core.UIBase;
    import org.apache.royale.events.MouseEvent;
    import org.apache.royale.events.Event;
    import org.apache.royale.html.HGroup;
    //import org.apache.royale.jewel.Button;
    import org.apache.royale.mdl.beads.Disabled;
    import com.unhurdle.spectrum.Button;

    public class Pagination extends UIBase
    {
        public static const PAGINATION_CHANGE_EVENT:String = "pageChangeevent";
        private var container:HGroup;

        private var currentPage:int = 1;
        private var totalPages:int;
        private var maxVisiblePages:int = 5;

        public function Pagination()
        {
            super();
        }

        override public function addedToParent():void
        {
            super.addedToParent();
            renderPagination();
        }

        private function renderPagination():void
        {
            if (container)
            {
                super.removeElement(container);
            }
            container = new HGroup();
            addElement(container);
            
            // Previous button
            var prevBtn:Button = createPageButton("prev", currentPage - 1);
            if (currentPage == 1) {
                var dPrev:Disabled = new Disabled();
                prevBtn.addBead(dPrev);
                Disabled(prevBtn.getBeadByType(Disabled)).disabled = true;
            }
            container.addElement(prevBtn);

            var startPage:int = Math.max(1, currentPage - int(maxVisiblePages / 2));
            var endPage:int = Math.min(totalPages, startPage + maxVisiblePages - 1);

            if (endPage - startPage + 1 < maxVisiblePages)
            {
                startPage = Math.max(1, endPage - maxVisiblePages + 1);
            }

            if (startPage > 1)
            {
                container.addElement(createPageButton("1"));
                if (startPage > 2)
                {
                    container.addElement(createEllipsis());
                }
            }

            for (var i:int = startPage; i <= endPage; i++)
            {
                var btn:Button = createPageButton(i.toString());
                if (i == currentPage)
                {
                    //btn.emphasis = "primary";
                    btn.className = "spectrum-ActionButton spectrum-ActionButton--quiet is-selected";
                }
                container.addElement(btn);
            }

            if (endPage < totalPages)
            {
                if (endPage < totalPages - 1)
                {
                    container.addElement(createEllipsis());
                }
                container.addElement(createPageButton(totalPages.toString()));
            }

            // Next button
            var nextBtn:Button = createPageButton("next", currentPage + 1);
            if (currentPage == totalPages) {
                var dNext:Disabled = new Disabled();
                nextBtn.addBead(dNext);
                Disabled(nextBtn.getBeadByType(Disabled)).disabled = true;
            }
            container.addElement(nextBtn);
        }

        private function createPageButton(label:String, targetPage:int = -1):Button
        {
            var btn:Button = new Button();
            btn.width = 50;
            btn.text = label;
            btn.className = "spectrum-ActionButton spectrum-ActionButton--quiet";
            btn.addEventListener(MouseEvent.CLICK, function(event:MouseEvent):void {
                if (label == "prev" || label == "next") {
                    currentPage = targetPage;
                } else {
                    currentPage = parseInt(label);
                }
                renderPagination();
                dispatchChangeEvent();
            });
            return btn;
        }

        private function createEllipsis():Button
        {
            var btn:Button = new Button();
            btn.width = 50;
            btn.text = "...";
            var d:Disabled = new Disabled();
            btn.addBead(d);
            Disabled(btn.getBeadByType(Disabled)).disabled = true;
            btn.className = "spectrum-ActionButton spectrum-ActionButton--quiet";
            return btn;
        }

        private function dispatchChangeEvent():void
        {
            dispatchEvent(new Event(PAGINATION_CHANGE_EVENT));
        }

        public function setTotalPages(value:int):void
        {
            if (value >= 1)
            {
                totalPages = value;
                if (currentPage > totalPages)
                    currentPage = totalPages;
                    renderPagination();
            }
        }

        public function setCurrentPage(value:int):void
        {
            if (value >= 1 && value <= totalPages) {
                currentPage = value;
                renderPagination();
                dispatchChangeEvent();
            }
        }

        public function getCurrentPage():int
        {
            return currentPage;
        }

    }
}

