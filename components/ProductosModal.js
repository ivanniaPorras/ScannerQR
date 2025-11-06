import { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';

export default function ProductModal({
  modoEdicion,
  idBase,               // codigo escaneado o id existente
  valoresIniciales,     // { nombre, cantidad }
  onGuardar,            // ({ nombre, cantidad }) => void
  onCancelar,
}) {
  const [nombre, setNombre] = useState(valoresIniciales.nombre);
  const [cantidad, setCantidad] = useState(valoresIniciales.cantidad);

  const handleGuardar = () => {
    if (!nombre || !cantidad || !idBase) {
      alert('Completa todos los campos.');
      return;
    }
    onGuardar({ nombre, cantidad });
  };

  return (
    <View>
      <Text style={estilos.titulo}>
        {modoEdicion ? 'Editar producto' : `Producto escaneado: ${idBase}`}
      </Text>

      <TextInput
        style={estilos.input}
        placeholder="Nombre del producto"
        value={nombre}
        onChangeText={setNombre}
      />

      <TextInput
        style={estilos.input}
        placeholder="Cantidad"
        keyboardType="numeric"
        value={cantidad}
        onChangeText={setCantidad}
      />

      <Button title={modoEdicion ? 'Actualizar' : 'Agregar'} onPress={handleGuardar} />
      <View style={{ height: 8 }} />
      <Button title="Cancelar" onPress={onCancelar} />
    </View>
  );
}

const estilos = StyleSheet.create({
  titulo: { fontSize: 18, fontWeight: '600', marginBottom: 10 },
  input: {
    height: 42, borderWidth: 1, borderColor: '#bbb', borderRadius: 8,
    paddingHorizontal: 10, marginBottom: 10,
  },
});
