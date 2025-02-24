import os
from dotenv import load_dotenv

load_dotenv()

print("Username:", os.getenv("USERNAME"))
print("Password:", os.getenv("PASSWORD"))
