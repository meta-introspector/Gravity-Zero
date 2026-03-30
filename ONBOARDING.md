# Onboarding Guide — Gravity-Zero

Welcome to the kagenti ecosystem! This guide gets you from clone to running service.

## Quick Start

```bash
cd /home/mdupont/git/github.com/deadsg235/Gravity-Zero
make install
make dev
```

## Prerequisites

### Option A: Nix (recommended)
```bash
nix develop   # drops you into a shell with all deps
make dev
```

### Option B: Manual
```bash
# see Makefile
make run
```

## Project Structure

- `Makefile` — build/dev/test/clean targets
- `flake.nix` — reproducible Nix dev environment
- Service port: **9128**

## Testing

```bash
make test
```

## kagenti Integration

This repo is registered as a kagenti agent in the `deadsg` namespace.

| Field | Value |
|-------|-------|
| Agent name | `deadsg-gravity-zero` |
| Namespace | `deadsg` |
| Type | `unknown` |
| Port | `9128` |
| Health | `http://127.0.0.1:9128/` |

### systemd

```bash
# Install the service
cp systemd/deadsg-gravity-zero.service ~/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable --now deadsg-gravity-zero

# Check status
systemctl --user status deadsg-gravity-zero
curl http://127.0.0.1:9128/
```

## Monster Group Orbifold

Your repo maps to orbifold coordinate **(12, 36, 42)** in the 196,883-cell Monster torus (71 × 59 × 47).

- Conformal weight: h = 1.6728
- Bott class: B2
- Eigenspace: Hub

This coordinate is used by the FRACTRAN navigator and CFT analysis tools.

## erdfa Shards

Source files are content-hashed to DA51 CBOR shards for the erdfa content-addressed layer.

```bash
make erdfa   # regenerate shard index
```

## Contributing

1. Fork this repo
2. `nix develop` for reproducible environment
3. Make changes, `make test`
4. PR back to `deadsg235/Gravity-Zero`

## Links

- [kagenti ecosystem](https://github.com/meta-introspector/kagenti)
- [notebooklm-tools](https://github.com/meta-introspector/notebooklm-tools)
- [FRACTRAN breeder](https://github.com/meta-introspector/fractran-breed-rs)
