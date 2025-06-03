const express = require("express");
const cors = require("cors");
require("dotenv").config();

const userRoutes = require("./routes/userRoutes");
const carRoutes = require("./routes/carRoutes");
const paymentRoutes = require("./routes/paymentRoute");
const verificationRoutes = require("./routes/verificationRoutes");
// const adminRoutes = require('./routes/adminRoutes');
const { connectToDatabase } = require("./config/db");
const bookingRoutes = require("./routes/bookingRoutes");

const app = express();
const port = process.env.PORT || 9000;

// Middleware
const corsOptions = {
  origin: ["http://localhost:5173"],
  credential: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());

// Connect to database
connectToDatabase().catch(console.error);

// Routes
app.use("/users", userRoutes);
app.use("/cars", carRoutes);

app.use("/verifications", verificationRoutes);
app.use("/booking", bookingRoutes)
app.use("/payments", paymentRoutes)
// app.use('/messages', messageRoutes);
// app.use('/admin', adminRoutes);

// Home route
app.get("/", (req, res) => {
  res.send("Hello from Carswap Server...");
});

// Start the server
app.listen(port, () => console.log(`Server running on port ${port}`));
