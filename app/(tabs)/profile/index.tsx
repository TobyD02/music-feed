import { Stack } from "expo-router";
import { SafeAreaView, TouchableOpacity, StyleSheet, Alert, Image, ImageBackground, ScrollView } from "react-native";
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
      const {user: userData, error: userError} = await getUserData();
      if (userData) setUser(userData)
      if (userData) {
        console.log('fetching')
        const {data, error} = await supabase.from("daily_posts").select("*").eq("user_id", userData.id);
        console.log("finished fetching posts");
        console.log(data);
        if (data) setPosts(data);
        else console.log(error);
      } else {console.log("error fetching posts")}
    };

    getData();
  }, []);

  const doLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Error Signing Out User", error.message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 10 }}>
      <Stack.Screen options={{ headerShown: true, title: "Profile" }} />
      <Card style={{ padding: 10, margin: 10, overflow: 'hidden', maxHeight: '100%' }}>
        <Card.Content style={{ flexDirection: "row", alignItems: "center", padding: 10 }}>
          <Image source={{ uri: user?.picture_url }} style={{ borderRadius: 75 / 2, width: 75, height: 75, marginRight: 25 }} />
          <Text variant="titleLarge">{user?.display_name}</Text>
        </Card.Content>
        <Card.Content style={{ padding: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-around" }}>
          <Text>Followers: {user?.followers?.length}</Text>
          <Text>Following: {user?.following?.length}</Text>
        </Card.Content>
        <TouchableOpacity onPress={doLogout} style={styles.buttonContainer}>
          <Text style={styles.buttonText}>LOGOUT</Text>
        </TouchableOpacity>
        <Card.Content style={{ justifyContent: "center", alignItems: "center" }}>
          <Text variant="titleLarge">Posts</Text>
          <ScrollView style={{flexGrow: 0}}>
            <Card.Content style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {posts?.map((post) => (
                <PostItem key={post.post_id} post={post} />
              ))}
            </Card.Content>
          </ScrollView>
        </Card.Content>
      </Card>
    </SafeAreaView>
  );
}

const PostItem = ({ post }: { post: Post }) => {
  const theme = useTheme();

  return (
    <Card style={{ margin: 5, width: 134, height: 134, justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
      <ImageBackground source={{ uri: post.post_data.album_cover }} imageStyle={{ opacity: 0.75 }} style={{ width: 134, height: 134 }}>
        <Card.Content style={{ flex: 3, alignItems: 'center' }}>
          <Text variant="titleSmall">{post.date_posted}</Text>
        </Card.Content>
        <Card.Content style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text variant="titleSmall">{post.post_data.song_name}</Text>
        </Card.Content>
      </ImageBackground>
    </Card>
  );
};

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
