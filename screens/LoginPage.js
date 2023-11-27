import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigation = useNavigation();

    const goHomeScreen = () => {
        //setIsSettingsVisible(false); // Close the modal
        navigation.navigate('Home'); // Navigate
    };
    
    const goAccountScreen = () => {
        navigation.navigate('CreateAccount');
    }

    const handleLogin = async () => {
        try {
            const response = await fetch('https://ergoquestapp.azurewebsites.net/users');
            const users = await response.json();

            if (response.ok) {
                const user = users.find(u => u.email === email && u.password === password);
                if (user) {
                    // User found, handle successful login
                    console.log('Login successful for user:', user);
                    // Navigate to the home screen or perform other actions
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
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Login</Text>
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