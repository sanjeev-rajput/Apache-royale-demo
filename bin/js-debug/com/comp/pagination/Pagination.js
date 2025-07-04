/**
 * Generated by Apache Royale Compiler from com/comp/pagination/Pagination.as
 * com.comp.pagination.Pagination
 *
 * @fileoverview
 *
 * @suppress {missingRequire|checkTypes|accessControls}
 */

goog.provide('com.comp.pagination.Pagination');
/* Royale Dependency List: com.unhurdle.spectrum.Button,org.apache.royale.events.Event,org.apache.royale.events.MouseEvent,org.apache.royale.html.HGroup,org.apache.royale.mdl.beads.Disabled,org.apache.royale.utils.Language,XML*/

goog.require('org.apache.royale.core.UIBase');



/**
 * @constructor
 * @extends {org.apache.royale.core.UIBase}
 */
com.comp.pagination.Pagination = function() {
  com.comp.pagination.Pagination.base(this, 'constructor');
};
goog.inherits(com.comp.pagination.Pagination, org.apache.royale.core.UIBase);


/**
 * @nocollapse
 * @const
 * @type {string}
 */
com.comp.pagination.Pagination.PAGINATION_CHANGE_EVENT = "pageChangeevent";


/**
 * @private
 * @type {org.apache.royale.html.HGroup}
 */
com.comp.pagination.Pagination.prototype.com_comp_pagination_Pagination_container = null;


/**
 * @private
 * @type {number}
 */
com.comp.pagination.Pagination.prototype.com_comp_pagination_Pagination_currentPage = 1;


/**
 * @private
 * @type {number}
 */
com.comp.pagination.Pagination.prototype.com_comp_pagination_Pagination_totalPages = 0;


/**
 * @private
 * @type {number}
 */
com.comp.pagination.Pagination.prototype.com_comp_pagination_Pagination_maxVisiblePages = 5;


/**
 * @override
 */
com.comp.pagination.Pagination.prototype.addedToParent = function() {
  com.comp.pagination.Pagination.superClass_.addedToParent.apply(this);
  this.com_comp_pagination_Pagination_renderPagination();
};


/**
 * @private
 */
com.comp.pagination.Pagination.prototype.com_comp_pagination_Pagination_renderPagination = function() {
  if (this.com_comp_pagination_Pagination_container) {
    com.comp.pagination.Pagination.superClass_.removeElement.apply(this, [this.com_comp_pagination_Pagination_container]);
  }
  this.com_comp_pagination_Pagination_container = new org.apache.royale.html.HGroup();
  this.addElement(this.com_comp_pagination_Pagination_container);
  var /** @type {com.unhurdle.spectrum.Button} */ prevBtn = this.com_comp_pagination_Pagination_createPageButton("prev", (this.com_comp_pagination_Pagination_currentPage - 1) >> 0);
  if (this.com_comp_pagination_Pagination_currentPage == 1) {
    var /** @type {org.apache.royale.mdl.beads.Disabled} */ dPrev = new org.apache.royale.mdl.beads.Disabled();
    prevBtn.addBead(dPrev);
    org.apache.royale.utils.Language.as(prevBtn.getBeadByType(org.apache.royale.mdl.beads.Disabled), org.apache.royale.mdl.beads.Disabled, true).disabled = true;
  }
  this.com_comp_pagination_Pagination_container.addElement(prevBtn);
  var /** @type {number} */ startPage = (Math.max(1, this.com_comp_pagination_Pagination_currentPage - org.apache.royale.utils.Language._int(this.com_comp_pagination_Pagination_maxVisiblePages / 2))) >> 0;
  var /** @type {number} */ endPage = (Math.min(this.com_comp_pagination_Pagination_totalPages, startPage + this.com_comp_pagination_Pagination_maxVisiblePages - 1)) >> 0;
  if (endPage - startPage + 1 < this.com_comp_pagination_Pagination_maxVisiblePages) {
    startPage = (Math.max(1, endPage - this.com_comp_pagination_Pagination_maxVisiblePages + 1)) >> 0;
  }
  if (startPage > 1) {
    this.com_comp_pagination_Pagination_container.addElement(this.com_comp_pagination_Pagination_createPageButton("1"));
    if (startPage > 2) {
      this.com_comp_pagination_Pagination_container.addElement(this.com_comp_pagination_Pagination_createEllipsis());
    }
  }
  for (var /** @type {number} */ i = startPage; i <= endPage; i++) {
    var /** @type {com.unhurdle.spectrum.Button} */ btn = this.com_comp_pagination_Pagination_createPageButton(i.toString());
    if (i == this.com_comp_pagination_Pagination_currentPage) {
      btn.className = "spectrum-ActionButton spectrum-ActionButton--quiet is-selected";
    }
    this.com_comp_pagination_Pagination_container.addElement(btn);
  }
  if (endPage < this.com_comp_pagination_Pagination_totalPages) {
    if (endPage < this.com_comp_pagination_Pagination_totalPages - 1) {
      this.com_comp_pagination_Pagination_container.addElement(this.com_comp_pagination_Pagination_createEllipsis());
    }
    this.com_comp_pagination_Pagination_container.addElement(this.com_comp_pagination_Pagination_createPageButton(this.com_comp_pagination_Pagination_totalPages.toString()));
  }
  var /** @type {com.unhurdle.spectrum.Button} */ nextBtn = this.com_comp_pagination_Pagination_createPageButton("next", (this.com_comp_pagination_Pagination_currentPage + 1) >> 0);
  if (this.com_comp_pagination_Pagination_currentPage == this.com_comp_pagination_Pagination_totalPages) {
    var /** @type {org.apache.royale.mdl.beads.Disabled} */ dNext = new org.apache.royale.mdl.beads.Disabled();
    nextBtn.addBead(dNext);
    org.apache.royale.utils.Language.as(nextBtn.getBeadByType(org.apache.royale.mdl.beads.Disabled), org.apache.royale.mdl.beads.Disabled, true).disabled = true;
  }
  this.com_comp_pagination_Pagination_container.addElement(nextBtn);
};


/**
 * @private
 * @param {string} label
 * @param {number=} targetPage
 * @return {com.unhurdle.spectrum.Button}
 */
com.comp.pagination.Pagination.prototype.com_comp_pagination_Pagination_createPageButton = function(label, targetPage) {
  var self = this;
  targetPage = typeof targetPage !== 'undefined' ? targetPage : -1;
  var /** @type {com.unhurdle.spectrum.Button} */ btn = new com.unhurdle.spectrum.Button();
  btn.width = 50;
  btn.text = label;
  btn.className = "spectrum-ActionButton spectrum-ActionButton--quiet";
  btn.addEventListener(org.apache.royale.events.MouseEvent.CLICK, function(event) {
    if (label == "prev" || label == "next") {
      self.com_comp_pagination_Pagination_currentPage = targetPage;
    } else {
      self.com_comp_pagination_Pagination_currentPage = (parseInt(label, 0)) >> 0;
    }
    self.com_comp_pagination_Pagination_renderPagination();
    self.com_comp_pagination_Pagination_dispatchChangeEvent();
  });
  return btn;
};


/**
 * @private
 * @return {com.unhurdle.spectrum.Button}
 */
com.comp.pagination.Pagination.prototype.com_comp_pagination_Pagination_createEllipsis = function() {
  var /** @type {com.unhurdle.spectrum.Button} */ btn = new com.unhurdle.spectrum.Button();
  btn.width = 50;
  btn.text = "...";
  var /** @type {org.apache.royale.mdl.beads.Disabled} */ d = new org.apache.royale.mdl.beads.Disabled();
  btn.addBead(d);
  org.apache.royale.utils.Language.as(btn.getBeadByType(org.apache.royale.mdl.beads.Disabled), org.apache.royale.mdl.beads.Disabled, true).disabled = true;
  btn.className = "spectrum-ActionButton spectrum-ActionButton--quiet";
  return btn;
};


/**
 * @private
 */
com.comp.pagination.Pagination.prototype.com_comp_pagination_Pagination_dispatchChangeEvent = function() {
  this.dispatchEvent(new org.apache.royale.events.Event(com.comp.pagination.Pagination.PAGINATION_CHANGE_EVENT));
};


/**
 * @param {number} value
 */
com.comp.pagination.Pagination.prototype.setTotalPages = function(value) {
  if (value >= 1) {
    this.com_comp_pagination_Pagination_totalPages = value;
    if (this.com_comp_pagination_Pagination_currentPage > this.com_comp_pagination_Pagination_totalPages)
      this.com_comp_pagination_Pagination_currentPage = this.com_comp_pagination_Pagination_totalPages;
    this.com_comp_pagination_Pagination_renderPagination();
  }
};


/**
 * @param {number} value
 */
com.comp.pagination.Pagination.prototype.setCurrentPage = function(value) {
  if (value >= 1 && value <= this.com_comp_pagination_Pagination_totalPages) {
    this.com_comp_pagination_Pagination_currentPage = value;
    this.com_comp_pagination_Pagination_renderPagination();
    this.com_comp_pagination_Pagination_dispatchChangeEvent();
  }
};


/**
 * @return {number}
 */
com.comp.pagination.Pagination.prototype.getCurrentPage = function() {
  return this.com_comp_pagination_Pagination_currentPage;
};


/**
 * Metadata
 *
 * @type {Object.<string, Array.<Object>>}
 */
com.comp.pagination.Pagination.prototype.ROYALE_CLASS_INFO = { names: [{ name: 'Pagination', qName: 'com.comp.pagination.Pagination', kind: 'class' }] };



/**
 * Reflection
 *
 * @return {Object.<string, Function>}
 */
com.comp.pagination.Pagination.prototype.ROYALE_REFLECTION_INFO = function () {
  return {
    methods: function () {
      return {
        'Pagination': { type: '', declaredBy: 'com.comp.pagination.Pagination'},
        'addedToParent': { type: 'void', declaredBy: 'com.comp.pagination.Pagination'},
        'setTotalPages': { type: 'void', declaredBy: 'com.comp.pagination.Pagination', parameters: function () { return [ 'int', false ]; }},
        'setCurrentPage': { type: 'void', declaredBy: 'com.comp.pagination.Pagination', parameters: function () { return [ 'int', false ]; }},
        'getCurrentPage': { type: 'int', declaredBy: 'com.comp.pagination.Pagination'}
      };
    }
  };
};
/**
 * @const
 * @type {number}
 */
com.comp.pagination.Pagination.prototype.ROYALE_COMPILE_FLAGS = 9;
/**
 * Provide reflection support for distinguishing dynamic fields on class object (static)
 * @const
 * @type {Array<string>}
 */
com.comp.pagination.Pagination.prototype.ROYALE_INITIAL_STATICS = Object.keys(com.comp.pagination.Pagination);

//# sourceMappingURL=./Pagination.js.map
