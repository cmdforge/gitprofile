import type { JsonRpcConnectionLike, ProtocolInitializer } from '@cmdforge/jsonrpc';
import { gitprofileProtocol } from '../shared/protocol.js';
import type { GitProfileProtocolDefinition } from '../shared/protocol.js';

export function createGitprofileClient(
  connection: JsonRpcConnectionLike,
  initialize?: ProtocolInitializer<GitProfileProtocolDefinition, 'client'>,
): ReturnType<typeof gitprofileProtocol.client> {
  return gitprofileProtocol.client(connection, initialize);
}

export { gitprofileProtocol } from '../shared/protocol.js';
export type { GitProfileProtocol } from '../shared/protocol.js';
