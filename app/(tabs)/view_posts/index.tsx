import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Button,
} from "react-native";
import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabase";
import { Stack } from "expo-router";
import SoundPlayer from "react-native-sound-player";
import { Post, UserData } from "../../utils/interfaces";
import { getPosts, getUserData } from "../../utils/api_interface";

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

  supabase
    .channel("schema-db-changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "daily_posts" },
      (payload) => {
        supabase
          .from("daily_posts")
          .select("*")
          .eq("date_posted", new Date().toISOString().slice(0, 10))
          .then(({ data, error }) => {
            if (data) {
              console.log(data);
              setPosts(data);
            } else if (error) console.log(error);
          });
      }
    )
    .subscribe();

  useEffect(() => {
    getUserData().then(({ user, error }) => {
      if (error) console.log(error);
      else {
        setUser(user);
        getPosts(user).then(({ data, error }) => {
          if (error) console.log(error);
          else setPosts(data);
        });
      }
    });
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.posts_container}>
        {posts &&
          posts?.map((post: Post) => (
            <PostItem key={post.post_id} post={post} playTrack={playTrack} />
          ))}
      </ScrollView>
    </View>
  );
};

const PostItem = ({
  post,
  playTrack,
}: {
  post: Post;
  playTrack: (track: string) => void;
}) => {
  return (
    <View style={styles.post}>
      {post.picture_url && (
        <Image
          source={{ uri: post.picture_url }}
          style={{ height: 50, width: 50 }}
        />
      )}
      <Text style={styles.post_artist}>Posted: {post.date_posted}</Text>
      <Text style={styles.post_artist}>Posted: {post.display_name}</Text>
      <Image
        source={{ uri: post.post_data.album_cover }}
        style={{ height: 200, width: 200 }}
      />
      <Text style={styles.post_title}>{post.post_data.song_name}</Text>
      <Text style={styles.post_artist}>{post.post_data.song_artist}</Text>
      {post.post_data.preview_url ? (
        <Button
          title="play"
          onPress={() => playTrack(post.post_data.preview_url)}
        />
      ) : (
        <Text style={styles.post_artist}>No Preview</Text>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  post: {
    width: 300, // Width of each post
    height: 400, // Height of each post
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#222",
    margin: 10, // Spacing between posts
  },
  posts_container: {
    flexGrow: 1,
    flexDirection: "column",
    backgroundColor: "#000000",
    alignItems: "center",
  },
  post_title: {
    color: "white",
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
