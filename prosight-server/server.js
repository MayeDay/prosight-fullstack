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

// Serve React build
app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

async function start() {
  try {
    const { seed } = require('./seed');
    await seed(prisma);
  } catch (err) {
    console.error('Seed skipped:', err.message);
  }
  app.listen(PORT, () => console.log(`ProSight API running on port ${PORT}`));
}

start().catch(err => { console.error(err); process.exit(1); });
