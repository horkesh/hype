// Public API for @look/ui. Apps import from here, never from internal paths.
//
// Architecture:
//   - tamagui.config.ts holds the Look design system (tokens, themes, fonts).
//   - components.tsx exposes 12 universal primitives.
//   - Apps mount a <TamaguiProvider config={config}> at the root.

export { config, default as tamaguiConfig } from './tamagui.config';
export type { Conf } from './tamagui.config';

export {
  Box,
  Stack,
  Text,
  Heading,
  Card,
  Button,
  Input,
  Image,
  Link,
  Spinner,
  Modal,
  Sheet,
} from './components';

export type {
  ButtonProps,
  LinkProps,
  ModalProps,
  SheetProps,
  StackProps,
  TextProps,
  SpinnerProps,
  ImageProps,
  InputProps,
} from './components';

// Universal screens (composed of Phase 1 primitives, no platform-specific code)
export { VenueDetailContent } from './venue-detail';
export type { VenueDetailContentProps, VenueDetailInput } from './venue-detail';

// Re-export TamaguiProvider so apps don't need to depend on `tamagui` directly.
export { TamaguiProvider } from 'tamagui';
export type { TamaguiProviderProps } from 'tamagui';
