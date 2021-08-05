const video = document.getElementById('video-canvas')
const TURN_THRESHOLD = 160; // Assume we are on course
const HEIGHT_THRESHOLD = 190;
const videoCanvas = document.getElementById('video-canvas');
const url = 'ws://' + document.location.hostname + ':3001/stream';
const player = new JSMpeg.Player(url, {canvas: videoCanvas, disableGl: true, onLoad: doTheMagic});

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models')
])


function getPositiveDifference(a, b) {
    return Math.abs(a - b);
}

function parseNextDirection(detection) {

    detection = {...detection};

    let actions = {
        rotateDegrees: 0,
        heightCorrection: 0,
        other: ''
    }
    if (!detection) {
        return actions;
    }
    if (!detection[0]) {
        return actions;
    }
    if (!detection[0].alignedRect) {
        return actions;
    }
    const x = detection[0].alignedRect._box._x;
    const y = detection[0].alignedRect._box._y;


    const center = {}
    center.x = 960 / 2;
    center.y = 720 / 2;


    if (x < center.x) {
        // turn left
        console.log('diff left: ' + getPositiveDifference(x, center.x));
        if (getPositiveDifference(x, center.x) > TURN_THRESHOLD) {
            actions.rotateDegrees = -30;
        }
    }
    if (x > center.x) {
        // turn right
        console.log('diff right: ' + getPositiveDifference(x, center.x));

        if (getPositiveDifference(x, center.x) > TURN_THRESHOLD) {
            actions.rotateDegrees = 30
        }
    }

    if (y > center.y) {
        // move down
        console.log('diff mv down: ' + getPositiveDifference(y, center.y))
        if (getPositiveDifference(y, center.y) > HEIGHT_THRESHOLD) {
            actions.heightCorrection = -30 + getPositiveDifference(y, center.y) * 0.10;
        }

    }

    if (y < center.y) {
        console.log('diff mv up: ' + getPositiveDifference(y, center.y))

        if (getPositiveDifference(y, center.y) > HEIGHT_THRESHOLD) {
            actions.heightCorrection = + 30 + getPositiveDifference(y, center.y) * 0.10;;
        }
    }

    if (actions.heightCorrection > 0) {
        if (actions.heightCorrection < 20) {
            actions.heightCorrection = 0;
        }
    }
    if (actions.heightCorrection < 0) {
        if (actions.heightCorrection > -20) {
            actions.heightCorrection = 0;
        }
    }

    if (actions.rotateDegrees > 0) {
        if (actions.rotateDegrees < 1) {
            actions.rotateDegrees = 0;
        }
    }

    if (actions.rotateDegrees < 0) {
        if (actions.rotateDegrees > -1) {
            actions.rotateDegrees = 0;
        }
    }
    console.log(actions);
    return actions;
}


function sendActionsToServer(actions) {
    if (actions.heightCorrection === 0 && actions.rotateDegrees === 0) {
        return;
    }
    const xhr = new XMLHttpRequest();
    xhr.open("POST", 'http://localhost:3000/actions', false);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(actions));
}

function landDrone() {
    let actions = {
        rotateDegrees: NaN,
        heightCorrection: NaN,
        other: 'LND'
    }
    sendActionsToServer(actions);
    player.stop();
}

function takeOffDrone() {
    console.log('called')
    let actions = {
        rotateDegrees: NaN,
        heightCorrection: NaN,
        other: 'TO'
    }
    sendActionsToServer(actions);
}

function doTheMagic() {
    //const canvas = faceapi.createCanvasFromMedia(video)

    const canvas = document.getElementById('detection-canvas');
    const displaySize = {width: videoCanvas.width, height: videoCanvas.height}
    console.log(videoCanvas.height)
    canvas.offsetHeight = videoCanvas.offsetHeight;
    canvas.offsetWidth = videoCanvas.offsetWidth;
    canvas.style.width = '960';
    canvas.style.height = '720';
    canvas.style.top = videoCanvas.style.top;
    faceapi.matchDimensions(canvas, displaySize)
    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(videoCanvas, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
        const resizedDetections = faceapi.resizeResults(detections, displaySize)
        const actions = parseNextDirection(detections);
        sendActionsToServer(actions)
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
        faceapi.draw.drawDetections(canvas, resizedDetections)
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
    }, 100)
}

setTimeout(doTheMagic, 5000)