import React from "react";
import {
  Box,
  Text,
  Divider,
  Tooltip,
  Flex,
  InputGroup,
  InputLeftAddon,
  Input,
} from "@chakra-ui/react";
import BTN from "./atoms/Btn";
import { TOOLTIP_DEST_CONTRACT_CALL } from "../constraints";

const DestinationContractCall = ({
  targetAddr,
  setTargetAddr,
  method,
  setMethod,
  Inputs,
  setInputs,
  createCallData,
  callData,
  getNonce,
  nonce,
}) => {
  return (
    <Tooltip
      hasArrow
      placement="right-end"
      label={TOOLTIP_DEST_CONTRACT_CALL}
      bg="green.600"
    >
      <Box
        width={"700px"}
        alignSelf={"flex-start"}
        borderWidth="5px"
        borderRadius="lg"
        padding={"5px"}
        borderColor={"green.300"}
      >
        <Text>Destination Contract Call</Text>
        <Divider />
        <Flex flexDirection={"column"} alignItems={"flex-start"} gap={"5px"}>
          <InputGroup>
            <InputLeftAddon width={"200px"}>Destination CA</InputLeftAddon>
            <Input
              name="targetContractAddress"
              width={"500px"}
              onChange={(e) => {
                setTargetAddr(e.target.value);
              }}
              value={targetAddr}
              disabled={true}
            ></Input>
          </InputGroup>

          <InputGroup>
            <InputLeftAddon width={"200px"}>Function Name</InputLeftAddon>
            <Input
              name="method"
              value={method}
              width={"500px"}
              onChange={(e) => {
                setMethod(e.target.value);
              }}
              disabled={true}
            ></Input>
          </InputGroup>

          <InputGroup>
            <InputLeftAddon width={"200px"}>Inputs</InputLeftAddon>
            <Input
              name="Inputs"
              width={"500px"}
              onChange={(e) => {
                setInputs(e.target.value);
              }}
              placeholder="전송할 메세지를 입력하세요"
            ></Input>
          </InputGroup>

          <Box>
            <Flex gap={"10px"}>
              <BTN onClickFunc={createCallData} name="callData 생성" />
              <Text
                width={"300px"}
              >{`callData Length: ${callData?.length}`}</Text>
            </Flex>
          </Box>

          <Box>
            <Flex gap={"10px"}>
              <BTN onClickFunc={getNonce} name="SAC Nonce 조회" />
              <Text width={"300px"}>{`nonce : ${nonce}`}</Text>
            </Flex>
          </Box>
        </Flex>
      </Box>
    </Tooltip>
  );
};

export default DestinationContractCall;
