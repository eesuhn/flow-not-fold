// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PokerContract {
    uint256 public constant MIN_ENTRY_FEE = 1 ether;
    address public immutable cadenceArch;
    address public owner;

    // Reentrancy guard
    uint256 private _status;
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;

    enum GameState {
        EMPTY,
        WAITING,
        ACTIVE,
        COMPLETED
    }

    struct Game {
        address player1;
        address player2;
        GameState state;
        uint256 pool;
        uint256 lastActionTimestamp;
    }

    mapping(uint256 => Game) public games;

    uint256 public gameTimeout = 1 hours;
    uint256 public houseCommission = 25; // 2.5%

    event GameCreated(
        uint256 indexed gameId,
        address indexed player1,
        uint256 bet
    );
    event GameJoined(
        uint256 indexed gameId,
        address indexed player2,
        uint256 totalPool
    );
    event GameCompleted(
        uint256 indexed gameId,
        address indexed winner,
        uint256 amount
    );
    event GameCancelled(uint256 indexed gameId);

    modifier nonReentrant() {
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address _cadenceArch) {
        require(_cadenceArch != address(0), "Invalid address");
        cadenceArch = _cadenceArch;
        owner = msg.sender;
        _status = _NOT_ENTERED;
    }

    modifier validGameId(uint256 gameId) {
        require(games[gameId].state != GameState.EMPTY, "Game does not exist");
        _;
    }

    modifier onlyPlayers(uint256 gameId) {
        require(
            msg.sender == games[gameId].player1 ||
                msg.sender == games[gameId].player2,
            "Not a player in this game"
        );
        _;
    }

    function createGame(uint256 gameId) external payable {
        require(games[gameId].state == GameState.EMPTY, "Game ID taken");
        require(msg.value >= MIN_ENTRY_FEE, "Insufficient entry fee");

        games[gameId] = Game({
            player1: msg.sender,
            player2: address(0),
            state: GameState.WAITING,
            pool: msg.value,
            lastActionTimestamp: block.timestamp
        });

        emit GameCreated(gameId, msg.sender, msg.value);
    }

    function joinGame(uint256 gameId) external payable validGameId(gameId) {
        Game storage game = games[gameId];
        require(game.state == GameState.WAITING, "Game not joinable");
        require(msg.value >= MIN_ENTRY_FEE, "Insufficient entry fee");
        require(msg.sender != game.player1, "Already in game");

        game.player2 = msg.sender;
        game.pool += msg.value;
        game.state = GameState.ACTIVE;
        game.lastActionTimestamp = block.timestamp;

        emit GameJoined(gameId, msg.sender, game.pool);
    }

    function claimWinnings(
        uint256 gameId
    ) external nonReentrant validGameId(gameId) onlyPlayers(gameId) {
        Game storage game = games[gameId];
        require(game.state == GameState.COMPLETED, "Game not completed");

        uint256 commission = (game.pool * houseCommission) / 1000;
        uint256 winnings = game.pool - commission;

        // Reset game state
        delete games[gameId];

        // Transfer winnings
        payable(msg.sender).transfer(winnings);
        payable(owner).transfer(commission);

        emit GameCompleted(gameId, msg.sender, winnings);
    }

    function cancelGame(uint256 gameId) external validGameId(gameId) {
        Game storage game = games[gameId];
        require(
            msg.sender == game.player1 ||
                block.timestamp > game.lastActionTimestamp + gameTimeout,
            "Not authorized to cancel"
        );
        require(game.state != GameState.COMPLETED, "Game already completed");

        if (game.state == GameState.WAITING) {
            uint256 refund = game.pool;
            delete games[gameId];
            payable(game.player1).transfer(refund);
        }

        emit GameCancelled(gameId);
    }

    function getRandomCard() public view returns (uint8) {
        (bool success, bytes memory data) = cadenceArch.staticcall(
            abi.encodeWithSignature("revertibleRandom()")
        );
        require(success, "Random number generation failed");
        uint64 randomNumber = abi.decode(data, (uint64));
        return uint8((randomNumber % 52) + 1);
    }

    function setGameTimeout(uint256 _timeout) external onlyOwner {
        gameTimeout = _timeout;
    }

    function setHouseCommission(uint256 _commission) external onlyOwner {
        require(_commission <= 50, "Commission too high"); // Max 5%
        houseCommission = _commission;
    }

    function forceCompleteGame(uint256 gameId) external {
        games[gameId].state = GameState.COMPLETED;
    }

    receive() external payable {
        revert("Direct deposits not allowed");
    }
}
