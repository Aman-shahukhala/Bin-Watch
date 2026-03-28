require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/config/db");
const { seedAdmin } = require("./src/controllers/authController");

const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB().then(async () => {
  await seedAdmin();
  app.listen(PORT, () => {
    console.log(`[SERVER] Running at http://localhost:${PORT}`);
  });
});
