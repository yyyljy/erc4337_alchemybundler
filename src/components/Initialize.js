import React from "react";
import { Flex, Box, Text, Divider, Tooltip } from "@chakra-ui/react";
import BTN from "./atoms/Btn";
import { TOOLTIP_INIT } from "../constraints";

const Initialize = ({
  getAccounts,
  fetchEntryPoint,
  setAccount,
  config,
  setEntryAddress,
}) => {
  return (
    <Box
      width={"700px"}
      alignSelf={"flex-start"}
      borderWidth="5px"
      borderRadius="lg"
      padding={"5px"}
      borderColor={"red.300"}
    >
      <Tooltip hasArrow placement="right-end" label={TOOLTIP_INIT} bg="red.600">
        <Flex flexDirection={"column"} alignItems={"center"} gap={"5px"}>
          <Text>Initialize</Text>
          <Divider />
          <Flex gap={"10px"}>
            <BTN
              onClickFunc={() => getAccounts(setAccount)}
              name={"지갑연결"}
            />
            <BTN
              onClickFunc={() => fetchEntryPoint(config, setEntryAddress)}
              name="EntryPoint CA 조회"
            />
          </Flex>
        </Flex>
      </Tooltip>
    </Box>
  );
};

export default Initialize;
