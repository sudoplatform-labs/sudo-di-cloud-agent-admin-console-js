import { PresentProofRecordsGetRoleEnum } from '@sudoplatform-labs/sudo-di-cloud-agent';
import React from 'react';
import { CompletedProofsCard } from '../../../../components/Proofs/CompletedProofsCard';

/**
 * The CompletedProofsCard React component displays proof exchanges
 * completed by this Agent acting as a Prover.
 */
export const CompletedProofPresentationsCard: React.FC = () => {
  return <CompletedProofsCard role={PresentProofRecordsGetRoleEnum.Prover}></CompletedProofsCard>;
};
