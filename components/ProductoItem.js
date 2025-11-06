import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ProductItem({ producto, onEdit, onDelete }) {
  return (
    <View style={estilos.item}>
      <View>
        <Text style={estilos.nombre}>{producto.nombre}</Text>
        <Text style={estilos.detalle}>Cantidad: {producto.cantidad}</Text>
        {producto.fecha ? (
          <Text style={estilos.fecha}>
            {new Date(producto.fecha).toLocaleString()}
          </Text>
        ) : null}
        <Text style={estilos.id}>ID: {producto.id}</Text>
      </View>

      <View style={estilos.acciones}>
        <TouchableOpacity onPress={onEdit}>
          <Text style={estilos.accion}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete}>
          <Text style={[estilos.accion, { color: 'crimson' }]}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  item: {
    width: '100%',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nombre: { fontSize: 16, fontWeight: '600' },
  detalle: { fontSize: 14, color: '#333', marginTop: 2 },
  fecha: { fontSize: 12, color: '#666', marginTop: 2 },
  id: { fontSize: 11, color: '#999', marginTop: 4 },
  acciones: { flexDirection: 'row', gap: 16 },
  accion: { color: 'blue', fontSize: 15 },
});
