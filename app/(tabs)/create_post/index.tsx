import { View, Image, StyleSheet, Dimensions, Keyboard, KeyboardAvoidingView, Platform, TouchableWithoutFeedback } from "react-native";
import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createPost, getUserData, getUserHasPosted } from "../../utils/api_interface";
import { UserData } from "../../utils/interfaces";
import { useTheme, Text, Searchbar, Button, TextInput, Card, TouchableRipple } from "react-native-paper";
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

  const [editingCaption, setEditingCaption] = useState<boolean>(false);
  const [editingSearch, setEditingSearch] = useState<boolean>(false);

  const theme = useTheme();

  useEffect(() => {
    const getUser = async () => {
      const { user, error } = await getUserData();
      if (error) console.log(error);
      else {
        // console.log("user: " + JSON.stringify(user));
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
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text variant="labelMedium">Already posted today</Text>
        </View>
      ) : (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View>
            <View style={{ flex: 3, justifyContent: "center", width: Dimensions.get("screen").width }}>
              <View style={{ alignItems: "center", flex: 3 }}>
                <Text variant="labelMedium" style={{ margin: 10 }}>
                  Whats your song for today?
                </Text>
                <Searchbar
                  placeholder="Search for a song..."
                  style={{ width: "75%", height: 30, backgroundColor: "white", margin: 10 }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  iconColor="white"
                  inputStyle={[{ minHeight: 0, color: "black" }, theme.fonts.bodySmall]}
                  placeholderTextColor={"rgba(0,0,0,0.5)"}
                  selectionColor={"rgba(0, 0, 0, 0.5"}
                  value={query}
                  onChangeText={(text) => {
                    setQuery(text);
                    setSearch(encodeURIComponent(text));
                    // console.log(search);
                    getSearchData();
                  }}></Searchbar>
                <View style={styles.search_results}>
                  {searchResults
                    ? editingCaption
                      ? searchResults.tracks.items
                          .slice(0, editingCaption ? searchResults.tracks.items.length - 1 : searchResults.tracks.items.length)
                          .map((item: any) => (
                            <SearchItem
                              key={item.id}
                              song_name={item.name}
                              album_cover={item.album.images[0].url}
                              song_artist={item.artists[0].name}
                              preview_url={item.preview_url}
                              setItem={setSelected as setSelectedType}
                            />
                          ))
                      : searchResults.tracks?.items?.map((item: any) => (
                          <SearchItem
                            key={item.id}
                            song_name={item.name}
                            album_cover={item.album.images[0].url}
                            song_artist={item.artists[0].name}
                            preview_url={item.preview_url}
                            setItem={setSelected as setSelectedType}
                          />
                        ))
                    : null}
                </View>
              </View>
              <KeyboardAvoidingView
                behavior={editingCaption ? (Platform.OS === "ios" ? "padding" : null) : null}
                keyboardVerticalOffset={50}
                style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <TextInput
                  style={[theme.fonts.titleSmall, { width: Dimensions.get("screen").width * 0.9, height: 30, backgroundColor: theme.colors.background, margin: 10 }]}
                  onChangeText={(text) => setCaption(text)}
                  placeholder="Add a caption..."
                  onFocus={() => setEditingCaption(true)}
                  onBlur={() => setEditingCaption(false)}
                />
                <View style={{ width: Dimensions.get("screen").width * 0.9, minHeight: 50, flexDirection: "row", justifyContent: "flex-start", alignItems: 'center', display: "flex", marginTop: 25 }}>
                  <Card.Cover source={{ uri: selected?.album_cover }} resizeMode="center" style={{ width: 50, height: 50, marginLeft: 10 }} />
                  <View style={{ justifyContent: "center", marginLeft: 10, width: Dimensions.get("screen").width * 0.8 / 4}}>
                    <Text variant="titleSmall">{selected?.song_artist}</Text>
                    <Text>{selected?.song_name}</Text>
                  </View>
                  <View style={{ justifyContent: 'center', marginLeft: 20, width: Dimensions.get("screen").width * 0.8 / 3 * 2}}>
                    <Text>{caption}</Text>
                  </View>
                </View>
              </KeyboardAvoidingView>
            </View>
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <Button
                mode="elevated"
                style={{ display: "flex", justifyContent: "flex-end" }}
                labelStyle={theme.fonts.titleSmall}
                onPress={() => submitPost()}>
                Post
              </Button>
            </View>
          </View>
        </TouchableWithoutFeedback>
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
    <TouchableRipple
      style={styles.search_item}
      rippleColor={"rgba(255, 255, 255, 0.2)"}
      onPress={() => {
        setItem({ song_name, album_cover, song_artist, preview_url });
        Keyboard.dismiss();
      }}>
      <View style={styles.search_item}>
        <Image source={{ uri: album_cover }} style={{ height: 50, width: 50 }} />
        <View style={{ marginLeft: 20, display: "flex", flexDirection: "column" }}>
          <Text variant="titleSmall"> {song_artist}</Text>
          <Text> {song_name}</Text>
        </View>
      </View>
    </TouchableRipple>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 3,
    alignItems: "center",
    justifyContent: "flex-start",
    width: Dimensions.get("screen").width,
  },
  search_item: {
    flexDirection: "row",
    width: Dimensions.get("screen").width * 0.9,
    height: 50,
    alignItems: "center",
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
