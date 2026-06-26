export type ProfileCreateInput = {
  profileName: string;
  keyName: string;
  paths: string[];
};

export type ProfileSummary = {
  profileName: string;
  githubLogin?: string;
  keyName?: string;
  pathCount: number;
};

export type ProfileDetails = {
  profileName: string;
  githubLogin: string;
  keyName: string;
  paths: string[];
};

export type ProfilePathChangeInput = {
  profileName: string;
  paths: string[];
};

export type ProfileSetKeyInput = {
  profileName: string;
  keyName: string;
};

export type KeyCreateInput = {
  keyName: string;
};

export type KeySummary = {
  keyName: string;
  githubLabel?: string;
  fingerprint?: string;
};

export type KeyDetails = {
  keyName: string;
  githubLabel?: string;
  fingerprint?: string;
  privateKeyPath?: string;
  publicKeyPath?: string;
};
