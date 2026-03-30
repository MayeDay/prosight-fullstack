console.log('Starting ProSight server...');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL set:', !!process.env.DATABASE_URL);
const express = require('express');
const cors = require('cors');
const path = require('path');
const prisma = require('./db');

const app = express();
const PORT = process.env.PORT || 8080;

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',');
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.use('/api/auth',     require('./routes/auth'));
app.use('/api/users',    require('./routes/users'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/projects', require('./routes/messages'));
app.use('/api/reviews',  require('./routes/reviews'));

// Serve React build (only if built — skipped in pure-API dev mode)
const publicDir = path.join(__dirname, 'public');
const fs = require('fs');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
  app.get('*', (req, res) => res.sendFile(path.join(publicDir, 'index.html')));
} else {
  app.get('/', (req, res) => res.json({ status: 'ProSight API running', note: 'React build not found' }));
}

// Start listening immediately so App Runner health check passes,
// then push schema + seed in the background.
app.listen(PORT, () => {
  console.log(`ProSight API running on port ${PORT}`);

  const { exec } = require('child_process');
  const dbUrl = process.env.DATABASE_URL ||
    'postgresql://neondb_owner:npg_hf5WRqDona1S@ep-empty-feather-ams6t7mu-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
  exec('node_modules/.bin/prisma db push --accept-data-loss',
    { cwd: __dirname, env: { ...process.env, DATABASE_URL: dbUrl } },
    (err) => {
    if (err) {
      console.error('DB push failed:', err.message);
      return;
    }
    console.log('DB schema synced');
    const { seed } = require('./seed');
    seed(prisma).catch(e => console.error('Seed skipped:', e.message));
  });
});
