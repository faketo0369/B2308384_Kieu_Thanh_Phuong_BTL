const express = require("express");
const cors = require("cors");
const ApiError = require("./app/api-error");

const sachRouter = require("./app/routes/sach.routes");
const docgiaRouter = require("./app/routes/docgia.routes");
const nhanvienRouter = require("./app/routes/nhanvien.routes");
const nhaxuatbanRouter = require("./app/routes/nhaxuatban.routes");
const muonsachRouter = require("./app/routes/muonsach.routes");
const authRouter = require("./app/routes/auth.routes");
const dashboardRouter = require("./app/routes/dashboard.routes");

const app = express();

app.use(cors());
app.use(express.json());

// API base welcome message
app.get("/", (req, res) => {
    res.json({ message: "Welcome to library book borrowing management application." });
});

// Register routers
app.use("/api/auth", authRouter);
app.use("/api/sach", sachRouter);
app.use("/api/docgia", docgiaRouter);
app.use("/api/nhanvien", nhanvienRouter);
app.use("/api/nhaxuatban", nhaxuatbanRouter);
app.use("/api/muonsach", muonsachRouter);
app.use("/api/dashboard", dashboardRouter);

// Handle 404 response
app.use((req, res, next) => {
    return next(new ApiError(404, "Resource not found"));
});

// Centralized error-handling middleware
app.use((err, req, res, next) => {
    return res.status(err.statusCode || 500).json({
        message: err.message || "Internal Server Error",
    });
});

module.exports = app;
