# Batch operator smart contract

## Short intro

### 🌐 Context

Onchain.Storage is an ecosystem of on-chain modular storage protocols that can interact each other, in the form of smart contract live on an EVM compatible blockchain.

### 💣 Problem 

A user who wants to interact with different protocols has to do separate transactions and wait for separate responses. This inherently slows down the whole process making it inefficient.

### 🎯 Goal

Create a protocol which allows any user interact with a dynamic list of protocols, managing them using a set of admin keys. In essence, we are introducing a proxy contract that manages different contracts' interaction.

### 📌 Protocol Overview

At high level, the protocol works as follows

- There is a set of admin keys which allow to call specific contracts
- In order to reduce the overall complexity we aim these contracts to be static (i.e. not upgradable)
- All the calls will be packed off-chain and sent as pure data to the receiver contracts, this means we don't need to integrate ABI

## Protocol Description

A proxy contract forwards client calls to one or more contracts. Since in principle anyone is allowed to forward transactions to any contract, we implement an enablement check for the legitimate contracts in order to avoid potential unexpected outcomes.

The protocol basically consists in three functions:

- An Admin function, to add/remove admins.
- A Protocol Enabler function, to add/remove allowed protocols.
- A proxy function, which contains the logic of the forwarder itself.

## Add or remove admins

To manage admins we need to run following function

`manageProtocolAdmins(address admin, bool state)`

This function will enable the `admin` if the `state` is `true` or will disable the address if `false`.

## Enable or disable protocols

To manage protocols we need to run following function

`manageProtocolContracts(address protocol, bool state)`

This function will enable the `protocol` if the `state` is `true` or will disable the address if `false`.

## Create a proxy call

To create a proxy call we need to run following function

`createOnchainProxyTransaction(address[] protocols, unit256[] values, bytes[] data)`

As we can see all the parameters are arrays, so the contract can loop over `protocols`, `values` and `data`.

### Flow

- The contract will check if `protocols` are allowed.
- The contract will also check if the sum of `values` is exactly the `msg.value` amount, so the user can't cheat over values.
- The loop will throw an error if one of the calls fails.
- No event will be emitted to avoid gas consuption.

## Sillabus
- `admin`: Address representing an admin
- `protocol`: Address representing a protocol smart contract
- `protocols`: List of addresses representing more than one protocols smart contrats
- `values`: List that describes how the total value sent to bulk contract is divided among each protocol
- `data`: List that collects the data being sent to each protocol