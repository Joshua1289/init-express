const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const app = express();
const port = 5000;

// Middleware to parse JSON bodies
app.use(express.json());

// Define the User schema
const UserSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  password: String
});

const Usermodel = mongoose.model('User', UserSchema);

// Function to hash passwords
async function hashpass(password) {
  const res = await bcrypt.hash(password, 10);
  return res;
}

// Simple route
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.post('/login', async(req, res) => {
  const { username, password, email } = req.body;
  console.log(req.body)
   if ( !password || !email ) {
    return res.status(400).json({ message: 'All field are required.' });
   }

   try {
    // Find the user by email
    const existingUser = await Usermodel.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found Please register first.' });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Login successful.' });
    } else {
      return res.status(200).json({ message: 'Invalid password.' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
    
});

// Corrected POST route for registration
app.post('/register', async (req, res) => {
  const { username, password, email } = req.body;

  // Check if all required fields are provided
  if (!username || !password || !email) {
    return res.status(400).json({ message: 'Username, password, and email are required.' });
  }

   // Check if email already exists
   const emailExists = await Usermodel.findOne({ email: email });
   if (emailExists) {
     return res.status(409).json({ message: 'Email already exists Please choose a different one.' });
   }

  try {

    // Hash the password
    const hashedPassword = await hashpass(password);

    // Create the user
    const user_created = await Usermodel.create({
      username,
      password: hashedPassword,
      email
    });

    console.log(user_created);

    return res.status(201).json({ message: 'User registered successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

// MongoDB connection URL
const CONNECTION_URL = 'mongodb+srv://apehjos7480:qpeh2@cluster1.rkxamsp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1';

// Connect to MongoDB
mongoose.connect(CONNECTION_URL)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB', error);
  });

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
