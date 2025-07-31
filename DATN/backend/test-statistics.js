const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:3000/api';
const TEST_TOKEN = 'your-test-token-here'; // Replace with actual admin token

// Test functions
async function testStatisticsAPI() {
  console.log('🧪 Testing Statistics APIs...\n');

  try {
    // Test 1: Main statistics
    console.log('1. Testing main statistics API...');
    const mainStats = await axios.get(`${BASE_URL}/admin/statistics?period=week`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Main statistics API working');
    console.log('   - Summary:', mainStats.data.summary);
    console.log('   - Overall:', mainStats.data.overall);
    console.log('');

    // Test 2: Real-time statistics
    console.log('2. Testing real-time statistics API...');
    const realtimeStats = await axios.get(`${BASE_URL}/admin/statistics/realtime`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Real-time statistics API working');
    console.log('   - Today:', realtimeStats.data.today);
    console.log('   - Growth rates:', realtimeStats.data.growthRates);
    console.log('   - Pending orders:', realtimeStats.data.pendingOrders);
    console.log('');

    // Test 3: Revenue details
    console.log('3. Testing revenue details API...');
    const revenueDetails = await axios.get(`${BASE_URL}/admin/statistics/revenue-details?period=month`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Revenue details API working');
    console.log('   - Period:', revenueDetails.data.period);
    console.log('   - Order status stats:', revenueDetails.data.orderStatusStats);
    console.log('   - Payment method stats:', revenueDetails.data.paymentMethodStats);
    console.log('');

    console.log('🎉 All tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('💡 Make sure to replace TEST_TOKEN with a valid admin token');
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure the backend server is running on port 3000');
    }
  }
}

// Helper function to generate test data
function generateTestData() {
  console.log('📊 Sample test data structure:');
  console.log(`
  {
    "summary": {
      "totalOrders": 15,
      "totalRevenue": 25,
      "totalProfit": 7.5,
      "totalProducts": 45,
      "period": "Tuần này",
      "growthRates": {
        "orders": "12.5",
        "revenue": "8.3",
        "products": "15.2"
      }
    },
    "overall": {
      "totalUsers": 1250,
      "totalAllOrders": 450,
      "totalProductsInDb": 89,
      "viewCount": "3,456",
      "growthRates": {
        "users": "5.2",
        "orders": "3.1",
        "products": "7.8",
        "views": "0.43"
      }
    }
  }
  `);
}

// Run tests
if (require.main === module) {
  console.log('🚀 Starting Statistics API Tests\n');
  
  if (TEST_TOKEN === 'your-test-token-here') {
    console.log('⚠️  Please replace TEST_TOKEN with a valid admin token');
    console.log('   You can get a token by logging into the admin panel\n');
    generateTestData();
  } else {
    testStatisticsAPI();
  }
}

module.exports = { testStatisticsAPI }; 