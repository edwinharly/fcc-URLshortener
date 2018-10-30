const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userSchema = require('./user').Schema;

const urlSchema = new Schema({
    _id: String,
    original: String,
    shortened: String,
    owner: userSchema,
});

module.exports = {
    Model: mongoose.Model('Url', urlSchema),
    Schema: urlSchema,
};