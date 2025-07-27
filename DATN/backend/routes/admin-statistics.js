const express = require('express');
const router = express.Router();
const Order = require('../models/orderModel');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const { verifyToken, verifyAdmin } = require('../controllers/userController');

// Get statistics for admin dashboard
router.get('/statistics', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    
    // Calculate date range based on period
    const now = new Date();
    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(now.getDate() - now.getDay() + 1); // Monday
    currentWeekStart.setHours(0, 0, 0, 0);
    
    const currentWeekEnd = new Date(currentWeekStart);
    currentWeekEnd.setDate(currentWeekStart.getDate() + 6); // Sunday
    currentWeekEnd.setHours(23, 59, 59, 999);
    
    const lastWeekStart = new Date(currentWeekStart);
    lastWeekStart.setDate(currentWeekStart.getDate() - 7);
    
    const lastWeekEnd = new Date(currentWeekEnd);
    lastWeekEnd.setDate(currentWeekEnd.getDate() - 7);
    
    let startDate, endDate;
    
    if (period === 'week') {
      startDate = currentWeekStart;
      endDate = currentWeekEnd;
    } else {
      startDate = lastWeekStart;
      endDate = lastWeekEnd;
    }

    // Get orders for the specified period
    const orders = await Order.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate
      },
      paymentStatus: 'paid'
    });

    // Initialize arrays for 7 days (Monday to Sunday)
    const sales = new Array(7).fill(0);
    const revenue = new Array(7).fill(0);
    const profit = new Array(7).fill(0);
    const labels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

    // Process orders by day
    orders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      const dayOfWeek = orderDate.getDay();
      const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert Sunday (0) to index 6
      
      sales[dayIndex] += order.items.reduce((sum, item) => sum + item.quantity, 0);
      revenue[dayIndex] += Math.round(order.totalAmount / 1000000); // Convert to millions VND
      
      // Calculate profit (assuming 30% profit margin)
      const orderProfit = order.totalAmount * 0.3;
      profit[dayIndex] += Math.round(orderProfit / 1000000); // Convert to millions VND
    });

    // Get summary statistics for the period
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalProfit = totalRevenue * 0.3;
    const totalProducts = orders.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);

    // Get overall statistics (all time)
    const [totalUsers, totalAllOrders, totalProductsInDb] = await Promise.all([
      User.countDocuments({ role: { $ne: 'admin' } }), // Exclude admin users
      Order.countDocuments(), // All orders
      Product.countDocuments() // All products in database
    ]);

    res.json({
      sales,
      revenue,
      profit,
      labels,
      summary: {
        totalOrders,
        totalRevenue: Math.round(totalRevenue / 1000000), // Convert to millions VND
        totalProfit: Math.round(totalProfit / 1000000), // Convert to millions VND
        totalProducts,
        period: period === 'week' ? 'Tuần này' : 'Tuần trước'
      },
      overall: {
        totalUsers,
        totalAllOrders,
        totalProductsInDb
      }
    });

  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ 
      message: 'Lỗi khi lấy thống kê',
      error: error.message 
    });
  }
});

// Get monthly statistics
router.get('/statistics/monthly', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { year = new Date().getFullYear(), month = new Date().getMonth() + 1 } = req.query;
    
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    
    const orders = await Order.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate
      },
      paymentStatus: 'paid'
    });

    const daysInMonth = endDate.getDate();
    const dailyRevenue = new Array(daysInMonth).fill(0);
    const dailySales = new Array(daysInMonth).fill(0);
    const labels = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`);

    orders.forEach(order => {
      const day = order.createdAt.getDate() - 1;
      dailyRevenue[day] += Math.round(order.totalAmount / 1000000);
      dailySales[day] += order.items.reduce((sum, item) => sum + item.quantity, 0);
    });

    res.json({
      revenue: dailyRevenue,
      sales: dailySales,
      labels,
      period: `Tháng ${month}/${year}`
    });

  } catch (error) {
    console.error('Error fetching monthly statistics:', error);
    res.status(500).json({ 
      message: 'Lỗi khi lấy thống kê tháng',
      error: error.message 
    });
  }
});

// Get top products statistics
router.get('/statistics/top-products', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const orders = await Order.find({
      createdAt: { $gte: thirtyDaysAgo },
      paymentStatus: 'paid'
    }).populate('items.productId', 'TenSP hinh');

    // Calculate product sales
    const productStats = {};
    
    orders.forEach(order => {
      order.items.forEach(item => {
        const productId = item.productId._id.toString();
        if (!productStats[productId]) {
          productStats[productId] = {
            productId: item.productId._id,
            name: item.productId.TenSP,
            image: item.productId.hinh,
            totalSold: 0,
            totalRevenue: 0
          };
        }
        productStats[productId].totalSold += item.quantity;
        productStats[productId].totalRevenue += item.price * item.quantity;
      });
    });

    // Sort by total sold and get top products
    const topProducts = Object.values(productStats)
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, parseInt(limit));

    res.json(topProducts);

  } catch (error) {
    console.error('Error fetching top products:', error);
    res.status(500).json({ 
      message: 'Lỗi khi lấy sản phẩm bán chạy',
      error: error.message 
    });
  }
});

module.exports = router; 