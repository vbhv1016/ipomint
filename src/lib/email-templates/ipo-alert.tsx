import React from 'react'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  headline?: string
  message?: string
  ipoName?: string
  details?: string
  ctaUrl?: string
  ctaLabel?: string
}

const Email = ({
  headline = 'IPO update',
  message = '',
  ipoName = '',
  details = '',
  ctaUrl = 'https://ipomint.in',
  ctaLabel = 'View live GMP and details',
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{headline}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>IPO MINT</Text>
        <Heading style={h1}>{headline}</Heading>
        {message ? <Text style={text}>{message}</Text> : null}
        {details ? (
          <Section style={card}>
            {ipoName ? <Text style={cardTitle}>{ipoName}</Text> : null}
            <Text style={cardText}>{details}</Text>
          </Section>
        ) : null}
        <Button href={ctaUrl} style={button}>
          {ctaLabel}
        </Button>
        <Hr style={hr} />
        <Text style={footer}>
          Grey market premium data is unofficial and is not investment advice. IPO Mint is not
          SEBI registered.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: Record<string, any>) => data?.headline || 'IPO update from IPO Mint',
  displayName: 'IPO Alert',
  previewData: {
    headline: 'Qualiance Consulting IPO opens today',
    message: 'The subscription window is now open.',
    ipoName: 'Qualiance Consulting',
    details: 'Price band ₹96–₹101 · Lot 1200 · NSE SME',
    ctaUrl: 'https://ipomint.in/ipo/qualiance-consulting',
    ctaLabel: 'View live GMP and details',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, Helvetica, sans-serif' }
const container = { padding: '24px 24px 32px', maxWidth: '560px' }
const brand = {
  fontSize: '12px',
  letterSpacing: '2px',
  color: '#0f766e',
  fontWeight: 'bold' as const,
  margin: '0 0 8px',
}
const h1 = { fontSize: '20px', color: '#111827', margin: '0 0 12px', lineHeight: '1.35' }
const text = { fontSize: '14px', color: '#374151', margin: '0 0 16px', lineHeight: '1.6' }
const card = {
  border: '1px solid #e5e7eb',
  borderRadius: '10px',
  padding: '14px 16px',
  margin: '0 0 20px',
}
const cardTitle = { fontSize: '15px', color: '#111827', fontWeight: 'bold' as const, margin: '0 0 4px' }
const cardText = { fontSize: '13px', color: '#4b5563', margin: '0' }
const button = {
  backgroundColor: '#0f766e',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 'bold' as const,
  padding: '12px 20px',
  borderRadius: '8px',
  textDecoration: 'none',
}
const hr = { borderColor: '#e5e7eb', margin: '28px 0 14px' }
const footer = { fontSize: '11px', color: '#6b7280', margin: '0', lineHeight: '1.6' }
