MM-Pir-Hide-All
===
[MagicMirror](https://github.com/MichMich/MagicMirror) Module to hide everything on screen.

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
