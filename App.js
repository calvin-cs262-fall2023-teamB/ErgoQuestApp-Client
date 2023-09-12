import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image } from 'react-native';

const Logo = require('./assets/StolenLogo_ErgoQuest.png');

export default function App() {
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={Logo} style={styles.image} />
      </View>
      <View style={styles.textContainer}>
        <Text>The ErgoQuest control app</Text>
        <Text>(This might become the launch loading screen)</Text>
        <Text style={[{ fontStyle: 'italic' }]}>Version: 0.0</Text>
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    flex: 1,
    paddingTop: 10,
  },
  image: {
    width: 320,
    height: undefined,
    aspectRatio: 1,
    resizeMode: 'contain',
  },
  textContainer: {
    flex: 1 / 2,
    alignItems: 'center',
  },
});
