from fastapi import APIRouter, HTTPException
from backend.models import VersionInfo
from backend.services.github_service import get_latest_release
import json
import os

router = APIRouter()

# Assuming package.json is in the root of the project (one level up from backend)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PACKAGE_JSON_PATH = os.path.join(BASE_DIR, 'package.json')

def get_current_version():
    try:
        if os.path.exists(PACKAGE_JSON_PATH):
            with open(PACKAGE_JSON_PATH, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return data.get("version", "0.0.0")
        return "0.0.0"
    except:
        return "0.0.0"

def compare_versions(v1, v2):
    parts1 = [int(x) for x in v1.split('.')]
    parts2 = [int(x) for x in v2.split('.')]
    
    for i in range(max(len(parts1), len(parts2))):
        p1 = parts1[i] if i < len(parts1) else 0
        p2 = parts2[i] if i < len(parts2) else 0
        if p1 > p2: return 1
        if p1 < p2: return -1
    return 0

@router.get("/update/check", response_model=VersionInfo)
async def check_update():
    current_version = get_current_version()
    
    try:
        release = get_latest_release("surgar04", "Tide")
        if not release:
            return VersionInfo(
                currentVersion=current_version,
                latestVersion=current_version,
                hasUpdate=False
            )
            
        latest_version = release.tag_name.replace("v", "")
        has_update = compare_versions(latest_version, current_version) > 0
        
        return VersionInfo(
            currentVersion=current_version,
            latestVersion=latest_version,
            hasUpdate=has_update,
            releaseNotes=release.body or "",
            downloadUrl=release.zipball_url or "",
            publishedAt=release.published_at.isoformat() if release.published_at else ""
        )
    except Exception as e:
        print(f"Update check failed: {e}")
        return VersionInfo(
            currentVersion=current_version,
            latestVersion=current_version,
            hasUpdate=False
        )

@router.post("/update/perform")
async def perform_update():
    # Mock update
    return {"success": True, "message": "Update simulated."}
