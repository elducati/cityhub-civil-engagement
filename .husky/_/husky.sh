#!/usr/bin/env sh
if [ -z "$HUSKY" ]; then
  exit 0
fi

export HUSKY="true"
command -v git >/dev/null && git rev-parse --git-dir >/dev/null && exit 0 || exit 1