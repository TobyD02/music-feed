import { View, Text, TextInput, Image, StyleSheet } from "react-native";
import React, { useState, useEffect } from "react";
import { searchUsers } from "../../utils/api_interface";
import { UserData } from "../../utils/interfaces";

const SearchUsers = () => {
  const [results, setResults] = useState<any>([]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Search Users</Text>
      <TextInput
        placeholder="username"
        onChangeText={async (value) => {
          if (value != '') {
            const res = await searchUsers(value)
            if (res.data) setResults(res.data)
            else console.log(res.error)
          } else setResults([])
        }}
      />
      {results && results.map((result: any) => <UserBar user={result} />)}
    </View>
  );
};

const UserBar = (user: any) => {
  console.log(user.user)
  return (
    <View style={styles.user_container}>
      <Image source={{ uri: user.user.picture_url }} width={40} height={40} borderRadius={50} />
      <Text style={styles.username}>{user.user.display_name}</Text>
    </View>
  )
}

export default SearchUsers;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: "10%"
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
  },
  username: {
    fontSize: 15,
    marginLeft: 10
  },
  user_container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10
  }
})