const { execSync } = require('child_process');
try {
  execSync('npx prisma db push', { stdio: 'pipe', encoding: 'utf-8' });
} catch (e) {
  require('fs').writeFileSync('full_error.json', JSON.stringify({
    stdout: e.stdout,
    stderr: e.stderr,
    message: e.message
  }, null, 2));
}
