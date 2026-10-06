// Produire un flux vidéo
const constraints = { audio: false, video: true };
navigator.mediaDevices.getUserMedia(constraints)
    .then((stream) => { /* utiliser le flux */ })
    .catch((err) => { /* gérer les erreurs */ });

// Produire un flux vidéo (sans audio) et le diffuser
const constraintsNoAudio = { audio: false, video: true };
let video = document.querySelector("video");
navigator.mediaDevices.getUserMedia(constraintsNoAudio)
    .then((stream) => { /* diffuser le flux */
        video.srcObject = stream;
        video.onloadedmetadata = (e) => { video.play(); };
    })
    .catch((err) => { /* gérer les erreurs */ });