import app from './app';
import { config } from './config';

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`🚀 Algions School Management API running on http://localhost:${PORT}`);
  console.log(`📚 Swagger API Docs available at http://localhost:${PORT}/api-docs`);
});
