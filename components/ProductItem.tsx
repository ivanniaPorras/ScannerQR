import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import React, { useEffect, useState } from 'react';
import { Alert, Button, FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { cargarProductos, guardarProductos, type Producto } from '../utils/storage';

export default function ProductItem() {
  // Permisos
  const [permiso, solicitarPermiso] = useCameraPermissions();

  // Estado
  const [productos, setProductos] = useState<Producto[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null); // ID seleccionado/escaneado
  const [nombre, setNombre] = useState('');
  const [cantidad, setCantidad] = useState('');

  // Cargar persistencia
  useEffect(() => { (async () => setProductos(await cargarProductos()))(); }, []);

  // Escaneo: enfoca el producto (si existe, precarga datos)
  const handleScan = (r: BarcodeScanningResult) => {
    const id = r.data.trim();
    setEditingId(id);

    const p = productos.find(x => x.id === id);
    setNombre(p?.nombre ?? '');
    setCantidad(p ? String(p.cantidad) : '');

    setModalVisible(true);
  };

  // Guardar: crea o actualiza y mantiene foco en el producto
  const handleSave = async () => {
    if (!editingId || !nombre.trim() || !cantidad.trim()) {
      Alert.alert('Error', 'Completa nombre y cantidad.');
      return;
    } // Validar cantidad
    const cant = parseInt(cantidad, 10);
    if (!Number.isFinite(cant) || cant < 0) {
      Alert.alert('Error', 'Cantidad inválida.');
      return;
    }
// Actualizar o crear
    const existe = productos.some(p => p.id === editingId);
    const nuevos = existe
      ? productos.map(p => (p.id === editingId ? { ...p, nombre: nombre.trim(), cantidad: cant } : p))
      : [...productos, { id: editingId, nombre: nombre.trim(), cantidad: cant, fecha: new Date().toISOString() }]; 

    setProductos(nuevos);
    await guardarProductos(nuevos);

    setModalVisible(false);
    setNombre('');
    setCantidad('');
    // OJO: NO limpiamos editingId para que la tarjeta superior siga mostrándose
  };

  // Editar desde la lista
  const handleEdit = (id: string) => {
    const p = productos.find(x => x.id === id);
    if (!p) return;
    setEditingId(id);
    setNombre(p.nombre);
    setCantidad(String(p.cantidad));
    setModalVisible(true);
  };

  // Eliminar
  const handleDelete = async (id: string) => {
    const nuevos = productos.filter(p => p.id !== id);
    setProductos(nuevos);
    await guardarProductos(nuevos);
    if (editingId === id) setEditingId(null); // si borraste el actual, oculta tarjeta
  };

  // Permisos camara
  if (!permiso) return <View />;
  if (!permiso.granted) {
    return (
      <View style={s.center}>
        <Text style={s.msg}>Necesitamos tu permiso para la cámara</Text>
        <Button title="Conceder Permiso" onPress={solicitarPermiso} />
      </View>
    );
  }

  // Producto actual 
  const actual = editingId ? productos.find(p => p.id === editingId) ?? null : null;

// Lista sin el actual
  const dataLista = editingId ? productos.filter(p => p.id !== editingId) : productos;

  return (
    <View style={s.screen}>
      <Text style={s.title}>Inventario — Escanea un código de barras</Text>

      <CameraView
        style={s.camera}
        barcodeScannerSettings={{ barcodeTypes: ['qr', 'ean13', 'ean8'] as any }}
        onBarcodeScanned={handleScan}
      />

      {/* Tarjeta del producto actual */}
      {actual && (
        <View style={s.card}>
          <View style={{ flex: 1 }}>
            <Text style={s.cardName}>{actual.nombre || 'Sin nombre'}</Text>
            <Text style={s.cardText}>Cantidad: {actual.cantidad ?? 0}</Text>
            <Text style={s.cardId}>ID: {actual.id}</Text>
          </View>
          <View style={s.actions}>
            <Pressable onPress={() => handleEdit(actual.id)}>
              <Text style={s.btnEdit}>Editar</Text>
            </Pressable>
            <Pressable onPress={() => handleDelete(actual.id)}>
              <Text style={s.btnDelete}>Eliminar</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Lista (sin el seleccionado) */}
      <FlatList
        data={dataLista}
        keyExtractor={(item) => item.id}
        extraData={[productos, editingId]}
        contentContainerStyle={{ paddingVertical: 8 }}
        renderItem={({ item }) => (
          <View style={s.item}>
            <View style={{ flex: 1 }}>
              <Text style={s.itemName}>{item.nombre || 'Sin nombre'}</Text>
              <Text style={s.itemText}>Cantidad: {item.cantidad ?? 0}</Text>
              <Text style={s.itemId}>ID: {item.id}</Text>
            </View>
            <View style={s.actions}>
              <Pressable onPress={() => handleEdit(item.id)}>
                <Text style={s.btnEdit}>Editar</Text>
              </Pressable>
              <Pressable onPress={() => handleDelete(item.id)}>
                <Text style={s.btnDelete}>Eliminar</Text>
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={s.empty}>No hay productos aún.</Text>}
      />

      {/* Modal crear/editar */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={s.modalWrap}>
          <View style={s.modal}>
            <Text style={s.modalTitle}>Producto</Text>
            <Text style={s.modalHint}>ID: {editingId ?? '—'}</Text>

            <TextInput
              placeholder="Nombre"
              placeholderTextColor="#9aa4b2"
              value={nombre}
              onChangeText={setNombre}
              style={s.input}
            />
            <TextInput
              placeholder="Cantidad"
              placeholderTextColor="#9aa4b2"
              value={cantidad}
              onChangeText={setCantidad}
              keyboardType="numeric"
              style={s.input}
            />

            <Button title="Guardar" onPress={handleSave} />
            <View style={{ height: 8 }} />
            <Button title="Cancelar" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}
// Paleta basica de colores
const color = {
  bg: '#0B1020',
  panel: '#1E293B',
  border: '#334155',
  text: '#F8FAFC',
  sub: '#94A3B8',
  link: '#3B82F6',
  danger: '#EF4444',
};

// Estilos simples y ordenados
const s = StyleSheet.create({
  // Layout base
  screen: { flex: 1, backgroundColor: color.bg, alignItems: 'center', padding: 16 },
  center: { flex: 1, backgroundColor: color.bg, alignItems: 'center', justifyContent: 'center' },

  // Texto
  title: { width: '100%', maxWidth: 760, color: color.text, fontSize: 20, fontWeight: '700', marginBottom: 12 },
  msg: { color: color.sub, fontSize: 14, marginBottom: 8 },

  // Camara
  camera: {
    width: '100%',
    maxWidth: 760,
    height: 240,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: color.link,
    marginBottom: 12,
  },

  // tarjeta del producto actual
  card: {
    width: '100%',
    maxWidth: 760,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: color.panel,
    borderWidth: 1,
    borderColor: color.border,
    marginBottom: 12,
  },
  cardName: { color: color.text, fontSize: 16, fontWeight: '700' },
  cardText: { color: color.sub, fontSize: 14, marginTop: 2 },
  cardId: { color: '#CBD5E1', fontSize: 12, marginTop: 4 },

  // items de la lista
  item: {
    width: '100%',
    maxWidth: 760,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: color.panel,
    borderWidth: 1,
    borderColor: color.border,
    marginBottom: 10,
  },
  itemName: { color: color.text, fontSize: 16, fontWeight: '700' },
  itemText: { color: color.sub, fontSize: 14, marginTop: 2 },
  itemId: { color: '#CBD5E1', fontSize: 12, marginTop: 4 },

  // Acciones
  actions: { flexDirection: 'row', gap: 12, paddingLeft: 8 },
  btnEdit: {
    color: color.link,
    borderColor: color.link,
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    overflow: 'hidden',
  },
  btnDelete: {
    color: color.danger,
    borderColor: color.danger,
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    overflow: 'hidden',
  },

  // Modal
  modalWrap: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  modal: {
    width: '90%',
    maxWidth: 560,
    backgroundColor: color.panel,
    borderColor: color.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
  },
  modalTitle: { color: color.text, fontSize: 18, fontWeight: '700', marginBottom: 4 },
  modalHint: { color: color.sub, fontSize: 12, marginBottom: 10 },

  // Inputs
  input: {
    height: 44,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: color.border,
    color: color.text,
    paddingHorizontal: 10,
    marginVertical: 6,
    backgroundColor: 'transparent',
  },

  // Lista vacía
  empty: { color: '#9CA3AF', textAlign: 'center', marginTop: 12, fontSize: 14 },
}); 