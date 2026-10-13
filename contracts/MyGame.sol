// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MyGame {
    string public name = "DotsAndBoxes";
    string public symbol = "DAB";
    address public owner;
    address public prizePool;
    uint256 public constant ROYALTY_PERCENT = 1500;
    uint256 public constant RENTAL_FEE_PERCENT = 3000;
    uint256 private _tokenCounter;

    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;
    mapping(uint256 => string) private _tokenURIs;
    mapping(uint256 => uint256) public nftLevels;

    event NFTMinted(address indexed to, uint256 tokenId, uint256 level);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address _prizePool) {
        owner = msg.sender;
        prizePool = _prizePool;
    }

    function mintNFT(address recipient, string memory uri) public onlyOwner returns (uint256) {
        _tokenCounter += 1;
        uint256 newTokenId = _tokenCounter;
        _owners[newTokenId] = recipient;
        _balances[recipient] += 1;
        _tokenURIs[newTokenId] = uri;
        nftLevels[newTokenId] = 1;
        emit NFTMinted(recipient, newTokenId, 1);
        return newTokenId;
    }

    function ownerOf(uint256 tokenId) public view returns (address) {
        return _owners[tokenId];
    }

    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }

    function tokenURI(uint256 tokenId) public view returns (string memory) {
        return _tokenURIs[tokenId];
    }

    function totalSupply() public view returns (uint256) {
        return _tokenCounter;
    }

    function setPrizePool(address newPool) public onlyOwner {
        prizePool = newPool;
    }

    function upgradeNFT(uint256 tokenId) public {
        require(_owners[tokenId] == msg.sender, "Not owner");
        nftLevels[tokenId] += 1;
    }

    function royaltyInfo(uint256, uint256 salePrice) public view returns (address, uint256) {
        return (owner, (salePrice * ROYALTY_PERCENT) / 10000);
    }
}
