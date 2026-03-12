
import React from 'react';
import { Stack } from 'expo-router';
import FloatingTabBar, { TabBarItem } from '@/components/FloatingTabBar';
import { useApp } from '@/contexts/AppContext';

export default function TabLayout() {
  const { t } = useApp();

  const tabs: TabBarItem[] = [
    {
      name: '(home)',
      route: '/(tabs)/(home)',
      icon: 'home',
      label: t('home'),
    },
    {
      name: 'explore',
      route: '/(tabs)/explore',
      icon: 'search',
      label: t('explore'),
    },
    {
      name: 'tonight',
      route: '/(tabs)/tonight',
      icon: 'event',
      label: t('tonight'),
    },
    {
      name: 'saved',
      route: '/(tabs)/saved',
      icon: 'favorite',
      label: t('saved'),
    },
    {
      name: 'profile',
      route: '/(tabs)/profile',
      icon: 'person',
      label: t('profile'),
    },
  ];

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
        }}
      >
        <Stack.Screen name="(home)" />
        <Stack.Screen name="explore" />
        <Stack.Screen name="tonight" />
        <Stack.Screen name="saved" />
        <Stack.Screen name="profile" />
      </Stack>
      <FloatingTabBar tabs={tabs} />
    </>
  );
}
