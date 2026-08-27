// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// ========== IERC721 ==========
interface IERC721 {
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
    
    function balanceOf(address owner) external view returns (uint256 balance);
    function ownerOf(uint256 tokenId) external view returns (address owner);
    function safeTransferFrom(address from, address to, uint256 tokenId) external;
    function transferFrom(address from, address to, uint256 tokenId) external;
    function approve(address to, uint256 tokenId) external;
    function getApproved(uint256 tokenId) external view returns (address operator);
    function setApprovalForAll(address operator, bool approved) external;
    function isApprovedForAll(address owner, address operator) external view returns (bool);
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes calldata data) external;
}

// ========== IERC721Metadata ==========
interface IERC721Metadata {
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function tokenURI(uint256 tokenId) external view returns (string memory);
}

// ========== IERC721Receiver ==========
interface IERC721Receiver {
    function onERC721Received(address operator, address from, uint256 tokenId, bytes calldata data) external returns (bytes4);
}

// ========== Ownable ==========
abstract contract Ownable {
    address private _owner;
    
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    
    constructor() {
        _owner = msg.sender;
    }
    
    function owner() public view returns (address) {
        return _owner;
    }
    
    modifier onlyOwner() {
        require(msg.sender == _owner, "Not owner");
        _;
    }
    
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "Invalid address");
        emit OwnershipTransferred(_owner, newOwner);
        _owner = newOwner;
    }
}

// ========== Strings ==========
library Strings {
    function toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits--;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}

// ========== Counters ==========
library Counters {
    struct Counter {
        uint256 _value;
    }
    
    function current(Counter storage counter) internal view returns (uint256) {
        return counter._value;
    }
    
    function increment(Counter storage counter) internal {
        unchecked {
            counter._value++;
        }
    }
}

// ========== ERC721 ==========
contract ERC721 is IERC721, IERC721Metadata {
    using Strings for uint256;
    
    string private _name;
    string private _symbol;
    
    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;
    mapping(uint256 => address) private _tokenApprovals;
    mapping(address => mapping(address => bool)) private _operatorApprovals;
    mapping(uint256 => string) private _tokenURIs;
    
    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
    }
    
    function name() public view virtual override returns (string memory) {
        return _name;
    }
    
    function symbol() public view virtual override returns (string memory) {
        return _symbol;
    }
    
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "ERC721: URI query for nonexistent token");
        return _tokenURIs[tokenId];
    }
    
    function _setTokenURI(uint256 tokenId, string memory uri) internal virtual {
        require(_exists(tokenId), "ERC721: URI set of nonexistent token");
        _tokenURIs[tokenId] = uri;
    }
    
    function balanceOf(address owner) public view virtual override returns (uint256) {
        require(owner != address(0), "ERC721: balance query for zero address");
        return _balances[owner];
    }
    
    function ownerOf(uint256 tokenId) public view virtual override returns (address) {
        address owner = _owners[tokenId];
        require(owner != address(0), "ERC721: owner query for nonexistent token");
        return owner;
    }
    
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _owners[tokenId] != address(0);
    }
    
    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view returns (bool) {
        address owner = ownerOf(tokenId);
        return (spender == owner || getApproved(tokenId) == spender || isApprovedForAll(owner, spender));
    }
    
    function _mint(address to, uint256 tokenId) internal virtual {
        require(to != address(0), "ERC721: mint to zero address");
        require(!_exists(tokenId), "ERC721: token already minted");
        
        _balances[to] += 1;
        _owners[tokenId] = to;
        
        emit Transfer(address(0), to, tokenId);
    }
    
    function _transfer(address from, address to, uint256 tokenId) internal virtual {
        require(ownerOf(tokenId) == from, "ERC721: transfer of token that is not own");
        require(to != address(0), "ERC721: transfer to zero address");
        
        _approve(address(0), tokenId);
        
        _balances[from] -= 1;
        _balances[to] += 1;
        _owners[tokenId] = to;
        
        emit Transfer(from, to, tokenId);
    }
    
    function approve(address to, uint256 tokenId) public virtual override {
        address owner = ownerOf(tokenId);
        require(to != owner, "ERC721: approval to current owner");
        require(msg.sender == owner || isApprovedForAll(owner, msg.sender), "ERC721: approve caller is not owner nor approved for all");
        _approve(to, tokenId);
    }
    
    function _approve(address to, uint256 tokenId) internal virtual {
        _tokenApprovals[tokenId] = to;
        emit Approval(ownerOf(tokenId), to, tokenId);
    }
    
    function getApproved(uint256 tokenId) public view virtual override returns (address) {
        require(_exists(tokenId), "ERC721: approved query for nonexistent token");
        return _tokenApprovals[tokenId];
    }
    
    function setApprovalForAll(address operator, bool approved) public virtual override {
        _setApprovalForAll(msg.sender, operator, approved);
    }
    
    function _setApprovalForAll(address owner, address operator, bool approved) internal virtual {
        require(owner != operator, "ERC721: approve to caller");
        _operatorApprovals[owner][operator] = approved;
        emit ApprovalForAll(owner, operator, approved);
    }
    
    function isApprovedForAll(address owner, address operator) public view virtual override returns (bool) {
        return _operatorApprovals[owner][operator];
    }
    
    function transferFrom(address from, address to, uint256 tokenId) public virtual override {
        require(_isApprovedOrOwner(msg.sender, tokenId), "ERC721: transfer caller is not owner nor approved");
        _transfer(from, to, tokenId);
    }
    
    function safeTransferFrom(address from, address to, uint256 tokenId) public virtual override {
        safeTransferFrom(from, to, tokenId, "");
    }
    
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public virtual override {
        transferFrom(from, to, tokenId);
        require(_checkOnERC721Received(from, to, tokenId, data), "ERC721: transfer to non ERC721Receiver implementer");
    }
    
    function _checkOnERC721Received(address from, address to, uint256 tokenId, bytes memory data) private returns (bool) {
        if (to.code.length == 0) {
            return true;
        }
        try IERC721Receiver(to).onERC721Received(msg.sender, from, tokenId, data) returns (bytes4 retval) {
            return retval == IERC721Receiver.onERC721Received.selector;
        } catch {
            return false;
        }
    }
}

// ========== قرارداد اصلی ==========
contract DotsAndBoxesNFT is ERC721, Ownable {
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
        
        (bool successOwner, ) = payable(ownerOf(tokenId)).call{value: ownerShare}("");
        require(successOwner, "Transfer to owner failed");
        
        (bool successPool, ) = payable(prizePool).call{value: fee}("");
        require(successPool, "Transfer to prize pool failed");
        
        nftDetails[tokenId].isRental = true;
        nftDetails[tokenId].renter = msg.sender;
        nftDetails[tokenId].rentalEnd = block.timestamp + duration;
        
        emit NFTRented(tokenId, msg.sender, duration);
    }

    function royaltyInfo(uint256 /* tokenId */, uint256 salePrice) external view returns (address receiver, uint256 royaltyAmount) {
        royaltyAmount = (salePrice * ROYALTY_PERCENT) / 10000;
        return (owner(), royaltyAmount);
    }

    function setPrizePool(address _newPool) external onlyOwner {
        prizePool = _newPool;
    }
}
