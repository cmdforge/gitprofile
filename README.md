# gitprofile

`gitprofile` is a CLI for managing GitHub-backed Git identities and the SSH keys they use.

## Quickstart

```bash
npm install
npm run build
node dist/cli.js --help
```

## Command Groups

- `gitprofile profile ...` manages profiles
- `gitprofile key ...` manages device-level SSH keys

This repo’s detailed behavior, data model, and edge cases live in [`SPEC.md`](./SPEC.md).
