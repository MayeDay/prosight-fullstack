// Central config — env vars take priority, hardcoded values are fallbacks
module.exports = {
  DATABASE_URL: process.env.DATABASE_URL ||
    'postgresql://neondb_owner:npg_hf5WRqDona1S@ep-empty-feather-ams6t7mu-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  JWT_SECRET:   process.env.JWT_SECRET   || 'prosight-super-secret-key-change-this-in-production-min-32-chars',
  JWT_ISSUER:   process.env.JWT_ISSUER   || 'ProSightAPI',
  JWT_AUDIENCE: process.env.JWT_AUDIENCE || 'ProSightClient',
};
