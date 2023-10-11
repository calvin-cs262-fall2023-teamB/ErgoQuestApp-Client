import React, { useEffect, useReducer, useRef } from 'react';
import { FlatList, Text, View } from 'react-native';
import { BleManager } from 'react-native-ble-plx';

let initialState = {
  isScanning: false,
  scanDone: false,
  bleReady: false,
  items: [],
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'setBLEReady':
      return { ...state, bleReady: true };
    case 'setBLEScan':
      return { ...state, isScanning: action.payload };
    case 'addItem':
      let items = state.items;

      if (items.findIndex((x) => x.id == action.payload.id) == -1) {
        items.push(action.payload);
      }

      return { ...state, items: items };
    case 'stopScan':
      return { ...state, isScanning: false, scanDone: true };
    case 'reset':
      return {
        ...state,
        items: [],
        bleReady: true,
        isScanning: false,
        scanDone: false,
      };
    default:
      return state;
  }
};

const manager = new BleManager();

export default function BLEScanner({onClose}) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const stopBLEScan = () => {
    manager.stopDeviceScan();
    dispatch({ type: 'stopScan' });
  };

  const timerRef = useRef(null);

  const scanAndConnect = () => {
    manager.startDeviceScan(null, null, (error, device) => {
      dispatch({ type: 'setBLEScan', payload: true });
      if (error) {
        // Handle error (scanning will be stopped automatically)
        return;
      }

      dispatch({ type: 'addItem', payload: device });
    });
  };

  // Cleanup function to clear the list when the component is unmounted
  useEffect(() => {
    return () => {
      stopBLEScan();
      dispatch({ type: 'reset' }); // Clear the list of devices
    };
  }, [onClose]);

  useEffect(() => {
    if (state.bleReady && !state.isScanning && !state.scanDone) {
      scanAndConnect();
    }

    if (!timerRef.current && state.isScanning && !state.scanDone) {
      // Start a timer to stop scanning after 2 seconds
      timerRef.current = setTimeout(() => {
        stopBLEScan();
      }, 500);
    } else if (!state.isScanning && state.scanDone) {
      // Clear the timer when scanning is stopped or done
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, [state]);

  useEffect(() => {
    const subscription = manager.onStateChange((state) => {
      if (state === 'PoweredOn') {
        dispatch({ type: 'setBLEReady' });
        subscription.remove();
      }
    }, true);
    return () => subscription.remove();
  }, [manager]);

  const renderItem = ({ item, index }) => {
    // Limit the rendering to the first 10 items
    if (index < 10) {
      return (
        <View>
          <Text>{item.name || 'No name found'}</Text>
          <Text>{item.id}</Text>
        </View>
      );
    }
    return null; // Return null for items beyond the first 10
  };

  return (
    <View>
      <Text>Available BLE devices in your area</Text>
      <FlatList
        refreshing={state.isScanning}
        onRefresh={() => dispatch({ type: 'reset' })}
        renderItem={renderItem}
        data={state.items}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
  }