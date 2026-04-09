import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";

const PORT = process.env.PORT || 4000;

if (!process.env.JWT_SECRET) {
  console.error("❌ JWT_SECRET no definido en .env");
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`🚀 API corriendo en http://localhost:${PORT} [${process.env.NODE_ENV || "development"}]`);
});