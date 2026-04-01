const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'driver', 'janitor', 'analytics', 'demo'], default: 'admin' },
  assignedBins: [{ type: String }],
  isOnline: { type: Boolean, default: false },
  lastLocation: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null }
  },
  lastUpdate: { type: Date, default: null },
  pushSubscriptions: [{
    endpoint: String,
    expirationTime: Number,
    keys: {
      p256dh: String,
      auth: String
    }
  }]
});

userSchema.pre('save', async function() {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
