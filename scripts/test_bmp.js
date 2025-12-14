let Jimp = require('jimp');
if (Jimp.default) Jimp = Jimp.default;
if (!Jimp.read && Jimp.Jimp) Jimp = Jimp.Jimp;

async function run() {
    console.log("Reading/Creating image...");
    try {
        // Create a 100x100 red image
        // In Jimp 0.x: new Jimp(w, h, color, cb)
        // In Jimp 1.x?
        
        // Let's try creating from scratch if constructor works
        new Jimp(100, 100, 0xFF0000FF, (err, image) => {
            if (err) {
                console.error("Constructor error:", err);
                return;
            }
            console.log("Image created. Writing...");
            image.write('test.bmp', (err) => {
                if (err) console.error("Write error:", err);
                else console.log("Success writing test.bmp");
            });
        });
    } catch (e) {
        console.error("Sync error:", e);
    }
}

run();
