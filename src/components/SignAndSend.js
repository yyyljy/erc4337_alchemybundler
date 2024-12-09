import React from "react";
import { Box, Flex, Text, Divider, Tooltip } from "@chakra-ui/react";
import BTN from "./atoms/Btn";
import { TOOLTIP_SIGN_SEND } from "../constraints";

const SignAndSend = ({ userOp, fetchEstimateGas, gas, signUserOp, sendOp }) => {
  return (
    <Tooltip
      hasArrow
      placement="right-end"
      label={TOOLTIP_SIGN_SEND}
      bg="blue.700"
    >
      <Box
        width={"700px"}
        alignSelf={"flex-start"}
        borderWidth="5px"
        borderRadius="lg"
        padding={"5px"}
        borderColor={"blue.700"}
      >
        <Flex flexDirection={"column"} alignItems={"flex-start"} gap={"5px"}>
          <Text>Estimate Fee & Sign & Send</Text>
          <Divider />

          <Flex gap={"10px"}>
            <BTN
              onClickFunc={() => {
                fetchEstimateGas(userOp);
              }}
              name="Gas Fee Estimate"
            />
            <label>{`${
              !gas
                ? ""
                : JSON.stringify(gas).length < 60
                ? JSON.stringify(gas)
                : JSON.stringify(gas).slice(0, 60) + "..."
            }`}</label>
          </Flex>

          <BTN
            onClickFunc={() => {
              signUserOp(userOp);
            }}
            name="UserOp 서명"
          />
          <BTN
            onClickFunc={() => {
              sendOp(userOp);
            }}
            name="UserOp 전송"
          />
        </Flex>
      </Box>
    </Tooltip>
  );
};

export default SignAndSend;
