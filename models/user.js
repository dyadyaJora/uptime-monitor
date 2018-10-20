let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let userSchema = new Schema({
  email: {
    type: String,
    require: true,
    unique: true
  },
  name: String,
  passwordHash: String,
  salt: String
}, {
  timestamps: true
});

// ** pre-save validate todo

mongoose.model('User', userSchema);