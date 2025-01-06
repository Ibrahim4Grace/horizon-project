import mongoose from 'mongoose';

const examSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    grade: { type: String },
    Registrar: { type: String, default: 'Muyiwa James' },
  },
  {
    timestamps: true,
  }
);

const Exam = mongoose.model('Exam', examSchema);

export { Exam };
