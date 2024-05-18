import { IconButton, Text, useTheme } from "react-native-paper";
import { Stack, router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

export default function TabsLayout() {
  const theme = useTheme();

  const [lastPage, setLastPage] = useState("view_posts");

  return (
    <Stack screenOptions={{ headerTitleAlign: "center", headerStyle: { backgroundColor: theme.colors.background }, headerTitleStyle: theme.fonts.titleMedium }}>
      <Stack.Screen
        name="view_posts"
        options={{
          headerShown: true,
          title: "cassette",
          animationTypeForReplace: lastPage == "create_post" ? "push" : "pop",
          headerLeft: () => (
            <IconButton
              icon="waveform"
              size={30}
              style={{ top: "-10%" }}
              iconColor={theme.colors.primary}
              onPress={() => {
                router.replace("/(tabs)/create_post");
                setLastPage("view_posts");
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
                setLastPage("view_posts");
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
          headerTitleStyle: theme.fonts.titleSmall,
          headerLeft: () => (
            <IconButton
              icon="keyboard-backspace"
              size={30}
              style={{ top: "-10%" }}
              iconColor={theme.colors.primary}
              onPress={() => {
                router.navigate("/(tabs)/view_posts");
                setLastPage("create_post");
              }}
            />
          ),
        }}
      />
      <Stack.Screen
        name="inspect_post"
        options={{
          title: "",
          animationTypeForReplace: "pop",
          headerShown: true,
          headerTitleStyle: theme.fonts.titleSmall,
          headerLeft: () => (
            <IconButton
              icon="keyboard-backspace"
              size={30}
              style={{ top: "-10%" }}
              iconColor={theme.colors.primary}
              onPress={() => {
                router.navigate("/(tabs)/view_posts");
                setLastPage("inspect_post");
              }}
            />
          ),
        }}
      />
      <Stack.Screen name="new_user" options={{ title: "", animationTypeForReplace: "pop", headerShown: false }} />
      <Stack.Screen
        name="search_users"
        options={{
          title: "",
          animationTypeForReplace: "push",
          headerShown: true,
          headerTitleStyle: theme.fonts.titleSmall,
          headerLeft: () => (
            <IconButton
              icon="keyboard-backspace"
              size={30}
              style={{ top: "-10%" }}
              iconColor={theme.colors.primary}
              onPress={() => {
                router.navigate("/(tabs)/" + lastPage);
                setLastPage("search_users");
              }}
            />
          ),
        }}
      />
      <Stack.Screen
        name="profile_settings"
        options={{
          title: "",
          animationTypeForReplace: "push",
          headerShown: true,
          headerTitleStyle: theme.fonts.titleSmall,
          headerLeft: () => (
            <IconButton
              icon="keyboard-backspace"
              size={30}
              style={{ top: "-10%" }}
              iconColor={theme.colors.primary}
              onPress={() => {
                router.navigate("/(tabs)/" + lastPage);
                setLastPage("profile_settings");
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
          headerTitleStyle: theme.fonts.titleSmall,
          headerLeft: () => (
            <IconButton
              icon="keyboard-backspace"
              size={30}
              style={{ top: "-10%" }}
              iconColor={theme.colors.primary}
              onPress={() => {
                router.replace("/(tabs)/view_posts");
                setLastPage("profile");
              }}
            />
          ),
          headerRight: () => (
            <>
              <IconButton
                icon="magnify"
                onPress={() => {
                  router.replace("/(tabs)/search_users");
                  setLastPage("profile");
                }}
              />
              <IconButton
                icon="dots-horizontal"
                onPress={() => {
                  router.replace("/(tabs)/profile_settings");
                  setLastPage("profile");
                }}
              />
            </>
          ),
        }}
      />
    </Stack>
  );
}
