(function() {
    // 1. Force Ruffle to keep its native loader system active
    window.RufflePlayer = window.RufflePlayer || {};
    window.RufflePlayer.config = window.RufflePlayer.config || {};
    window.RufflePlayer.config.splashScreen = false;
    window.RufflePlayer.config.preloader = true;

    // 2. Inject simple CSS styles to place the text directly below Ruffle's loop
    var style = document.createElement('style');
    style.textContent = '#real-percent-box { position: fixed; top: 62%; left: 50%; transform: translate(-50%, -50%); color: #ffffff; font-family: Arial, sans-serif; font-size: 24px; font-weight: bold; z-index: 999999; pointer-events: none; text-shadow: 0px 2px 4px rgba(0,0,0,0.6); }' +
        ' #real-bar-track { position: fixed; top: calc(62% + 26px); left: 50%; transform: translateX(-50%); width: 260px; max-width: 70vw; height: 8px; background: rgba(255,255,255,0.25); border-radius: 4px; overflow: hidden; z-index: 999999; pointer-events: none; }' +
        ' #real-bar-fill { width: 0%; height: 100%; background: linear-gradient(90deg, #754fa0, #09b7bf, #90d36b, #f2d40d, #fcb12b, #ed1b72); background-size: 260px 100%; border-radius: 4px; transition: width 0.25s ease-out; }';
    document.head.appendChild(style);

    // Create the visual percentage text container
    var percentBox = document.createElement('div');
    percentBox.id = 'real-percent-box';
    percentBox.innerText = '0%';

    // Progress bar (track + fill) that fills in sync with the percentage
    var barTrack = document.createElement('div');
    barTrack.id = 'real-bar-track';
    var barFill = document.createElement('div');
    barFill.id = 'real-bar-fill';
    barTrack.appendChild(barFill);

    function mountUI() {
        document.body.appendChild(percentBox);
        document.body.appendChild(barTrack);
    }

    if (document.body) {
        mountUI();
    } else {
        window.addEventListener('DOMContentLoaded', mountUI);
    }

    // 3. THE REAL TRACKER
    // Ruffle's internal onRuffleDownloadProgress(bytesLoaded, bytesTotal) sets:
    //   splashScreen.querySelector(".loadbar-inner").style.width = (loaded/total*100) + "%"
    // That splash screen lives inside the player's OPEN shadow root
    // (this.shadow = this.element.attachShadow({mode:"open"})), so it's reachable
    // via player.shadowRoot, but a MutationObserver on document.body will never
    // see it — shadow trees aren't crossed by light-DOM subtree observation.
    // So we have to: find the player -> get its shadowRoot -> find .loadbar-inner
    // inside it -> watch THAT element's "style" attribute directly.

    var innerObserver = null;
    var attachedTo = null;

    function readPercentFrom(loadbarInner) {
        var width = loadbarInner.style.width || '0%';
        var value = parseFloat(width);
        if (!isNaN(value)) {
            var clamped = Math.max(0, Math.min(100, value));
            percentBox.innerText = Math.round(clamped) + '%';
            barFill.style.width = clamped + '%';
        }
    }

    function tryAttachToPlayer() {
        if (innerObserver) return; // already attached

        var player = document.querySelector('ruffle-player, ruffle-embed, ruffle-object');
        if (!player || !player.shadowRoot) return;

        var loadbarInner = player.shadowRoot.querySelector('.loadbar-inner');
        if (!loadbarInner) return; // splash markup not mounted yet, keep polling

        attachedTo = loadbarInner;

        // Read whatever value is already there (in case some progress
        // happened before we attached)
        readPercentFrom(loadbarInner);

        innerObserver = new MutationObserver(function() {
            readPercentFrom(loadbarInner);
        });
        innerObserver.observe(loadbarInner, {
            attributes: true,
            attributeFilter: ['style']
        });
    }

    // The player element (and its shadow content) may not exist the instant
    // this script runs, so poll briefly until we can attach. This is cheap
    // and self-stops once attached or once the page finishes loading.
    var pollId = setInterval(function() {
        tryAttachToPlayer();
        if (innerObserver) clearInterval(pollId);
    }, 50);

    // 4. CLEANUP PIPELINE: Safely destroy the overlay once the Flash course content starts running
    window.addEventListener('load', function() {
        var flashContainer = document.getElementById("flashContent");

        function removePercentUI() {
            clearInterval(pollId);
            if (innerObserver) {
                innerObserver.disconnect();
                innerObserver = null;
            }
            if (percentBox && percentBox.parentNode) {
                percentBox.parentNode.removeChild(percentBox);
            }
            if (barTrack && barTrack.parentNode) {
                barTrack.parentNode.removeChild(barTrack);
            }
        }

        if (flashContainer) {
            flashContainer.addEventListener("loadedmetadata", removePercentUI, true);
            flashContainer.addEventListener("loadeddata", removePercentUI, true);
        }
    });
})();
