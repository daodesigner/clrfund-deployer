import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSetUserRegistry } from "../../hooks/FundingFactory";
import { TransactionReceipt } from "../../hooks/FundingFactory/utils";
import { Web3Form } from "../Web3Form";
import { useLocation } from "react-router-dom";
/**
 * @class
 * @classdesc - component for setUserRegistry method
 **/
export const SetUserRegistryForm = (props: any) => {
  const [txLoading, setTxLoading] = useState<boolean>(false);
  const [txError, setTxError] = useState<boolean | string>(false);
  const [txLink, setTxLink] = useState<string>("");
  const [txReceipt, setTxReceipt] = useState<null | TransactionReceipt>(null);
  const { handleSubmit, errors, register } = useForm();
  const [contractAddress, setContractAddress] = useState<string>("0xad7f68331fefcfaa4afe754f3009e6bb53b36a36");

  let { search: params } = useLocation();
  useEffect(() => {
    const query = new URLSearchParams(params);
    const contractAddress = query.get("contract");
    setContractAddress(contractAddress ? contractAddress : "0xad7f68331fefcfaa4afe754f3009e6bb53b36a36");
  }, [params]);
  const { validator, handleSetUserRegistry, getReceipt, error } = useSetUserRegistry(contractAddress);

  const onSubmit = async (data) => {
    try {
      setTxLink("");
      setTxError("");

      setTxLoading(true);

      if (validator.checkArgs == null || handleSetUserRegistry.send == null || getReceipt.waitTwoBlocks == null)
        throw error ? error : handleSetUserRegistry.error;

      const ok = await validator.checkArgs(data._userRegistry);
      if (!ok) throw Error("Failed smartcontract requirements");

      const tx = await handleSetUserRegistry.send(data._userRegistry);
      setTxLink("https://blockscout.com/xdai/mainnet/tx/" + tx.hash);

      const { receipt, error: getReceiptError } = await getReceipt.waitTwoBlocks(tx.hash);
      if (getReceiptError) throw getReceiptError;
      setTxReceipt(receipt);
      setTxLoading(false);
    } catch (e) {
      console.log(e);
      setTxError(e && e.message ? e.message : "unexpected error");
      setTxLoading(false);
    }
  };

  return (
    <Web3Form.Form onSubmit={handleSubmit(onSubmit)}>
      <Web3Form.Title>Set User Registry</Web3Form.Title>
      <Web3Form.Heading detail="These changes will take effect on the next voting round. Voting rounds that have already started or been deployed will not be affected.">
        This function is used to set the User Registry
      </Web3Form.Heading>
      <Web3Form.Detail>*THIS TOOL IS IN BETA USE AT YOUR OWN RISK</Web3Form.Detail>

      <Web3Form.Input
        name="_userRegistry"
        label="_userRegistry"
        placeholder="address"
        ref={register(Web3Form.registerAddress)}
        errors={errors}
      />
      <Web3Form.Submit loading={txLoading}>Set User Registry</Web3Form.Submit>
      <Web3Form.Error error={txError} />
      <Web3Form.ExplorerLink url={txLink} />
      <Web3Form.Receipt receipt={txReceipt} />
    </Web3Form.Form>
  );
};

export default SetUserRegistryForm;
