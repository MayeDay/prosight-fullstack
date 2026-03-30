console.log('Starting ProSight server...');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL set:', !!process.env.DATABASE_URL);

const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');
const { exec } = require('child_process');
const prisma  = require('./db');
const { DATABASE_URL } = require('./config');

const app  = express();
const PORT = process.env.PORT || 8080;

// ── DB readiness gate ─────────────────────────────────────────────────────
let dbReady = false;

app.use(cors({ origin: '*' }));
app.use(express.json());

// Return 503 for API calls until schema is pushed and DB is ready
app.use('/api', (req, res, next) => {
  if (!dbReady) return res.status(503).json({ message: 'Server starting up, please retry in a few seconds.' });
  next();
});

app.use('/api/auth',     require('./routes/auth'));
app.use('/api/users',    require('./routes/users'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/projects', require('./routes/messages'));
app.use('/api/reviews',  require('./routes/reviews'));

// ── Serve React build ────────────────────────────────────────────────────
const publicDir = path.join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
  app.get('*', (req, res) => res.sendFile(path.join(publicDir, 'index.html')));
} else {
  app.get('/', (req, res) => res.json({ status: 'ProSight API running' }));
}

// ── Start server, then init DB ────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`ProSight API running on port ${PORT}`);

  // Push schema using the embedded URL so it always has access
  exec(
    'node_modules/.bin/prisma db push --accept-data-loss',
    { cwd: __dirname, env: { ...process.env, DATABASE_URL } },
    async (err) => {
      if (err) {
        console.error('DB push failed:', err.message);
        // Still mark ready so the server doesn't stay blocked forever
        dbReady = true;
        return;
      }
      console.log('DB schema synced');
      try {
        const { seed } = require('./seed');
        await seed(prisma);
      } catch (e) {
        console.error('Seed skipped:', e.message);
      }
      dbReady = true;
      console.log('DB ready — accepting API requests');
    }
  );
});
