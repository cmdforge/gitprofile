import type { CommandServices } from './types.js';

function unsupported(operation: string): never {
  throw new Error(`${operation} is not implemented yet.`);
}

export function createNoopServices(): CommandServices {
  return {
    profile: {
      async create() {
        unsupported('profile.create');
      },
      async list() {
        unsupported('profile.list');
      },
      async show() {
        unsupported('profile.show');
      },
      async addPath() {
        unsupported('profile.addPath');
      },
      async removePath() {
        unsupported('profile.removePath');
      },
      async setKey() {
        unsupported('profile.setKey');
      },
      async delete() {
        unsupported('profile.delete');
      },
    },
    key: {
      async create() {
        unsupported('key.create');
      },
      async list() {
        unsupported('key.list');
      },
      async show() {
        unsupported('key.show');
      },
      async rotate() {
        unsupported('key.rotate');
      },
      async delete() {
        unsupported('key.delete');
      },
    },
  };
}
