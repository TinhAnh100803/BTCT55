let mongoose = require('mongoose');
let slug = require('mongoose-slug-updater');
mongoose.plugin(slug);

let productSchema = new mongoose.Schema({
    name:{
        type:String,
        unique: true,
        required:true
    },
    slug: { type: String, slug: "name", unique: true },
    price:{
        type:Number,
        required:true,
        min:0
    },description:{
        type:String,
        default:""
    },quantity:{
        type:Number,
        default:0,
        min:0
    },imgURL:{
        type:String,
        default:""
    },category:{
        type:mongoose.Types.ObjectId,
        ref:'category',
        required:true
    }
    ,isDeleted:{
        type:Boolean,
        default:false
    }
},{
    timestamps:true
})
module.exports = mongoose.model('product',productSchema);