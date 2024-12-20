import { ethers } from "ethers";

export const initUserOp = {
  sender: ethers.ZeroAddress,
  nonce: "0x",
  initCode: "0x",
  callData: "0x",
  callGasLimit: "0x7A1200",
  verificationGasLimit: "0x927C0",
  preVerificationGas: "0x15F90",
  maxFeePerGas: "0x656703D00",
  maxPriorityFeePerGas: "0x13AB6680",
  signature:
    "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
  paymasterAndData: "0x",
};

export const TOOLTIP_INIT = (
  <label>
    1. "지갑연결" 버튼
    <br />
    - Metamask 연결
    <br />
    <br />
    2. "EntryPoint CA 조회" 버튼 <br />
    - Bundler가 바라보는 EntryPoint 주소 조회
    <br />
  </label>
);

export const TOOLTIP_DEPLOY_SAC = (
  <label>
    SIMPLE CONTRACT ACCOUNT 배포
    <br />
    - 절차 -<br />
    1. "Deposit 0.01 ETH" 버튼 클릭
    <br />
    - EntryPoint에 0.01 ETH 예치
    <br />
    - 배포에 필요한 Gas Fee를 미리 예치하는 과정
    <br />
    <br />
    2. "getBalance" 버튼 클릭
    <br />
    - EntryPoint에 AA주소로 예치된 잔고 조회
    <br />
    <br />
    3. "SAC 배포" 버튼 클릭
    <br />
    - initCode를 담은 userOp를 생성&서명&전송
    <br />
  </label>
);

export const TOOLTIP_INFO_TABLE = (
  <label>
    "ChainId"
    <br />
    - 현재 지갑에서 선택된 Network ID
    <br />
    <br />
    "연결된 지갑주소"
    <br />
    - 연결된 지갑의 EOA 주소
    <br />
    <br />
    "매칭되는 SAC 주소"
    <br />
    - 연결된 지갑과 매칭되는 AA 주소
    <br />
    <br />
    "EntryPoint Address"
    <br />
    - EntryPoint 주소
    <br />
  </label>
);

export const TOOLTIP_DEST_CONTRACT_CALL = (
  <label>
    "Destination CA"
    <br />
    - AA가 호출할 Contract Address
    <br />
    <br />
    "Function Name"
    <br />
    - AA가 호출할 Contract의 함수 명<br />
    <br />
    "Inputs"
    <br />
    - 호출할 함수의 입력 값<br />
    <br />
    "callData 생성"
    <br />
    - userOp의 callData 값 생성
    <br />
    <br />
    "SAC Nonce 조회"
    <br />
    - EntryPoint를 통해 AA Nonce값 조회
    <br />
    <br />
  </label>
);

export const TOOLTIP_PAYMASTER = (
  <label>
    Gas Fee를 대납할 Paymaster 지정
    <br />
    - 사전에 배포한 paymaster 호출
    <br />
    <br />
    "Mint ERC20"
    <br />
    - Gas Fee 대납할 ERC-20 Token Mint
    <br />
    <br />
    "BalanceOf"
    <br />
    - ERC-20 Token Balance 조회
    <br />
    <br />
    "Deposit Paymaster"
    <br />
    - Paymaster에 0.1 ETH 예치
    <br />
    <br />
    "Add Stake"
    <br />
    - Gas Fee 지불 실패를 미연에 방지하고자
    <br />
    EntryPoint에 일정 금액 이상 Staking한
    <br />
    Paymaster만 대납 가능
  </label>
);

export const TOOLTIP_SIGN_SEND = (
  <label>
    "Gas Fee Estimate"
    <br />- 예상 가스비 조회
    <br />
    <br />
    "UserOp 서명"
    <br />- userOperation 사인
    <br />
    <br />
    "UserOp 전송"
    <br />- userOperation 전송
  </label>
);

export const TOOLTIP_CUSTOM_CALL = (
  <label>
    "Destination CA"
    <br />
    - AA가 호출할 Contract Address
    <br />
    <br />
    "Function Name"
    <br />
    - AA가 호출할 Contract의 함수 명<br />
    <br />
    "Input types & names"
    <br />
    - 호출할 함수의 입력 타입 및 변수 명<br />
    <br />
    "Inputs"
    <br />
    - 호출할 함수의 입력 값<br />
    <br />
    "Sign & Send"
    <br />
    - userOperation 사인&전송
    <br />
    <br />
  </label>
);
