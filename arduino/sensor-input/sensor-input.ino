#include <WebUSB.h>

/**
 * Creating an instance of WebUSBSerial will add an additional USB interface to
 * the device that is marked as vendor-specific (rather than USB CDC-ACM) and
 * is therefore accessible to the browser.
 *
 * The URL here provides a hint to the browser about what page the user should
 * navigate to to interact with the device.
 */
WebUSB WebUSBSerial(1 /* https:// */, "https://trusting-ritchie-7760ae.netlify.com/");

#define Serial WebUSBSerial

const int SOFT_POT_PIN = A0;

void setup() {
  while (!Serial) {
    ;
  }
  Serial.begin(9600);
  pinMode(SOFT_POT_PIN, INPUT);
}

void loop() {
  if (Serial) {
    int softPotADC = analogRead(SOFT_POT_PIN);
    // Map the 0-1023 value to 0-40
    float scaled = softPotADC / 1023.0;
    Serial.println(scaled);
    Serial.flush();
  }
}
