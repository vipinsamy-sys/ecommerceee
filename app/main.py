import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv, find_dotenv

from database import ping_db
from routes.auth import router as auth_router
from routes.products import router as products_router
from routes.orders import router as orders_router
from routes.admin import router as admin_router
from routes.payment import router as payment_router

load_dotenv(find_dotenv())

app = FastAPI(title='Suguna Backend', version='1.0.0')

origins = [
    'http://localhost:5173',
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(auth_router)
app.include_router(products_router)
app.include_router(orders_router)
app.include_router(admin_router)
app.include_router(payment_router)


@app.on_event('startup')
async def startup_event():
    await ping_db()
    print('MongoDB connected')


@app.get('/')
async def root():
    return {'status': 'ok', 'message': 'Suguna Backend Running'}


if __name__ == '__main__':
    import uvicorn

    uvicorn.run('main:app', host='0.0.0.0', port=int(os.getenv('PORT', 8000)), reload=True)
