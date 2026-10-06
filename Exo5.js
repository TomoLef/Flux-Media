// Produire un flux vidéo (sans audio) et le diffuser
const constraints = { audio: false, video: true };
const video = document.querySelector("video");
const startButton = document.querySelector("#start");
const stopButton = document.querySelector("#stop");
const pauseButton = document.querySelector("#pause");
const fullscreenButton = document.querySelector("#fullscreen");
const trackInfo = document.querySelector("#track-info");
let stream = null;

function updateButtons() {
    const streaming = stream !== null;
    startButton.disabled = streaming;
    stopButton.disabled = !streaming;
    pauseButton.disabled = !streaming;
    fullscreenButton.disabled = !streaming || !document.fullscreenEnabled;
    pauseButton.textContent = video.paused ? "Reprendre" : "Mettre en pause";
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

startButton.addEventListener("click", startStream);
stopButton.addEventListener("click", stopStream);
pauseButton.addEventListener("click", async () => {
    if (video.paused) {
        await video.play();
    } else {
        video.pause();
    }
    updateButtons();
});
fullscreenButton.addEventListener("click", () => video.requestFullscreen());

video.addEventListener("pause", updateButtons);
video.addEventListener("play", updateButtons);
updateButtons();