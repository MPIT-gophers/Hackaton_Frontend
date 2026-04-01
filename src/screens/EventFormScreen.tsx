import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { HeaderBack } from '../components/HeaderBack';
import { PrimaryButton } from '../components/PrimaryButton';
import { RoundedInput } from '../components/RoundedInput';
import { RoundedTextArea } from '../components/RoundedTextArea';
import { ScreenContainer } from '../components/ScreenContainer';
import { useAppContext } from '../context/AppContext';
import { RootStackParamList } from '../navigation/types';
import { theme } from '../theme';

type EventFormScreenProps = NativeStackScreenProps<RootStackParamList, 'EventForm'>;

export function EventFormScreen({ navigation }: EventFormScreenProps) {
  const { state, actions } = useAppContext();

  const handleContinue = () => {
    if (actions.validateDraft()) {
      navigation.navigate('VenuesList');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardWrap}>
      <ScreenContainer keyboardShouldPersistTaps="handled" scrollable>
        <HeaderBack onPress={navigation.goBack} title="Создание мероприятия" />

        <Text style={styles.title}>Ввод параметров</Text>

        <View style={styles.fields}>
          <RoundedInput
            invalid={Boolean(state.draftErrors.occasion)}
            onChangeText={(value) => actions.updateDraftField('occasion', value)}
            placeholder="Укажите событие"
            testID="field-occasion"
            value={state.draft.occasion}
          />
          <RoundedInput
            invalid={Boolean(state.draftErrors.city)}
            onChangeText={(value) => actions.updateDraftField('city', value)}
            placeholder="Укажите город"
            testID="field-city"
            value={state.draft.city}
          />
          <RoundedInput
            invalid={Boolean(state.draftErrors.date)}
            onChangeText={(value) => actions.updateDraftField('date', value)}
            placeholder="Укажите дату"
            testID="field-date"
            value={state.draft.date}
          />
          <RoundedInput
            bright
            invalid={Boolean(state.draftErrors.budget)}
            keyboardType="numeric"
            onChangeText={(value) => actions.updateDraftField('budget', value)}
            placeholder="Укажите бюджет"
            testID="field-budget"
            value={state.draft.budget}
          />
          <RoundedInput
            bright
            invalid={Boolean(state.draftErrors.guests)}
            keyboardType="numeric"
            onChangeText={(value) => actions.updateDraftField('guests', value)}
            placeholder="Укажите количество гостей"
            testID="field-guests"
            value={state.draft.guests}
          />
          <RoundedInput
            bright
            onChangeText={(value) => actions.updateDraftField('placeType', value)}
            placeholder="Тип места"
            testID="field-place-type"
            value={state.draft.placeType}
          />
          <RoundedInput
            bright
            onChangeText={(value) => actions.updateDraftField('location', value)}
            placeholder="Локация"
            testID="field-location"
            value={state.draft.location}
          />
        </View>

        <Text style={styles.sectionTitle}>Пожелания</Text>
        <RoundedTextArea onChangeText={(value) => actions.updateDraftField('wishes', value)} placeholder="" testID="field-wishes" value={state.draft.wishes} />

        <PrimaryButton onPress={handleContinue} style={styles.button} testID="event-form-continue-button" title="Продолжить" />
      </ScreenContainer>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardWrap: {
    flex: 1
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.typography.medium,
    fontSize: 20,
    lineHeight: 24,
    marginTop: 30
  },
  fields: {
    gap: theme.spacing.fieldGap,
    marginTop: 15
  },
  sectionTitle: {
    color: theme.colors.text,
    fontFamily: theme.typography.medium,
    fontSize: 20,
    lineHeight: 24,
    marginBottom: 15,
    marginTop: 15
  },
  button: {
    marginTop: 30
  }
});
