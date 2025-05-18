   
var DND = {
    callBackFunc: function(){},
    setDNDElement: function (dropZone, dragZone, callBackFuunction) {
        this.callBackFunc = callBackFuunction;
        var _isdragging = false;
        var dragged=null;
        console.log('DND init: ', dropZone, dragZone);
        var _dropZone = document.getElementById(dropZone);
        var _dragZone = document.getElementById(dragZone);
        if (_dropZone === null || _dragZone === null) {
            console.error('DND: dropZone or dragZone not found');
            return;
        }
        const childrenArray = Array.from(_dragZone.children);
        childrenArray.forEach(child => {
            child.setAttribute('draggable', true);  
            child.addEventListener("dragstart", (event) => {
                dragged = event.target;
                _isdragging = true;
            });
        });
        _dropZone.addEventListener("dragover", (event) => {
                event.preventDefault();
                _dropZone.classList.add("dropboxhover");
        });
        _dropZone.addEventListener("dragleave", (event) => {
            event.preventDefault();
            _dropZone.classList.remove("dropboxhover");
        });
        _dropZone.addEventListener("drop", (event) => {
            // prevent default action (open as a link for some elements)
            event.preventDefault();
            if (event.target.id === "dropzone" && _isdragging) {
                _isdragging = false;
                _dropZone.classList.remove("dropboxhover");
                this.itemDropped(dragged);
            }
            
        }); 
    },
    itemDropped: function(item) {
        this.callBackFunc(item);
    },
}

