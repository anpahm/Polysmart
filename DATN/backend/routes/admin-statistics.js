const express = require('express');
const router = express.Router();
const Order = require('../models/orderModel');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const { verifyToken, verifyAdmin } = require('../controllers/userController');

// Lấy thống kê cho dashboard admin
router.get('/statistics', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    
    // Tính toán khoảng thời gian dựa trên period
    const now = new Date();
    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(now.getDate() - now.getDay() + 1); // Thứ 2
    currentWeekStart.setHours(0, 0, 0, 0);
    
    const currentWeekEnd = new Date(currentWeekStart);
    currentWeekEnd.setDate(currentWeekStart.getDate() + 6); // Chủ nhật
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

    // Lấy đơn hàng cho khoảng thời gian được chỉ định
    const orders = await Order.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate
      },
      paymentStatus: 'paid'
    });

    // Lấy đơn hàng cho khoảng thời gian trước để so sánh
    const previousOrders = await Order.find({
      createdAt: {
        $gte: lastWeekStart,
        $lte: lastWeekEnd
      },
      paymentStatus: 'paid'
    });

    // Khởi tạo mảng cho 7 ngày (Thứ 2 đến Chủ nhật)
    const sales = new Array(7).fill(0);
    const revenue = new Array(7).fill(0);
    const profit = new Array(7).fill(0);
    const labels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

    // Xử lý đơn hàng theo ngày
    orders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      const dayOfWeek = orderDate.getDay();
      const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Chuyển đổi Chủ nhật (0) thành index 6
      
      sales[dayIndex] += order.items.reduce((sum, item) => sum + item.quantity, 0);
      revenue[dayIndex] += Math.round(order.totalAmount / 1000000); // Chuyển đổi sang triệu VNĐ
      
      // Tính lợi nhuận (giả định 30% tỷ lệ lợi nhuận)
      const orderProfit = order.totalAmount * 0.3;
      profit[dayIndex] += Math.round(orderProfit / 1000000); // Chuyển đổi sang triệu VNĐ
    });

    // Lấy thống kê tổng hợp cho khoảng thời gian
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalProfit = totalRevenue * 0.3;
    const totalProducts = orders.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);

    // Tính thống kê khoảng thời gian trước để so sánh
    const previousTotalOrders = previousOrders.length;
    const previousTotalRevenue = previousOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const previousTotalProducts = previousOrders.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);

    // Tính tỷ lệ tăng trưởng
    const calculateGrowthRate = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous * 100).toFixed(2);
    };

    const orderGrowthRate = calculateGrowthRate(totalOrders, previousTotalOrders);
    const revenueGrowthRate = calculateGrowthRate(totalRevenue, previousTotalRevenue);
    const productGrowthRate = calculateGrowthRate(totalProducts, previousTotalProducts);

    // Lấy thống kê tổng quan (tất cả thời gian)
    const [totalUsers, totalAllOrders, totalProductsInDb] = await Promise.all([
      User.countDocuments({ role: { $ne: 'admin' } }), // Loại trừ admin
      Order.countDocuments(), // Tất cả đơn hàng
      Product.countDocuments() // Tất cả sản phẩm trong database
    ]);

    // Lấy tỷ lệ tăng trưởng người dùng (so sánh với tháng trước)
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthUsers = await User.countDocuments({ 
      role: { $ne: 'admin' },
      createdAt: { $lt: lastMonth }
    });
    const userGrowthRate = calculateGrowthRate(totalUsers, lastMonthUsers);

    // Lấy tỷ lệ tăng trưởng đơn hàng (so sánh với tháng trước)
    const lastMonthOrders = await Order.countDocuments({
      createdAt: { $lt: lastMonth }
    });
    const allOrderGrowthRate = calculateGrowthRate(totalAllOrders, lastMonthOrders);

    // Lấy tỷ lệ tăng trưởng sản phẩm (so sánh với tháng trước)
    const lastMonthProducts = await Product.countDocuments({
      createdAt: { $lt: lastMonth }
    });
    const productDbGrowthRate = calculateGrowthRate(totalProductsInDb, lastMonthProducts);

    // Mô phỏng số lượt xem (trong ứng dụng thực tế, sẽ đến từ analytics)
    const viewCount = Math.floor(Math.random() * 5000) + 3000; // Dữ liệu mô phỏng
    const viewGrowthRate = "0.43"; // Tỷ lệ tăng trưởng mô phỏng

    res.json({
      sales,
      revenue,
      profit,
      labels,
      summary: {
        totalOrders,
        totalRevenue: Math.round(totalRevenue / 1000000), // Chuyển đổi sang triệu VNĐ
        totalProfit: Math.round(totalProfit / 1000000), // Chuyển đổi sang triệu VNĐ
        totalProducts,
        period: period === 'week' ? 'Tuần này' : 'Tuần trước',
        growthRates: {
          orders: orderGrowthRate,
          revenue: revenueGrowthRate,
          products: productGrowthRate
        }
      },
      overall: {
        totalUsers,
        totalAllOrders,
        totalProductsInDb,
        viewCount: viewCount.toLocaleString('vi-VN'),
        growthRates: {
          users: userGrowthRate,
          orders: allOrderGrowthRate,
          products: productDbGrowthRate,
          views: viewGrowthRate
        }
      }
    });

  } catch (error) {
    console.error('Lỗi khi lấy thống kê:', error);
    res.status(500).json({ 
      message: 'Lỗi khi lấy thống kê',
      error: error.message 
    });
  }
});

// Lấy thống kê theo tháng
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
    console.error('Lỗi khi lấy thống kê theo tháng:', error);
    res.status(500).json({ 
      message: 'Lỗi khi lấy thống kê tháng',
      error: error.message 
    });
  }
});

// Lấy thống kê sản phẩm bán chạy
router.get('/statistics/top-products', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const orders = await Order.find({
      createdAt: { $gte: thirtyDaysAgo },
      paymentStatus: 'paid'
    }).populate('items.productId', 'TenSP hinh');

    // Tính doanh số sản phẩm
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

    // Sắp xếp theo tổng số bán và lấy sản phẩm hàng đầu
    const topProducts = Object.values(productStats)
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, parseInt(limit));

    res.json(topProducts);

  } catch (error) {
    console.error('Lỗi khi lấy sản phẩm bán chạy:', error);
    res.status(500).json({ 
      message: 'Lỗi khi lấy sản phẩm bán chạy',
      error: error.message 
    });
  }
});

// Lấy thống kê doanh thu chi tiết
router.get('/statistics/revenue-details', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    let startDate, endDate;
    const now = new Date();
    
    if (period === 'week') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
    } else if (period === 'month') {
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
    } else if (period === 'year') {
      startDate = new Date(now);
      startDate.setFullYear(now.getFullYear() - 1);
    } else {
      startDate = new Date(0); // Tất cả thời gian
    }
    
    endDate = now;

    // Lấy thống kê doanh thu
    const revenueStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          totalRevenue: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 },
          productCount: { $sum: { $sum: '$items.quantity' } }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    // Lấy thống kê trạng thái đơn hàng
    const orderStatusStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);

    // Lấy thống kê phương thức thanh toán
    const paymentMethodStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);

    res.json({
      revenueStats,
      orderStatusStats,
      paymentMethodStats,
      period: period === 'week' ? '7 ngày qua' : period === 'month' ? '30 ngày qua' : period === 'year' ? '1 năm qua' : 'Tất cả thời gian'
    });

  } catch (error) {
    console.error('Lỗi khi lấy thống kê doanh thu chi tiết:', error);
    res.status(500).json({ 
      message: 'Lỗi khi lấy thống kê doanh thu chi tiết',
      error: error.message 
    });
  }
});

// Lấy thống kê thời gian thực
router.get('/statistics/realtime', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Thống kê hôm nay
    const todayOrders = await Order.find({
      createdAt: { $gte: today },
      paymentStatus: 'paid'
    });

    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const todayOrderCount = todayOrders.length;
    const todayProductCount = todayOrders.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);

    // Thống kê hôm qua để so sánh
    const yesterdayOrders = await Order.find({
      createdAt: { $gte: yesterday, $lt: today },
      paymentStatus: 'paid'
    });

    const yesterdayRevenue = yesterdayOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const yesterdayOrderCount = yesterdayOrders.length;
    const yesterdayProductCount = yesterdayOrders.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);

    // Tính tỷ lệ tăng trưởng
    const calculateGrowthRate = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous * 100).toFixed(2);
    };

    // Số đơn hàng chờ xử lý
    const pendingOrders = await Order.countDocuments({ orderStatus: 'confirming' });

    // Đơn hàng gần đây (10 đơn cuối)
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('customerInfo.userId', 'email fullName');

    res.json({
      today: {
        revenue: Math.round(todayRevenue / 1000000), // Chuyển đổi sang triệu VNĐ
        orderCount: todayOrderCount,
        productCount: todayProductCount
      },
      yesterday: {
        revenue: Math.round(yesterdayRevenue / 1000000), // Chuyển đổi sang triệu VNĐ
        orderCount: yesterdayOrderCount,
        productCount: yesterdayProductCount
      },
      growthRates: {
        revenue: calculateGrowthRate(todayRevenue, yesterdayRevenue),
        orders: calculateGrowthRate(todayOrderCount, yesterdayOrderCount),
        products: calculateGrowthRate(todayProductCount, yesterdayProductCount)
      },
      pendingOrders,
      recentOrders
    });

  } catch (error) {
    console.error('Lỗi khi lấy thống kê thời gian thực:', error);
    res.status(500).json({ 
      message: 'Lỗi khi lấy thống kê thời gian thực',
      error: error.message 
    });
  }
});

// Lấy thống kê trạng thái đơn hàng
router.get('/statistics/order-status', verifyToken, verifyAdmin, async (req, res) => {
  try {
    // Tổng hợp đơn hàng theo trạng thái
    const orderStatusStats = await Order.aggregate([
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Ánh xạ mã trạng thái sang nhãn tiếng Việt
    const statusMapping = {
      'delivered': 'Đã giao hàng',
      'shipping': 'Đang vận chuyển',
      'packing': 'Đang đóng gói',
      'confirming': 'Chờ xác nhận',
      'cancelled': 'Đã hủy',
      'pending': 'Chờ xử lý',
      'processing': 'Đang xử lý',
      'received': 'Tiếp nhận'
    };

    // Chuyển đổi dữ liệu cho biểu đồ
    const labels = [];
    const series = [];

    orderStatusStats.forEach(stat => {
      const status = stat._id;
      const label = statusMapping[status] || status;
      labels.push(label);
      series.push(stat.count);
    });

    // Nếu không có dữ liệu, cung cấp giá trị mặc định
    if (labels.length === 0) {
      labels.push('Chờ xác nhận', 'Đã giao hàng', 'Đang vận chuyển', 'Đã hủy');
      series.push(0, 0, 0, 0);
    }

    res.json({
      labels,
      series
    });

  } catch (error) {
    console.error('Lỗi khi lấy thống kê trạng thái đơn hàng:', error);
    res.status(500).json({ 
      message: 'Lỗi khi lấy thống kê trạng thái đơn hàng',
      error: error.message 
    });
  }
});

module.exports = router; 