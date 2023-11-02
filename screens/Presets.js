import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, SafeAreaView, Dimensions, StyleSheet, Pressable, FlatList, Button } from 'react-native';
import { NavigationContainer, TabActions, TabRouter, NavigationAction, DefaultNavigatorOptions } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import Modal from 'react-native-modal';
import { globalStyles } from '../styles/global';
import { TextInput } from 'react-native-gesture-handler';
import Dialog from "react-native-dialog";

export default function PresetsScreen( { navigation } ) {
    // hooks
    const [renameVisible, setRenameVisible] = useState(false);
    const [createVisible, setCreateVisible] = useState(false);
    const [deleteVisible, setDeleteVisible] = useState(false);
    const [createOptionsVisible, setCreateOptionsVisible] = useState(false);
    const [selectedID, setSelectedID] = useState(-1);

    /* Presets and values */
    const [presets, setPresets] = useState([
        { name: "Preset 1", id: 1,
            actuatorValues: [{id: 0, position: 0}, {id: 1, position: 100}]},
        { name: "Preset 2", id: 2,
            actuatorValues: [{id: 0, position: 50}, {id: 1, position: 50}]},
        ]);

    // Extra Variables
    let tempName;

    // functions
    const onPressFunction = () => {
        console.log('Create Preset Button Tapped');
        setCreateVisible(createVisible?false:true);
    };

    const onLongPressFunction = () => {
        console.log('Create Preset Button Held');
        setCreateOptionsVisible(createOptionsVisible?false:true);
    };

    const activate = (id) => {
        console.log('Activate ID: ', id);
        for (let i = 0; i < presets.length; i++){
            if (presets[i].id === id){
                console.log("Set actuator values to: ");
                console.log(presets[i].actuatorValues);
                return;
            }
        }
        console.log("ERROR, ID not found in preset array");
    };

    const startRename = (id) => {
        console.log('Rename Preset with ID =', id);
        setSelectedID(id);
        setRenameVisible(renameVisible?false:true);
    }

    const startDelete = (id) => {
        console.log('Delete Preset with ID =', id);
        setSelectedID(id);
        setDeleteVisible(deleteVisible?false:true);
    };

    const handleCancel = () => {
        console.log("Close Dialogs");
        tempName = "";
        setRenameVisible(false);
        setCreateVisible(false);
        setDeleteVisible(false);
        setCreateOptionsVisible(false);
    };
  
    const renamePreset = () => {
        if (selectedID === undefined) {
            console.log("ID is undefined.", selectedID);
            setRenameVisible(false);
        } else {
            console.log("Rename preset to: " + tempName);
            let newPresets = [];
            for (let i = 0; i < presets.length; i++){
                if (presets[i].id === selectedID) {
                    if (tempName === undefined || tempName === ""){
                        tempName = "Preset " + presets[i].id;
                    }
                    newPresets.push({id: presets[i].id, name: tempName, actuatorValues: presets[i].actuatorValues})
                } else {
                    newPresets.push(presets[i]);
                }
            }
            setPresets(newPresets);
            tempName = undefined;
            setSelectedID(undefined);
            setRenameVisible(false);
        }
    };

    const createPreset = () => {
        let largestIndex = 0;
        for (let i = 0; i < presets.length; i++) {
            if (presets[i].id > largestIndex) {
                largestIndex = presets[i].id;
            }
        }
        const newID = largestIndex + 1;
        if (tempName === "" || tempName == undefined){
            tempName = "Preset " + newID + "";
        }
        console.log("Create preset: " + tempName);
        let newPresets = [];
        for (let i = 0; i < presets.length; i++){
            newPresets.push(presets[i]);
        }
        // TODO: get actuatorValues from move screen
        newPresets.push({
            name: tempName,
            id: newID,
            actuatorValues: [{id: 0, position: 50}],
        });
        newPresets[newPresets.length - 1].actuatorValues.push({id: 1, position: 25}); // 2 ways of saving presets available
        setPresets(newPresets);
        tempName = undefined;
        setCreateVisible(false);
        setCreateOptionsVisible(false); // just in case
    };

    const deletePreset = () => {
        if (selectedID === undefined) {
            console.log("ID is undefined.", selectedID);
            setDeleteVisible(false);
        } else {
            let newPresets = [];
            for (let i = 0; i < presets.length; i++){
                if (presets[i].id !== selectedID) {
                    newPresets.push(presets[i]);
                }
            }
            setPresets(newPresets);
            setSelectedID(undefined);
            setDeleteVisible(false);
        }
    };

    const goToMove = () => {
        console.log("attempting tab switch");
        setCreateOptionsVisible(false);
        navigation.navigate('Move');

    };

    // display
    return(
        <View style={styles.container}>
            {/* Presets listed */}
            <FlatList scrollEnabled={true} style={ styles.pageArea } data={presets} renderItem={({ item })=> (
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
