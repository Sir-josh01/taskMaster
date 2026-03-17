import mongoose from 'mongoose';

const SubscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
  subscription: { type: Object, required: true }, // { endpoint, keys: { p256dh, auth } }
});

export const Subscription = mongoose.model('Subscription', SubscriptionSchema);