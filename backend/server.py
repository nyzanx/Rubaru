from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
from bson import ObjectId

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME')]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'duohealth_jwt_secret')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 72

# Create the main app
app = FastAPI(title="DuoHealth API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ==================== MODELS ====================

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    name: str
    couple_id: Optional[str] = None
    onboarding_complete: bool = False
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class InvitePartner(BaseModel):
    invite_code: str

class OnboardingData(BaseModel):
    # Personal info
    age: Optional[int] = None
    weight: Optional[float] = None  # in kg
    height: Optional[float] = None  # in cm
    # Goals
    health_goals: List[str] = []  # weight_loss, muscle_gain, energy, reduce_pain, reduce_stress, better_sleep
    # Diet
    dietary_preferences: List[str] = []  # vegetarian, vegan, pescatarian, keto, etc.
    food_allergies: List[str] = []
    ingredient_dislikes: List[str] = []
    # Schedule
    busiest_days: List[str] = []  # monday, tuesday, etc.
    workout_times: Optional[str] = None  # morning, afternoon, evening
    # Workout preferences
    workout_types: List[str] = []  # gym, running, yoga
    fitness_level: Optional[str] = None  # beginner, intermediate, advanced
    # Menstrual cycle (optional)
    track_cycle: bool = False
    cycle_length: Optional[int] = None
    last_period_date: Optional[str] = None
    # Streak preferences
    grace_period_enabled: bool = True

class DailyLog(BaseModel):
    date: str  # YYYY-MM-DD
    workout_completed: bool = False
    workout_details: Optional[Dict[str, Any]] = None
    meals_logged: List[str] = []  # breakfast, lunch, dinner, snacks
    water_intake: int = 0  # glasses
    energy_level: Optional[int] = None  # 1-5
    pain_level: Optional[int] = None  # 1-5
    pain_location: Optional[str] = None
    mood: Optional[str] = None  # emoji or text
    sleep_hours: Optional[float] = None
    sleep_quality: Optional[int] = None  # 1-5
    # Menstrual (private)
    menstrual_symptoms: Optional[List[str]] = None
    cravings: Optional[str] = None
    # Weight (weekly)
    weight: Optional[float] = None

class WeeklyPlanRequest(BaseModel):
    week_start: str  # YYYY-MM-DD (Monday)
    available_ingredients: Optional[List[str]] = None
    travel_mode: bool = False
    busy_days: Optional[List[str]] = None

class MealSwapRequest(BaseModel):
    date: str
    meal_type: str  # breakfast, lunch, dinner, snack
    available_ingredients: List[str]

class QuickWorkoutRequest(BaseModel):
    date: str
    available_minutes: int = 15

# ==================== HELPER FUNCTIONS ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS),
        "iat": datetime.now(timezone.utc)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def generate_invite_code() -> str:
    return str(uuid.uuid4())[:8].upper()

# ==================== AUTH ENDPOINTS ====================

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    # Check if email exists
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user_id = str(uuid.uuid4())
    invite_code = generate_invite_code()
    
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "password_hash": hash_password(user_data.password),
        "name": user_data.name,
        "couple_id": None,
        "invite_code": invite_code,
        "onboarding_complete": False,
        "onboarding_data": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    
    token = create_token(user_id)
    user_response = UserResponse(
        id=user_id,
        email=user_data.email,
        name=user_data.name,
        couple_id=None,
        onboarding_complete=False,
        created_at=user_doc["created_at"]
    )
    
    return TokenResponse(access_token=token, user=user_response)

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user["id"])
    user_response = UserResponse(
        id=user["id"],
        email=user["email"],
        name=user["name"],
        couple_id=user.get("couple_id"),
        onboarding_complete=user.get("onboarding_complete", False),
        created_at=user["created_at"]
    )
    
    return TokenResponse(access_token=token, user=user_response)

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        name=current_user["name"],
        couple_id=current_user.get("couple_id"),
        onboarding_complete=current_user.get("onboarding_complete", False),
        created_at=current_user["created_at"]
    )

@api_router.get("/auth/invite-code")
async def get_invite_code(current_user: dict = Depends(get_current_user)):
    return {"invite_code": current_user.get("invite_code")}

@api_router.post("/auth/join-partner")
async def join_partner(invite: InvitePartner, current_user: dict = Depends(get_current_user)):
    # Find partner by invite code
    partner = await db.users.find_one({"invite_code": invite.invite_code.upper()}, {"_id": 0})
    if not partner:
        raise HTTPException(status_code=404, detail="Invalid invite code")
    
    if partner["id"] == current_user["id"]:
        raise HTTPException(status_code=400, detail="Cannot pair with yourself")
    
    if partner.get("couple_id"):
        raise HTTPException(status_code=400, detail="Partner is already paired")
    
    if current_user.get("couple_id"):
        raise HTTPException(status_code=400, detail="You are already paired")
    
    # Create couple
    couple_id = str(uuid.uuid4())
    couple_doc = {
        "id": couple_id,
        "partner1_id": partner["id"],
        "partner2_id": current_user["id"],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "streak_count": 0,
        "streak_last_date": None,
        "travel_mode": False,
        "milestones": []
    }
    
    await db.couples.insert_one(couple_doc)
    
    # Update both users
    await db.users.update_one({"id": partner["id"]}, {"$set": {"couple_id": couple_id}})
    await db.users.update_one({"id": current_user["id"]}, {"$set": {"couple_id": couple_id}})
    
    return {"message": "Successfully paired!", "couple_id": couple_id, "partner_name": partner["name"]}

# ==================== ONBOARDING ENDPOINTS ====================

@api_router.post("/onboarding")
async def save_onboarding(data: OnboardingData, current_user: dict = Depends(get_current_user)):
    await db.users.update_one(
        {"id": current_user["id"]},
        {"$set": {
            "onboarding_data": data.model_dump(),
            "onboarding_complete": True
        }}
    )
    return {"message": "Onboarding complete"}

@api_router.get("/onboarding")
async def get_onboarding(current_user: dict = Depends(get_current_user)):
    return current_user.get("onboarding_data") or {}

# ==================== COUPLE ENDPOINTS ====================

@api_router.get("/couple")
async def get_couple(current_user: dict = Depends(get_current_user)):
    couple_id = current_user.get("couple_id")
    if not couple_id:
        return {"paired": False}
    
    couple = await db.couples.find_one({"id": couple_id}, {"_id": 0})
    if not couple:
        return {"paired": False}
    
    # Get partner info
    partner_id = couple["partner1_id"] if couple["partner2_id"] == current_user["id"] else couple["partner2_id"]
    partner = await db.users.find_one({"id": partner_id}, {"_id": 0, "password_hash": 0})
    
    return {
        "paired": True,
        "couple_id": couple_id,
        "streak_count": couple.get("streak_count", 0),
        "streak_last_date": couple.get("streak_last_date"),
        "travel_mode": couple.get("travel_mode", False),
        "milestones": couple.get("milestones", []),
        "partner": {
            "id": partner["id"],
            "name": partner["name"],
            "onboarding_complete": partner.get("onboarding_complete", False)
        }
    }

@api_router.post("/couple/travel-mode")
async def toggle_travel_mode(current_user: dict = Depends(get_current_user)):
    couple_id = current_user.get("couple_id")
    if not couple_id:
        raise HTTPException(status_code=400, detail="Not paired")
    
    couple = await db.couples.find_one({"id": couple_id}, {"_id": 0})
    new_mode = not couple.get("travel_mode", False)
    
    await db.couples.update_one({"id": couple_id}, {"$set": {"travel_mode": new_mode}})
    return {"travel_mode": new_mode}

# ==================== DAILY LOG ENDPOINTS ====================

@api_router.post("/logs")
async def save_daily_log(log: DailyLog, current_user: dict = Depends(get_current_user)):
    log_doc = log.model_dump()
    log_doc["user_id"] = current_user["id"]
    log_doc["couple_id"] = current_user.get("couple_id")
    log_doc["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    # Upsert log
    await db.daily_logs.update_one(
        {"user_id": current_user["id"], "date": log.date},
        {"$set": log_doc},
        upsert=True
    )
    
    # Check if both partners completed today for streak
    await update_streak(current_user.get("couple_id"), log.date)
    
    return {"message": "Log saved"}

async def update_streak(couple_id: str, date: str):
    if not couple_id:
        return
    
    couple = await db.couples.find_one({"id": couple_id}, {"_id": 0})
    if not couple:
        return
    
    # Get both partners' logs for this date
    logs = await db.daily_logs.find({
        "couple_id": couple_id,
        "date": date
    }, {"_id": 0}).to_list(2)
    
    # Check if both completed workout and logged meals
    both_complete = len(logs) == 2 and all(
        log.get("workout_completed") and len(log.get("meals_logged", [])) >= 2
        for log in logs
    )
    
    if both_complete:
        current_streak = couple.get("streak_count", 0)
        last_date = couple.get("streak_last_date")
        
        # Check if this extends the streak or starts new one
        today = datetime.strptime(date, "%Y-%m-%d").date()
        if last_date:
            last = datetime.strptime(last_date, "%Y-%m-%d").date()
            diff = (today - last).days
            if diff == 1:
                new_streak = current_streak + 1
            elif diff == 0:
                new_streak = current_streak  # Same day, no change
            else:
                new_streak = 1  # Gap, restart streak
        else:
            new_streak = 1
        
        # Check for milestones
        milestones = couple.get("milestones", [])
        milestone_triggers = [7, 14, 30, 60, 90, 180, 365]
        new_milestones = []
        for m in milestone_triggers:
            if new_streak >= m and m not in [x.get("days") for x in milestones]:
                new_milestones.append({
                    "days": m,
                    "achieved_at": datetime.now(timezone.utc).isoformat()
                })
        
        await db.couples.update_one(
            {"id": couple_id},
            {"$set": {
                "streak_count": new_streak,
                "streak_last_date": date
            },
            "$push": {"milestones": {"$each": new_milestones}} if new_milestones else {}}
        )

@api_router.get("/logs/{date}")
async def get_daily_log(date: str, current_user: dict = Depends(get_current_user)):
    log = await db.daily_logs.find_one(
        {"user_id": current_user["id"], "date": date},
        {"_id": 0}
    )
    return log or {}

@api_router.get("/logs/couple/{date}")
async def get_couple_logs(date: str, current_user: dict = Depends(get_current_user)):
    couple_id = current_user.get("couple_id")
    if not couple_id:
        return {"logs": []}
    
    logs = await db.daily_logs.find(
        {"couple_id": couple_id, "date": date},
        {"_id": 0, "menstrual_symptoms": 0, "cravings": 0}  # Exclude private data
    ).to_list(2)
    
    return {"logs": logs}

# ==================== WEEKLY PLAN ENDPOINTS ====================

@api_router.get("/plans/current")
async def get_current_plan(current_user: dict = Depends(get_current_user)):
    couple_id = current_user.get("couple_id")
    if not couple_id:
        raise HTTPException(status_code=400, detail="Not paired")
    
    # Get plan for current week
    today = datetime.now(timezone.utc).date()
    # Find Monday of current week
    monday = today - timedelta(days=today.weekday())
    week_start = monday.isoformat()
    
    plan = await db.weekly_plans.find_one(
        {"couple_id": couple_id, "week_start": week_start},
        {"_id": 0}
    )
    
    return plan or {"exists": False, "week_start": week_start}

@api_router.post("/plans/generate")
async def generate_weekly_plan(request: WeeklyPlanRequest, current_user: dict = Depends(get_current_user)):
    couple_id = current_user.get("couple_id")
    if not couple_id:
        raise HTTPException(status_code=400, detail="Not paired")
    
    # Get both partners' data
    couple = await db.couples.find_one({"id": couple_id}, {"_id": 0})
    partner1 = await db.users.find_one({"id": couple["partner1_id"]}, {"_id": 0})
    partner2 = await db.users.find_one({"id": couple["partner2_id"]}, {"_id": 0})
    
    # Generate plan using AI
    plan = await generate_ai_plan(partner1, partner2, request, couple.get("travel_mode", False))
    
    plan_doc = {
        "id": str(uuid.uuid4()),
        "couple_id": couple_id,
        "week_start": request.week_start,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "travel_mode": request.travel_mode or couple.get("travel_mode", False),
        "plan": plan
    }
    
    # Upsert plan
    await db.weekly_plans.update_one(
        {"couple_id": couple_id, "week_start": request.week_start},
        {"$set": plan_doc},
        upsert=True
    )
    
    return plan_doc

async def generate_ai_plan(partner1: dict, partner2: dict, request: WeeklyPlanRequest, travel_mode: bool) -> dict:
    """Generate weekly plan using Claude AI"""
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            logger.warning("No EMERGENT_LLM_KEY, using mock plan")
            return generate_mock_plan(partner1, partner2, request, travel_mode)
        
        chat = LlmChat(
            api_key=api_key,
            session_id=f"plan_{partner1['id']}_{request.week_start}",
            system_message="""You are a fitness and nutrition expert creating personalized weekly plans for couples.
Create plans that are:
- Practical and achievable for busy professionals
- Respectful of dietary restrictions and preferences
- Adjusted for individual fitness levels and goals
- Supportive of doing activities together when possible

Return a JSON object with this structure:
{
  "workouts": [
    {
      "day": "monday",
      "type": "gym" | "running" | "yoga" | "rest",
      "duration_minutes": 30,
      "name": "Full Body Strength",
      "description": "Brief description",
      "exercises": [{"name": "...", "sets": 3, "reps": 12, "partner1_weight": "15kg", "partner2_weight": "10kg"}]
    }
  ],
  "meals": [
    {
      "day": "monday",
      "breakfast": {"name": "...", "prep_time": 10, "ingredients": [...], "partner1_portion": "1.5 cups", "partner2_portion": "1 cup"},
      "lunch": {...},
      "dinner": {...},
      "snacks": [...]
    }
  ],
  "water_targets": {"partner1": 8, "partner2": 6},
  "weekly_tip": "A motivational or practical tip"
}"""
        )
        
        chat.with_model("anthropic", "claude-sonnet-4-20250514")
        
        p1_data = partner1.get("onboarding_data", {})
        p2_data = partner2.get("onboarding_data", {})
        
        prompt = f"""Create a weekly plan for this couple:

Partner 1 ({partner1['name']}):
- Age: {p1_data.get('age', 'unknown')}, Weight: {p1_data.get('weight', 'unknown')}kg, Height: {p1_data.get('height', 'unknown')}cm
- Goals: {', '.join(p1_data.get('health_goals', ['general fitness']))}
- Diet: {', '.join(p1_data.get('dietary_preferences', ['no restrictions']))}
- Allergies: {', '.join(p1_data.get('food_allergies', ['none']))}
- Workout preferences: {', '.join(p1_data.get('workout_types', ['gym', 'running']))}
- Fitness level: {p1_data.get('fitness_level', 'intermediate')}

Partner 2 ({partner2['name']}):
- Age: {p2_data.get('age', 'unknown')}, Weight: {p2_data.get('weight', 'unknown')}kg, Height: {p2_data.get('height', 'unknown')}cm
- Goals: {', '.join(p2_data.get('health_goals', ['general fitness']))}
- Diet: {', '.join(p2_data.get('dietary_preferences', ['no restrictions']))}
- Allergies: {', '.join(p2_data.get('food_allergies', ['none']))}
- Workout preferences: {', '.join(p2_data.get('workout_types', ['gym', 'yoga']))}
- Fitness level: {p2_data.get('fitness_level', 'beginner')}

Week starting: {request.week_start}
Travel mode: {travel_mode}
Available ingredients: {', '.join(request.available_ingredients or ['standard pantry items'])}
Busy days: {', '.join(request.busy_days or [])}

Generate a complete 7-day plan with 5 workout days and 2 rest days. Return only valid JSON."""
        
        response = await chat.send_message(UserMessage(text=prompt))
        
        # Parse JSON from response
        import json
        import re
        
        # Try to extract JSON from the response
        json_match = re.search(r'\{[\s\S]*\}', response)
        if json_match:
            plan = json.loads(json_match.group())
            return plan
        else:
            logger.warning("Could not parse AI response, using mock plan")
            return generate_mock_plan(partner1, partner2, request, travel_mode)
            
    except Exception as e:
        logger.error(f"AI plan generation error: {e}")
        return generate_mock_plan(partner1, partner2, request, travel_mode)

def generate_mock_plan(partner1: dict, partner2: dict, request: WeeklyPlanRequest, travel_mode: bool) -> dict:
    """Generate a mock plan when AI is unavailable"""
    days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    workout_types = ["gym", "running", "yoga", "rest", "gym", "yoga", "rest"]
    
    workouts = []
    for i, day in enumerate(days):
        wtype = workout_types[i]
        if travel_mode and wtype == "gym":
            wtype = "bodyweight"
        
        workout = {
            "day": day,
            "type": wtype,
            "duration_minutes": 30 if wtype != "rest" else 0,
            "name": {
                "gym": "Strength Training",
                "running": "Cardio Run",
                "yoga": "Yoga Flow",
                "bodyweight": "Hotel Room Workout",
                "rest": "Rest Day"
            }.get(wtype, "Rest Day"),
            "description": f"A balanced {wtype} session for both partners",
            "exercises": [] if wtype == "rest" else [
                {"name": "Exercise 1", "sets": 3, "reps": 12},
                {"name": "Exercise 2", "sets": 3, "reps": 10},
                {"name": "Exercise 3", "sets": 3, "reps": 15}
            ]
        }
        workouts.append(workout)
    
    meals = []
    for day in days:
        meal = {
            "day": day,
            "breakfast": {"name": "Overnight Oats", "prep_time": 5, "ingredients": ["oats", "milk", "berries"]},
            "lunch": {"name": "Grilled Chicken Salad", "prep_time": 15, "ingredients": ["chicken", "greens", "tomatoes"]},
            "dinner": {"name": "Salmon with Vegetables", "prep_time": 25, "ingredients": ["salmon", "broccoli", "rice"]},
            "snacks": [{"name": "Greek Yogurt"}, {"name": "Mixed Nuts"}]
        }
        meals.append(meal)
    
    return {
        "workouts": workouts,
        "meals": meals,
        "water_targets": {"partner1": 8, "partner2": 7},
        "weekly_tip": "Remember, consistency is more important than perfection. Show up for each other!"
    }

@api_router.post("/plans/swap-meal")
async def swap_meal(request: MealSwapRequest, current_user: dict = Depends(get_current_user)):
    """Swap a meal based on available ingredients"""
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        import json
        import re
        
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            return {"swapped_meal": {"name": "Quick Veggie Stir-fry", "prep_time": 15, "ingredients": request.available_ingredients[:5]}}
        
        chat = LlmChat(
            api_key=api_key,
            session_id=f"swap_{current_user['id']}_{request.date}",
            system_message="You are a nutrition expert. Suggest a healthy meal alternative based on available ingredients. Return only JSON."
        )
        chat.with_model("anthropic", "claude-sonnet-4-20250514")
        
        prompt = f"""Suggest a healthy {request.meal_type} using these ingredients: {', '.join(request.available_ingredients)}
Return JSON: {{"name": "...", "prep_time": minutes, "ingredients": [...], "instructions": "brief instructions"}}"""
        
        response = await chat.send_message(UserMessage(text=prompt))
        json_match = re.search(r'\{[\s\S]*?\}', response)
        if json_match:
            return {"swapped_meal": json.loads(json_match.group())}
    except Exception as e:
        logger.error(f"Meal swap error: {e}")
    
    return {"swapped_meal": {"name": "Quick Healthy Bowl", "prep_time": 10, "ingredients": request.available_ingredients[:4]}}

@api_router.post("/plans/quick-workout")
async def get_quick_workout(request: QuickWorkoutRequest, current_user: dict = Depends(get_current_user)):
    """Get a shortened version of today's workout"""
    exercises = [
        {"name": "Jumping Jacks", "duration": "30 seconds"},
        {"name": "Push-ups", "reps": 10},
        {"name": "Squats", "reps": 15},
        {"name": "Plank", "duration": "30 seconds"},
        {"name": "Mountain Climbers", "duration": "30 seconds"}
    ]
    
    return {
        "workout": {
            "name": f"{request.available_minutes}-Minute Quick Burn",
            "duration_minutes": request.available_minutes,
            "exercises": exercises[:min(len(exercises), request.available_minutes // 3)]
        }
    }

# ==================== PROGRESS ENDPOINTS ====================

@api_router.get("/progress/stats")
async def get_progress_stats(current_user: dict = Depends(get_current_user)):
    """Get user's progress statistics"""
    user_id = current_user["id"]
    
    # Get all logs for this user
    logs = await db.daily_logs.find({"user_id": user_id}, {"_id": 0}).to_list(100)
    
    if not logs:
        return {
            "total_workouts": 0,
            "total_meals_logged": 0,
            "avg_water": 0,
            "avg_energy": 0,
            "avg_sleep": 0,
            "weight_trend": [],
            "recent_logs": []
        }
    
    total_workouts = sum(1 for log in logs if log.get("workout_completed"))
    total_meals = sum(len(log.get("meals_logged", [])) for log in logs)
    
    water_logs = [log.get("water_intake", 0) for log in logs if log.get("water_intake")]
    energy_logs = [log.get("energy_level") for log in logs if log.get("energy_level")]
    sleep_logs = [log.get("sleep_hours") for log in logs if log.get("sleep_hours")]
    weight_logs = [{"date": log["date"], "weight": log.get("weight")} for log in logs if log.get("weight")]
    
    return {
        "total_workouts": total_workouts,
        "total_meals_logged": total_meals,
        "avg_water": sum(water_logs) / len(water_logs) if water_logs else 0,
        "avg_energy": sum(energy_logs) / len(energy_logs) if energy_logs else 0,
        "avg_sleep": sum(sleep_logs) / len(sleep_logs) if sleep_logs else 0,
        "weight_trend": sorted(weight_logs, key=lambda x: x["date"])[-10:],
        "recent_logs": sorted(logs, key=lambda x: x["date"], reverse=True)[:7]
    }

@api_router.get("/progress/weekly-summary")
async def get_weekly_summary(current_user: dict = Depends(get_current_user)):
    """Get summary for the current week"""
    today = datetime.now(timezone.utc).date()
    monday = today - timedelta(days=today.weekday())
    
    # Get logs for this week
    week_dates = [(monday + timedelta(days=i)).isoformat() for i in range(7)]
    
    logs = await db.daily_logs.find({
        "user_id": current_user["id"],
        "date": {"$in": week_dates}
    }, {"_id": 0}).to_list(7)
    
    completed_days = sum(1 for log in logs if log.get("workout_completed"))
    
    return {
        "week_start": monday.isoformat(),
        "days_completed": completed_days,
        "days_remaining": 7 - len(logs),
        "completion_percentage": round((completed_days / 7) * 100),
        "logs": {log["date"]: log for log in logs}
    }

# ==================== GROCERY LIST ====================

@api_router.get("/grocery-list")
async def get_grocery_list(current_user: dict = Depends(get_current_user)):
    """Generate grocery list from current week's meal plan"""
    couple_id = current_user.get("couple_id")
    if not couple_id:
        return {"items": []}
    
    today = datetime.now(timezone.utc).date()
    monday = today - timedelta(days=today.weekday())
    week_start = monday.isoformat()
    
    plan = await db.weekly_plans.find_one(
        {"couple_id": couple_id, "week_start": week_start},
        {"_id": 0}
    )
    
    if not plan or "plan" not in plan:
        return {"items": []}
    
    # Extract ingredients from meals
    ingredients = {}
    for meal_day in plan["plan"].get("meals", []):
        for meal_type in ["breakfast", "lunch", "dinner"]:
            meal = meal_day.get(meal_type, {})
            for ing in meal.get("ingredients", []):
                if isinstance(ing, str):
                    ingredients[ing.lower()] = ingredients.get(ing.lower(), 0) + 1
    
    # Group by category (simplified)
    categorized = {
        "produce": [],
        "protein": [],
        "dairy": [],
        "grains": [],
        "other": []
    }
    
    produce_keywords = ["tomato", "lettuce", "broccoli", "spinach", "carrot", "onion", "garlic", "pepper", "berries", "banana", "apple"]
    protein_keywords = ["chicken", "salmon", "beef", "fish", "tofu", "eggs", "turkey"]
    dairy_keywords = ["milk", "cheese", "yogurt", "butter", "cream"]
    grains_keywords = ["rice", "oats", "bread", "pasta", "quinoa"]
    
    for ing, count in ingredients.items():
        item = {"name": ing.title(), "quantity": count}
        if any(k in ing for k in produce_keywords):
            categorized["produce"].append(item)
        elif any(k in ing for k in protein_keywords):
            categorized["protein"].append(item)
        elif any(k in ing for k in dairy_keywords):
            categorized["dairy"].append(item)
        elif any(k in ing for k in grains_keywords):
            categorized["grains"].append(item)
        else:
            categorized["other"].append(item)
    
    return {"categories": categorized}

# ==================== BASE ROUTES ====================

@api_router.get("/")
async def root():
    return {"message": "DuoHealth API", "version": "1.0.0"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
