/**
 * Generated by Apache Royale Compiler from views/actionitemviews/collaboration/SocketVideoHandler.as
 * views.actionitemviews.collaboration.SocketVideoHandler
 *
 * @fileoverview
 *
 * @suppress {missingRequire|checkTypes|accessControls}
 */

goog.provide('views.actionitemviews.collaboration.SocketVideoHandler');
/* Royale Dependency List: com.unhurdle.spectrum.Switch,com.util.AppAlert,org.apache.royale.jewel.VGroup,views.actionitemviews.collaboration.VideoItem,views.actionitemviews.websocket.SocketService,org.apache.royale.utils.Language,XML*/




/**
 * @constructor
 * @param {org.apache.royale.jewel.VGroup} uVidContainer
 * @param {com.unhurdle.spectrum.Switch} shareCamBtn
 * @param {views.actionitemviews.websocket.SocketService} socketService
 */
views.actionitemviews.collaboration.SocketVideoHandler = function(uVidContainer, shareCamBtn, socketService) {
  this.views_actionitemviews_collaboration_SocketVideoHandler_uVidContainer = uVidContainer;
  this.views_actionitemviews_collaboration_SocketVideoHandler_shareCamBtn = shareCamBtn;
  this.views_actionitemviews_collaboration_SocketVideoHandler_socketService = socketService;
  this.views_actionitemviews_collaboration_SocketVideoHandler_peerConnections = {};
};


/**
 * @private
 * @type {string}
 */
views.actionitemviews.collaboration.SocketVideoHandler.prototype.views_actionitemviews_collaboration_SocketVideoHandler_myUserId = null;


/**
 * @private
 * @type {Object}
 */
views.actionitemviews.collaboration.SocketVideoHandler.prototype.views_actionitemviews_collaboration_SocketVideoHandler_peerConnections = null;


/**
 * @private
 * @type {Object}
 */
views.actionitemviews.collaboration.SocketVideoHandler.prototype.views_actionitemviews_collaboration_SocketVideoHandler_localStream = null;


/**
 * @private
 * @type {Object}
 */
views.actionitemviews.collaboration.SocketVideoHandler.prototype.views_actionitemviews_collaboration_SocketVideoHandler_myLocalStream = null;


/**
 * @private
 * @type {boolean}
 */
views.actionitemviews.collaboration.SocketVideoHandler.prototype.views_actionitemviews_collaboration_SocketVideoHandler_webcamInitialized = false;


/**
 * @private
 * @type {org.apache.royale.jewel.VGroup}
 */
views.actionitemviews.collaboration.SocketVideoHandler.prototype.views_actionitemviews_collaboration_SocketVideoHandler_uVidContainer = null;


/**
 * @private
 * @type {com.unhurdle.spectrum.Switch}
 */
views.actionitemviews.collaboration.SocketVideoHandler.prototype.views_actionitemviews_collaboration_SocketVideoHandler_shareCamBtn = null;


/**
 * @private
 * @type {views.actionitemviews.websocket.SocketService}
 */
views.actionitemviews.collaboration.SocketVideoHandler.prototype.views_actionitemviews_collaboration_SocketVideoHandler_socketService = null;


/**
 * @param {string} id
 */
views.actionitemviews.collaboration.SocketVideoHandler.prototype.setMyUserId = function(id) {
  this.views_actionitemviews_collaboration_SocketVideoHandler_myUserId = id;
};


/**
 * @param {string} type
 * @return {boolean}
 */
views.actionitemviews.collaboration.SocketVideoHandler.prototype.isVideoMessage = function(type) {
  return type == "video-offer" || type == "video-answer" || type == "ice-candidate" || type == "share_webcam" || type == "user_disconnected";
};


/**
 * @param {Object} data
 */
views.actionitemviews.collaboration.SocketVideoHandler.prototype.process = function(data) {
  switch (data["type"]) {
    case "video-offer":
      this.views_actionitemviews_collaboration_SocketVideoHandler_handleOffer(org.apache.royale.utils.Language.string(data["sender"]), data["offer"]);
      break;
    case "video-answer":
      this.views_actionitemviews_collaboration_SocketVideoHandler_handleAnswer(org.apache.royale.utils.Language.string(data["sender"]), data["answer"]);
      break;
    case "ice-candidate":
      this.views_actionitemviews_collaboration_SocketVideoHandler_handleCandidate(org.apache.royale.utils.Language.string(data["sender"]), data["candidate"]);
      break;
    case "share_webcam":
      if (data["userId"] != this.views_actionitemviews_collaboration_SocketVideoHandler_myUserId)
        this.views_actionitemviews_collaboration_SocketVideoHandler_createPeerConnection(org.apache.royale.utils.Language.string(data["userId"]), true);
      break;
    case "user_disconnected":
      this.views_actionitemviews_collaboration_SocketVideoHandler_toggleCameraVisibility(org.apache.royale.utils.Language.string(data["userId"]), false);
      break;
  }
};


/**
 * @private
 * @param {boolean} on
 */
views.actionitemviews.collaboration.SocketVideoHandler.prototype.views_actionitemviews_collaboration_SocketVideoHandler_updateCamButtonState = function(on) {
  this.views_actionitemviews_collaboration_SocketVideoHandler_shareCamBtn.checked = on;
  this.views_actionitemviews_collaboration_SocketVideoHandler_webcamInitialized = on ? true : false;
  this.views_actionitemviews_collaboration_SocketVideoHandler_shareCamBtn.onLabel = on ? "Webcam on" : "Webcam off";
};


/**
 */
views.actionitemviews.collaboration.SocketVideoHandler.prototype.onStartWebcam = function() {
  var self = this;
  if (this.views_actionitemviews_collaboration_SocketVideoHandler_webcamInitialized)
    return;
  var /** @type {Object} */ constraints = {"video":true, "audio":false};
  navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
    self.views_actionitemviews_collaboration_SocketVideoHandler_localStream = stream;
    self.views_actionitemviews_collaboration_SocketVideoHandler_myLocalStream = stream;
    self.views_actionitemviews_collaboration_SocketVideoHandler_updateCamButtonState(true);
    self.views_actionitemviews_collaboration_SocketVideoHandler_addVideoStream(self.views_actionitemviews_collaboration_SocketVideoHandler_myUserId, stream, true);
    self.views_actionitemviews_collaboration_SocketVideoHandler_socketService.sendToSocket({"type":"share_webcam", "userId":self.views_actionitemviews_collaboration_SocketVideoHandler_myUserId});
  })["catch"](function(err) {
    com.util.AppAlert.show(com.util.AppAlert.ERROR, "Webcam access denied <br>" + err);
    self.views_actionitemviews_collaboration_SocketVideoHandler_updateCamButtonState(false);
  });
};


/**
 */
views.actionitemviews.collaboration.SocketVideoHandler.prototype.onStopWebcam = function() {
  var self = this;
  if (this.views_actionitemviews_collaboration_SocketVideoHandler_localStream) {
    this.views_actionitemviews_collaboration_SocketVideoHandler_localStream["getTracks"]()["forEach"](function(track) {
      track["stop"]();
    });
    this.views_actionitemviews_collaboration_SocketVideoHandler_localStream = null;
    this.views_actionitemviews_collaboration_SocketVideoHandler_myLocalStream = null;
    this.views_actionitemviews_collaboration_SocketVideoHandler_updateCamButtonState(false);
  }
  console.log("send disconnect bacl to nod", this.views_actionitemviews_collaboration_SocketVideoHandler_myUserId);
  this.views_actionitemviews_collaboration_SocketVideoHandler_socketService.sendToSocket({"type":"user_disconnected", "userId":this.views_actionitemviews_collaboration_SocketVideoHandler_myUserId});
  for (var /** @type {string} */ id in this.views_actionitemviews_collaboration_SocketVideoHandler_peerConnections) {
    this.views_actionitemviews_collaboration_SocketVideoHandler_peerConnections[id]["close"]();
  }
  this.views_actionitemviews_collaboration_SocketVideoHandler_peerConnections = {};
};


/**
 * @private
 * @param {string} sender
 * @param {Object} offer
 */
views.actionitemviews.collaboration.SocketVideoHandler.prototype.views_actionitemviews_collaboration_SocketVideoHandler_handleOffer = function(sender, offer) {
  var self = this;
  this.views_actionitemviews_collaboration_SocketVideoHandler_createPeerConnection(sender, false);
  var /** @type {*} */ pc = this.views_actionitemviews_collaboration_SocketVideoHandler_peerConnections[sender];
  pc["setRemoteDescription"](new RTCSessionDescription(offer))["then"](function() {
    return pc["createAnswer"]();
  })["then"](function(answer) {
    pc["setLocalDescription"](answer);
    self.views_actionitemviews_collaboration_SocketVideoHandler_socketService.sendToSocket({"type":"video-answer", "target":sender, "answer":answer});
  })["catch"](function(error) {
    com.util.AppAlert.show(com.util.AppAlert.ERROR, "❌ Error handling offer from \n" + sender + ":" + error);
  });
};


/**
 * @private
 * @param {string} sender
 * @param {Object} answer
 */
views.actionitemviews.collaboration.SocketVideoHandler.prototype.views_actionitemviews_collaboration_SocketVideoHandler_handleAnswer = function(sender, answer) {
  this.views_actionitemviews_collaboration_SocketVideoHandler_peerConnections[sender]["setRemoteDescription"](new RTCSessionDescription(answer));
};


/**
 * @private
 * @param {string} sender
 * @param {Object} candidate
 */
views.actionitemviews.collaboration.SocketVideoHandler.prototype.views_actionitemviews_collaboration_SocketVideoHandler_handleCandidate = function(sender, candidate) {
  this.views_actionitemviews_collaboration_SocketVideoHandler_peerConnections[sender]["addIceCandidate"](new RTCIceCandidate(candidate));
};


/**
 * @private
 * @param {string} userId
 * @param {boolean} isInitiator
 */
views.actionitemviews.collaboration.SocketVideoHandler.prototype.views_actionitemviews_collaboration_SocketVideoHandler_createPeerConnection = function(userId, isInitiator) {
  var self = this;
  var /** @type {Object} */ config = {"iceServers":[{"urls":"stun:stun.l.google.com:19302"}]};
  var /** @type {*} */ pc = new RTCPeerConnection(config);
  this.views_actionitemviews_collaboration_SocketVideoHandler_peerConnections[userId] = pc;
  if (this.views_actionitemviews_collaboration_SocketVideoHandler_myLocalStream) {
    this.views_actionitemviews_collaboration_SocketVideoHandler_myLocalStream["getTracks"]()["forEach"](function(track) {
      pc["addTrack"](track, self.views_actionitemviews_collaboration_SocketVideoHandler_myLocalStream);
    });
  } else {
    com.util.AppAlert.show(com.util.AppAlert.WARNING, "⚠️ No local stream available for user: " + this.views_actionitemviews_collaboration_SocketVideoHandler_myUserId);
  }
  pc["onicecandidate"] = function(event) {
    if (event["candidate"]) {
      self.views_actionitemviews_collaboration_SocketVideoHandler_socketService.sendToSocket({"type":"ice-candidate", "target":userId, "candidate":event["candidate"]});
    }
  };
  pc["ontrack"] = function(event) {
    org.apache.royale.utils.Language.trace("🎥 Received remote track from", userId);
    self.views_actionitemviews_collaboration_SocketVideoHandler_addVideoStream(userId, event["streams"][0]);
  };
  if (isInitiator) {
    pc["createOffer"]()["then"](function(offer) {
      pc["setLocalDescription"](offer);
      self.views_actionitemviews_collaboration_SocketVideoHandler_socketService.sendToSocket({"type":"video-offer", "target":userId, "offer":offer});
    });
  }
};


/**
 * @private
 * @param {string} userId
 * @param {Object} stream
 * @param {boolean=} isMe
 */
views.actionitemviews.collaboration.SocketVideoHandler.prototype.views_actionitemviews_collaboration_SocketVideoHandler_addVideoStream = function(userId, stream, isMe) {
  isMe = typeof isMe !== 'undefined' ? isMe : false;
  var /** @type {views.actionitemviews.collaboration.VideoItem} */ existingItem = this.views_actionitemviews_collaboration_SocketVideoHandler_findVideoItem(userId);
  if (existingItem) {
    existingItem.videoItemData(userId, stream, isMe);
    existingItem.toggleCamera(true);
  } else {
    var /** @type {views.actionitemviews.collaboration.VideoItem} */ vidItem = new views.actionitemviews.collaboration.VideoItem();
    vidItem.videoItemData(userId, stream, isMe);
    this.views_actionitemviews_collaboration_SocketVideoHandler_uVidContainer.addElement(vidItem);
  }
};


/**
 * @private
 * @param {string} userId
 * @return {views.actionitemviews.collaboration.VideoItem}
 */
views.actionitemviews.collaboration.SocketVideoHandler.prototype.views_actionitemviews_collaboration_SocketVideoHandler_findVideoItem = function(userId) {
  for (var /** @type {number} */ i = 0; i < this.views_actionitemviews_collaboration_SocketVideoHandler_uVidContainer.numElements; i++) {
    var /** @type {views.actionitemviews.collaboration.VideoItem} */ vid = this.views_actionitemviews_collaboration_SocketVideoHandler_uVidContainer.getElementAt(i);
    if (vid && vid.userId == userId) {
      return vid;
    }
  }
  return null;
};


/**
 * @private
 * @param {string} userId
 * @param {boolean} on
 */
views.actionitemviews.collaboration.SocketVideoHandler.prototype.views_actionitemviews_collaboration_SocketVideoHandler_toggleCameraVisibility = function(userId, on) {
  var /** @type {views.actionitemviews.collaboration.VideoItem} */ vidItem = this.views_actionitemviews_collaboration_SocketVideoHandler_findVideoItem(userId);
  if (vidItem) {
    vidItem.toggleCamera(on);
  }
};


/**
 * @private
 * @param {string} userId
 */
views.actionitemviews.collaboration.SocketVideoHandler.prototype.views_actionitemviews_collaboration_SocketVideoHandler_removePeerVideo = function(userId) {
  for (var /** @type {number} */ i = 0; i < this.views_actionitemviews_collaboration_SocketVideoHandler_uVidContainer.numElements; i++) {
    var /** @type {views.actionitemviews.collaboration.VideoItem} */ vidItem = this.views_actionitemviews_collaboration_SocketVideoHandler_uVidContainer.getElementAt(i);
    if (vidItem && vidItem.userId == userId) {
      this.views_actionitemviews_collaboration_SocketVideoHandler_uVidContainer.removeElement(vidItem);
      break;
    }
  }
  if (this.views_actionitemviews_collaboration_SocketVideoHandler_peerConnections[userId]) {
    this.views_actionitemviews_collaboration_SocketVideoHandler_peerConnections[userId]["close"]();
    delete this.views_actionitemviews_collaboration_SocketVideoHandler_peerConnections[userId];
  }
};


/**
 * Metadata
 *
 * @type {Object.<string, Array.<Object>>}
 */
views.actionitemviews.collaboration.SocketVideoHandler.prototype.ROYALE_CLASS_INFO = { names: [{ name: 'SocketVideoHandler', qName: 'views.actionitemviews.collaboration.SocketVideoHandler', kind: 'class' }] };



/**
 * Reflection
 *
 * @return {Object.<string, Function>}
 */
views.actionitemviews.collaboration.SocketVideoHandler.prototype.ROYALE_REFLECTION_INFO = function () {
  return {
    methods: function () {
      return {
        'SocketVideoHandler': { type: '', declaredBy: 'views.actionitemviews.collaboration.SocketVideoHandler', parameters: function () { return [ 'org.apache.royale.jewel.VGroup', false ,'com.unhurdle.spectrum.Switch', false ,'views.actionitemviews.websocket.SocketService', false ]; }},
        'setMyUserId': { type: 'void', declaredBy: 'views.actionitemviews.collaboration.SocketVideoHandler', parameters: function () { return [ 'String', false ]; }},
        'isVideoMessage': { type: 'Boolean', declaredBy: 'views.actionitemviews.collaboration.SocketVideoHandler', parameters: function () { return [ 'String', false ]; }},
        'process': { type: 'void', declaredBy: 'views.actionitemviews.collaboration.SocketVideoHandler', parameters: function () { return [ 'Object', false ]; }},
        'onStartWebcam': { type: 'void', declaredBy: 'views.actionitemviews.collaboration.SocketVideoHandler'},
        'onStopWebcam': { type: 'void', declaredBy: 'views.actionitemviews.collaboration.SocketVideoHandler'}
      };
    }
  };
};
/**
 * @const
 * @type {number}
 */
views.actionitemviews.collaboration.SocketVideoHandler.prototype.ROYALE_COMPILE_FLAGS = 9;

//# sourceMappingURL=./SocketVideoHandler.js.map
