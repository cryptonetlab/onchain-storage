#!/bin/bash

if [ $1 == "hardhat" ]
then
yarn task nft:deploy $1
yarn task deploy $1
yarn task setup $1
yarn task nft:mint $1
fi
