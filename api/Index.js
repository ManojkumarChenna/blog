const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User');
const app = express();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);

// Allow requests from 'http://localhost:3000'
app.use(cors({
  credentials: true, 
  origin: 'http://localhost:3000', // Adjust this to match your client application's URL
}));
app.use(express.json());

mongoose.connect('mongodb+srv://blog:PczaTsLb9YqyRcWH@cluster0.wqkmfos.mongodb.net/your-database-name?retryWrites=true&w=majority')
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const userDoc = await User.create({
      username,
      password: bcrypt.hashSync(password, salt),
    });
    res.json(userDoc);
  } catch (e) {
    console.log(e);
    res.status(400).json(e);
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const userDoc = await User.findOne({ username });
  if (!userDoc) {
    res.status(400).json('User not found');
    return;
  }

  const passOk = bcrypt.compareSync(password, userDoc.password);
  if (passOk) {
    const secret = 'your-secret-key'; // Replace with your actual secret key
    jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
      if (err) throw err;
      res.cookie('token', token).json({
        id: userDoc._id,
        username,
      });
    });
  } else {
    res.status(400).json('Wrong credentials');
  }
});

app.listen(4000, () => {
  console.log('Server is running on port 4000');
});
