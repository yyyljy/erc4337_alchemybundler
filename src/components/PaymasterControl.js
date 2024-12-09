import React from "react";
import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  Switch,
  Divider,
  Tooltip,
} from "@chakra-ui/react";
import BTN from "./atoms/Btn";
import { TOOLTIP_PAYMASTER } from "../constraints";

const PaymasterControl = ({
  usePaymaster,
  setUsePaymaster,
  setUserOp,
  generatePaymasterAndData,
  config,
  mintPaymasterErc20,
  getBalanceOfPaymasterErc20,
  balOfERC20,
  depositPaymaster,
  addStake,
  userOp,
  setPaymasterAndData,
}) => {
  return (
    <Tooltip
      hasArrow
      placement="right-end"
      label={TOOLTIP_PAYMASTER}
      bg="blue.600"
    >
      <Box
        width={"700px"}
        alignSelf={"flex-start"}
        borderWidth="5px"
        borderRadius="lg"
        padding={"5px"}
        borderColor={"blue.300"}
      >
        <Flex flexDirection={"column"} gap={"5px"}>
          <Flex gap={"10px"}>
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="email-alerts" mb="0">
                Use Paymaster?
              </FormLabel>
              <Switch
                mr={"10px"}
                id="email-alerts"
                onChange={(e) => {
                  setUsePaymaster(e.target.checked);
                  if (e.target.checked) {
                    setUserOp({ ...userOp, signature: "" });
                    generatePaymasterAndData("10");
                  } else {
                    setPaymasterAndData("");
                    setUserOp({
                      ...userOp,
                      paymasterAndData: "0x",
                      signature: "",
                    });
                  }
                }}
              />
            </FormControl>
            {`${config?.PAYMASTER_ADDRESS}`}
          </Flex>
          <Divider />
          <Flex gap={"10px"}>
            <BTN
              isDisabled={!usePaymaster}
              onClickFunc={() => {
                mintPaymasterErc20(1_000_000_000_000_000);
              }}
              name="Mint ERC20"
            />
            <BTN
              isDisabled={!usePaymaster}
              onClickFunc={() => {
                getBalanceOfPaymasterErc20();
              }}
              name="BalanceOf"
            />
            <label>{`balance : ${(Number(balOfERC20) / 10 ** 18).toFixed(
              6
            )}`}</label>
          </Flex>
          <Flex gap={"10px"}>
            <BTN
              isDisabled={!usePaymaster}
              onClickFunc={() => {
                depositPaymaster();
              }}
              name="Deposit Paymaster"
            />
            <BTN
              isDisabled={!usePaymaster}
              onClickFunc={() => {
                addStake();
              }}
              name="Add Stake"
            />
          </Flex>
        </Flex>
      </Box>
    </Tooltip>
  );
};

export default PaymasterControl;
