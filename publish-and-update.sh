#!/bin/bash

echo "Building socket-definitions..."
npm run build

if [ $? -ne 0 ]; then
    echo "Build failed!"
    exit 1
fi

echo "Bumping version..."
npm version patch

if [ $? -ne 0 ]; then
    echo "Version bump failed!"
    exit 1


echo "Publishing to npm..."
npm publish

if [ $? -ne 0 ]; then
    echo "Publish failed!"
    exit 1
fi

NEW_VERSION=$(node -p "require('./package.json').version")

echo "Published version $NEW_VERSION successfully!"
echo "Waiting 5 seconds for npm registry to propagate..."
sleep 5

echo "Updating web project..."
cd ../web
npm install "@tpgainz/socket-events@$NEW_VERSION"

if [ $? -ne 0 ]; then
    echo "Failed to update web project. Trying with @latest..."
    sleep 5
    npm install "@tpgainz/socket-events@latest"
fi

echo "Updating native project..."
cd ../native
npm install "@tpgainz/socket-events@$NEW_VERSION"

if [ $? -ne 0 ]; then
    echo "Failed to update native project. Trying with @latest..."
    sleep 5
    npm install "@tpgainz/socket-events@latest"
fi

echo "Updating socket-server project..."
cd ../socket-server
npm install "@tpgainz/socket-events@$NEW_VERSION"

if [ $? -ne 0 ]; then
    echo "Failed to update socket-server project. Trying with @latest..."
    sleep 5
    npm install "@tpgainz/socket-events@latest"
fi

cd ../socket-definitions
echo "All projects updated successfully!" 