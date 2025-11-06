import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import React, { useEffect, useState } from 'react';
import { Alert, Button, FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { cargarProductos, guardarProductos, type Producto } from '../utils/storage';

export default function ProductItem() {
  // Permisos de cámara
  const [permiso, solicitarPermiso] = useCameraPermissions();

  // Estado general
  const [escanneado, setEscanneado] = useState<boolean>(false);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [nombre, setNombre] = useState<string>('');
  const [cantidad, setCantidad] = useState<string>('');
  const [datosEscaneados, setDatosEscaneados] = useState<string>('');
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [idProductoEditando, setIdProductoEditando] = useState<string | null>(null);

  // Cargar inventario al inicio
  useEffect(() => {
    (async () => {
      const data = await cargarProductos();
      setProductos(Array.isArray(data) ? data : []);
    })();
  }, []);

  // Escaneo de código
  const handleBarcodeScanned = (result: BarcodeScanningResult) => {
    if (escanneado) return;
    setEscanneado(true);
    setDatosEscaneados(result.data);
    setModalVisible(true);
  };

  // Agregar/Actualizar
  const handleAddOrUpdate = async () => {
    if (!nombre.trim() || !cantidad.trim() || !datosEscaneados.trim()) {
      Alert.alert('Error', 'Debe completar todos los campos.');
      return;
    }

    const cantidadNum = parseInt(cantidad, 10);
    if (Number.isNaN(cantidadNum) || cantidadNum < 0) {
      Alert.alert('Error', 'La cantidad debe ser un número válido.');
      return;
    }

    let nuevos: Producto[];

    if (idProductoEditando) {
      // Editar por id existente
      nuevos = productos.map((p) =>
        p.id === idProductoEditando ? { ...p, nombre, cantidad: cantidadNum } : p
      );
    } else {
      // Si ya existe el ID, actualizamos; si no, creamos
      const existente = productos.find((p) => p.id === datosEscaneados);
      if (existente) {
        nuevos = productos.map((p) =>
          p.id === datosEscaneados ? { ...p, nombre, cantidad: cantidadNum } : p
        );
      } else {
        nuevos = [
          ...productos,
          { id: datosEscaneados, nombre, cantidad: cantidadNum, fecha: new Date().toISOString() },
        ];
      }
    }

    setProductos(nuevos);
    await guardarProductos(nuevos);

    // Reset
    setNombre('');
    setCantidad('');
    setEscanneado(false);
    setDatosEscaneados('');
    setModalVisible(false);
    setIdProductoEditando(null);
  };

  // Eliminar
  const handleDelete = async (id: string) => {
    const nuevos = productos.filter((p) => p.id !== id);
    setProductos(nuevos);
    await guardarProductos(nuevos);
  };

  // Editar
  const handleEdit = (id: string) => {
    const p = productos.find((x) => x.id === id);
    if (!p) return;
    setNombre(p.nombre);
    setCantidad(String(p.cantidad));
    setIdProductoEditando(id);
    setModalVisible(true);
  };

  // Permisos cámara
  if (!permiso) return <View />;
  if (!permiso.granted) {
    return (
      <View style={estilos.centrado}>
        <Text style={estilos.mensaje}>Necesitamos tu permiso para la cámara</Text>
        <Button onPress={solicitarPermiso} title="Conceder Permiso" />
      </View>
    );
  }

  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.titulo}>Escanea un código de barras</Text>

      <CameraView
        style={estilos.camara}
        // algunos tipos de TS de expo-camera son estrictos; este cast evita warnings
        barcodeScannerSettings={{ barcodeTypes: ['qr', 'ean13', 'ean8'] as any }}
        onBarcodeScanned={handleBarcodeScanned}
      />

      {/* Modal de creación/edición */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setEscanneado(false);
          setIdProductoEditando(null);
        }}
      >
        <View style={estilos.contenedorModal}>
          <View style={estilos.contenidoModal}>
            <Text style={estilos.textoModal}>
              {idProductoEditando ? 'Editar Producto' : 'Producto escaneado:'} {datosEscaneados}
            </Text>

            <TextInput
              placeholder="Nombre del producto"
              value={nombre}
              onChangeText={setNombre}
              style={estilos.input}
            />
            <TextInput
              placeholder="Cantidad"
              value={cantidad}
              onChangeText={setCantidad}
              keyboardType="numeric"
              style={estilos.input}
            />

            <Button
              title={idProductoEditando ? 'Actualizar Producto' : 'Agregar Producto'}
              onPress={handleAddOrUpdate}
            />
            <View style={{ height: 8 }} />
            <Button
              title="Cancelar"
              onPress={() => {
                setModalVisible(false);
                setEscanneado(false);
                setIdProductoEditando(null);
              }}
            />
          </View>
        </View>
      </Modal>

      {/* Lista de productos */}
      <FlatList
        contentContainerStyle={{ paddingVertical: 8 }}
        data={productos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={estilos.item}>
            <View style={{ flex: 1 }}>
              <Text style={estilos.nombre}>{item.nombre}</Text>
              <Text style={estilos.detalle}>Cantidad: {item.cantidad}</Text>
              <Text style={estilos.detalleMini}>ID: {item.id}</Text>
            </View>
            <View style={estilos.acciones}>
              <Pressable onPress={() => handleEdit(item.id)}>
                <Text style={estilos.btnEditar}>Editar</Text>
              </Pressable>
              <Pressable onPress={() => handleDelete(item.id)}>
                <Text style={estilos.btnEliminar}>Eliminar</Text>
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={{ marginTop: 12 }}>No hay productos aún.</Text>}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, alignItems: 'center', padding: 16, backgroundColor: '#fff' },
  centrado: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16, backgroundColor: '#fff' },
  titulo: { fontSize: 18, marginBottom: 8, fontWeight: '600' },
  camara: { width: '100%', height: 300, borderRadius: 8, overflow: 'hidden' },
  mensaje: { textAlign: 'center', paddingBottom: 10 },
  contenedorModal: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  contenidoModal: { backgroundColor: '#fff', padding: 20, width: '85%', borderRadius: 12 },
  textoModal: { fontSize: 16, marginBottom: 10, fontWeight: '600' },
  input: { height: 44, borderColor: '#ccc', borderWidth: 1, marginVertical: 8, paddingHorizontal: 10, borderRadius: 8 },
  item: {
    width: '100%',
    maxWidth: 650,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    gap: 10,
  },
  nombre: { fontSize: 16, fontWeight: '600' },
  detalle: { fontSize: 14, color: '#444' },
  detalleMini: { fontSize: 12, color: '#777', marginTop: 2 },
  acciones: { flexDirection: 'row', gap: 16, paddingLeft: 8 },
  btnEditar: { color: '#1e40af', fontSize: 14, fontWeight: '600' },
  btnEliminar: { color: 'crimson', fontSize: 14, fontWeight: '600' },
});
