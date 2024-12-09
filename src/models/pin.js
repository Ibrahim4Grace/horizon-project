import mongoose from 'mongoose';

const pinSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: String,
      default: 'Lifetime Access',
    },
  },
  {
    timestamps: true,
  }
);

const Pin = mongoose.model('Pin', pinSchema);

export { Pin };
