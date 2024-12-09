import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'expired'],
      default: 'inactive',
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    paymentReference: String,
    amount: {
      type: Number,
      required: true,
      trim: true,
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    paymentDetails: {
      amount: Number,
      channel: String,
      paidAt: Date,
      transactionDate: Date,
    },
    // Add fields for card authorization
    authorization: {
      authorization_code: { type: String, trim: true },
      card_type: { type: String, trim: true },
      last4: { type: String, trim: true },
      exp_month: { type: String, trim: true },
      exp_year: { type: String, trim: true },
      bin: { type: String, trim: true },
      bank: { type: String, trim: true },
      signature: { type: String, trim: true },
      reusable: { type: Boolean },
      country_code: { type: String, trim: true },
    },
  },
  {
    timestamps: true,
  }
);

// Add a method to set subscription period
paymentSchema.methods.activatePayment = function () {
  this.status = 'active';
  this.paymentStatus = 'completed';
  this.startDate = new Date();
  // Set end date to 30 days from now
  this.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
};

// Add a virtual field to check if subscription is expired
paymentSchema.virtual('isExpired').get(function () {
  if (!this.endDate) return true;
  return new Date() > this.endDate;
});

const Payment = mongoose.model('Payment', paymentSchema);

export { Payment };
