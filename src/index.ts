#!/usr/bin/env node
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { render } from 'ink';
import React from 'react';
import { ThingsService } from './application/things-service.js';
import { buildProgram } from './cli/commands.js';
import { loadConfig } from './infrastructure/config.js';
import { ThingsSqliteRepository } from './infrastructure/things-repository.js';
import { ThingsUrlGateway } from './infrastructure/things-url-gateway.js';
import { App } from './tui/App.js';

if (process.argv.length === 2 && process.stdout.isTTY) {
  const config = loadConfig();
  const repository = new ThingsSqliteRepository(config.dbPath);
  const writer = new ThingsUrlGateway({ authToken: config.authToken, open: async (url) => { await promisify(execFile)('open', [url]); } });
  render(React.createElement(App, { service: new ThingsService(repository, writer) }));
} else {
  buildProgram();
}
