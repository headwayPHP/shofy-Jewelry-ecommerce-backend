require("dotenv").config();
const express = require("express");
const app = express();
const path = require('path');
const cors = require("cors");
const connectDB = require("./config/db");
const { secret } = require("./config/secret");
const PORT = secret.port || 7000;
const morgan = require('morgan')
// error handler
const globalErrorHandler = require("./middleware/global-error-handler");
// routes
const userRoutes = require("./routes/user.routes");
const categoryRoutes = require("./routes/category.routes");
const promotypeRoutes = require("./routes/promotype.routes");
const colorRoutes = require("./routes/color.routes");
const purityRoutes = require("./routes/purity.routes");
const metalTypeRoutes = require("./routes/metaltype.routes");
const brandRoutes = require("./routes/brand.routes");
const userOrderRoutes = require("./routes/user.order.routes");
const productRoutes = require("./routes/product.routes");
const orderRoutes = require("./routes/order.routes");
const couponRoutes = require("./routes/coupon.routes");
const reviewRoutes = require("./routes/review.routes");
const rateRoutes = require("./routes/rate.routes");
const adminRoutes = require("./routes/admin.routes");
const uploadRouter = require('./routes/uploadFile.routes');
const cloudinaryRoutes = require("./routes/cloudinary.routes");

// middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));

async function syncIndexes() {
  await Category.syncIndexes();
  console.log("Indexes synced successfully");
}

// connect database
connectDB();

app.use("/api/admin/user", userRoutes);
app.use("/api/admin/category", categoryRoutes);
app.use("/api/admin/promotype", promotypeRoutes);
app.use("/api/admin/color", colorRoutes);
app.use("/api/admin/purity", purityRoutes);
app.use("/api/admin/metaltype", metalTypeRoutes);
app.use("/api/admin/brand", brandRoutes);
app.use("/api/admin/product", productRoutes);
app.use('/api/admin/upload', uploadRouter);
app.use("/api/admin/order", orderRoutes);
app.use("/api/admin/coupon", couponRoutes);
app.use("/api/admin/user-order", userOrderRoutes);
app.use("/api/admin/review", reviewRoutes);
app.use("/api/admin/rate", rateRoutes);
app.use("/api/admin/cloudinary", cloudinaryRoutes);
app.use("/api/admin", adminRoutes);
// https://data-asg.goldprice.org/dbXRates/INR
// root route
app.get("/", (req, res) => res.send("Apps worked successfully"));

app.listen(PORT, () => console.log(`server running on port ${PORT}`));

// global error handler
app.use(globalErrorHandler);
//* handle not found
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Not Found',
    errorMessages: [
      {
        path: req.originalUrl,
        message: 'API Not Found',
      },
    ],
  });
  next();
});

module.exports = app;