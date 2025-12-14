import os
from github import Github, Auth
from dotenv import load_dotenv
import base64

load_dotenv()

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
OWNER = "surgar04"
REPO = "Document-Repository"

def get_github_client():
    if not GITHUB_TOKEN:
        print("Warning: GITHUB_TOKEN not found in environment variables")
        return None
    auth = Auth.Token(GITHUB_TOKEN)
    return Github(auth=auth)

def get_repo_tree(path: str = ""):
    g = get_github_client()
    if not g:
        raise Exception("GitHub token missing")
    
    repo = g.get_repo(f"{OWNER}/{REPO}")
    contents = repo.get_contents(path)
    
    # Standardize output to match what frontend expects
    # Octokit returns object with type, name, path, sha, size, url, download_url, etc.
    results = []
    if isinstance(contents, list):
        for content in contents:
            results.append({
                "name": content.name,
                "path": content.path,
                "sha": content.sha,
                "size": content.size,
                "url": content.html_url,
                "type": content.type,
                "download_url": content.download_url
            })
    else:
        # Single file
        results = {
             "name": contents.name,
             "path": contents.path,
             "sha": contents.sha,
             "size": contents.size,
             "url": contents.html_url,
             "type": contents.type,
             "content": contents.content, # Base64
             "encoding": contents.encoding
        }
    return results

def get_projects():
    g = get_github_client()
    if not g:
        return []
    
    try:
        repo = g.get_repo(f"{OWNER}/{REPO}")
        contents = repo.get_contents("")
        projects = []
        for content in contents:
            if content.type == "dir" and content.name.startswith("项目-"):
                projects.append(content.name)
        return projects
    except Exception as e:
        print(f"Error fetching projects: {e}")
        return []

def upload_file(path: str, content_base64: str, message: str, branch: str = "main"):
    g = get_github_client()
    if not g:
        raise Exception("GitHub token missing")

    repo = g.get_repo(f"{OWNER}/{REPO}")
    
    try:
        # Check if file exists
        file_content = repo.get_contents(path, ref=branch)
        sha = file_content.sha
        # Update
        # PyGithub expects content as string or bytes. If base64, we might need to decode if it expects raw string, 
        # but create_file takes content.
        # Actually PyGithub create_file/update_file takes content string.
        # If it's binary, it might be tricky.
        # However, looking at docs, update_file takes content.
        # The frontend sends base64. We should decode it to bytes.
        decoded_content = base64.b64decode(content_base64)
        repo.update_file(path, message, decoded_content, sha, branch=branch)
    except:
        # File doesn't exist, create it
        decoded_content = base64.b64decode(content_base64)
        repo.create_file(path, message, decoded_content, branch=branch)

def check_health():
    g = get_github_client()
    if not g:
        return {"status": "error", "error": "No token"}
    
    try:
        # PyGithub get_rate_limit() returns RateLimitOverview
        # We can access .rate (global/core) or .resources.core
        rate_limit = g.get_rate_limit()
        rate = rate_limit.rate
        return {
            "status": "ok",
            "limit": rate.limit,
            "remaining": rate.remaining,
            "reset": rate.reset.timestamp()
        }
    except Exception as e:
        return {"status": "error", "error": str(e)}

def get_latest_release(owner: str, repo_name: str):
    g = get_github_client()
    if not g:
        return None
    try:
        repo = g.get_repo(f"{owner}/{repo_name}")
        return repo.get_latest_release()
    except Exception as e:
        print(f"Error getting release: {e}")
        return None
