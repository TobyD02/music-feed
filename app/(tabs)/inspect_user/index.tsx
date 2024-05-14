import { View, Text } from 'react-native'
import React from 'react'
import { useTheme } from 'react-native-paper'
import { useLocalSearchParams } from 'expo-router'

export default function InspectUser() {

  const theme = useTheme()
  const params = useLocalSearchParams();

  return (
    <View>
      <Text>index</Text>
    </View>
  )
}
