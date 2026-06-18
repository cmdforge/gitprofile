import { Command } from 'commander';
import { action } from './shared/action.js';
import type { CommandServices } from '../services/types.js';

export function registerKeyCommands(parent: Command, services: CommandServices): Command {
  const key = parent.command('key').description('Manage device-level SSH keys.');

  key
    .command('create <name>')
    .description('Create a new SSH key entry.')
    .action(action(async (name: string) => {
      await services.key.create({ name });
    }));

  key
    .command('list')
    .description('List SSH keys.')
    .action(action(async () => {
      await services.key.list();
    }));

  key
    .command('show <name>')
    .description('Show an SSH key entry.')
    .action(action(async (name: string) => {
      await services.key.show(name);
    }));

  key
    .command('rotate <name>')
    .description('Rotate an SSH key entry.')
    .action(action(async (name: string) => {
      await services.key.rotate(name);
    }));

  key
    .command('delete <name>')
    .description('Delete an SSH key entry.')
    .action(action(async (name: string) => {
      await services.key.delete(name);
    }));

  return key;
}
