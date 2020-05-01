// ==UserScript==
// @name         Twitch List Previews
// @namespace    https://twitch.tv/
// @version      1.0
// @description  Makes mini previews of streams in the "browse channel" sidebar
// @author       Erik Thordsen
// @match        *.twitch.tv/*
// @require      https://embed.twitch.tv/embed/v1.js
// @require      http://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js
// @require      https://raw.githubusercontent.com/eth42/UserScriptCollection/master/utils/waitForKeyElements.js
// ==/UserScript==

(function() {
    'use strict';

    var currentPreview = null;

    function animate({duration, draw, timing}) {
        let start = performance.now();
        requestAnimationFrame(function animate(time) {
            let timeFraction = (time - start) / duration;
            if (timeFraction > 1) timeFraction = 1;
            let progress = timing(timeFraction)
            draw(progress);
            if (timeFraction < 1) {
                requestAnimationFrame(animate);
            }
        });
    }

    function createCloseButton() {
        var closeButton = document.createElement("button");
        closeButton.style.position = "absolute";
        closeButton.style.top = "10px";
        closeButton.style.right = "10px";
        closeButton.style.height = "20px";
        closeButton.style.background = "black";
        closeButton.style.opacity = ".7";
        closeButton.innerHTML = '<svg class="tw-svg__asset tw-svg__asset--close tw-svg__asset--inherit" width="20px" height="20px" version="1.1" viewBox="0 0 20 20" x="0px" y="0px"><path d="M11.414 10l5.293-5.293a.999.999 0 1 0-1.414-1.414L10 8.586 4.707 3.293a.999.999 0 1 0-1.414 1.414L8.586 10l-5.293 5.293a.999.999 0 1 0 1.414 1.414L10 11.414l5.293 5.293a.997.997 0 0 0 1.414 0 .999.999 0 0 0 0-1.414L11.414 10z" fill-rule="evenodd"></path></svg>'
        return closeButton;
    }

    function createTwitchEmbed(id, width, height, streamName) {
        return new Twitch.Embed(id, {
            width: width,
            height: height,
            layout: "video",
            muted: true,
            channel: streamName
        });
    }

    function createLoadBar(height) {
        var loadBar = document.createElement("div");
        loadBar.style.position = "absolute";
        loadBar.style.top = "0px";
        loadBar.style.left = "0px";
        loadBar.style.width = "0px";
        loadBar.style.height = height;
        loadBar.style.background = "white";
        loadBar.style.opacity = ".7";
        loadBar.running = false;
        return loadBar;
    }

    var addHoverPreview = function(e) {
        var previewDiv = e[0];
        previewDiv.style.position = "relative";
        previewDiv.livePreviewRunning = false;
        previewDiv.livePreviewTimeout = 0;
        var streamName = previewDiv.getElementsByTagName("img")[0].src.match(".*user_(.*)-.*")[1];
        var previewId = streamName+"-preview-embed";
        var previewContainer = document.createElement("div");
        previewContainer.id = previewId;
        previewContainer.style.display = "grid";
        previewContainer.style.position = "absolute";
        previewContainer.style.top = "0px";
        var previewLoadBar = createLoadBar("10px");
        previewLoadBar.style.display = "grid";

        previewDiv.appendChild(previewContainer);
        previewDiv.appendChild(previewLoadBar);
        previewDiv.stopPreview = function() {
            previewContainer.innerHTML = "";
            previewDiv.livePreviewRunning = false;
        };
        previewDiv.firstChild.addEventListener("mouseover", function(e){
            var makePreview = function(){
                if(!previewDiv.livePreviewRunning){
                    if(currentPreview != null) {
                        currentPreview.stopPreview();
                    }
                    previewDiv.livePreviewRunning = true;
                    var img = previewDiv.getElementsByTagName("img")[0];
                    var width = window.getComputedStyle(img).width;
                    var height = window.getComputedStyle(img).height;
                    var embed = createTwitchEmbed(previewId, width, height, streamName);
                    currentPreview = previewDiv;
                    var closeButton = createCloseButton();
                    closeButton.addEventListener("click", previewDiv.stopPreview);
                    previewContainer.appendChild(closeButton);
                }
            }
            previewDiv.livePreviewTimeout = setTimeout(makePreview, 500);
            previewLoadBar.running = true;
            animate({
                duration: 500,
                timing: function(timeFraction) {
                    return timeFraction;
                },
                draw: function(progress) {
                    if(previewLoadBar.running){
                        previewLoadBar.style.width = progress * 100 + '%';
                    }
                }
            });
        });
        previewDiv.firstChild.addEventListener("mouseout", function(e){
            clearTimeout(previewDiv.livePreviewTimeout);
            previewLoadBar.style.width = "0px";
            previewLoadBar.running = false;
        });
        window.addEventListener("resize", function(e){
            if(previewDiv.livePreviewRunning){
                var img = previewDiv.getElementsByTagName("img")[0];
                previewContainer.firstChild.width = window.getComputedStyle(img).width;
                previewContainer.firstChild.height = window.getComputedStyle(img).height;
            }
        });
    };

    var addTopBase = function() {
        var base = document.createElement("base");
        base.target = "_top";
        document.firstChild.appendChild(base);
    };

    var clearIframeForVid = function(e) {
        var vid = e[0];
        vid.autoplay = true;
        vid.muted = true;
        var doc = vid.ownerDocument;
        var vidContainer = doc.createElement("a");
        var channel = window.location.href.match(".*channel=([^\&]*)(\&.*)|$")[1];
        vidContainer.href = "https://www.twitch.tv/"+channel;
        while(doc.hasChildNodes()){
            doc.removeChild(doc.firstChild);
        }
        doc.appendChild(vidContainer);
        addTopBase();
        vidContainer.appendChild(vid);
        vidContainer.style.width="100%";
        vidContainer.style.height="100%";
        vid.style.width="100%";
        vid.play();
    };

    var addFollowedPreviewForDiv = function(previewDiv) {
        if(previewDiv.alreadyPrepped != undefined || previewDiv.getElementsByClassName("tw-channel-status-indicator--live").length == 0){
            return;
        }
        previewDiv.alreadyPrepped = true;
        previewDiv.livePreviewRunning = false;
        previewDiv.livePreviewTimeout = 0;
        var streamName = previewDiv.getElementsByTagName("img")[0].alt.split(" ")[0];
        var previewId = streamName+"-side-preview-embed";
        var previewContainer = document.createElement("div");
        previewContainer.id = previewId;
        previewContainer.style.position = "absolute";
        previewContainer.style.top = "0px";
        previewContainer.style.left = "0px";
        var previewLoadBar = createLoadBar("5px");
        var width = window.getComputedStyle(previewDiv).width.match("([0-9]*).*")[1]*1;
        var height = width/16.*9.;

        previewDiv.appendChild(previewContainer);
        previewDiv.appendChild(previewLoadBar);
        previewDiv.stopPreview = function() {
            previewContainer.innerHTML = "";
            previewDiv.livePreviewRunning = false;
            previewDiv.style.removeProperty("height");
        };
        previewDiv.firstChild.addEventListener("mouseover", function(e){
            var makePreview = function(){
                if(!previewDiv.livePreviewRunning){
                    if(currentPreview != null) {
                        currentPreview.stopPreview();
                    }
                    previewDiv.livePreviewRunning = true;
                    previewDiv.style.height = height+"px";
                    var embed = createTwitchEmbed(previewId, width, height, streamName);
                    currentPreview = previewDiv;
                    var closeButton = createCloseButton();
                    closeButton.addEventListener("click", previewDiv.stopPreview);
                    previewContainer.appendChild(closeButton);
                }
            }
            previewDiv.livePreviewTimeout = setTimeout(makePreview, 500);
            previewLoadBar.running = true;
            animate({
                duration: 500,
                timing: function(timeFraction) {
                    return timeFraction;
                },
                draw: function(progress) {
                    if(previewLoadBar.running){
                        previewLoadBar.style.width = progress * 100 + '%';
                    }
                }
            });
        });
        previewDiv.firstChild.addEventListener("mouseout", function(e){
            clearTimeout(previewDiv.livePreviewTimeout);
            previewLoadBar.style.width = "0px";
            previewLoadBar.running = false;
        });
    };

    var addFollowedPreview = function(e) {
        addFollowedPreviewForDiv(e[0]);
    }

    var addFollowedPreviewStatus = function(e) {
        var x = e[0];
        while(!x.classList.contains("side-nav-card")){
            x = x.parentNode;
        }
        addFollowedPreviewForDiv(x);
    }

    var addSearchRefreshButton = function(e) {
        var filterContainer = e[0];
        var refreshButton = document.createElement("div");
        refreshButton.classList = "tw-mg-05";
        refreshButton.innerHTML = '<div class="tw-align-items-center tw-border-radius-medium tw-font-size-4 tw-form-tag tw-form-tag--selected tw-inline-flex"><button class="tw-interactive tw-block tw-border-radius-medium tw-full-width tw-interactable tw-interactable--alt"><div class="tw-align-items-center tw-flex tw-pd-l-1 tw-pd-r-05 tw-pd-y-05">Refresh</div></button></div>';
        refreshButton.style.alignSelf = "flex-end";
        var performSearchRefresh = function(e){
            var filterSearch = filterContainer.getElementsByTagName("input")[0];
            filterSearch.dispatchEvent(new Event("focus"));
            var randomFilter = filterContainer.getElementsByClassName("tw-interactable--inverted")[5];
            var filterName = randomFilter.firstChild.innerHTML;
            randomFilter.click();
            var allFilterObjects = filterContainer.getElementsByClassName("tw-interactable");
            for(var i = 0; i < allFilterObjects.length; i++){
                if(allFilterObjects[i].innerHTML.match('.*>'+filterName+'<.*')){
                    allFilterObjects[i].click();
                    break;
                }
            }
            refreshButton.focus();
        }
        refreshButton.addEventListener("click", performSearchRefresh);
        filterContainer.appendChild(refreshButton);
    }

    if(window.location.href.startsWith("https://player.twitch.tv")){
        waitForKeyElements("video", clearIframeForVid);
    } else if(window.location.href.startsWith("https://embed.twitch.tv")){
    } else {
        waitForKeyElements(".side-nav-card", addFollowedPreview);
        waitForKeyElements(".tw-channel-status-indicator--live", addFollowedPreviewStatus);
        if(window.location.href.match(".*/directory/.*") != null){
            waitForKeyElements(".browse-header__filters", addSearchRefreshButton);
        }
        if(window.location.href.match(".*/videos/.*") == null){
            waitForKeyElements(".preview-card", addHoverPreview);
        }
    }
})();