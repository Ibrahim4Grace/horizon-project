import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  userOrAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  otp: { type: String },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: Date.now, expires: '24h' },
});

const OTP = mongoose.model('OTP', otpSchema);

export { OTP };
