const sharp = require('sharp');
let Jimp = require('jimp');
if (Jimp.default) Jimp = Jimp.default;
if (!Jimp.read && Jimp.Jimp) Jimp = Jimp.Jimp;
const fs = require('fs');

async function run() {
    console.log("Creating test.png...");
    await sharp({
        create: {
            width: 100,
            height: 100,
            channels: 4,
            background: { r: 255, g: 0, b: 0, alpha: 1 }
        }
    }).png().toFile('test.png');

    console.log("Reading test.png with Jimp...");
    try {
        const image = await Jimp.read('test.png');
        console.log("Image read. Width:", image.bitmap.width);
        
        console.log("Writing test.bmp...");
        // Try getBufferAsync
        if (image.getBufferAsync) {
            console.log("Has getBufferAsync");
            const buf = await image.getBufferAsync("image/bmp");
            fs.writeFileSync('test.bmp', buf);
            console.log("Written test.bmp using getBufferAsync");
        } else {
            console.log("Using getBuffer callback");
            const res = image.getBuffer("image/bmp", (err, buf) => {
                if (err) console.error("getBuffer error:", err);
                else {
                    fs.writeFileSync('test.bmp', buf);
                    console.log("Written test.bmp using callback");
                }
            });
            console.log("getBuffer returned:", res);
            if (res && typeof res.then === 'function') {
                console.log("It is a promise, awaiting...");
                try {
                    const buf = await res;
                    fs.writeFileSync('test.bmp', buf);
                    console.log("Written test.bmp using promise");
                } catch(e) {
                    console.error("Promise error:", e);
                }
            }
        }
    } catch (e) {
        console.error("Jimp error:", e);
    }
}
run();
