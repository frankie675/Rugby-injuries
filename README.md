Rugby Injuries Detection System
This project is a web-based application designed to detect potential rugby injuries in real-time using a webcam feed and a machine learning model.
Project Description
The system utilises a Flask backend to serve a frontend built with HTML, CSS, and JavaScript. The core functionality involves using the Roboflow.js library to run an object detection model directly in the user's browser. When the model detects an "Injured Player" with a confidence level above a user-defined threshold, a visual notification appears on the screen. This notification includes an alert message and a freeze-frame image of the moment the potential injury was detected, showing the full frame with the bounding boxes. The user can then acknowledge the notification by clicking "Accept" or "Deny".
Technologies Used
Backend: Python (Flask)
Frontend:
HTML
CSS
JavaScript
Roboflow.js (for browser-based object detection)
Setup and Running
To set up and run this project, you will need Python and Flask installed. You will also need a Roboflow account and a trained object detection model for rugby injuries or another object detection model.
Using an Online Code System (like Replit, codepen, code sand box)
Online code systems like Replit provide an environment where you can run this project without installing Python and Flask locally.
Create a new Repl: Go to Replit and create a new Repl. Choose the Flask template.
Upload Project Files:
In the file explorer pane on the left, you should see main.py.
Create a new folder named templates. Upload index.html into the templates folder.
Create a new folder named static. Upload script.js and styles.css into the static folder.
Update Roboflow Model Details:
Open templates/index.html.
Replace "rf_vyajtOUts2Vy1F25DaeHReCEQKj2" with your Roboflow publishable key.
Update MODEL_NAME, MODEL_VERSION, and INJURED_PLAYER_CLASS to match your specific trained model. The INJURED_PLAYER_CLASS must exactly match the class name in your model's output (e.g., "Injured Player").
Run the Repl: Click the "Run" button at the top of the Replit interface. Replit will install the necessary dependencies (like Flask) and start the web server.
Access the Application: Replit will provide a web view of your running application. You may need to open it in a new tab for the webcam to work correctly.
Running Locally
Clone or download the project files: Ensure you have main.py, index.html, script.js, and styles.css. Place index.html in a templates folder and script.js and styles.css in a static folder, both in the same directory as main.py.
Install Flask: If you don't have Flask installed, you can install it using pip:
pip install Flask


Update Roboflow Model Details:
Open templates/index.html.
Replace "rf_vyajtOUts2Vy1F25DaeHReCEQKj2" with your Roboflow publishable key.
Update MODEL_NAME, MODEL_VERSION, and INJURED_PLAYER_CLASS to match your specific trained model. The INJURED_PLAYER_CLASS must exactly match the class name in your model's output (e.g., "Injured Player").
Run the Flask Application:
Open your terminal or command prompt.
Navigate to the directory where main.py is located.
Run the application using the command:
python main.py


Access the Application: Open your web browser and go to the address where the Flask application is running (usually http://127.0.0.1:5000/).
Features
Real-time Object Detection: Utilises the webcam feed to detect objects defined in the trained Roboflow model.
Bounding Boxes and Labels: Displays bounding boxes and class labels with confidence scores around detected objects on the video feed.
Adjustable Confidence Threshold: A slider allows users to set the minimum confidence level for detections to be displayed and trigger notifications.
Injury Detection Notification: When an object with the specified INJURED_PLAYER_CLASS is detected above the confidence threshold, a notification appears.
Freeze-Frame Image: The notification includes a static image of the canvas at the moment of detection, showing the video frame with all drawn bounding boxes.
User Interaction: "Accept" and "Deny" buttons allow the user to acknowledge the injury notification.
Credits
This project is based on concepts and tools provided by Roboflow.
