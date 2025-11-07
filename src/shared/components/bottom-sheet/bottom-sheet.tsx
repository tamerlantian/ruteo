import React, { forwardRef, useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetProps,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';

interface CustomBottomSheetProps extends Partial<BottomSheetProps> {
  children: React.ReactNode;
  initialSnapPoints?: string[];
  showsScrollIndicator?: boolean;
  useScrollView?: boolean;
  onDismiss?: () => void;
}

const CustomBottomSheet = forwardRef<BottomSheet, CustomBottomSheetProps>(
  (
    {
      children,
      initialSnapPoints = ['25%', '50%', '75%'],
      showsScrollIndicator = false,
      useScrollView = true,
      onDismiss,
      ...rest
    },
    ref,
  ) => {
    // Variables para snapPoints dinámicos
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
          >
            {children}
          </BottomSheetScrollView>
        );
      }

      return <View style={styles.contentContainer}>{children}</View>;
    };

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={initialSnapPointsArray}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={styles.indicator}
        backgroundStyle={styles.background}
        onClose={onDismiss}
        keyboardBehavior="extend"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        enableDynamicSizing
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
