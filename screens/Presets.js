import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, SafeAreaView, Dimensions, StyleSheet, Pressable, FlatList, Button } from 'react-native';
import { NavigationContainer, TabActions, TabRouter, NavigationAction, DefaultNavigatorOptions } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import Modal from 'react-native-modal';
import { globalStyles } from '../styles/global';
import { TextInput } from 'react-native-gesture-handler';
import Dialog from "react-native-dialog";
import AsyncStorage from '@react-native-async-storage/async-storage';

/*
For using values and functions from other screens:
https://stackoverflow.com/questions/43953791/calling-functions-from-other-components-in-react-native 
or 
https://react.dev/reference/react/createContext -NO: cannot produce and consume in same component
*/

export default function PresetsScreen( { props, navigation } ) {
    // hooks
    const [renameVisible, setRenameVisible] = useState(false);
    const [createVisible, setCreateVisible] = useState(false);
    const [deleteVisible, setDeleteVisible] = useState(false);
    const [createOptionsVisible, setCreateOptionsVisible] = useState(false);
    const [selectedID, setSelectedID] = useState(-1);

    // Extra Variables
    let tempName;

    // functions
    const onPressFunction = () => {
        // console.log('Create Preset Button Tapped');
        setCreateVisible(createVisible?false:true);
    };

    const onLongPressFunction = () => {
        // console.log('Create Preset Button Held');
        setCreateOptionsVisible(createOptionsVisible?false:true);
    };

    const activate = async (id) => {
        console.log('Activate ID: ', id);
        for (let i = 0; i < global.presets.length; i++){
            if (global.presets[i].id === id){
                console.log("Set actuator values to:", global.presets[i].actuatorValues);
                // DO NOT USE: global.moves = global.presets[i].actuatorValues; // Copies reference not value. Need deep copy.
                const moveArray = [];
                for (let j = 0; j < global.presets[i].actuatorValues.length; j ++) {
                    moveArray.push({
                        "id": global.presets[i].actuatorValues[j].id,
                        "name": global.presets[i].actuatorValues[j].name,
                        "percent": global.presets[i].actuatorValues[j].percent,
                    })
                }
                global.moves = moveArray;
                return;
            }
        }
        console.log("ERROR, ID not found in preset array");
    };

    const startRename = (id) => {
        // console.log('Rename Preset with ID =', id);
        setSelectedID(id);
        setRenameVisible(renameVisible?false:true);
    }

    const startDelete = (id) => {
        // console.log('Delete Preset with ID =', id);
        setSelectedID(id);
        setDeleteVisible(deleteVisible?false:true);
    };

    const handleCancel = () => {
        // console.log("Close Dialogs");
        tempName = "";
        setRenameVisible(false);
        setCreateVisible(false);
        setDeleteVisible(false);
        setCreateOptionsVisible(false);
    };
  
    const renamePreset = async () => {
        if (selectedID === undefined) {
            console.log("ID is undefined.", selectedID);
            setRenameVisible(false);
        } else {
            // console.log("Rename preset to: " + tempName);
            let newPresets = [];
            for (let i = 0; i < global.presets.length; i++){
                if (global.presets[i].id === selectedID) {
                    if (tempName === undefined || tempName === ""){
                        tempName = "Preset " + global.presets[i].id;
                    }
                    newPresets.push({id: global.presets[i].id, name: tempName, actuatorValues: global.presets[i].actuatorValues})
                } else {
                    newPresets.push(global.presets[i]);
                }
            }
            global.presets = newPresets;
            tempName = undefined;
            setSelectedID(undefined);
            setRenameVisible(false);
        }
    };

    const createPreset = async () => {
        let largestIndex = 0;
        for (let i = 0; i < global.presets.length; i++) {
            if (global.presets[i].id > largestIndex) {
                largestIndex = global.presets[i].id;
            }
        }
        const newID = largestIndex + 1;
        if (tempName === "" || tempName == undefined){
            tempName = "Preset " + newID + "";
        }
        // console.log("Create preset: " + tempName);
        let newPresets = [];
        for (let i = 0; i < global.presets.length; i++){
            newPresets.push(global.presets[i]);
        }
        // TODO: get actuatorValues from move screen
        newPresets.push({
            name: tempName,
            id: newID,
            actuatorValues: global.moves,
        });
        // newPresets[newPresets.length - 1].actuatorValues.push({id: 1, position: 25}); // 2 ways of saving presets available
        global.presets = newPresets;
        tempName = undefined;
        setCreateVisible(false);
        setCreateOptionsVisible(false); // just in case
    };

    const deletePreset = async () => {
        if (selectedID === undefined) {
            console.log("ID is undefined.", selectedID);
            setDeleteVisible(false);
        } else {
            let newPresets = [];
            for (let i = 0; i < global.presets.length; i++){
                if (global.presets[i].id !== selectedID) {
                    newPresets.push(global.presets[i]);
                }
            }
            global.presets = newPresets;
            setSelectedID(undefined);
            setDeleteVisible(false);
        }
    };

    const goToMove = () => {
        // console.log("attempting tab switch");
        setCreateOptionsVisible(false);
        navigation.navigate('Move');

    };

    // display
    return(
        <View style={styles.container}>
            {/* Presets listed */}
            <FlatList scrollEnabled={true} style={ styles.pageArea } data={global.presets} renderItem={({ item })=> (
                <View style={[ styles.preset ]}>
                    <Pressable 
                        onPress={() => activate( item.id )}
                        onLongPress={() => startRename( item.id )}
                        style={[ styles.presetButton, styles.presetButtonLeft ]}
                        >
                        <Text style={[ styles.presetButtonText ] } >{ item.name }</Text>
                    </Pressable>
                    <Pressable 
                        onPress={() => startRename( item.id )}
                        onLongPress={() => startDelete( item.id )}
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
            {/* Dialogs */}
            <View style={globalStyles.container}>
                {/* RENAME */}
                <Dialog.Container visible={renameVisible}>
                    <Dialog.Title>Rename Preset?</Dialog.Title>
                    <Dialog.Description>
                        Please enter a new name for your preset.
                    </Dialog.Description>
                    <Dialog.Input onChangeText={(text) => (tempName = text) } />
                    <Dialog.Button label="Cancel" onPress={handleCancel} />
                    <Dialog.Button label="Confirm" onPress={renamePreset} />
                </Dialog.Container>
                {/* CREATE PRESET */}
                <Dialog.Container visible={createVisible}>
                    <Dialog.Title>Create Preset?</Dialog.Title>
                    <Dialog.Description>
                        Enter a name for the preset to save the current actuator values.
                    </Dialog.Description>
                    <Dialog.Input onChangeText={(text) => (tempName = text) } />
                    <Dialog.Button label="Cancel" onPress={handleCancel} />
                    <Dialog.Button label="Create" onPress={createPreset} />
                </Dialog.Container>
                {/* DELETE PRESET */}
                <Dialog.Container visible={deleteVisible}>
                    <Dialog.Title>Delete Preset?</Dialog.Title>
                    <Dialog.Description>
                        Are you sure you want to delete this preset? This action is permanent.
                    </Dialog.Description>
                    <Dialog.Button label="Cancel" onPress={handleCancel} />
                    <Dialog.Button label="DELETE" onPress={deletePreset} style={{color: '#f00'}} />
                </Dialog.Container>
                {/* CREATE OPTIONS */}
                <Dialog.Container visible={createOptionsVisible} verticalButtons={true}>
                    <Dialog.Title>Create Preset:</Dialog.Title>
                    <Dialog.Description>
                        Save current actuator values as a new preset?
                    </Dialog.Description>
                    <Dialog.Description>
                        Preset name (optional):
                    </Dialog.Description>
                    <Dialog.Input onChangeText={(text) => (tempName = text) } />
                    <Dialog.Button label="Create New Preset" onPress={createPreset} />
                    <Dialog.Button label="Adjust Actuator Values" onPress={goToMove} />
                    <Dialog.Button label="Cancel" onPress={handleCancel} />
                </Dialog.Container>
            </View>         
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#43B2D1',
        justifyContent: 'center',
        alignItems: 'center',
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
        height: 75,
        marginBottom: "1%",
        marginLeft: "1%",
        marginRight: "1%",
        borderStyle: "solid",
        borderColor: "#000000",
        borderWidth: "2",
        flexDirection: "row",
        justifyContent: "flex-start",
        backgroundColor: "#ffffff",
        scrollEnabled: true,
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
        fontSize: 24,
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
        fontSize: 24,
        padding: "5%",
        width: "100%",
        height: "100%",
    },
  });
