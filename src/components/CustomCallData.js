import React from "react";
import {
  Box,
  Flex,
  Text,
  Divider,
  Tooltip,
  InputGroup,
  InputLeftAddon,
  Input,
} from "@chakra-ui/react";
import BTN from "./atoms/Btn";
import { TOOLTIP_CUSTOM_CALL } from "../constraints";

const CustomCallData = ({
  setFuncAddr,
  setFuncName,
  setFuncInput,
  funcName,
  funcInput,
  setInputs,
  signCustomCallData,
  callData,
  setCallData,
  setFuncABI,
}) => {
  return (
    <Tooltip
      hasArrow
      placement="right-end"
      label={TOOLTIP_CUSTOM_CALL}
      bg="purple.600"
    >
      <Box
        width={"700px"}
        alignSelf={"flex-start"}
        borderWidth="5px"
        borderRadius="lg"
        padding={"5px"}
        borderColor={"purple.300"}
      >
        <Flex flexDirection={"column"} alignItems={"center"} gap={"5px"}>
          <Text>커스텀 콜 데이터</Text>
          <Divider />
          <Flex gap={"10px"} flexDirection={"column"} alignSelf={"flex-start"}>
            <InputGroup>
              <InputLeftAddon width={"180px"}>Destination CA</InputLeftAddon>
              <Input
                width={"500px"}
                name="funcAddr"
                onChange={(e) => {
                  setFuncAddr(e.target.value);
                }}
              ></Input>
            </InputGroup>

            <InputGroup>
              <InputLeftAddon width={"180px"}>Function Name</InputLeftAddon>
              <Input
                name="Inputs"
                onChange={(e) => {
                  setFuncName(e.target.value);
                  setFuncABI(`function ${e.target.value}(${funcInput})`);
                }}
                placeholder="ex) setMessage"
              ></Input>
            </InputGroup>

            <InputGroup>
              <InputLeftAddon width={"180px"}>
                Input types & names
              </InputLeftAddon>
              <Input
                name="Inputs"
                onChange={(e) => {
                  setFuncInput(e.target.value);
                  setFuncABI(`function ${funcName}(${e.target.value})`);
                }}
                placeholder="ex) string _msg"
              ></Input>
            </InputGroup>

            <label>{`function ${funcName}(${funcInput})`}</label>

            <InputGroup>
              <InputLeftAddon width={"180px"}>Inputs</InputLeftAddon>
              <Input
                name="Inputs"
                onChange={(e) => {
                  setInputs(e.target.value);
                }}
              ></Input>
            </InputGroup>

            <BTN
              onClickFunc={() => {
                signCustomCallData();
              }}
              name="Sign & Send"
            />

            <label>Custom callData</label>

            <Input
              value={callData}
              name="callData"
              onChange={(e) => {
                setCallData(e.target.value);
              }}
            ></Input>
          </Flex>
        </Flex>
      </Box>
    </Tooltip>
  );
};

export default CustomCallData;
