# gitprofile

`gitprofile` manages GitHub-backed Git identities, SSH keys, and profile-based host aliases.

## Quickstart

```bash
pnpm install
pnpm build
node packages/gitprofile/dist/cli.js --help
```

## Command Tree

```text
gitprofile
├─ create <profile-name>
├─ list
├─ show <profile-name>
├─ addPath <profile-name> <path...>
├─ removePath <profile-name> <path...>
├─ setKey <profile-name> <key-name>
├─ delete <profile-name>
└─ key
   ├─ create <key-name>
   ├─ list
   ├─ show <key-name>
   ├─ rotate <key-name>
   └─ delete <key-name>
```

## Storage Layout

- `~/.gitprofile/config`
- `~/.gitprofile/profiles/{profile-name}.gitconfig`
- `~/.gitprofile/keys/{key-name}.prv`
- `~/.gitprofile/keys/{key-name}.pub`
- `~/.gitprofile/ssh_config`
- `~/.ssh/config` as a small include shim

See [`SPEC.md`](./SPEC.md) for the detailed behavior and edge cases.
