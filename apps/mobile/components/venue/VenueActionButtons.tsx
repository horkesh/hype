import React from 'react';

import { VenueDeliveryActionGroup } from '@/components/venue/VenueDeliveryActionGroup';
import { VenuePrimaryActionGroup } from '@/components/venue/VenuePrimaryActionGroup';
import {
  buildVenueDeliveryActions,
  buildVenuePrimaryActions,
} from '@/utils/venueActions';

interface VenueActionButtonsProps {
  colors: {
    card: string;
    text: string;
    accent: string;
  };
  labels: {
    navigate: string;
    call: string;
    save: string;
    web: string;
    instagram: string;
    korpa: string;
    glovo: string;
  };
  hasPhone: boolean;
  hasWebsite: boolean;
  hasInstagram: boolean;
  isSaved: boolean;
  onNavigate: () => void;
  onPhone: () => void;
  onWebsite: () => void;
  onInstagram: () => void;
  onToggleSave: () => void;
  onOpenKorpa?: () => void;
  onOpenGlovo?: () => void;
}

export function VenueActionButtons({
  colors,
  labels,
  hasPhone,
  hasWebsite,
  hasInstagram,
  isSaved,
  onNavigate,
  onPhone,
  onWebsite,
  onInstagram,
  onToggleSave,
  onOpenKorpa,
  onOpenGlovo,
}: VenueActionButtonsProps) {
  const primaryActions = buildVenuePrimaryActions({
    hasInstagram,
    hasPhone,
    hasWebsite,
    isSaved,
    labels,
  });
  const deliveryActions = buildVenueDeliveryActions({
    hasGlovo: Boolean(onOpenGlovo),
    hasKorpa: Boolean(onOpenKorpa),
    labels,
  });

  const handlePrimaryAction = (actionId: (typeof primaryActions)[number]['id']) => {
    const handlers = {
      navigate: onNavigate,
      call: onPhone,
      web: onWebsite,
      instagram: onInstagram,
      save: onToggleSave,
    };

    handlers[actionId]();
  };

  const handleDeliveryAction = (actionId: (typeof deliveryActions)[number]['id']) => {
    const handlers = {
      korpa: onOpenKorpa,
      glovo: onOpenGlovo,
    };

    handlers[actionId]?.();
  };

  return (
    <>
      <VenuePrimaryActionGroup
        actions={primaryActions}
        cardColor={colors.card}
        textColor={colors.text}
        onPressAction={handlePrimaryAction}
      />
      <VenueDeliveryActionGroup
        accentColor={colors.accent}
        actions={deliveryActions}
        onPressAction={handleDeliveryAction}
      />
    </>
  );
}
