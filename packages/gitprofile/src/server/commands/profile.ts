import { Command } from 'commander';
import { action } from './shared/action.js';
import type { CommandServices } from '../services/types.js';

export function registerProfileCommands(parent: Command, services: CommandServices): Command {
  parent
    .command('create <profile-name>')
    .description('Create a new profile.')
    .requiredOption('-k, --key <key-name>', 'Named SSH key entry to use for this profile.')
    .option('-p, --path <path...>', 'One or more path rules for this profile.')
    .action(action(async (profileName: string, options: { key?: string; path?: string[] }) => {
      await services.profile.create({
        profileName,
        keyName: options.key as string,
        paths: options.path ?? [],
      });
    }));

  parent
    .command('list')
    .description('List profiles.')
    .action(action(async () => {
      await services.profile.list();
    }));

  parent
    .command('show <profile-name>')
    .description('Show a profile.')
    .action(action(async (profileName: string) => {
      await services.profile.show(profileName);
    }));

  parent
    .command('addPath <profile-name> <path...>')
    .description('Add one or more path rules to a profile.')
    .action(action(async (profileName: string, paths: string[]) => {
      await services.profile.addPath({ profileName, paths });
    }));

  parent
    .command('removePath <profile-name> <path...>')
    .description('Remove one or more path rules from a profile.')
    .action(action(async (profileName: string, paths: string[]) => {
      await services.profile.removePath({ profileName, paths });
    }));

  parent
    .command('setKey <profile-name> <key-name>')
    .description('Change the named SSH key entry used by a profile.')
    .action(action(async (profileName: string, keyName: string) => {
      await services.profile.setKey({ profileName, keyName });
    }));

  parent
    .command('delete <profile-name>')
    .description('Delete a profile.')
    .action(action(async (profileName: string) => {
      await services.profile.delete(profileName);
    }));

  return parent;
}
