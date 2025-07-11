/**
 * Generated by Apache Royale Compiler from org/apache/royale/net/HTTPService.as
 * org.apache.royale.net.HTTPService
 *
 * @fileoverview
 *
 * @suppress {missingRequire|checkTypes|accessControls}
 */

goog.provide('org.apache.royale.net.HTTPService');
/* Royale Dependency List: org.apache.royale.core.WrappedHTMLElement,org.apache.royale.debugging.assert,org.apache.royale.events.Event,org.apache.royale.net.HTTPConstants,org.apache.royale.net.HTTPHeader,org.apache.royale.utils.Language*/

goog.require('org.apache.royale.core.IBead');
goog.require('org.apache.royale.core.IStrand');
goog.require('org.apache.royale.net.HTTPServiceBase');



/**
 *  Constructor.
 *  
 *  @langversion 3.0
 *  @playerversion Flash 10.2
 *  @playerversion AIR 2.6
 *  @productversion Royale 0.0
 *  @royaleignorecoercion org.apache.royale.core.WrappedHTMLElement
 * @constructor
 * @extends {org.apache.royale.net.HTTPServiceBase}
 * @implements {org.apache.royale.core.IStrand}
 * @implements {org.apache.royale.core.IBead}
 */
org.apache.royale.net.HTTPService = function() {
  
  this.org_apache_royale_net_HTTPService__contentType = org.apache.royale.net.HTTPConstants.FORM_URL_ENCODED;
  this.org_apache_royale_net_HTTPService__method = org.apache.royale.net.HTTPConstants.GET;
  org.apache.royale.net.HTTPService.base(this, 'constructor');
  this.element = new XMLHttpRequest();
};
goog.inherits(org.apache.royale.net.HTTPService, org.apache.royale.net.HTTPServiceBase);


/**
 * @private
 * @type {string}
 */
org.apache.royale.net.HTTPService.prototype.org_apache_royale_net_HTTPService__contentType;


/**
 * @private
 * @type {Object}
 */
org.apache.royale.net.HTTPService.prototype.org_apache_royale_net_HTTPService__contentData;


/**
 * @private
 * @type {Array}
 */
org.apache.royale.net.HTTPService.prototype.org_apache_royale_net_HTTPService__headers;


/**
 * @private
 * @type {string}
 */
org.apache.royale.net.HTTPService.prototype.org_apache_royale_net_HTTPService__method;


/**
 * @private
 * @type {Array}
 */
org.apache.royale.net.HTTPService.prototype.org_apache_royale_net_HTTPService__responseHeaders;


/**
 * @private
 * @type {string}
 */
org.apache.royale.net.HTTPService.prototype.org_apache_royale_net_HTTPService__responseURL;


/**
 * @private
 * @type {number}
 */
org.apache.royale.net.HTTPService.prototype.org_apache_royale_net_HTTPService__status = 0;


/**
 * @private
 * @type {string}
 */
org.apache.royale.net.HTTPService.prototype.org_apache_royale_net_HTTPService__url;


/**
 * @private
 * @type {number}
 */
org.apache.royale.net.HTTPService.prototype.org_apache_royale_net_HTTPService__timeout = 0;


/**
 * @private
 * @type {string}
 */
org.apache.royale.net.HTTPService.prototype.org_apache_royale_net_HTTPService__id;


/**
 * @private
 * @type {org.apache.royale.core.IStrand}
 */
org.apache.royale.net.HTTPService.prototype.org_apache_royale_net_HTTPService__strand;


/**
 * @type {Array}
 */
org.apache.royale.net.HTTPService.prototype.beads;


/**
 *  Sends the headers and contentData to the server.
 *  
 *  @langversion 3.0
 *  @playerversion Flash 10.2
 *  @playerversion AIR 2.6
 *  @productversion Royale 0.0
 *  @royaleignorecoercion XMLHttpRequest
 */
org.apache.royale.net.HTTPService.prototype.send = function() {
  if (this._beads == null) {
    var foreachiter0_target = this.beads;
    for (var foreachiter0 in foreachiter0_target) 
    {
    var bead = foreachiter0_target[foreachiter0];
    
      this.addBead(bead);}
    
  }
  this.dispatchEvent(new org.apache.royale.events.Event("preSend"));
  
  var /** @type {XMLHttpRequest} */ element = this.element;
  element.onreadystatechange = org.apache.royale.utils.Language.closure(this.progressHandler, this, 'progressHandler');
  this.url = this.org_apache_royale_net_HTTPService__url;
  var /** @type {Object} */ currentData = null;
  if (this.contentData != null) {
    if (this.method == org.apache.royale.net.HTTPConstants.GET) {
      if (this.url.indexOf('?') != -1) {
        this.url += String(this.contentData);
      } else {
        this.url += '?' + String(this.contentData);
      }
    } else {
      currentData = this.contentData;
    }
  }
  element.open(this.method, this.url, true);
  element.timeout = this.timeout;
  var /** @type {boolean} */ sawContentType = false;
  if (this.headers) {
    var /** @type {number} */ n = (this.headers.length) >> 0;
    for (var /** @type {number} */ i = 0; i < n; i++) {
      var /** @type {org.apache.royale.net.HTTPHeader} */ header = this.headers[i];
      if (header.name == org.apache.royale.net.HTTPHeader.CONTENT_TYPE) {
        sawContentType = true;
      }
      element.setRequestHeader(header.name, header.value);
    }
  }
  if (this.method != org.apache.royale.net.HTTPConstants.GET && !sawContentType && currentData) {
    element.setRequestHeader(org.apache.royale.net.HTTPHeader.CONTENT_TYPE, this.contentType);
  }
  if (currentData) {
    element.send(currentData);
  } else {
    element.send();
  }
  this.dispatchEvent(new org.apache.royale.events.Event("postSend"));
};


/**
 * @royaleignorecoercion XMLHttpRequest
 * @protected
 */
org.apache.royale.net.HTTPService.prototype.progressHandler = function() {
  var /** @type {XMLHttpRequest} */ element = this.element;
  if (element.readyState == 2) {
    this.org_apache_royale_net_HTTPService__status = (element.status) >> 0;
    this.dispatchEvent(org.apache.royale.net.HTTPConstants.RESPONSE_STATUS);
    this.dispatchEvent(org.apache.royale.net.HTTPConstants.STATUS);
  } else if (element.readyState == 4) {
    this.org_apache_royale_net_HTTPService__json = null;
    this.dispatchEvent(org.apache.royale.net.HTTPConstants.COMPLETE);
  }
};


/**
 * @private
 * @type {Object}
 */
org.apache.royale.net.HTTPService.prototype.org_apache_royale_net_HTTPService__json;


/**
 * @nocollapse
 * @export
 * @type {string}
 */
org.apache.royale.net.HTTPService.prototype.contentType;


org.apache.royale.net.HTTPService.prototype.get__contentType = function() {
  return this.org_apache_royale_net_HTTPService__contentType;
};


org.apache.royale.net.HTTPService.prototype.set__contentType = function(value) {
  if (this.org_apache_royale_net_HTTPService__contentType != value) {
    this.org_apache_royale_net_HTTPService__contentType = value;
    this.dispatchEvent(new org.apache.royale.events.Event("contentTypeChanged"));
  }
};


/**
 * @nocollapse
 * @export
 * @type {Object}
 */
org.apache.royale.net.HTTPService.prototype.contentData;


org.apache.royale.net.HTTPService.prototype.get__contentData = function() {
  return this.org_apache_royale_net_HTTPService__contentData;
};


org.apache.royale.net.HTTPService.prototype.set__contentData = function(value) {
  if (this.org_apache_royale_net_HTTPService__contentData != value) {
    this.org_apache_royale_net_HTTPService__contentData = value;
    this.dispatchEvent(new org.apache.royale.events.Event("contentDataChanged"));
  }
};


/**
 * @nocollapse
 * @export
 * @type {Array}
 */
org.apache.royale.net.HTTPService.prototype.headers;


org.apache.royale.net.HTTPService.prototype.get__headers = function() {
  if (this.org_apache_royale_net_HTTPService__headers == null)
    this.org_apache_royale_net_HTTPService__headers = [];
  return this.org_apache_royale_net_HTTPService__headers;
};


org.apache.royale.net.HTTPService.prototype.set__headers = function(value) {
  if (this.org_apache_royale_net_HTTPService__headers != value) {
    this.org_apache_royale_net_HTTPService__headers = value;
    this.dispatchEvent(new org.apache.royale.events.Event("headersChanged"));
  }
};


/**
 * @nocollapse
 * @export
 * @type {string}
 */
org.apache.royale.net.HTTPService.prototype.method;


org.apache.royale.net.HTTPService.prototype.get__method = function() {
  return this.org_apache_royale_net_HTTPService__method;
};


org.apache.royale.net.HTTPService.prototype.set__method = function(value) {
  if (this.org_apache_royale_net_HTTPService__method != value) {
    this.org_apache_royale_net_HTTPService__method = value;
    this.dispatchEvent(new org.apache.royale.events.Event("methodChanged"));
  }
};


/**
 * @nocollapse
 * @export
 * @type {Array}
 */
org.apache.royale.net.HTTPService.prototype.responseHeaders;


org.apache.royale.net.HTTPService.prototype.get__responseHeaders = function() {
  var /** @type {number} */ c = 0;
  var /** @type {number} */ i = 0;
  var /** @type {number} */ n = 0;
  
  var /** @type {string} */ allHeaders;
  //var /** @type {number} */ c = 0;
  var /** @type {string} */ hdr;
  //var /** @type {number} */ i = 0;
  //var /** @type {number} */ n = 0;
  var /** @type {string} */ part1;
  var /** @type {string} */ part2;
  var /** @type {XMLHttpRequest} */ element = this.element;
  if (!this.org_apache_royale_net_HTTPService__responseHeaders) {
    allHeaders = element.getAllResponseHeaders();
    this.org_apache_royale_net_HTTPService__responseHeaders = allHeaders.split('\n');
    n = (this.org_apache_royale_net_HTTPService__responseHeaders.length) >> 0;
    for (i = 0; i < n; i++) {
      hdr = org.apache.royale.utils.Language.string(this.org_apache_royale_net_HTTPService__responseHeaders[i]);
      c = (hdr.indexOf(':')) >> 0;
      part1 = hdr.substring(0, c);
      part2 = hdr.substring(c + 2);
      this.org_apache_royale_net_HTTPService__responseHeaders[i] = new org.apache.royale.net.HTTPHeader(part1, part2);
    }
  }
  return this.org_apache_royale_net_HTTPService__responseHeaders;
};


/**
 * @nocollapse
 * @export
 * @type {string}
 */
org.apache.royale.net.HTTPService.prototype.responseURL;


org.apache.royale.net.HTTPService.prototype.get__responseURL = function() {
  return this.org_apache_royale_net_HTTPService__responseURL;
};


/**
 * @nocollapse
 * @export
 * @type {number}
 */
org.apache.royale.net.HTTPService.prototype.status;


org.apache.royale.net.HTTPService.prototype.get__status = function() {
  return this.org_apache_royale_net_HTTPService__status;
};


/**
 * @nocollapse
 * @export
 * @type {string}
 */
org.apache.royale.net.HTTPService.prototype.statusText;


org.apache.royale.net.HTTPService.prototype.get__statusText = function() {
  return this.element.statusText;
};


/**
 * @nocollapse
 * @export
 * @type {string}
 */
org.apache.royale.net.HTTPService.prototype.url;


org.apache.royale.net.HTTPService.prototype.get__url = function() {
  return this.org_apache_royale_net_HTTPService__url;
};


org.apache.royale.net.HTTPService.prototype.set__url = function(value) {
  if (this.org_apache_royale_net_HTTPService__url != value) {
    this.org_apache_royale_net_HTTPService__url = value;
    this.dispatchEvent(new org.apache.royale.events.Event("urlChanged"));
  }
};


/**
 * @nocollapse
 * @export
 * @type {number}
 */
org.apache.royale.net.HTTPService.prototype.timeout;


org.apache.royale.net.HTTPService.prototype.get__timeout = function() {
  return this.org_apache_royale_net_HTTPService__timeout;
};


org.apache.royale.net.HTTPService.prototype.set__timeout = function(value) {
  if (this.org_apache_royale_net_HTTPService__timeout != value) {
    this.org_apache_royale_net_HTTPService__timeout = value;
    this.dispatchEvent(new org.apache.royale.events.Event("timeoutChanged"));
  }
};


/**
 * @nocollapse
 * @export
 * @type {string}
 */
org.apache.royale.net.HTTPService.prototype.id;


org.apache.royale.net.HTTPService.prototype.get__id = function() {
  return this.org_apache_royale_net_HTTPService__id;
};


org.apache.royale.net.HTTPService.prototype.set__id = function(value) {
  if (this.org_apache_royale_net_HTTPService__id != value) {
    this.org_apache_royale_net_HTTPService__id = value;
    this.dispatchEvent(new org.apache.royale.events.Event("idChanged"));
  }
};


/**
 * @nocollapse
 * @export
 * @type {org.apache.royale.core.IStrand}
 */
org.apache.royale.net.HTTPService.prototype.strand;


org.apache.royale.net.HTTPService.prototype.set__strand = function(value) {
  this.org_apache_royale_net_HTTPService__strand = value;
  if (this._beads == null) {
    var foreachiter1_target = this.beads;
    for (var foreachiter1 in foreachiter1_target) 
    {
    var bead = foreachiter1_target[foreachiter1];
    
      this.addBead(bead);}
    
  }
  this.dispatchEvent(new org.apache.royale.events.Event("beadsAdded"));
};


/**
 * @nocollapse
 * @export
 * @type {boolean}
 */
org.apache.royale.net.HTTPService.prototype.withCredentials;


org.apache.royale.net.HTTPService.prototype.set__withCredentials = function(value) {
  var /** @type {XMLHttpRequest} */ element = this.element;
  element.withCredentials = value;
};


/**
 * @nocollapse
 * @export
 * @type {string}
 */
org.apache.royale.net.HTTPService.prototype.data;


org.apache.royale.net.HTTPService.prototype.get__data = function() {
  
  return this.element.responseText;
};


/**
 * @nocollapse
 * @export
 * @type {Object}
 */
org.apache.royale.net.HTTPService.prototype.json;


org.apache.royale.net.HTTPService.prototype.get__json = function() {
  org.apache.royale.debugging.assert(!!(this.data), "data must exist before calling json getter!");
  if (!this.org_apache_royale_net_HTTPService__json) {
    try {
      this.org_apache_royale_net_HTTPService__json = JSON.parse(this.data);
    } catch (error) {
      throw new Error("JSON is not valid: " + this.data);
    }
  }
  return this.org_apache_royale_net_HTTPService__json;
};


Object.defineProperties(org.apache.royale.net.HTTPService.prototype, /** @lends {org.apache.royale.net.HTTPService.prototype} */ {
/**
 * @type {string}
 */
contentType: {
get: org.apache.royale.net.HTTPService.prototype.get__contentType,
set: org.apache.royale.net.HTTPService.prototype.set__contentType},
/**
 * @type {Object}
 */
contentData: {
get: org.apache.royale.net.HTTPService.prototype.get__contentData,
set: org.apache.royale.net.HTTPService.prototype.set__contentData},
/**
 * @type {Array}
 */
headers: {
get: org.apache.royale.net.HTTPService.prototype.get__headers,
set: org.apache.royale.net.HTTPService.prototype.set__headers},
/**
 * @type {string}
 */
method: {
get: org.apache.royale.net.HTTPService.prototype.get__method,
set: org.apache.royale.net.HTTPService.prototype.set__method},
/**
 * @type {Array}
 */
responseHeaders: {
get: org.apache.royale.net.HTTPService.prototype.get__responseHeaders},
/**
 * @type {string}
 */
responseURL: {
get: org.apache.royale.net.HTTPService.prototype.get__responseURL},
/**
 * @type {number}
 */
status: {
get: org.apache.royale.net.HTTPService.prototype.get__status},
/**
 * @type {string}
 */
statusText: {
get: org.apache.royale.net.HTTPService.prototype.get__statusText},
/**
 * @type {string}
 */
url: {
get: org.apache.royale.net.HTTPService.prototype.get__url,
set: org.apache.royale.net.HTTPService.prototype.set__url},
/**
 * @type {number}
 */
timeout: {
get: org.apache.royale.net.HTTPService.prototype.get__timeout,
set: org.apache.royale.net.HTTPService.prototype.set__timeout},
/**
 * @type {string}
 */
id: {
get: org.apache.royale.net.HTTPService.prototype.get__id,
set: org.apache.royale.net.HTTPService.prototype.set__id},
/**
 * @type {org.apache.royale.core.IStrand}
 */
strand: {
set: org.apache.royale.net.HTTPService.prototype.set__strand},
/**
 * @type {boolean}
 */
withCredentials: {
set: org.apache.royale.net.HTTPService.prototype.set__withCredentials},
/**
 * @type {string}
 */
data: {
get: org.apache.royale.net.HTTPService.prototype.get__data},
/**
 * @type {Object}
 */
json: {
get: org.apache.royale.net.HTTPService.prototype.get__json}}
);


/**
 * Metadata
 *
 * @type {Object.<string, Array.<Object>>}
 */
org.apache.royale.net.HTTPService.prototype.ROYALE_CLASS_INFO = { names: [{ name: 'HTTPService', qName: 'org.apache.royale.net.HTTPService', kind: 'class' }], interfaces: [org.apache.royale.core.IStrand, org.apache.royale.core.IBead] };



/**
 * Reflection
 *
 * @return {Object.<string, Function>}
 */
org.apache.royale.net.HTTPService.prototype.ROYALE_REFLECTION_INFO = function () {
  return {
    variables: function () {
      return {
        'beads': { type: 'Array', get_set: function (/** org.apache.royale.net.HTTPService */ inst, /** * */ v) {return v !== undefined ? inst.beads = v : inst.beads;}}
      };
    },
    accessors: function () {
      return {
        'contentType': { type: 'String', access: 'readwrite', declaredBy: 'org.apache.royale.net.HTTPService'},
        'contentData': { type: 'Object', access: 'readwrite', declaredBy: 'org.apache.royale.net.HTTPService'},
        'headers': { type: 'Array', access: 'readwrite', declaredBy: 'org.apache.royale.net.HTTPService'},
        'method': { type: 'String', access: 'readwrite', declaredBy: 'org.apache.royale.net.HTTPService'},
        'responseHeaders': { type: 'Array', access: 'readonly', declaredBy: 'org.apache.royale.net.HTTPService'},
        'responseURL': { type: 'String', access: 'readonly', declaredBy: 'org.apache.royale.net.HTTPService'},
        'status': { type: 'int', access: 'readonly', declaredBy: 'org.apache.royale.net.HTTPService'},
        'statusText': { type: 'String', access: 'readonly', declaredBy: 'org.apache.royale.net.HTTPService'},
        'url': { type: 'String', access: 'readwrite', declaredBy: 'org.apache.royale.net.HTTPService'},
        'timeout': { type: 'Number', access: 'readwrite', declaredBy: 'org.apache.royale.net.HTTPService'},
        'id': { type: 'String', access: 'readwrite', declaredBy: 'org.apache.royale.net.HTTPService'},
        'strand': { type: 'org.apache.royale.core.IStrand', access: 'writeonly', declaredBy: 'org.apache.royale.net.HTTPService'},
        'withCredentials': { type: 'Boolean', access: 'writeonly', declaredBy: 'org.apache.royale.net.HTTPService'},
        'data': { type: 'String', access: 'readonly', declaredBy: 'org.apache.royale.net.HTTPService'},
        'json': { type: 'Object', access: 'readonly', declaredBy: 'org.apache.royale.net.HTTPService'}
      };
    },
    methods: function () {
      return {
        'HTTPService': { type: '', declaredBy: 'org.apache.royale.net.HTTPService'},
        'send': { type: 'void', declaredBy: 'org.apache.royale.net.HTTPService'}
      };
    }
  };
};
/**
 * @const
 * @type {number}
 */
org.apache.royale.net.HTTPService.prototype.ROYALE_COMPILE_FLAGS = 10;

//# sourceMappingURL=./HTTPService.js.map
