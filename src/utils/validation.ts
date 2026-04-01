import { EventDraft, EventDraftErrors, RequiredEventField } from '../domain/types';
import { isEventDateValid } from './date';

export const REQUIRED_FIELDS: RequiredEventField[] = ['occasion', 'city', 'date', 'budget', 'guests'];

function isBlankValue(value: string): boolean {
  return !String(value ?? '').trim();
}

function isDateFieldInvalid(value: string): boolean {
  if (isBlankValue(value)) {
    return true;
  }

  return !isEventDateValid(value);
}

export function validateEventDraft(draft: EventDraft): EventDraftErrors {
  return REQUIRED_FIELDS.reduce<EventDraftErrors>((errors, fieldName) => {
    const fieldValue = draft[fieldName];
    const isInvalid = fieldName === 'date' ? isDateFieldInvalid(fieldValue) : isBlankValue(fieldValue);

    if (isInvalid) {
      errors[fieldName] = true;
    }

    return errors;
  }, {});
}
