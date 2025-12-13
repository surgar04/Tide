import { NextResponse } from 'next/server';
import { checkUpdate } from '@/lib/version';
import AdmZip from 'adm-zip';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';

// Files and directories to preserve (not overwrite)
const PRESERVE_LIST = [
  '.env',
  '.env.local',
  'data',
  'node_modules',
  '.git',
  '.next',
  'public/uploads', // If user uploads exist
];

export async function POST() {
  try {
    const updateInfo = await checkUpdate();
    
    if (!updateInfo.hasUpdate || !updateInfo.downloadUrl) {
      return NextResponse.json({ error: "No update available" }, { status: 400 });
    }

    console.log(`Starting update to version ${updateInfo.latestVersion}...`);

    // 1. Download the zip
    const response = await fetch(updateInfo.downloadUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
        'User-Agent': 'TideOA-Updater'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to download update: ${response.statusText}`);
    }

    const tempZipPath = path.join(process.cwd(), 'update_temp.zip');
    const fileStream = fs.createWriteStream(tempZipPath);
    
    // @ts-ignore - response.body is a ReadableStream in web, but node-fetch/Next.js polyfills handle this
    await pipeline(Readable.fromWeb(response.body), fileStream);

    // 2. Extract
    console.log("Extracting update...");
    const zip = new AdmZip(tempZipPath);
    const extractPath = path.join(process.cwd(), 'update_temp_extracted');
    
    // Clean up previous extract if exists
    if (fs.existsSync(extractPath)) {
      fs.rmSync(extractPath, { recursive: true, force: true });
    }
    
    zip.extractAllTo(extractPath, true);

    // 3. Find the root folder (GitHub zips usually have a top-level folder)
    const files = fs.readdirSync(extractPath);
    const rootDir = files.find(f => fs.statSync(path.join(extractPath, f)).isDirectory());
    
    if (!rootDir) {
      throw new Error("Invalid update package structure");
    }

    const sourcePath = path.join(extractPath, rootDir);
    const targetPath = process.cwd();

    // 4. Copy files while preserving data
    console.log("Installing update...");
    copyRecursiveSync(sourcePath, targetPath);

    // 5. Cleanup
    fs.unlinkSync(tempZipPath);
    fs.rmSync(extractPath, { recursive: true, force: true });

    console.log("Update completed successfully.");

    return NextResponse.json({ 
      success: true, 
      message: "Update installed successfully. Please restart the system." 
    });

  } catch (error: any) {
    console.error("Update failed:", error);
    return NextResponse.json({ error: error.message || "Update failed" }, { status: 500 });
  }
}

function copyRecursiveSync(src: string, dest: string) {
  if (!fs.existsSync(src)) return;
  const stats = fs.statSync(src);
  const isDirectory = stats.isDirectory();

  // Check if current path matches any preserve patterns
  const relativePath = path.relative(path.join(process.cwd(), 'update_temp_extracted', fs.readdirSync(path.join(process.cwd(), 'update_temp_extracted'))[0]), src);
  // Fix relative path calculation because src is absolute. 
  // Actually simpler: pass relative path down.
  
  // Let's rewrite to iterate the source directory and copy to dest
  if (!isDirectory) return;

  const items = fs.readdirSync(src);

  items.forEach(item => {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    
    // Check if this item is in the preserve list (relative to project root)
    // We can check if destPath matches any preserved path
    const relDestPath = path.relative(process.cwd(), destPath).replace(/\\/g, '/'); // Normalize for Windows
    
    // Check if exactly matches or is inside a preserved directory
    const shouldPreserve = PRESERVE_LIST.some(p => 
      relDestPath === p || relDestPath.startsWith(p + '/')
    );

    if (shouldPreserve) {
      console.log(`Skipping preserved path: ${relDestPath}`);
      return;
    }

    const itemStats = fs.statSync(srcPath);

    if (itemStats.isDirectory()) {
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
      }
      copyRecursiveSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}
