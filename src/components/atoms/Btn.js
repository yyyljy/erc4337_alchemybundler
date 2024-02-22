import { Button } from "@chakra-ui/react";
import { React } from "react";

export default function BTN({ onClickFunc, name }) {
  return (
    <div>
      <Button width={"200px"} onClick={onClickFunc}>{name}</Button>
    </div>
  );
}