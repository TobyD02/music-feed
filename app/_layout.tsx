import { Slot } from "expo-router";
import {MD3DarkTheme, PaperProvider} from 'react-native-paper'

export default function AuthLayout() {
  return <PaperProvider theme={MD3DarkTheme} ><Slot /></PaperProvider>;
}