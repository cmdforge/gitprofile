import {
  createProtocol,
  type ProtocolInstance,
} from '@cmdforge/jsonrpc';
import type {
  KeyCreateInput,
  KeyDetails,
  KeySummary,
  ProfileCreateInput,
  ProfileDetails,
  ProfilePathChangeInput,
  ProfileSetKeyInput,
  ProfileSummary,
} from './types.js';

export const gitprofileProtocol = createProtocol(({ request }) => ({
  clientToServer: {
    requests: {
      profileCreate: request('profile/create')<ProfileCreateInput, void>(),
      profileList: request('profile/list')<void, ProfileSummary[]>(),
      profileShow: request('profile/show')<string, ProfileDetails | null>(),
      profileAddPath: request('profile/addPath')<ProfilePathChangeInput, void>(),
      profileRemovePath: request('profile/removePath')<ProfilePathChangeInput, void>(),
      profileSetKey: request('profile/setKey')<ProfileSetKeyInput, void>(),
      profileDelete: request('profile/delete')<string, void>(),
      keyCreate: request('key/create')<KeyCreateInput, void>(),
      keyList: request('key/list')<void, KeySummary[]>(),
      keyShow: request('key/show')<string, KeyDetails | null>(),
      keyRotate: request('key/rotate')<string, void>(),
      keyDelete: request('key/delete')<string, void>(),
    },
    notifications: {},
  },
  serverToClient: {
    requests: {},
    notifications: {},
  },
  bidirectional: {
    requests: {},
    notifications: {},
  },
}));

export type GitProfileProtocol = typeof gitprofileProtocol;
export type GitProfileProtocolDefinition = typeof gitprofileProtocol extends ProtocolInstance<infer Definition>
  ? Definition
  : never;
