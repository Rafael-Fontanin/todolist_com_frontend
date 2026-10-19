# TodoList — Frontend (React + Vite)

## Como rodar
1. Suba o banco (`backend/schema.sql`) e o backend: `cd backend && npm install && npm run dev` (porta 3333).
2. Em outro terminal: `cd frontend && npm install && npm run dev` → http://localhost:5173

O Vite faz proxy de `/api` para `http://localhost:3333` (ajustável com `VITE_BACKEND_URL`),
então não é preciso mexer no CORS do backend.
Para apontar direto a outro host, defina `VITE_API_URL` (e libere PATCH/DELETE no CORS do backend).
