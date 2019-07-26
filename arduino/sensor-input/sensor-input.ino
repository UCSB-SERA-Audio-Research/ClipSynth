#include <WebUSB.h>

/**
 * Creating an instance of WebUSBSerial will add an additional USB interface to
 * the device that is marked as vendor-specific (rather than USB CDC-ACM) and
 * is therefore accessible to the browser.
 *
 * The URL here provides a hint to the browser about what page the user should
 * navigate to to interact with the device.
 */
WebUSB WebUSBSerial(1, "https://ucsb-sera-audio-research.github.io/ClipSynth/");

#define Serial WebUSBSerial // connect WebUSB to the Serial output.

const int sensorPin = A0; // Specify your pin for the sensor input.

void setup() {
  while (!Serial) {
    ; // wait for the serial connection.
  }
  Serial.begin(9600); // begin the connection.
  pinMode(sensorPin, INPUT); // enter pin mode for sensor inputs.
}

void loop() {
  if (Serial) {
    int sensorADC = analogRead(sensorPin); // read the sensor value.
    // Map the 0-1023 value to 0-40
    float scaled = sensortADC / 1023.0; // scale the value to a float between 0 and 1.
    Serial.println(scaled); // send the data to WebUSB.
    Serial.flush();
  }
}
