// Produire un flux vidéo (sans audio) et le diffuser
const constraints = { audio: false, video: true };
const video = document.querySelector("video");
const startButton = document.querySelector("#start");
const stopButton = document.querySelector("#stop");
const pauseButton = document.querySelector("#pause");
const fullscreenButton = document.querySelector("#fullscreen");
const trackInfo = document.querySelector("#track-info");
const startAudioButton = document.querySelector("#start-audio");
const stopAudioButton = document.querySelector("#stop-audio");
const pauseAudioButton = document.querySelector("#pause-audio");
const audioContainer = document.querySelector("#audio-video");
const audioVideo = document.createElement("audio");
const audioInfo = document.querySelector("#audio-info");
const photoButtonBlob = document.querySelector("#photoBlob");
const photoButtonFrame = document.querySelector("#photoFrame");
const canvas = document.querySelector("#canvas");
const downloadButtonBlob = document.querySelector("#downloadBlob");
const downloadButtonFrame = document.querySelector("#downloadFrame");
const img = document.querySelector("#photo");
audioContainer.appendChild(audioVideo);
let stream = null;
let audioStream = null;
let imageCapture = null;
let photoObjectUrl = null;
let frameDataUrl = null;

function updateButtons() {
    const streaming = stream !== null;
    startButton.disabled = streaming;
    stopButton.disabled = !streaming;
    pauseButton.disabled = !streaming;
    photoButtonBlob.disabled = !streaming;
    photoButtonFrame.disabled = !streaming;
    downloadButtonBlob.disabled = photoObjectUrl === null;
    downloadButtonFrame.disabled = frameDataUrl === null;
    fullscreenButton.disabled = !streaming || !document.fullscreenEnabled;
    const videoTrack = streaming ? stream.getVideoTracks()[0] : null;
    pauseButton.textContent = videoTrack && videoTrack.enabled
        ? "Désactiver la vidéo"
        : "Réactiver la vidéo";
}

function updateAudioButtons() {
    const audioStreaming = audioStream !== null;
    startAudioButton.disabled = audioStreaming;
    stopAudioButton.disabled = !audioStreaming;
    pauseAudioButton.disabled = !audioStreaming;
    const audioTrack = audioStreaming ? audioStream.getAudioTracks()[0] : null;
    pauseAudioButton.textContent = audioTrack && audioTrack.enabled
        ? "Désactiver le son"
        : "Réactiver le son";
}

function displayTrackInfo() {
    trackInfo.replaceChildren();

    stream.getTracks().forEach((track) => {
        const paragraph = document.createElement("p");
        const settings = track.getSettings();
        paragraph.textContent = `Type : ${track.kind} | Label : ${track.label}`;

        if (track.kind === "video") {
            paragraph.textContent += ` | Dimensions : ${settings.width} × ${settings.height}`
                + ` | Images par seconde : ${settings.frameRate ?? "inconnues"}`;
        }

        trackInfo.appendChild(paragraph);
    });
}

async function startStream() {
    try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        const videoTrack = stream.getVideoTracks()[0];
        imageCapture = typeof ImageCapture === "undefined"
            ? null
            : new ImageCapture(videoTrack);
        video.srcObject = stream;
        displayTrackInfo();
        await video.play();
        updateButtons();
    } catch (err) {
        stream = null;
        console.error(`${err.name}: ${err.message}`);
        updateButtons();
    }
}

async function startAudioStream() {
    try {
        audioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        audioVideo.srcObject = audioStream;
        await audioVideo.play();
        updateAudioButtons();
        displayAudioInfo();
    } catch (err) {
        audioStream = null;
        console.error(`${err.name}: ${err.message}`);
        updateAudioButtons();
        displayAudioInfo(`${err.name}: ${err.message}`);
    }
}

function stopStream() {
    if (stream === null) {
        return;
    }

    stream.getTracks().forEach((track) => track.stop());
    video.pause();
    video.srcObject = null;
    stream = null;
    imageCapture = null;
    if (photoObjectUrl !== null) {
        URL.revokeObjectURL(photoObjectUrl);
        photoObjectUrl = null;
    }
    frameDataUrl = null;
    trackInfo.replaceChildren();
    updateButtons();
}

function stopAudioStream() {
    if (audioStream === null) {
        return;
    }
    audioStream.getTracks().forEach((track) => track.stop());
    audioVideo.pause();
    audioVideo.srcObject = null;
    audioStream = null;
    updateAudioButtons();
    displayAudioInfo();
}

function toggleTracks(tracks) {
    const enabled = tracks.every((track) => track.enabled);
    tracks.forEach((track) => {
        track.enabled = !enabled;
    });
}

function displayAudioInfo(errorMessage = null) {
    audioInfo.replaceChildren();

    if (errorMessage !== null) {
        const paragraph = document.createElement("p");
        paragraph.textContent = `Flux audio indisponible : ${errorMessage}`;
        audioInfo.appendChild(paragraph);
    } else if (audioStream !== null) {
        audioStream.getTracks().forEach((track) => {
            const paragraph = document.createElement("p");
            paragraph.textContent = `Type : ${track.kind} | Label : ${track.label}`;
            audioInfo.appendChild(paragraph);
        });
    } else {
        const paragraph = document.createElement("p");
        paragraph.textContent = "Flux audio non-disponible.";
        audioInfo.appendChild(paragraph);
    }
}

function takePhotoBlob() {
    if (stream === null) {
        return;
    }
    if (imageCapture !== null) {
        imageCapture.takePhoto()
            .then(displayPhotoBlob)
            .catch((error) => console.error("takePhoto() error:", error));
        return;
    }

    const photoCanvas = document.createElement("canvas");
    photoCanvas.width = video.videoWidth;
    photoCanvas.height = video.videoHeight;
    photoCanvas.getContext("2d").drawImage(
        video,
        0,
        0,
        photoCanvas.width,
        photoCanvas.height
    );
    photoCanvas.toBlob((blob) => {
        if (blob !== null) {
            displayPhotoBlob(blob);
        }
    }, "image/jpeg");
}

function displayPhotoBlob(blob) {
    if (photoObjectUrl !== null) {
        URL.revokeObjectURL(photoObjectUrl);
    }
    photoObjectUrl = URL.createObjectURL(blob);
    img.src = photoObjectUrl;
    downloadButtonBlob.disabled = false;
}

function takePhotoFrame() {
    if (stream === null) {
        return;
    }
    if (imageCapture !== null) {
        imageCapture.grabFrame()
            .then((imageBitmap) => {
                canvas.width = imageBitmap.width;
                canvas.height = imageBitmap.height;
                canvas.getContext("2d").drawImage(imageBitmap, 0, 0);
                frameDataUrl = canvas.toDataURL("image/png");
                downloadButtonFrame.disabled = false;
                imageBitmap.close();
            })
            .catch((error) => console.error("grabFrame() error:", error));
        return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
    );
    frameDataUrl = canvas.toDataURL("image/png");
    downloadButtonFrame.disabled = false;
}

startAudioButton.addEventListener("click", startAudioStream);
stopAudioButton.addEventListener("click", stopAudioStream);
pauseAudioButton.addEventListener("click", () => {
    if (audioStream !== null) {
        toggleTracks(audioStream.getAudioTracks());
        updateAudioButtons();
        displayAudioInfo();
    }
});

startButton.addEventListener("click", startStream);
stopButton.addEventListener("click", stopStream);
pauseButton.addEventListener("click", () => {
    if (stream !== null) {
        toggleTracks(stream.getVideoTracks());
        updateButtons();
    }
});
fullscreenButton.addEventListener("click", () => video.requestFullscreen());
photoButtonBlob.addEventListener("click", takePhotoBlob);
photoButtonFrame.addEventListener("click", takePhotoFrame);
downloadButtonBlob.addEventListener("click", () => {
    if (photoObjectUrl === null) {
        return;
    }
    const link = document.createElement("a");
    link.href = photoObjectUrl;
    link.download = "photoBlob.png";
    link.click();
});
downloadButtonFrame.addEventListener("click", () => {
    if (frameDataUrl === null) {
        return;
    }
    const link = document.createElement("a");
    link.href = frameDataUrl;
    link.download = "photoFrame.png";
    link.click();
});

video.addEventListener("pause", updateButtons);
video.addEventListener("play", updateButtons);

audioVideo.addEventListener("pause", updateAudioButtons);
audioVideo.addEventListener("play", updateAudioButtons);

updateButtons();
updateAudioButtons();
displayAudioInfo();