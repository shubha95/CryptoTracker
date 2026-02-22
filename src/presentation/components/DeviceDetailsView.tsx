/**
 * DeviceDetailsView – native Android view (Fabric) that shows device info
 * and a "Close — Back to JS screen" button.
 * Use onClose to return to the JS screen.
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import NativeDeviceDetailsView, {
  type NativeProps,
} from '../../../specs/DeviceDetailsViewNativeComponent';

type Props = Omit<NativeProps, 'onClose'> & {
  onClose?: () => void;
};

export const DeviceDetailsView: React.FC<Props> = ({ onClose, style, ...rest }) => (
  <View style={[styles.wrapper, style]}>
    <NativeDeviceDetailsView
      {...rest}
      style={StyleSheet.absoluteFill}
      onClose={onClose != null ? () => onClose() : undefined}
    />
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
});
