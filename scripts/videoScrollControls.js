// ==UserScript==
// @name         Video Scroll Controls
// @namespace    localhost
// @version      2.0
// @description  Use your mouse wheel to change playback speed, volume and brightness of videos
// @author       Erik Thordsen
// @match        *://*/*
// ==/UserScript==


(function() {
    'use strict';

    var mouseX = 0;
    var mouseY = 0;

    var trackMouse = function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    }

    document.addEventListener("mousemove", trackMouse);

    var genTag = function() {
        var tag = document.createElement("p");
        tag.style.display = "grid";
        tag.style.fontFamily = "monospace";
        tag.style.fontSize = "40pt";
        tag.style.webkitTextFillColor = "white";
        tag.style.webkitTextStroke = "1px black";
        tag.style.width = "100%";
        tag.style.position = "absolute";
        tag.style.textAlign = "left";
        tag.style.margin = "0px";
        tag.style.top = "0px";
        tag.style.zIndex = "9000";
        return tag;
    }

    var speedTimeoutId;
    var speedTag = genTag();
    speedTag.style.textAlign = "right";
    var volTimeoutId;
    var volTag = genTag();
    var brightnessTimeoutId;
    var brightnessTag = genTag();
    brightnessTag.style.textAlign = "right";
    var brightnessVal = 1;

    var genHideTagFun = function(tag) {
        return function() {
            tag.parentNode.removeChild(tag);
        };
    };
    var hideSpeedTag = genHideTagFun(speedTag);
    var hideVolTag = genHideTagFun(volTag);
    var hideBrightnessTag = genHideTagFun(brightnessTag);

    var scrollHandler = function(e) {
        var theVid = null;
        var scrollTargets = document.elementsFromPoint(mouseX, mouseY);
        for(var i = 0; i < scrollTargets.length; i++){
            var target = scrollTargets[i];
            if(target.tagName == "VIDEO"){
                theVid = target;
                break;
            }
        }
        if(theVid != null) {
            e.preventDefault();
            e.returnValue = false;
            e.stopPropagation();
            var targetFontSize = Math.sqrt(window.getComputedStyle(theVid).width.match("([0-9]*).*")[1])*2;
            var activateTag = function(tag, timeoutId) {
                tag.style.fontSize = targetFontSize+"pt";
                theVid.parentNode.appendChild(tag);
                clearTimeout(timeoutId);
                return setTimeout(genHideTagFun(tag), 500);
            };
            if(e.shiftKey){
                var speed = theVid.playbackRate;
                if(e.wheelDelta > 0){
                    speed *= 1+.025/120*e.wheelDelta;
                }else if(e.wheelDelta < 0){
                    speed *= 1/(1-.025/120*e.wheelDelta);
                }
                theVid.playbackRate = 1.*speed.toFixed(5);
                speedTag.innerHTML = "Speed: " + theVid.playbackRate.toFixed(2);
                speedTimeoutId = activateTag(speedTag, speedTimeoutId);
            } else if (e.altKey) {
                if(e.wheelDelta > 0){
                    brightnessVal *= 1+.025/120*e.wheelDelta;
                }else if(e.wheelDelta < 0){
                    brightnessVal *= 1/(1-.025/120*e.wheelDelta);
                }
                brightnessVal = 1.*brightnessVal.toFixed(5);
                theVid.style.filter = "brightness("+brightnessVal+")";
                brightnessTag.style.top = (targetFontSize+2)+"pt";
                brightnessTag.innerHTML = "Brightness: " + brightnessVal.toFixed(2);
                brightnessTimeoutId = activateTag(brightnessTag, brightnessTimeoutId);
            } else {
                var volume = theVid.volume;
                if(e.wheelDelta != 0){
                    volume = Math.max(0,Math.min(1,volume+.1/120*e.wheelDelta));
                    theVid.muted = false;
                }
                theVid.volume = 1.*volume.toFixed(5);
                volTag.innerHTML = "Volume: " + (theVid.volume*100).toFixed(0);
                volTimeoutId = activateTag(volTag, volTimeoutId);
            }
            return false;
        }
    }

    document.addEventListener("wheel", scrollHandler, { passive: false });
})();