import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      trim: true,
    },
    discountedPrice: {
      type: Number,
      default: null,
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

const Course = mongoose.model('Course', courseSchema);

export { Course };
