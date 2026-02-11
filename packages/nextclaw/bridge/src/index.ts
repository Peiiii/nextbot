#!/usr/bin/env node
/**
 * nextclaw WhatsApp Bridge
 * 
 * This bridge connects WhatsApp Web to nextclaw's backend
 * via WebSocket. It handles authentication, message forwarding,
 * and reconnection logic.
 * 
 * Usage:
 *   npm run build && npm start
 *   
 * Or with custom settings:
 *   BRIDGE_PORT=3001 AUTH_DIR=~/.nextclaw/whatsapp npm start
 */

// Polyfill crypto for Baileys in ESM
import { webcrypto } from 'crypto';
type CryptoLike = typeof webcrypto;
const globalCrypto = globalThis as typeof globalThis & { crypto?: CryptoLike };
if (!globalCrypto.crypto) {
  globalCrypto.crypto = webcrypto;
}

import { BridgeServer } from './server.js';
import { homedir } from 'os';
import { join } from 'path';
import { APP_NAME, DEFAULT_HOME_DIR, ENV_HOME_KEY } from './brand.js';

const PORT = parseInt(process.env.BRIDGE_PORT || '3001', 10);
const homeDir = process.env[ENV_HOME_KEY]?.trim() || join(homedir(), DEFAULT_HOME_DIR);
const AUTH_DIR = process.env.AUTH_DIR || join(homeDir, 'whatsapp-auth');

console.log(`🤖 ${APP_NAME} WhatsApp Bridge`);
console.log('========================\n');

const server = new BridgeServer(PORT, AUTH_DIR);

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\nShutting down...');
  await server.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await server.stop();
  process.exit(0);
});

// Start the server
server.start().catch((error) => {
  console.error('Failed to start bridge:', error);
  process.exit(1);
});
