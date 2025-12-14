from fastapi import APIRouter
from backend.services.user_data import get_user_data, log_user_activity, save_user_data
from backend.models import UserData, UpdateProfileRequest, Activity

router = APIRouter()

@router.get("/user", response_model=UserData)
async def get_user():
    data = get_user_data()
    # Ensure join date is set
    if not data.joinDate:
        from datetime import datetime
        data.joinDate = datetime.now().isoformat()
        save_user_data(data)
    return data

@router.post("/user")
async def update_user(request: UpdateProfileRequest):
    data = get_user_data()
    
    if request.type == 'update_avatar':
        if request.avatar is not None:
            data.avatar = request.avatar
            log_user_activity("更新头像 | Updated Avatar", "个人设置")
            
    elif request.type == 'update_profile':
        if request.username: data.username = request.username
        if request.email: data.email = request.email
        if request.avatar is not None: data.avatar = request.avatar
        log_user_activity("更新个人资料 | Updated Profile", "个人设置")
        
    elif request.type == 'update_signature':
        if request.signature: data.signature = request.signature
        
    elif request.type == 'add_time':
        seconds = request.seconds if request.seconds is not None else 0
        data.totalTime += seconds
        
    save_user_data(data)
    return {"success": True, "data": data}

@router.get("/activity")
async def get_activities():
    data = get_user_data()
    return {"activities": data.activities}

@router.post("/activity")
async def log_activity(activity: Activity):
    # This endpoint was accepting action/target in body
    # But modeled as Activity for simplicity? No, let's use a specific model or dict
    pass

@router.post("/login-log")
async def login_log(log: dict):
    # Just log to console or append to activity for now as per original code behavior (external service mock)
    # The original code sent {username, email, password, userAgent, timestamp}
    # And original API didn't really do much except maybe error or success.
    print(f"Login Log: {log}")
    return {"success": True}
