import React, { useEffect, useState } from 'react';
import { Form, Alert, Button, Switch, message } from 'antd';
import { Store } from 'rc-field-form/lib/interface';
import { useAsyncFn } from 'react-use';
import styled from 'styled-components';
import { CloudAgentAPI } from '../../../../containers/App';
import {
  PresentationSchemaAttribute,
  ProofPresentationAttributeList,
} from './ProofPresentationAttributeList';
import {
  IndyCredPrecis,
  IndyPresSpec,
  V10PresentationExchange,
} from '@sudoplatform-labs/sudo-di-cloud-agent';
import {
  fetchCredentialsMatchingProof,
  sendProofPresentation,
} from '../../../../models/ACAPy/ProofPresentation';

const FooterContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin: 0 -24px -8px;
  padding: 18px 24px 0;
`;

const StyledButton = styled(Button)`
  min-width: 112px;
`;

const SubmitButton = styled(StyledButton)`
  margin-left: 12px;
`;

interface Props {
  proofRequest?: V10PresentationExchange;
  onSuccess: () => void;
  onCancel: () => void;
  cloudAgentAPIs: CloudAgentAPI;
}

export const PreparePresentationForm: React.FC<Props> = (props) => {
  const { onCancel, onSuccess, cloudAgentAPIs, proofRequest } = props;
  const [form] = Form.useForm();
  const [currentProofPresentation, setCurrentProofPresentation] = useState<
    PresentationSchemaAttribute[]
  >([]);

  const [submitState, handleSubmit] = useAsyncFn(
    async (values?: Store) => {
      if (!values || !proofRequest || !proofRequest.presentation_exchange_id) {
        return undefined;
      }

      const exchangeId = proofRequest.presentation_exchange_id;

      // Itterate over all attributes and build the final
      // proof presentation from selected attributes.
      const finalProofPresentation: IndyPresSpec = {
        requested_attributes: {},
        self_attested_attributes: {},
        trace: values.traceProtocol,
        requested_predicates: {},
      };
      // We currently only support requested_attributes in proof
      // presentations.
      for (const attribute of currentProofPresentation) {
        for (const option of attribute.options) {
          if (option.selected) {
            finalProofPresentation.requested_attributes[
              attribute.attributeName
            ] = {
              cred_id: option.donorCredentialId,
              revealed: attribute.revealValue,
            };
            break;
          }
        }
      }
      await sendProofPresentation(cloudAgentAPIs, {
        presentation: exchangeId,
        values: finalProofPresentation,
      });
      message.success('Proof presentation sent!');
      form.resetFields();
      setCurrentProofPresentation([]);
      onSuccess();
    },
    [cloudAgentAPIs, proofRequest, currentProofPresentation, form, onSuccess],
  );

  const changePresentationAttribute = (
    attribute: PresentationSchemaAttribute,
  ): void => {
    const index = currentProofPresentation.findIndex(
      (oldAttribute) => oldAttribute.attributeName === attribute.attributeName,
    );
    setCurrentProofPresentation(
      currentProofPresentation
        .slice(0, index)
        .concat(attribute)
        .concat(currentProofPresentation.slice(index + 1)),
    );
  };

  const buildProofPresentationOptions = (
    matchedCredentials: IndyCredPrecis[],
  ): void => {
    // Iterate over all the useable credentials building a list of
    // optional values for each attribute required in the proof.
    const presentationOptions: PresentationSchemaAttribute[] = [];

    for (const matchingCredential of matchedCredentials) {
      if (matchingCredential.pres_referents) {
        for (const attributeName of matchingCredential.pres_referents) {
          const possibleOption = {
            possibleValue: matchingCredential?.cred_info?.attrs
              ? matchingCredential.cred_info.attrs[attributeName]
              : 'Error',
            donorCredentialId:
              matchingCredential?.cred_info?.referent ?? 'Error',
            selected: false,
          };

          const attributeIndex = presentationOptions.findIndex(
            (value) => value.attributeName === attributeName,
          );
          if (attributeIndex !== -1) {
            presentationOptions[attributeIndex].options.push(possibleOption);
          } else {
            presentationOptions.push({
              attributeName: attributeName,
              options: [possibleOption],
              revealValue: true,
            });
          }
        }
      }
    }

    // Now iterate over the result sorting all the options so that they
    // always appear in a consistent order.
    for (const attribute of presentationOptions) {
      attribute.options.sort((a, b) =>
        ('' + a.possibleValue).localeCompare(b.possibleValue),
      );
      // Set the first alphabetic option to selected by default.
      attribute.options[0].selected = true;
    }

    // Sort the attributes themselves by name
    presentationOptions.sort((a, b) =>
      ('' + a.attributeName).localeCompare(b.attributeName),
    );
    setCurrentProofPresentation(presentationOptions);
  };

  const [, getPresentationInfo] = useAsyncFn(async () => {
    if (proofRequest?.presentation_exchange_id) {
      const matchedCredentials = await fetchCredentialsMatchingProof(
        cloudAgentAPIs,
        { presentation: proofRequest?.presentation_exchange_id },
      );
      buildProofPresentationOptions(matchedCredentials);
    }
  }, [proofRequest]);

  useEffect(() => {
    getPresentationInfo();
  }, [getPresentationInfo]);

  return (
    <Form
      id="PreparePresentationForm"
      form={form}
      onFinish={handleSubmit}
      layout="vertical">
      <Form.Item label="Select values for Proof Presentation Attributes:">
        <ProofPresentationAttributeList
          dataSource={currentProofPresentation}
          doChangeAttribute={
            changePresentationAttribute
          }></ProofPresentationAttributeList>
      </Form.Item>
      <Form.Item
        name="traceProtocol"
        label="Trace Protocol"
        valuePropName="checked">
        <Switch />
      </Form.Item>
      {submitState.error && (
        <Alert
          type="error"
          message="There was an error creating your Proof Presentation. Please try again."
          description={submitState.error.message}
        />
      )}
      <FooterContainer>
        <StyledButton
          id="PreparePresentationForm__cancel-btn"
          onClick={() => {
            submitState.error = undefined;
            form.resetFields();
            setCurrentProofPresentation([]);
            onCancel();
          }}
          type="default"
          shape="round">
          Cancel
        </StyledButton>
        <SubmitButton
          id="PreparePresentationForm__submit-btn"
          type="primary"
          htmlType="submit"
          loading={submitState.loading}
          shape="round">
          Send
        </SubmitButton>
      </FooterContainer>
    </Form>
  );
};
