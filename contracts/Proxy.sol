// SPDX-License-Identifier: MIT OR Apache-2.0

pragma solidity ^0.8.0;

contract Proxy {
    uint256 public count;

    constructor(uint256 _count) {
        count = _count;
    }
}
