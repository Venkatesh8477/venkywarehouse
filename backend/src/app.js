const express = require('express');
const cors = require('cors');
const healthRoutes = require('./routes/healthRoutes');
const errorMiddleware = require('./middleware/errorMiddleware');
const notFoundMiddleware = require('./middleware/notFoundMiddleware');
const { frontendUrl } = require('./config/env');

const app = express();

app.use(
  cors({
    origin: frontendUrl,
    credentials: true,
  }),
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Smart Inventory & Warehouse Management System API',
    data: { version: '1.0.0' },
  });
});

app.use('/api/health', healthRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
