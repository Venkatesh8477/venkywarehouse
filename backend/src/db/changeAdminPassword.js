const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

async function changeAdminPassword() {
  const username = process.env.ADMIN_USERNAME;
  const newPassword = process.env.NEW_ADMIN_PASSWORD;

  if (!username || !newPassword || newPassword.length < 12) {
    console.error('Set ADMIN_USERNAME and a NEW_ADMIN_PASSWORD of at least 12 characters');
    process.exitCode = 1;
    await pool.end();
    return;
  }

  try {
    const passwordHash = await bcrypt.hash(newPassword, 12);
    const result = await pool.query(
      "UPDATE users SET password_hash = $2 WHERE username = $1 AND role = 'ADMIN'",
      [username, passwordHash],
    );

    if (result.rowCount !== 1) {
      console.error('No matching admin account was updated');
      process.exitCode = 1;
      return;
    }

    console.log('Admin password updated successfully');
  } catch (error) {
    console.error('Admin password update failed:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

changeAdminPassword();