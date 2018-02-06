/* global Module */

/* Magic Mirror
 * Module: MM Pir Hide All
 * By Richard Kerber
 */

Module.register("MMM-PIR-Fade-HIDE",{

        defaults: {
                fadeInTime: 1000,
		fadeOutTime: 1000,
		
	},

	getScripts: function() {
		return ["modules/MMM-PIR-Fade-HIDE/js/jquery.js"];
	},

	getStyles: function() {
		return ["MMM-PIR-Fade-HIDE.css"];
	},

        notificationReceived: function(notification, payload, sender) {
                if (notification === "USER_PRESENCE") {
			if (payload){
				$('#BLACK').fadeOut(this.config.fadeOutTime);
				
			}else{
				$('#BLACK').fadeIn(this.config.fadeInTime);
			}
			
                }
	},
	
	
	getDom: function() {
		var wrapper = document.createElement("div");
		wrapper.id = "BLACK";
		return wrapper;
	}

});
