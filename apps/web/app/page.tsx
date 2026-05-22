'use client';

import { Box, Stack, Text, Heading, Card, Button, Input, Image, Link, Spinner, Modal, Sheet } from '@look/ui';
import * as React from 'react';

// Hello-world parity demo. Identical composition rendered in apps/mobile.
// Visual goal: each primitive shows with Look's gold/black palette + DM
// Serif/DM Sans typography, on both web and mobile, without any
// platform-specific styling.
export default function Home() {
  const [modalOpen, setModalOpen] = React.useState(false);
  const [sheetOpen, setSheetOpen] = React.useState(false);

  return (
    <Box backgroundColor="$background" padding="$6" gap="$6" minHeight="100vh">
      <Heading level="hero">Look — Phase 1 primitives</Heading>
      <Text tone="muted">
        Same composition renders on web and mobile.
      </Text>

      <Card gap="$3">
        <Heading level="card">Typography</Heading>
        <Heading level="section">Section heading</Heading>
        <Text size="md">Body text — 15px DM Sans</Text>
        <Text tone="muted" size="sm">Muted caption — 12px</Text>
        <Text tone="accent">Accent gold tone</Text>
      </Card>

      <Card gap="$3">
        <Heading level="card">Buttons</Heading>
        <Stack flexDirection="row" gap="$3" flexWrap="wrap">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
        </Stack>
      </Card>

      <Card gap="$3">
        <Heading level="card">Input</Heading>
        <Input placeholder="Search venues…" />
      </Card>

      <Card gap="$3" alignItems="flex-start">
        <Heading level="card">Image</Heading>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1565128939862-9b6a778bc92a?w=640' }}
          width={200}
          height={120}
          aspect="hero"
        />
      </Card>

      <Card gap="$3">
        <Heading level="card">Link</Heading>
        <Link href="https://hype-alpha.vercel.app" external>Open Look (web preview)</Link>
      </Card>

      <Card gap="$3" alignItems="flex-start">
        <Heading level="card">Spinner</Heading>
        <Spinner color="$accent" />
      </Card>

      <Card gap="$3">
        <Heading level="card">Overlays</Heading>
        <Stack flexDirection="row" gap="$3" flexWrap="wrap">
          <Button onPress={() => setModalOpen(true)}>Open modal</Button>
          <Button variant="secondary" onPress={() => setSheetOpen(true)}>Open sheet</Button>
        </Stack>
      </Card>

      <Modal open={modalOpen} onOpenChange={setModalOpen}>
        <Heading level="card">Modal example</Heading>
        <Text tone="muted">Tap outside or the close button to dismiss.</Text>
        <Button onPress={() => setModalOpen(false)}>Close</Button>
      </Modal>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <Heading level="card">Sheet example</Heading>
        <Text tone="muted">Bottom sheet stub. Phase 2 swaps in Tamagui&apos;s native sheet.</Text>
        <Button onPress={() => setSheetOpen(false)}>Close</Button>
      </Sheet>
    </Box>
  );
}
