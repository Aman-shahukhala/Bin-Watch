require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/config/db");

const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`[SERVER] Running at http://localhost:${PORT}`);
  });
});
