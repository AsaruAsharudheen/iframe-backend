const express = require('express');
const mongoose = require('mongoose');
const uniqid = require('uniqid');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://iframe-frontend.vercel.app',
    ],
  })
);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error(err));

// ✅ Schema includes place & room
const iframeSchema = new mongoose.Schema({
  url: { type: String, required: true },
  uniqueId: { type: String, required: true },
  place: { type: String },
  room: { type: String },
});

const Iframe = mongoose.model('Iframe', iframeSchema);

// ✅ Create new iframe
app.post('/api/iframe', async (req, res) => {
  const { url, place, room } = req.body;

  if (!url) return res.status(400).json({ message: 'URL required' });

  const uniqueId = uniqid();
  const newIframe = new Iframe({ url, uniqueId, place, room });
  await newIframe.save();

  res.json({
    message: '✅ URL saved',
    viewUrl: `https://iframe-frontend.vercel.app/view/${uniqueId}`,
  });
});

// ✅ Get all iframes
app.get('/api/iframes', async (req, res) => {
  const iframes = await Iframe.find();
  res.json(iframes);
});

// ✅ Get one iframe by ID
app.get('/api/iframe/:uniqueId', async (req, res) => {
  const iframe = await Iframe.findOne({ uniqueId: req.params.uniqueId });
  if (!iframe) return res.status(404).json({ message: 'Not found' });
  res.json(iframe);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on ${PORT}`));
