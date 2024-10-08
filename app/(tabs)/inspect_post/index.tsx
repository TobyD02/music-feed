import { View, StyleSheet, TouchableOpacity, Dimensions, KeyboardAvoidingView, Platform, ScrollView, Keyboard, LayoutAnimation } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { Stack, useLocalSearchParams } from "expo-router";
import { Comment, Post, UserData } from "../../utils/interfaces";
import { router } from "expo-router";
import { Avatar, Card, IconButton, Text, useTheme, TextInput } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../../utils/supabase";
import { getUserData, postComment, deleteComment } from "../../utils/api_interface";
import SoundPlayer from "react-native-sound-player";

const InspectPost = ({}) => {
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState<boolean>(true);
  const [postData, setPostData] = useState<Object>({});
  const [comments, setComments] = useState<Object[]>([]);
  const [user, setUser] = useState<UserData | null>(null);
  const theme = useTheme();

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
      const getPostData = await AsyncStorage.getItem("inspected_post");
      if (getPostData) {
        setPostData(JSON.parse(getPostData));
        // console.log(typeof(postData.post_id))
        const { error: getCommentsError, data: getCommentsData } = await supabase
          .from("comments")
          .select("*")
          .eq("post_id", parseInt(JSON.parse(getPostData)?.post_id));
        if (getCommentsData) setComments(getCommentsData);
      }

      getUserData().then(({ user, error }) => {
        if (error) alert(error);
        else setUser(user);
      });

      setLoading(false);

      console.log(
        "Comments: ",
        comments.map((c) => c.display_name)
      );
    };
    getData();
  }, []);

  const submitComment = (c: string) => {
    const commentData: Comment = {
      user_id: user?.id,
      content: c,
      is_reply: false,
      reply_to: null,
      post_id: postData?.post_id,
      user_picture: user?.picture_url,
      display_name: user?.display_name,
    };
    setComments([...comments, commentData]);
    postComment(commentData);
  };

  const removeComment = (comment: Comment) => {
    setComments(comments.filter(c => c.id !== comment.id));
    deleteComment(comment.id)
  }

  return (
    <View style={{ backgroundColor: theme.colors.background, flex: 1 }}>
      <Stack.Screen options={{ headerShown: false, title: "" }} />

      {!loading && (
        <PostItem
          submitComment={submitComment}
          comments={comments}
          post={postData}
          playTrack={playTrack}
          playing={playing}
          currentUserId={user?.id}
          removeComment={removeComment}
        />
      )}
    </View>
  );
};

const PostItem = ({
  post,
  playTrack,
  playing,
  comments,
  submitComment,
  currentUserId,
  removeComment,
}: {
  submitComment: (comment: string) => void;
  comments: Object[];
  post: Post;
  playTrack: (track: string) => void;
  playing: { isPlaying: boolean; name: string };
}) => {
  const theme = useTheme();

  const [comment, setComment] = useState<string>(``);
  const commentRef = useRef<TextInput>(null);

  const addComment = () => {
    if (commentRef.current) {
      commentRef.current.focus();
    }
  };

  const [keyboardShown, setKeyboardShown] = useState(false);

  return (
      <View style={[styles.post, { backgroundColor: theme.colors.background, width: "100%" }]}>
        <TouchableOpacity onPress={() => router.push({ pathname: `/inspect_post`, params: post })}>
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
              <Card.Cover
                source={{ uri: post.post_data.album_cover }}
                style={{ width: Dimensions.get("window").width, height: keyboardShown ? Dimensions.get("window").width / 4 : Dimensions.get("window").width }}
              />
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
          <Text variant="titleSmall" style={{ marginBottom: 5, marginLeft: 5 }}>
            {post.caption}
          </Text>
          <ScrollView style={{ height: 150 }}>
            {comments.map((comment) => (
              <View
                key={comment.id}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: "space-between",
                  width: '100%',
                  borderBottomColor: theme.colors.surface,
                    borderWidth: 1,
                }}>
                <View
                  style={{
                    flexDirection: "row",
                    flexGrow: 1,
                    padding: 5,
                    minHeight: 50,
                  }}>
                  <Avatar.Image size={30} source={{ uri: comment.user_picture }} style={{ marginRight: 10, marginTop: 5 }} />
                  <Text style={{lineHeight: 40}}variant="titleSmall">{comment.display_name} </Text>
                  <Text style={{ flexWrap: "wrap", textAlign: 'auto', maxWidth: '65%', lineHeight: 20, marginTop: 9}} variant="bodyMedium">
                    {comment.content}
                  </Text>
                </View>
                {currentUserId == comment.user_id && <IconButton icon="close" size={15} onPress={() => removeComment(comment)} />}
              </View>
            ))}
          </ScrollView>
          <TextInput
            value={comment}
            style={[theme.fonts.bodySmall, { backgroundColor: theme.colors.background }]}
            ref={commentRef}
            placeholder="Add a comment..."
            onChangeText={(text) => setComment(text)}
            onSubmitEditing={() => {
              if (comment.length > 0) {
                submitComment(comment);
                setComment(``);
              }
              setKeyboardShown(false)
            }}
            onFocus={() => setKeyboardShown(true)}
          />
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
export default InspectPost;
