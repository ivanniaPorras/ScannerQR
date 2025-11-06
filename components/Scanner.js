import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function Scanner({ onScan }) {
  const [permiso, solicitarPermiso] = useCameraPermissions();
  const [bloqueado, setBloqueado] = useState(false); // anti-doble-lectura

  if (!permiso) return <View />;

  if (!permiso.granted) {
    return (
      <View style={estilos.permiso}>
        <Text style={estilos.mensaje}>Necesitamos tu permiso para usar la cámara</Text>
        <Button title="Conceder permiso" onPress={solicitarPermiso} />
      </View>
    );
  }

  const handleBarcodeScanned = ({ data }) => {
    if (bloqueado) return;
    setBloqueado(true);
    onScan(String(data));
    // re-armar el escaneo tras un pequeño margen
    setTimeout(() => setBloqueado(false), 1200);
  };

  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.titulo}>Escanea un código</Text>
      <CameraView
        style={estilos.camara}
        barcodeScannerSettings={{ barcodeTypes: ['qr', 'ean13', 'ean8'] }}
        onBarcodeScanned={handleBarcodeScanned}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  permiso: { alignItems: 'center', padding: 16 },
  mensaje: { marginBottom: 8, textAlign: 'center' },
  contenedor: { width: '100%', alignItems: 'center' },
  titulo: { marginTop: 6, marginBottom: 8 },
  camara: {
    width: '100%', height: 280, borderRadius: 10, overflow: 'hidden',
  },
});
