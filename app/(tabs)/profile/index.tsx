import { Stack } from "expo-router";
import { SafeAreaView, TouchableOpacity, StyleSheet, Alert, Image, ImageBackground, ScrollView, View } from "react-native";
import { supabase } from "../../utils/supabase";
import { useEffect, useState } from "react";
import { getUserData } from "../../utils/api_interface";
import { UserData, Post } from "../../utils/interfaces";
import { Avatar, Card, IconButton, Text, useTheme } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SoundPlayer from "react-native-sound-player";

export default function Profile() {
  const [user, setUser] = useState<UserData | null>(null);
  const [topTracks, setTopTracks] = useState<any[] | null>(null);
  const [topArtists, setTopArtists] = useState<any[] | null>(null);
  const [playing, setPlaying] = useState({
    isPlaying: false,
    name: "",
  });

  const playTrack = (track: string) => {
    console.log(track);
    if (playing.isPlaying && track == playing.name) {
      setPlaying({
        isPlaying: false,
        name: "",
      });
      SoundPlayer.stop();
    } else {
      setPlaying({
        isPlaying: true,
        name: track,
      });
      SoundPlayer.playUrl(track);
    }
  };

  useEffect(() => {
    const getData = async () => {
      const { user: userData, error: userError } = await getUserData();
      
      if (userData) setUser(userData);
      if (userData) {
        const token = await AsyncStorage.getItem("provider_token");
        // get most listened to artists and songs

        // Get top artists
        fetch("https://api.spotify.com/v1/me/top/artists?limit=3", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((response) => response.json())
          .then((data) => {
            setTopArtists(data.items);
          })
          .catch((error) => console.error(error));
        fetch("https://api.spotify.com/v1/me/top/tracks?limit=3", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((response) => response.json())
          .then((data) => {
            setTopTracks(data.items);
            console.log(Object.keys(data.items[0]));
          })
          .catch((error) => console.error(error));
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
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ alignItems: "center", marginBottom: 20 }}>
        <Image source={{ uri: user?.picture_url }} style={{ width: 150, height: 150, borderRadius: 75, margin: 20 }} />
        <Text variant="titleSmall" style={{ fontSize: 15 }}>
          {user?.display_name}
        </Text>
      </View>
      <View style={{ justifyContent: "space-between", flex: 1, marginTop: 10 }}>
        <View style={{ justifyContent: "flex-start" }}>
          <Text variant="titleSmall" style={{}}>
            Most listened to artists
          </Text>
          <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
            {topArtists?.map((artist: any) => (
              <View style={{ margin: 10, alignItems: "center" }}>
                <Image source={{ uri: artist.images[0].url }} width={100} height={100} style={{ borderRadius: 100 / 2 }} />
                <Text variant="bodySmall" style={{ marginTop: 5 }}>
                  {artist.name}
                </Text>
              </View>
            ))}
          </View>
        </View>
        <View style={{ marginTop: 20 }}>
          <Text variant="titleSmall">Pinned Tracks </Text>
          <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
            {topTracks?.map((track: any) => (
              <View style={{ margin: 0, alignItems: "center"}}>
                <Card.Cover source={{ uri: track.album.images[0].url }} style={{ width: 110, height: 150 }} />
                <Text variant="titleSmall" style={{ marginTop: 5, fontSize: 12, width: 110, textAlign: "center" }}>
                  {track.name}
                </Text>
                <Text style={{width: 110, textAlign: "center"}} variant="bodySmall">{track.artists[0].name}</Text>
                {track.preview_url ? (
                  <View>
                    {playing.isPlaying && playing.name == track.preview_url ? (
                      <IconButton icon="pause-circle" size={35} onPress={() => playTrack(track.preview_url)} />
                    ) : (
                      <IconButton icon="play-circle" size={35} onPress={() => playTrack(track.preview_url)} />
                    )}
                  </View>
                ) : (
                  <View>
                    <IconButton icon="close" size={35} />
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
        <View style={{ alignItems: "center", flex: 1, justifyContent: "flex-end" }}>
          <Text style={{ fontSize: 15 }} variant="titleSmall">
            cassette.lol/{user?.display_name}
          </Text>
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
