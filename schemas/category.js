let mongoose = require('mongoose');
let slug = require('mongoose-slug-updater');
mongoose.plugin(slug);

let categorySchema = new mongoose.Schema({
    name:{
        type:String,
        unique: true,
        required:true
    },
    slug: { type: String, slug: "name", unique: true },
    description:{
        type:String,
        default:""
    }
},{
    timestamps:true
})
module.exports = mongoose.model('category',categorySchema);