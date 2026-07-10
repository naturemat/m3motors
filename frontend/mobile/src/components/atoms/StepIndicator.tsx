import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {colors} from '../../theme';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels: string[];
}

export default function StepIndicator({
  currentStep,
  totalSteps,
  labels,
}: StepIndicatorProps) {
  return (
    <View style={styles.container}>
      {labels.map((label, index) => (
        <React.Fragment key={index}>
          <View style={styles.stepContainer}>
            <View
              style={[
                styles.circle,
                index < currentStep && styles.circleCompleted,
                index === currentStep && styles.circleActive,
              ]}>
              <Text
                style={[
                  styles.circleText,
                  (index < currentStep || index === currentStep) &&
                    styles.circleTextActive,
                ]}>
                {index < currentStep ? '\u2713' : `${index + 1}`}
              </Text>
            </View>
            <Text
              style={[
                styles.label,
                index === currentStep && styles.labelActive,
                index < currentStep && styles.labelCompleted,
              ]}
              numberOfLines={1}>
              {label}
            </Text>
          </View>
          {index < totalSteps - 1 && (
            <View
              style={[
                styles.line,
                index < currentStep && styles.lineCompleted,
              ]}
            />
          )}
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  stepContainer: {
    alignItems: 'center',
    width: 60,
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  circleActive: {
    backgroundColor: colors.primary[500],
  },
  circleCompleted: {
    backgroundColor: colors.success[500],
  },
  circleText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[600],
  },
  circleTextActive: {
    color: colors.neutral[0],
  },
  label: {
    fontSize: 10,
    color: colors.neutral[400],
    textAlign: 'center',
  },
  labelActive: {
    color: colors.primary[500],
    fontWeight: '600',
  },
  labelCompleted: {
    color: colors.success[500],
  },
  line: {
    flex: 1,
    height: 2,
    backgroundColor: colors.neutral[200],
    marginBottom: 20,
  },
  lineCompleted: {
    backgroundColor: colors.success[500],
  },
});
