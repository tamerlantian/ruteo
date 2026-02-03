import React, { forwardRef, useCallback, useMemo } from 'react';
import { Platform, StyleSheet } from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetProps,
  BottomSheetScrollView,
  BottomSheetView,
} from '@gorhom/bottom-sheet';

interface CustomBottomSheetProps extends Partial<BottomSheetProps> {
  children: React.ReactNode;
  initialSnapPoints?: string[];
  showsScrollIndicator?: boolean;
  useScrollView?: boolean;
  onDismiss?: () => void;
  /** Maximum height for dynamic sizing. Defaults to 90% of screen height */
  maxDynamicContentSize?: number;
/** Whether to enable dynamic sizing. When true, snapPoints are optional */
  enableDynamicSizing?: boolean;
  /**
   * Determines when keyboard should stay visible when tapping.
   * - 'always': Keyboard stays visible, taps go through
   * - 'handled': Taps on interactive elements work, taps on scroll view dismiss keyboard
   * - 'never': First tap dismisses keyboard (default React Native behavior)
   */
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
}

const CustomBottomSheet = forwardRef<BottomSheet, CustomBottomSheetProps>(
  (
    {
      children,
      initialSnapPoints = ['25%', '50%', '75%'],
      showsScrollIndicator = false,
      useScrollView = true,
      onDismiss,
      maxDynamicContentSize,
      enableDynamicSizing: enableDynamicSizingProp = false,
      keyboardShouldPersistTaps = 'handled',
      ...rest
    },
    ref,
  ) => {
    // Variables para snapPoints - solo se usan si dynamic sizing está deshabilitado
    const initialSnapPointsArray = useMemo(() => initialSnapPoints, [initialSnapPoints]);

    // Renderizar el backdrop (fondo oscuro)
    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
      ),
      [],
    );

    // Contenido del bottom sheet
    const renderContent = () => {
      if (useScrollView) {
        return (
          <BottomSheetScrollView
            showsVerticalScrollIndicator={showsScrollIndicator}
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          >
            {children}
          </BottomSheetScrollView>
        );
      }

      // Usar BottomSheetView en lugar de View regular para dynamic sizing
      return <BottomSheetView style={styles.contentContainer}>{children}</BottomSheetView>;
    };

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        // Solo usar snapPoints si dynamic sizing está deshabilitado
        snapPoints={enableDynamicSizingProp ? undefined : initialSnapPointsArray}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={styles.indicator}
        backgroundStyle={styles.background}
        onClose={onDismiss}
        keyboardBehavior={Platform.OS === 'ios' ? 'interactive' : 'fillParent'}
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        enableDynamicSizing={enableDynamicSizingProp}
        maxDynamicContentSize={maxDynamicContentSize}
        enableContentPanningGesture={false}
        {...rest}
      >
        {renderContent()}
      </BottomSheet>
    );
  },
);

const styles = StyleSheet.create({
  background: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  contentContainer: {
    padding: 16,
  },
  indicator: {
    backgroundColor: '#CCCCCC',
    width: 40,
  },
});

// Agregar displayName para evitar advertencia de lint
CustomBottomSheet.displayName = 'CustomBottomSheet';

export default CustomBottomSheet;
