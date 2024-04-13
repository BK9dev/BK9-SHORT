// اذا واجهت اي مشكله ادخل قناة المطور واخبره بالمشكلة: https://whatsapp.com/channel/0029VaGPfAx17En4dklujt3n 

const express = require('express');
const mongoose = require('mongoose');
const { nanoid } = require('nanoid');
const path = require('path');
require('dotenv').config({ path: './BK9.env' });
const app = express();
const PORT = process.env.PORT || 3000;

// الاتصال بقاعدة البيانات
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'خطأ في تم الاتصال بقاعدة البيانات:'));
db.once('open', () => {
  console.log('تم الاتصال بقاعدة البيانات');
});

const urlSchema = new mongoose.Schema({
  longURL: String,
  shortURL: String,
});

const URL = mongoose.model('URL', urlSchema);

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/BK9', async (req, res) => {
  const { longURL, alias } = req.body;
  let shortURL;

  if (!alias) {
    shortURL = nanoid(7);
  } else {
    const existingURL = await URL.findOne({ shortURL: alias });
    if (existingURL) {
      return res.status(400).json({ message: 'اسم التخصيص ماخوذ جرب اسما اخر.' });
    }
    shortURL = alias;
  }

  try {
    const newURL = new URL({ longURL, shortURL });
    await newURL.save();
    res.json({ shortURL: `${req.protocol}://${req.get('host')}/${shortURL}` });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في الخادم الداخلي' });
  }
});

app.get('/:shortURL', async (req, res) => {
  const { shortURL } = req.params;

  try {
    const url = await URL.findOne({ shortURL });
    if (url) {
      return res.redirect(url.longURL);
    } else {
      return res.status(404).send('لم يتم العثور عليه');
    }
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في الخادم الداخلي' });
  }
});

app.get('/api/create', async (req, res) => {
  const { url, alias } = req.query;

  try {
    let shortURL;
    if (!alias) {
      shortURL = nanoid(7);
    } else {
      const existingURL = await URL.findOne({ shortURL: alias });
      if (existingURL) {
        return res.status(400).json({ BK9: 'اسم التخصيص ماخوذ جرب اسما اخر.' });
      }
      shortURL = alias;
    }
    const newURL = new URL({ longURL: url, shortURL });
    await newURL.save();
    res.json({ BK9: `${req.protocol}://${req.get('host')}/${shortURL}` });
  } catch (error) {
    res.status(500).json({ BK9: 'خطأ في الخادم الداخلي' });
  }
});
app.listen(PORT, () => {
  console.log(`الخادم قيد التشغيل في  http://localhost:${PORT}`);
});
