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
import { User } from "@supabase/supabase-js";
import { useRouter } from "expo-router";

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

interface user {
  created_at: string;
  display_name: string;
  email: string;
  followers: string[];
  following: string[];
  id: string;
}

const CreatePost = () => {
  const [searchResults, setSearchResults] = useState<any | null>(null);
  const [search, setSearch] = useState<string | null>(null);
  const [selected, setSelected] = useState<{
    song_name: string;
    preview_url: string;
    album_cover: string;
    song_artist: string;
  } | null>(null);

  const [user, setUser] = useState<User | null>(null);
  const [hasPosted, setHasPosted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: User, error } = await supabase.auth.getUser();

      if (User != null) {
        supabase
          .from("users")
          .select("*")
          .eq("id", User.user?.id)
          .single()
          .then((user_data) => {
            if (user_data.data) setUser(user_data.data);
            supabase
              .from("daily_posts")
              .select("*")
              .eq("user_id", User.user?.id)
              .eq("date_posted", new Date().toISOString().slice(0, 10))
              .single()
              .then(({ data, error }) => {
                // console.log(data, error)
                if (data) setHasPosted(false);
                else console.log("not posted today");
                setLoading(false);
              });
          });
      } else if (error) console.log(error);
    };

    getUser();
  }, []);

  const getSearchData = async () => {
    const token = await AsyncStorage.getItem("provider_token");

    // console.log({ token });

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

    console.log(user);

    supabase
      .from("daily_posts")
      .insert({
        user_id: user?.id,
        user_name: user?.display_name,
        picture_url: user?.picture_url,
        post_data: selected,
      })
      .then((res) => {
        if (res.status == 201) {
          setHasPosted(true);
          // router.replace("/(tabs)/view_posts/");
        } else console.log("error");
      });
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
    backgroundColor: "#fff",
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
