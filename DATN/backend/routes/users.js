var express = require('express');
var router = express.Router();

const { register, login, verifyToken, getUser, getAllUsers } = require('../controllers/userController');

//Đăng ký
router.post('/register', register);

//Đăng nhập
router.post('/login', login);

//Đăng xuất
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Đăng xuất thành công' });
});

//Lấy thông tin 1 user theo token
router.get('/userinfo', verifyToken, async (req, res) => {
    try {
        await getUser(req, res);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//Lấy tất cả users
router.get('/', getAllUsers);

module.exports = router;
