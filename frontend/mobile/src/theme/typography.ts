import {StyleSheet} from 'react-native';
import {colors} from './colors';

export const typography = StyleSheet.create({
  headingHero: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 38,
    letterSpacing: -0.5,
    color: colors.neutral[900],
  },
  headingH1: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
    letterSpacing: -0.3,
    color: colors.neutral[900],
  },
  headingH2: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 30,
    letterSpacing: -0.2,
    color: colors.neutral[900],
  },
  headingH3: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 26,
    letterSpacing: -0.1,
    color: colors.neutral[900],
  },
  headingH4: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 25,
    letterSpacing: 0,
    color: colors.neutral[900],
  },
  bodyLarge: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    color: colors.neutral[900],
  },
  body: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 21,
    color: colors.neutral[900],
  },
  bodySecondary: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 21,
    color: colors.neutral[600],
  },
  bodySmall: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 17,
    color: colors.neutral[600],
  },
  caption: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 17,
    letterSpacing: 0.2,
    color: colors.neutral[600],
  },
  overline: {
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 14,
    letterSpacing: 0.5,
    color: colors.neutral[600],
  },
  button: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 17,
    letterSpacing: 0.3,
  },
  input: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 19,
    color: colors.neutral[900],
  },
  link: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    color: colors.secondary[500],
  },
});
