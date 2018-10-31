const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: String,
    password: String,
});

module.exports = {
    Model: mongoose.model('User', userSchema),
    Schema: userSchema,
};