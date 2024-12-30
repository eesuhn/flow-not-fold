// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Poker {
    uint256 public constant MIN_ENTRY_FEE = 1 ether;
    address public constant cadenceArch =
        0x0000000000000000000000010000000000000001;

    struct Game {
        address player1;
        address player2;
        bool gameActive;
        bool winningsWithdrawn;
        uint256 pool;
    }
    mapping(uint256 => Game) public games;

    function playGame(uint256 gameId) external payable {
        // Function to join a game
        require(!games[gameId].gameActive, "Game is active");
        if (games[gameId].player1 == address(0)) {
            require(msg.value >= MIN_ENTRY_FEE, "Minimum bet: 1 $FLOW");
            games[gameId] = Game({
                player1: msg.sender,
                player2: address(0),
                gameActive: false,
                winningsWithdrawn: false,
                pool: msg.value
            });
        } else if (games[gameId].player2 == address(0)) {
            Game storage game = games[gameId];
            require(msg.value >= MIN_ENTRY_FEE, "Minimum bet: 1 $FLOW");
            require(msg.sender != game.player1, "Already joined as player 1");
            game.player2 = msg.sender;
            game.pool = game.pool + msg.value;
            game.gameActive = true;
        }
    }

    function withdraw(uint256 gameId) external {
        // Withdraw winner's winnings based on game ID
        Game storage game = games[gameId];
        require(game.gameActive, "Game is not active");
        require(
            msg.sender == game.player1 || msg.sender == game.player2,
            "Only players can request for withdrawal"
        );
        require(!game.winningsWithdrawn, "Winnings already withdrawn");
        game.winningsWithdrawn = true;
        game.gameActive = false;
        game.player1 = address(0);
        game.player2 = address(0);
        payable(msg.sender).transfer(game.pool);
    }

    function vrf() public view returns (uint64) {
        (bool ok, bytes memory data) = cadenceArch.staticcall(
            abi.encodeWithSignature("revertibleRandom()")
        );
        require(ok, "Failed to fetch a random number through Cadence Arch");
        uint64 randomNumber = abi.decode(data, (uint64));
        return (randomNumber % (52)) + 1;
    }

    // Fallback function to prevent accidental $FLOW transfers
    receive() external payable {
        revert("Direct deposits not allowed");
    }
}
