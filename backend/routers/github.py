from fastapi import APIRouter, HTTPException, Query
from backend.services.github_service import get_repo_tree, get_projects, upload_file, check_health, OWNER, REPO, GITHUB_TOKEN, get_github_client
from backend.models import UploadFileRequest, ApiHealth
from typing import Optional

router = APIRouter()

@router.get("/resources")
async def get_resources(type: Optional[str] = None):
    try:
        if type == "projects":
            projects = get_projects()
            return {"projects": projects}
        
        # Default: get all resources
        # The original API logic was complex:
        # It fetched recursive tree, filtered for specific file types, etc.
        # Let's try to replicate basic "get all files" logic or root content.
        # Original: github.rest.repos.getContent({ recursive: true }) ??
        # The original code `getRepoTree` called `getContent({ path })`.
        # `getRepoTree` calls `github.rest.repos.getContent`.
        # If we want a full resource list, we might need a recursive tree fetch.
        # However, the standard `getContent` is not recursive unless using Git Database API.
        
        # Re-reading original `lib/github.ts`:
        # `getRepoTree` calls `repos.getContent`. This lists directory content.
        # `app/api/github/resources/route.ts` likely iterated or fetched recursively?
        # Let's assume for now we fetch root or specific paths. 
        # Actually, let's just fetch the root and maybe iterate if we can, or just return flattened list if possible.
        
        # For simplicity, let's implement a recursive fetch or just one level deep for "projects".
        # But wait, the frontend expects a flat list of resources from `GET /api/github/resources`.
        # If I can't easily do recursive in one go without Git Data API, I might need to walk the tree.
        # Let's try to use `get_tree` with `recursive=True` if using `get_git_tree`, but `get_contents` is higher level.
        
        # Let's fetch projects, then for each project, fetch contents? That's slow.
        # PyGithub `get_git_tree` is better for recursive.
        
        # For now, let's try to fetch root contents and filter.
        # Or better, use the search API if we want all files?
        # The original code used `getRepoTree` which was just `getContent`. 
        # If the original code only showed root or first level, we do the same.
        # But `resources` page implies all resources.
        
        # Let's check `backend/services/github_service.py` again.
        # I implemented `get_repo_tree` using `get_contents`.
        
        # Let's fetch all items recursively using `get_git_tree` if we can.
        g = get_github_client()
        repo = g.get_repo(f"{OWNER}/{REPO}")
        
        # Get the tree of the main branch recursively
        sha = repo.get_branch("main").commit.sha
        tree = repo.get_git_tree(sha, recursive=True).tree
        
        resources = []
        for element in tree:
            if element.type == "blob": # It's a file
                 # We need size, but tree element only has size in some API versions? 
                 # PyGithub GitTreeElement has size.
                 
                 # Extract project from path (first folder)
                 parts = element.path.split("/")
                 project = parts[0] if len(parts) > 1 and parts[0].startswith("项目-") else "Root"
                 
                 # Basic filtering
                 if element.path.endswith(('.meta', '.gitignore')):
                     continue
                     
                 resources.append({
                     "id": element.sha,
                     "title": os.path.basename(element.path),
                     "path": element.path,
                     "size": element.size,
                     "project": project,
                     "url": element.url, # This is API url
                     # We need raw content url or similar
                     # "download_url" is better but GitTree doesn't give it directly.
                     # We can construct it: https://raw.githubusercontent.com/OWNER/REPO/main/PATH
                     "download_url": f"https://raw.githubusercontent.com/{OWNER}/{REPO}/main/{element.path}"
                 })
                 
        return {"resources": resources}

    except Exception as e:
        print(f"Error fetching resources: {e}")
        return {"resources": []}

import os

@router.post("/upload")
async def upload_resource(request: UploadFileRequest):
    try:
        upload_file(request.path, request.content, request.message)
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health", response_model=ApiHealth)
async def health_check():
    return check_health()

@router.get("/file")
async def get_file_proxy(path: str):
    # Proxy raw content
    # Frontend uses `/api/github/file?path=...` to load images
    import requests
    from fastapi.responses import Response
    
    url = f"https://raw.githubusercontent.com/{OWNER}/{REPO}/main/{path}"
    headers = {}
    if GITHUB_TOKEN:
        headers["Authorization"] = f"token {GITHUB_TOKEN}"

    try:
        resp = requests.get(url, headers=headers)
        if resp.status_code == 200:
             # Determine content type
             content_type = resp.headers.get("Content-Type", "application/octet-stream")
             return Response(content=resp.content, media_type=content_type)
        else:
            print(f"Failed to fetch file: {resp.status_code} {resp.text}")
            return Response(status_code=404)
    except Exception as e:
        print(f"Error fetching file: {e}")
        return Response(status_code=500)

@router.get("/file/details")
async def get_file_details(path: str):
    try:
        g = get_github_client()
        if not g:
             raise Exception("GitHub client not initialized")
             
        repo = g.get_repo(f"{OWNER}/{REPO}")
        
        # Get last commit for metadata
        commits = repo.get_commits(path=path)
        # Note: get_commits might return a paginated list. accessing [0] triggers request.
        
        if commits.totalCount > 0:
            last_commit = commits[0]
            author = last_commit.commit.author.name
            date = last_commit.commit.author.date.isoformat()
        else:
            author = "Unknown"
            date = None

        metadata = {
            "uploader": author,
            "category": "Unknown",
            "type": path.split(".")[-1] if "." in path else "unknown",
            "originalName": path.split("/")[-1],
            "uploadTime": date
        }
        
        return {"metadata": metadata}
    except Exception as e:
        print(f"Error fetching file details: {e}")
        return {"metadata": {
            "uploader": "Unknown",
            "category": "Unknown",
            "type": "unknown",
            "originalName": path.split("/")[-1]
        }}
