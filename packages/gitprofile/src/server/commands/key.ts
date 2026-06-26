import { Command } from 'commander';
import { action } from './shared/action.js';
import type { CommandServices } from '../services/types.js';

export function registerKeyCommands(parent: Command, services: CommandServices): Command {
  const key = parent.command('key').description('Manage device-level SSH keys.');

  key
    .command('create <key-name>')
    .description('Create a new SSH key entry.')
    .action(action(async (keyName: string) => {
      await services.key.create({ keyName });
    }));

  key
    .command('list')
    .description('List SSH keys.')
    .action(action(async () => {
      await services.key.list();
    }));

  key
    .command('show <key-name>')
    .description('Show an SSH key entry.')
    .action(action(async (keyName: string) => {
      await services.key.show(keyName);
    }));

  key
    .command('rotate <key-name>')
    .description('Rotate an SSH key entry.')
    .action(action(async (keyName: string) => {
      await services.key.rotate(keyName);
    }));

  key
    .command('delete <key-name>')
    .description('Delete an SSH key entry.')
    .action(action(async (keyName: string) => {
      await services.key.delete(keyName);
    }));

  return key;
}
