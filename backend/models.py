from pydantic import BaseModel
from typing import List, Optional

class Activity(BaseModel):
    id: str
    action: str
    target: str
    timestamp: str

class UserData(BaseModel):
    username: Optional[str] = "Administrator"
    email: Optional[str] = "admin@tideoa.com"
    joinDate: Optional[str] = None
    totalTime: int = 0
    avatar: Optional[str] = None
    signature: Optional[str] = "Per aspera ad astra."
    activities: List[Activity] = []

class UpdateProfileRequest(BaseModel):
    type: str
    username: Optional[str] = None
    email: Optional[str] = None
    avatar: Optional[str] = None
    signature: Optional[str] = None
    seconds: Optional[int] = None

class GithubResource(BaseModel):
    id: str
    title: str
    path: str
    size: int
    project: str
    url: str
    type: str

class UploadFileRequest(BaseModel):
    path: str
    content: str  # base64
    message: str

class VersionInfo(BaseModel):
    currentVersion: str
    latestVersion: str
    hasUpdate: bool
    releaseNotes: Optional[str] = ""
    downloadUrl: Optional[str] = ""
    publishedAt: Optional[str] = ""

class ApiHealth(BaseModel):
    status: str
    limit: Optional[int] = None
    remaining: Optional[int] = None
    reset: Optional[int] = None
