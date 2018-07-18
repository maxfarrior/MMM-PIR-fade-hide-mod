/* Magic Mirror Module: MMM-PIR-fade-hide-mod
 * Max Farrior https://github.io/maxfarrior/MMM-PIR-fade-hide-mod
 *
 * Contains a lot of code from:
 *   - MMM-PIR-Sensor https://github.com/paviro/MMM-PIR-Sensor
 *   - MMM-PIR-Fade-HIDE https://github.com/s72817/MMM-PIR-Fade-HIDE
 */

const NodeHelper = require("node_helper");
const exec = require("child_process").exec;

module.exports = NodeHelper.create({

	start() {
		console.log(`Starting module helper: ${this.name}`);
		this.started = false;
	},

        activateMonitor: function (hdmiOnOffCMD, monitorPowerOnDelay) {
		// Following line is critical for not-fully-understood reason
		const self = this;
                // Check if hdmi output is already on
		exec(hdmiOnOffCMD).stdout.on('data', function(data) {
			if (data.indexOf("display_power=0") === 0) {
				// If off, turn the HDMI output ON
				exec(hdmiOnOffCMD + " 1", null);
				// And also send a message back to the main .js script
				self.sendSocketNotification('MONITOR_JUST_TURNED_ON', true);
			} else {
				// If on, take no action, except sending a message back to the main js script
				self.sendSocketNotification('MONITOR_WAS_ALREADY_ON', true);
			}
		});
        },

        deactivateMonitor: function (hdmiOnOffCMD) {
                // Turn the HDMI output OFF
		exec(hdmiOnOffCMD + " 0", null);
        },

	// This receives 'socket' notifications from the main .js script.
	socketNotificationReceived: function (notification, payload) {
		if (notification === 'CONFIG' && this.started == false) {
			const self = this;
			this.config = payload;

		// Define the HDMI enable and disable commands
		if (this.config.useSudo) {
			// This is an alternative method that uses sudo. Must be configured per the README.
			this.hdmiOnOffCommand = "/usr/bin/sudo /usr/bin/vcgencmd display_power";
		} else {
			// This way works with the directions from paviro's MMM-PIR-Sensor module.
			this.hdmiOnOffCommand = "/usr/bin/vcgencmd display_power";
		}

		// Initial setup complete
		this.started = true;

		} else if (notification === 'MONITOR_ON') {
			// Turn the HDMI output ON
			this.activateMonitor(this.hdmiOnOffCommand, this.config.monitorPowerOnDelayMS);

		} else if (notification === 'MONITOR_OFF') {
			// Turn the HDMI output OFF
			this.deactivateMonitor(this.hdmiOnOffCommand);
		}

	},
});
