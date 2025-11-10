import React from 'react';
import { Button, Modal, StyleSheet, Text, TextInput, View } from 'react-native';
import type { Producto } from '../utils/storage';

// Funcion para filtrar productos (cantidad, nombre o id)
export const filtrarProductos = (lista: Producto[], query: string): Producto[] => {
  const q = (query ?? '').trim().toLowerCase();
  if (!q) return lista;

  return lista.filter(p => {
    const nombre = (p.nombre ?? '').toLowerCase();
    const cantidad = String(p.cantidad ?? '');
    const id = String(p.id ?? '');
    return nombre.includes(q) || cantidad.includes(q) || id.includes(q);
  });
};

// Componente del modal
type Props = {
  visible: boolean;
  isEditing: boolean;
  codigo: string;
  nombre: string;
  cantidad: string;
  onChangeNombre: (v: string) => void;
  onChangeCantidad: (v: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ProductItem({
  visible,
  isEditing,
  codigo,
  nombre,
  cantidad,
  onChangeNombre,
  onChangeCantidad,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onCancel}>
      <View style={s.wrap}>
        <View style={s.modal}>
          <Text style={s.title}>{isEditing ? 'Editar Producto' : 'Nuevo Producto'}</Text>
          <Text style={s.hint}>ID: {codigo || '—'}</Text>

          <TextInput
            placeholder="Nombre del producto"
            value={nombre}
            onChangeText={onChangeNombre}
            style={s.input}
          />
          <TextInput
            placeholder="Cantidad"
            value={cantidad}
            onChangeText={onChangeCantidad}
            keyboardType="numeric"
            style={s.input}
          />

          <Button title={isEditing ? 'Actualizar' : 'Agregar'} onPress={onConfirm} />
          <View style={{ height: 8 }} />
          <Button title="Cancelar" onPress={onCancel} />
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modal: { backgroundColor: 'white', padding: 20, width: '85%', borderRadius: 10 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  hint: { fontSize: 12, color: '#6B7280', marginBottom: 10 },
  input: { height: 44, borderColor: 'gray', borderWidth: 1, marginVertical: 10, paddingLeft: 8, width: '100%', borderRadius: 6 },
});
