import { Command } from 'commander';
import { action } from './shared/action.js';
import type { CommandServices } from '../services/types.js';

export function registerProfileCommands(parent: Command, services: CommandServices): Command {
  const profile = parent
    .command('profile')
    .description('Manage GitProfile profiles.');

  profile
    .command('create <name>')
    .description('Create a new profile.')
    .option('-k, --key <keyName>', 'Named SSH key entry to use for this profile.')
    .option('-p, --path <path...>', 'One or more path rules for this profile.')
    .action(action(async (name: string, options: { keyName?: string; path?: string[] }) => {
      await services.profile.create({
        name,
        keyName: options.keyName,
        paths: options.path ?? [],
      });
    }));

  profile
    .command('list')
    .description('List profiles.')
    .action(action(async () => {
      await services.profile.list();
    }));

  profile
    .command('show <name>')
    .description('Show a profile.')
    .action(action(async (name: string) => {
      await services.profile.show(name);
    }));

  profile
    .command('add-path <name> <path>')
    .description('Add a path rule to a profile.')
    .action(action(async (name: string, path: string) => {
      await services.profile.addPath(name, path);
    }));

  profile
    .command('remove-path <name> <path>')
    .description('Remove a path rule from a profile.')
    .action(action(async (name: string, path: string) => {
      await services.profile.removePath(name, path);
    }));

  profile
    .command('set-key <name> <keyName>')
    .description('Change the named SSH key entry used by a profile.')
    .action(action(async (name: string, keyName: string) => {
      await services.profile.setKey(name, keyName);
    }));

  profile
    .command('delete <name>')
    .description('Delete a profile.')
    .action(action(async (name: string) => {
      await services.profile.delete(name);
    }));

  return profile;
}
