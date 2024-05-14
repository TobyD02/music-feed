import { View } from 'react-native'
import React from 'react'
import { useTheme } from 'react-native-paper'
import { Stack } from 'expo-router'
import {Text} from 'react-native-paper'

export default function ProfileSettings() {

  const theme = useTheme()
  return (
    <View style={{ backgroundColor: theme.colors.background, flex: 1, alignItems: "center" }}>
      <Stack.Screen options={{ headerShown: false }} />
      <Text variant='titleMedium'>profile settings</Text>
    </View>
  )
}