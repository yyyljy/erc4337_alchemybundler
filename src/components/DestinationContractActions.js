import React from "react";
import { Box, Flex, Text, Divider } from "@chakra-ui/react";
import GetOwnerBTN from "./atoms/GetOwnerBTN";
import GetMsgBTN from "./atoms/GetMsgBTN";

const DestinationContractActions = ({ sacAddress, targetAddr }) => {
  return (
    <Box
      width={"700px"}
      alignSelf={"flex-start"}
      borderWidth="5px"
      borderRadius="lg"
      padding={"5px"}
      borderColor={"blue.700"}
    >
      <Flex flexDirection={"column"} alignItems={"center"} gap={"5px"}>
        <Text>Destination Contract Call</Text>
        <Divider />
        <Flex gap={"10px"}>
          <GetOwnerBTN sacAddress={sacAddress} />
          <GetMsgBTN contractAddress={targetAddr} />
        </Flex>
      </Flex>
    </Box>
  );
};

export default DestinationContractActions;
