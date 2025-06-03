//chèn multer để upload file
const multer = require('multer');
const storage = multer.diskStorage({
  destination: function(req, file, cb){
    cb(null, './public/images')
  },
  filename: function(req, file, cb){
    cb(null, file.originalname)
  }
})
const checkfile = (req, file, cb) => {
  if(!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)){
    return cb(new Error('Bạn chỉ được upload file ảnh'))
  }
  return cb(null, true)
}
const upload = multer({storage: storage, fileFilter: checkfile})

////////////////////////////
const userModel = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = [upload.single('img'), async (req, res) => {
    try {
        // Kiểm tra email đã tồn tại chưa bằng hàm findOne()
        const checkUser = await userModel.findOne({
            email: req.body.email
        });
        if (checkUser) {
            throw new Error('Email đã tồn tại');
        }
        // Mã hóa mật khẩu bằng bcrypt
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(req.body.password, salt);
        // Tạo một instance mới của userModel
        const newUser = new userModel({
            email: req.body.email,
            password: hashPassword
        });
        // Lưu vào database bằng hàm save()
        const data = await newUser.save();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
]

const login = [upload.single('img'), async (req, res) => {
    try {
        // Kiểm tra email có tồn tại không
        console.log(req.body);
        const checkUser = await userModel.findOne({
            email: req.body.email
        });
        console.log(checkUser);
        if (!checkUser) {
            throw new Error('Email không tồn tại');
        }
        // So sánh mật khẩu
        const isMatch = await bcrypt.compare(req.body.password, checkUser.password);
        if (!isMatch) {
            throw new Error('Mật khẩu không đúng');
        }
        // Tạo token với mã bí mật là 'secretkey' và thời gian sống là 1 giờ
        const token = jwt.sign({ id: checkUser._id, email: checkUser.email, role: checkUser.role }, 'conguoiyeuchua', { expiresIn: '1h' });
        res.json(token);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
]

//Bảo mật token
const verifyToken = (req, res, next) => {
    // Lấy token từ header
    const token = req.headers.authorization.slice(7);
    console.log(token);
    if (!token) {
        return res.status(403).json({ message: 'Không có token' });
    }
    // Xác thực token với mã bí mật
    jwt.verify(token, 'conguoiyeuchua', (err, decoded) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token đã hết hạn' });
            } else if (err.name === 'JsonWebTokenError') {
                return res.status(401).json({ message: 'Token không hợp lệ' });
            }
            return res.status(401).json({ message: 'Lỗi xác thực token' });
        }
        // decoded chứa thông tin user đã mã hóa trong token và lưu vào req
        req.userId = decoded.id; 
        next();
    });
}

//lấy thông tin user khi có token
const getUser = async (req, res) => {
    try {
        const user = await userModel.findById(req.userId, { password: 0 });
        if (!user) {
            throw new Error('Không tìm thấy user');
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

//xác thực admin 
const verifyAdmin = async (req, res, next) => {
    try {
        // Lấy thông tin user từ id lưu trong req khi đã xác thực token
        const user= await userModel.findById(req.userId);
        console.log(user);
        console.log(user.role);
        if (!user) {
            throw new Error('Không tìm thấy user');
        }
        if (user.role !== 'admin') {
            throw new Error('Không có quyền truy cập');
        }
        next();
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Lấy tất cả user
const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Thêm user
const addUser = async (req, res) => {
  try {
    const newUser = new userModel(req.body);
    const saved = await newUser.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Sửa user
const updateUser = async (req, res) => {
  try {
    const updated = await userModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Không tìm thấy user để cập nhật' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa user
const deleteUser = async (req, res) => {
  try {
    const deleted = await userModel.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Không tìm thấy user để xóa' });
    res.json({ message: 'Đã xóa user thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, getUser, verifyToken, verifyAdmin, getAllUsers, addUser, updateUser, deleteUser };