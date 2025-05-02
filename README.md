<body>
    <h1>Rugby Injuries Detection System</h1>

    <h2>Project Description</h2>
    <p>The system utilises a Flask backend to serve a frontend built with HTML, CSS, and JavaScript. The core functionality involves using the Roboflow.js library to run an object detection model directly in the user's browser. When the model detects an an "Injured Player" with a confidence level above a user-defined threshold, a visual notification appears on the screen. This notification includes an alert message and a freeze-frame image of the moment the potential injury was detected, showing the full frame with the bounding boxes. The user can then acknowledge the notification by clicking "Accept" or "Deny".</p>

    <h2>Technologies Used</h2>
    <ul>
        <li><strong>Backend:</strong> Python (Flask)</li>
        <li><strong>Frontend:</strong>
            <ul>
                <li>HTML</li>
                <li>CSS</li>
                <li>JavaScript</li>
                <li>Roboflow.js (for browser-based object detection)</li>
            </ul>
        </li>
    </ul>

    <h2>Setup and Running</h2>
    <p>To set up and run this project, you will need Python and Flask installed. You will also need a Roboflow account and a trained object detection model for rugby injuries or another object detection model.</p>

    <h3>Using an Online Code System (like Replit, codepen, code sand box)</h3>
    <p>Online code systems like Replit provide an environment where you can run this project without installing Python and Flask locally.</p>
    <ol>
        <li><strong>Create a new Repl:</strong> Go to <a href="https://replit.com/">Replit</a> and create a new Repl. Choose the <strong>Flask</strong> template.</li>
        <li><strong>Upload Project Files:</strong>
            <ul>
                <li>In the file explorer pane on the left, you should see <code>main.py</code>.</li>
                <li>Create a new folder named <code>templates</code>. Upload <code>index.html</code> into the <code>templates</code> folder.</li>
                <li>Create a new folder named <code>static</code>. Upload <code>script.js</code> and <code>styles.css</code> into the <code>static</code> folder.</li>
            </ul>
        </li>
        <li><strong>Update Roboflow Model Details:</strong>
            <ul>
                <li>Open <code>templates/index.html</code>.</li>
                <li>Replace <code>"rf_vyajtOUts2Vy1F25DaeHReCEQKj2"</code> with your Roboflow publishable key.</li>
                <li>Update <code>MODEL_NAME</code>, <code>MODEL_VERSION</code>, and <code>INJURED_PLAYER_CLASS</code> to match your specific trained model. The <code>INJURED_PLAYER_CLASS</code> must exactly match the class name in your model's output (e.g., <code>"Injured Player"</code>).</li>
            </ul>
        </li>
        <li><strong>Run the Repl:</strong> Click the "Run" button at the top of the Replit interface. Replit will install the necessary dependencies (like Flask) and start the web server.</li>
        <li><strong>Access the Application:</strong> Replit will provide a web view of your running application. You may need to open it in a new tab for the webcam to work correctly.</li>
    </ol>

    <h3>Running Locally</h3>
    <ol>
        <li><strong>Clone or download the project files:</strong> Ensure you have <code>main.py</code>, <code>index.html</code>, <code>script.js</code>, and <code>styles.css</code>. Place <code>index.html</code> in a <code>templates</code> folder and <code>script.js</code> and <code>styles.css</code> in a <code>static</code> folder, both in the same directory as <code>main.py</code>.</li>
        <li><strong>Install Flask:</strong> If you don't have Flask installed, you can install it using pip:
            <pre><code class="language-bash">pip install Flask</code></pre>
        </li>
        <li><strong>Update Roboflow Model Details:</strong>
            <ul>
                <li>Open <code>templates/index.html</code>.</li>
                <li>Replace <code>"rf_vyajtOUts2Vy1F25DaeHReCEQKj2"</code> with your Roboflow publishable key.</li>
                <li>Update <code>MODEL_NAME</code>, <code>MODEL_VERSION</code>, and <code>INJURED_PLAYER_CLASS</code> to match your specific trained model. The <code>INJURED_PLAYER_CLASS</code> must exactly match the class name in your model's output (e.g., <code>"Injured Player"</code>).</li>
            </ul>
        </li>
        <li><strong>Run the Flask Application:</strong>
            <ul>
                <li>Open your terminal or command prompt.</li>
                <li>Navigate to the directory where <code>main.py</code> is located.</li>
                <li>Run the application using the command:
                    <pre><code class="language-bash">python main.py</code></pre>
                </li>
            </ul>
        </li>
        <li><strong>Access the Application:</strong> Open your web browser and go to the address where the Flask application is running (usually <code>http://127.0.0.1:5000/</code>).</li>
    </ol>

    <h2>Features</h2>
    <ul>
        <li><strong>Real-time Object Detection:</strong> Utilises the webcam feed to detect objects defined in the trained Roboflow model.</li>
        <li><strong>Bounding Boxes and Labels:</strong> Displays bounding boxes and class labels with confidence scores around detected objects on the video feed.</li>
        <li><strong>Adjustable Confidence Threshold:</strong> A slider allows users to set the minimum confidence level for detections to be displayed and trigger notifications.</li>
        <li><strong>Injury Detection Notification:</strong> When an object with the specified <code>INJURED_PLAYER_CLASS</code> is detected above the confidence threshold, a notification appears.</li>
        <li><strong>Freeze-Frame Image:</strong> The notification includes a static image of the canvas at the moment of detection, showing the video frame with all drawn bounding boxes.</li>
        <li><strong>User Interaction:</strong> "Accept" and "Deny" buttons allow the user to acknowledge the injury notification.</li>
    </ul>

    <h2>Credits</h2>
    <p>This project is based on concepts and tools provided by <a href="https://roboflow.com/">Roboflow</a>.</p>

</body>
</html>
