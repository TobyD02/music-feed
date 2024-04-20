import { View, Image, StyleSheet, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabase";
import { Stack } from "expo-router";
import SoundPlayer from "react-native-sound-player";
import { Post, UserData } from "../../utils/interfaces";
import { getPosts, getUserData, getUserHasPosted } from "../../utils/api_interface";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { IconButton, useTheme } from "react-native-paper";
import { Card, Text, Avatar, Button } from "react-native-paper";

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
    getUserData().then(({ user, error }) => {
      if (error) console.log(error);
      else {
        setUser(user);
        getPosts(user).then(({ data, error }) => {
          if (error) console.log(error);
          else {
            setPosts(data);
          }
        });
      }
    });
  }, [posts]);

  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.posts_container}>{posts && posts?.map((post: Post) => <PostItem key={post.post_id} post={post} playTrack={playTrack} playing={playing} />)}</ScrollView>
    </View>
  );
};

const PostItem = ({ post, playTrack, playing }: { post: Post; playTrack: (track: string) => void; playing: { isPlaying: boolean; name: string } }) => {
  const theme = useTheme();

  return (
    <Card mode="elevated" style={styles.post}>
      <Card.Content style={{ flexDirection: "row", alignItems: "center", width: "100%" }}>
        <Avatar.Image size={25} source={{ uri: post.picture_url }} style={{ marginRight: 10 }} />
        <Text variant="titleLarge" style={[styles.post_title, { color: theme.colors.primary }]}>
          {post.display_name}
        </Text>
      </Card.Content>
      <Card.Content style={{ width: "100%", display: "flex", alignItems: "center", padding: 10 }}>
        <View style={{width: '100%', padding:0}}>
          <Card.Cover source={{ uri: post.post_data.album_cover }} style={{ height: 300, width: "100%" }} />
          <View style={{ ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end'}}>
            {playing.isPlaying && playing.name == post.post_data.preview_url ? (
              <IconButton icon="pause-circle" size={35} onPress={() => playTrack(post.post_data.preview_url)} />
            ) : (
              <IconButton icon="play-circle" size={35} onPress={() => playTrack(post.post_data.preview_url)} />
            )}
          </View>
        </View>
        <Card.Content style={{ paddingTop: 5 }}>
          <Text variant="titleMedium" style={{ color: "white" }}>
            {post.post_data.song_name}
          </Text>
          <Text variant="bodyMedium">{post.post_data.song_artist}</Text>
        </Card.Content>
      </Card.Content>
    </Card>
  );
};
const styles = StyleSheet.create({
  post: {
    width: 300, // Width of each post
    height: 420, // Height of each post
    margin: 10, // Spacing between posts
  },
  posts_container: {
    flexGrow: 1,
    flexDirection: "column",
    alignItems: "center",
  },
  post_title: {
    fontFamily: "Helvetica",
    fontWeight: "bold",
    fontSize: 20,
  },
  post_artist: {
    color: "white",
    fontFamily: "Helvetica",
    fontSize: 15,
  },
});
export default ViewPosts;
