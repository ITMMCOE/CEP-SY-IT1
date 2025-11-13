import os
import cv2
import numpy as np
import time
import shutil

FACE_DATA_DIR = os.path.expanduser("~/.priveasy_face_data")
MODEL_FILE = os.path.join(FACE_DATA_DIR, "face_model.yml")
CASCADE_PATH = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"

def capture_face_images(num_images=20, delay=1.0):
    if not os.path.exists(FACE_DATA_DIR):
        os.makedirs(FACE_DATA_DIR)

    face_cascade = cv2.CascadeClassifier(CASCADE_PATH)
    cap = cv2.VideoCapture(0)
    count = 0

    if not cap.isOpened():
        print("CRITICAL: Failed to open webcam. Is it in use by another app?")
        cap.release()
        return False

    print("Enrollment started.")
    print(f"You will be prompted to move/change your look for {num_images} photos.")
    print("Press 'q' to quit early.\n")

    while count < num_images:
        ret, frame = cap.read()
        if not ret:
            print("WARN: Cannot read frame. Retrying...")
            time.sleep(0.05)
            continue

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.3, minNeighbors=5)

        for (x, y, w, h) in faces:
            face_img = gray[y:y + h, x:x + w]
            count += 1
            filepath = f"{FACE_DATA_DIR}/face_{count}.jpg"
            cv2.imwrite(filepath, face_img)
            cv2.rectangle(frame, (x, y), (x + w, y + h), (255, 0, 0), 2)
            cv2.putText(frame,
                        f"Photo {count}/{num_images}",
                        (10, 30),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.75,
                        (0, 255, 0),
                        2)
            cv2.imshow("Capture Face", frame)
            print(f"Captured photo {count}. Please change expression/angle and wait {delay:.1f}s...")
            cv2.waitKey(1)
            time.sleep(delay)
            if count >= num_images:
                break

        cv2.imshow("Capture Face", frame)
        if cv2.waitKey(1) & 0xFF == ord("q"):
            print("Enrollment cancelled by user.")
            break

    cap.release()
    cv2.destroyAllWindows()
    
    if count < num_images:
        print(f"Enrollment incomplete. Only {count} images captured. Aborting.")
        return False
    
    print(f"Enrollment finished. {count} face images were saved to {FACE_DATA_DIR}.")
    return True

def train_face_recognizer():
    recognizer = cv2.face.LBPHFaceRecognizer_create()
    face_images = []
    labels = []

    if not os.path.exists(FACE_DATA_DIR):
        print("Error: No face images found for training.")
        return False

    for filename in os.listdir(FACE_DATA_DIR):
        if filename.endswith(".jpg"):
            img_path = os.path.join(FACE_DATA_DIR, filename)
            img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
            if img is None:
                continue
            face_images.append(img)
            labels.append(1)

    if len(face_images) == 0:
        print("Error: No valid face images found for training.")
        return False

    recognizer.train(face_images, np.array(labels, dtype=np.int32))
    recognizer.save(MODEL_FILE)
    print(f"Trained face model saved to {MODEL_FILE}")
    return True

def authenticate_face(threshold=45, timeout=10):
    if not os.path.exists(MODEL_FILE):
        print("Face recognition model not found. Please enroll first.")
        return False

    recognizer = cv2.face.LBPHFaceRecognizer_create()
    recognizer.read(MODEL_FILE)
    face_cascade = cv2.CascadeClassifier(CASCADE_PATH)
    cap = cv2.VideoCapture(0)

    print("Face authentication started. Look at the camera...\n"
          f"Authentication requires confidence < {threshold}.\n"
          f"This will time out in {timeout} seconds.\n"
          "Press 'q' to quit.")

    authenticated = False
    start_time = time.time()

    while True:
        ret, frame = cap.read()
        if not ret:
            continue
        
        if time.time() - start_time > timeout:
            print("Time out. Face authentication failed.")
            break

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.3, minNeighbors=5)

        for (x, y, w, h) in faces:
            face_img = gray[y : y + h, x : x + w]
            label, confidence = recognizer.predict(face_img)
            cv2.rectangle(frame, (x, y), (x + w, y + h), (255, 0, 0), 2)
            cv2.putText(
                frame,
                f"Conf: {confidence:.2f}",
                (x, y - 10),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.8,
                (0, 255, 0),
                2,
            )
            if confidence < threshold:
                authenticated = True

        cv2.imshow("Authenticate", frame)
        if cv2.waitKey(1) & 0xFF == ord("q") or authenticated:
            break

    cap.release()
    cv2.destroyAllWindows()
    if authenticated:
        print("Face authenticated successfully.")
    else:
        print("Face authentication failed.")
    return authenticated
    
def reset_face_data():
    if os.path.exists(FACE_DATA_DIR):
        shutil.rmtree(FACE_DATA_DIR)
        print(f"All face data in {FACE_DATA_DIR} deleted.")
    else:
        print("No face data to delete.")