/* global Module */

/* Magic Mirror
 * Module: MM Pir Hide All
 * By josh mclaughlin
 */

Module.register("mm-pir-hide-all",{

        defaults: {
                fadeInTime: 1000,
		fadeOutTime: 1000,
        },

	getStyles: function() {
		return ["mm-pir-hide-all-style.css"];
	},

        notificationReceived: function(notification, payload, sender) {
                if (notification === "USER_PRESENCE") {
			if (payload){
			this.hide(this.config.fadeOutTime);
			}else{
                        this.show(this.config.fadeInTime);
			}
                }
        },
	
	getDom: function() {
		var wrapper = document.createElement("div");
		wrapper.className = "global-scrim";
		this.hide();
		return wrapper;
	}

});
