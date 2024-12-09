import React from "react";
import { Flex, Box, Text, Divider, Tooltip } from "@chakra-ui/react";
import BTN from "./atoms/Btn";
import { TOOLTIP_DEPLOY_SAC } from "../constraints";

const DeploySAC = ({ getBalance, depositTo, deploySAC, balance }) => {
  return (
    <Box
      width={"700px"}
      alignSelf={"flex-start"}
      borderWidth="5px"
      borderRadius="lg"
      padding={"5px"}
      borderColor={"orange.300"}
    >
      <Tooltip
        hasArrow
        placement="right-end"
        label={TOOLTIP_DEPLOY_SAC}
        bg="orange.600"
      >
        <Flex flexDirection={"column"} alignItems={"center"} gap={"5px"}>
          <Text>
            Deploy Simple Contract Account // balance:[
            {(balance / 10 ** 18).toFixed(4)}]
          </Text>
          <Divider />
          <Flex gap={"10px"}>
            <BTN onClickFunc={getBalance} name="getBalance" />
            <BTN onClickFunc={depositTo} name="Deposit 0.3 ETH" />
            <BTN onClickFunc={deploySAC} name="SAC 배포" />
          </Flex>
        </Flex>
      </Tooltip>
    </Box>
  );
};

export default DeploySAC;
