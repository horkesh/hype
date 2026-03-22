import { Stack } from 'expo-router';

export default function HomeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="venue/[id]" />
      <Stack.Screen name="event/[id]" />
      <Stack.Screen name="series/[id]" />
      <Stack.Screen name="heritage/[id]" />
    </Stack>
  );
}
