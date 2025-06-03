var express = require('express');
var router = express.Router();

const { register, login, verifyToken, getUser, getAllUsers, addUser, updateUser, deleteUser } = require('../controllers/userController');

//Đăng ký
router.post('/register', register);

//Đăng nhập
router.post('/login', login);

//Lấy thông tin 1 user theo token
router.get('/userinfo', verifyToken, getUser);

// CRUD cho admin
router.get('/', getAllUsers);
router.post('/', addUser);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
