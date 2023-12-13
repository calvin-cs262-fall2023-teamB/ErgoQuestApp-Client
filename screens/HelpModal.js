import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Modal from 'react-native-modal';
import { globalStyles } from '../styles/global';

export default function HelpModal({ isVisible, onClose }) {
  const [text, setText] = useState('Switch pages to see help menu.');

  useFocusEffect(() => {
    if (global.help === "Home"){
      setText(`All pages can be accessed here. Move between tabs to get useful tips here.`);
    } else if (global.help === "Move") {
      setText(`The Move page allows you to move your chair without permanently saving the setting`);
    } else if (global.help === "Presets") {
      setText(`The Presets page allows you to save and access multiple positions which can be easily switched between`);
    } else if (global.help === "Timed") {
      setText(`The Timed page allows you to set times in which presets are switched to on a timed schedule`);
    } else {
      setText(`Switch pages to see Help menu.`);
    }
    return () => {
      
    }
  });
  
  return (
    <Modal isVisible={isVisible} onBackdropPress={onClose} backdropOpacity={0.5}>
      <View style={globalStyles.modalContainer}>
        <TouchableOpacity onPress={onClose} style={globalStyles.closeButton}>
          <Ionicons name="ios-close-circle" size={36} color="black" />
        </TouchableOpacity>
        <Text>Help Page</Text>
        <Text>{text}</Text>
      </View>
    </Modal>
  );
}