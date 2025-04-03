const mongoose = require('mongoose');
const Category = require('./schemas/category');
const Product = require('./schemas/product');

// Kết nối đến MongoDB
mongoose.connect('mongodb://localhost:27017/C5')
  .then(() => console.log('Kết nối MongoDB thành công'))
  .catch(err => console.error('Lỗi kết nối MongoDB:', err));

async function generateSlugs() {
  try {
    console.log('Bắt đầu tạo slug cho các danh mục...');
    const categories = await Category.find({});
    for (const category of categories) {
      category.slug = undefined; // Xóa slug cũ (nếu có) để cho phép tạo mới
      await category.save();
      console.log(`Đã tạo slug cho danh mục: ${category.name} => ${category.slug}`);
    }
    console.log('Hoàn thành tạo slug cho danh mục!');

    console.log('Bắt đầu tạo slug cho các sản phẩm...');
    const products = await Product.find({});
    for (const product of products) {
      product.slug = undefined; // Xóa slug cũ (nếu có) để cho phép tạo mới
      await product.save();
      console.log(`Đã tạo slug cho sản phẩm: ${product.name} => ${product.slug}`);
    }
    console.log('Hoàn thành tạo slug cho sản phẩm!');
    
    console.log('Quá trình tạo slug hoàn tất!');
  } catch (error) {
    console.error('Lỗi khi tạo slug:', error);
  } finally {
    mongoose.disconnect();
  }
}

generateSlugs();