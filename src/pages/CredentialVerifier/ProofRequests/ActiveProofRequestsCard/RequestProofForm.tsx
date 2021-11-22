import React, { useEffect, useState } from 'react';
import { Form, Input, Alert, Button, Switch, message } from 'antd';
import { Store } from 'rc-field-form/lib/interface';
import { useAsyncFn } from 'react-use';
import styled from 'styled-components';
import { CloudAgentAPI } from '../../../../containers/App';
import { fetchSchemaDefinitionDetails } from '../../../../models/ACAPy/SchemaDefinitions';
import {
  RequestProofAttributeList,
  RequestProofSchemaAttribute,
} from './RequestProofAttributeList';
import { sendProofRequest } from '../../../../models/ACAPy/ProofPresentation';
import { DIDCommSelectionItem } from '../../../../components/Form/DIDCommSelectionItem';
import {
  CredentialDefinition,
  IndyProofReqAttrSpec,
  Schema,
  V10PresentationSendRequestRequest,
} from '@sudoplatform-labs/sudo-di-cloud-agent';
import { IndyCredentialDefinitionIdEntryItem } from '../../../../components/Form/IndyCredentialDefinitionIdEntryItem';
import { fetchCredentialDefinitionDetails } from '../../../../models/ACAPy/CredentialDefinitions';
import _ from 'lodash';

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
  // Track the current Credential Definition Id so
  // that we can get the correct schema when it changes. Also use
  // state to track all the currently selected attributes for the
  // proof.
  const [currentCredentialDefinitionId, setCurrentCredentialDefinitionId] =
    useState('');
  const [currentProofAttributes, setCurrentProofAttributes] = useState<
    RequestProofSchemaAttribute[]
  >([]);

  const [submitState, handleSubmit] = useAsyncFn(
    async (values?: Store) => {
      // On initial entry we don't want to do anything
      if (!values) {
        return undefined;
      }

      const checkedAttributes: RequestProofSchemaAttribute[] =
        currentProofAttributes.filter((attribute) => attribute.included);

      const requestAttributes: { [key: string]: IndyProofReqAttrSpec } = {};
      for (const attribute of checkedAttributes) {
        requestAttributes[attribute.name] = {
          name: attribute.name,
          // At the moment we are hard coding the restriction type to
          // the issuer DID.  This is an area where a LOT of UX input
          // is needed due to the flexibility possible in the restrictions
          restrictions: [{ cred_def_id: attribute.credentialDefId }],
        };
        if (attribute.nonRevokedWindow) {
          requestAttributes[attribute.name].non_revoked = {
            from: attribute.nonRevokedWindow.validTimeStart,
            to: attribute.nonRevokedWindow.validTimeEnd,
          };
        }
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
      setCurrentCredentialDefinitionId('');
      setCurrentProofAttributes([]);
      onSuccess();
    },
    [
      cloudAgentAPIs,
      currentProofAttributes,
      currentCredentialDefinitionId,
      form,
      onSuccess,
    ],
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

  const buildDefaultProofAttributes = (
    schema: Schema,
    credentialDefinition: CredentialDefinition,
  ): void => {
    let proofAttributes: RequestProofSchemaAttribute[] = [];
    if (schema.attrNames) {
      proofAttributes = schema.attrNames?.map((attribute) => {
        const attributeResult: RequestProofSchemaAttribute = {
          name: attribute,
          credentialDefId: credentialDefinition.id ?? '',
          included: true,
        };
        // Don't set a time window if its a non-revocable credential
        // definition.
        if (credentialDefinition.value?.revocation !== undefined) {
          attributeResult.nonRevokedWindow = {
            // Revokation times only resolve to seconds not
            // milliseconds
            validTimeStart: Math.floor(Date.now() / 1000),
            validTimeEnd: Math.floor(Date.now() / 1000),
          };
        }
        return attributeResult;
      });
    }
    setCurrentProofAttributes(proofAttributes);
  };

  const [, updateSchema] = useAsyncFn(async () => {
    // Don't attempt to fetch an empty credentialId
    // (i.e. on initial render)
    if (currentCredentialDefinitionId === '') {
      return;
    }
    // Attempt to get the credential definition first
    try {
      const credentialDefinition = await fetchCredentialDefinitionDetails(
        cloudAgentAPIs,
        currentCredentialDefinitionId,
      );
      if (_.isEmpty(credentialDefinition)) {
        setCurrentProofAttributes([]);
      } else {
        // Pull the schema sequence number from the credential
        // identifier and fetch the schema definition to determine
        // attributes available.
        const credentialDefinitionIdReg =
          /^([123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{21,22}):3:CL:(([1-9][0-9]*)|([123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{21,22}:2:.+:[0-9.]+)):(.+)$/;
        const matches = currentCredentialDefinitionId.match(
          credentialDefinitionIdReg,
        );
        if (matches) {
          const currentSchemaId = matches[3];
          const schema = await fetchSchemaDefinitionDetails(
            cloudAgentAPIs,
            currentSchemaId,
          );
          buildDefaultProofAttributes(schema, credentialDefinition);
        }
      }
    } catch (e) {
      setCurrentProofAttributes([]);
    }
  }, [cloudAgentAPIs, currentCredentialDefinitionId]);

  // Don't thrash around getting credential definitions on every
  // typed character if possible.
  useEffect(() => {
    const timeOutId = setTimeout(() => updateSchema(), 500);
    return () => clearTimeout(timeOutId);
  }, [updateSchema]);

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
      <IndyCredentialDefinitionIdEntryItem
        name="credentialDefinitionId"
        setCredentialDefinitionId={setCurrentCredentialDefinitionId}
      />
      {currentProofAttributes.length !== 0 && (
        <Form.Item label="Select desired Attributes for Proof:">
          <RequestProofAttributeList
            dataSource={currentProofAttributes}
            doCheckChange={changeProofAttribute}
            doTimeWindowChange={
              changeProofAttribute
            }></RequestProofAttributeList>
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
