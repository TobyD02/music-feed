import { View, StyleSheet } from "react-native";
import React, { useState, useEffect } from "react";
import { getUserData, searchUsers, followUser } from "../../utils/api_interface";
import { UserData } from "../../utils/interfaces";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Searchbar, useTheme, Avatar, Text, IconButton, Card } from "react-native-paper";

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
    <View style={[styles.container, { paddingTop: insets.top }]}></View>
  ) : (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={[styles.header, { color: theme.colors.primary }]}>Search Users</Text>
      <Searchbar
        style={{ width: "75%", marginTop: 10, height: 45 }}
        inputStyle={{ minHeight: 0 }}
        value={query}
        placeholder="username"
        autoComplete="off"
        autoCorrect={false}
        autoCapitalize="none"
        onChangeText={async (value) => {
          setQuery(value);
          if (value != "") {
            const res = await searchUsers(value);
            if (res.data) setResults(res.data);
            // else console.log(res.error)
          } else setResults([]);
        }}
      />
      {results && results.map((result: any) => <UserBar key={result.id} user={result} follow={follow} isFollowed={results.id ? user?.following.includes(results.id) : false} />)}
    </View>
  );
};

const UserBar = ({ user, isFollowed, follow }: { user: any; isFollowed: boolean | undefined; follow: (userToFollow: UserData) => void }) => {

  const [followed, setFollowed] = useState<boolean | undefined>(isFollowed);

  //TODO implement unfollow

  return (
    <Card style={{margin: 10}}>
      <Card.Content style={{flexDirection: 'row'}}>
        <Card.Content style={{flexDirection: 'row', alignItems: 'center'}}>
          <Avatar.Image source={{ uri: user.picture_url }} size={35} style={{ marginRight: 10 }} />
          <Text variant="labelLarge">{user.display_name}</Text>
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
                setFollowed(true)
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
    width: '75%'
  },
});
