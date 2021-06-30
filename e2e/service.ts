import path from 'path';
import express from 'express';
import { Server } from 'http';

export async function serve(port: number): Promise<Server> {
  const app = express();

  // Serve all static assets
  app.use(express.static('build'));

  // Serve index.html for all other resources
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../build/index.html'));
  });

  // Start server
  const server = app.listen(port);

  console.log(`\nWeb server is running on 'http://localhost:${port}`);

  return server;
}
