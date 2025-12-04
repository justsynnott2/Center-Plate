import React, {useState, useEffect} from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { theme } from '../../../styles/theme.js';
import Card from '../../common/Card.jsx';
import Button from '../../common/Button.jsx';
import Icon from 'react-native-vector-icons/FontAwesome';
import TextInput from '../../common/TextInput.jsx';
import PreferencesForm from '../../preferences/PreferencesForm';

const SettingsTab = ({handleDeleteSession, handleEditSession, handleManagePreferences, user, currentSessionName, sessionPreferences}) => {
    const [showEditSession, setShowEditSession] = useState(false);
    const [editName, setEditName] = useState('');

    const [showManagePreferences, setShowManagePreferences] = useState(false);
    const [preferences, setPreferences] = useState(sessionPreferences);

    const [validationErrors, setValidationErrors] = useState('');

    useEffect(() => {
        if(currentSessionName && !showEditSession){
            setEditName(currentSessionName);
        }
    }, [currentSessionName]);

    useEffect(() => {
        if(!showManagePreferences){
            setPreferences(sessionPreferences);
        }
    }, [showManagePreferences]);

    const editSession = () => {
        handleEditSession();
        setShowEditSession(false);
    };

    const saveSessionName = async () => {
        if(!editName || editName.trim().length === 0){
            setValidationErrors("Session name is required");
            return;
        }
        setValidationErrors('')
        try {
            await handleEditSession(editName.trim());
            setShowEditSession(false);
        } catch (err) {
            console.error('Error updating session name:', err);
        }
    };

    const managePreferences = () => {
        handleManagePreferences();
        setShowManagePreferences(false);
    };

    const savePreferences = async () => {
        try {
            await handleManagePreferences(preferences);
            setShowManagePreferences(false);
        } catch (err) {
            console.error('Error saving preferences:', err);
        }
    };

    return (

        <Card style={styles.settingsCard}>
            <View style={styles.cardHeader}>
                <Icon name="cog" size={20} color={theme.colors.primary.main} />
                <Text style={styles.sectionTitle}>Session Settings</Text>
            </View>
            <View style={styles.settingsContainer}>
                <Button
                    title="Edit Session Info"
                    onPress={() => setShowEditSession(!showEditSession)}
                    variant="outlined"
                    icon="edit"
                    fullWidth
                />

                {showEditSession &&
                    <>
                        <TextInput
                            label="Session Name"
                            placeholder="Enter session name"
                            value={editName}
                            onChangeText={(text) => setEditName(text)}
                            icon="users"
                            error={validationErrors}
                        />
                        <Button
                            title={"Save Name"}
                            onPress={saveSessionName}
                            variant="outlined"
                            icon="sliders"
                            fullWidth
                        />
                    </>
                }

                <Button
                    title="Manage Preferences"
                    onPress={() => setShowManagePreferences(!showManagePreferences)}
                    variant="outlined"
                    icon="sliders"
                    fullWidth
                />

                {showManagePreferences &&
                    <>
                        <PreferencesForm
                            preferences={preferences}
                            onPreferencesChange={setPreferences}
                            validationErrors={validationErrors}
                            title="Session Preferences"
                        />
                        <Button
                            title="Save Preferences"
                            onPress={savePreferences}
                            variant="outlined"
                            icon="sliders"
                            fullWidth
                        />
                    </>
                }

                <Button
                    title="Delete Session"
                    onPress={handleDeleteSession}
                    variant="danger"
                    icon="trash"
                    fullWidth
                />


            </View>
        </Card>
    );
};

const styles = StyleSheet.create({
    settingsCard: {
        marginBottom: theme.spacing.lg,
    },
    settingsContainer: {
        gap: theme.spacing.md,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.md,
    },
    sectionTitle: {
        fontSize: theme.typography.fontSize.lg,
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.text.primary,
    },
});

export default SettingsTab;