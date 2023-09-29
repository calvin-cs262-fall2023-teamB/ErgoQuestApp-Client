import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, SafeAreaView, Dimensions, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import Modal from 'react-native-modal';
import { globalStyles } from '../styles/global';

export default function HelpModal({ isVisible, onClose }) {
    return (
      <Modal isVisible={isVisible} onBackdropPress={onClose} backdropOpacity={0.5}>
        <View style={globalStyles.modalContainer}>
          <TouchableOpacity onPress={onClose} style={globalStyles.closeButton}>
            <Ionicons name="ios-close-circle" size={36} color="Black" />
          </TouchableOpacity>
          <Text>Help Page</Text>
          <Text>The Move page allows you to move your
          chair without permanently saving the setting</Text>
        <Text>The Presets page allows you to save and 
          access multiple positions whic can be easily 
          switched between</Text>
          <Text>The Timed page allows you to set times in which 
            presets are switched to on a timed schedule</Text>
        </View>
      </Modal>
    );
  }