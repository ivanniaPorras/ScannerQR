import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useEffect, useState } from 'react';
import { Alert, Button, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ProductItem from '../components/ProductItem';
import type { Producto } from '../utils/storage';
import { cargarProductos, guardarProductos } from '../utils/storage';

export default function App() {
  const [permiso, solicitarPermiso] = useCameraPermissions();
  const [escaneado, setEscaneado] = useState(false);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [nombre, setNombre] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [datosEscaneados, setDatosEscaneados] = useState<string>(''); // ID
  const [modalVisible, setModalVisible] = useState(false);
  const [idProductoEditando, setIdProductoEditando] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const lista = await cargarProductos();
      setProductos(lista);
    })();
  }, []);

  // Evita reescaneos mientras el modal está abierto
  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (escaneado || modalVisible) return;
    setEscaneado(true);
    setDatosEscaneados(String(data).trim());
    setModalVisible(true);
  };
// Agrega o actualiza el producto
  const handleAddOrUpdate = async () => {
    if (!nombre.trim() || !cantidad.trim() || !datosEscaneados.trim()) {
      Alert.alert('Error', 'Debe completar todos los campos.');
      return;
    }
    const cant = parseInt(cantidad, 10);
    if (!Number.isFinite(cant) || cant < 0) {
      Alert.alert('Error', 'Cantidad inválida.');
      return;
    }

    const nuevo: Producto = {
      id: datosEscaneados.trim(),
      nombre: nombre.trim(),
      cantidad: cant,
      fecha: new Date().toISOString(),
    };

    let actualizados: Producto[];

    if (idProductoEditando) {
      // Editar por idProductoEditando
      actualizados = productos.map(p =>
        p.id === idProductoEditando ? { ...p, nombre: nuevo.nombre, cantidad: nuevo.cantidad } : p
      );
    } else {
      // Crear o actualizar si el ID ya existía (por si escaneaste el mismo código)
      const existe = productos.some(p => p.id === nuevo.id);
      actualizados = existe
        ? productos.map(p => (p.id === nuevo.id ? { ...p, nombre: nuevo.nombre, cantidad: nuevo.cantidad } : p))
        : [...productos, nuevo];
    }

    setProductos(actualizados);
    await guardarProductos(actualizados);

    // Reset
    setNombre('');
    setCantidad('');
    setDatosEscaneados('');
    setIdProductoEditando(null);
    setModalVisible(false);
    setEscaneado(false);
  };

  const handleDelete = async (id: string) => {
    const actualizados = productos.filter(p => p.id !== id);
    setProductos(actualizados);
    await guardarProductos(actualizados);
  };

  const handleEdit = (id: string) => {
    const p = productos.find(x => x.id === id);
    if (!p) return;
    setNombre(p.nombre);
    setCantidad(String(p.cantidad));
    setDatosEscaneados(p.id);     // mantiene visible el ID
    setIdProductoEditando(id);
    setModalVisible(true);
  };

  // permisos de la cámara
  if (!permiso) return <View />;
  if (!permiso.granted) {
    return (
      <View style={estilos.contenedor}>
        <Text style={estilos.mensaje}>Necesitamos tu permiso para mostrar la cámara</Text>
        <Button onPress={solicitarPermiso} title="Conceder Permiso" />
      </View>
    );
  }

  return (
    <View style={estilos.contenedor}>
      <Text style={{ marginBottom: 8, fontWeight: '700' }}>Escanea un código de barras</Text>

      <CameraView
        style={estilos.camara}
        barcodeScannerSettings={{ barcodeTypes: ['qr', 'ean13', 'ean8'] as any }}
        onBarcodeScanned={handleBarcodeScanned}
      />

      {/* Modal reutilizable */}
      <ProductItem
        visible={modalVisible}
        isEditing={Boolean(idProductoEditando)}
        codigo={datosEscaneados}
        nombre={nombre}
        cantidad={cantidad}
        onChangeNombre={setNombre}
        onChangeCantidad={setCantidad}
        onConfirm={handleAddOrUpdate}
        onCancel={() => {
          setModalVisible(false);
          setEscaneado(false);
          setIdProductoEditando(null);
          setNombre('');
          setCantidad('');
          setDatosEscaneados('');
        }}
      />

      {/* Lista de productos guardados */}
      <FlatList
        style={{ width: '100%', marginTop: 10 }}
        contentContainerStyle={{ alignItems: 'center', paddingBottom: 20 }}
        data={[...productos].sort((a, b) => Date.parse(b.fecha ?? '') - Date.parse(a.fecha ?? ''))}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={estilos.card}>
            <View style={{ flex: 1 }}>
              <Text style={estilos.cardNombre}>{item.nombre || 'Sin nombre'}</Text>
              <Text style={estilos.cardSub}>Cantidad: {item.cantidad ?? 0}</Text>
              <Text style={estilos.cardId}>ID: {item.id}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity onPress={() => handleEdit(item.id)}>
                <Text style={estilos.btnEditar}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Text style={estilos.btnEliminar}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text>No hay productos aún.</Text>}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, alignItems: 'center', padding: 16, backgroundColor: '#fff' },
  mensaje: { textAlign: 'center', paddingBottom: 10 },
  camara: { width: '100%', height: 260, borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#3B82F6' },

  card: {
    width: '92%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#374151',
    marginBottom: 10,
  },
  cardNombre: { color: '#F8FAFC', fontSize: 16, fontWeight: '700' },
  cardSub: { color: '#9CA3AF', fontSize: 14, marginTop: 2 },
  cardId: { color: '#CBD5E1', fontSize: 12, marginTop: 4 },
  btnEditar: { color: '#3B82F6', borderColor: '#3B82F6', borderWidth: 1, borderRadius: 6, paddingVertical: 6, paddingHorizontal: 10 },
  btnEliminar: { color: '#EF4444', borderColor: '#EF4444', borderWidth: 1, borderRadius: 6, paddingVertical: 6, paddingHorizontal: 10 },
});
