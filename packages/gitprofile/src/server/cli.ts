import { Command } from 'commander';
import { registerKeyCommands } from './commands/key.js';
import { registerProfileCommands } from './commands/profile.js';
import { createNoopServices } from './services/noop.js';

const program = new Command();
const services = createNoopServices();

program
  .name('gitprofile')
  .description('Manage Git profiles and their SSH keys.')
  .version('0.0.0')
  .showHelpAfterError();

registerProfileCommands(program, services);
registerKeyCommands(program, services);

await program.parseAsync(process.argv);
