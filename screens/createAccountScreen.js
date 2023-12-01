import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';

/*
NOTE:
Bcrypt currently has an issue.
Refer to https://stackoverflow.com/a/77581985/21640094 to solve the known issue.
*/

const CreateAccountScreen = () => {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [userSidePassword, setUserSidePassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigation = useNavigation();

    const goBack = () => {
        //setIsSettingsVisible(false); // Close the modal
        navigation.navigate('Login'); // Navigate
    };

    const isEmailInUse = async () => {
        try {
            const response = await fetch(`https://ergoquestapp.azurewebsites.net/users?email=${email}`);
            const users = await response.json();
            return users.some(user => user.email === email);
        } catch (error) {
            console.error('Error checking email:', error);
            return false;
        }
    };

    const handleCreateAccount = async () => {
        if (userSidePassword !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }

        setIsLoading(true);

        if (await isEmailInUse()) {
            Alert.alert("Error", "Email already in use");
            setIsLoading(false);
            return;
        }

        try {
            // refer to https://stackoverflow.com/a/77581985/21640094 to solve known issue
            // From: https://www.npmjs.com/package/react-native-bcrypt
            const bcrypt = require('bcryptjs');
            bcrypt.setRandomFallback((len) => {
                const buf = new Uint8Array(len);
	            return buf.map(() => Math.floor(Math.random() * 256));
            });
            console.log("Password:", userSidePassword);
            const salt = bcrypt.genSaltSync(0);
            const password = bcrypt.hashSync(userSidePassword, salt);
            console.log("Hashed:", password);
            // Store hash in your password DB.
            const response = await fetch('https://ergoquestapp.azurewebsites.net/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, name, password }),
            });

            if (response.ok) {
                Alert.alert("Success", "Account successfully created");
                // login user
                navigation.navigate('Settings');
            } else {
                // console.log("error, response:\n", JSON.parse(JSON.stringify(response)));
                const errorData = await JSON.parse(JSON.stringify(response));
                const errorMessage = errorData.message?errorData.message:"Failed to create account"; // Assuming the server sends back an error message
                Alert.alert("Error", errorMessage);
            }
        } catch (error) {
            console.error('Error:', error);
            Alert.alert("Error", "Network error");
        } finally {
            setIsLoading(false);
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
                placeholder="Name"
                value={name}
                onChangeText={setName}
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={userSidePassword}
                onChangeText={setUserSidePassword}
                secureTextEntry
            />
            <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
            />
            <TouchableOpacity style={styles.button} onPress={handleCreateAccount} disabled={isLoading}>
                {isLoading ? (
                    <ActivityIndicator size="small" color="#fff" /> // Show loading indicator
                ) : (
                    <Text style={styles.buttonText}>Create Account</Text>
                )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={goBack}>
                <Text style={styles.buttonText}>Back</Text>
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

export default CreateAccountScreen;
