require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const cors = require('cors');
const sequelize = require('./config/db');
const accountRoutes = require('./routes/accountRoutes');
const adminRoutes = require('./routes/adminRoutes');
// Import other routes as needed

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/accounts', accountRoutes);
app.use('/api/admin', adminRoutes);
// Other routes...

// Database connection & server start
const PORT = process.env.PORT || 3000;
sequelize.authenticate()
  .then(() => {
    console.log('Database connection established');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('Unable to connect to database:', err);
  });