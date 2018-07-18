/* global Module */

/* Magic Mirror
 * Module: MM Pir Hide All
 * By Richard Kerber
 */

Module.register("MMM-PIR-Fade-HIDE",{

        defaults: {
                fadeInTime: 5000,
		fadeOutTime: 5000,
		displayTime: 60000,
	},

	getScripts: function() {
		return ["modules/MMM-PIR-Fade-HIDE/js/jquery.js"];
	},

	getStyles: function() {
		return ["MMM-PIR-Fade-HIDE.css"];
	},

        notificationReceived: function(notification, payload, sender) {
                if (notification === "USER_PRESENCE") {
			// If the USER_PRESENCE notification's 'payload' value is 'true', then...
			if (payload){
				// Fade OUT the black cover, causing modules to fade IN
				$('#BLACK').fadeOut(this.config.fadeOutTime);
				
				// Pause for 'this.config.displayTime' milliseconds, then fade in the black cover (which hides the modules) 
				setTimeout(function(fadeInDuration) {
				
				// Fade IN the black cover, causing modules to fade OUT
				$('#BLACK').fadeIn(fadeInDuration);
				
				}, this.config.displayTime, this.config.fadeInTime); // The third parameter is sent to the setTimeout function
			}
		}
	},
	
	
	getDom: function() {
		var wrapper = document.createElement("div");
		wrapper.id = "BLACK";
		return wrapper;
	}

});
