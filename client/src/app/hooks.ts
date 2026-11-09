// client/src/app/hooks.ts
// Bu fayl useDispatch və useSelector hook-larını TypeScript tipləri ilə zənginləşdirir.
// Komponentlərdə düzgün tipləri avtomatik tamamlamaq (autocomplete) üçün bunları istifadə edirik.

import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
