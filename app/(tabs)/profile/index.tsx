import { Stack } from "expo-router";
import { SafeAreaView, TouchableOpacity, StyleSheet, Alert, Image, ImageBackground, ScrollView, View } from "react-native";
import { supabase } from "../../utils/supabase";
import { useEffect, useState } from "react";
import { getUserData } from "../../utils/api_interface";
import { UserData, Post } from "../../utils/interfaces";
import { Avatar, Card, Text, useTheme } from "react-native-paper";

export default function Profile() {
  const [user, setUser] = useState<UserData | null>(null);
  const [posts, setPosts] = useState<Post[] | null>(null);
  useEffect(() => {
    const getData = async () => {
      const { user: userData, error: userError } = await getUserData();
      if (userData) setUser(userData);
      if (userData) {
        console.log("fetching");
        const { data, error } = await supabase.from("daily_posts").select("*").eq("user_id", userData.id);
        console.log("finished fetching posts");
        console.log(data);
        if (data) setPosts(data);
        else console.log(error);
      } else {
        console.log("error fetching posts");
      }
    };

    getData();
  }, []);

  const doLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Error Signing Out User", error.message);
    }
  };

  const theme = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background}}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{alignItems: 'center', marginBottom: 20}}>
        <Image source={{ uri: user?.picture_url }} style={{ width: 150, height: 150, borderRadius: 75, margin: 20 }} />
        <Text variant="titleSmall" style={{ fontSize: 15 }}>
          {user?.display_name}
        </Text>
      </View>
      <View style={{justifyContent: 'space-between', flex: 1}}>
        <View style={{justifyContent: 'flex-start'}}>
          <Text variant="titleSmall" style={{}}>
            Most listened to artists
          </Text>
        </View>
        <View>
          <Text variant='titleSmall'>Pinned Tracks</Text>
        </View>
        <View style={{alignItems: 'center'}}>
          <Text style={{fontSize: 15}} variant='titleSmall'>discjam.io/{user?.display_name}</Text>
        </View>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: "stretch",
  },
  mt20: {
    marginTop: 20,
  },
  buttonContainer: {
    backgroundColor: "#000968",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    margin: 8,
  },
  buttonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
    alignSelf: "center",
    textTransform: "uppercase",
  },
  textInput: {
    borderColor: "#000968",
    borderRadius: 4,
    borderStyle: "solid",
    borderWidth: 1,
    padding: 12,
    margin: 8,
  },
});
