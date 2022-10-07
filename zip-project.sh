#!/bin/bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd "$SCRIPT_DIR"

zip -r ../flight-finder.zip . -x .git/\* -x node_modules/\* -x .vscode/\* -x .gitignore -x Readme.md -x .DS_Store -x zip-project.sh
