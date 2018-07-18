# MMM-PIR-hide-fade-mod

This is a module for the fantastic for the [MagicMirror](https://github.com/MichMich/MagicMirror) platform.

This module fades all displayed modules in and out based on input from a PIR sensor.

This module can also turn the monitor on and off based on PIR sensor input.
also
## Installation
1. First, you need paviro's [MMM-PIR-Sensor](https://github.com/paviro/MMM-PIR-Sensor) module installed.
2. In configuration for MMM-PIR-Sensor, you **must** set `powerSaving: false,`.
3. Next, navigate into your MagicMirror's `modules` folder and run:
        $ git clone https://github.com/maxfarrior/MMM-PIR-fade-hide-mod

## Configuration

Add the following to your `config/config.js` file:
````javascript
{
        module: 'MMM-PIR-fade-hide-mod',
        position: 'fullscreen_below',
        config: {
          // Configuration options go here
          // Example:
          coverFadeInDurationMS: 2000,
          coverFadeOutDurationMS: 2000,
        }
},
````

## Configurable Options

The defaults aren't necessarily useful, mainly used to clearly show the different timeouts. 

| **Option** | **Default** | **Description** |
| --- | --- | --- |
| `coverFadeOutDurationMS` | `2000` | How long it takes for the modules to fade IN. (The cover fades OUT.) <br> Unit: ms |
| `coverFadeInDurationMS` | `2000` | How long it takes for the modules to fade OUT. (The cover fades IN.) <br> Unit: ms. |
| `displayTimeoutMS` | `15000` | How long the modules will be shown before being faded out. <br> Unit: ms. |
| `monitorTimeoutMS` | `30000` | How long the monitor will be left on before being faded out. <br> Unit: ms. |
| `monitorPowerOnDelayMS` | `5000` | The amount of delay between powering on the monitor and fading IN the modules. <br> This gives time for the monitor to power on. <br> Unit: ms. |
| `useSudo` | `false` | If you have followed the directions from paviro's [MMM-PIR-Sensor](https://github.com/paviro/MMM-PIR-Sensor) module (using `chmod` on /usr/bin/vcgencmd), then leave this as `false`. <br> If you decide to use `sudo` instead (directions below), set this option to `true`. |
| `startupTimeoutMS` | `30000` | How long the screen will remain on after MM starts up. <br> Unit: ms. |
| `allowedHourBegin` | `7` | The minimum hour of the day that this module will display the MM. <br> The default of `7` refers to the 7th hour of the day, so this module will respond to PIR input after 7:00 am. <br> Unit: hour of day |
| `allowedHourEnd` | `23` | The maximum hour of the day that this module will display the MM. <br> The default of `23` refers to the 23rd hour of the day, so this module will respond to PIR input before 11:00 pm. <br> Unit: hour of day |

### useSudo Option

Paviro's [MMM-PIR-Sensor](https://github.com/paviro/MMM-PIR-Sensor) module changed the permissions on `/usr/bin/vcgencmd` so the user running MagicMirror could power the monitor on and off.

I think it's a little cleaner to use `sudo` to allow access to `/usr/bin/vcgencmd`. To do this:

1. Edit the sudoers file.
        $ sudo visudo
2. At the bottom of the file, added the following line: `chris   ALL=(ALL:ALL) NOPASSWD: /opt/vc/bin/vcgencmd`.
3. Save and close the file (*Usually*, Ctl+X by default).
4. Set `useSudo: true,` in config.js for this module.

This allows the user `chris` to run `sudo vcgencmd` without a password. No permission changes on any binaries needed.

## Goal

I was previously using [MMM-PIR-Sensor](https://github.com/paviro/MMM-PIR-Sensor), which could turn the monitor on and off with the PIR sensor. That worked just fine.

Then I wanted a way to have the MagicMirror fade in, instead of just appearing. And that's how I found s72817's [MMM-PIR-Fade-HIDE](https://github.com/s72817/MMM-PIR-Fade-HIDE) module.

Then I realized that it would make more sense to have one module controlling the fading as well as the monitor power. Using two modules, the fading in/out operates completely independently of the monitor being turned on/off. This *could* work, but I thought it would be better to have one module control both.

## How This Works

### Short Version

This module fades in/out a black "cover" over the modules to "hide" them. The fade in/out is on a timer, which is reset based on PIR input.

This module also turns the monitor on and off based on a timer and PIR input.

So if everything is off, and PIR is triggered, then the monitor comes on, and the "cover" is faded *out* (modules fade in). A timer starts. If PIR is triggered again, the timer is reset. If the timer reaches zero, the "cover" is faded *in* (modules fade out). If PIR is triggered, the cover is faded *out* (modules fade in) again. Once the "cover" is hiding the modules, another timer is started. When that reaches zero, the monitor is turned off.

Basically, in addition to normal operation, there's a "soft off" mode (modules hidden, monitor on) and a "hard off" mode (modules hidden, monitor off).

### Longer Version

The powerSaving option is disabled in [MMM-PIR-Sensor](https://github.com/paviro/MMM-PIR-Sensor), so it doesn't touch the monitor. All MMM-PIR-Sensor does is send a notification to all modules when the PIR sensor is triggered.

This module listens for for the "USER_PRESENCE, payload=true" notification.

When this is received, it sends a *socket* notification to this module's `node_helper.js` script (`node_helper.js` is needed because the main js file apparently(?) can't run the `exec` command to run shell commands.)

The `node_helper.js` script receives the notification, powers on the monitor, then sends a notification back to the main js script.

The main js script listens for the notification from `node_helper.js` saying that the monitor is on. The main js script then fades in the modules

### How the PIR Sensor Works

The standard PIR Sensor (HC-SR501) has a delay built into it. This delay is physically adjustable by a potentiometer.

The MMM-PIR-Sensor module sends two notifications. One, when the PIR sensor is first triggered, and another when the PIR sensor completes its delay.

I *assume* the intent was to adjust the PIR sensor's delay to match how long you wanted the system to register "presence".

The first problem with this is that once the PIR fires, it can't fire again until the delay has ended. Handling "presence" in software allows the "presence" time to be reset, when a second PIR sensor signal is received.

The second problem with this is that it's physically difficult to adjust. Not a huge issue, but changing a number in a file is easier than trying to adjust a pot on the back of my mirror.

**Example:** Let's say the PIR sensor's delay is set to two minutes. You walk up to the mirror, it fires. You walk away. Then at 1:50, you walk up to the mirror again. You'd *expect* the mirror to detect you and start your two minutes over again. However, the PIR sensor is still completing its two minute delay, so can't fire again. The "off" signal will be sent to the mirror in 10 seconds, even though you just walked up.

**Solution:** I set the delay on the PIR sensor as low as possible (about 3 seconds). Then I interpret the "presence detected" and "no more presence" signals from MMM-PIR-Sensor.

On the "presence detected" signal, this module turns the monitor on, fades in the modules, and resets the "display modules", and "monitor power on" timers. On the "no more presence" signal, this module starts the "display modules" and "monitor power on" timers. This way, "presence" in handled by the timers, which can be reset from subsequent triggers of the PIR sensor.

## Credits

This project borrows code from other existing modules. Primarily, the monitor control code from [paviro's MMM-PIR-Sensor](https://github.com/paviro/MMM-PIR-Sensor) module and the code that does the fading from [s72817's MMM-PIR-Fade-HIDE](https://github.com/s72817/MMM-PIR-Fade-HIDE) module.

**Huge** thanks to those modules.

## Fork History

The [MMM-PIR-Fade-HIDE](https://github.com/s72817/MMM-PIR-Fade-HIDE) module is the result of a few forks. I have atempted to document the chain, only for reference.

  * masters1222 / [mm-hide-all](https://github.com/masters1222/mm-hide-all) -- Original project. Modules are hidden by a button press.
  * plumcraft / [mmm-hide-all](https://github.com/plumcraft/mmm-hide-all) -- Minor edits, mostly name changes
  * phrazelle / [mm-pir-hide-all](https://github.com/phrazelle/mm-pir-hide-all) -- Changed the trigger to be a PIR sensor using [paviro's MMM-PIR-Sensor](https://github.com/paviro/MMM-PIR-Sensor) module.
  * s72817 / [MMM-PIR-Fade-HIDE](https://github.com/s72817/MMM-PIR-Fade-HIDE) -- Modules are faded when being shown or hidden.
  * **[You Are Here]** <br> maxfarrior / [MMM-PIR-fade-hide-mod](https://github.io/maxfarrior/MMM-PIR-fade-hide-mod) -- Added logic to how long modules are displayed. Added monitor control.
