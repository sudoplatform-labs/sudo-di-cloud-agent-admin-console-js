import React, { useState } from 'react';
import { Form, Input, Alert, Button, Switch, message } from 'antd';
import { Store } from 'rc-field-form/lib/interface';
import { useAsync, useAsyncFn } from 'react-use';
import styled from 'styled-components';
import { CloudAgentAPI } from '../../../../containers/App';
import { fetchSchemaDefinitionDetails } from '../../../../models/ACAPy/SchemaDefinitions';
import {
  RequestProofAttributeList,
  RequestProofSchemaAttribute,
} from './RequestProofAttributeList';
import { sendProofRequest } from '../../../../models/ACAPy/ProofPresentation';
import { DIDCommSelectionItem } from '../../../../components/Form/DIDCommSelectionItem';
import { IndySchemaIdEntryItem } from '../../../../components/Form/IndySchemaIdEntryItem';
import {
  IndyProofReqAttrSpec,
  Schema,
  V10PresentationSendRequestRequest,
} from '@sudoplatform-labs/sudo-di-cloud-agent';

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
  onSuccess: () => void;
  onCancel: () => void;
  cloudAgentAPIs: CloudAgentAPI;
}

export const RequestProofForm: React.FC<Props> = (props) => {
  const { onCancel, onSuccess, cloudAgentAPIs } = props;
  const [form] = Form.useForm();
  // Track the current Schema Definition Id so
  // that we can get the correct schema when it changes. Also use
  // state to track all the currently selected attributes for the
  // proof.
  const [currentSchemaId, setCurrentSchemaId] = useState('');
  const [currentProofAttributes, setCurrentProofAttributes] = useState<
    RequestProofSchemaAttribute[]
  >([]);

  const [submitState, handleSubmit] = useAsyncFn(
    async (values?: Store) => {
      // On initial entry we don't want to do anything
      if (!values) {
        return undefined;
      }

      const checkedAttributes: RequestProofSchemaAttribute[] = currentProofAttributes.filter(
        (attribute) => attribute.included,
      );

      const requestAttributes: { [key: string]: IndyProofReqAttrSpec } = {};
      for (const attribute of checkedAttributes) {
        requestAttributes[attribute.name] = {
          name: attribute.name,
          // At the moment we are hard coding the restriction type to
          // the issuer DID.  This is an area where a LOT of UX input
          // is needed due to the flexibility possible in the restrictions
          restrictions: [{ issuer_did: attribute.issuerDID }],
        };
      }

      const proofRequest: V10PresentationSendRequestRequest = {
        connection_id: values.connectionId,
        comment: values.message,
        trace: values.traceProtocol,
        proof_request: {
          requested_attributes: requestAttributes,
          // Currently we aren't supporting predicates (i.e. Zero
          // Knowledge Proofs).
          // This is an area for future enhancements and UX input.
          requested_predicates: {},
        },
      };

      await sendProofRequest(cloudAgentAPIs, proofRequest);
      message.success('Proof request sent!');
      form.resetFields();
      setCurrentSchemaId('');
      setCurrentProofAttributes([]);
      onSuccess();
    },
    [cloudAgentAPIs, currentProofAttributes, currentSchemaId, form, onSuccess],
  );

  const changeProofAttribute = (
    attribute: RequestProofSchemaAttribute,
  ): void => {
    const index = currentProofAttributes.indexOf(attribute);
    setCurrentProofAttributes(
      currentProofAttributes
        .slice(0, index)
        .concat(attribute)
        .concat(currentProofAttributes.slice(index + 1)),
    );
  };

  const buildCurrentProofAttributes = (schema: Schema): void => {
    // Pull out the DID from the schemaId and default that
    // as the issuer restriction for all attributes being requested
    const matches = schema.id?.match(
      /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{21,22}/,
    );
    let defaultDID = 'Unknown';
    if (matches) {
      defaultDID = matches[0];
    }
    let proofAttributes: RequestProofSchemaAttribute[] = [];
    if (schema.attrNames) {
      proofAttributes = schema.attrNames?.map((attribute) => {
        return { name: attribute, issuerDID: defaultDID, included: true };
      });
    }
    setCurrentProofAttributes(proofAttributes);
  };

  useAsync(async () => {
    // Don't attempt to fetch an empty schemaId
    if (currentSchemaId === '') {
      return;
    }
    const schema = await fetchSchemaDefinitionDetails(
      cloudAgentAPIs,
      currentSchemaId,
    );
    buildCurrentProofAttributes(schema);
  }, [currentSchemaId]);

  return (
    <Form
      id="RequestProofForm"
      form={form}
      onFinish={handleSubmit}
      layout="vertical">
      <DIDCommSelectionItem
        name="connectionId"
        cloudAgentAPIs={cloudAgentAPIs}
      />
      <Form.Item
        name="message"
        label="Comment"
        rules={[
          {
            required: false,
          },
        ]}>
        <Input
          type="text"
          placeholder="e.g. Type of proof required or reason for request"
        />
      </Form.Item>
      <IndySchemaIdEntryItem name="schemaId" setSchemaId={setCurrentSchemaId} />
      {currentSchemaId !== '' && (
        <Form.Item label="Select desired Attributes for Proof:">
          <RequestProofAttributeList
            dataSource={currentProofAttributes}
            doCheckChange={changeProofAttribute}></RequestProofAttributeList>
        </Form.Item>
      )}
      <Form.Item
        name="traceProtocol"
        label="Trace Protocol"
        valuePropName="checked">
        <Switch />
      </Form.Item>

      {submitState.error && (
        <Alert
          type="error"
          message="There was an error creating your Proof Request. Please try again."
          description={submitState.error.message}
        />
      )}
      <FooterContainer>
        <StyledButton
          id="RequestProofForm__cancel-btn"
          onClick={() => {
            submitState.error = undefined;
            form.resetFields();
            setCurrentSchemaId('');
            setCurrentProofAttributes([]);
            onCancel();
          }}
          type="default"
          shape="round">
          Cancel
        </StyledButton>
        <SubmitButton
          id="RequestProofForm__submit-btn"
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
