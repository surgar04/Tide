import fs from 'fs';
import path from 'path';
import { github } from './github';

const PACKAGE_JSON_PATH = path.join(process.cwd(), 'package.json');

export interface VersionInfo {
  currentVersion: string;
  latestVersion: string;
  hasUpdate: boolean;
  releaseNotes?: string;
  downloadUrl?: string;
  publishedAt?: string;
}

export function getCurrentVersion(): string {
  try {
    const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf-8'));
    return packageJson.version;
  } catch (error) {
    console.error("Failed to read package.json:", error);
    return "0.0.0";
  }
}

export function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    
    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }
  
  return 0;
}

export async function checkUpdate(): Promise<VersionInfo> {
  const currentVersion = getCurrentVersion();
  
  try {
    // Check surgar04/Tide releases
    const { data: latestRelease } = await github.rest.repos.getLatestRelease({
      owner: "surgar04",
      repo: "Tide",
    });

    const latestVersion = latestRelease.tag_name.replace(/^v/, '');
    const hasUpdate = compareVersions(latestVersion, currentVersion) > 0;

    return {
      currentVersion,
      latestVersion,
      hasUpdate,
      releaseNotes: latestRelease.body || "",
      downloadUrl: latestRelease.zipball_url || "",
      publishedAt: latestRelease.published_at || ""
    };
  } catch (error) {
    console.error("Failed to check for updates:", error);
    // Return current state if check fails
    return {
      currentVersion,
      latestVersion: currentVersion,
      hasUpdate: false
    };
  }
}
