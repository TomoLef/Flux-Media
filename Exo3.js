// Produire un flux vidéo (sans audio) et le diffuser
const constraints = { audio: false, video: true };
let video = document.querySelector("video");
navigator.mediaDevices.getUserMedia(constraints)
    .then((stream) => { /* diffuser le flux */
        video.srcObject = stream;
        video.onloadedmetadata = (e) => {
            if (video.hasAttribute('width')) {
            const width = video.getAttribute('width');
            const height = width * video.videoHeight / video.videoWidth;
            video.setAttribute('height',height);
            }
        else if (video.hasAttribute('height')) { /* ... */ }
        video.play();
    };
})
.catch((err) => { /* gérer les erreurs */ });