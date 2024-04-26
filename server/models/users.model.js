const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  lastname: {
    type: String,
    required: true
  },
  mail: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    required: false
  },
  biometrics: {
    fingerpting: {
        type: String,
        required: false
    },
    voice: {
        type: String,
        required: false
    },
    face: {
        type: String,
        required: false
    }
  },
  friends: [
    {
        name: String,
        lastname: String,
        mail: String,
        avatar: String,
        settings: {
            nickname: String,
            PIN: Number,
        },
        messages: [
            {
                content: String,
                date: Date,
                sender: Number
            }
        ]
    }
  ],
  chatbots: []
});

const User = mongoose.model('users', UserSchema, 'users');

module.exports = User;