import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(false);

    const goHomeScreen = () => {
        //setIsSettingsVisible(false); // Close the modal
        navigation.navigate('Home'); // Navigate
    };

    const goAccountScreen = () => {
        navigation.navigate('CreateAccount');
    }

    const handleLogin = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('https://ergoquestapp.azurewebsites.net/users');
            const users = await response.json();

            if (response.ok) {
                // set up hash
                // refer to https://stackoverflow.com/a/77581985/21640094 to solve known issue
                const bcrypt = require('bcryptjs');
                bcrypt.setRandomFallback((len) => {
                    let buffer = new Array(len);
                    for (let i = 0; i < len; i++){
                        buffer[i] = Math.floor(Math.random() * 256)
                    }
                    return buffer;
                });
                const user = users.find(u => u.email === email && (bcrypt.compareSync(password, u.password) || password === u.password));
                if (user) {
                    // User found, handle successful login
                    console.log('Login successful for user:', user);
                    // Navigate to the home screen or perform other actions
                    // navigation.navigate('Settings', {userData: user});
                    global.userData = user;
                    navigation.navigate('Settings');
                } else {
                    // User not found
                    Alert.alert('Login Failed', 'User not found or wrong credentials.');
                }
            } else {
                // Error fetching users
                Alert.alert('Error', 'Unable to fetch user data.');
            }
        } catch (error) {
            console.error('Network error:', error);
            Alert.alert('Network Error', 'Unable to connect to the server.');
        }
        setIsLoading(false);
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={isLoading}>
                {isLoading ? (
                    <ActivityIndicator size="small" color="#fff" /> // Show loading indicator
                ) : (
                    <Text style={styles.buttonText}>Login</Text>
                )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={goAccountScreen}>
                <Text style={styles.buttonText}>Create Account</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={goHomeScreen}>
                <Text style={styles.buttonText}>Back To Home</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 10,
        fontSize: 18,
        borderRadius: 6,
        marginBottom: 10,
    },
    button: {
        backgroundColor: '#43B2D1',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
        width: '100%',
    },
    buttonText: {
        fontSize: 20,
        color: '#fff',
    },
});

export default LoginScreen;