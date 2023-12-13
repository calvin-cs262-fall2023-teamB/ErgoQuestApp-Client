import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Dialog from "react-native-dialog";
import Ionicons from 'react-native-vector-icons/Ionicons';

import { globalStyles } from '../styles/global';

/*
For using values and functions from other screens:
https://stackoverflow.com/questions/43953791/calling-functions-from-other-components-in-react-native 
or 
https://react.dev/reference/react/createContext -NO: cannot produce and consume in same component
*/

export default function PresetsScreen({ navigation }) {
    // hooks
    const [presets, setPresets] = useState([]); // for screen refresh purposes only
    const [renameVisible, setRenameVisible] = useState(false);
    const [createVisible, setCreateVisible] = useState(false);
    const [deleteVisible, setDeleteVisible] = useState(false);
    const [presetOptionsVisible, setPresetOptionsVisible] = useState(false);
    const [createOptionsVisible, setCreateOptionsVisible] = useState(false);
    const [selectedID, setSelectedID] = useState(-1);
    const [updating, setUpdating] = useState(-1);

    // Extra Variables
    let tempName;

    // screen refresh
    useFocusEffect(() => {
        global.help = "Presets";
        setPresets(global.presets);
        return () => {
            setPresets(global.presets);
        }
    });

    // functions

    const onCreateLongPress = () => {
        // console.log('Create Preset Button Held');
        setCreateOptionsVisible(createOptionsVisible ? false : true);
    };

    const activate = (id) => {
        setUpdating(-1);
        console.log('Activate ID: ', id);
        for (let i = 0; i < global.presets.length; i++) {
            if (global.presets[i].id === id) {
                console.log("Set actuator values to:", global.presets[i].actuatorValues);
                // DO NOT USE: global.moves = global.presets[i].actuatorValues; // Copies reference not value. Need deep copy.
                const moveArray = [];
                for (let j = 0; j < global.presets[i].actuatorValues.length; j++) {
                    moveArray.push({
                        "id": global.presets[i].actuatorValues[j].id,
                        "name": global.presets[i].actuatorValues[j].name,
                        "percent": global.presets[i].actuatorValues[j].percent,
                    })
                }
                global.moves = moveArray;
                // highlight active?
                return;
            }
        }
        console.log("ERROR, ID not found in preset array");
    };

    const startRename = (id) => {
        // console.log('Rename Preset with ID =', id);
        setSelectedID(id);
        global.selectedPresetId = id;
        setRenameVisible(renameVisible ? false : true);
    };

    const openPresetOptions = (id) => {
        // console.log('Delete Preset with ID =', id);
        setSelectedID(id);
        global.selectedPresetId = id;
        setPresetOptionsVisible(presetOptionsVisible ? false : true);
    };

    const handleCancel = () => {
        // console.log("Close Dialogs");
        tempName = "";
        setRenameVisible(false);
        setCreateVisible(false);
        setDeleteVisible(false);
        setCreateOptionsVisible(false);
        setPresetOptionsVisible(false);
    };

    const renamePreset = () => {
        if (selectedID === undefined) {
            console.log("ID is undefined.", selectedID);
            setRenameVisible(false);
        } else {
            // console.log("Rename preset to: " + tempName);
            let newPresets = [];
            for (let i = 0; i < global.presets.length; i++) {
                if (global.presets[i].id === selectedID) {
                    if (tempName === undefined || tempName === "") {
                        tempName = "Preset " + global.presets[i].id;
                    }
                    newPresets.push({ id: global.presets[i].id, name: tempName, actuatorValues: global.presets[i].actuatorValues })
                } else {
                    newPresets.push(global.presets[i]);
                }
            }
            global.presets = newPresets;
            tempName = undefined;
            setSelectedID(undefined);
            setRenameVisible(false);
            setPresetOptionsVisible(false);
        }
    };

    const createPreset = async () => {
        let largestIndex = 1;
        let newID;

        if(global.presets.length != 0) {
            for (let i = 0; i < global.presets.length; i++) {
                if (global.presets[i].id > largestIndex) {
                    largestIndex = global.presets[i].id;
                }
            }
            newID = largestIndex + 1;
        } else {
            newID = 1;
        }

        //console.log(newID);

        if (tempName === "" || tempName == undefined) {
            tempName = "Preset " + newID + "";
        }

        if (global.userData && global.userData.id) {
            const newPresetData = {
                name: tempName,
                userId: global.userData.id
            };

            try {
                const newPreset = await savePresetToDatabase(newPresetData);
                if (newPreset && newPreset.id) {
                    global.presets.push({
                        id: newPreset.id, // Spread the newPreset object
                        name: tempName,
                        actuatorValues: global.moves,
                    });
                    //console.log(global.moves);
                    //console.log(global.presets);
                    global.selectedPresetId = newPreset.id;
                } else {
                    throw new Error("Failed to create new preset");
                }
            } catch (error) {
                console.error("Error creating preset:", error);
                // Handle the error, maybe alert the user
                return;
            }
        } else {
            // console.log("Create preset: " + tempName);
            let newPresets = [];
            for (let i = 0; i < global.presets.length; i++) {
                newPresets.push(global.presets[i]);
            }
            // TODO: get actuatorValues from move screen
            newPresets.push({
                name: tempName,
                id: newID,
                actuatorValues: global.moves,
            });
            global.presets = newPresets;
        }
        console.log("Selected Preset ID: ", global.selectedPresetId);
        // newPresets[newPresets.length - 1].actuatorValues.push({id: 1, position: 25}); // 2 ways of saving presets available
        tempName = undefined;
        setCreateVisible(false);
        setCreateOptionsVisible(false); // just in case
    };

    const savePresetToDatabase = async (data) => {
        try {
            const response = await fetch('https://ergoquestapp.azurewebsites.net/presets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: data.name,
                    DBUserID: data.userId
                }),
            });
    
            if (!response.ok) {
                const errorResponse = await response.text();
                throw new Error(`HTTP Error: ${response.status} - ${errorResponse}`);
            }
    
            const responseData = await response.json();
            console.log("Response from savePresetToDatabase:", responseData);
            return responseData;
        } catch (error) {
            console.error('Error saving preset to database:', error);
            // Further error handling or user notification
        }
    };
    

    const deletePreset = () => {
        if (selectedID === undefined) {
            console.log("ID is undefined.", selectedID);
            setDeleteVisible(false);
            setPresetOptionsVisible(false);
        } else {
            let newPresets = [];
            for (let i = 0; i < global.presets.length; i++) {
                if (global.presets[i].id !== selectedID) {
                    newPresets.push(global.presets[i]);
                }
            }
            global.presets = newPresets;
            // remove deleted preset from timed cuelist
            const newTimes = [];
            for (let i = 0; i < global.times.length; i++) {
                if (global.times[i].presetID !== selectedID) {
                    newTimes.push(global.times[i]);
                }
            }
            global.times = newTimes;
            setSelectedID(undefined);
            setDeleteVisible(false);
            setPresetOptionsVisible(false);
        }
    };

    const updateActuators = () => {
        const id = selectedID;
        global.selectedPresetId = id;
        console.log('Activate ID: ', id);
        for (let i = 0; i < global.presets.length; i++) {
            if (global.presets[i].id === id) {
                console.log("Set actuator values to:", global.presets[i].actuatorValues);
                const moveArray = [];
                for (let j = 0; j < global.presets[i].actuatorValues.length; j++) {
                    moveArray.push({
                        "id": global.presets[i].actuatorValues[j].id,
                        "name": global.presets[i].actuatorValues[j].name,
                        "percent": global.presets[i].actuatorValues[j].percent,
                    })
                }
                global.moves = moveArray;
                setUpdating(i);
                setPresetOptionsVisible(false);
                goToMove();
                return;
            }
        }
        console.log("ERROR, ID not found in preset array");
    }

    const finishUpdating = () => {
        global.presets[updating].actuatorValues = JSON.parse(JSON.stringify(global.moves)); // deep copy
        alert("Success, " + global.presets[updating].name + " updated!");
        setUpdating(-1);
    }

    const goToMove = () => {
        // console.log("attempting tab switch");
        setCreateOptionsVisible(false);
        navigation.navigate('Move');

    };

    // display
    return (
        <View style={styles.container}>
            {/* Presets listed */}
            <FlatList
                scrollEnabled={true}
                contentContainerStyle={{ paddingBottom: 20 }} // Adds padding at the bottom of the list
                style={styles.pageArea}
                data={global.presets}
                extraData={presets} // to help screen refresh when changes made in Move screen
                renderItem={({ item }) => (
                    <View style={[styles.preset]}>
                        <TouchableOpacity
                            onPress={() => activate(item.id)}
                            onLongPress={() => startRename(item.id)}
                            style={[styles.presetButton, styles.presetButtonLeft]}
                        >
                            <Text style={[styles.presetButtonText]}>{item.name}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => openPresetOptions(item.id)}
                            onLongPress={() => openPresetOptions(item.id)}
                            style={[styles.presetButton, styles.presetButtonRight]}
                        >
                            <View style={styles.iconWrapper}>
                                <Ionicons name="ellipsis-horizontal" size={24} color="black" />
                            </View>
                        </TouchableOpacity>
                    </View>
                )} >
            </FlatList>

            {/* "Add Preset" button at bottom of screen */}
            <View style={[styles.pageArea, styles.pageBottom]}>
                <Pressable
                    onPress={onCreateLongPress}
                    onLongPress={onCreateLongPress}
                    style={({ pressed }) => [
                        styles.addButton,
                        {
                            backgroundColor: pressed ? 'lightgray' : 'white',
                            borderRadius: 15,
                        },
                        (updating >= 0) ? styles.hide : styles.show
                    ]}
                >
                    <Text style={styles.buttonText}>
                        Create New Preset
                    </Text>
                </Pressable>
                {/* Update preset */}
                <Pressable
                    onPress={finishUpdating}
                    style={({ pressed }) => [
                        styles.addButton,
                        {
                            backgroundColor: pressed ? 'lightgray' : 'white',
                            borderRadius: 15,
                        },
                        (updating < 0) ? styles.hide : styles.show
                    ]}
                >
                    <Text style={styles.buttonText}>
                        Save over {updating >= 0 ? global.presets[updating].name : "Selected Preset"}?
                    </Text>
                </Pressable>
            </View>
            {/* Dialogs */}
            <View style={globalStyles.container}>
                {/* RENAME */}
                <Dialog.Container visible={renameVisible} onBackdropPress={handleCancel}>
                    <Dialog.Title>Rename Preset?</Dialog.Title>
                    <Dialog.Description>
                        Please enter a new name for your preset.
                    </Dialog.Description>
                    <Dialog.Input onChangeText={(text) => (tempName = text)} />
                    <Dialog.Button label="Cancel" onPress={handleCancel} />
                    <Dialog.Button label="Confirm" onPress={renamePreset} />
                </Dialog.Container>
                {/* CREATE PRESET */}
                <Dialog.Container visible={createVisible} setVisible={setCreateVisible} onBackdropPress={handleCancel}>
                    <Dialog.Title>Create Preset?</Dialog.Title>
                    <Dialog.Description>
                        Enter a name for the preset to save the current actuator values.
                    </Dialog.Description>
                    <Dialog.Input onChangeText={(text) => (tempName = text)} />
                    <Dialog.Button label="Cancel" onPress={handleCancel} />
                    <Dialog.Button label="Create" onPress={createPreset} />
                </Dialog.Container>
                {/* DELETE PRESET */}
                <Dialog.Container visible={deleteVisible} onBackdropPress={handleCancel}>
                    <Dialog.Title>Delete Preset?</Dialog.Title>
                    <Dialog.Description>
                        Are you sure you want to delete this preset? This action is permanent.
                    </Dialog.Description>
                    <Dialog.Button label="Cancel" onPress={handleCancel} />
                    <Dialog.Button label="DELETE" onPress={deletePreset} style={{ color: '#f00' }} />
                </Dialog.Container>
                {/* CREATE OPTIONS */}
                <Dialog.Container visible={createOptionsVisible} verticalButtons={true} onBackdropPress={handleCancel}>
                    <Dialog.Title>Create Preset:</Dialog.Title>
                    <Dialog.Description>
                        Save current actuator values as a new preset?
                    </Dialog.Description>
                    <Dialog.Description>
                        Preset name (optional):
                    </Dialog.Description>
                    <Dialog.Input onChangeText={(text) => (tempName = text)} />
                    <Dialog.Button label="Create New Preset" onPress={createPreset} />
                    <Dialog.Button label="Adjust Actuator Values" onPress={goToMove} />
                    <Dialog.Button label="Cancel" onPress={handleCancel} />
                </Dialog.Container>
                {/* PRESET OPTION */}
                <Dialog.Container visible={presetOptionsVisible} verticalButtons={true} onBackdropPress={handleCancel}>
                    <Dialog.Title>Preset Options</Dialog.Title>
                    <Dialog.Description>
                        Rename preset, Update actuators on move screen, or Delete?
                    </Dialog.Description>
                    <Dialog.Button label="Rename Preset" onPress={renamePreset} />
                    <Dialog.Input onChangeText={(text) => (tempName = text)} />
                    <Dialog.Button label="Update actuators" onPress={updateActuators} />
                    <Dialog.Button label="DELETE" onPress={deletePreset} style={{ color: '#f00' }} />
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
        width: "88%",
        marginBottom: 25, // Adjust this value to increase the space at the bottom
        marginLeft: "1%",
        marginRight: "1%",
        borderRadius: 10,
        marginTop: "8%"
    },
    preset: {
        width: "98%",
        height: 75,
        marginBottom: "2%",
        marginLeft: "1%",
        marginRight: "1%",
        borderStyle: "solid",
        borderColor: "#FFFFFF",
        borderWidth: "2",
        borderRadius: 15, // old: 10
        flexDirection: "row",
        justifyContent: "flex-start",
        backgroundColor: "#ffffff",
        scrollEnabled: true
    },
    presetButton: {
        flex: 1,
    },
    presetButtonLeft: {
        flexBasis: "80%",
        alignItems: 'center',
        justifyContent: 'center',
    },
    presetButtonRight: {
        flexBasis: "20%",
        borderStyle: "solid",
        alignItems: 'center',
        justifyContent: 'center',
        borderLeftWidth: 10,
        borderColor: "#FFFFFF"
    },
    presetButtonText: {
        textAlign: "center",
        justifyContent: "center",
        fontSize: 24,
        padding: "2%",
        textAlignVertical: 'center',
    },
    pageBottom: {
        height: "10%",
    },
    addButton: {
        width: "100%",
        height: 70,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
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
    hide: {
        display: "none",
    },

    iconWrapper: {
        width: 40, // Width of the circle
        height: 40, // Height of the circle
        borderRadius: 50, // Half of the width/height  (Not half anymore)
        borderWidth: 2, // Width of the border
        borderColor: 'black', // Border color
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
