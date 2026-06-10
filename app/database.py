from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
import os

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

print("DEBUG URI =", repr(MONGO_URI))

client = AsyncIOMotorClient(MONGO_URI)