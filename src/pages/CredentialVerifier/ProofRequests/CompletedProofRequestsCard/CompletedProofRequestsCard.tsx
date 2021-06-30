import React from 'react';
import { CompletedProofsCard } from '../../../../components/Proofs/CompletedProofsCard';

/**
 * The CompletedProofsCard React component displays proof exchanges
 * completed by this Agent acting as a Verifier.
 */
export const CompletedProofRequestsCard: React.FC = () => {
  return <CompletedProofsCard role="verifier"></CompletedProofsCard>;
};
