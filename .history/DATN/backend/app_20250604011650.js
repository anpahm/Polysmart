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
const uploadRouter = require("./routes/upload");
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

app.use(cors());

app.use("/api", indexRouter);
app.use("/api/users", usersRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/products", productsRouter);
app.use("/api/variants", variantRoutes);
app.use("/api/settings", settingsRouter);
app.use("/api/upload", uploadRouter);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
