// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Hypo is ERC721, Ownable {
    uint256 private _tokenIdCounter;
    mapping(uint256 => string) private _tokenURIs;

    event HypothesisMinted(address indexed to, uint256 indexed tokenId, string tokenURI);

    constructor() ERC721("HypothesisNFT", "HYPO") {}

    /// @notice Mint a new Hypothesis NFT
    /// @param to The recipient address
    /// @param tokenURI The metadata URI (IPFS or HTTPS)
    /// @return tokenId The minted token's ID
    function mint(address to, string memory tokenURI) public onlyOwner returns (uint256 tokenId) {
        tokenId = ++_tokenIdCounter;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        emit HypothesisMinted(to, tokenId, tokenURI);
    }

    /// @notice Get the tokenURI for a given tokenId
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        return _tokenURIs[tokenId];
    }

    /// @dev Internal function to set the token URI for a token
    function _setTokenURI(uint256 tokenId, string memory _uri) internal {
        _tokenURIs[tokenId] = _uri;
    }
} 