// frontend/scripts/start-clean.js
// Fix CRA dev-server crashes caused by broken env vars (Windows common issue)

const bad = (v) => typeof v === 'string' && v.trim().length === 0;

if (bad(process.env.HOST)) delete process.env.HOST;
if (bad(process.env.WDS_ALLOWED_HOSTS)) delete process.env.WDS_ALLOWED_HOSTS;

// (Optional) also remove these if you want maximum stability:
// delete process.env.DANGEROUSLY_DISABLE_HOST_CHECK;

console.log('[start-clean] Cleaned HOST/WDS_ALLOWED_HOSTS and starting CRA...');

require('react-scripts/scripts/start');