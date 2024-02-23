import { Button } from "@chakra-ui/react";
import { React } from "react";

export default function BTN({ onClickFunc, name, isDisabled }) {
  return (
    <div>
      <Button isDisabled={isDisabled} width={"200px"} onClick={onClickFunc}>{name}</Button>
    </div>
  );
}