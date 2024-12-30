// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MockCadenceArch {
    function revertibleRandom() external pure returns (uint64) {
        return 123456789;
    }
}
