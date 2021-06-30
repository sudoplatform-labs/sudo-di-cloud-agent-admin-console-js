import { Server } from 'http';
import { mutableGlobals } from './global-setup';

// Executed only once at the end of a e2e test run sequence
export default async function (): Promise<void> {
  const server: Server = mutableGlobals.server;
  if (server) {
    server.close();
  }
}
