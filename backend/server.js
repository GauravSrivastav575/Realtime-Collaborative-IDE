import express from "express"; // Import Express
import dotenv from "dotenv"; // Import dotenv for environment variables
import cors from "cors"; // Import cors for handling Cross-Origin Resource Sharing
import bodyParser from "body-parser"; // Import body-parser to parse JSON payloads
import connectDB from "./config/db.js"; // Import the database connection function
import router from "./routes/auth.js";
import userRouter from "./routes/user.js"
import fileRouter from "./routes/file.js"

// Load environment variables
dotenv.config(); 

// Connect to MongoDB
connectDB(); // Calls the function to connect to MongoDB using the connection string from your .env file

// Initialize Express application
const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : "http://localhost:5173",
  credentials: true
};
app.use(cors(corsOptions));

// Body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

app.use("/api/auth", router)
app.use("/api/users", userRouter)
app.use("/api/files", fileRouter)

app.get("/", (req, res) => {
  res.send("API is running...");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something broke!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Start the server
const PORT = process.env.PORT || 5000; // Define the port (default to 5000 if not in .env)
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));