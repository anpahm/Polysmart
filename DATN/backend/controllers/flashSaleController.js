const FlashSale = require('../models/FlashSale');
const FlashSaleVariant = require('../models/FlashSaleVariant');
const Variant = require('../models/variantModel'); // Đổi tên biến import
const Product = require('../models/productModel'); // Đảm bảo đúng tên model

// Lấy tất cả các biến thể flash sale (không điều kiện)
exports.getAllFlashSales = async (req, res) => {
  try {
    const flashSales = await FlashSale.find({})
      .populate({
        path: 'flashSaleVariants',
        model: 'FlashSaleVariant',
        populate: {
          path: 'id_variant',
          model: 'Variant',
          populate: { path: 'id_san_pham', model: 'products' }
        }
      })
      .exec();

    const formattedData = flashSales.map(fs => {
      const variantsData = fs.flashSaleVariants.map(fsv => ({
        id_variant: fsv.id_variant ? fsv.id_variant._id : null,
        gia_flash_sale: fsv.gia_flash_sale,
        so_luong: fsv.so_luong,
        da_ban: fsv.da_ban,
        product_name: fsv.id_variant && fsv.id_variant.id_san_pham ? fsv.id_variant.id_san_pham.TenSP : 'N/A',
        variant_details: fsv.id_variant ? `${fsv.id_variant.dung_luong} - ${fsv.id_variant.mau} (Giá gốc: ${fsv.id_variant.gia})` : 'N/A',
        product_id: fsv.id_variant && fsv.id_variant.id_san_pham ? fsv.id_variant.id_san_pham._id : null,
        product_image: fsv.id_variant && fsv.id_variant.id_san_pham ? fsv.id_variant.id_san_pham.hinh : null,
      }));

      return {
        _id: fs._id,
        ten_su_kien: fs.ten_su_kien,
        thoi_gian_bat_dau: fs.thoi_gian_bat_dau,
        thoi_gian_ket_thuc: fs.thoi_gian_ket_thuc,
        an_hien: fs.an_hien,
        flashSaleVariants: variantsData,
      };
    });

    res.status(200).json({ data: formattedData });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách flash sales:", error);
    res.status(500).json({ message: error.message });
  }
};

// Lấy chỉ các Flash Sale đang hoạt động (trong thời gian diễn ra và có an_hien = true)
exports.getActiveFlashSales = async (req, res) => {
  try {
    const now = new Date();
    
    const flashSales = await FlashSale.find({
      an_hien: true,
      thoi_gian_bat_dau: { $lte: now },
      thoi_gian_ket_thuc: { $gte: now }
    })
      .populate({
        path: 'flashSaleVariants',
        model: 'FlashSaleVariant',
        populate: {
          path: 'id_variant',
          model: 'Variant',
          populate: { path: 'id_san_pham', model: 'products' }
        }
      })
      .exec();

    const formattedData = flashSales.map(fs => {
      const variantsData = fs.flashSaleVariants.map(fsv => ({
        id_variant: fsv.id_variant ? fsv.id_variant._id : null,
        gia_flash_sale: fsv.gia_flash_sale,
        so_luong: fsv.so_luong,
        da_ban: fsv.da_ban,
        product_name: fsv.id_variant && fsv.id_variant.id_san_pham ? fsv.id_variant.id_san_pham.TenSP : 'N/A',
        variant_details: fsv.id_variant ? `${fsv.id_variant.dung_luong} - ${fsv.id_variant.mau} (Giá gốc: ${fsv.id_variant.gia})` : 'N/A',
        product_id: fsv.id_variant && fsv.id_variant.id_san_pham ? fsv.id_variant.id_san_pham._id : null,
        product_image: fsv.id_variant && fsv.id_variant.id_san_pham ? fsv.id_variant.id_san_pham.hinh : null,
      }));

      return {
        _id: fs._id,
        ten_su_kien: fs.ten_su_kien,
        thoi_gian_bat_dau: fs.thoi_gian_bat_dau,
        thoi_gian_ket_thuc: fs.thoi_gian_ket_thuc,
        an_hien: fs.an_hien,
        flashSaleVariants: variantsData,
      };
    });

    res.status(200).json({ data: formattedData });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách flash sales đang hoạt động:", error);
    res.status(500).json({ message: error.message });
  }
};

// Các hàm CRUD cơ bản cho FlashSale (có thể mở rộng sau)
exports.getFlashSaleById = async (req, res) => {
  try {
    const flashSale = await FlashSale.findById(req.params.id)
      .populate({
        path: 'flashSaleVariants',
        model: 'FlashSaleVariant',
        populate: {
          path: 'id_variant',
          model: 'Variant',
          populate: { path: 'id_san_pham', model: 'products' }
        }
      })
      .exec();

    if (!flashSale) return res.status(404).json({ message: 'Không tìm thấy Flash Sale' });

    const variantsData = flashSale.flashSaleVariants.map(fsv => ({
      id_variant: fsv.id_variant ? fsv.id_variant._id : null,
      gia_flash_sale: fsv.gia_flash_sale,
      so_luong: fsv.so_luong,
      da_ban: fsv.da_ban,
      product_name: fsv.id_variant && fsv.id_variant.id_san_pham ? fsv.id_variant.id_san_pham.TenSP : 'N/A',
      variant_details: fsv.id_variant ? `${fsv.id_variant.dung_luong} - ${fsv.id_variant.mau} (Giá gốc: ${fsv.id_variant.gia})` : 'N/A',
      product_id: fsv.id_variant && fsv.id_variant.id_san_pham ? fsv.id_variant.id_san_pham._id : null,
      product_image: fsv.id_variant && fsv.id_variant.id_san_pham ? fsv.id_variant.id_san_pham.hinh : null,
    }));

    const formattedFlashSale = {
      _id: flashSale._id,
      ten_su_kien: flashSale.ten_su_kien,
      thoi_gian_bat_dau: flashSale.thoi_gian_bat_dau,
      thoi_gian_ket_thuc: flashSale.thoi_gian_ket_thuc,
      an_hien: flashSale.an_hien,
      flashSaleVariants: variantsData,
    };

    res.status(200).json(formattedFlashSale);
  } catch (error) {
    console.error("Lỗi khi lấy Flash Sale theo ID:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.createFlashSale = async (req, res) => {
  const { ten_su_kien, thoi_gian_bat_dau, thoi_gian_ket_thuc, an_hien, flashSaleVariants } = req.body;

  try {
    // Create the main FlashSale event
    const newFlashSaleEvent = new FlashSale({
      ten_su_kien,
      thoi_gian_bat_dau,
      thoi_gian_ket_thuc,
      an_hien,
    });
    const savedFlashSaleEvent = await newFlashSaleEvent.save();

    // Create and save FlashSaleVariant for each selected variant
    const createdFlashSaleVariants = [];
    if (flashSaleVariants && flashSaleVariants.length > 0) {
      for (const variantData of flashSaleVariants) {
        const newFlashSaleVariant = new FlashSaleVariant({
          id_flash_sale: savedFlashSaleEvent._id,
          id_variant: variantData.id_variant,
          gia_flash_sale: variantData.gia_flash_sale,
          so_luong: variantData.so_luong,
        });
        createdFlashSaleVariants.push(await newFlashSaleVariant.save());
      }
    }

    res.status(201).json({
      message: 'Flash Sale và các biến thể đã được tạo thành công',
      flashSaleEvent: savedFlashSaleEvent,
      flashSaleVariants: createdFlashSaleVariants,
    });

  } catch (error) {
    console.error("Lỗi khi tạo Flash Sale:", error);
    res.status(400).json({ message: error.message });
  }
};

exports.updateFlashSale = async (req, res) => {
  const { ten_su_kien, thoi_gian_bat_dau, thoi_gian_ket_thuc, an_hien, flashSaleVariants } = req.body;

  try {
    // Update the main FlashSale event
    const flashSale = await FlashSale.findById(req.params.id);
    if (!flashSale) return res.status(404).json({ message: 'Không tìm thấy Flash Sale' });

    flashSale.ten_su_kien = ten_su_kien;
    flashSale.thoi_gian_bat_dau = thoi_gian_bat_dau;
    flashSale.thoi_gian_ket_thuc = thoi_gian_ket_thuc;
    flashSale.an_hien = an_hien;
    await flashSale.save();

    // Handle FlashSaleVariants: add, update, remove
    const existingVariantIds = await FlashSaleVariant.find({ id_flash_sale: flashSale._id }).distinct('id_variant');
    const incomingVariantIds = flashSaleVariants.map((sv) => sv.id_variant);

    // Variants to remove (exist in DB but not in incoming data)
    const variantsToRemove = existingVariantIds.filter(id => !incomingVariantIds.includes(id));
    if (variantsToRemove.length > 0) {
      await FlashSaleVariant.deleteMany({ id_flash_sale: flashSale._id, id_variant: { $in: variantsToRemove } });
    }

    // Variants to add or update
    for (const variantData of flashSaleVariants) {
      const existingFlashSaleVariant = await FlashSaleVariant.findOneAndUpdate(
        { id_flash_sale: flashSale._id, id_variant: variantData.id_variant },
        { gia_flash_sale: variantData.gia_flash_sale, so_luong: variantData.so_luong },
        { new: true, upsert: true } // Create if not exists, return updated document
      );
    }

    res.status(200).json({ message: 'Flash Sale và các biến thể đã được cập nhật thành công', flashSale });
  } catch (error) {
    console.error("Lỗi khi cập nhật Flash Sale:", error);
    res.status(400).json({ message: error.message });
  }
};

exports.deleteFlashSale = async (req, res) => {
  try {
    const flashSaleId = req.params.id;
    const deletedFlashSale = await FlashSale.findByIdAndDelete(flashSaleId);

    if (!deletedFlashSale) return res.status(404).json({ message: 'Không tìm thấy Flash Sale' });

    // Delete all associated FlashSaleVariants
    await FlashSaleVariant.deleteMany({ id_flash_sale: flashSaleId });

    res.status(200).json({ message: 'Đã xóa Flash Sale và các biến thể liên quan thành công' });
  } catch (error) {
    console.error("Lỗi khi xóa Flash Sale:", error);
    res.status(500).json({ message: error.message });
  }
};

// Các hàm CRUD cơ bản cho FlashSaleVariant (có thể mở rộng sau)
exports.getAllFlashSaleVariants = async (req, res) => {
  try {
    // Lấy tất cả các biến thể flash sale cho một flash sale cụ thể (không điều kiện an_hien)
    const flashSaleVariants = await FlashSaleVariant.find({ id_flash_sale: req.params.flashSaleId })
      .populate({
        path: 'id_flash_sale',
        model: 'FlashSale',
        select: 'ten_su_kien thoi_gian_bat_dau thoi_gian_ket_thuc',
      })
      .populate({
        path: 'id_variant',
        model: 'Variant',
        populate: { path: 'id_san_pham', model: 'products' }
      })
      .exec();

    const formattedData = flashSaleVariants.map(fsv => ({
      _id: fsv._id,
      id_flash_sale: fsv.id_flash_sale ? fsv.id_flash_sale._id : null,
      id_variant: fsv.id_variant ? fsv.id_variant._id : null,
      gia_flash_sale: fsv.gia_flash_sale,
      so_luong: fsv.so_luong,
      da_ban: fsv.da_ban,
      an_hien: fsv.an_hien,
      id_san_pham: fsv.id_variant && fsv.id_variant.id_san_pham ? {
        _id: fsv.id_variant.id_san_pham._id,
        TenSP: fsv.id_variant.id_san_pham.TenSP,
        hinh: fsv.id_variant.id_san_pham.hinh,
      } : null,
      variant: fsv.id_variant ? {
        _id: fsv.id_variant._id,
        dung_luong: fsv.id_variant.dung_luong,
        mau: fsv.id_variant.mau,
        gia: fsv.id_variant.gia,
      } : null
    }));

    res.status(200).json({ data: formattedData });
  } catch (error) {
    console.error("Lỗi khi lấy biến thể flash sale:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.createFlashSaleVariant = async (req, res) => {
  const flashSaleVariant = new FlashSaleVariant(req.body);
  try {
    const newFlashSaleVariant = await flashSaleVariant.save();
    res.status(201).json(newFlashSaleVariant);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateFlashSaleVariant = async (req, res) => {
  try {
    const updatedFlashSaleVariant = await FlashSaleVariant.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedFlashSaleVariant) return res.status(404).json({ message: 'Không tìm thấy biến thể Flash Sale' });
    res.status(200).json(updatedFlashSaleVariant);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteFlashSaleVariant = async (req, res) => {
  try {
    const deletedFlashSaleVariant = await FlashSaleVariant.findByIdAndDelete(req.params.id);
    if (!deletedFlashSaleVariant) return res.status(404).json({ message: 'Không tìm thấy biến thể Flash Sale' });
    res.status(200).json({ message: 'Đã xóa biến thể Flash Sale thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
