export type ProfileCreateInput = {
  name: string;
  keyName?: string;
  paths: string[];
};

export type ProfileSummary = {
  name: string;
  githubLogin?: string;
  keyName?: string;
  pathCount: number;
};

export type ProfileDetails = {
  name: string;
  githubLogin: string;
  keyName: string;
  paths: string[];
};

export type KeyCreateInput = {
  name: string;
};

export type KeySummary = {
  name: string;
  githubLabel?: string;
  fingerprint?: string;
};

export type KeyDetails = {
  name: string;
  githubLabel?: string;
  fingerprint?: string;
  privateKeyPath?: string;
  publicKeyPath?: string;
};

export interface ProfileService {
  create(input: ProfileCreateInput): Promise<void>;
  list(): Promise<ProfileSummary[]>;
  show(name: string): Promise<ProfileDetails | null>;
  addPath(name: string, path: string): Promise<void>;
  removePath(name: string, path: string): Promise<void>;
  setKey(name: string, keyName: string): Promise<void>;
  delete(name: string): Promise<void>;
}

export interface KeyService {
  create(input: KeyCreateInput): Promise<void>;
  list(): Promise<KeySummary[]>;
  show(name: string): Promise<KeyDetails | null>;
  rotate(name: string): Promise<void>;
  delete(name: string): Promise<void>;
}

export type CommandServices = {
  profile: ProfileService;
  key: KeyService;
};
