from fastapi import FastAPI, APIRouter, HTTPException, Depends, File, UploadFile, Form, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from enum import Enum
import base64
import secrets

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = "HS256"
UPLOAD_DIR = ROOT_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

class TaskCategory(str, Enum):
    INSTAGRAM_LIKE = "Instagram Like"
    INSTAGRAM_FOLLOW = "Instagram Follow"
    YOUTUBE_LIKE = "YouTube Like"
    YOUTUBE_SUBSCRIBE = "YouTube Subscribe"
    TELEGRAM_JOIN = "Telegram Join"
    FACEBOOK_FOLLOW = "Facebook Follow"

class SubmissionStatus(str, Enum):
    SUBMITTED = "Submitted"
    UNDER_REVIEW = "Under Review"
    APPROVED = "Approved"
    REJECTED = "Rejected"

class WithdrawalMethod(str, Enum):
    UPI = "UPI"
    BANK = "Bank"

class TransactionType(str, Enum):
    CREDIT = "Credit"
    DEBIT = "Debit"

# Pydantic Models
class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    mobile: str
    password: str

class UserLogin(BaseModel):
    identifier: str
    password: str

class TokenResponse(BaseModel):
    token: str
    user_id: str
    is_admin: bool = False

class TaskCreate(BaseModel):
    title: str
    description: str
    category: TaskCategory
    reward: float
    link: str
    requires_proof: bool = True
    active: bool = True

class TaskResponse(BaseModel):
    id: str
    title: str
    description: str
    category: str
    reward: float
    link: str
    requires_proof: bool
    active: bool
    completed: bool = False

class TaskSubmissionCreate(BaseModel):
    task_id: str

class AdCreate(BaseModel):
    title: str
    link: str
    duration: int
    reward: float
    active: bool = True

class AdResponse(BaseModel):
    id: str
    title: str
    link: str
    duration: int
    reward: float
    active: bool
    can_watch: bool = False
    next_available: Optional[str] = None

class WithdrawalCreate(BaseModel):
    amount: float
    method: WithdrawalMethod
    upi_id: Optional[str] = None
    bank_name: Optional[str] = None
    account_number: Optional[str] = None
    ifsc_code: Optional[str] = None
    account_holder: Optional[str] = None

class KYCSubmit(BaseModel):
    account_holder: str
    bank_name: str
    account_number: str
    ifsc_code: str
    branch_name: str

class UploadSubmit(BaseModel):
    platform: str
    video_link: str

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None

class AdminLogin(BaseModel):
    username: str
    password: str

class ApproveReject(BaseModel):
    reason: Optional[str] = None

class SettingsUpdate(BaseModel):
    min_withdrawal: Optional[float] = None
    max_withdrawal: Optional[float] = None
    referral_bonus: Optional[float] = None
    welcome_bonus: Optional[float] = None
    daily_task_limit: Optional[int] = None
    daily_ads_limit: Optional[int] = None
    ad_reward: Optional[float] = None
    upload_reward: Optional[float] = None
    daily_earning_cap: Optional[float] = None
    enable_ads: Optional[bool] = None
    ad_lock_24h: Optional[bool] = None

class CMSUpdate(BaseModel):
    title: str
    content: str

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_token(user_id: str, is_admin: bool = False) -> str:
    payload = {
        "user_id": user_id,
        "is_admin": is_admin,
        "exp": datetime.now(timezone.utc) + timedelta(days=30)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id")
        is_admin = payload.get("is_admin", False)
        
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        if is_admin:
            admin = await db.admins.find_one({"username": user_id}, {"_id": 0})
            if not admin:
                raise HTTPException(status_code=401, detail="Admin not found")
            return {"user_id": user_id, "is_admin": True}
        else:
            user = await db.users.find_one({"id": user_id}, {"_id": 0})
            if not user:
                raise HTTPException(status_code=401, detail="User not found")
            return {"user_id": user_id, "is_admin": False, "user": user}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def require_admin(current_user: dict = Depends(get_current_user)):
    if not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

def generate_referral_code():
    return secrets.token_urlsafe(6).upper()[:6]

async def add_transaction(user_id: str, tx_type: str, amount: float, description: str, status: str = "Completed"):
    transaction = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "type": tx_type,
        "amount": amount,
        "description": description,
        "status": status,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.transactions.insert_one(transaction)

async def get_settings():
    settings = await db.settings.find_one({}, {"_id": 0})
    if not settings:
        default_settings = {
            "min_withdrawal": 500,
            "max_withdrawal": 5000,
            "referral_bonus": 20,
            "welcome_bonus": 10,
            "daily_task_limit": 10,
            "daily_ads_limit": 5,
            "ad_reward": 5,
            "upload_reward": 1000,
            "daily_earning_cap": 500,
            "enable_ads": True,
            "ad_lock_24h": True
        }
        await db.settings.insert_one(default_settings)
        return default_settings
    return settings

# Auth Endpoints
@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserRegister):
    existing_user = await db.users.find_one({"$or": [{"email": user_data.email}, {"mobile": user_data.mobile}]}, {"_id": 0})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email or mobile already registered")
    
    settings = await get_settings()
    user_id = str(uuid.uuid4())
    referral_code = generate_referral_code()
    
    user = {
        "id": user_id,
        "full_name": user_data.full_name,
        "email": user_data.email,
        "mobile": user_data.mobile,
        "password": hash_password(user_data.password),
        "wallet_balance": settings["welcome_bonus"],
        "total_earned": settings["welcome_bonus"],
        "referral_code": referral_code,
        "referral_earnings": 0,
        "is_blocked": False,
        "kyc_status": "Not Submitted",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user)
    await add_transaction(user_id, TransactionType.CREDIT, settings["welcome_bonus"], "Welcome Bonus")
    
    token = create_token(user_id)
    return TokenResponse(token=token, user_id=user_id)

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(login_data: UserLogin):
    user = await db.users.find_one({
        "$or": [{"email": login_data.identifier}, {"mobile": login_data.identifier}]
    }, {"_id": 0})
    
    if not user or not verify_password(login_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if user.get("is_blocked"):
        raise HTTPException(status_code=403, detail="Account blocked")
    
    token = create_token(user["id"])
    return TokenResponse(token=token, user_id=user["id"])

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    if current_user["is_admin"]:
        return {"is_admin": True, "user_id": current_user["user_id"]}
    user = current_user["user"]
    user.pop("password", None)
    return user

# User Dashboard
@api_router.get("/dashboard")
async def get_dashboard(current_user: dict = Depends(get_current_user)):
    user = current_user["user"]
    user_id = user["id"]
    
    today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    week_ago = today - timedelta(days=7)
    
    today_transactions = await db.transactions.find({
        "user_id": user_id,
        "type": TransactionType.CREDIT,
        "created_at": {"$gte": today.isoformat()}
    }, {"_id": 0}).to_list(1000)
    
    week_transactions = await db.transactions.find({
        "user_id": user_id,
        "type": TransactionType.CREDIT,
        "created_at": {"$gte": week_ago.isoformat()}
    }, {"_id": 0}).to_list(1000)
    
    completed_tasks = await db.task_submissions.count_documents({
        "user_id": user_id,
        "status": SubmissionStatus.APPROVED
    })
    
    today_earning = sum(t["amount"] for t in today_transactions)
    weekly_earning = sum(t["amount"] for t in week_transactions)
    
    weekly_stats = {}
    for i in range(7):
        day = today - timedelta(days=i)
        day_str = day.strftime("%Y-%m-%d")
        day_transactions = [t for t in week_transactions if t["created_at"].startswith(day_str)]
        weekly_stats[day.strftime("%a")] = sum(t["amount"] for t in day_transactions)
    
    return {
        "wallet_balance": user.get("wallet_balance", 0),
        "today_earning": today_earning,
        "weekly_earning": weekly_earning,
        "total_earning": user.get("total_earned", 0),
        "completed_tasks": completed_tasks,
        "referral_bonus": user.get("referral_earnings", 0),
        "weekly_chart": weekly_stats
    }

# Tasks
@api_router.get("/tasks", response_model=List[TaskResponse])
async def get_tasks(current_user: dict = Depends(get_current_user)):
    user_id = current_user["user"]["id"]
    
    tasks = await db.tasks.find({"active": True}, {"_id": 0}).to_list(1000)
    submissions = await db.task_submissions.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    
    submitted_task_ids = {s["task_id"] for s in submissions}
    
    task_responses = []
    for task in tasks:
        task_responses.append(TaskResponse(
            id=task["id"],
            title=task["title"],
            description=task["description"],
            category=task["category"],
            reward=task["reward"],
            link=task["link"],
            requires_proof=task["requires_proof"],
            active=task["active"],
            completed=task["id"] in submitted_task_ids
        ))
    
    return task_responses

@api_router.post("/tasks/{task_id}/submit")
async def submit_task(
    task_id: str,
    screenshot: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["user"]["id"]
    
    task = await db.tasks.find_one({"id": task_id}, {"_id": 0})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    existing_submission = await db.task_submissions.find_one({
        "user_id": user_id,
        "task_id": task_id
    }, {"_id": 0})
    
    if existing_submission:
        raise HTTPException(status_code=400, detail="Task already submitted")
    
    file_data = await screenshot.read()
    file_base64 = base64.b64encode(file_data).decode()
    
    submission = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "task_id": task_id,
        "screenshot": file_base64,
        "status": SubmissionStatus.UNDER_REVIEW,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.task_submissions.insert_one(submission)
    return {"message": "Task submitted successfully - Under Review", "submission_id": submission["id"]}

@api_router.get("/tasks/submissions")
async def get_my_submissions(current_user: dict = Depends(get_current_user)):
    user_id = current_user["user"]["id"]
    submissions = await db.task_submissions.find({"user_id": user_id}, {"_id": 0, "screenshot": 0}).to_list(1000)
    
    for submission in submissions:
        task = await db.tasks.find_one({"id": submission["task_id"]}, {"_id": 0})
        if task:
            submission["task_title"] = task["title"]
            submission["reward"] = task["reward"]
    
    return submissions

# Ads
@api_router.get("/ads", response_model=List[AdResponse])
async def get_ads(current_user: dict = Depends(get_current_user)):
    user_id = current_user["user"]["id"]
    settings = await get_settings()
    
    if not settings["enable_ads"]:
        return []
    
    ads = await db.ads.find({"active": True}, {"_id": 0}).to_list(1000)
    ad_views = await db.ad_views.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    
    ad_view_map = {v["ad_id"]: v for v in ad_views}
    
    ad_responses = []
    for ad in ads:
        can_watch = True
        next_available = None
        
        if ad["id"] in ad_view_map and settings["ad_lock_24h"]:
            last_view = datetime.fromisoformat(ad_view_map[ad["id"]]["viewed_at"])
            next_time = last_view + timedelta(hours=24)
            if datetime.now(timezone.utc) < next_time:
                can_watch = False
                next_available = next_time.isoformat()
        
        ad_responses.append(AdResponse(
            id=ad["id"],
            title=ad["title"],
            link=ad["link"],
            duration=ad["duration"],
            reward=ad["reward"],
            active=ad["active"],
            can_watch=can_watch,
            next_available=next_available
        ))
    
    return ad_responses

@api_router.post("/ads/{ad_id}/watch")
async def watch_ad(ad_id: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user["user"]["id"]
    
    ad = await db.ads.find_one({"id": ad_id}, {"_id": 0})
    if not ad:
        raise HTTPException(status_code=404, detail="Ad not found")
    
    settings = await get_settings()
    
    if settings["ad_lock_24h"]:
        last_view = await db.ad_views.find_one({"user_id": user_id, "ad_id": ad_id}, {"_id": 0})
        if last_view:
            last_time = datetime.fromisoformat(last_view["viewed_at"])
            if datetime.now(timezone.utc) - last_time < timedelta(hours=24):
                raise HTTPException(status_code=400, detail="Please wait 24 hours")
    
    ad_view = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "ad_id": ad_id,
        "viewed_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.ad_views.update_one(
        {"user_id": user_id, "ad_id": ad_id},
        {"$set": ad_view},
        upsert=True
    )
    
    await db.users.update_one(
        {"id": user_id},
        {
            "$inc": {
                "wallet_balance": ad["reward"],
                "total_earned": ad["reward"]
            }
        }
    )
    
    await add_transaction(user_id, TransactionType.CREDIT, ad["reward"], f"Watched ad: {ad['title']}")
    
    return {"message": "Ad watched successfully", "reward": ad["reward"]}

# Wallet
@api_router.get("/wallet")
async def get_wallet(current_user: dict = Depends(get_current_user)):
    user = current_user["user"]
    transactions = await db.transactions.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    return {
        "balance": user.get("wallet_balance", 0),
        "transactions": transactions
    }

@api_router.post("/wallet/withdraw")
async def create_withdrawal(withdrawal_data: WithdrawalCreate, current_user: dict = Depends(get_current_user)):
    user = current_user["user"]
    settings = await get_settings()
    
    if user.get("kyc_status") != "Approved":
        raise HTTPException(status_code=400, detail="KYC verification required")
    
    if withdrawal_data.amount < settings["min_withdrawal"]:
        raise HTTPException(status_code=400, detail=f"Minimum withdrawal: ₹{settings['min_withdrawal']}")
    
    if withdrawal_data.amount > settings["max_withdrawal"]:
        raise HTTPException(status_code=400, detail=f"Maximum withdrawal: ₹{settings['max_withdrawal']}")
    
    if withdrawal_data.amount > user.get("wallet_balance", 0):
        raise HTTPException(status_code=400, detail="Insufficient balance")
    
    withdrawal = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "amount": withdrawal_data.amount,
        "method": withdrawal_data.method,
        "upi_id": withdrawal_data.upi_id,
        "bank_name": withdrawal_data.bank_name,
        "account_number": withdrawal_data.account_number,
        "ifsc_code": withdrawal_data.ifsc_code,
        "account_holder": withdrawal_data.account_holder,
        "status": "Pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.withdrawals.insert_one(withdrawal)
    await db.users.update_one({"id": user["id"]}, {"$inc": {"wallet_balance": -withdrawal_data.amount}})
    await add_transaction(user["id"], TransactionType.DEBIT, withdrawal_data.amount, "Withdrawal Request", "Pending")
    
    return {"message": "Withdrawal request submitted", "withdrawal_id": withdrawal["id"]}

# KYC
@api_router.post("/kyc")
async def submit_kyc(
    data: str = Form(...),
    aadhaar_front: UploadFile = File(...),
    aadhaar_back: UploadFile = File(...),
    pan_card: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["user"]["id"]
    
    import json
    kyc_data = json.loads(data)
    
    aadhaar_front_data = base64.b64encode(await aadhaar_front.read()).decode()
    aadhaar_back_data = base64.b64encode(await aadhaar_back.read()).decode()
    pan_card_data = base64.b64encode(await pan_card.read()).decode()
    
    kyc = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "account_holder": kyc_data["account_holder"],
        "bank_name": kyc_data["bank_name"],
        "account_number": kyc_data["account_number"],
        "ifsc_code": kyc_data["ifsc_code"],
        "branch_name": kyc_data["branch_name"],
        "aadhaar_front": aadhaar_front_data,
        "aadhaar_back": aadhaar_back_data,
        "pan_card": pan_card_data,
        "status": "Submitted",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.kyc.update_one({"user_id": user_id}, {"$set": kyc}, upsert=True)
    await db.users.update_one({"id": user_id}, {"$set": {"kyc_status": "Submitted"}})
    
    return {"message": "KYC submitted successfully"}

@api_router.get("/kyc")
async def get_kyc_status(current_user: dict = Depends(get_current_user)):
    user_id = current_user["user"]["id"]
    kyc = await db.kyc.find_one({"user_id": user_id}, {"_id": 0, "aadhaar_front": 0, "aadhaar_back": 0, "pan_card": 0})
    
    if not kyc:
        return {"status": "Not Submitted"}
    
    return kyc

# Uploads
@api_router.post("/uploads")
async def submit_upload(
    data: str = Form(...),
    screenshot: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["user"]["id"]
    
    import json
    upload_data = json.loads(data)
    
    screenshot_data = base64.b64encode(await screenshot.read()).decode()
    
    upload = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "platform": upload_data["platform"],
        "video_link": upload_data["video_link"],
        "screenshot": screenshot_data,
        "status": "Submitted",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.uploads.insert_one(upload)
    return {"message": "Upload submitted successfully", "upload_id": upload["id"]}

@api_router.get("/uploads")
async def get_my_uploads(current_user: dict = Depends(get_current_user)):
    user_id = current_user["user"]["id"]
    uploads = await db.uploads.find({"user_id": user_id}, {"_id": 0, "screenshot": 0}).to_list(1000)
    return uploads

# Referrals
@api_router.get("/referrals")
async def get_referrals(current_user: dict = Depends(get_current_user)):
    user = current_user["user"]
    user_id = user["id"]
    
    referrals = await db.users.find({"referred_by": user_id}, {"_id": 0, "password": 0}).to_list(1000)
    
    base_url = os.environ.get("FRONTEND_URL", "https://earnkaro.app")
    referral_link = f"{base_url}/register?ref={user['referral_code']}"
    
    return {
        "referral_code": user["referral_code"],
        "referral_link": referral_link,
        "total_referrals": len(referrals),
        "referral_earnings": user.get("referral_earnings", 0),
        "referrals": referrals
    }

@api_router.post("/referrals/apply")
async def apply_referral(referral_code: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user["user"]["id"]
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if user.get("referred_by"):
        raise HTTPException(status_code=400, detail="Referral already applied")
    
    referrer = await db.users.find_one({"referral_code": referral_code}, {"_id": 0})
    if not referrer:
        raise HTTPException(status_code=404, detail="Invalid referral code")
    
    settings = await get_settings()
    bonus = settings["referral_bonus"]
    
    await db.users.update_one({"id": user_id}, {"$set": {"referred_by": referrer["id"]}})
    await db.users.update_one(
        {"id": referrer["id"]},
        {
            "$inc": {
                "wallet_balance": bonus,
                "total_earned": bonus,
                "referral_earnings": bonus
            }
        }
    )
    
    await add_transaction(referrer["id"], TransactionType.CREDIT, bonus, f"Referral bonus from {user['full_name']}")
    
    return {"message": "Referral applied successfully"}

# Profile
@api_router.get("/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    user = current_user["user"]
    user.pop("password", None)
    return user

@api_router.put("/profile")
async def update_profile(profile_data: ProfileUpdate, current_user: dict = Depends(get_current_user)):
    user_id = current_user["user"]["id"]
    
    update_data = {k: v for k, v in profile_data.dict().items() if v is not None}
    
    if update_data:
        await db.users.update_one({"id": user_id}, {"$set": update_data})
    
    return {"message": "Profile updated successfully"}

# Admin Auth
@api_router.post("/admin/login", response_model=TokenResponse)
async def admin_login(login_data: AdminLogin):
    if login_data.username == "Priyanshu1369" and login_data.password == "@Priyanshu@1369?":
        admin_doc = await db.admins.find_one({"username": login_data.username}, {"_id": 0})
        if not admin_doc:
            await db.admins.insert_one({"username": login_data.username, "password": hash_password(login_data.password)})
        
        token = create_token(login_data.username, is_admin=True)
        return TokenResponse(token=token, user_id=login_data.username, is_admin=True)
    
    raise HTTPException(status_code=401, detail="Invalid admin credentials")

# Admin Dashboard
@api_router.get("/admin/dashboard")
async def admin_dashboard(current_user: dict = Depends(require_admin)):
    total_users = await db.users.count_documents({})
    active_users = await db.users.count_documents({"is_blocked": False})
    
    today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    week_ago = today - timedelta(days=7)
    month_ago = today - timedelta(days=30)
    
    today_users = await db.users.count_documents({"created_at": {"$gte": today.isoformat()}})
    weekly_users = await db.users.count_documents({"created_at": {"$gte": week_ago.isoformat()}})
    monthly_users = await db.users.count_documents({"created_at": {"$gte": month_ago.isoformat()}})
    
    all_transactions = await db.transactions.find({"type": TransactionType.CREDIT}, {"_id": 0}).to_list(10000)
    total_distributed = sum(t["amount"] for t in all_transactions)
    
    today_transactions = [t for t in all_transactions if t["created_at"] >= today.isoformat()]
    today_earnings = sum(t["amount"] for t in today_transactions)
    
    approved_withdrawals = await db.withdrawals.find({"status": "Approved"}, {"_id": 0}).to_list(10000)
    approved_amount = sum(w["amount"] for w in approved_withdrawals)
    
    pending_withdrawals = await db.withdrawals.count_documents({"status": "Pending"})
    pending_kyc = await db.kyc.count_documents({"status": "Submitted"})
    pending_uploads = await db.uploads.count_documents({"status": "Submitted"})
    
    recent_withdrawals = await db.withdrawals.find({}, {"_id": 0}).sort("created_at", -1).limit(10).to_list(10)
    
    weekly_earnings = {}
    for i in range(7):
        day = today - timedelta(days=i)
        day_str = day.strftime("%Y-%m-%d")
        day_trans = [t for t in all_transactions if t["created_at"].startswith(day_str)]
        weekly_earnings[day.strftime("%a")] = sum(t["amount"] for t in day_trans)
    
    return {
        "total_users": total_users,
        "active_users": active_users,
        "today_users": today_users,
        "weekly_users": weekly_users,
        "monthly_users": monthly_users,
        "total_distributed": total_distributed,
        "approved_withdrawals_amount": approved_amount,
        "pending_withdrawals": pending_withdrawals,
        "pending_kyc": pending_kyc,
        "pending_uploads": pending_uploads,
        "today_earnings": today_earnings,
        "recent_withdrawals": recent_withdrawals,
        "weekly_earnings": weekly_earnings
    }

# Admin Users
@api_router.get("/admin/users")
async def get_all_users(current_user: dict = Depends(require_admin)):
    users = await db.users.find({}, {"_id": 0, "password": 0}).to_list(10000)
    return users

@api_router.put("/admin/users/{user_id}/block")
async def block_user(user_id: str, current_user: dict = Depends(require_admin)):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    new_status = not user.get("is_blocked", False)
    await db.users.update_one({"id": user_id}, {"$set": {"is_blocked": new_status}})
    
    return {"message": f"User {'blocked' if new_status else 'unblocked'} successfully"}

# Admin Tasks
@api_router.get("/admin/tasks")
async def get_all_tasks(current_user: dict = Depends(require_admin)):
    tasks = await db.tasks.find({}, {"_id": 0}).to_list(1000)
    return tasks

@api_router.post("/admin/tasks")
async def create_task(task_data: TaskCreate, current_user: dict = Depends(require_admin)):
    task = task_data.dict()
    task["id"] = str(uuid.uuid4())
    task["created_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.tasks.insert_one(task)
    return {"message": "Task created successfully", "task_id": task["id"]}

@api_router.put("/admin/tasks/{task_id}")
async def update_task(task_id: str, task_data: TaskCreate, current_user: dict = Depends(require_admin)):
    task = await db.tasks.find_one({"id": task_id}, {"_id": 0})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    await db.tasks.update_one({"id": task_id}, {"$set": task_data.dict()})
    return {"message": "Task updated successfully"}

@api_router.delete("/admin/tasks/{task_id}")
async def delete_task(task_id: str, current_user: dict = Depends(require_admin)):
    result = await db.tasks.delete_one({"id": task_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return {"message": "Task deleted successfully"}

@api_router.get("/admin/tasks/submissions")
async def get_all_submissions(current_user: dict = Depends(require_admin)):
    submissions = await db.task_submissions.find({}, {"_id": 0, "screenshot": 0}).to_list(10000)
    
    for submission in submissions:
        user = await db.users.find_one({"id": submission["user_id"]}, {"_id": 0})
        task = await db.tasks.find_one({"id": submission["task_id"]}, {"_id": 0})
        
        if user:
            submission["user_name"] = user["full_name"]
            submission["user_email"] = user["email"]
        if task:
            submission["task_title"] = task["title"]
            submission["reward"] = task["reward"]
    
    return submissions

@api_router.get("/admin/tasks/submissions/{submission_id}/proof")
async def get_submission_proof(submission_id: str, current_user: dict = Depends(require_admin)):
    submission = await db.task_submissions.find_one({"id": submission_id}, {"_id": 0})
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    return {"screenshot": submission.get("screenshot", "")}

@api_router.put("/admin/tasks/submissions/{submission_id}/approve")
async def approve_submission(submission_id: str, current_user: dict = Depends(require_admin)):
    submission = await db.task_submissions.find_one({"id": submission_id}, {"_id": 0})
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    task = await db.tasks.find_one({"id": submission["task_id"]}, {"_id": 0})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    await db.task_submissions.update_one({"id": submission_id}, {"$set": {"status": SubmissionStatus.APPROVED}})
    
    await db.users.update_one(
        {"id": submission["user_id"]},
        {
            "$inc": {
                "wallet_balance": task["reward"],
                "total_earned": task["reward"]
            }
        }
    )
    
    await add_transaction(submission["user_id"], TransactionType.CREDIT, task["reward"], f"Task completed: {task['title']}")
    
    return {"message": "Submission approved"}

@api_router.put("/admin/tasks/submissions/{submission_id}/reject")
async def reject_submission(submission_id: str, data: ApproveReject, current_user: dict = Depends(require_admin)):
    submission = await db.task_submissions.find_one({"id": submission_id}, {"_id": 0})
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    await db.task_submissions.update_one(
        {"id": submission_id},
        {"$set": {"status": SubmissionStatus.REJECTED, "rejection_reason": data.reason}}
    )
    
    return {"message": "Submission rejected"}

# Admin Ads
@api_router.get("/admin/ads")
async def get_all_ads(current_user: dict = Depends(require_admin)):
    ads = await db.ads.find({}, {"_id": 0}).to_list(1000)
    return ads

@api_router.post("/admin/ads")
async def create_ad(ad_data: AdCreate, current_user: dict = Depends(require_admin)):
    ad = ad_data.dict()
    ad["id"] = str(uuid.uuid4())
    ad["created_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.ads.insert_one(ad)
    return {"message": "Ad created successfully", "ad_id": ad["id"]}

@api_router.put("/admin/ads/{ad_id}")
async def update_ad(ad_id: str, ad_data: AdCreate, current_user: dict = Depends(require_admin)):
    ad = await db.ads.find_one({"id": ad_id}, {"_id": 0})
    if not ad:
        raise HTTPException(status_code=404, detail="Ad not found")
    
    await db.ads.update_one({"id": ad_id}, {"$set": ad_data.dict()})
    return {"message": "Ad updated successfully"}

@api_router.delete("/admin/ads/{ad_id}")
async def delete_ad(ad_id: str, current_user: dict = Depends(require_admin)):
    result = await db.ads.delete_one({"id": ad_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Ad not found")
    
    return {"message": "Ad deleted successfully"}

# Admin Withdrawals
@api_router.get("/admin/withdrawals")
async def get_all_withdrawals(current_user: dict = Depends(require_admin)):
    withdrawals = await db.withdrawals.find({}, {"_id": 0}).to_list(10000)
    
    for withdrawal in withdrawals:
        user = await db.users.find_one({"id": withdrawal["user_id"]}, {"_id": 0})
        if user:
            withdrawal["user_name"] = user["full_name"]
            withdrawal["user_email"] = user["email"]
            withdrawal["kyc_status"] = user.get("kyc_status")
    
    return withdrawals

@api_router.put("/admin/withdrawals/{withdrawal_id}/approve")
async def approve_withdrawal(withdrawal_id: str, current_user: dict = Depends(require_admin)):
    withdrawal = await db.withdrawals.find_one({"id": withdrawal_id}, {"_id": 0})
    if not withdrawal:
        raise HTTPException(status_code=404, detail="Withdrawal not found")
    
    await db.withdrawals.update_one(
        {"id": withdrawal_id},
        {"$set": {"status": "Approved", "approved_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    await db.transactions.update_one(
        {"user_id": withdrawal["user_id"], "amount": withdrawal["amount"], "type": TransactionType.DEBIT},
        {"$set": {"status": "Completed"}},
        upsert=False
    )
    
    return {"message": "Withdrawal approved"}

@api_router.put("/admin/withdrawals/{withdrawal_id}/reject")
async def reject_withdrawal(withdrawal_id: str, data: ApproveReject, current_user: dict = Depends(require_admin)):
    withdrawal = await db.withdrawals.find_one({"id": withdrawal_id}, {"_id": 0})
    if not withdrawal:
        raise HTTPException(status_code=404, detail="Withdrawal not found")
    
    await db.withdrawals.update_one(
        {"id": withdrawal_id},
        {"$set": {"status": "Rejected", "rejection_reason": data.reason}}
    )
    
    await db.users.update_one({"id": withdrawal["user_id"]}, {"$inc": {"wallet_balance": withdrawal["amount"]}})
    
    return {"message": "Withdrawal rejected and amount refunded"}

# Admin KYC
@api_router.get("/admin/kyc")
async def get_all_kyc(current_user: dict = Depends(require_admin)):
    kycs = await db.kyc.find({}, {"_id": 0}).to_list(10000)
    
    for kyc in kycs:
        user = await db.users.find_one({"id": kyc["user_id"]}, {"_id": 0})
        if user:
            kyc["user_name"] = user["full_name"]
            kyc["user_email"] = user["email"]
    
    return kycs

@api_router.put("/admin/kyc/{user_id}/approve")
async def approve_kyc(user_id: str, current_user: dict = Depends(require_admin)):
    kyc = await db.kyc.find_one({"user_id": user_id}, {"_id": 0})
    if not kyc:
        raise HTTPException(status_code=404, detail="KYC not found")
    
    await db.kyc.update_one({"user_id": user_id}, {"$set": {"status": "Approved"}})
    await db.users.update_one({"id": user_id}, {"$set": {"kyc_status": "Approved"}})
    
    return {"message": "KYC approved"}

@api_router.put("/admin/kyc/{user_id}/reject")
async def reject_kyc(user_id: str, data: ApproveReject, current_user: dict = Depends(require_admin)):
    kyc = await db.kyc.find_one({"user_id": user_id}, {"_id": 0})
    if not kyc:
        raise HTTPException(status_code=404, detail="KYC not found")
    
    await db.kyc.update_one({"user_id": user_id}, {"$set": {"status": "Rejected", "rejection_reason": data.reason}})
    await db.users.update_one({"id": user_id}, {"$set": {"kyc_status": "Rejected"}})
    
    return {"message": "KYC rejected"}

# Admin Uploads
@api_router.get("/admin/uploads")
async def get_all_uploads(current_user: dict = Depends(require_admin)):
    uploads = await db.uploads.find({}, {"_id": 0}).to_list(10000)
    
    for upload in uploads:
        user = await db.users.find_one({"id": upload["user_id"]}, {"_id": 0})
        if user:
            upload["user_name"] = user["full_name"]
            upload["user_email"] = user["email"]
    
    return uploads

@api_router.put("/admin/uploads/{upload_id}/approve")
async def approve_upload(upload_id: str, current_user: dict = Depends(require_admin)):
    upload = await db.uploads.find_one({"id": upload_id}, {"_id": 0})
    if not upload:
        raise HTTPException(status_code=404, detail="Upload not found")
    
    settings = await get_settings()
    reward = settings["upload_reward"]
    
    await db.uploads.update_one({"id": upload_id}, {"$set": {"status": "Approved"}})
    
    await db.users.update_one(
        {"id": upload["user_id"]},
        {
            "$inc": {
                "wallet_balance": reward,
                "total_earned": reward
            }
        }
    )
    
    await add_transaction(upload["user_id"], TransactionType.CREDIT, reward, "Upload & Earn Challenge Reward")
    
    return {"message": "Upload approved"}

@api_router.put("/admin/uploads/{upload_id}/reject")
async def reject_upload(upload_id: str, data: ApproveReject, current_user: dict = Depends(require_admin)):
    upload = await db.uploads.find_one({"id": upload_id}, {"_id": 0})
    if not upload:
        raise HTTPException(status_code=404, detail="Upload not found")
    
    await db.uploads.update_one({"id": upload_id}, {"$set": {"status": "Rejected", "rejection_reason": data.reason}})
    
    return {"message": "Upload rejected"}

# Admin Settings
@api_router.get("/admin/settings")
async def get_admin_settings(current_user: dict = Depends(require_admin)):
    return await get_settings()

@api_router.put("/admin/settings")
async def update_settings(settings_data: SettingsUpdate, current_user: dict = Depends(require_admin)):
    update_data = {k: v for k, v in settings_data.dict().items() if v is not None}
    
    if update_data:
        await db.settings.update_one({}, {"$set": update_data}, upsert=True)
    
    return {"message": "Settings updated successfully"}

# Admin CMS
@api_router.get("/admin/cms")
async def get_cms_pages(current_user: dict = Depends(require_admin)):
    pages = await db.cms_pages.find({}, {"_id": 0}).to_list(100)
    
    if not pages:
        default_pages = [
            {"page_id": "terms", "title": "Terms & Conditions", "content": "Terms and conditions content..."},
            {"page_id": "privacy", "title": "Privacy Policy", "content": "Privacy policy content..."},
            {"page_id": "faq", "title": "FAQ", "content": "Frequently asked questions..."},
            {"page_id": "help", "title": "Help & Support", "content": "Help and support information..."}
        ]
        await db.cms_pages.insert_many(default_pages)
        # Fetch the pages again to exclude _id
        pages = await db.cms_pages.find({}, {"_id": 0}).to_list(100)
    
    return pages

@api_router.put("/admin/cms/{page_id}")
async def update_cms_page(page_id: str, cms_data: CMSUpdate, current_user: dict = Depends(require_admin)):
    await db.cms_pages.update_one(
        {"page_id": page_id},
        {"$set": {"title": cms_data.title, "content": cms_data.content, "updated_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True
    )
    
    return {"message": "Page updated successfully"}

@api_router.get("/cms/{page_id}")
async def get_cms_page(page_id: str):
    page = await db.cms_pages.find_one({"page_id": page_id}, {"_id": 0})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    return page

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
