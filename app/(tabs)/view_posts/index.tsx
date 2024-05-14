import { View, Image, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabase";
import { Stack } from "expo-router";
import SoundPlayer from "react-native-sound-player";
import { Post, UserData } from "../../utils/interfaces";
import { getPosts, getUserData, getUserHasPosted } from "../../utils/api_interface";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { IconButton, useTheme } from "react-native-paper";
import { Card, Text, Avatar, Button } from "react-native-paper";
import { useFonts } from "expo-font";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ViewPosts = () => {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [playing, setPlaying] = useState({
    isPlaying: false,
    name: "",
  });
  const [user, setUser] = useState<UserData | null>(null);

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
    getUserData().then(({ user: userData, error }) => {
      if (error) console.log(error);
      else if (userData){
        setUser(userData);
        getPosts(userData).then(({ data, error }) => {
          if (error) console.log(error);
          else {
            console.log({data})
            setPosts(data);
          }
        });

        if (userData.just_created) router.navigate("/(tabs)/new_user");
      }
    });
  }, []);

  // const insets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />
      {posts && posts.length > 0 ? (
        <ScrollView contentContainerStyle={styles.posts_container}>{posts && posts?.map((post: Post) => <PostItem key={post.post_id} post={post} playTrack={playTrack} playing={playing} />)}</ScrollView>
      ) : (
        <View style={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1 }}>
          <Text variant="labelSmall">No Posts Today...</Text>
        </View>
      )}
    </View>
  );
};

const PostItem = ({ post, playTrack, playing }: { post: Post; playTrack: (track: string) => void; playing: { isPlaying: boolean; name: string } }) => {
  const theme = useTheme();

  console.log('loading')

  return (
    <View style={[styles.post, { backgroundColor: theme.colors.background, width: "100%" }]}>
      <TouchableOpacity
        onPress={() => {
          router.push({ pathname: `/inspect_post` });
          AsyncStorage.setItem("inspected_post", JSON.stringify(post));
        }}>
        <View style={{ flexDirection: "row", alignItems: "center", width: "100%" }}>
          <Avatar.Image size={25} source={{ uri: post.picture_url }} style={{ marginRight: 10 }} />
          <Text variant="bodySmall" style={{ color: theme.colors.primary }}>
            {post.display_name}
          </Text>
        </View>
      </TouchableOpacity>
      <View>
        <View style={{ width: "100%", display: "flex", alignItems: "center" }}>
          <View style={{ width: "100%", marginTop: 5 }}>
            <Card.Cover source={{ uri: post.post_data.album_cover }} style={{ width: Dimensions.get("window").width, height: Dimensions.get("window").width }} />
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
            {post.post_data.preview_url ? (
              <View>
                {playing.isPlaying && playing.name == post.post_data.preview_url ? (
                  <IconButton icon="pause-circle" size={35} onPress={() => playTrack(post.post_data.preview_url)} />
                ) : (
                  <IconButton icon="play-circle" size={35} onPress={() => playTrack(post.post_data.preview_url)} />
                )}
              </View>
            ) : (
              <View>
                <IconButton icon="close" size={35} />
              </View>
            )}
            <View style={{ flexDirection: "column", justifyContent: "center", alignItems: "center", width: Dimensions.get("window").width / 2 }}>
              <Text variant="titleSmall" numberOfLines={1} style={{ color: theme.colors.primary, fontSize: 15 }}>
                {post.post_data.song_name}
              </Text>
              <Text variant="bodySmall">{post.post_data.song_artist}</Text>
            </View>
            <IconButton icon="emoticon" size={35} />
          </View>
        </View>
        <Text variant="bodySmall" style={{ marginBottom: 5, marginLeft: 5 }}>
          {post.caption}
        </Text>
        <Text
          onPress={() => {
            router.push({ pathname: `/inspect_post` });
            AsyncStorage.setItem("inspected_post", JSON.stringify(post));
          }}
          variant="titleSmall"
          style={{ marginLeft: 5, fontSize: 14, fontWeight: "200" }}>
          Add a comment...
        </Text>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  post: {
    width: 300, // Width of each post
    height: 575, // Height of each post
    marginBottom: 0,
  },
  posts_container: {
    flexGrow: 1,
    flexDirection: "column",
    alignItems: "center",
    padding: 0,
    margin: 0,
  },
  post_username: {
    fontSize: 10,
  },
  post_artist: {
    color: "white",
    fontFamily: "Helvetica",
    fontSize: 15,
  },
});
export default ViewPosts;
