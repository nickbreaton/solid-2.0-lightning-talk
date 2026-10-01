#!/bin/sh
# Build the deck and publish it to the gh-pages branch (GitHub Pages).
set -e

REMOTE=$(git remote get-url origin)
SHA=$(git rev-parse --short HEAD)

npx slidev build --base /solid-2.0-lightning-talk/
touch dist/.nojekyll
rm -f dist/_redirects

cd dist
rm -rf .git
git init -q -b gh-pages
git add -A
git commit -q -m "Deploy $SHA"
git push -f "$REMOTE" gh-pages
rm -rf .git

echo "Deployed $SHA → https://nickbreaton.github.io/solid-2.0-lightning-talk/"
