const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    fullname: { type: String }, // Make fullname required
    email: { type: String}, // Make email required and unique
    password: { type: String }, // Make password required
    creationOn: { type: Date, default: Date.now }, // Use Date.now for default
});

module.exports = mongoose.model("User", userSchema);
