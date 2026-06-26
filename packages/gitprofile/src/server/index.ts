import type { JsonRpcConnectionLike } from '@cmdforge/jsonrpc';
import { gitprofileProtocol } from '../shared/protocol.js';
import type { CommandServices } from './services/types.js';

export function createGitprofileServer(
  connection: JsonRpcConnectionLike,
  services: CommandServices,
): ReturnType<typeof gitprofileProtocol.server> {
  return gitprofileProtocol.server(connection, (peer) => {
    peer.inbound.requests.profile.create(async (input) => {
      await services.profile.create(input);
    });
    peer.inbound.requests.profile.list(async () => services.profile.list());
    peer.inbound.requests.profile.show(async (profileName) => services.profile.show(profileName));
    peer.inbound.requests.profile.addPath(async (input) => {
      await services.profile.addPath(input);
    });
    peer.inbound.requests.profile.removePath(async (input) => {
      await services.profile.removePath(input);
    });
    peer.inbound.requests.profile.setKey(async (input) => {
      await services.profile.setKey(input);
    });
    peer.inbound.requests.profile.delete(async (profileName) => {
      await services.profile.delete(profileName);
    });

    peer.inbound.requests.key.create(async (input) => {
      await services.key.create(input);
    });
    peer.inbound.requests.key.list(async () => services.key.list());
    peer.inbound.requests.key.show(async (keyName) => services.key.show(keyName));
    peer.inbound.requests.key.rotate(async (keyName) => {
      await services.key.rotate(keyName);
    });
    peer.inbound.requests.key.delete(async (keyName) => {
      await services.key.delete(keyName);
    });
  });
}

export { gitprofileProtocol } from '../shared/protocol.js';
export type { GitProfileProtocol } from '../shared/protocol.js';
export type { CommandServices } from './services/types.js';
