#!/usr/bin/env bash
set -euo pipefail
prefix="$(mktemp -d)"
export npm_config_cache="${TMPDIR:-/tmp}/td-npm-cache"
npm pack --silent
archive="$(ls -t ./*.tgz | head -n1)"
npm install --prefix "$prefix" "$archive" --silent
"$prefix/bin/td" --version
"$prefix/bin/td" --help | grep -F 'projects'
