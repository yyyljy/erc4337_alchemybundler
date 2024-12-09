import React from "react";
import {
  Box,
  Text,
  Divider,
  Tooltip,
  TableContainer,
  Table,
  Tbody,
  Tr,
  Td,
} from "@chakra-ui/react";
import { TOOLTIP_INFO_TABLE } from "../constraints";

const InfoTable = ({ chainId, account, sacAddress, entryAddress }) => {
  return (
    <Box
      width={"700px"}
      alignSelf={"flex-start"}
      borderWidth="5px"
      borderRadius="lg"
      padding={"5px"}
      borderColor={"yellow.300"}
    >
      <Text>Info Table</Text>
      <Divider />
      <Tooltip
        hasArrow
        placement="right-end"
        label={TOOLTIP_INFO_TABLE}
        bg="yellow.600"
      >
        <TableContainer width={"700px"}>
          <Table variant="simple">
            <Tbody>
              <Tr>
                <Td>ChainId</Td>
                <Td>{chainId}</Td>
              </Tr>
              <Tr>
                <Td>연결된 지갑 주소</Td>
                <Td>{account}</Td>
              </Tr>
              <Tr>
                <Td>Simple Account Contract 주소</Td>
                <Td>{sacAddress}</Td>
              </Tr>
              <Tr>
                <Td>EntryPoint Address</Td>
                <Td>{entryAddress}</Td>
              </Tr>
            </Tbody>
          </Table>
        </TableContainer>
      </Tooltip>
    </Box>
  );
};

export default InfoTable;
