# Interior Design Frontend

## Run locally

Start MongoDB, then start the backend from the `backend` directory:

```bash
cd ../backend
npm install
npm run dev
```

The backend runs at `http://localhost:5001`. Port 5000 is avoided because it
may be occupied by macOS AirPlay Receiver.

In a second terminal, start the frontend:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

The frontend API URL can be overridden with `VITE_API_URL`, for example:

```bash
VITE_API_URL=http://localhost:5001/api npm run dev
```
