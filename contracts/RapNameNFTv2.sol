// SPDX-License-Identifier: MIT
// @authors Akiva Bamberger

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract RapNameNFTv2 is ERC721Enumerable, Ownable, ReentrancyGuard {
    using SafeMath for uint256;
    using Counters for Counters.Counter;
    uint256 public constant MAX_SUPPLY = 256;
    uint256 public constant MAX_PURCHASE = 10;
    uint256 public constant PRICE = 0.0;

    Counters.Counter private _tokenIdCounter;

    address[] private v1Owners = [
        0x984C74D1eb9942736cA899fC33a3476bDa9BDBce,
        0x984C74D1eb9942736cA899fC33a3476bDa9BDBce,
        0x236BC95dd51B2C658701bf195699C8f30142CD42,
        0xB191271baaC4f10Bec72FB89e62528B6dE68508d
    ];
    // private mapping from tokenId to rapName
    mapping (uint256 => string) private rapNames;

    function tokenURI(uint256 tokenId) override public view returns (string memory) {
        string[7] memory parts;
        string memory fillColor = "#000";
        string memory strokeColor = (tokenId <= v1Owners.length) ? "#FFD700" : "#ADD8E6";
        string memory rapName = rapNames[tokenId];
        parts[0] = "<svg xmlns=\"http://www.w3.org/2000/svg\" preserveAspectRatio=\"xMinYMin meet\" viewBox=\"0 0 350 200\">"
         "<style>.base {fill: white; font-family: monospace; font-size: 20px position: absolute;}</style>"
        "<rect width=\"100%\" height=\"100%\" fill=\"";
        parts[1] = fillColor;
        parts[2] = "\" style=\"stroke: ";
        parts[3] = strokeColor;
        parts[4] = "; stroke-width: 12;\" />"
        "<text class=\"base\" y=\"95px\" x=\"50px\">";
        parts[5] = rapName;
        parts[6] = "</text></svg>";

        string memory output = string(abi.encodePacked(parts[0], parts[1], parts[2], parts[3], parts[4], parts[5], parts[6]));
        string memory json = Base64.encode(bytes(string(
                abi.encodePacked(
                    '{"name":"',
                    rapName,
                    '", "description":"',
                    'Every web3 rapper needs a web3 name.',
                    ' Rap Name NFT generates a random rap name for you on-chain.',
                    '", "image": "',
                    'data:image/svg+xml;base64,',
                    Base64.encode(bytes(output)),
                    '"}'
                )
            )
            )
        );
        output = string(abi.encodePacked('data:application/json;base64,', json));

        return output;
    }

    function ownerClaim() public onlyOwner nonReentrant {
        require(_tokenIdCounter.current() == 1, "Only at start!");
        _safeMint(v1Owners[0], _tokenIdCounter.current());
        _tokenIdCounter.increment();
        _safeMint(v1Owners[1], _tokenIdCounter.current());
        _tokenIdCounter.increment();
        _safeMint(v1Owners[2], _tokenIdCounter.current());
        _tokenIdCounter.increment();
        _safeMint(v1Owners[3], _tokenIdCounter.current());
        _tokenIdCounter.increment();
    }

    function mint(uint256 amount) public nonReentrant payable {
        require(_tokenIdCounter.current() > v1Owners.length, "Owners claim first");
        uint256 totalSupply = _tokenIdCounter.current() - 1;
        require(totalSupply < MAX_SUPPLY, "Sale has ended");
        require(amount > 0, "Cannot buy 0");
        require(amount <= MAX_PURCHASE, "You may not buy that many NFTs at once");
        require(totalSupply.add(amount) <= MAX_SUPPLY, "Exceeds max supply");
        for (uint i = 0; i < amount; i++) {
            uint256 tokenId = _tokenIdCounter.current();
            _tokenIdCounter.increment();
            _safeMint(msg.sender, tokenId);
        }
    }

    function setRapNames(
        string [] memory names
    ) public onlyOwner nonReentrant {
        require(_tokenIdCounter.current() == 1, "Only at start!");
        require(names.length <= MAX_SUPPLY, "Can't mint more than MAX_SUPPLY");
        uint256 i = 1;
        for (i = 1; i <= names.length; ++i) {
            require(bytes(rapNames[i]).length == 0, "Already set!");
            rapNames[i] = names[i - 1];
        }
    }

    function getCurrentTokenId() public view returns (uint256) {
        return _tokenIdCounter.current();
    }

    function walletOfOwner(address _owner) public view returns(uint256[] memory) {
        uint256 tokenCount = balanceOf(_owner);

        uint256[] memory tokensId = new uint256[](tokenCount);
        for(uint256 i; i < tokenCount; i++){
            tokensId[i] = tokenOfOwnerByIndex(_owner, i);
        }
        return tokensId;
    }

    constructor() ERC721("RapNameNFT", "RNFT") Ownable() {
        _tokenIdCounter.increment();
    }
}

/// [MIT License]
/// @title Base64
/// @notice Provides a function for encoding some bytes in base64
/// @author Brecht Devos <brecht@loopring.org>
library Base64 {
    bytes internal constant TABLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    /// @notice Encodes some bytes to the base64 representation
    function encode(bytes memory data) internal pure returns (string memory) {
        uint256 len = data.length;
        if (len == 0) return "";

        // multiply by 4/3 rounded up
        uint256 encodedLen = 4 * ((len + 2) / 3);

        // Add some extra buffer at the end
        bytes memory result = new bytes(encodedLen + 32);

        bytes memory table = TABLE;

        assembly {
            let tablePtr := add(table, 1)
            let resultPtr := add(result, 32)

            for {
                let i := 0
            } lt(i, len) {

            } {
                i := add(i, 3)
                let input := and(mload(add(data, i)), 0xffffff)

                let out := mload(add(tablePtr, and(shr(18, input), 0x3F)))
                out := shl(8, out)
                out := add(out, and(mload(add(tablePtr, and(shr(12, input), 0x3F))), 0xFF))
                out := shl(8, out)
                out := add(out, and(mload(add(tablePtr, and(shr(6, input), 0x3F))), 0xFF))
                out := shl(8, out)
                out := add(out, and(mload(add(tablePtr, and(input, 0x3F))), 0xFF))
                out := shl(224, out)

                mstore(resultPtr, out)

                resultPtr := add(resultPtr, 4)
            }

            switch mod(len, 3)
            case 1 {
                mstore(sub(resultPtr, 2), shl(240, 0x3d3d))
            }
            case 2 {
                mstore(sub(resultPtr, 1), shl(248, 0x3d))
            }

            mstore(result, encodedLen)
        }

        return string(result);
    }
}