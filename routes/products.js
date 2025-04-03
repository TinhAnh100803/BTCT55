var express = require('express');
const { ConnectionCheckOutFailedEvent } = require('mongodb');
var router = express.Router();
let productModel = require('../schemas/product')
let CategoryModel = require('../schemas/category')

function buildQuery(obj){
  console.log(obj);
  let result = {};
  if(obj.name){
    result.name=new RegExp(obj.name,'i');
  }
  result.price = {};
  if(obj.price){
    if(obj.price.$gte){
      result.price.$gte = obj.price.$gte;
    }else{
      result.price.$gte = 0
    }
    if(obj.price.$lte){
      result.price.$lte = obj.price.$lte;
    }else{
      result.price.$lte = 10000;
    }
  }else{
    result.price.$gte = 0;
    result.price.$lte = 10000;
  }
  console.log(result);
  return result;
}

/* GET users listing. */
router.get('/', async function(req, res, next) {
  let products = await productModel.find(buildQuery(req.query)).populate("category");

  res.status(200).send({
    success:true,
    data:products
  });
});

// QUAN TRỌNG: Đặt các route slug lên TRƯỚC route :id
// Route để hiển thị một sản phẩm cụ thể theo slug của danh mục và slug của sản phẩm
router.get('/slug/:category/:product', async function(req, res, next) {
  try {
    // Lấy slug của category và product từ params
    let categorySlug = req.params.category;
    let productSlug = req.params.product;
    
    console.log(`Tìm category với slug: ${categorySlug}`);
    // Tìm category theo slug
    let category = await CategoryModel.findOne({ slug: categorySlug });
    
    // Nếu không tìm thấy category, trả về lỗi
    if (!category) {
      console.log('Không tìm thấy category');
      return res.status(404).send({
        success: false,
        message: "Danh mục không tồn tại"
      });
    }
    
    console.log(`Tìm sản phẩm với slug: ${productSlug} trong category: ${category._id}`);
    // Tìm sản phẩm theo slug trong category đã tìm thấy
    let product = await productModel.findOne({ 
      slug: productSlug, 
      category: category._id,
      isDeleted: false 
    }).populate("category");
    
    // Nếu không tìm thấy product, trả về lỗi
    if (!product) {
      console.log('Không tìm thấy sản phẩm');
      return res.status(404).send({
        success: false,
        message: "Sản phẩm không tồn tại trong danh mục này"
      });
    }
    
    console.log('Đã tìm thấy sản phẩm:', product.name);
    // Trả về kết quả
    res.status(200).send({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Lỗi:', error);
    res.status(404).send({
      success: false,
      message: error.message
    });
  }
});

// Route để hiển thị tất cả sản phẩm trong một danh mục theo slug của danh mục
router.get('/slug/:category', async function(req, res, next) {
  try {
    // Lấy slug của category từ params
    let categorySlug = req.params.category;
    
    console.log(`Tìm category với slug: ${categorySlug}`);
    // Tìm category theo slug
    let category = await CategoryModel.findOne({ slug: categorySlug });
    
    // Nếu không tìm thấy category, trả về lỗi
    if (!category) {
      console.log('Không tìm thấy category');
      return res.status(404).send({
        success: false,
        message: "Danh mục không tồn tại"
      });
    }
    
    console.log(`Tìm sản phẩm trong category: ${category._id}`);
    // Lấy tất cả sản phẩm thuộc category đó
    let products = await productModel.find({ 
      category: category._id,
      isDeleted: false 
    }).populate("category");
    
    console.log(`Đã tìm thấy ${products.length} sản phẩm`);
    // Trả về kết quả
    res.status(200).send({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Lỗi:', error);
    res.status(404).send({
      success: false,
      message: error.message
    });
  }
});

// LƯU Ý: Route với :id phải đặt SAU các routes cụ thể khác
router.get('/:id', async function(req, res, next) {
  try {
    let id = req.params.id;
    let product = await productModel.findById(id);
    res.status(200).send({
      success:true,
      data:product
    });
  } catch (error) {
    res.status(404).send({
      success:false,
      message:"khong co id phu hop"
    });
  }
});

router.post('/', async function(req, res, next) {
  try {
    let cate = await CategoryModel.findOne({name:req.body.category})
    if(cate){
      let newProduct = new productModel({
        name: req.body.name,
        price:req.body.price,
        quantity: req.body.quantity,
        category:cate._id
      })
      await newProduct.save();
      res.status(200).send({
        success:true,
        data:newProduct
      });
    }else{
      res.status(404).send({
        success:false,
        data:"cate khong dung"
      });
    }
  } catch (error) {
    res.status(404).send({
      success:false,
      message:error.message
    });
  }
});

router.put('/:id', async function(req, res, next) {
  try {
    let updateObj = {};
    let body = req.body;
    if(body.name){
      updateObj.name = body.name;
    }
    if(body.price){
      updateObj.price = body.price;
    }
    if(body.quantity){
      updateObj.quantity = body.quantity;
    }
    if(body.category){
      let cate = await CategoryModel.findOne({name:req.body.category});
      if(!cate){
        res.status(404).send({
          success:false,
          message:error.message
        });
      }
    }
    let updatedProduct = await productModel.findByIdAndUpdate(req.params.id,
      updateObj,
      {new:true})
    res.status(200).send({
      success:true,
      data:updatedProduct
    });
  } catch (error) {
    res.status(404).send({
      success:false,
      message:error.message
    });
  }
});

router.delete('/:id', async function(req, res, next) {
  try {
    let product = await productModel.findById(req.params.id);
    if(product){
      let deletedProduct = await productModel.findByIdAndUpdate(req.params.id,
        {
          isDeleted:true
        },
        {new:true})
        res.status(200).send({
          success:true,
          data:deletedProduct
        });
    }else{
      res.status(404).send({
        success:false,
        message:"ID khong ton tai"
      });
    }
  } catch (error) {
    res.status(404).send({
      success:false,
      message:error.message
    });
  }
});

module.exports = router;
