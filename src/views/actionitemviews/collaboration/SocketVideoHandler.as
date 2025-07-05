package views.actionitemviews.collaboration {
    import com.unhurdle.spectrum.Switch;
    import views.actionitemviews.collaboration.VideoItem;
    import views.actionitemviews.websocket.SocketService;
    import org.apache.royale.jewel.VGroup;
    import org.apache.royale.jewel.List;

    public class SocketVideoHandler {

        private var myUserId:String;
        private var peerConnections:Object;
        private var localStream:Object;
        private var myLocalStream:Object;
        private var webcamInitialized:Boolean = false;

        private var uVidContainer:VGroup;
        private var shareCamBtn:Switch;
        private var socketService:SocketService;
        private var userList:List;

        public function SocketVideoHandler(uVidContainer:VGroup, shareCamBtn:Switch, socketService:SocketService) {
            this.uVidContainer = uVidContainer;
            this.shareCamBtn = shareCamBtn;
            this.socketService = socketService;
            this.peerConnections = {};
        }

        public function setUserList(lst:List):void {
            userList = lst;
        }

        public function setMyUserId(id:String):void {
            this.myUserId = id;
        }

        public function onStartWebcam():void {
            if (webcamInitialized) return;

            var constraints:Object = { video: true, audio: false };
            navigator.mediaDevices.getUserMedia(constraints as MediaStreamConstraints)
                .then(function(stream:Object):void {
                    localStream = stream;
                    myLocalStream = stream;
                    webcamInitialized = true;
                    shareCamBtn.onLabel = "Webcam on";
                    shareCamBtn.checked = true;

                    addVideoStream(myUserId, stream, true);

                    socketService.sendToSocket({
                        type: "share_webcam",
                        userId: myUserId
                    });

                }).catch(function(err:*):void {
                    console.error("Webcam access denied", err);
                    shareCamBtn.onLabel = "Webcam off";
                    shareCamBtn.checked = false;
                });
        }

        public function onStopWebcam():void {
            if (localStream) {
                localStream.getTracks().forEach(function(track:*):void {
                    track.stop();
                });
                localStream = null;
                myLocalStream = null;
                webcamInitialized = false;
                shareCamBtn.checked = false;
                shareCamBtn.offLabel = "Webcam off";
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

        public function handleOffer(sender:String, offer:Object):void {
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
                console.error("❌ Error handling offer from", sender, ":", error);
            });
        }

        public function handleAnswer(sender:String, answer:Object):void {
            peerConnections[sender].setRemoteDescription(new RTCSessionDescription(answer));
        }

        public function handleCandidate(sender:String, candidate:Object):void {
            peerConnections[sender].addIceCandidate(new RTCIceCandidate(candidate as RTCIceCandidateInit));
        }

        public function createPeerConnection(userId:String, isInitiator:Boolean):void {
            var config:Object = {
                iceServers: [ { urls: "stun:stun.l.google.com:19302" } ]
            };

            var pc:* = new RTCPeerConnection(config);
            peerConnections[userId] = pc;

            myLocalStream.getTracks().forEach(function(track:*):void {
                pc.addTrack(track, myLocalStream);
            });

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

        public function addVideoStream(userId:String, stream:Object, isMe:Boolean = false):void {
            for each (var otherId:String in userList.dataProvider.source) {
                if (otherId != myUserId && !peerConnections[otherId]) {
                    createPeerConnection(otherId, true);
                }
            }
            var vidItem:VideoItem = new VideoItem();
            vidItem.videoItemData(userId, stream, isMe);
            uVidContainer.addElement(vidItem);
        }

        public function removePeerVideo(userId:String):void {
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
