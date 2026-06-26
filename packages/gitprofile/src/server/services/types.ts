import type {
  KeyCreateInput,
  KeyDetails,
  KeySummary,
  ProfileCreateInput,
  ProfileDetails,
  ProfilePathChangeInput,
  ProfileSetKeyInput,
  ProfileSummary,
} from '../../shared/index.js';

export type { KeyCreateInput, KeyDetails, KeySummary, ProfileCreateInput, ProfileDetails, ProfileSummary } from '../../shared/index.js';
export type { ProfilePathChangeInput, ProfileSetKeyInput } from '../../shared/index.js';

export interface ProfileService {
  create(input: ProfileCreateInput): Promise<void>;
  list(): Promise<ProfileSummary[]>;
  show(profileName: string): Promise<ProfileDetails | null>;
  addPath(input: ProfilePathChangeInput): Promise<void>;
  removePath(input: ProfilePathChangeInput): Promise<void>;
  setKey(input: ProfileSetKeyInput): Promise<void>;
  delete(profileName: string): Promise<void>;
}

export interface KeyService {
  create(input: KeyCreateInput): Promise<void>;
  list(): Promise<KeySummary[]>;
  show(keyName: string): Promise<KeyDetails | null>;
  rotate(keyName: string): Promise<void>;
  delete(keyName: string): Promise<void>;
}

export type CommandServices = {
  profile: ProfileService;
  key: KeyService;
};
