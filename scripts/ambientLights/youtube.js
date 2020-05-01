// ==UserScript==
// @name         YouTube Ambient Light Generator
// @namespace    https://youtube.com/
// @version      1.0
// @description  Ambient coloring for video stream pages
// @author       Erik Thordsen
// @match        *www.youtube.com/*
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
// @require      https://raw.githubusercontent.com/eth42/UserScriptCollection/master/utils/waitForKeyElements.js
// @require      https://raw.githubusercontent.com/eth42/UserScriptCollection/master/utils/ambientLightGenerator.js
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addValueChangeListener
// ==/UserScript==

(function() {
    'use strict';

    /* Listen on page elements and add them to the ambient light generator */
    /* - Container for control elements */
    listenOnElement(TYPE_CONTAINER, "#container");
    /* - Video source */
    listenOnElement([TYPE_SOURCE,TYPE_TARGET], ".video-stream");
    /* - Targets for coloring */
    listenOnElement(TYPE_TARGET, ".ytd-page-manager");
    listenOnElement(TYPE_TARGET, ".html5-video-player");
    listenOnElement(TYPE_TARGET, ".ytd-video-secondary-info-renderer");
})();