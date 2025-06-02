# backend_enhanced_with_messaging.py

from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from jose import JWTError, jwt
from passlib.context import CryptContext
from typing import List, Dict
from pydantic import BaseModel
from transformers import pipeline
import PyPDF2
import io
import time
import smtplib
from email.mime.text import MIMEText

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Auth Setup --- #
SECRET_KEY = "supersecretkey"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
users_db = {}

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    to_encode["exp"] = time.time() + ACCESS_TOKEN_EXPIRE_MINUTES * 60
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None or username not in users_db:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        return users_db[username]
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

class RegisterRequest(BaseModel):
    username: str
    password: str
    role: str  # "student" or "tutor"

@app.post("/api/register")
def register_user(request: RegisterRequest):
    if request.username in users_db:
        raise HTTPException(status_code=400, detail="Username already exists")
    hashed_pw = get_password_hash(request.password)
    users_db[request.username] = {"username": request.username, "password": hashed_pw, "role": request.role}
    return {"success": True}

@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = users_db.get(form_data.username)
    if not user or not verify_password(form_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({
        "sub": form_data.username,
        "role": user["role"]  
    })
    
    return {"access_token": token, "token_type": "bearer"}

def send_match_email(to_email, subject, body):
    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = "youremail@example.com"
    msg['To'] = to_email

    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.starttls()
        server.login("youremail@example.com", "your-app-password")
        server.send_message(msg)

# --- AI & Data --- #
classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
students = []
tutors = []
messages = []

class StudentIn(BaseModel):
    name: str
    overall_score: int
    career_interests: str
    address: str
    contact_info: str
    course_scores: Dict[str, int]

@app.post("/api/register-student")
def register_student(student: StudentIn, user=Depends(get_current_user)):
    if user["role"] != "student":
        raise HTTPException(status_code=403, detail="Not authorized")
    student_data = student.dict()
    student_data["id"] = len(students) + 1
    student_data["matched_tutor"] = None
    students.append(student_data)
    return {"success": True, "id": student_data["id"]}

@app.post("/api/register-tutor")
async def register_tutor(
    name: str = Form(...),
    experience: str = Form(...),
    credentials: str = Form(...),
    expertise_courses: str = Form(...),
    address: str = Form(...),
    contact_info: str = Form(...),
    calendly_link: str = Form(...),
    resume: UploadFile = File(...),
    user=Depends(get_current_user)
):
    if user["role"] != "tutor":
        raise HTTPException(status_code=403, detail="Not authorized")

    try:
        pdf_reader = PyPDF2.PdfReader(resume.file)
        resume_text = "".join(page.extract_text() or "" for page in pdf_reader.pages)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"PDF read error: {e}")

    cred_result = classifier(credentials, candidate_labels=["certified", "non-certified"])
    is_certified = cred_result["labels"][0] == "certified"

    match_prompt = f"Cert: {credentials}. Resume: {resume_text}. Does resume support certification?"
    resume_ok = classifier(match_prompt, candidate_labels=["match", "no match"])["labels"][0] == "match"

    if not resume_ok:
        raise HTTPException(status_code=400, detail="Resume does not match credentials")

    tutor = {
        "id": len(tutors) + 1,
        "name": name,
        "experience": experience,
        "credentials": credentials,
        "is_certified": is_certified,
        "expertise_courses": expertise_courses,
        "address": address,
        "contact_info": contact_info,
        "calendly_link": calendly_link,
        "matched_students": [],
    }
    tutors.append(tutor)
    if students:
        student = students[0]
        send_match_email(
            to_email=student["contact_info"],
            subject="You've been matched with a tutor!",
            body=f"Hi {student['name']}, your tutor is {tutor['name']}. Contact: {tutor['contact_info']}, Book: {tutor['calendly_link']}"
        )
        student["matched_tutor"] = tutor["id"]
        tutor["matched_students"].append(student["id"])

    return {"success": True, "id": tutor["id"], "certified": is_certified}

# --- Messaging System --- #
class Message(BaseModel):
    sender: str
    receiver: str
    content: str
    timestamp: float

@app.post("/api/send-message")
def send_message(msg: Message, user=Depends(get_current_user)):
    if user["username"] != msg.sender:
        raise HTTPException(status_code=403, detail="Sender mismatch")
    messages.append(msg.dict())
    return {"success": True}

@app.get("/api/messages")
def get_messages(user=Depends(get_current_user)):
    inbox = [m for m in messages if m["receiver"] == user["username"] or m["sender"] == user["username"]]
    return {"messages": inbox}
