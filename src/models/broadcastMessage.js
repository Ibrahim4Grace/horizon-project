import mongoose from 'mongoose';

const broadCastMessageSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
    to: [String],
    subject: String,
    message: String,
    isBroadcast: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const BroadCastMessage = mongoose.model(
  'BroadCastMessage',
  broadCastMessageSchema
);

export { BroadCastMessage };
