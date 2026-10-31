# feature-2-backend

Event Auction System Backend (Node.js, Express, MongoDB Atlas).

## 🏛️ Layered Architecture
Strictly follows the layered principle:
```
Routes ➔ Controller ➔ Service ➔ Repository ➔ Database (MongoDB Atlas)
```

- **Routes (`src/routes/auctionRoutes.js`)**: Endpoints routing to controllers.
- **Controller (`src/controllers/auctionController.js`)**: Request/response handling, input validation, try/catch error wrapping.
- **Service (`src/services/auctionService.js`)**: Auction business logic, bid validation, timer checks, winner resolution.
- **Repository (`src/repositories/auctionRepository.js`)**: Database queries with MongoDB Atlas & Mongoose.
- **Model (`src/models/Auction.js`)**: Mongoose schema for auction lot, bids, and winner.

## 🚀 Environment Variables
Create a `.env` file in the root of the backend:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/event_auction?retryWrites=true&w=majority
```

## 📦 Setup & Run

```bash
# Install dependencies
npm install

# Start server
npm start
# or for development
npm run dev
```

## 📡 API Endpoints

- `GET /api/auction` — Fetch current auction item, highest bid, and bid history.
- `POST /api/auction/bid` — Submit a new bid (`{ auctionId, bidderName, amount }`).
- `POST /api/auction/reset` — Reset the auction countdown timer or starting price.
- `GET /api/health` — API health check.
