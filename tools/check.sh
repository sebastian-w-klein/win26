#!/usr/bin/env bash
# Parse every ES module. `node --check` mis-handles ESM, so import each instead.
# Modules that touch the DOM at load will throw ReferenceError once parsed --
# that is a pass, since it means the syntax is fine.
cd "$(dirname "$0")/.." || exit 1
fail=0
for f in $(find src -name '*.js' | sort); do
  out=$(node --input-type=module -e "import('file://$PWD/$f').catch(e=>{console.log(e.constructor.name+': '+e.message);process.exit(1)})" 2>&1)
  case "$out" in
    "") ;;
    ReferenceError:*"is not defined"*) ;;   # needs a browser, parsed fine
    *) echo "FAIL $f: $out"; fail=1 ;;
  esac
done
[ $fail -eq 0 ] && echo "all modules parse clean"
exit $fail
