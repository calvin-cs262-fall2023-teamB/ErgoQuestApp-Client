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
      setText(`
The MOVE page is used to directly control the positions of the actuators on your chair. An actuator is a motor that moves a part of your chair

The number of actuators that your chair has can be set in settings. Your ErgoQuest chair will typically have 2-4 actuators. They will control things like the legrest, back, or table height. All of your actuators are displayed on the move page.
      
Each actuator has a name and a position.

The name can be changed by tapping the name text or by tapping the options button (the vertical elipses) in the top right of the actuator box.

The positions can be changed by tapping and holding the ‘-’ and ‘+’ buttons, or by tapping the percent in the top left of the actuator box and entering a value.
      `);
    } else if (global.help === "Presets") {
      setText(`
The PRESETS page is used to create preset positions for your ErgoQuest chair. This works by saving the positions of each of the actuators on your chair.

Tap the ADD PRESET button at the bottom of the screen to add a preset. This will save the current position of your chair as a preset. A dialog box will open with the following options.

You can name the preset by typing in a name. This is optional.

Confirm the creation of the preset by tapping CREATE NEW PRESET.

If your chair isn’t in the right position, tap ADJUST ACTUATOR VALUES to go back to the MOVE page.

If you no longer want to create this preset, tap CANCEL.

Tapping the ellipsis (...) on the preset box will open options for that preset. It will give you the following options.

RENAME PRESET will allow you to change the name of the preset.

UPDATE ACTUATORS will send you to the MOVE page to change the actuator positions. 

When you return to the PRESETS page, you can press SAVE POSITION at the bottom of the screen to save that new position to the preset you were editing.

DELETE will remove the preset.

CANCEL will close the options dialog box.
      `);
    } else if (global.help === "Timed") {
      setText(`
The TIMED page is used to move the position of your ErgoQuest chair to different presets after a set amount of minutes. This works by adding moves which the chair will move to when the PLAY button is pressed.

When you open the app for the first time, there won’t be any moves. Tap the ADD NEW MOVE button at the left side of the screen to add a move once you have set the picker. The left picker allows you to pick a preset from the list of presets on the Presets. The right picker allows you to pick the amount of time in minutes in multiples of 5.
      
Pressing the PLAY button will start the playlist of moves starting with the first move.
      
The PLAY button will then turn into a PAUSE button. Pressing the PAUSE button stops the countdown until the PLAY button is pressed again.
      
The current move is highlighted in yellow which displays which preset is currently running.
      
The STOP button stops the playlist and brings the current move to the top.
      
The EDIT button allows a specific move to be edited. 
      
The up and down arrows move a specific move one above or one move below. 
      
The picker allows you to change the minutes a move lasts.
      
The DELETE button deletes a move entirely.
      
The SAVE button saves any changes made while editing.
      
The CLOSE button closes the edit page if no changes are being saved.
      
      `);
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