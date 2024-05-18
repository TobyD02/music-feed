import { View, Image, StyleSheet, Pressable } from "react-native";
import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createPost, getUserData, getUserHasPosted } from "../../utils/api_interface";
import { UserData } from "../../utils/interfaces";
import { useTheme, Text, Searchbar, Button, TextInput, Card } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

type setSelectedType = (
  value:
    | {
        song_name: string;
        album_cover: string;
        song_artist: string;
        preview_url: string;
      }
    | string
) => void;

const CreatePost = () => {
  const [searchResults, setSearchResults] = useState<any | null>(null);
  const [search, setSearch] = useState<string | null>(null);
  const [query, setQuery] = useState<string>("");
  const [selected, setSelected] = useState<{
    song_name: string;
    preview_url: string;
    album_cover: string;
    song_artist: string;
  } | null>(null);

  const [user, setUser] = useState<UserData | null>(null);
  const [hasPosted, setHasPosted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [caption, setCaption] = useState<string>("");

  const theme = useTheme();

  useEffect(() => {
    const getUser = async () => {
      const { user, error } = await getUserData();
      if (error) console.log(error);
      else {
        console.log("user: " + JSON.stringify(user));
        setUser(user);
        const has_posted = await getUserHasPosted(user.id);
        //TODO: disable continous posting
        // setHasPosted(has_posted);
        setHasPosted(false);
        setLoading(false);
      }
    };

    getUser();
  }, []);

  const getSearchData = async () => {
    const token = await AsyncStorage.getItem("provider_token");

    fetch("https://api.spotify.com/v1/search?q=" + search + "&type=track&limit=5", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setSearchResults(data);
      })
      .catch((error) => console.error(error));
  };

  const submitPost = () => {
    if (!selected) return null;
    if (hasPosted) return null;

    if (user)
      createPost(user, selected, caption)
        .then((res) => {
          setHasPosted(true);
        })
        .catch((e) => {
          console.log(e);
        });
  };

  if (loading) return <View />;
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {hasPosted ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text variant="labelMedium">Already posted today</Text>
        </View>
      ) : (
        <View>
          <View style={{ flex: 3, justifyContent: "center" }}>
            <View style={{ alignItems: "center", flex: 3 }}>
              <Text variant="labelMedium" style={{ margin: 10 }}>
                Whats your song for today?
              </Text>
              <Searchbar
                placeholder=""
                style={{ width: "75%", height: 30, backgroundColor: "white", margin: 10 }}
                autoCapitalize="none"
                autoCorrect={false}
                iconColor="white"
                inputStyle={[{ minHeight: 0, color: "black" }, theme.fonts.bodySmall]}
                placeholderTextColor={"rgba(0,0,0,0.5)"}
                value={query}
                onChangeText={(text) => {
                  setQuery(text);
                  setSearch(encodeURIComponent(text));
                  // console.log(search);
                  getSearchData();
                }}></Searchbar>
              <View style={styles.search_results}>
                {searchResults &&
                  searchResults.tracks?.items?.map((item: any) => (
                    <SearchItem key={item.id} song_name={item.name} album_cover={item.album.images[0].url} song_artist={item.artists[0].name} preview_url={item.preview_url} setItem={setSelected as setSelectedType} />
                  ))}
              </View>
            </View>
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <TextInput style={[theme.fonts.titleSmall, { width: "75%", height: 30, backgroundColor: theme.colors.background, margin: 10 }]} onChangeText={(text) => setCaption(text)} placeholder="Add a caption..." />
              <View style={{ width: 150, height: 50, flexDirection: "row", justifyContent: "center", display: "flex", marginTop: 25 }}>
                <Card.Cover source={{ uri: selected?.album_cover }} resizeMode="center" style={{ width: 50, height: 50, marginLeft: 10 }} />
                <View style={{ justifyContent: "center", marginLeft: 10 }}>
                  <Text variant="titleSmall">{selected?.song_artist}</Text>
                  <Text>{selected?.song_name}</Text>
                </View>
              </View>
              <Text variant="bodySmall" style={{ flexWrap: "wrap", width: 150, marginTop: 10 }}>
                {caption}
              </Text>
            </View>
          </View>
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Button mode="elevated" style={{ display: "flex", justifyContent: "flex-end" }} labelStyle={theme.fonts.titleSmall} onPress={() => submitPost()}>
              Post
            </Button>
          </View>
        </View>
      )}
    </View>
  );
};

const SearchItem = ({
  song_name,
  album_cover,
  song_artist,
  preview_url,
  setItem,
}: {
  song_name: string;
  album_cover: string;
  song_artist: string;
  preview_url: string;
  setItem: (
    value:
      | {
          song_name: string;
          album_cover: string;
          song_artist: string;
          preview_url: string;
        }
      | string
  ) => void;
}) => {
  return (
    <Pressable style={styles.search_item} onPress={() => setItem({ song_name, album_cover, song_artist, preview_url })}>
      <Image source={{ uri: album_cover }} style={{ height: 40, width: 40, borderRadius: 40 / 2 }} />
      <Text> {song_name}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 3,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  search_item: {
    flexDirection: "row",
    width: 200,
    height: 50,
    alignItems: "center",
    justifyContent: "space-center",
    margin: 5,
  },
  search_results: {
    flexDirection: "column",
    alignItems: "center",
    height: 250,
    margin: 10,
  },
  song_choice: {
    height: 50,
    margin: 10,
  },
});

export default CreatePost;
