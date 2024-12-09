import mongoose from 'mongoose';

const purchaseHistorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    pin: { type: mongoose.Schema.Types.ObjectId, ref: 'Pin' },
    itemName: { type: String, required: true },
    itemType: { type: String, required: true },
    pin_number: { type: String },
    amount: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      required: true,
    },
    paymentReference: { type: String, required: true },
    purchaseDate: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

const PurchaseHistory = mongoose.model(
  'PurchaseHistory',
  purchaseHistorySchema
);

export { PurchaseHistory };
