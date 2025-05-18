#!/bin/bash
npm config set @rocketclimb:registry https://npm.pkg.github.com
npm config set //npm.pkg.github.com/:_authToken $GITHUB_TOKEN 