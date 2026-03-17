import express from 'express';
const router = express.Router();
import authenticateUser from '../middleware/authentication.js';
import { register, login, deleteAccount } from '../controllers/auth.js';


import webPush from 'web-push';
import { Subscription } from '../models/subscription.js';
import dotenv from 'dotenv';
dotenv.config();


router.post('/register', register);
router.post('/login', login);
router.delete('/deleteAccout', authenticateUser, deleteAccount);

router.use(authenticateUser);

// Save subscription from frontend
router.post('/subscribe', async (req, res) => {
  try {
    const { subscription } = req.body;
    const userId = req.user.userId;

    if (!subscription) return res.status(400).json({ msg: 'No subscription provided' });

    await Subscription.findOneAndUpdate({ userId }, { subscription }, { upsert: true });

    res.status(201).json({ msg: 'Subscription saved' });
  } catch (err) {
    console.error('Subscribe error:', err);
    res.status(500).json({ msg: 'Failed to save subscription' });
  }
});

// Send test push (for testing)
router.post('/send-test-push', async (req, res) => {
  try {
    const userId = req.user.userId;
    const sub = await Subscription.findOne({ userId });

    if (!sub) return res.status(404).json({ msg: 'No push subscription found for this user, Subscribe first.' });

    webPush.setVapidDetails(
      process.env.VAPID_SUBJECT,
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );

    await webPush.sendNotification(sub.subscription, JSON.stringify({
      title: 'Test Notification',
      body: 'This is a test push from TaskMaster!',
      icon: '/favicon.ico'
    }));

    res.status(200).json({ msg: 'Test push sent' });
  } catch (err) {
    console.error('Test push failed:', err);
    res.status(500).json({ msg: 'Failed to send test push' });
  }
});


export default router;





