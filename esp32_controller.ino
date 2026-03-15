#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include <ESP32Servo.h>

// BLE UUIDs for the PrivacyShield Service
#define SERVICE_UUID           "6E400001-B5A3-F393-E0A9-E50E24DCCA9E" // Service UUID
#define CHARACTERISTIC_UUID_RX "6E400002-B5A3-F393-E0A9-E50E24DCCA9E" // Receiver UUID

Servo louverServo;
// Recommended GPIO pin for Servo on ESP32
const int servoPin = 18; 

// Servo angles
const int ANGLE_OPEN = 0;   // Retracted / normal viewing angle
const int ANGLE_CLOSED = 90; // Deployed / privacy filter angle

BLEServer *pServer = NULL;
BLECharacteristic * pRxCharacteristic;
bool deviceConnected = false;
bool oldDeviceConnected = false;

// Callback for connection events
class MyServerCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
      deviceConnected = true;
      Serial.println("Device connected.");
    };

    void onDisconnect(BLEServer* pServer) {
      deviceConnected = false;
      Serial.println("Device disconnected.");
    }
};

// Callback for receiving data from the App/Python Client
class MyCallbacks: public BLECharacteristicCallbacks {
    void onWrite(BLECharacteristic *pCharacteristic) {
      String rxValue = pCharacteristic->getValue().c_str();

      if (rxValue.length() > 0) {
        Serial.print("Received Command: ");
        Serial.println(rxValue);

        if (rxValue.indexOf("LOUVER_DEPLOY") != -1) {
          Serial.println("Action: Deploying Louver Film");
          louverServo.write(ANGLE_CLOSED);
        }
        else if (rxValue.indexOf("LOUVER_RETRACT") != -1) {
          Serial.println("Action: Retracting Louver Film");
          louverServo.write(ANGLE_OPEN);
        }
      }
    }
};

void setup() {
  Serial.begin(115200);
  
  // Attach the servo
  // ESP32Servo uses different timers, requires allocation
  ESP32PWM::allocateTimer(0);
  ESP32PWM::allocateTimer(1);
  ESP32PWM::allocateTimer(2);
  ESP32PWM::allocateTimer(3);
  louverServo.setPeriodHertz(50);      // Standard 50hz servo
  louverServo.attach(servoPin, 500, 2400); 
  
  // Initial state: Open
  louverServo.write(ANGLE_OPEN);

  // Initialize BLE
  BLEDevice::init("PrivacyShield_Ctrl");
  
  // Create BLE Server
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  // Create BLE Service
  BLEService *pService = pServer->createService(SERVICE_UUID);

  // Create BLE Characteristic for Receiving Data (RX)
  pRxCharacteristic = pService->createCharacteristic(
                      CHARACTERISTIC_UUID_RX,
                      BLECharacteristic::PROPERTY_WRITE
                    );

  pRxCharacteristic->setCallbacks(new MyCallbacks());

  // Start the service
  pService->start();

  // Start advertising
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(true);
  pAdvertising->setMinPreferred(0x06);  // helps with iPhone connections issue
  pAdvertising->setMinPreferred(0x12);
  BLEDevice::startAdvertising();
  
  Serial.println("Waiting for client connection via BLE...");
}

void loop() {
  // Disconnect handler
  if (!deviceConnected && oldDeviceConnected) {
      delay(500); // give the bluetooth stack a chance
      pServer->startAdvertising(); // restart advertising
      Serial.println("Restarted Advertising");
      oldDeviceConnected = deviceConnected;
  }
  // Connect handler
  if (deviceConnected && !oldDeviceConnected) {
      // Ready state after connection
      oldDeviceConnected = deviceConnected;
  }
}
