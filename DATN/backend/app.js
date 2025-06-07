const mongoose = require("mongoose");
mongoose
  .connect("mongodb://127.0.0.1:27017/DB_ShopTao")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

var cors = require("cors");
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var categoriesRouter = require("./routes/categories");
var productsRouter = require("./routes/products");
const variantRoutes = require("./routes/variants");
const settingsRouter = require("./routes/settings");
const flashsalesRouter = require('./routes/flashsales');
var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Serve static files from public directory
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use('/video', express.static(path.join(__dirname, 'public/video')));
app.use(express.static(path.join(__dirname, "public")));

app.use(cors({
  origin: [
    'http://localhost:3001',
    'http://localhost:3002'
  ], // Cho phép nhiều origin
  credentials: true
}));

app.use("/api", indexRouter);
app.use("/api/users", usersRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/products", productsRouter);
app.use("/api/variants", variantRoutes);
app.use("/api/settings", settingsRouter);
app.use('/api/flashsales', flashsalesRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// error handler
app.use(function (err, req, res, next) {
  // Log error for debugging
  console.error('Error:', err);

  // Set status code
  const statusCode = err.status || 500;

  // Return JSON response
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

module.exports = app;
