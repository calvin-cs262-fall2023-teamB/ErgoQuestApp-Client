import React, { useState } from 'react';
import { View, Text } from 'react-native';

export default function TimedScreen({ isDarkMode }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: isDarkMode ? 'white' : 'black' }}>Timed Page</Text>
    </View>
  );
}
