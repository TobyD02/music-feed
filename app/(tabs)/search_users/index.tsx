import { View, StyleSheet } from "react-native";
import React, { useState, useEffect } from "react";
import { getUserData, searchUsers, followUser } from "../../utils/api_interface";
import { UserData } from "../../utils/interfaces";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Searchbar, useTheme, Avatar, Text, IconButton, Card } from "react-native-paper";
import { Stack } from "expo-router";

const SearchUsers = () => {
  const [results, setResults] = useState<any>([]);
  const [query, setQuery] = useState<string>("");
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    getUserData().then(({ user }) => {
      setUser(user);
      setLoading(false);
    });
  }, []);

  const follow = async (userToFollow: UserData) => {
    if (user) await followUser(user, userToFollow);
  };

  const insets = useSafeAreaInsets();
  const theme = useTheme();

  return loading ? (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
    </View>
  ) : (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
      <Text style={[styles.header, { color: theme.colors.primary }]}>Search Users</Text>
      <Stack.Screen options={{ headerShown: false }} />
      <Searchbar
        style={{ width: "75%", height: 30, backgroundColor: "white", margin: 10 }}
        autoCapitalize="none"
        autoCorrect={false}
        iconColor="white"
        autoComplete="off"
        inputStyle={[{ minHeight: 0, color: "black" }, theme.fonts.bodySmall]}
        value={query}
        placeholder="username"
        onChangeText={async (value) => {
          setQuery(value);
          if (value != "") {
            const res = await searchUsers(value, user);
            if (res.data) setResults(res.data);
            // else console.log(res.error)
          } else setResults([]);
        }}
      />
      {results &&
        results.map((result: any) => (
          <UserBar
            key={result.id}
            user={result}
            follow={follow}
            followList={user?.following}
          />
        ))}
    </View>
  );
};

const UserBar = ({ user, followList, follow }: { user: any; followList: string[] | undefined; follow: (userToFollow: UserData) => void }) => {
  const [followed, setFollowed] = useState<boolean | undefined>(followList?.includes(user.id));

  console.log(followed)

  //TODO implement unfollow

  return (
    <Card style={{ margin: 10 }}>
      <Card.Content style={{ flexDirection: "row" }}>
        <Card.Content style={{ flexDirection: "row", alignItems: "center" }}>
          <Avatar.Image source={{ uri: user.picture_url }} size={35} style={{ marginRight: 10 }} />
          <Text variant="titleSmall">{user.display_name}</Text>
        </Card.Content>
        <Card.Content>
          {followed ? (
            <IconButton icon="account-check-outline" size={20} />
          ) : (
            <IconButton
              icon="account-plus-outline"
              size={20}
              onPress={() => {
                follow(user);
                setFollowed(true);
              }}
            />
          )}
        </Card.Content>
      </Card.Content>
    </Card>
  );
};

export default SearchUsers;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: "10%",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
  },
  user_container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    justifyContent: "space-between",
    width: "75%",
  },
});
