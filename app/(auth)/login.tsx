import { AppState, View, StyleSheet } from "react-native";
import { Button, Text } from "react-native-paper";
import { makeRedirectUri } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { supabase } from "../utils/supabase";
import { Stack } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "react-native-paper";
import { useFonts } from "expo-font";
import { clearUserData, getUserData } from "../utils/api_interface";

AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

WebBrowser.maybeCompleteAuthSession(); // required for web only
const redirectTo = makeRedirectUri();
console.log({ redirectTo });

// TODO: When user loads session, load and store data in async storage.
// TODO: When any page loads, it should check if there is stored data.

const createSessionFromUrl = async (url: string) => {
  const { params, errorCode } = QueryParams.getQueryParams(url);

  console.log(params)

  if (errorCode) throw new Error(errorCode);
  const { access_token, refresh_token, provider_token } = params;

  AsyncStorage.setItem("provider_token", provider_token); // TODO: Async

  // Get user info

  if (!access_token) return;

  const { data, error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });
  if (error) throw error;

  const spotify_data = await fetch("https://api.spotify.com/v1/me", {
    headers: {
      Authorization: `Bearer ${provider_token}`,
    },
  }).then((res) => res.json());

  // Dont upsert if user already exists

  const { user: userDataRetrieved, error: userDataError } = await getUserData();

  if (!userDataRetrieved || userDataRetrieved == null) {
    const user_profile = {
      id: data.session?.user.id,
      display_name: spotify_data?.display_name,
      email: spotify_data?.email,
      picture_url: spotify_data?.images?.length > 0 ? spotify_data?.images[1].url : "", // Second image is higher resolution
      followers: [],
      following: [],
      just_created: true,
    };

    const upsertUser = await supabase.from("users").upsert(user_profile);
    if (upsertUser?.error) console.log(upsertUser?.error);
  }

  return data.session;
};

const performOAuth = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "spotify",
    options: {
      redirectTo,
      skipBrowserRedirect: false,
      scopes: 'user-top-read',
    },
  });

  console.log("data: ", data)

  if (error) throw error;

  // Open without cookies, prevents auto sign in
  const res = await WebBrowser.openAuthSessionAsync(data?.url ?? "", redirectTo, {preferEphemeralSession: true}); 
  // const res = await WebBrowser.openAuthSessionAsync(data?.url ?? "", redirectTo); 

  if (res.type === "success") {
    const { url } = res;
    await createSessionFromUrl(url);
  }
};

export default function Auth() {
  // Handle linking into app from email app.
  const url = Linking.useURL();
  console.log({ url });
  if (url) createSessionFromUrl(url);

  const theme = useTheme();
  const [fontsLoaded] = useFonts({
    "AvenirLTStd-Black": require("../../assets/fonts/AvenirLTStd-Black.otf"),
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ headerShown: false, title: "Login" }} />
      <Text variant="titleLarge" style={{ margin: 10, color: theme.colors.primary }}>
        cassette
      </Text>
      <Button style={{ width: "40%", borderWidth: 3 }} mode="outlined" labelStyle={theme.fonts.titleSmall} textColor="white" onPress={performOAuth}>
        SIGN IN
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
