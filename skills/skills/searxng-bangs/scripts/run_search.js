const { spawn } = require('child_process');

const query = process.argv[2] || 'microsaas ideas';
const num = process.argv[3] || '5';

const python = spawn('python', [
  'scripts/search.py',
  query,
  '--num', num,
  '--output', 'json'
], {
  cwd: __dirname,
  stdio: ['ignore', 'pipe', 'pipe'],
  encoding: 'utf8'
});

python.stdout.on('data', (data) => {
  process.stdout.write(data);
});

python.stderr.on('data', (data) => {
  console.error(data.toString());
});

python.on('close', (code) => {
  process.exit(code);
});