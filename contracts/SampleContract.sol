// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.27;

contract SampleContract {
    string public message;

    constructor(string memory initialMessage) {
        message = initialMessage;
    }

    function getMessage() public view returns (string memory) {
        return message;
    }
}
