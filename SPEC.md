# GitProfile Spec

## Intent

`gitprofile` is a CLI application that defines named GitHub-backed Git identities and binds them to both Git config and SSH config. A GitProfile is the combination of:

- a GitHub account identity
- a set of repository or directory path match rules
- a profile-specific Git config file
- a dedicated SSH host alias
- a reference to a named SSH key entry managed at the device level

The goal is to make it easy to maintain multiple Git identities on one machine and automatically apply the correct Git and SSH settings based on where a repository lives or which host alias its remote uses.

## Core Concept

GitProfile manages a dedicated directory at:

```text
~/.gitprofile
```

Inside that directory, each profile is stored as:

```text
~/.gitprofile/{profile-name}.gitconfig
```

GitProfile also manages a device-level SSH key store at:

```text
~/.ssh/.gitprofile
```

That directory contains the named SSH key entries that profiles can point at.

Each key entry should use a fixed naming convention:

```text
{key-name}.prv
{key-name}.pub
```

The private key is the live key used by Git and SSH. The public key is the value that should be registered on the user's GitHub account.

The same host identifier should be used everywhere the profile needs a stable label:

- SSH host alias
- GitHub SSH key title or display name
- temporary working state
- profile-specific bookkeeping

Profile names must be safe for filenames and SSH host aliases:

- allowed characters: letters, numbers, dashes, underscores
- no spaces
- names should be treated as unique identifiers

For this project, a "profile path" means a string rule associated with a profile. GitProfile will use those rules to add matching entries to the user's global `~/.gitconfig`, so Git can conditionally include the correct profile config.

The GitHub login for the profile should be stored as the canonical account identity, and Git author details should be resolved from GitHub data instead of being stored separately as primary inputs.

## Desired Behavior

### 1. Profile storage

When a user creates a profile named `work`, GitProfile should create:

```text
~/.gitprofile/work.gitconfig
```

That file should contain the profile's Git identity, for example:

```ini
[user]
  name = Work Name
  email = work@example.com
```

Profile-specific configuration may grow later, but `user.name` and `user.email` are derived from the linked GitHub account.

### 2. Profile name rules

Profile names must be restricted to:

- `A-Z`
- `a-z`
- `0-9`
- `_`
- `-`

Spaces and other punctuation should be rejected.

Examples of valid names:

- `work`
- `personal`
- `client_acme`
- `github-work`

Examples of invalid names:

- `work profile`
- `acme/dev`
- `john@company`

### 3. Multiple path rules per profile

A GitProfile can contain multiple path strings.

Example:

- `~/Code/work/`
- `~/Clients/acme/`
- `git@github.com-work:`

The spec treats these as an array of strings attached to the profile definition.

These path strings are important because GitProfile will translate them into entries in the global `~/.gitconfig` that point back to the profile's config file.

### 4. Global gitconfig integration

GitProfile must update the user's global:

```text
~/.gitconfig
```

For each path string associated with a profile, GitProfile should add an include rule that points to the relevant profile config.

Conceptually:

- one profile file lives in `~/.gitprofile/{profile-name}.gitconfig`
- many path strings may reference that same profile
- each path string results in an include entry in `~/.gitconfig`

The intent is that Git chooses the correct profile config automatically when a repository matches one of the configured rules.

### 5. SSH directory and host alias

Each profile owns a host alias in the form:

```text
gitprofile-{profile-name}
```

Each profile references a named key entry in:

```text
~/.ssh/.gitprofile
```

That key store should contain the SSH private key and public key for named key entries.

The intended host config shape is:

```ts
const hostConfig = {
  Host: host,
  HostName: 'github.com',
  User: 'git',
  IdentityFile: paths.keys.private,
  IdentitiesOnly: 'yes',
};
```

Where:

- `host` is `gitprofile-{profile-name}`
- `paths.keys.private` points to the private key inside `~/.ssh/.gitprofile/{key-name}.prv`

Example rendered SSH config:

```sshconfig
Host gitprofile-work
  HostName github.com
  User git
  IdentityFile ~/.ssh/.gitprofile/work-main.prv
  IdentitiesOnly yes
```

This allows Git remotes to use the host alias and automatically pick up the right SSH identity:

```text
git@gitprofile-work:owner/repo.git
```

### 6. SSH credential separation

One of the main reasons for this design is SSH separation.

By attaching different path rules to different profiles, the user can:

- route repositories to different identities
- pair those identities with distinct SSH host aliases and keys
- keep repository activity grouped by profile

In practice, this enables workflows such as:

- personal repositories using one name/email and one SSH identity
- work repositories using another name/email and another SSH identity

GitProfile should manage the SSH host entry in `~/.ssh/config` so the host alias points to the referenced key entry.

### 7. GitHub account binding

Each profile should be bound to a GitHub login.

The GitHub login is the canonical identity for the profile and should be used for:

- resolving Git author details
- selecting the authenticated GitHub account with `gh`
- labeling GitHub SSH key operations
- associating the profile with the correct GitHub account during provisioning and rotation
- selecting one of the named key entries managed on the device

Profile creation requires an authenticated `gh` session.

When GitProfile needs author data, it should resolve it from GitHub rather than storing separate `user.name` and `user.email` inputs.

Suggested resolution policy:

- `gh api user --jq '{id: .id, login: .login, name: (.name // .login)}'` provides the canonical account fields
- `user.name` comes from `.name`
- `user.email` is derived as `{id}+{login}@users.noreply.github.com`
- if the account cannot be resolved through `gh`, provisioning should stop until the user authenticates

### 8. Device-level SSH key store

GitProfile should manage SSH keys separately from profiles.

The device-level key store lives under:

```text
~/.ssh/.gitprofile
```

This directory is responsible for:

- storing named private/public keypairs
- tracking which GitHub account and host label each key belongs to
- allowing multiple profiles to point at the same key entry

The key management model should support a `key` command family so users can create, inspect, rotate, and remove named keys independently of profiles.

### 9. Temporary working state

Profile provisioning and key rotation should use a deterministic temporary directory under:

```text
~/.gitprofile/.tmp.{host}
```

Where `{host}` is the profile host identifier, for example:

```text
~/.gitprofile/.tmp.gitprofile-work
```

This directory should be used for in-progress files, staged metadata, and any recovery data needed to resume or clean up a failed provisioning/rotation step.

### 10. Provisioning prerequisites

Profile creation and key rotation should verify required tooling before making changes.

The CLI should check for these binaries up front:

- `git`
- `gh`
- `ssh-keygen`
- `ssh`

The check must be cross-platform. On Windows, use `where.exe`; on Unix-like systems, use `which` or an equivalent PATH lookup strategy.

The intent is to fail fast before partial profile creation begins.

### 11. Key generation rules

SSH key generation is part of profile provisioning.

Requirements:

- keys must be generated without a passphrase
- the key entry should track the new key as soon as it is created
- the live key should not be replaced until the new key has been fully generated and the GitHub update succeeds
- if a failure occurs mid-provisioning, the key entry should still know about the in-progress key so the process can be resumed or cleaned up safely

The public key should only be added or replaced on the user's GitHub account after all local setup succeeds.

### 12. Key rotation

GitProfile should provide a command to rotate a named SSH key.

Expected behavior:

- generate a new no-passphrase key pair for the key entry
- keep the existing key active until the new key is ready
- update the key metadata to point at the replacement key
- replace the key on GitHub only after the new local key exists and the profile state has been updated
- update `~/.ssh/config` to point the host alias at the new private key after the GitHub update succeeds
- preserve enough metadata to recover from a failure during rotation

## Data Model

Initial GitProfile shape:

```ts
type GitProfile = {
  name: string;
  githubUsername: string;
  paths: string[];
  sshKeyName: string;
};
```

Notes:

- `name` is the unique profile identifier
- `githubUsername` is the canonical GitHub login and is resolved from the authenticated `gh` session
- `paths` is an array of strings
- each string maps to a conditional include rule in the global Git config
- `host` is derived as `gitprofile-{profile-name}` and is not stored separately
- `sshKeyName` is the named device-level key entry the profile uses
- temporary state lives under `~/.gitprofile/.tmp.{host}`

## CLI Scope

The first implementation should be a Node.js CLI built with `commander`.

Initial command surface:

### `gitprofile create`

Creates a new profile.

Inputs:

- profile name
- key name
- one or more path strings

Expected behavior:

- verify required dependencies before doing anything else
- resolve the authenticated GitHub account through `gh`
- ensure `~/.gitprofile` exists
- ensure `~/.ssh/.gitprofile` exists
- write `~/.gitprofile/{profile-name}.gitconfig`
- add the appropriate include rules to `~/.gitconfig`
- create or register the SSH host entry in `~/.ssh/config`
- attach the profile to a named key entry, defaulting to a shared key for the GitHub account if one already exists
- register the public key with GitHub through `gh` using the same `host` identifier as the GitHub-facing key label

### `gitprofile list`

Lists known profiles.

Expected behavior:

- inspect `~/.gitprofile`
- show profile names
- optionally show configured identity and path rules
- optionally show host alias and SSH key name
- optionally show the bound GitHub login

### `gitprofile show <name>`

Displays one profile's stored settings.

Expected behavior:

- read `~/.gitprofile/{profile-name}.gitconfig`
- display resolved fields such as GitHub login, derived name, derived email, paths, host alias, and SSH key name

### `gitprofile add-path <name> <path>`

Adds a new path string to an existing profile.

Expected behavior:

- update the profile definition
- add the corresponding include rule to `~/.gitconfig`
- optionally update the profile's referenced key name

### `gitprofile remove-path <name> <path>`

Removes a path string from an existing profile.

Expected behavior:

- update the profile definition
- remove the corresponding include rule from `~/.gitconfig`

### `gitprofile delete <name>`

Deletes a profile.

Expected behavior:

- remove `~/.gitprofile/{profile-name}.gitconfig`
- remove all related include rules from `~/.gitconfig`
- remove the related host entry from `~/.ssh/config`
- leave unrelated SSH config entries untouched
- optionally remove the associated GitHub SSH key if the CLI can identify it safely

### `gitprofile key create <key-name>`

Initializes a named SSH keypair.

Expected behavior:

- ensure `~/.ssh/.gitprofile` exists
- create a no-passphrase keypair in that directory if one does not already exist
- register the public key with GitHub after local generation succeeds using the same `host` identifier

### `gitprofile key list`

Lists known SSH keys managed by GitProfile.

Expected behavior:

- inspect `~/.ssh/.gitprofile`
- show key names and associated GitHub labels if available

### `gitprofile key show <key-name>`

Displays one named SSH key entry's stored settings.

Expected behavior:

- read the key entry metadata
- display resolved fields such as GitHub label, file paths, and rotation state

### `gitprofile key rotate <key-name>`

Rotates a named SSH keypair.

Expected behavior:

- generate a replacement keypair with the fixed key naming convention
- leave the current key active until the new key is ready
- update the key metadata to point at the replacement key
- replace the key on GitHub only after the local replacement succeeds, using the same `host` identifier
- update the host entries that reference this key after the GitHub update succeeds

### `gitprofile key delete <key-name>`

Deletes a named SSH key entry.

Expected behavior:

- remove the local key files and metadata
- remove the GitHub key if it can be identified safely
- fail if the key is still referenced by any profile unless forced

### `gitprofile init-key <name>`

Initializes a named SSH keypair for a profile as a convenience wrapper.

Expected behavior:

- ensure the referenced named key exists
- attach the profile host entry to that key
- register the public key with GitHub after local generation succeeds using the same `host` identifier

### `gitprofile remote-url <name> <owner> <repo>`

Builds the recommended SSH remote URL for a profile.

Expected behavior:

- derive the host alias from the profile name
- output a URL such as `git@gitprofile-work:owner/repo.git`

This command is optional for V1, but the remote URL pattern should be part of the documented model even if the command is deferred.

## File Responsibilities

### `~/.gitprofile/{profile-name}.gitconfig`

Responsible for:

- storing profile-specific Git identity derived from GitHub
- serving as the include target for matching Git rules
- storing profile bookkeeping and recovery state in `~/.gitprofile/.tmp.{host}` during provisioning and rotation
- storing the referenced SSH key name

### `~/.ssh/.gitprofile`

Responsible for:

- storing named SSH private keys
- storing the matching public keys
- storing key-level bookkeeping and recovery state

### `~/.ssh/config`

Responsible for:

- containing the managed `Host gitprofile-{profile-name}` entries
- mapping each GitProfile host alias to its dedicated private key

### `~/.gitconfig`

Responsible for:

- containing the global include rules that map path strings to profile config files

GitProfile should modify only the entries it owns and avoid damaging unrelated user configuration.

## Safety and Idempotency Requirements

The CLI should be safe to run repeatedly.

Requirements:

- creating an existing profile should fail clearly or require an explicit overwrite flag
- adding a duplicate path rule should not create duplicate global entries
- removing a nonexistent path rule should fail clearly
- deleting a profile should remove only entries associated with that profile
- manual user config outside GitProfile-managed entries should remain untouched
- host alias generation must be deterministic from the profile name
- SSH config updates must remove or update only GitProfile-managed host entries
- existing SSH keys should not be overwritten without explicit confirmation or a force flag
- profile provisioning must not mutate the live SSH host entry until the new key has been generated successfully
- the CLI must preserve enough state to recover from an interrupted key generation or rotation
- the same `host` identifier must be used consistently across SSH config, GitHub key management, and temporary state
- a key may be referenced by multiple profiles
- profile provisioning should not duplicate keys when an existing named key can be reused

## Open Design Questions

These still need to be finalized before implementation:

1. What exact Git conditional include mechanism should back "profile paths"?
2. Should path strings support only directory matching, or also URL matching and SSH host alias matching?
3. Where should the `paths` array be persisted?

Options:

- inside the profile `.gitconfig` as a custom section
- in a separate metadata file under `~/.gitprofile`
- in both, with one canonical source of truth

4. How should GitProfile mark entries in `~/.gitconfig` so they can be updated safely later?
5. How should GitProfile mark entries in `~/.ssh/config` so they can be updated safely later?
6. Should `create` be interactive, flags-only, or support both?
7. Should delete remove the GitHub SSH key automatically, or only local files and config?
8. Should the temporary `.tmp.{host}` directory be cleaned automatically on success, or retained for debugging?
9. Should `key create` be able to import an existing local key instead of always generating a fresh one?

## Proposed Implementation Direction

For the first draft:

- use `commander` for command parsing
- treat `~/.gitprofile` as the managed storage directory
- generate one `.gitconfig` file per profile
- maintain deterministic, tool-owned include entries in the global `~/.gitconfig`
- maintain deterministic, tool-owned host entries in `~/.ssh/config`
- maintain one device-level SSH key store under `~/.ssh/.gitprofile`
- validate required external binaries before provisioning
- use the same host identifier across GitHub, SSH, and temporary state
- resolve author identity from the linked GitHub login instead of asking for separate `user.name` and `user.email`
- allow profiles to reuse a named SSH key instead of duplicating key material
- keep the implementation focused on local Git and SSH config orchestration

## Non-Goals For V1

- credential helper management
- GUI workflows
- remote profile sync
- advanced Git setting templating beyond identity and include-path behavior

## Summary

`gitprofile` is a CLI for defining named GitHub-backed Git identities and associating them with multiple path rules and a dedicated SSH host alias. Each profile is stored as its own config file under `~/.gitprofile`, `~/.ssh/.gitprofile` stores named device-level SSH keys, `~/.gitprofile/.tmp.{host}` stores temporary in-progress state, the user's global `~/.gitconfig` contains the conditional rules that include those profile configs, and `~/.ssh/config` contains a managed host entry that selects the referenced SSH key for Git remotes such as `git@gitprofile-work:owner/repo.git`.

The immediate next step after this spec is to finalize the exact include-rule format, decide whether profiles should always point at an explicit named key or can default to a shared per-account key, and define the exact GitHub SSH key registration flow through `gh` so provisioning and rotation can be made atomic enough to recover from partial failures.
