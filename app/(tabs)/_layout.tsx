import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{headerShown: false}} >
      <Tabs.Screen name="create_post" options={{ title: "Create Post" }} />
      <Tabs.Screen name="view_posts" options={{ title: "View Posts" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  )
}