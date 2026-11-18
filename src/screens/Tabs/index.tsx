import { Tabs } from 'expo-router/tabs';
import { TabBar } from '@/components/TabBar';
import { tabScreenOptions } from './styles';

export function TabsLayout() {
  return (
    <Tabs screenOptions={tabScreenOptions} tabBar={(props) => <TabBar {...props} />}>
      <Tabs.Screen name="home" />
      <Tabs.Screen name="history" />
      <Tabs.Screen name="health" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
