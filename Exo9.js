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
const photoButton = document.querySelector("#photo");
const canvas = document.querySelector("#canvas");
const downloadButton = document.querySelector("#download");
audioContainer.appendChild(audioVideo);
let stream = null;
let audioStream = null;

function updateButtons() {
    const streaming = stream !== null;
    startButton.disabled = streaming;
    stopButton.disabled = !streaming;
    pauseButton.disabled = !streaming;
    photoButton.disabled = !streaming;
    downloadButton.disabled = true;
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

function takePhoto() {
    if (stream === null) {
        return;
    }
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    downloadButton.disabled = false;
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
photoButton.addEventListener("click", takePhoto);
downloadButton.addEventListener("click", () => {
    const link = document.createElement("a");
    link.href = canvas.toDataURL();
    link.download = "photo.png";
    link.click();
});

video.addEventListener("pause", updateButtons);
video.addEventListener("play", updateButtons);

audioVideo.addEventListener("pause", updateAudioButtons);
audioVideo.addEventListener("play", updateAudioButtons);

updateButtons();
updateAudioButtons();
displayAudioInfo();