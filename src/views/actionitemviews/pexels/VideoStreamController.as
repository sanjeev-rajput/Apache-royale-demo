package views.actionitemviews.pexels {
    import com.model.ServiceLoader;
    import com.model.Config;
    import com.util.AppAlert;
    import org.apache.royale.events.Event;
    import org.apache.royale.jewel.VideoPlayer;

    public class VideoStreamController {
        private var sUrl:String = Config.apiBaseUrl;
        private var query:String = "technology";
        private var perPage:int = 10;
        private var currentPage:int = 1;
        private var isFetching:Boolean = false;
        private var httpService:ServiceLoader;
        private var currentPlayingPlayer:VideoPlayer;


        public function VideoStreamController(defaultQuery:String = "technology", defaultPerPage:int = 10) {
            query = defaultQuery;
            perPage = defaultPerPage;
        }

        public function reset(newQuery:String = "technology"):void {
            query = newQuery;
            currentPage = 1;
            isFetching = false;
        }

        public function fetchNextPage(
            onSuccess:Function, 
            onError:Function = null
        ):void {
            if (isFetching) return;
            isFetching = true;

            if (httpService) {
                httpService.cancel();
                httpService = null;
            }

            var url:String = sUrl + "pexels/videoStream?q=" + encodeURIComponent(query) +
                             "&per_page=" + perPage + "&page=" + currentPage;

            httpService = new ServiceLoader();
            httpService.reqMethod = "GET";
            httpService.contentType = "application/json";
            httpService.loadJData(
                url,
                function(data:Object):void {
                    isFetching = false;
                    currentPage++;
                    if (onSuccess != null) onSuccess(data);
                },
                ServiceLoader.DATA_TYPE_JSON,
                function(e:Event):void {
                    isFetching = false;
                    if (onError != null) {
                        onError(e);
                    } else {
                        AppAlert.show(AppAlert.ERROR, "Video loading failed");
                    }
                },
                false
            );
        }

        public function getBestVideoUrl(video:Object):String {
            var best:Object = video.video_files.find(function(v:Object):Boolean {
                return v.quality == "sd" && v.width <= 640;
            }) || video.video_files[0];

            return best ? best.link : null;
        }

        public function createVideoPlayer(link:String, width:int = 0, height:int = 0):VideoPlayer {
            var player:VideoPlayer = new VideoPlayer();
            if(width > 0 || height > 0){
                player.width = width;
                player.height = height;
            }else{
                player.percentWidth = 100;
                player.percentHeight = 100;
            }
            player.src = link;
            player.autoplay = false;
            player.controls = true;
            player.loop = true;
            player.addEventListener("play", function():void {
                if (currentPlayingPlayer && currentPlayingPlayer != player) {
                    currentPlayingPlayer.pause();
                }
                currentPlayingPlayer = player;
            });

            return player;
        }

        public function dispose():void {
            if (currentPlayingPlayer) {
                currentPlayingPlayer.pause();
                currentPlayingPlayer = null;
            }
            if(httpService){
                httpService.cancel()
                httpService = null;
            }
            reset();
        }
    }
}
