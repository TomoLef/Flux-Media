// Produire un flux vidéo (sans audio) et le diffuser
const constraints = { audio: false, video: true };
let video = document.querySelector("video");
navigator.mediaDevices.getUserMedia(constraints)
    .then((stream) => {
        stream.getTracks().forEach((track) => {
            console.log("Type :", track.kind);
            console.log("Label :", track.label);
            console.log("Identifiant :", track.id);
            console.log("Valeurs acceptées :", track.getCapabilities());
            console.log("Valeurs courantes :", track.getSettings());
        });

        // Diffuser le flux
        video.srcObject = stream;
        video.onloadedmetadata = (e) => {
            if (video.hasAttribute('width')) {
                const width = video.getAttribute('width');
                const height = width * video.videoHeight / video.videoWidth;
                video.setAttribute('height',height);
            }
            else if (video.hasAttribute('height')) {
                const height = video.getAttribute('height');
                const width = height * video.videoWidth / video.videoHeight;
                video.setAttribute('width', width);
            }
            video.play();
        };
    })
    .catch((err) => {
        console.error(`${err.name}: ${err.message}`);
    });