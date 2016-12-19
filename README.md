MM-Pir-Hide-All
===
[MagicMirror](https://github.com/MichMich/MagicMirror) Module to hide everything on screen.

This is a modification of the MM-Hide-All module (https://github.com/masters1222/mm-hide-all) by masters1222.  It requires the MMM-PIR-Sensor module (https://github.com/paviro/MMM-PIR-Sensor) by paviro to be installed as well, as the hiding/unhiding is triggered by the "USER_PRESENCE" notification sent.

This was created by Josh Mclaughlin to circumvent an issue with the MMM-PIR-Sensor module where a TV doesn't have power saving settings and killing the HDMI signal from the RPi forces the TV to shut off automatically.  This essentially brings up a black box to cover the screen after a set amount of time that disappears upon a USER_PRESENCE notification from the MMM-PIR-Sensor module.

Setup:
---
* Add the following to your config:
                {
                        module: 'MMM-PIR-Sensor',
                        config: {
                                powerSaving: false
                        }
                },
                {
                        module: 'mm-pir-hide-all',
			position: 'fullscreen_below',
			config: {
				fadeInTime: 1000,
                		fadeOutTime: 5000,
                        }
                },


Hiding/unhiding is triggered by the "USER_PRESENCE" notifications sent by the MMM-PIR-Sensor modules written by Paul-Vincent Roll available at https://github.com/paviro/MMM-PIR-Sensor
