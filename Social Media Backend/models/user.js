const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: [true, 'First name is required'],
        trim: true
    }, 
    last_name: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true
    },
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        lowercase: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
    }
},{
    timestamps: true
});

module.exports = mongoose.model('User', UserSchema);