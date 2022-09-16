#!/bin/bash

if [ $1 == "hardhat" ]
then
yarn task nft:721:deploy $1
yarn task deploy $1
yarn task setup $1
yarn task nft:721:mint $1
fi
