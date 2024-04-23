import { useFonts } from "expo-font";
import { Slot } from "expo-router";
import {MD3DarkTheme, PaperProvider} from 'react-native-paper'

export default function AuthLayout() {

  const [fontsLoaded] = useFonts({
    'AvenirLTStd-Black': require('../assets/fonts/AvenirLTStd-Black.otf'),
    'AvenirLTStd-Roman': require('../assets/fonts/AvenirLTStd-Roman.otf'),
    'AvenirLTStd-Book': require('../assets/fonts/AvenirLTStd-Book.otf'),
  })

  const theme = {
    ...MD3DarkTheme,
    colors: {
      ...MD3DarkTheme.colors,
      background: '#000',
      primary: '#fff',
      primaryContainer: '#000',
      outline: '#fff',
    },
    fonts: {
      ...MD3DarkTheme.fonts,
      'titleLarge': {
        fontFamily: 'AvenirLTStd-Black',
        fontWeight: '500',
        fontSize: 60,
        color: '#fff'
      },
      'titleMedium': {
        fontFamily: 'AvenirLTStd-Black',
        fontWeight: '500',
        fontSize: 30,
        color: '#fff'
      },
      'titleSmall': {
        fontFamily: 'AvenirLTStd-Black',
        fontWeight: '500',
        fontSize: 15,
        color: '#fff'
      },
      'labelLarge': {
        fontFamily: 'AvenirLTStd-Book',
        fontWeight: '200',
        fontSize: 60,
        color: '#fff'
      },
      'labelMedium': {
        fontFamily: 'AvenirLTStd-Book',
        fontWeight: '200',
        fontSize: 20,
        color: '#fff'
      },
      'labelSmall': {
        fontFamily: 'AvenirLTStd-Book',
        fontWeight: '100',
        fontSize: 15,
        color: '#fff'
      },
    }
  }

  return <PaperProvider theme={theme} ><Slot /></PaperProvider>;
}