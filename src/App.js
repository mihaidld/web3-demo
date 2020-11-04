import React, { useReducer, useEffect } from "react";
import {
  Heading,
  Badge,
  Box,
  Text,
  VStack,
  Center,
  UnorderedList,
  ListItem,
} from "@chakra-ui/core";
// https://docs.ethers.io/v5/
import { ethers } from "ethers";

const web3Reducer = (state, action) => {
  switch (action.type) {
    case "SET_isWeb3":
      return { ...state, isWeb3: action.isWeb3 };
    case "SET_isEnabled":
      return { ...state, isEnabled: action.isEnabled };
    case "SET_account":
      return { ...state, account: action.account };
    case "SET_provider":
      return { ...state, provider: action.provider };
    case "SET_balance":
      return { ...state, balance: action.balance };
    case "SET_network":
      return { ...state, network: action.network };
    /*     case "SET_signer":
      return { ...state, signer: action.signer }; */
    default:
      throw new Error(`Unhandled action ${action.type} in web3Reducer`);
  }
};

//Is web3 injected?
const initialWeb3State = {
  isWeb3: false,
  isEnabled: false,
  //isMetamask: false,
  account: ethers.constants.AddressZero,
  provider: null,
  balance: "0",
  network: null,
  //signer: null,
};

function App() {
  const [state, dispatch] = useReducer(web3Reducer, initialWeb3State);

  // check if web3 ethereum is injected
  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      dispatch({ type: "SET_isWeb3", isWeb3: true });
    } else {
      dispatch({ type: "SET_isWeb3", isWeb3: false });
    }
  }, []);

  // check if metamask is enabled
  useEffect(() => {
    const connect2Metamask = async () => {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        dispatch({ type: "SET_isEnabled", isEnabled: true });
        dispatch({ type: "SET_account", account: accounts[0] });
      } catch (e) {
        console.log("Error connect2Metamask: ", e);
        dispatch({ type: "SET_isEnabled", isEnabled: false });
      }
    };
    if (state.isWeb3) {
      connect2Metamask();
    }
  }, [state.isWeb3]);

  useEffect(() => {
    const connect2Provider = async () => {
      try {
        //https://docs.ethers.io/v5/api/providers/other/#Web3Provider
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        dispatch({ type: "SET_provider", provider });
        //https://docs.ethers.io/v5/api/providers/provider/#Provider-getNetwork
        const network = await provider.getNetwork();
        dispatch({ type: "SET_network", network });
        // https://docs.ethers.io/v5/api/providers/provider/#Provider-getBalance
        const _balance = await provider.getBalance(state.account);
        const balance = ethers.utils.formatEther(_balance);
        dispatch({ type: "SET_balance", balance });
        console.log(_balance);
        console.log(balance);
      } catch (e) {
        console.log("Error connect2Provider: ", e);
        //dispatch({ type: "SET_provider", provider: initialWeb3State.provider });
        dispatch({ type: "SET_network", network: initialWeb3State.network });
        dispatch({ type: "SET_balance", balance: initialWeb3State.balance });
      }
    };
    if (state.isEnabled && state.account !== ethers.constants.AddressZero) {
      connect2Provider();
    }
  }, [state.isEnabled, state.account]);

  return (
    <>
      <Center>
        <Heading mb={10}>Web3 demo with ethers.js</Heading>
      </Center>
      <VStack>
        <Text mb={3} alignItems="baseline">
          Web3 environment: {state.isWeb3 ? "injected" : "not found"}
        </Text>
        {state.isWeb3 && (
          <Box mb={3} alignItems="baseline">
            MetaMask status:{" "}
            {state.isEnabled ? (
              <Badge colorScheme="green">connected</Badge>
            ) : (
              <Badge colorScheme="red">disconnected</Badge>
            )}
          </Box>
        )}
        {state.network && (
          <UnorderedList>
            <ListItem mb={3}>
              Account: <Text as="b">{state.account}</Text>
            </ListItem>
            <ListItem mb={3}>
              Balance: <Text as="b">{state.balance}</Text>
            </ListItem>
            <ListItem mb={3}>
              Network name: <Text as="b">{state.network.name}</Text>
            </ListItem>
            <ListItem mb={3}>
              Network id: <Text as="b">{state.network.chainId}</Text>
            </ListItem>
          </UnorderedList>
        )}
      </VStack>
    </>
  );
}

export default App;
