package views.actionitemviews.collaboration {
    import com.unhurdle.spectrum.Switch;
    import views.actionitemviews.collaboration.VideoItem;
    import views.actionitemviews.websocket.SocketService;
    import org.apache.royale.jewel.VGroup;
    import com.util.AppAlert;

    public class SocketVideoHandler {

        private var myUserId:String;
        private var peerConnections:Object;
        private var localStream:Object;
        private var myLocalStream:Object;
        private var webcamInitialized:Boolean = false;

        private var uVidContainer:VGroup;
        private var shareCamBtn:Switch;
        private var socketService:SocketService;

        public function SocketVideoHandler(uVidContainer:VGroup, shareCamBtn:Switch, socketService:SocketService) {
            this.uVidContainer = uVidContainer;
            this.shareCamBtn = shareCamBtn;
            this.socketService = socketService;
            this.peerConnections = {};
        }

        public function setMyUserId(id:String):void {
            this.myUserId = id;
        }

        public function isVideoMessage(type:String):Boolean {
            return type == "video-offer" || type == "video-answer" || type == "ice-candidate" || type == "share_webcam" || type == "user_disconnected";
        }

        public function process(data:Object):void {
            switch (data.type) {
                case "video-offer":
                    handleOffer(data.sender, data.offer);
                    break;
                case "video-answer":
                    handleAnswer(data.sender, data.answer);
                    break;
                case "ice-candidate":
                    handleCandidate(data.sender, data.candidate);
                    break;
                case "share_webcam":
                    if (data.userId != myUserId)
                        createPeerConnection(data.userId, true);
                    break;
                case "user_disconnected":
                    toggleCameraVisibility(data.userId, false);
                    break;
            }
        }

        private function updateCamButtonState(on:Boolean):void {
            shareCamBtn.checked = on;
            webcamInitialized = on ? true : false;
            //shareCamBtn.onLabel = on ? "Webcam on" : "Webcam off";
            
        }


        public function onStartWebcam():void {
            if (webcamInitialized) return;

            var constraints:Object = { video: true, audio: false };
            navigator.mediaDevices.getUserMedia(constraints as MediaStreamConstraints)
                .then(function(stream:Object):void {
                    localStream = stream;
                    myLocalStream = stream;
                    // webcamInitialized = true;
                    // shareCamBtn.onLabel = "Webcam on";
                    // shareCamBtn.checked = true;
                    updateCamButtonState(true);
                    addVideoStream(myUserId, stream, true);

                    socketService.sendToSocket({
                        type: "share_webcam",
                        userId: myUserId
                    });

                }).catch(function(err:*):void {
                    AppAlert.show(AppAlert.ERROR, "Webcam access denied <br>" + err);
                    updateCamButtonState(false);
                    // shareCamBtn.onLabel = "Webcam off";
                    // shareCamBtn.checked = false;
                });
        }

        public function onStopWebcam():void {
            if (localStream) {
                localStream.getTracks().forEach(function(track:*):void {
                    track.stop();
                });
                localStream = null;
                myLocalStream = null;
                updateCamButtonState(false);
                // webcamInitialized = false;
                // shareCamBtn.checked = false;
                // shareCamBtn.offLabel = "Webcam off";
            }

            // Inform backend to broadcast disconnect
            console.log("send disconnect bacl to nod", myUserId)
            socketService.sendToSocket({
                type: "user_disconnected",
                userId: myUserId
            });

            // Clean up all peer connections
            for (var id:String in peerConnections) {
                peerConnections[id].close();
            }
            peerConnections = {};
        }

        private function handleOffer(sender:String, offer:Object):void {
            createPeerConnection(sender, false);
            var pc:* = peerConnections[sender];

            pc.setRemoteDescription(new RTCSessionDescription(offer)).then(function():* {
                return pc.createAnswer();
            }).then(function(answer:*):* {
                pc.setLocalDescription(answer);
                socketService.sendToSocket({
                    type: "video-answer",
                    target: sender,
                    answer: answer
                });
            }).catch(function(error:*):void {
                AppAlert.show(AppAlert.ERROR, "❌ Error handling offer from \n"+ sender + ":" + error);
            });
        }

        private function handleAnswer(sender:String, answer:Object):void {
            peerConnections[sender].setRemoteDescription(new RTCSessionDescription(answer));
        }

        private function handleCandidate(sender:String, candidate:Object):void {
            peerConnections[sender].addIceCandidate(new RTCIceCandidate(candidate as RTCIceCandidateInit));
        }

        private function createPeerConnection(userId:String, isInitiator:Boolean):void {
            var config:Object = {
                iceServers: [ { urls: "stun:stun.l.google.com:19302" } ]
            };

            var pc:* = new RTCPeerConnection(config);
            peerConnections[userId] = pc;

            if (myLocalStream) {
                myLocalStream.getTracks().forEach(function(track:*):void {
                pc.addTrack(track, myLocalStream);
            });
            } else {
                AppAlert.show(AppAlert.WARNING, "⚠️ No local stream available for user: " + myUserId);
            }


            pc.onicecandidate = function(event:*):void {
                if (event.candidate) {
                    socketService.sendToSocket({
                        type: "ice-candidate",
                        target: userId,
                        candidate: event.candidate
                    });
                }
            };

            pc.ontrack = function(event:*):void {
                trace("🎥 Received remote track from", userId);
                addVideoStream(userId, event.streams[0]);
            };

            if (isInitiator) {
                pc.createOffer().then(function(offer:*):void {
                    pc.setLocalDescription(offer);
                    socketService.sendToSocket({
                        type: "video-offer",
                        target: userId,
                        offer: offer
                    });
                });
            }
        }

        private function addVideoStream(userId:String, stream:Object, isMe:Boolean = false):void {
            var existingItem:VideoItem = findVideoItem(userId);

            if (existingItem) {
                existingItem.videoItemData(userId, stream, isMe); // update stream
                existingItem.toggleCamera(true); // ensure it's visible
            } else {
                var vidItem:VideoItem = new VideoItem();
                vidItem.videoItemData(userId, stream, isMe);
                uVidContainer.addElement(vidItem);
            }
        }


        private function findVideoItem(userId:String):VideoItem {
            for (var i:int = 0; i < uVidContainer.numElements; i++) {
                var vid:VideoItem = uVidContainer.getElementAt(i) as VideoItem;
                if (vid && vid.userId == userId) {
                    return vid;
                }
            }
            return null;
        }

        private function toggleCameraVisibility(userId:String, on:Boolean):void {
            var vidItem:VideoItem = findVideoItem(userId);
            if (vidItem) {
                vidItem.toggleCamera(on);
            }
        }

        private function removePeerVideo(userId:String):void {
            for (var i:int = 0; i < uVidContainer.numElements; i++) {
                var vidItem:VideoItem = uVidContainer.getElementAt(i) as VideoItem;
                if (vidItem && vidItem.userId == userId) {
                    uVidContainer.removeElement(vidItem);
                    break;
                }
            }

            if (peerConnections[userId]) {
                peerConnections[userId].close();
                delete peerConnections[userId];
            }
        }
    }
}
