const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Smart Inventory & Warehouse API is running',
    data: {
      status: 'ok',
      service: 'warehouse-api',
    },
  });
});

module.exports = router;
