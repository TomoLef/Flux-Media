// Vérifier le support et lister les sources
if (!navigator.mediaDevices?.enumerateDevices) {
    console.log("enumerateDevices() not supported.");
} else {
    navigator.mediaDevices.enumerateDevices()
        .then((devices) => {
            devices.forEach((device) => {
                console.log(`${device.kind}: ${device.label},`
                    +` id = ${device.deviceId}`);
        });
    })
    .catch((err) => { console.error(`${err.name}: ${err.message}`); });
}

// Lister les propriétés contraignables acceptées par le navigateur
const constraints = navigator.mediaDevices.getSupportedConstraints();
for (const constraint of Object.keys(constraints))
    console.log(constraint);