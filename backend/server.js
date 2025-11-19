const dotenv = require("dotenv");
dotenv.config(); // Loads .env from current directory (backend/.env)

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const db = require("./config/db");

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  process.env.FRONTEND_URL,
  "https://redragoncolombo.lk",
  "https://www.redragoncolombo.lk",
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log("CORS blocked origin:", origin);
      console.log("📋 Allowed origins:", allowedOrigins);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(cookieParser());

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  if (process.env.NODE_ENV === "production") {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );
  }
  next();
});

const path = require("path");
const uploadsPath = path.join(__dirname, "uploads");
console.log("Setting up static files at:", uploadsPath);

app.use("/uploads", (req, res, next) => {
  console.log("Static file request:", req.url);
  next();
});

app.use("/uploads", express.static(uploadsPath));

// Routes
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const imageRoutes = require("./routes/images");
const refundRoutes = require("./routes/refunds");
const deliveryRoutes = require("./routes/delivery");
const brandRoutes = require("./routes/brands");
const categoryRoutes = require("./routes/categories");
const cartRoutes = require("./routes/cart");
const locationRoutes = require("./routes/locations");
const addressRoutes = require("./routes/addresses");
const payhereRoutes = require("./routes/payhere");
// const kokoPaymentRoutes = require("./routes/kokoPayment");
const orderRoutes = require("./routes/orders");
const wishlistRoutes = require("./routes/wishlist");
const customerRoutes = require("./routes/customers");
const dashboardRoutes = require("./routes/dashboard");
const salesRoutes = require("./routes/sales");
const promoRoutes = require("./routes/promo");
const reviewRoutes = require("./routes/reviews");
const carouselRoutes = require("./routes/carousel");

// Create product promo router
const productPromoRouter = express.Router();

// Debug route
productPromoRouter.get('/debug', (req, res) => {
  res.json({ message: "Hello World - ProductPromo route is working!" });
});

// Get active promotional messages (public endpoint)
productPromoRouter.get('/active', async (req, res) => {
  try {
    const query = "SELECT * FROM product_promo_messages WHERE is_active = 1 ORDER BY created_at DESC";
    const [rows] = await db.executeWithRetry(query);
    
    res.status(200).json({
      success: true,
      message: 'Active promotional messages retrieved successfully',
      data: rows
    });
  } catch (error) {
    console.error('Promo active error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve promotional messages',
      error: error.message
    });
  }
});

console.log("✅ ProductPromo routes configured inline");

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/refunds", refundRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/payhere", payhereRoutes);
// app.use("/api/koko-payment", kokoPaymentRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/promo", promoRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/carousel", carouselRoutes);
app.use("/api/product-promo", productPromoRouter);


app.get("/", (req, res) => {
  res.json({ message: "Welcome to Redragon Shop API" });
});

// Test endpoint for promotional messages
app.get("/api/test-promo", (req, res) => {
  res.json({ 
    message: "Promotional messages route test", 
    timestamp: new Date().toISOString(),
    status: "working"
  });
});

// Test route for static files
app.get("/test-upload", (req, res) => {
  res.json({ message: "Upload test route working" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ msg: "Internal server error" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
