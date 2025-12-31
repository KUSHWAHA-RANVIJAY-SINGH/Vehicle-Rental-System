import mongoose from 'mongoose';

const payoutSchema = new mongoose.Schema({
         hostId: {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: 'User',
                  required: true
         },
         amount: {
                  type: Number,
                  required: true
         },
         date: {
                  type: Date,
                  default: Date.now
         },
         status: {
                  type: String,
                  enum: ['pending', 'processed', 'failed'],
                  default: 'pending'
         },
         transactionId: {
                  type: String
         }
}, {
         timestamps: true
});

const Payout = mongoose.model('Payout', payoutSchema);

export default Payout;
