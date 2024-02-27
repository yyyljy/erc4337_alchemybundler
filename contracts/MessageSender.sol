// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MessageSender {
    string message;
    address public msgSender;
    event MsgSend(address indexed _addr, string _msg);

    function setMessage(string memory _msg) public {
        message = _msg;
        msgSender = msg.sender;
        emit MsgSend(msg.sender, _msg);
    }

    function getMessage() public view returns(string memory) {
        return message;
    }

    function getMsgSender() public view returns(address) {
        return msgSender;
    }
}