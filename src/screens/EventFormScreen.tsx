import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, LayoutChangeEvent, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { HeaderBack } from '../components/HeaderBack';
import { PrimaryButton } from '../components/PrimaryButton';
import {
  BASE_FONT_SIZE,
  CHAR_WIDTH_FACTOR,
  MIN_FONT_SCALE,
  PADDING_H,
  RoundedInput
} from '../components/RoundedInput';
import { RoundedTextArea } from '../components/RoundedTextArea';
import { ScreenContainer } from '../components/ScreenContainer';
import { useAppContext } from '../context/AppContext';
import { RootStackParamList } from '../navigation/types';
import { theme } from '../theme';

type EventFormScreenProps = NativeStackScreenProps<RootStackParamList, 'EventForm'>;

function formatDateForDisplay(isoDate: string): string {
  if (!isoDate) {
    return '';
  }

  const parts = isoDate.split('-');

  if (parts.length !== 3) {
    return isoDate;
  }

  return `${parts[2]}.${parts[1]}.${parts[0]}`;
}

const PLACEHOLDERS = [
  'Укажите событие',
  'Укажите город',
  'Укажите дату',
  'Укажите бюджет',
  'Укажите количество гостей',
  'Тип места',
  'Локация'
];

const LONGEST_PLACEHOLDER = PLACEHOLDERS.reduce(
  (a, b) => (b.length > a.length ? b : a),
  ''
).length;

export function EventFormScreen({ navigation, route }: EventFormScreenProps) {
  const { state, actions } = useAppContext();
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [fieldsWidth, setFieldsWidth] = useState(0);

  const isEditMode = route.params?.mode === 'edit';
  const actionTitle = isEditMode ? 'Сохранить' : 'Продолжить';
  const dateValue = state.draft.date;

  const handleFieldsLayout = (event: LayoutChangeEvent) => {
    setFieldsWidth(event.nativeEvent.layout.width);
  };

  const placeholderFontSize = useMemo(() => {
    if (!fieldsWidth) {
      return BASE_FONT_SIZE;
    }

    const available = fieldsWidth - PADDING_H * 2;
    const computed = (available / LONGEST_PLACEHOLDER) * CHAR_WIDTH_FACTOR;
    const minAllowed = BASE_FONT_SIZE * MIN_FONT_SCALE;

    return Math.max(minAllowed, Math.min(BASE_FONT_SIZE, computed));
  }, [fieldsWidth]);

  const selectedDate = useMemo(() => {
    if (!dateValue) {
      return new Date();
    }

    const parsedDate = new Date(`${dateValue}T12:00:00`);
    return Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
  }, [dateValue]);

  const handleNumericChange =
    (field: 'budget' | 'guests') =>
    (value: string) => {
      actions.updateDraftField(field, value.replace(/\D+/g, ''));
    };

  const handleDateChange = (_event: DateTimePickerEvent, date?: Date) => {
    setIsDatePickerVisible(false);

    if (!date) {
      return;
    }

    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    actions.updateDraftField('date', `${year}-${month}-${day}`);
  };

  const handleContinue = () => {
    if (actions.validateDraft()) {
      if (isEditMode) {
        navigation.goBack();
        return;
      }

      navigation.navigate('VenuesList');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardWrap}>
      <ScreenContainer keyboardShouldPersistTaps="handled" scrollable>
        <HeaderBack onPress={navigation.goBack} title="Создание мероприятия" />

        <Text style={styles.title}>Ввод параметров</Text>

        <View onLayout={handleFieldsLayout} style={styles.fields}>
          <RoundedInput
            invalid={Boolean(state.draftErrors.occasion)}
            onChangeText={(value) => actions.updateDraftField('occasion', value)}
            placeholder="Укажите событие"
            placeholderFontSize={placeholderFontSize}
            testID="field-occasion"
            value={state.draft.occasion}
            compact
          />
          <RoundedInput
            invalid={Boolean(state.draftErrors.city)}
            onChangeText={(value) => actions.updateDraftField('city', value)}
            placeholder="Укажите город"
            placeholderFontSize={placeholderFontSize}
            testID="field-city"
            value={state.draft.city}
            compact
          />
          <Pressable onPress={() => setIsDatePickerVisible(true)} testID="field-date-picker-trigger">
            <RoundedInput
              editable={false}
              invalid={Boolean(state.draftErrors.date)}
              onChangeText={() => {}}
              placeholder="Укажите дату"
              placeholderFontSize={placeholderFontSize}
              testID="field-date"
              value={formatDateForDisplay(state.draft.date)}
              compact
            />
          </Pressable>
          <RoundedInput
            bright
            invalid={Boolean(state.draftErrors.budget)}
            keyboardType="numeric"
            onChangeText={handleNumericChange('budget')}
            placeholder="Укажите бюджет"
            placeholderFontSize={placeholderFontSize}
            testID="field-budget"
            value={state.draft.budget}
            compact
          />
          <RoundedInput
            bright
            invalid={Boolean(state.draftErrors.guests)}
            keyboardType="numeric"
            onChangeText={handleNumericChange('guests')}
            placeholder="Укажите количество гостей"
            placeholderFontSize={placeholderFontSize}
            testID="field-guests"
            value={state.draft.guests}
            compact
          />
          <RoundedInput
            bright
            onChangeText={(value) => actions.updateDraftField('placeType', value)}
            placeholder="Тип места"
            placeholderFontSize={placeholderFontSize}
            testID="field-place-type"
            value={state.draft.placeType}
            compact
          />
          <RoundedInput
            bright
            onChangeText={(value) => actions.updateDraftField('location', value)}
            placeholder="Локация"
            placeholderFontSize={placeholderFontSize}
            testID="field-location"
            value={state.draft.location}
            compact
          />
        </View>

        <Text style={styles.sectionTitle}>Пожелания</Text>
        <RoundedTextArea onChangeText={(value) => actions.updateDraftField('wishes', value)} placeholder="" testID="field-wishes" value={state.draft.wishes} />

        {isDatePickerVisible ? (
          <DateTimePicker display="default" mode="date" onChange={handleDateChange} value={selectedDate} />
        ) : null}

        <PrimaryButton onPress={handleContinue} style={styles.button} testID="event-form-continue-button" title={actionTitle} />
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
    fontSize: 17,
    lineHeight: 22,
    marginTop: 30
  },
  fields: {
    gap: theme.spacing.fieldGap,
    marginTop: 15
  },
  sectionTitle: {
    color: theme.colors.text,
    fontFamily: theme.typography.medium,
    fontSize: 17,
    lineHeight: 22,
    marginBottom: 15,
    marginTop: 15
  },
  button: {
    marginTop: 30
  }
});
