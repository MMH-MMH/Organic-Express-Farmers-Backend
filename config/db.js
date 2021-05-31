const mongoose = require('mongoose');
const dbConfig = require('./dbConfig');

const connectDB = async() => {
    try{
        await mongoose.connect(dbConfig.uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false
        }, () => {
            console.log("DB UP");
        });
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
}

module.exports = connectDB;