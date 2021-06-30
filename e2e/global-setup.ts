import { Server } from 'http';
import { serve } from './service';

// Executed only once at the start of a e2e test run sequence
export const mutableGlobals = { server: new Server() };

export default async function (): Promise<void> {
  mutableGlobals.server = await serve(3000);
}
