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
        // Tạo một instance mới của userModel với đủ các trường
        const newUser = new userModel({
            Dia_chi: req.body.dia_chi,
            Sdt: req.body.Sdt,
            TenKH: req.body.TenKH,
            email: req.body.email,
            password: hashPassword,
            role: req.body.role || 'user',
            gioi_tinh: req.body.gioi_tinh,
            sinh_nhat: req.body.sinh_nhat,
            username: req.body.username,
            avatar: req.body.avatar,
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
        const user = await userModel.findById(req.userId, {
            password: 0,
            // Loại trừ các trường cũ nếu chúng vẫn tồn tại trong database
            dateOfBirth: 0,
            gender: 0,
            address: 0,
            name: 0, // Trường tên cũ
            phoneNumber: 0 // Trường số điện thoại cũ
        });
        if (!user) {
            throw new Error('Không tìm thấy user');
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Cập nhật thông tin user
const updateUser = [upload.single('avatar'), async (req, res) => {
    try {
        const { TenKH, Sdt, gioi_tinh, sinh_nhat, dia_chi, username } = req.body;
        const userId = req.userId; // Lấy userId từ verifyToken

        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tìm thấy.' });
        }

        // Cập nhật các trường
        user.TenKH = TenKH !== undefined ? TenKH : user.TenKH;
        user.Sdt = Sdt !== undefined ? Sdt : user.Sdt;
        user.gioi_tinh = gioi_tinh !== undefined ? gioi_tinh : user.gioi_tinh;
        user.sinh_nhat = sinh_nhat !== undefined ? sinh_nhat : user.sinh_nhat;
        user.dia_chi = dia_chi !== undefined ? dia_chi : user.dia_chi;
        user.username = username !== undefined ? username : user.username;

        if (req.file) {
            user.avatar = `/images/${req.file.filename}`;
        }

        const updatedUser = await user.save();

        // Trả về thông tin người dùng đã cập nhật, chỉ bao gồm các trường trong schema mới
        const userResponse = {
            _id: updatedUser._id,
            TenKH: updatedUser.TenKH,
            email: updatedUser.email,
            Sdt: updatedUser.Sdt,
            gioi_tinh: updatedUser.gioi_tinh,
            sinh_nhat: updatedUser.sinh_nhat,
            dia_chi: updatedUser.dia_chi,
            username: updatedUser.username,
            avatar: updatedUser.avatar,
            role: updatedUser.role,
        };

        res.json({ message: 'Cập nhật thông tin người dùng thành công', user: userResponse });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}];

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.userId; // Lấy userId từ verifyToken

        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tìm thấy.' });
        }

        // So sánh mật khẩu cũ
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Mật khẩu cũ không đúng.' });
        }

        // Mã hóa mật khẩu mới
        const salt = await bcrypt.genSalt(10);
        const hashNewPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashNewPassword;
        await user.save();

        res.json({ message: 'Đổi mật khẩu thành công!' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

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

//Lấy tất cả users
const getAllUsers = async (req, res) => {
    try {
        const users = await userModel.find({}, { password: 0 }); // Exclude password field
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { register, login, getUser, verifyToken, verifyAdmin, getAllUsers, updateUser, upload, changePassword };