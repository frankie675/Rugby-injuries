// To display predictions, this app has:
// 1. A video that shows a feed from the user's webcam
// 2. A canvas that appears over the video and shows predictions
// When the page loads, a user is asked to give webcam permission.
// After this happens, the model initializes and starts to make predictions
// On the first prediction, an initialiation step happens in detectFrame()
// to prepare the canvas on which predictions is displayed.

var bounding_box_colors = {};

var user_confidence = 0.6; // Initial confidence threshold

// Update the colors in this list to set the bounding box colors
var color_choices = [
  "#C7FC00",
  "#FF00FF",
  "#8622FF",
  "#FE0056",
  "#00FFCE",
  "#FF8000",
  "#00B7EB",
  "#FFFF00",
  "#0E7AFE",
  "#FFABAB",
  "#0000FF",
  "#CCCCCC",
];

var canvas_painted = false;
var canvas = document.getElementById("video_canvas");
var ctx = canvas.getContext("2d");

const inferEngine = new inferencejs.InferenceEngine();
var modelWorkerId = null;

// Get the notification elements
const notificationArea = document.getElementById("notification-area");
const detectionIndicator = document.getElementById("detection-indicator");
const detectedPlayerImage = document.getElementById("detected-player-image");
const acceptButton = document.getElementById("accept-injury");
const denyButton = document.getElementById("deny-injury"); // Corrected typo here

// State variable to track if a notification is currently active
let isNotificationActive = false;

// Add event listeners for the notification buttons
acceptButton.addEventListener("click", handleAcceptInjury);
denyButton.addEventListener("click", handleDenyInjury);

function handleAcceptInjury() {
    console.log("Injury accepted.");
    hideNotification();
    // Add any further logic for accepting an injury here (e.g., logging)
}

function handleDenyInjury() {
    console.log("Injury denied.");
    hideNotification();
    // Add any further logic for denying an injury here (e.g., ignoring this detection)
}

function showNotification(prediction) {
    detectionIndicator.textContent = `Alert: Potential injury detected! (${Math.round(prediction.confidence * 100)}%)`;
    // Capture and display the entire canvas frame with bounding boxes
    // The canvas now contains the video frame AND the bounding boxes
    detectedPlayerImage.src = captureCanvasFrame(canvas);
    notificationArea.classList.remove('hidden');
    isNotificationActive = true;
    console.log("Notification shown for injured player.");
}

function hideNotification() {
    notificationArea.classList.add('hidden');
    detectionIndicator.textContent = "";
    detectedPlayerImage.src = "";
    isNotificationActive = false;
    console.log("Notification hidden.");
}


function detectFrame() {
  // On first run, initialize a canvas
  // On all runs, run inference using a video frame
  // For each video frame, draw bounding boxes on the canvas
  if (!modelWorkerId) return requestAnimationFrame(detectFrame);

  inferEngine.infer(modelWorkerId, new inferencejs.CVImage(video)).then(function(predictions) {

    if (!canvas_painted) {
      var video_start = document.getElementById("video1");

      canvas.top = video_start.top;
      canvas.left = video_start.left;
      canvas.style.top = video_start.top + "px";
      canvas.style.left = video_start.left + "px";
      canvas.style.position = "absolute";
      video_start.style.display = "block";
      canvas.style.display = "absolute";
      canvas_painted = true;

      var loading = document.getElementById("loading");
      loading.style.display = "none";
    }
    requestAnimationFrame(detectFrame);
    // Clear the canvas at the beginning of each frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the current video frame onto the canvas
    if (video && video.readyState === 4) { // Check if video is ready
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }


    if (video) {
      drawBoundingBoxes(predictions, ctx)
    }
  });
}

function drawBoundingBoxes(predictions, ctx) {
  // For each prediction, choose or assign a bounding box color choice,
  // then apply the requisite scaling so bounding boxes appear exactly
  // around a prediction.

  // If you want to do anything with predictions, start from this function.
  // For example, you could display them on the web page, check off items on a list,
  // or store predictions somewhere.

  let injuredPlayerDetectedInFrame = false; // Flag to track if an injured player is detected in this frame
  let firstInjuredPlayerPrediction = null; // Store the first injured player prediction in the frame

  // console.log("Drawing bounding boxes. Number of predictions:", predictions.length); // Log prediction count

  for (var i = 0; i < predictions.length; i++) {
    var confidence = predictions[i].confidence;

    // Only process predictions that meet the user's confidence threshold
    if (confidence < user_confidence) {
      continue;
    }

    // Assign or get bounding box color
    if (predictions[i].class in bounding_box_colors) {
      ctx.strokeStyle = bounding_box_colors[predictions[i].class];
    } else {
      var color =
        color_choices[Math.floor(Math.random() * color_choices.length)];
      ctx.strokeStyle = color;
      // remove color from choices to ensure unique colors
      color_choices.splice(color_choices.indexOf(color), 1);

      bounding_box_colors[predictions[i].class] = color;
    }

    var prediction = predictions[i];
    // Adjust bounding box coordinates for drawing on the canvas
    var x = prediction.bbox.x - prediction.bbox.width / 2;
    var y = prediction.bbox.y - prediction.bbox.height / 2;
    var width = prediction.bbox.width;
    var height = prediction.bbox.height;

    ctx.rect(x, y, width, height);

    ctx.fillStyle = "rgba(0, 0, 0, 0)"; // Transparent fill
    ctx.fill();

    ctx.fillStyle = ctx.strokeStyle; // Use the bounding box color for text
    ctx.lineWidth = "4";
    ctx.strokeRect(x, y, width, height); // Draw the bounding box rectangle
    ctx.font = "25px Arial"; // Set font for text
    // Draw the class name and confidence above the bounding box
    ctx.fillText(prediction.class + " " + Math.round(confidence * 100) + "%", x, y - 10);


    // Check if the detected class is the injured player class (defined in index.html)
    if (predictions[i].class === INJURED_PLAYER_CLASS) {
        injuredPlayerDetectedInFrame = true;
        // Store the first injured player prediction found in this frame
        if (!firstInjuredPlayerPrediction) {
            firstInjuredPlayerPrediction = prediction;
        }
    }
  }

  // Handle notification based on detection and current notification state
  if (injuredPlayerDetectedInFrame && !isNotificationActive) {
      // Only show a new notification if an injured player is detected
      // and no notification is currently active
      showNotification(firstInjuredPlayerPrediction);
  } else if (!injuredPlayerDetectedInFrame && !isNotificationActive) {
      // If no injured player is detected and no notification is active,
      // ensure the notification area is hidden (it should already be, but this is a safeguard)
      hideNotification();
  }
  // If an injured player is detected AND a notification is active, do nothing (wait for user interaction)
  // If no injured player is detected BUT a notification is active, do nothing (wait for user interaction)

}

// Function to capture the entire canvas content as an image
function captureCanvasFrame(canvasElement) {
    const dataURL = canvasElement.toDataURL('image/jpeg');
    // console.log("Captured canvas data URL length:", dataURL.length); // Log the length of the data URL
    return dataURL; // Returns a data URL
}


function webcamInference() {
  // Ask for webcam permissions, then run main application.
  var loading = document.getElementById("loading");
  loading.style.display = "block";
  console.log("Requesting webcam permissions..."); // Log webcam request

  navigator.mediaDevices
    .getUserMedia({ video: { facingMode: "environment" } })
    .then(function(stream) {
      console.log("Webcam stream received."); // Log successful stream
      video = document.createElement("video");
      video.srcObject = stream;
      video.id = "video1";

      // hide video until the web stream is ready
      video.style.display = "none";
      video.setAttribute("playsinline", "");

      document.getElementById("video_canvas").after(video);

      video.onloadedmetadata = function() {
        video.play();
        console.log("Video metadata loaded and playing."); // Log video playing
      }

      // on full load, set the video height and width
      video.onplay = function() {
        height = video.videoHeight;
        width = video.videoWidth;

        // scale down video by 0.75

        video.width = width;
        video.height = height;
        video.style.width = 640 + "px";
        video.style.height = 480 + "px";

        canvas.style.width = 640 + "px";
        canvas.style.height = 480 + "px";
        canvas.width = width;
        canvas.height = height;

        document.getElementById("video_canvas").style.display = "block";
        console.log("Video and canvas dimensions set."); // Log dimensions set
      };

      ctx.scale(1, 1);

      // Load the Roboflow model using the publishable_key set in index.html
      // and the model name and version set at the top of this file
      console.log(`Starting inference worker for model ${MODEL_NAME} v${MODEL_VERSION}...`); // Log model loading
      inferEngine.startWorker(MODEL_NAME, MODEL_VERSION, publishable_key, [{ scoreThreshold: CONFIDENCE_THRESHOLD }])
        .then((id) => {
          modelWorkerId = id;
          console.log("Inference worker started with ID:", modelWorkerId); // Log worker ID
          // Start inference
          detectFrame();
        })
        .catch(function(error) {
            console.error("Error starting inference worker:", error); // Log worker error
        });
    })
    .catch(function(err) {
      console.error("Error accessing webcam:", err); // Log webcam access error
    });
}

function changeConfidence () {
  user_confidence = document.getElementById("confidence").value / 100;
  console.log("Confidence threshold changed to:", user_confidence); // Log confidence change
}

document.getElementById("confidence").addEventListener("input", changeConfidence);

webcamInference();
