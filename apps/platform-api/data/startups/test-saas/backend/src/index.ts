import datasyncRoutes from "./routes/datasync.routes";
import integrationRoutes from "./routes/integration.routes";
import customerRoutes from "./routes/customer.routes";

import express from "express";
import cors from "cors";
import { connectDB } from "./db";
import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./auth/auth.routes";
import { seedAdmin } from "./seed/seedAdmin";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);

app.use("/api/customers", customerRoutes);
app.use("/api/integrations", integrationRoutes);
app.use("/api/datasyncs", datasyncRoutes);
// Routes auto-mounted later by CRUD generator

app.use(errorHandler);

async function start() {
  await connectDB();
  await seedAdmin();

  app.listen(4000, () => {
    console.log("🚀 Backend running on port 4000");
  });
}

start();
