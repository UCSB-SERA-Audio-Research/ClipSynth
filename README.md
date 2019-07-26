# ClipSynth
Convert any audio clip into a synthetic instrument!

## Execution
Simply open [index.html](https://ucsb-sera-audio-research.github.io/ClipSynth/) in your browser!

## Connecting Sensors

### Compatibility
WebUSB requires an Arduino model that gives the sketch complete control over the USB hardware. The program is compatible with the following controllers:
 * Arduino Leonardo
 * Arduino/Genuino Micro
 * Arduino/Genuino Zero
 * Arduino MKR1000
 * Arduino MKRZero
 * Arduino MKRFox1200
 * Adafruit Feather 32u4
 * Adafruit ItsyBitsy 32u4

### Setup
1. Install at least version 1.6.11 of the [Arduino IDE](https://www.arduino.cc/en/Main/Software).

2. The WebUSB library provides all the extra low-level USB code necessary for WebUSB support except for one thing: Your device must be upgraded from USB 2.0 to USB 2.1. To do this go into the SDK installation directory and open `hardware/arduino/avr/cores/arduino/USBCore.h`. Then find the line `#define USB_VERSION 0x200` and change `0x200` to `0x210`. That's it!

    **macOS:** Right click on the Ardunio application icon and then click on show package contents menu item. Navigate to `Contents/Java/hardware/arduino/avr/cores/arduino/USBCore.h`

    **Warning:** Windows requires USB 2.1 devices to present a Binary Object Store (BOS) descriptor when they are enumerated. The code to support this is added by including the "WebUSB" library in your sketch. If you do not include this library after making this change to the SDK then Windows will no longer be able to recognize your device and you will not be able to upload new sketches to it.

3. Copy (or symlink) the `library/WebUSB` directory from [this repository](https://github.com/webusb/arduino) into the `libraries` folder in your sketchbooks directory.

4. Launch the Arduino IDE. You should see "WebUSB" as an option under "Sketch > Include Library".

5. Copy the code from ``arduino/sensor-input/sensor-input.ino`` into your editor.

6. Go to [https://ucsb-sera-audio-research.github.io/ClipSynth/](https://ucsb-sera-audio-research.github.io/ClipSynth/), and try it out!

### Customization
``arduino/sensor-input/sensor-input.ino`` includes comments for help setting up your own sensor. 
> All data sent to WebUSB must be a float value between 0 and 1. If the values are outside this range, ClipSynth may encounter unexpected issues.