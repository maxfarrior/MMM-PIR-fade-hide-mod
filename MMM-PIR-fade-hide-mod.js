/* global Module */

/* Magic Mirror Module: MMM-PIR-fade-hide-mod
 * Max Farrior https://github.io/maxfarrior/MMM-PIR-fade-hide-mod
 *
 * Contains a lot of code from:
 *   - MMM-PIR-Sensor https://github.com/paviro/MMM-PIR-Sensor
 *   - MMM-PIR-Fade-HIDE https://github.com/s72817/MMM-PIR-Fade-HIDE
 */

Module.register("MMM-PIR-fade-hide-mod",{

        defaults: {
                coverFadeInDurationMS: 2000,	// How long it takes for the modules to fade IN. (The cover fades OUT.)
		coverFadeOutDurationMS: 2000,	// How long it takes for the modules to fade OUT. (The cover fades IN.)
		displayTimeoutMS: 15000,	// How long the modules will be shown before being faded out.
		monitorTimeoutMS: 30000,	// How long the monitor will be left on before being faded out.
		monitorPowerOnDelayMS: 5000,	// The amount of delay between powering on the monitor and fading IN the modules. This gives time for the monitor to power on. 
		useSudo: false,			// Use sudo for the command to turn the monitor on or off. Depends on how access to vcgenmod is given.
		startupTimeoutMS: 30000, 	// How long the screen will remain on after initial MM startup.
		allowedHourBegin: 7,		// The minimum hour of day that this module will display the MM. 
		allowedHourEnd: 23,		// The maximum hour of day that this module will display the MM.
	},

	getScripts: function() {
		return ["modules/MMM-PIR-fade-hide-mod/js/jquery.js"];
	},

	getStyles: function() {
		return ["MMM-PIR-fade-hide-mod.css"];
	},

	getDom: function() {
		var wrapper = document.createElement("div");
		wrapper.id = "BLACK";
		return wrapper;
	},

        notificationReceived: function(notification, payload, sender) {
		var self = this;
		var currentHour = new Date().getHours();
                if (notification === "USER_PRESENCE") {
			if (payload){
			// If the USER_PRESENCE notification's 'payload' value is 'true', then...
				// Reset the amount of time that the monitor power off function was waiting to power off the monitor.
				clearTimeout(this.deactivateMonitorTimeout);
				// Check if the current hour is within the allowed range.
				if (currentHour >= this.config.allowedHourBegin && currentHour < this.config.allowedHourEnd) {
					// Turn the HDMI output ON (by sending a 'MONITOR_ON' notification to this module's node_helper.js script.
					self.sendSocketNotification('MONITOR_ON', true);
				}

				// Reset the timer for displaying the un-hidden modules
				clearTimeout(this.hideModulesTimeout);
			} else{
			// If the USER_PRESENCE notification's 'payload' is 'false', then...
			// (This really only means that the PIR sensor has completed its delay. Once this happens, the MMM-PIR-Sensor module sends the 'USER_PRESENCE, payload=false' notification. )
				// Pause for 'this.config.displayTimeoutMS' milliseconds, then fade in the black cover (which hides the modules) 
				this.hideModulesTimeout = setTimeout(() => {
					// Fade IN the cover, this fades OUT the MM modules
					$('#BLACK').fadeIn(this.config.coverFadeInDurationMS);
				}, this.config.displayTimeoutMS); // The third parameter is passed to the function defined in setTimeout. This just passes the timeout value from the config to the function that will use it.
				// Pause for 'monitorTimeoutMS' milliseconds, then turn off the HDMI output.
				this.deactivateMonitorTimeout = setTimeout(() => {
					// Turn the HDMI output OFF (by sending a 'MONITOR_OFF' notification to this module's node_helper.js script.
					self.sendSocketNotification('MONITOR_OFF', true);
				}, this.config.monitorTimeoutMS);
			}
		}
	},

	// Receive notifications from the node_helper.js script.
	socketNotificationReceived: function (notification, payload) {
		// Listening for what the 'activateMonitor' function in 'node_helper.js' says about the previous status of the monitor.
		// If the monitor was previously OFF, we will add a delay before the modules are faded IN. If the monitor was previously ON, we will immediately fade IN the modules.
		if (notification === 'MONITOR_JUST_TURNED_ON') {
			// Delays for 'monitorPowerOnDelayMS' milliseconds. This allows for the monitor to fully turn on before the modules are faded.
			setTimeout(() => {
				// Fade OUT the cover, this fades IN the MM modules
				$('#BLACK').fadeOut(this.config.coverFadeOutDurationMS);
			}, this.config.monitorPowerOnDelayMS); // Third parameter is sent to the function within the setTimeout
		} else if (notification === 'MONITOR_WAS_ALREADY_ON') {
			// Immediately, fade OUT the cover, this fades IN the MM modules
			$('#BLACK').fadeOut(this.config.coverFadeOutDurationMS);
		}
	},

	start: function () {
		this.sendSocketNotification('CONFIG', this.config);
		Log.info('Starting module: ' + this.name);
		// Wait 'startupTimeoutMS' milliseconds, then tell node_helper.js to deactivate the monitor. This blanks the screen after a delay after MM boot.
		setTimeout(() => {
			// Fade IN the cover, this fades OUT the MM modules
			$('#BLACK').fadeIn(this.config.coverFadeInDurationMS);
			// Turn the HDMI output OFF (by sending a 'MONITOR_OFF' notification to this module's node_helper.js script.
			this.sendSocketNotification('MONITOR_OFF', true);
		}, this.config.startupTimeoutMS);
	},
});
