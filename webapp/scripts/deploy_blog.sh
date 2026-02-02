#!/bin/bash
set -e

SITE_NAME=$1
SRC_DIR=$2
TARGET_DIR="/var/www/$SITE_NAME"

echo "Deploying $SITE_NAME to $TARGET_DIR..."
rm -rf "$TARGET_DIR"
mkdir -p "$TARGET_DIR"
cp -r "$SRC_DIR"/* "$TARGET_DIR"

echo "Deployment complete."
