// 12 universal primitives. Thin wrappers over Tamagui where the API is already
// what we want; specialized props (e.g. Card variants, Button variants) where
// the design system has opinions.
//
// All of these render to native View/Text on iOS/Android and to <div>/<span>
// on web, with Look's design tokens applied automatically. Variants are
// platform-agnostic — same prop sets work everywhere.

import * as React from 'react';
import {
  Stack as TamaguiStack,
  Text as TamaguiText,
  Spinner as TamaguiSpinner,
  Image as TamaguiImage,
  Input as TamaguiInput,
  styled,
  type StackProps,
  type TextProps,
  type SpinnerProps,
  type ImageProps,
  type InputProps,
} from 'tamagui';

// ─── Box / Stack ───────────────────────────────────────────────────────────
// Box is an alias for Tamagui's <Stack> — a flex container that defaults to
// column layout. Use Box for generic containers; use Stack with explicit
// direction (`row`) when you want a flex-row layout.

export const Box = styled(TamaguiStack, {
  name: 'LookBox',
});

// Stack mirrors Tamagui's native <Stack> — use flexDirection / gap directly
// with token values ('$2' / '$4' / '$6') rather than wrapping them in custom
// variants. Custom variants conflicting with built-in style props produced
// a TS overload error on the first variant we tried (`gap`).
export const Stack = styled(TamaguiStack, {
  name: 'LookStack',
});

// ─── Text / Heading ─────────────────────────────────────────────────────────

export const Text = styled(TamaguiText, {
  name: 'LookText',
  color: '$color',
  fontFamily: '$body',
  fontSize: '$4',
  variants: {
    tone: {
      default: { color: '$color' },
      muted: { color: '$colorMuted' },
      dim: { color: '$colorDim' },
      accent: { color: '$accent' },
      danger: { color: '$danger' },
    },
    size: {
      xs: { fontSize: '$1' },
      sm: { fontSize: '$2' },
      md: { fontSize: '$4' },
      lg: { fontSize: '$5' },
    },
  } as const,
});

export const Heading = styled(TamaguiText, {
  name: 'LookHeading',
  color: '$color',
  fontFamily: '$heading',
  fontSize: '$6',
  variants: {
    level: {
      hero: { fontSize: '$8', lineHeight: '$8' },         // 34
      section: { fontSize: '$6', lineHeight: '$6' },      // 24
      card: { fontSize: '$4', lineHeight: '$4' },         // 18
    },
  } as const,
});

// ─── Card ───────────────────────────────────────────────────────────────────

export const Card = styled(TamaguiStack, {
  name: 'LookCard',
  backgroundColor: '$backgroundCard',
  borderRadius: '$card',
  padding: '$4',
  borderWidth: 1,
  borderColor: '$borderColor',
  variants: {
    elevated: {
      true: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
    },
    interactive: {
      true: {
        cursor: 'pointer',
        hoverStyle: { backgroundColor: '$backgroundHover' },
        pressStyle: { scale: 0.98 },
      },
    },
  } as const,
});

// ─── Button ─────────────────────────────────────────────────────────────────
// Built on Stack rather than Tamagui's <Button> so we can keep the variant
// shape tight and ensure consistent press feedback across platforms.

const PressableStack = styled(TamaguiStack, {
  name: 'LookButton',
  cursor: 'pointer',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'row',
  gap: '$2',
  paddingHorizontal: '$4',
  borderRadius: '$pill',
  hoverStyle: { opacity: 0.9 },
  pressStyle: { scale: 0.97 },
  variants: {
    variant: {
      primary: {
        backgroundColor: '$accent',
      },
      secondary: {
        backgroundColor: '$backgroundCard',
        borderWidth: 1,
        borderColor: '$borderColor',
      },
      ghost: {
        backgroundColor: 'transparent',
      },
      danger: {
        backgroundColor: '$danger',
      },
    },
    size: {
      sm: { height: 32, paddingHorizontal: '$3' },
      md: { height: 44, paddingHorizontal: '$4' },
      lg: { height: 52, paddingHorizontal: '$6' },
    },
    disabled: {
      true: { opacity: 0.5, pointerEvents: 'none' },
    },
  } as const,
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

export interface ButtonProps extends React.ComponentProps<typeof PressableStack> {
  children?: React.ReactNode;
}

export const Button = React.forwardRef<any, ButtonProps>(({ children, ...rest }, ref) => {
  return (
    <PressableStack ref={ref} role="button" {...rest}>
      {typeof children === 'string' ? (
        <Text size="md" color="$color">{children}</Text>
      ) : (
        children
      )}
    </PressableStack>
  );
});
Button.displayName = 'Button';

// ─── Input ──────────────────────────────────────────────────────────────────

export const Input = styled(TamaguiInput, {
  name: 'LookInput',
  backgroundColor: '$backgroundCard',
  borderColor: '$borderColor',
  borderWidth: 1,
  borderRadius: '$input',
  paddingHorizontal: '$4',
  paddingVertical: '$3',
  color: '$color',
  placeholderTextColor: '$colorDim',
  fontFamily: '$body',
  focusStyle: {
    borderColor: '$accent',
  },
});

// ─── Image ──────────────────────────────────────────────────────────────────

export const Image = styled(TamaguiImage, {
  name: 'LookImage',
  borderRadius: '$image',
  variants: {
    aspect: {
      square: { aspectRatio: 1 },
      hero: { aspectRatio: 16 / 9 },
      portrait: { aspectRatio: 4 / 5 },
    },
  } as const,
});

// ─── Link ───────────────────────────────────────────────────────────────────
// Universal link: on web, renders as <a>; on native, renders as Text. The
// `href` prop is the canonical URL; native consumers should layer Linking
// or expo-router on top (Phase 4 handles cross-platform navigation).

const LinkText = styled(TamaguiText, {
  name: 'LookLink',
  color: '$accent',
  fontFamily: '$body',
  textDecorationLine: 'underline',
  cursor: 'pointer',
  hoverStyle: { opacity: 0.85 },
});

export interface LinkProps extends React.ComponentProps<typeof LinkText> {
  href?: string;
  external?: boolean;
}

export const Link = React.forwardRef<any, LinkProps>(({ href, external, ...rest }, ref) => {
  // href/target/rel are <a>-only props on web; Tamagui's RN-Web layer forwards
  // unknown DOM attrs, but our TS type for Text doesn't include them. Pass
  // through a single any-cast rather than three @ts-* directives.
  const anchorProps = {
    href,
    target: external ? '_blank' : undefined,
    rel: external ? 'noopener noreferrer' : undefined,
  };
  return <LinkText ref={ref} {...(anchorProps as any)} {...rest} />;
});
Link.displayName = 'Link';

// ─── Spinner ────────────────────────────────────────────────────────────────

export const Spinner = TamaguiSpinner;

// ─── Modal / Sheet ──────────────────────────────────────────────────────────
// Phase 1 ships minimal Modal + Sheet that wrap a fixed-position overlay.
// Phase 2 will swap in Tamagui's <Dialog> + <Sheet> for native portal support
// once we need gesture-driven sheets on iOS — for hello-world parity these
// simple wrappers are enough.

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ open, onOpenChange, children }) => {
  if (!open) return null;
  return (
    <Box
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      backgroundColor="$blackAlpha60"
      alignItems="center"
      justifyContent="center"
      zIndex={1000}
      onPress={() => onOpenChange(false)}
    >
      <Card onPress={(e: any) => e.stopPropagation()} minWidth={280} maxWidth={520}>
        {children}
      </Card>
    </Box>
  );
};

export interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children?: React.ReactNode;
}

export const Sheet: React.FC<SheetProps> = ({ open, onOpenChange, children }) => {
  if (!open) return null;
  return (
    <Box
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      backgroundColor="$blackAlpha40"
      justifyContent="flex-end"
      zIndex={1000}
      onPress={() => onOpenChange(false)}
    >
      <Card
        onPress={(e: any) => e.stopPropagation()}
        borderTopLeftRadius="$modal"
        borderTopRightRadius="$modal"
        borderBottomLeftRadius={0}
        borderBottomRightRadius={0}
      >
        {children}
      </Card>
    </Box>
  );
};

// ─── Re-exports for ergonomics ──────────────────────────────────────────────
export type { StackProps, TextProps, SpinnerProps, ImageProps, InputProps };
