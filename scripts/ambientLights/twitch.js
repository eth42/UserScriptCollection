// ==UserScript==
// @name         Twitch Ambient Light Generator
// @namespace    https://twitch.tv/
// @version      1.0
// @description  Ambient background coloring for Twitch
// @author       Erik Thordsen
// @match        *.twitch.tv/*
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
// @require      https://raw.githubusercontent.com/eth42/UserScriptCollection/master/utils/waitForKeyElements.js
// @require      https://raw.githubusercontent.com/eth42/UserScriptCollection/master/utils/ambientLightGenerator.js
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addValueChangeListener
// ==/UserScript==

(function() {
    'use strict';

    /*
     * Since some resize handlers throw exceptions, video resizing on window resize
     * doesn't work on twitch as an awkward side effect to using this script.
     * It's probably due to adding stuff to the menubar, but I dunno and don't care.
     * This functions fixes it by ignoring exceptions on window resize.
     */
    var fixTwitchResize = function() {
        /* Grab current jQuery instance */
        var jQueryResizeRef;
        for(var i in window){
            if(i.match("jQuery[0-9]+")){
                jQueryResizeRef = window[i];
                break;
            }
        }
        /* Make ALL jQuery resize events trigger on window resize, ignoring prior exceptions */
        window.onresize = function(){
            for(var i = 0; i < jQueryResizeRef.events.resize.length; i++){
                try{jQueryResizeRef.events.resize[i].handler();}catch(e){}
            }
        };
    };

    injectScript(fixTwitchResize);

    /* Listen on page elements and add them to the ambient light generator */
    /* - Container for control elements */
    listenOnElement(TYPE_CONTAINER, ".top-nav__search-container");
    /* - Video source */
    listenOnElement([TYPE_SOURCE, TYPE_TARGET], "video");
    /* - Targets for coloring */
    listenOnElement(TYPE_TARGET, ".twilight-main");
    listenOnElement(TYPE_TARGET, "h4");
    listenOnElement(TYPE_TARGET, ".video-player");
    /* Specifics of watching live stream */
    listenOnElement(TYPE_TARGET, ".video-player-hosting-ui__container");
    listenOnElement(TYPE_TARGET, ".channel-header");
    listenOnElement(TYPE_TARGET, ".channel-info-bar");
    listenOnElement(TYPE_TARGET, ".channel-header__item");
    listenOnElement(TYPE_TARGET, ".chat__pane");
    listenOnElement(TYPE_TARGET, ".chat__header");
    listenOnElement(TYPE_TARGET, ".tw-textarea");
    listenOnElement(TYPE_TARGET, ".pinned-cheer__headline");
    listenOnElement(TYPE_TARGET, ".emote-picker");
    listenOnElement(TYPE_TARGET, ".emote-picker__tabs-container");
    listenOnElement(TYPE_TARGET, ".simplebar-content");
    listenOnElement(TYPE_TARGET, ".chat-input");
    listenOnElement(TYPE_TARGET, ".stream-chat-header");
    /* Specifics of watching VOD */
    listenOnElement(TYPE_TARGET, ".video-info-bar");
    listenOnElement(TYPE_TARGET, ".video-chat");
    listenOnElement(TYPE_TARGET, ".form__input");
})();