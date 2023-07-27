// SPDX-License-Identifier: MIT OR Apache-2.0

pragma solidity ^0.8.0;

import "./Proxy.sol";

contract DeployFactory {
    Proxy public proxy;

    constructor() {
        proxy = new Proxy(100);
    }
}
