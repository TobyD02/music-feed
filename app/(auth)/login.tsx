import { Button, AppState, View } from "react-native";
import { makeRedirectUri } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { supabase } from "../utils/supabase";
import { Stack } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

const createSessionFromUrl = async (url: string) => {
  const { params, errorCode } = QueryParams.getQueryParams(url);

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
  
  const user_profile = {
    id: data.session?.user.id,
    display_name: spotify_data?.display_name,
    email: spotify_data?.email,
    picture_url: spotify_data?.images.length > 0 ? spotify_data?.images[1].url : "", // Second image is higher resolution
    followers: [],
    following: [],
  }

  const upload_success = await supabase.from("users").upsert(user_profile);

  console.log(upload_success)

  if (upload_success?.error) return upload_success.error
  return data.session;
};

const performOAuth = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "spotify",
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });
  if (error) throw error;

  const res = await WebBrowser.openAuthSessionAsync(
    data?.url ?? "",
    redirectTo
  );

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

  return (
    <View>
      <Stack.Screen options={{ headerShown: true, title: "Login" }} />
      <Button onPress={performOAuth} title="Sign in with Spotify" />
    </View>
  );
}
