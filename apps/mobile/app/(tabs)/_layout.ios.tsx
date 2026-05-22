
import React from 'react';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { useApp } from '@/contexts/AppContext';

export default function TabLayout() {
  const { t } = useApp();

  return (
    <NativeTabs>
      <NativeTabs.Trigger name="(home)">
        <Label>{t('home')}</Label>
        <Icon sf={{ default: 'house', selected: 'house.fill' }} drawable="home" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="explore">
        <Label>{t('explore')}</Label>
        <Icon sf={{ default: 'magnifyingglass', selected: 'magnifyingglass' }} drawable="search" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="tonight">
        <Label>{t('tonight')}</Label>
        <Icon sf={{ default: 'calendar', selected: 'calendar' }} drawable="event" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="saved">
        <Label>{t('saved')}</Label>
        <Icon sf={{ default: 'heart', selected: 'heart.fill' }} drawable="favorite" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Label>{t('profile')}</Label>
        <Icon sf={{ default: 'person', selected: 'person.fill' }} drawable="person" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
