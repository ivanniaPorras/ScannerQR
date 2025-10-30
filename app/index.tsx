import AsyncStorage from '@react-native-async-storage/async-storage';
import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useEffect, useState } from 'react';
import { Alert, Button, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function App() {
  const [permiso, solicitarPermiso] = useCameraPermissions(); // Solicitar permisos de la camara
  const [escanneado, setEscanneado] = useState(false);
  const [productos, setProductos] = useState<any[]>([]);
  const [nombre, setNombre] = useState(''); 
  const [cantidad, setCantidad] = useState(''); 
  const [datosEscaneados, setDatosEscaneados] = useState<string>(''); // Datos escaneados del código de barras
  const [modalVisible, setModalVisible] = useState(false);
  const [idProductoEditando, setIdProductoEditando] = useState<string | null>(null);

  useEffect(() => {
    // Cargar los productos de AsyncStorage al iniciar
    const cargarProductos = async () => {
      try {
        const productosGuardados = await AsyncStorage.getItem('productos');
        if (productosGuardados) {
          setProductos(JSON.parse(productosGuardados));
        }
      } catch (error) {
        console.log('Error al cargar productos de AsyncStorage', error);
      }
    };
    cargarProductos();
  }, []);

  const handleBarcodeScanned = ({ type, data }: any) => {
    if (!escanneado) {
      setEscanneado(true);
      setDatosEscaneados(data); // Guardar los datos del código escaneado
      setModalVisible(true); // Mostrar el modal cuando se escanea un código
    }
  };

  const handleAddProduct = () => {
    if (!nombre || !cantidad || !datosEscaneados) {
      Alert.alert('Error', 'Debe completar todos los campos.');
      return;
    }

    const nuevoProducto = {
      id: datosEscaneados, // el código escaneado es el ID único
      nombre,
      cantidad: parseInt(cantidad),
      fecha: new Date().toISOString(),
    };

    // Editar un producto existente
    if (idProductoEditando) {
      const productosActualizados = productos.map((producto) =>
        producto.id === idProductoEditando
          ? { ...producto, nombre, cantidad: parseInt(cantidad) } // Actualiza el producto
          : producto
      );
      setProductos(productosActualizados);
      AsyncStorage.setItem('productos', JSON.stringify(productosActualizados)); // Guarda en AsyncStorage
    } else {
      // Si no estamos editando, agregamos un nuevo producto
      const productosActualizados = [...productos, nuevoProducto];
      setProductos(productosActualizados);
      AsyncStorage.setItem('productos', JSON.stringify(productosActualizados)); // Guarda en AsyncStorage
    }

    // Restablecer los campos
    setNombre('');
    setCantidad('');
    setEscanneado(false); 
    setDatosEscaneados('');
    setModalVisible(false); // Cerrar el modal después de agregar o editar el producto
    setIdProductoEditando(null); // Restablecer el ID de producto editado
  };

  const handleDeleteProduct = (id: string) => {
    const productosActualizados = productos.filter(producto => producto.id !== id);
    setProductos(productosActualizados);
    AsyncStorage.setItem('productos', JSON.stringify(productosActualizados)); // Guardar los cambios
  };

  const handleEditProduct = (id: string) => {
    const productoAEditar = productos.find(producto => producto.id === id);
    if (productoAEditar) {
      setNombre(productoAEditar.nombre);
      setCantidad(productoAEditar.cantidad.toString());
      setIdProductoEditando(id); // Establecer el ID del producto que estamos editando
      setModalVisible(true); // Mostrar el modal para editar
    }
  };

  // permisos de la camara
  if (!permiso) {
    return <View />;
  }

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
      <Text>Escanea un código de barras</Text>

      {/* Vista de la cámara */}
      <CameraView
        style={estilos.camara}
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'ean13', 'ean8'],
        }}
        onBarcodeScanned={handleBarcodeScanned}  // Detecta el escaneo
      />

      {/* Modal para poner los detalles del producto escaneado */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={estilos.contenedorModal}>
          <View style={estilos.contenidoModal}>
            <Text style={estilos.textoModal}>{idProductoEditando ? 'Editar Producto' : 'Producto escaneado: '}{datosEscaneados}</Text>
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
            <Button title={idProductoEditando ? "Actualizar Producto" : "Agregar Producto"} onPress={handleAddProduct} />
            <Button title="Cancelar" onPress={() => { 
              setModalVisible(false); 
              setEscanneado(false); // Resetear el estado de escaneo para permitir un nuevo escaneo
              setIdProductoEditando(null); // Resetear el ID del producto editado
            }} />
          </View>
        </View>
      </Modal>

      {/* Lista de productos guardados */}
      <FlatList
        data={productos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={estilos.itemProducto}>
            <Text>{item.nombre} - {item.cantidad}</Text>
            <TouchableOpacity onPress={() => handleEditProduct(item.id)}>
              <Text style={estilos.editarEliminar}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteProduct(item.id)}>
              <Text style={estilos.editarEliminar}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  camara: {
    width: '100%',
    height: 300,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginVertical: 10,
    paddingLeft: 8,
    width: '80%',
  },
  mensaje: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  itemProducto: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  editarEliminar: {
    color: 'blue',
    fontSize: 16,
  },
  contenedorModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  contenidoModal: {
    backgroundColor: 'white',
    padding: 20,
    width: '80%',
    borderRadius: 10,
  },
  textoModal: {
    fontSize: 18,
    marginBottom: 10,
  },
});
