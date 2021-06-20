// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0 <=0.8.3;

contract Opinions {
    uint256 public opinionCount;

    struct Opinion {
        uint256 id;
        string opinion;
        address[] likes;
        address author;
    }

    constructor() {
        opinionCount = 0;
    }

    mapping(uint256 => Opinion) public opinions;

    function opiniate(string memory _opinion) public {
        require(bytes(_opinion).length > 0, "Invalid/empty opinon");
        opinionCount++;
        opinions[opinionCount] = Opinion(
            opinionCount,
            _opinion,
            new address[](0),
            msg.sender
        );
    }

    function likeOpinion(uint256 _opinionId) public {
        require(
            _opinionId >= 1 && _opinionId <= opinionCount,
            "Invalid opinion id"
        );
        Opinion storage curOpinion = opinions[_opinionId];
        curOpinion.likes.push(msg.sender);
    }

    function getLikedAddresses(uint256 _opinionId)
        public
        view
        returns (address[] memory)
    {
        require(
            _opinionId >= 1 && _opinionId <= opinionCount,
            "Invalid opinion id"
        );
        return opinions[_opinionId].likes;
    }
}
