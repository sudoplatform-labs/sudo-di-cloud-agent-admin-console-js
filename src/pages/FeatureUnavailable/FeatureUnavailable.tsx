import React from 'react';
import styled from 'styled-components';
import { Description, Heading } from '../../components/charts/ChartHeading';
import { ConsoleCard } from '../../components/ConsoleCard';
import {
  CardsCol,
  CardsRow,
  PageHeading,
  Page,
} from '../../components/NavLayout';
import { Row, Col, Button } from 'antd';
import { Image, ImageName } from '../../components/Image';
import { theme } from '../../theme';

const StyledConsoleCard = styled(ConsoleCard)`
  .ant-card-body {
    padding: 36px 48px;
  }
`;

const StyledCol = styled(Col)`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const CTAHeading = styled(Heading)`
  margin-bottom: 8px;
  font-size: 20px;
  font-weight: 900;
  line-height: 1.2;
`;

const CTADescription = styled(Description)`
  margin-bottom: 0;
`;

const CTASubDescription = styled(Description)`
  color: ${theme.greys.chateau};
`;

const CTAButton = styled(Button)`
  max-width: 144px;
`;

const StyledImage = styled(Image)`
  height: auto;
  width: 100%;
`;

interface Props {
  pageHeading: string;
  ctaHeading: string;
  ctaDescription: string;
  ctaSubDescription: string;
  ctaLink: string;
  imageName: ImageName;
}

export const FeatureUnavailable: React.FC<Props> = (props) => {
  return (
    <Page>
      <PageHeading>{props.pageHeading}</PageHeading>
      <CardsRow>
        <CardsCol span={24}>
          <StyledConsoleCard>
            <Row gutter={24}>
              <StyledCol span="12">
                <CTAHeading>{props.ctaHeading}</CTAHeading>
                <CTADescription>{props.ctaDescription}</CTADescription>
                <CTASubDescription>{props.ctaSubDescription}</CTASubDescription>
                <CTAButton
                  type="primary"
                  shape="round"
                  href={props.ctaLink}
                  target="_blank"
                >
                  Learn More
                </CTAButton>
              </StyledCol>
              <StyledCol span="12">
                <StyledImage name={props.imageName} />
              </StyledCol>
            </Row>
          </StyledConsoleCard>
        </CardsCol>
      </CardsRow>
    </Page>
  );
};
