import { View } from "react-native";
import React, {useState, useEffect} from "react";
import { Stack } from "expo-router";
import { useTheme, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Searchbar } from "react-native-paper";
import { checkUsername, getUserData, updateJustCreated } from "../../utils/api_interface";
import { UserData } from "../../utils/interfaces";
import { router } from "expo-router";
import { PostgrestError } from "@supabase/supabase-js";

export default function NewUser() {
  const theme = useTheme();
  const [username, setUsername] = useState<string>("")
  const [user, setUser] = useState<UserData | null>(null)
  const [error, setError] = useState<string | null | PostgrestError>(null)

  useEffect(() => {
    const getData = async() => {
      getUserData().then(({ user, error }) => {
        console.log(user)
        if (error) console.log(error);
        else setUser(user)  
      })
    }

    getData()
  }, [])

  const submitUsername = () => {
    console.log(user)
    if (user)
      checkUsername(user, username).then(({data: data, error: e}) => {
        console.log({data}, {e})
        if (e != null) {
          console.log({e})
          setError(e)
        }
        else if (data) {
          setError(null)
          updateJustCreated(user).then(({success, error}) => {
            if (success)router.navigate("/(tabs)/view_posts");
            else alert(error)
          })
        }
      })  
  }

  return (
    <SafeAreaView style={{ backgroundColor: theme.colors.background, flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Stack.Screen options={{ headerShown: false }} />
      <Text variant="titleMedium">Choose your username</Text>
      <Searchbar
        placeholder="Enter a username"
        style={{ width: "75%", height: 30, backgroundColor: "white", margin: 10 }}
        autoCapitalize="none"
        autoCorrect={false}
        iconColor="white"
        inputStyle={[{ minHeight: 0, color: "black" }, theme.fonts.bodySmall]}
        placeholderTextColor={"rgba(0,0,0,0.5)"}
        value={username}
        onChangeText={(text) => setUsername(text)}
        onSubmitEditing={submitUsername}
        ></Searchbar>
        {error && typeof error === 'string' && (<Text variant="bodySmall" style={{color: 'red'}}>{error}</Text>)}
    </SafeAreaView>
  );
}
