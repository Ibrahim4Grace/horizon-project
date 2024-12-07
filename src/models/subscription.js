import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema(
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
  },
  {
    timestamps: true,
  }
);

// Add a method to set subscription period
subscriptionSchema.methods.activateSubscription = function () {
  this.status = 'active';
  this.paymentStatus = 'completed';
  this.startDate = new Date();
  // Set end date to 30 days from now
  this.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
};

// Add a virtual field to check if subscription is expired
subscriptionSchema.virtual('isExpired').get(function () {
  if (!this.endDate) return true;
  return new Date() > this.endDate;
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export { Subscription };
