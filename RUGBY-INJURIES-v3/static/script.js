// Rugby Injuries Detection System - Working script.js

var bounding_box_colors = {};
var user_confidence = 0.6;
var video = null;
var inferenceIntervalId = null; // Keep track of the interval for inference

// Bounding box colors - Using a fixed list for consistency
var color_choices = [
    "#C7FC00", "#FF00FF", "#8622FF", "#FE0056", "#00FFCE",
    "#FF8000", "#00B7EB", "#FFFF00", "#0E7AFE", "#FFABAB",
    "#0000FF", "#CCCCCC",
];
// Keep track of used colors to assign unique colors per class
var used_colors = {}; // This variable is not currently used but can be if needed for more complex color management

var canvas_painted = false;
// Get the canvas element that is already in the HTML
// We assume this canvas element is initially in the HTML and stays there.
var canvas = document.getElementById("video_canvas");
var ctx = canvas.getContext("2d");

const inferEngine = new inferencejs.InferenceEngine();
var modelWorkerId = null;
var isDetecting = false;
var animationFrameId = null;
var currentPredictions = []; // Store predictions for the currently displayed frame

// Function to draw the video frame and bounding boxes
function detectFrame() {
    // Only proceed if video element exists and is ready
    if (!video || video.readyState < 2) {
        // console.log("detectFrame: Video not ready or does not exist. Stopping loop until ready.");
        // Request the next frame if detection is active, even if video isn't ready yet,
        // to keep checking if it becomes ready.
         if (isDetecting || (!video || (!video.paused && !video.ended))) {
             animationFrameId = requestAnimationFrame(detectFrame);
         } else {
              console.log("detectFrame: Not detecting and video paused/ended. Stopping loop.");
              animationFrameId = null;
         }
        return;
    }

    // Clear canvas at the start of each frame draw
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the CURRENT video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Draw the bounding boxes from the last received predictions
    // These predictions correspond to a previous frame due to inference latency,
    // but drawing them on the current frame is standard for smooth display.
    drawBoundingBoxes(currentPredictions, ctx);

    // Request the next animation frame to keep the drawing loop running
    // Continue the loop as long as detection is active OR video is playing
    if (isDetecting || (!video.paused && !video.ended)) {
         animationFrameId = requestAnimationFrame(detectFrame);
    } else {
         console.log("detectFrame: Not detecting and video paused/ended. Stopping loop.");
         animationFrameId = null;
         // Optional: Clear canvas or show final frame here if needed after loop stops
         // ctx.clearRect(0, 0, canvas.width, canvas.height);
         // if (video.readyState >= 2) {
         //      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
         // }
         currentPredictions = []; // Clear predictions
    }
}

// Function to trigger inference for the current video frame
function runInference() {
    // Only run inference if the model is loaded and the video is playing and detection is active
    if (!modelWorkerId || !video || video.paused || video.ended || !isDetecting) {
        // console.log("runInference: Conditions not met. Skipping inference.");
        return;
    }

    try {
        // Submit the CURRENT video frame for inference
        inferEngine.infer(modelWorkerId, new inferencejs.CVImage(video))
            .then(function(predictions) {
                 // Store the predictions when they are ready
                currentPredictions = predictions;
                 // console.log("runInference: Received predictions:", predictions.length); // Too noisy

                // Position the canvas correctly the first time we get results
                if (!canvas_painted) {
                    // updateCanvasPosition(); // Removed call
                    canvas.style.zIndex = "10"; // Ensure canvas is above video
                    // video.style.display = "block"; // Should already be block
                    canvas_painted = true;

                    var loading = document.getElementById("loading");
                    loading.style.display = "none";
                }

                // No need to request next frame or draw here, detectFrame handles drawing.

            })
            .catch(function(err) {
                console.error("runInference: Inference error:", err);
                 currentPredictions = []; // Clear predictions on error
            });
    } catch (e) {
        console.error("runInference: Error during inference call:", e);
        currentPredictions = []; // Clear predictions on error
    }
    // Do NOT request next animation frame here. detectFrame handles the loop.
}


function drawBoundingBoxes(predictions, ctx) {
     // This function only draws boxes based on the provided predictions.
     // Clearing the canvas and drawing the video frame is done in detectFrame.

    for (var i = 0; i < predictions.length; i++) {
        var confidence = predictions[i].confidence;

        if (confidence < user_confidence) {
            continue;
        }

        // Assign consistent colors to classes
        if (!(predictions[i].class in bounding_box_colors)) {
             // Assign a new color if this class hasn't been seen before
             // Cycle through color_choices using a simple index or map
             let colorIndex = Object.keys(bounding_box_colors).length % color_choices.length;
             bounding_box_colors[predictions[i].class] = color_choices[colorIndex];
             // Optional: keep track of used colors if you want to ensure uniqueness across classes
             // used_colors[predictions[i].class] = true;
        }
        ctx.strokeStyle = bounding_box_colors[predictions[i].class];


        var prediction = predictions[i];
        var x = prediction.bbox.x - prediction.bbox.width / 2;
        var y = prediction.bbox.y - prediction.bbox.height / 2;
        var width = prediction.bbox.width;
        var height = prediction.bbox.height;

        // Draw the bounding box
        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.lineWidth = "4";
        ctx.strokeStyle = bounding_box_colors[prediction.class]; // Use assigned color
        ctx.stroke();

        // Draw the label background (optional, but improves readability)
        ctx.fillStyle = bounding_box_colors[prediction.class] + "B3"; // Add transparency
        var text = prediction.class + " " + Math.round(confidence * 100) + "%";
        ctx.font = "20px Arial"; // Smaller font
        var textMetrics = ctx.measureText(text);
        var textWidth = textMetrics.width;
        var textHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent; // More accurate height
        var padding = 5;

        // Ensure background is drawn within canvas bounds
         var bgX = Math.max(0, x);
         var bgY = Math.max(0, y - textHeight - padding * 2);
         var bgWidth = textWidth + padding * 2;
         var bgHeight = textHeight + padding * 2;

         // Adjust if background goes off the right edge
         if (bgX + bgWidth > canvas.width) {
             bgX = canvas.width - bgWidth;
         }
         // Adjust if background goes off the bottom edge
         if (bgY + bgHeight > canvas.height) {
              bgY = canvas.height - bgHeight;
         }
         // Adjust if background goes off the top edge
         if (bgY < 0) {
             bgY = 0;
         }


        ctx.fillRect(bgX, bgY, bgWidth, bgHeight);


        // Draw the label text
        ctx.fillStyle = "white"; // White text for readability
         var textDrawX = bgX + padding; // Position text relative to background
         var textDrawY = bgY + padding + textMetrics.actualBoundingBoxAscent; // Position text correctly within background

        ctx.fillText(text, textDrawX, textDrawY);
    }
}


function initializeModel() {
    var loading = document.getElementById("loading");
    loading.textContent = "Loading model...";
    loading.style.display = "block";

    // Load the Roboflow model
    return inferEngine.startWorker(MODEL_NAME, MODEL_VERSION, publishable_key, [{ scoreThreshold: CONFIDENCE_THRESHOLD }])
        .then((id) => {
            modelWorkerId = id;
            console.log("Model initialized with ID:", modelWorkerId);
            loading.textContent = "Model loaded. Upload a video.";
             // Do not start detection automatically here. Wait for video upload and play.
        })
        .catch(err => {
            console.error("Error initializing model:", err);
            loading.textContent = "Error loading model. Please refresh and try again.";
        });
}

function startDetection() {
    if (!isDetecting) { // Prevent starting multiple times
        console.log("Starting detection loop.");
        isDetecting = true;
        // Clear any previous predictions
        currentPredictions = [];
        // Start the animation frame loop for drawing
        animationFrameId = requestAnimationFrame(detectFrame);
        // Start the inference loop (will run periodically)
        // We'll use a timer for inference to avoid overwhelming the worker
        // Adjust the interval based on desired frame rate and model speed
        // For example, 100ms is ~10 frames per second
        inferenceIntervalId = setInterval(runInference, 100); // Run inference every 100ms
    }
}

function stopDetection() {
    if (isDetecting) { // Prevent stopping multiple times
        console.log("Stopping detection loop.");
        isDetecting = false;
        // Cancel the animation frame loop
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        // Cancel the inference interval
        if (inferenceIntervalId) {
            clearInterval(inferenceIntervalId);
            inferenceIntervalId = null;
        }
         // Clear predictions when stopping
         currentPredictions = [];
         // Optional: Clear canvas and redraw final frame if video is present and ended/paused
         if (video && video.readyState >= 2) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
         } else {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
         }
    }
}

function setupVideo(videoElement) {
    video = videoElement;

    // Set canvas drawing dimensions to match video's intrinsic size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

     // Set display dimensions for both video and canvas to be responsive
     // These styles should ideally be in CSS, but setting them here ensures consistency
    canvas.style.position = "absolute"; // Ensure canvas is positioned absolutely
    // canvas.style.top = "0"; // Removed explicit top positioning
    // canvas.style.left = "0"; // Removed explicit left positioning
    canvas.style.width = "100%"; // Match container width
    canvas.style.height = "100%"; // Match container height
    canvas.style.zIndex = "10"; // Ensure canvas is above video
    // Ensure canvas does not block pointer events to the video controls
    canvas.style.pointerEvents = "none";


    video.style.display = "block"; // Ensure video is a block element
    video.style.width = "100%"; // Match container width
    video.style.height = "100%"; // Match container height
    video.style.objectFit = "contain"; // Ensure video fits without stretching
    video.style.zIndex = "5"; // Below canvas


    // The canvas position and display size are now set relative to the parent container
    // and should match the video's display size due to both having width/height 100%
    // within a container that maintains aspect ratio.
    // updateCanvasPosition(); // Removed call as it's no longer needed for display size/position with 100% width/height

    // Make canvas visible
    canvas.style.display = "block";

    // Reset canvas transformation
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // Reset canvas painted flag
    canvas_painted = false;
     // Clear any previous predictions
     currentPredictions = [];
     // Reset colors
     bounding_box_colors = {};
     // used_colors = {}; // If you were tracking used colors


     // Clear any previous drawings
     ctx.clearRect(0, 0, canvas.width, canvas.height);
     // Draw the first frame (optional, will be drawn by detectFrame soon)
     if (video.readyState >= 2) {
         ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
     }


    // If model is not yet loaded, initialize it.
    // Otherwise, detection will start when the video plays.
    if (!modelWorkerId) {
        initializeModel()
            .then(() => {
                 // Model loaded, now wait for video play
                 console.log("Model loaded. Ready to play video.");
                 document.getElementById("loading").textContent = "Model loaded. Click play to start.";
            });
    } else {
         // Model already loaded. Wait for video play.
         document.getElementById("loading").textContent = "Model loaded. Click play to start.";
    }
}

// Function to update canvas position and display size to match video position and display size
// This function is simplified now that canvas/video use 100% width/height within container
// This function is no longer strictly necessary for basic positioning but can be used
// for fine-tuning if needed. Removing calls to it.
/*
function updateCanvasPosition() {
     if (video && canvas) {
         const videoRect = video.getBoundingClientRect();
         // Set canvas display size to match video's rendered size
         canvas.style.width = videoRect.width + "px";
         canvas.style.height = videoRect.height + "px";

         // Position canvas to exactly overlay the video
         canvas.style.top = videoRect.top + window.scrollY + "px";
         canvas.style.left = videoRect.left + window.scrollX + "px";

         // The canvas *drawing* dimensions (canvas.width, canvas.height) are set
         // in setupVideo based on the video's intrinsic size.
     }
}
*/


function handleVideoUpload(event) {
    var file = event.target.files[0];

    if (!file) return;

    // Check if file is a video
    if (!file.type.startsWith('video/')) {
        alert('Please upload a video file.');
        return;
    }

    var loading = document.getElementById("loading");
    loading.style.display = "block";
    loading.textContent = "Loading video...";

    // Stop current detection if running
    stopDetection();

    // Get the video container
    const videoContainer = document.querySelector(".infer-widget");

    // *** Preserve the canvas element ***
    const existingCanvas = document.getElementById("video_canvas");

    // *** Clear all content from the container EXCEPT the canvas ***
    // Create a temporary container to hold the canvas
    const tempContainer = document.createElement('div');
    if (existingCanvas) {
        tempContainer.appendChild(existingCanvas);
    }
    videoContainer.innerHTML = ''; // Clear the container

    // Append the preserved canvas back to the container
    if (existingCanvas) {
        videoContainer.appendChild(existingCanvas);
        // Re-get the context for the preserved canvas
        ctx = existingCanvas.getContext("2d");
        canvas = existingCanvas; // Ensure the global canvas variable points to the preserved one
    } else {
        // If for some reason the canvas was not in the HTML initially, create a new one
        canvas = document.createElement('canvas');
        canvas.id = 'video_canvas';
        videoContainer.appendChild(canvas);
        ctx = canvas.getContext("2d");
    }


    // Create a new video element
    const newVideo = document.createElement("video");
    newVideo.id = "video1"; // Assign the ID
    newVideo.controls = true; // Show video controls
    newVideo.setAttribute("playsinline", ""); // Necessary for some mobile browsers
    newVideo.loop = true; // Enable video looping

    // Append the new video element BEFORE the canvas in the container
    videoContainer.insertBefore(newVideo, canvas);


    // Set the global video variable to the new video element
    video = newVideo;


    // Set up the video with the uploaded file
    const fileURL = URL.createObjectURL(file);
    video.src = fileURL;

    loading.textContent = "Processing video...";

    // Add event listener for when video metadata is loaded (dimensions, duration available)
    video.addEventListener('loadedmetadata', function onLoadedMetadata() {
        // Remove this listener
        video.removeEventListener('loadedmetadata', onLoadedMetadata);

        console.log("Video metadata loaded. Dimensions:", video.videoWidth, video.videoHeight);
        console.log("Video networkState:", video.networkState);
        console.log("Video readyState:", video.readyState);


        // Setup canvas and video dimensions and initial state
        setupVideo(video);

         loading.textContent = "Video loaded. Click play to start detection.";

         // Attempt to play the video programmatically after metadata is loaded
         // This is often necessary due to browser autoplay policies
         video.play().then(() => {
             console.log("Programmatic video play successful.");
             // If programmatic play works, manually trigger the logic that would
             // normally happen on the 'play' event.
             console.log("Manually triggering startDetection after programmatic play.");
             // updateCanvasPosition(); // Removed call
             startDetection(); // Start detection loops
         }).catch(err => {
             console.error("Programmatic video play failed:", err);
             // If programmatic play fails, it's likely a browser restriction or issue.
             // The user will have to click play manually, but the event listener
             // might still not fire if controls are blocked.
             loading.textContent = "Video loaded. Autoplay blocked. Click play to start.";
         });


        // Add play/pause/ended event listeners to control detection
        video.addEventListener('play', () => {
            console.log("Video play event fired. Starting detection.");
            // Ensure canvas position is correct on play
             // updateCanvasPosition(); // Removed call
            startDetection(); // startDetection sets isDetecting = true and starts loops
        });

        video.addEventListener('pause', () => {
            console.log("Video pause event fired. Stopping detection.");
            stopDetection(); // stopDetection sets isDetecting = false and cancels loops
        });

         // The 'ended' event will still fire even with video.loop = true,
         // but the video will seek to the beginning and play again automatically.
         // The 'play' event will fire again after 'ended'.
         // We listen to potentially log or handle edge cases, but rely on 'play'/'pause'
         // to manage the detection state.
        video.addEventListener('ended', () => {
            console.log("Video ended event fired (and looping).");
            // stopDetection(); // No, the video is looping and will trigger 'play' again.
        });

         // Listen for resize events to reposition canvas (useful if container resizes)
         // window.addEventListener('resize', updateCanvasPosition); // Removed call

         // Also listen for the video's own resize event (can happen on metadata load or orientation change)
         // video.addEventListener('resize', updateCanvasPosition); // Removed call


    });

    // Error handling for video loading
    video.onerror = function() {
        console.error("Video error:", video.error);
        loading.textContent = "Error loading video. Try a different format.";
         // Ensure detection is stopped on error
         stopDetection();
         // Clear the canvas and predictions
         ctx.clearRect(0, 0, canvas.width, canvas.height);
         currentPredictions = [];
    };
}

function changeConfidence() {
    user_confidence = document.getElementById("confidence").value / 100;
     console.log("Confidence threshold set to:", user_confidence);
     // The next frame in the animation loop will use the updated confidence when drawing boxes.
}

// Create upload button and input field
function createUploadElements() {
    const settingsSection = document.getElementById("settings");

    // Create container for buttons (only upload button now)
    const buttonContainer = document.createElement("div");
    buttonContainer.style.marginTop = "20px";
    buttonContainer.style.display = "flex"; // Use flexbox
    buttonContainer.style.gap = "10px";
    buttonContainer.style.justifyContent = "center"; // Center the button
    buttonContainer.className = "button-container"; // Use the existing class

    // Create file input (hidden)
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.id = "videoUpload";
    fileInput.accept = "video/mp4,video/webm,video/quicktime"; // Specify accepted video types
    fileInput.style.display = "none"; // Hide the input field
    fileInput.addEventListener("change", handleVideoUpload);

    // Create upload button (label for the hidden file input)
    const uploadButton = document.createElement("button");
    uploadButton.innerText = "Upload Video";
    uploadButton.className = "styled-button styled-button-turqouise"; // Style the button
     // Associate button click with file input click
    uploadButton.addEventListener("click", function() {
        fileInput.click();
    });

    // Append elements
    buttonContainer.appendChild(uploadButton);
    settingsSection.appendChild(fileInput); // Keep input in settings, but hidden
    settingsSection.appendChild(buttonContainer); // Add the button container

    // Add format information
    const formatInfo = document.createElement("p");
    formatInfo.innerHTML = "<strong>Best formats:</strong> MP4, WebM (H.264 codec recommended)";
    formatInfo.style.fontSize = "12px";
    formatInfo.style.marginTop = "5px";
    formatInfo.style.textAlign = "center";
    settingsSection.appendChild(formatInfo);
}

// Initialize the application
document.addEventListener("DOMContentLoaded", function() {
    // Set up confidence slider
    document.getElementById("confidence").addEventListener("input", changeConfidence);
    // Trigger the confidence change initially to set the default value
    changeConfidence();

    // Create upload elements
    createUploadElements();

    // Initialize the model immediately on load
     initializeModel();

});
