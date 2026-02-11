import os

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Get the address of the database from docker credentials
# We use f-strings to build the connection string securely
DATABASE_URL = f"postgresql://{os.getenv('POSTGRES_USER')}:{os.getenv('POSTGRES_PASSWORD')}@db:5432/{os.getenv('POSTGRES_DB')}"

# Create the Engine (The Connection Pool)
# This sits globally in memory and manages connections
engine = create_engine(DATABASE_URL)

# Create the SessionFactory
# When a user request comes in, we ask this factory: "Give me a session"
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create the Base Model
# All our database tables (Models) will inherit from this class
Base = declarative_base()


# The Dependency (The Safety Valve)
# This function is used by FastAPI to manage the lifecycle of a request
def get_db():
    db = SessionLocal()
    try:
        yield db  # Provide the session to the route
    finally:
        db.close()  # GUARANTEE: Close it when the request is done
