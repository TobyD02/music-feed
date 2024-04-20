import {
  View,
  Text,
  Button,
  Image,
  TextInput,
  StyleSheet,
  Pressable,
} from "react-native";
import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { createPost, getUserData, getUserHasPosted } from "../../utils/api_interface";
import { UserData } from "../../utils/interfaces";
import { useTheme } from "react-native-paper";

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
  const [selected, setSelected] = useState<{
    song_name: string;
    preview_url: string;
    album_cover: string;
    song_artist: string;
  } | null>(null);

  const [user, setUser] = useState<UserData | null>(null);
  const [hasPosted, setHasPosted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const theme = useTheme()

  useEffect(() => {
    const getUser = async () => {

      const {user, error} = await getUserData();
      if (error) console.log(error)
      
      else {
        console.log('user: ' + JSON.stringify(user))
        setUser(user);
        const has_posted = await getUserHasPosted(user.id)
        setHasPosted(has_posted)
        setLoading(false)
      }

    };

    getUser();
  }, []);

  const getSearchData = async () => {
    const token = await AsyncStorage.getItem("provider_token");

    fetch(
      "https://api.spotify.com/v1/search?q=" + search + "&type=track&limit=5",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
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
      createPost(user, selected).then((res) => {
        setHasPosted(true)
      }).catch((e) =>{
        console.log(e)
      })
  };

  if (loading) return <View />;
  return (
    <View style={styles.container}>
      {hasPosted ? (
        <Text>Already posted today</Text>
      ) : (
        <>
          <Text>Selected Song</Text>
          {selected && (
            <SearchItem
              preview_url={selected?.preview_url}
              song_artist={selected?.song_artist}
              song_name={selected?.song_name}
              album_cover={selected?.album_cover}
              setItem={setSelected as setSelectedType}
            />
          )}
          <Text>Choose a song</Text>
          <TextInput
            placeholder="Search"
            onChangeText={(text) => {
              setSearch(encodeURIComponent(text));
              // console.log(search);
              getSearchData();
            }}
          ></TextInput>
          <View style={styles.search_results}>
            {searchResults &&
              searchResults.tracks?.items?.map((item: any) => (
                <SearchItem
                  key={item.id}
                  song_name={item.name}
                  album_cover={item.album.images[0].url}
                  song_artist={item.artists[0].name}
                  preview_url={item.preview_url}
                  setItem={setSelected as setSelectedType}
                />
              ))}
          </View>
          <Button title="submit" onPress={() => submitPost()} />
        </>
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
    <Pressable
      style={styles.search_item}
      onPress={() =>
        setItem({ song_name, album_cover, song_artist, preview_url })
      }
    >
      <Image source={{ uri: album_cover }} style={{ height: 50, width: 50 }} />
      <Text> {song_name}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#333",
    alignItems: "center",
    justifyContent: "center",
  },
  search_item: {
    flexDirection: "row",
    width: 200,
    height: 50,
  },
  search_results: {
    flexDirection: "column",
    alignItems: "center",
    height: 250,
  },
});

export default CreatePost;
