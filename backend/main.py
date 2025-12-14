from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import user, github, system
import uvicorn

app = FastAPI(title="TideOA Backend")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user.router, prefix="/api", tags=["User"])
app.include_router(github.router, prefix="/api/github", tags=["GitHub"])
app.include_router(system.router, prefix="/api/system", tags=["System"])

@app.get("/")
async def root():
    return {"message": "TideOA Backend is running"}

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
