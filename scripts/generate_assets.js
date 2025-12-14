const sharp = require('sharp');
const png2icons = require('png2icons');
let Jimp = require('jimp');
if (Jimp.default) Jimp = Jimp.default;
if (!Jimp.read && Jimp.Jimp) Jimp = Jimp.Jimp;

const fs = require('fs');
const path = require('path');

const ICONS_DIR = path.join(__dirname, '../src-tauri/icons');
const INSTALLER_DIR = path.join(__dirname, '../src-tauri/installer');

if (!fs.existsSync(ICONS_DIR)) fs.mkdirSync(ICONS_DIR, { recursive: true });
if (!fs.existsSync(INSTALLER_DIR)) fs.mkdirSync(INSTALLER_DIR, { recursive: true });

// 1. Define SVG Logo (Dark background, Yellow/Green Tide Wave)
const svgLogo = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" rx="200" fill="#111111"/>
  <path d="M212 512C212 346.315 346.315 212 512 212C677.685 212 812 346.315 812 512C812 677.685 677.685 812 512 812C346.315 812 212 677.685 212 512Z" fill="#1a1a1a"/>
  <path d="M300 600 Q 512 300 724 600 T 900 600" stroke="#FFC700" stroke-width="60" fill="none" stroke-linecap="round"/>
  <path d="M300 680 Q 512 380 724 680" stroke="#00ff88" stroke-width="30" fill="none" stroke-linecap="round" opacity="0.8"/>
  <circle cx="750" cy="350" r="50" fill="#FFC700"/>
</svg>
`;

// Installer Banner (493 x 58) - WiX & NSIS Header (similar style)
const svgBanner = `
<svg width="493" height="58" viewBox="0 0 493 58" xmlns="http://www.w3.org/2000/svg">
  <rect width="493" height="58" fill="#ffffff"/>
  <rect x="0" y="54" width="493" height="4" fill="#FFC700"/>
  <text x="480" y="40" font-family="Arial" font-size="24" font-weight="bold" fill="#111111" text-anchor="end">TideOA Setup</text>
  <circle cx="30" cy="29" r="15" fill="#FFC700"/>
</svg>
`;

// Installer Dialog (493 x 312) - WiX
const svgDialog = `
<svg width="493" height="312" viewBox="0 0 493 312" xmlns="http://www.w3.org/2000/svg">
  <rect width="493" height="312" fill="#f4f4f4"/>
  <rect width="164" height="312" fill="#111111"/>
  <path d="M-50 250 Q 82 100 200 250" stroke="#FFC700" stroke-width="20" fill="none"/>
  <text x="20" y="280" font-family="Arial" font-size="20" font-weight="bold" fill="#FFC700">TideOA</text>
  <text x="180" y="50" font-family="Arial" font-size="24" font-weight="bold" fill="#111111">Welcome</text>
</svg>
`;

// NSIS Sidebar (164x314)
const svgSidebar = `
<svg width="164" height="314" viewBox="0 0 164 314" xmlns="http://www.w3.org/2000/svg">
  <rect width="164" height="314" fill="#111111"/>
  <path d="M0 250 Q 82 150 164 250" stroke="#FFC700" stroke-width="10" fill="none"/>
  <circle cx="82" cy="100" r="30" fill="#FFC700" opacity="0.2"/>
  <text x="82" y="280" font-family="Arial" font-size="20" font-weight="bold" fill="#FFC700" text-anchor="middle">TideOA</text>
</svg>
`;

// NSIS Header (150x57)
const svgHeader = `
<svg width="150" height="57" viewBox="0 0 150 57" xmlns="http://www.w3.org/2000/svg">
  <rect width="150" height="57" fill="#ffffff"/>
  <text x="140" y="35" font-family="Arial" font-size="16" font-weight="bold" fill="#111111" text-anchor="end">TideOA</text>
  <circle cx="20" cy="28" r="10" fill="#FFC700"/>
</svg>
`;

async function generate() {
    console.log("Generating Icons...");
    const buffer = Buffer.from(svgLogo);

    // 1. Icons
    await sharp(buffer).resize(32, 32).png().toFile(path.join(ICONS_DIR, '32x32.png'));
    await sharp(buffer).resize(128, 128).png().toFile(path.join(ICONS_DIR, '128x128.png'));
    await sharp(buffer).resize(256, 256).png().toFile(path.join(ICONS_DIR, '128x128@2x.png')); 
    await sharp(buffer).resize(512, 512).png().toFile(path.join(ICONS_DIR, 'icon.png'));

    // Create ICO and ICNS
    const pngBuffer = await sharp(buffer).resize(256, 256).png().toBuffer();
    
    const ico = png2icons.createICO(pngBuffer, 0, 0, true);
    if (ico) fs.writeFileSync(path.join(ICONS_DIR, 'icon.ico'), ico);

    const icns = png2icons.createICNS(pngBuffer, 0, 0);
    if (icns) fs.writeFileSync(path.join(ICONS_DIR, 'icon.icns'), icns);

    console.log("Generating Installer Assets...");

    // Helper to convert SVG -> PNG Buffer -> BMP File
    const saveBmp = async (svgString, width, height, filename) => {
        console.log(`Processing ${filename}...`);
        try {
            const pngBuf = await sharp(Buffer.from(svgString)).resize(width, height).png().toBuffer();
            const image = await Jimp.read(pngBuf);
            // In Jimp 1.6.0, getBuffer returns a Promise resolving to the buffer
            const bmpBuf = await image.getBuffer("image/bmp");
            fs.writeFileSync(path.join(INSTALLER_DIR, filename), bmpBuf);
            console.log(`Saved ${filename}`);
        } catch (e) {
            console.error(`Failed to save ${filename}:`, e);
            throw e;
        }
    };

    // WiX
    await saveBmp(svgBanner, 493, 58, 'WixBannerBmp.bmp');
    await saveBmp(svgDialog, 493, 312, 'WixDialogBmp.bmp');
    
    // NSIS
    await saveBmp(svgSidebar, 164, 314, 'nsis-sidebar.bmp');
    await saveBmp(svgHeader, 150, 57, 'nsis-header.bmp');

    console.log("Assets generated successfully!");
}

generate().catch(err => {
    console.error(err);
    process.exit(1);
});
