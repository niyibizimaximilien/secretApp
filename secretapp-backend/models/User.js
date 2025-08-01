const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  recoveryPhrase: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Add this method to the User schema
UserSchema.methods.verifyRecoveryPhrase = function(phrase) {
  return this.recoveryPhrase === phrase;
};
// In models/User.js
UserSchema.pre('save', async function(next) {
  if (this.isModified('recoveryPhrase')) {
    this.recoveryPhrase = await bcrypt.hash(this.recoveryPhrase, 10);
  }
  next();
});

UserSchema.methods.verifyRecoveryPhrase = async function(phrase) {
  return await bcrypt.compare(phrase, this.recoveryPhrase);
};

module.exports = mongoose.model('User', UserSchema);