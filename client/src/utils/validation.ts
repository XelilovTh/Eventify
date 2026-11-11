import React from 'react';

export const AZ_VALIDATION_MESSAGES = {
  required: 'Bu sahəni doldurun.',
  email: 'Düzgün e-poçt ünvanı daxil edin.',
  url: 'Düzgün URL daxil edin (http:// və ya https:// ilə başlamalıdır).',
  passwordMin: 'Şifrə ən azı 6 simvoldan ibarət olmalıdır.',
  number: 'Rəqəm daxil edin.',
  capacity: 'Tutum 1-dən kiçik ola bilməz.',
  dateRequired: 'Tədbirin tarix və saatını seçin.',
  deadlineAfterDate: 'Son qeydiyyat tarixi tədbir tarixindən sonraya təyin edilə bilməz.',
} as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

export const isValidEmail = (value: string): boolean => EMAIL_RE.test(value.trim());

export const isValidUrl = (value: string): boolean => {
  const trimmed = value.trim();
  if (!trimmed) return true;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

export type ValidatableElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

export type AzMessageResolver = (element: ValidatableElement) => string;

export const azValidationProps = (
  resolve: string | AzMessageResolver = AZ_VALIDATION_MESSAGES.required
): {
  onInvalid: (e: React.FormEvent<ValidatableElement>) => void;
  onInput: (e: React.FormEvent<ValidatableElement>) => void;
} => {
  const getMessage: AzMessageResolver =
    typeof resolve === 'function' ? resolve : () => resolve;

  return {
    onInvalid: (e) => {
      const el = e.currentTarget;
      const message = getMessage(el);
      if (el.validationMessage !== message) {
        el.setCustomValidity(message);
        el.reportValidity();
      }
    },
    onInput: (e) => {
      e.currentTarget.setCustomValidity('');
    },
  };
};

export const emailMessage: AzMessageResolver = (el) => {
  if (el.validity.valueMissing) return AZ_VALIDATION_MESSAGES.required;
  if (el.validity.typeMismatch) return AZ_VALIDATION_MESSAGES.email;
  return AZ_VALIDATION_MESSAGES.email;
};

export const passwordMessage: AzMessageResolver = (el) => {
  if (el.validity.valueMissing) return AZ_VALIDATION_MESSAGES.required;
  if (el.validity.tooShort) return AZ_VALIDATION_MESSAGES.passwordMin;
  return AZ_VALIDATION_MESSAGES.passwordMin;
};

export const capacityMessage: AzMessageResolver = (el) => {
  if (el.validity.valueMissing) return AZ_VALIDATION_MESSAGES.required;
  if (el.validity.rangeUnderflow) return AZ_VALIDATION_MESSAGES.capacity;
  if (el.validity.badInput) return AZ_VALIDATION_MESSAGES.number;
  return AZ_VALIDATION_MESSAGES.required;
};

export const urlMessage: AzMessageResolver = (el) => {
  if (el.validity.typeMismatch) return AZ_VALIDATION_MESSAGES.url;
  if (el.validity.valueMissing) return AZ_VALIDATION_MESSAGES.required;
  return AZ_VALIDATION_MESSAGES.url;
};
