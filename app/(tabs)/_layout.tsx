import { IconButton, Text, useTheme } from "react-native-paper";
import { Stack, router } from "expo-router";
import { useState } from "react";

export default function TabsLayout() {
  const theme = useTheme();

  const [lastPage, setLastPage] = useState("view_posts");

  return (
    <Stack screenOptions={{ headerTitleAlign: "center", headerStyle: { backgroundColor: theme.colors.background }, headerTitleStyle: theme.fonts.titleMedium }}>
      <Stack.Screen
        name="view_posts"
        options={{
          headerShown: true,
          title: "discjam",
          animationTypeForReplace: lastPage == 'create_post' ? "push" : "pop",
          headerLeft: () => (
            <IconButton
              icon="waveform"
              size={30}
              style={{ top: "-10%" }}
              iconColor={theme.colors.primary}
              onPress={() => {
                router.replace("/(tabs)/create_post");
                setLastPage("view_posts")
              }}
            />
          ),
          headerRight: () => (
            <IconButton
              icon="account"
              size={30}
              style={{ top: "-10%" }}
              iconColor={theme.colors.primary}
              onPress={() => {
                router.replace("/(tabs)/profile");
                setLastPage("view_posts")
              }}
            />
          ),
        }}
      />
      <Stack.Screen
        name="create_post"
        options={{
          title: "",
          animationTypeForReplace: "pop",
          headerShown: true,
          headerTitleStyle:theme.fonts.titleSmall,
          headerLeft: () => (
            <IconButton
              icon="keyboard-backspace"
              size={30}
              style={{ top: "-10%" }}
              iconColor={theme.colors.primary}
              onPress={() => {
                router.navigate("/(tabs)/view_posts");
                setLastPage("create_post")
              }}
            />
          ),
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          title: "profile",
          animationTypeForReplace: "push",
          headerShown: true,
          headerTitleStyle:theme.fonts.titleSmall,
          headerLeft: () => (
            <IconButton
              icon="keyboard-backspace"
              size={30}
              style={{ top: "-10%" }}
              iconColor={theme.colors.primary}
              onPress={() => {
                router.replace("/(tabs)/view_posts");
                setLastPage("profile")
              }}
            />
          ),
        }}
      />
    </Stack>
  );
}
