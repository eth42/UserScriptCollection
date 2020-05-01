# UserScriptCollection
A collection of user scripts I have written over the time for use in Tampermonkey.

To install any of the scripts, you need Tampermonkey or any compatible user script extension installed in your browser of choice.
Somewhere in the extension settings, you should be able to insert the URL of the scripts.
To access the raw code of the scripts, navigate to any of the scripts and click the "raw" button.
The URL of the raw file can be used to insert the script in Tampermonkey.

## Overview
Here I will give a short summary of what functionality the user scripts in the "scripts" directory provide.
The scripts in the "utils" directory can be safely ignored, as these are just collections of helper functions, that are commonly used among my user scripts.

### Video Scroll Controls (scripts/videoScrollControls.js)
The Video Scroll Controls are a neat little extension of the standard browser controls.
They provide you with the ability to control the volume, speed and brightness of any video element on any website by moving your mousewheel.  
To change the volume, scroll up or down while hovering over a video.  
To change the playback speed, scroll up or down while hovering over a video and holding the shift key.  
To change the brightness, scroll up or down while hovering over a video and holding the alt key.

### Twitch List Preview (scripts/twitchListPreview.js)
The Twitch List Preview gives you embedded previews of channels in the channels sidebar on the left of twitch.tv.
To open up a preview, simply hover over one of the channel names for some time.
When you click on the preview, the channel will be opened in the main view.
To close the preview, simply click on the X in the top right corner of the preview.

### Ambient Light Generators (scripts/ambientLights/*.js)
The Ambient Light Generators are example scripts for changing the "background color" of any website based on a video source.
If the video shows a greenish image, the background will be colored in a similar green whilst coloring text in an easily distinguishable color, so readability is increased.
To control the settings of the ambient light, a menu bar is injected into the page, with which the ambient light can be turned on or off.
Further you can change the color changing frequency and the number of pixels, that should be used in calculations.
More pixels and a higher frequency yield a better ambient light quality, but less pixels and a lower frequency require less processing power.
The default values are a good balance to my mind, but feel free to change them.
I provide ambient light generators for YouTube and Twitch, which are ready to use.
For other pages, you will need to copy and adapt the scripts to meet your needs.
