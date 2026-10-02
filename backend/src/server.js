const app = require('./app');
const { port } = require('./config/env');

app.listen(port, () => {
  console.log(`Smart Inventory API running on http://localhost:${port}`);
});
