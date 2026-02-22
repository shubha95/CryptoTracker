/**
 * Fabric native component (New Architecture only). No bridge:
 * - codegenNativeComponent registers with Fabric, not the legacy bridge.
 * - Events (e.g. onClose) are delivered via the C++/JSI pipeline.
 */
import type { ViewProps } from 'react-native';
import type { DirectEventHandler } from 'react-native/Libraries/Types/CodegenTypes';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

export interface NativeProps extends ViewProps {
  onClose?: DirectEventHandler<null>;
}

export default codegenNativeComponent<NativeProps>('DeviceDetailsView');
