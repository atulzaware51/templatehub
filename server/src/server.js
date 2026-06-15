/**
 * Server entrypoint for the new server scaffold
 */
require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const templateRoutes = require('./routes/templates');
const uploadRoutes = require('./routes/uploads');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());

// serve uploaded assets
app.use('/uploads', express.static(require('path').join(__dirname, '../../uploads')));

// Connect to DB
connectDB(process.env.MONGO_URI).catch(err => {
  console.error('DB connection failed:', err.message);
});

// Routes
app.use('/auth', authRoutes);
app.use('/projects', templateRoutes);
app.use('/uploads', uploadRoutes);

app.get('/', (req, res) => res.json({ ok: true, message: 'TemplateHub server running' }));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
