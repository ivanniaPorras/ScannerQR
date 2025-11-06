import { useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import useProductos from '../hooks/productos';
import ProductList from './ProductoLista';
import ProductModal from './ProductosModal';
import Scanner from './Scanner';

export default function ProductosScreen() {
  const {
    productos,
    agregarOActualizar,
    eliminar,
    prepararEdicion,
    productoEditando,
    limpiarEdicion,
  } = useProductos();

  // Control del modal
  const [modalVisible, setModalVisible] = useState(false);
  // Estado temporal del escaneo
  const [codigoEscaneado, setCodigoEscaneado] = useState('');

  const handleScan = (codigo) => {
    setCodigoEscaneado(codigo);
    if (!productoEditando) setModalVisible(true);
  };

  const handleGuardar = async ({ nombre, cantidad }) => {
    await agregarOActualizar({
      id: productoEditando?.id || codigoEscaneado,
      nombre,
      cantidad: parseInt(cantidad, 10),
    });
    setCodigoEscaneado('');
    setModalVisible(false);
  };

  const handleCancelar = () => {
    setCodigoEscaneado('');
    limpiarEdicion();
    setModalVisible(false);
  };

  const handleEditar = (id) => {
    prepararEdicion(id);
    setModalVisible(true);
  };

  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.titulo}>ScanList</Text>

      <Scanner onScan={handleScan} />

      <ProductList
        productos={productos}
        onEdit={handleEditar}
        onDelete={eliminar}
      />

      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={handleCancelar}
      >
        <View style={estilos.contenedorModal}>
          <View style={estilos.modalContenido}>
            <ProductModal 
              modoEdicion={!!productoEditando} // true si estamos editando
              idBase={productoEditando?.id || codigoEscaneado} // para mostrar en el título
              valoresIniciales={{
                nombre: productoEditando?.nombre || '',
                cantidad:
                  productoEditando?.cantidad != null
                    ? String(productoEditando.cantidad)
                    : '',
              }}
              onGuardar={handleGuardar}
              onCancelar={handleCancelar}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 16 },
  titulo: { fontSize: 20, fontWeight: '700', marginTop: 12, marginBottom: 8, textAlign: 'center' },
  contenedorModal: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContenido: {
    backgroundColor: '#fff', width: '88%', borderRadius: 12, padding: 16,
  },
});
