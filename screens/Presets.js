import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, SafeAreaView, Dimensions, StyleSheet, Pressable, FlatList } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import Modal from 'react-native-modal';
import { globalStyles } from '../styles/global';

export default function PresetsScreen() {
    // functions
    const onPressFunction = () => {
        console.log('Create Preset Button Tapped');
    };

    const onLongPressFunction = () => {
        console.log('Create Preset Button Held');
    };

    const activate = (id) => {
        console.log('Activate ID: ', id);
    };

    const options = (id) => {
        console.log('Options for ID: ', id);
    };

    /* Hardcode a "database"/list of movies. */
    const [presets] = useState([
        { name: "Preset 1", id: '1',
            actuatorValues: "Need values and how they will be stored"},
        { name: "Preset 2", id: '2',
            actuatorValues: "same as above"},
        ]);

    // display
    return(
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>

            {/* Presets listed */}
            <FlatList style={ styles.pageArea } data={presets} renderItem={({ item })=> (
                <View style={[ styles.preset ]}>
                    <Pressable 
                        onPress={() => activate( item.id )}
                        onLongPress={() => options( item.id )}
                        style={[ styles.presetButton, styles.presetButtonLeft ]}
                        >
                        <Text style={[ styles.presetButtonText ] } >{ item.name }</Text>
                    </Pressable>
                    <Pressable 
                        onPress={() => options( item.id )}
                        style={[ styles.presetButton, styles.presetButtonRight ]}
                        >
                        <Text style={[ styles.presetButtonText ] } > ••• </Text>
                    </Pressable>
                </View>
              )} >
            </FlatList>

            {/* "Add Preset" button at bottom of screen */}
            <View style={[ styles.pageArea, styles.pageBottom ]}>
                <Pressable
                    onPress={onPressFunction}
                    onLongPress={onLongPressFunction}
                    style={ styles.addButton }
                    >
                    {({ pressed }) => (
                        <Text style={[styles.buttonText, { backgroundColor: pressed ? 'lightgray' : 'white' }]}>
                            Create New Preset
                        </Text>
                    )}
                </Pressable>
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    // for area at the bottom of the screen
    pageArea: {
        width: "98%",
        marginBottom: "1%",
        marginLeft: "1%",
        marginRight: "1%",
    },
    preset: {
        width: "98%",
        height: "90%",
        marginBottom: "1%",
        marginLeft: "1%",
        marginRight: "1%",
        borderStyle: "solid",
        borderColor: "#000000",
        borderWidth: "2",
        flexDirection: "row",
        justifyContent: "flex-start",
        backgroundColor: "#88ccff",
    },
    presetButton: {
        flex: 1,
    },
    presetButtonLeft: {
        flexBasis: "80%",
    },
    presetButtonRight: {
        flexBasis: "20%",
        borderStyle: "solid",
        borderColor: "#222222",
        borderLeftWidth: "2",
    },
    presetButtonText: {
        textAlign: "center",
        justifyContent: "center",
        fontSize: "24",
        padding: "2%",
    },
    pageBottom: {
        height: "10%",
    },
    addButton: {
        width: "100%",
        height: "100%",
    },
    buttonText: {
        alignContent: "center",
        textAlign: "center",
        justifyContent: "center",
        fontSize: "24",
        padding: "5%",
        width: "100%",
        height: "100%",
    },
  });