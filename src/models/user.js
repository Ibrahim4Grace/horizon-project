import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    full_name: { type: String, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    course_interest: { type: String, trim: true },
    class_option: { type: String, trim: true },
    role: { type: String, default: 'User' },
    phone_number: { type: String, trim: true },
    home_address: { type: String, trim: true },
    password: { type: String, select: false },
    dob: { type: String, trim: true },
    image: { imageId: String, imageUrl: String },
    isEmailVerified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export { User };
