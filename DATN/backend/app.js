require('dotenv').config();
const mongoose = require("mongoose");

// Require all models before connecting to MongoDB
require('./models/userModel');
require('./models/orderModel');
require('./models/bankTransactionModel');
require('./models/categoryModel');
require('./models/productModel');
require('./models/variantModel');
require('./models/voucherModel');
require('./models/giftVoucherModel');
require('./models/userVoucherModel');
require('./models/newsModel');
require('./models/newsCategoryModel');
require('./models/reviewModel');
require('./models/settingModel');
require('./models/FlashSale');
require('./models/FlashSaleVariant');
require('./models/userEventModel');
require('./models/luckyWheelResultModel');
require('./models/imageReviewModel');

// Connect to MongoDB after models are registered
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/DB_ShopTao")
  .then(() => console.log("MongoDB đã kết nối hẹ hẹ hẹ http://localhost:3000/ "))
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
const newsCategoryRouter = require("./routes/newsCategories");
const newsRouter = require("./routes/news");
const voucherRouter = require('./routes/vouchers');
const giftVoucherRouter = require('./routes/giftVouchers');
const ordersRouter = require('./routes/orders');
const chatAiRouter = require('./routes/chat-ai');
const reviewsRouter = require('./routes/reviews');
const uploadReviewImageRouter = require('./routes/uploadReviewImage');
const userVouchersRouter = require('./routes/userVouchers');
const trackEventRouter = require('./routes/trackEvent');
const bankTransactionsRouter = require('./routes/bankTransactions');
const autoPaymentRouter = require('./routes/autoPayment');
const recommendationsRouter = require('./routes/recommendations');
const aiAdviceRouter = require('./routes/aiAdvice');


var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// app.use(logger("dev")); // Comment để tắt HTTP request logging
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: false, limit: '2mb' }));
app.use(cookieParser());

// Serve static files from public directory
app.use('/images', express.static('public/images'));
app.use('/video', express.static(path.join(__dirname, 'public/video')));
app.use(express.static(path.join(__dirname, "public")));

// Explicitly define CORS options
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002'
  ],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  allowedHeaders: 'Content-Type,Authorization',
};

// Handle preflight requests for CORS
app.options('*', cors(corsOptions)); // Enable pre-flight for all routes with specific options

// Apply CORS for all routes
app.use(cors(corsOptions));

app.use("/api", indexRouter);
app.use("/api/users", usersRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/products", productsRouter);
app.use("/api/variants", variantRoutes);
app.use("/api/settings", settingsRouter);
app.use('/api/flashsales', flashsalesRouter);
app.use("/api/newscategory", newsCategoryRouter);
app.use("/api/news", newsRouter);
app.use('/api/vouchers', voucherRouter);
app.use('/api/gift-vouchers', giftVoucherRouter);
app.use('/api/orders', ordersRouter);
app.use('/api', chatAiRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/upload-review-image', uploadReviewImageRouter);
app.use('/api/user-vouchers', userVouchersRouter);
app.use('/api/track-event', trackEventRouter);
app.use('/api/bank-transactions', bankTransactionsRouter);
app.use('/api/auto-payment', autoPaymentRouter);
app.use('/api/recommendations', recommendationsRouter);
app.use('/api/ai-advice', aiAdviceRouter);
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
