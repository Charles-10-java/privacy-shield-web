import cv2
import mediapipe as mp
import time

# Initialize MediaPipe Face Detection
mp_face_detection = mp.solutions.face_detection
mp_drawing = mp.solutions.drawing_utils

def send_ble_command(command):
    # For testing, we just print the BLE command. 
    # In a real app, this would use 'bleak' to send via Bluetooth to the ESP32.
    print(f"[BLE TX] -> {command}")

def main():
    # Start Video Capture (0 is the default laptop/desktop webcam)
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        print("Error: Could not open webcam.")
        return

    # min_detection_confidence: 0.6 prevents false positives while tracking well
    with mp_face_detection.FaceDetection(
        model_selection=0, min_detection_confidence=0.6) as face_detection:
        
        print("PrivacyShield AI Monitor Started. Press 'q' to quit.")
        
        is_protected = False
        last_protection_state = False
        
        while cap.isOpened():
            success, image = cap.read()
            if not success:
                print("Ignoring empty camera frame.")
                continue

            # Convert BGR to RGB for MediaPipe
            image.flags.writeable = False
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            results = face_detection.process(image_rgb)

            # Draw the face detection annotations on the image.
            image.flags.writeable = True
            
            num_faces = 0
            
            if results.detections:
                num_faces = len(results.detections)
                
                # Logic to determine "Owner" vs "Surfer"
                # If we see MORE THAN 1 face, we have a shoulder surfer!
                for detection in results.detections:
                    mp_drawing.draw_detection(image, detection)
                    
            if num_faces > 1:
                is_protected = True
                status_color = (0, 0, 255) # Red for danger
                status_text = f"SURFER DETECTED! Faces: {num_faces}"
            elif num_faces == 1:
                is_protected = False
                status_color = (0, 255, 0) # Green for safe
                status_text = "Safe. Owner only."
            else:
                is_protected = False
                status_color = (255, 255, 0) # Cyan for no face
                status_text = "No one detected."

            # If the state changed, send a BLE command to the IoT hardware
            if is_protected != last_protection_state:
                if is_protected:
                    send_ble_command("LOUVER_DEPLOY")
                else:
                    send_ble_command("LOUVER_RETRACT")
                last_protection_state = is_protected
                
            # Draw UI overlay
            cv2.rectangle(image, (0, 0), (450, 40), (0, 0, 0), -1)
            cv2.putText(image, status_text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.8, status_color, 2)
            
            if is_protected:
                # Add a strong red border to indicate active protection
                cv2.rectangle(image, (0, 0), (image.shape[1], image.shape[0]), (0, 0, 255), 10)

            # Show the image
            cv2.imshow('PrivacyShield AI Monitor', image)

            # Press 'q' to exit
            if cv2.waitKey(5) & 0xFF == ord('q'):
                break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == '__main__':
    main()
