from flask_sqlalchemy import SQLAlchemy
from pymongo import MongoClient
from config import Config

db = SQLAlchemy()

# MongoDB setup
mongo_client = MongoClient(Config.MONGO_URI)
mongo_db = mongo_client.get_database()

def get_mongo_collection(collection_name):
    """Get a MongoDB collection by name"""
    return mongo_db[collection_name]

def init_mongo():
    """Initialize MongoDB connection"""
    try:
        # Test the connection
        mongo_client.admin.command('ping')
        print("MongoDB connected successfully")
    except Exception as e:
        print(f"MongoDB connection failed: {e}")
