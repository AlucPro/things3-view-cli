#!/usr/bin/env node
import { Command } from 'commander';

const program = new Command()
  .name('td')
  .description('Safe local CLI for Things 3')
  .version('0.1.0');

program.parse();
