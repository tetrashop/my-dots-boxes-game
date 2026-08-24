// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract DotsAndBoxesNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    uint256 public constant ROYALTY_PERCENT = 1500;
    uint256 public constant RENTAL_FEE_PERCENT = 3000;

    address public prizePool;

    struct NFTItem {
        uint256 level;
        uint256 wins;
        uint256 boxes;
        bool isRental;
        address renter;
        uint256 rentalEnd;
    }

    mapping(uint256 => NFTItem) public nftDetails;

    event NFTMinted(address indexed owner, uint256 tokenId, uint256 level);
    event NFTUpgraded(uint256 tokenId, uint256 newLevel);
    event NFTRented(uint256 tokenId, address indexed renter, uint256 duration);
    event RoyaltyPaid(uint256 tokenId, uint256 amount);

    constructor(address _prizePool) ERC721("DotsAndBoxes", "DAB") {
        prizePool = _prizePool;
    }

    function mintNFT(address recipient, string memory uri) external onlyOwner returns (uint256) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        _mint(recipient, newTokenId);
        _setTokenURI(newTokenId, uri);
        
        nftDetails[newTokenId] = NFTItem({
            level: 1,
            wins: 0,
            boxes: 0,
            isRental: false,
            renter: address(0),
            rentalEnd: 0
        });
        
        emit NFTMinted(recipient, newTokenId, 1);
        return newTokenId;
    }

    function upgradeNFT(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        require(!nftDetails[tokenId].isRental, "NFT is rented");
        
        nftDetails[tokenId].level++;
        emit NFTUpgraded(tokenId, nftDetails[tokenId].level);
    }

    function rentNFT(uint256 tokenId, uint256 duration) external payable {
        require(ownerOf(tokenId) != msg.sender, "Cannot rent own NFT");
        require(!nftDetails[tokenId].isRental, "Already rented");
        require(msg.value > 0, "Send payment");
        
        uint256 fee = (msg.value * RENTAL_FEE_PERCENT) / 10000;
        uint256 ownerShare = msg.value - fee;
        
        payable(ownerOf(tokenId)).transfer(ownerShare);
        payable(prizePool).transfer(fee);
        
        nftDetails[tokenId].isRental = true;
        nftDetails[tokenId].renter = msg.sender;
        nftDetails[tokenId].rentalEnd = block.timestamp + duration;
        
        emit NFTRented(tokenId, msg.sender, duration);
    }

    function royaltyInfo(uint256 tokenId, uint256 salePrice) external view returns (address receiver, uint256 royaltyAmount) {
        royaltyAmount = (salePrice * ROYALTY_PERCENT) / 10000;
        return (owner(), royaltyAmount);
    }

    function setPrizePool(address _newPool) external onlyOwner {
        prizePool = _newPool;
    }
}
