from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from jose import JWTError, jwt
from passlib.context import CryptContext
from typing import List, Dict
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Text, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import PyPDF2
import time
import smtplib
from email.mime.text import MIMEText
import requests

# FastAPI setup
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./tutormatch.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Models
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String)

class Student(Base):
    __tablename__ = "students"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    overall_score = Column(Integer)
    career_interests = Column(String)
    address = Column(String)
    contact_info = Column(String)
    username = Column(String)
    matched_tutor = Column(Integer, default=None)

class Tutor(Base):
    __tablename__ = "tutors"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    experience = Column(Text)
    credentials = Column(Text)
    is_certified = Column(String)
    expertise_courses = Column(String)
    address = Column(String)
    contact_info = Column(String)
    calendly_link = Column(String)
    username = Column(String)

class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, index=True)
    sender = Column(String)
    receiver = Column(String)
    content = Column(Text)
    timestamp = Column(Float)

Base.metadata.create_all(bind=engine)

# Security and Auth setup
SECRET_KEY = "supersecretkey"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Dependency

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    to_encode["exp"] = time.time() + ACCESS_TOKEN_EXPIRE_MINUTES * 60
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        user = db.query(User).filter(User.username == username).first()
        if user is None:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Models
class RegisterRequest(BaseModel):
    username: str
    password: str
    role: str

class StudentIn(BaseModel):
    name: str
    overall_score: int
    career_interests: str
    address: str
    contact_info: str
    course_scores: Dict[str, int]

class MessageIn(BaseModel):
    sender: str
    receiver: str
    content: str
    timestamp: float

# API Endpoints
@app.post("/api/register")
def register_user(request: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == request.username).first():
        raise HTTPException(status_code=400, detail="Username already exists")
    user = User(username=request.username, password=get_password_hash(request.password), role=request.role)
    db.add(user)
    db.commit()
    return {"success": True}

@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": user.username, "role": user.role})
    return {"access_token": token, "token_type": "bearer"}

@app.post("/api/send-message")
def send_message(msg: MessageIn, user=Depends(get_current_user), db: Session = Depends(get_db)):
    if user.username != msg.sender:
        raise HTTPException(status_code=403, detail="Sender mismatch")
    db_msg = Message(**msg.dict())
    db.add(db_msg)
    db.commit()
    return {"success": True}

@app.get("/api/messages")
def get_messages(user=Depends(get_current_user), db: Session = Depends(get_db)):
    msgs = db.query(Message).filter((Message.sender == user.username) | (Message.receiver == user.username)).all()
    return {"messages": [m.__dict__ for m in msgs]}

# Helper
HF_API_KEY = "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"
def classify_with_huggingface(text, labels):
    headers = {"Authorization": f"Bearer {HF_API_KEY}"}
    json_data = {"inputs": text, "parameters": {"candidate_labels": labels}}
    response = requests.post("https://api-inference.huggingface.co/models/facebook/bart-large-mnli", headers=headers, json=json_data)
    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="HuggingFace API failed")
    return response.json()

def send_match_email(to_email, subject, body):
    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = "youremail@example.com"
    msg['To'] = to_email
    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.starttls()
        server.login("youremail@example.com", "your-app-password")
        server.send_message(msg)
