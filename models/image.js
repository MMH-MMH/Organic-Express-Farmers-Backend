const mongoose= require('mongoose');
var Schema = mongoose.Schema;


var imageSchema = new Schema({
    name: String,
    image: String
});



const Image = mongoose.model('Image', imageSchema);
module.exports = Image;