import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useEffect, useState } from 'react';
import { Alert, Button, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import ProductItem, { filtrarProductos } from '../components/ProductItem';
import type { Producto } from '../utils/storage';
import { cargarProductos, guardarProductos } from '../utils/storage';

export default function App() {
  const [permiso, solicitarPermiso] = useCameraPermissions();
  const [escaneado, setEscaneado] = useState(false);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [nombre, setNombre] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [datosEscaneados, setDatosEscaneados] = useState<string>('');
  const [modalVisible, setModalVisible] = useState(false);
  const [idProductoEditando, setIdProductoEditando] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState(''); 

  useEffect(() => {
    (async () => {
      const lista = await cargarProductos();
      setProductos(lista);
    })();
  }, []);

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (escaneado || modalVisible) return;
    setEscaneado(true);
    setDatosEscaneados(String(data).trim());
    setModalVisible(true);
  };

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
      actualizados = productos.map(p =>
        p.id === idProductoEditando ? { ...p, nombre: nuevo.nombre, cantidad: nuevo.cantidad } : p
      );
    } else {
      const existe = productos.some(p => p.id === nuevo.id);
      actualizados = existe
        ? productos.map(p => (p.id === nuevo.id ? { ...p, nombre: nuevo.nombre, cantidad: nuevo.cantidad } : p))
        : [...productos, nuevo];
    }

    setProductos(actualizados);
    await guardarProductos(actualizados);

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
    setDatosEscaneados(p.id);
    setIdProductoEditando(id);
    setModalVisible(true);
  };

  if (!permiso) return <View />;
  if (!permiso.granted) {
    return (
      <View style={estilos.contenedor}>
        <Text style={estilos.mensaje}>Necesitamos tu permiso para mostrar la cámara</Text>
        <Button onPress={solicitarPermiso} title="Conceder Permiso" />
      </View>
    );
  }

  // Filtrar y ordenar productos
  const listaFiltrada = filtrarProductos(productos, busqueda)
    .sort((a, b) => Date.parse(b.fecha ?? '') - Date.parse(a.fecha ?? ''));

  return (
    <View style={estilos.contenedor}>
      <Text style={{ marginBottom: 8, fontWeight: '700', color: '#E5E7EB' }}>
        Escanea un código de barras
      </Text>

      <CameraView
        style={estilos.camara}
        barcodeScannerSettings={{ barcodeTypes: ['qr', 'ean13', 'ean8'] as any }}
        onBarcodeScanned={handleBarcodeScanned}
      />

      {/* Buscador de productos */}
      <TextInput
        placeholder="Buscar por nombre o ID..."
        placeholderTextColor="#6B7280"
        value={busqueda}
        onChangeText={setBusqueda}
        style={estilos.buscador}
      />

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

      <FlatList
        style={{ width: '100%', marginTop: 10 }}
        contentContainerStyle={{ alignItems: 'center', paddingBottom: 20 }}
        data={listaFiltrada}
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
        ListEmptyComponent={<Text style={{ color: '#9CA3AF' }}>No hay productos aún.</Text>}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, alignItems: 'center', padding: 16, backgroundColor: '#0B1220' },
  mensaje: { textAlign: 'center', paddingBottom: 10, color: '#E5E7EB' },
  camara: {
    width: '100%',
    height: 260,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#3B82F6',
    backgroundColor: '#0F172A',
  },
  buscador: {
    width: '100%',
    height: 46,
    marginTop: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1F2937',
    backgroundColor: '#0F172A',
    color: '#E5E7EB',
  },
  card: {
    width: '92%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#374151',
    marginBottom: 10,
  },
  cardNombre: { color: '#F8FAFC', fontSize: 16, fontWeight: '700' },
  cardSub: { color: '#9CA3AF', fontSize: 14, marginTop: 2 },
  cardId: { color: '#CBD5E1', fontSize: 12, marginTop: 4 },
  btnEditar: {
    color: '#3B82F6',
    borderColor: '#3B82F6',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  btnEliminar: {
    color: '#EF4444',
    borderColor: '#EF4444',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
});
