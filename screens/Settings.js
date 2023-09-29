import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, SafeAreaView, Dimensions, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import Modal from 'react-native-modal';
import { globalStyles } from '../styles/global';

export default function SettingsModal({ isVisible, onClose }) {
    return (
      <Modal isVisible={isVisible} onBackdropPress={onClose} backdropOpacity={0.5}>
        <View style={globalStyles.modalContainer}>
          <TouchableOpacity onPress={onClose} style={globalStyles.closeButton}>
            <Ionicons name="ios-close-circle" size={36} color="black" />
          </TouchableOpacity>
          <Text>Settings Page</Text>
        </View>
      </Modal>
    );
  }