import { useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { cargarProductos, guardarProductos } from '../utils/storage';

export default function useProductos() {
  const [productos, setProductos] = useState([]);
  const [productoEditando, setProductoEditando] = useState(null);

  useEffect(() => {
    (async () => { // carga inicial de productos
      const lista = await cargarProductos();
      setProductos(lista);
    })();
  }, []);

  const agregarOActualizar = async ({ id, nombre, cantidad }) => { // agrega o actualiza un producto
    if (!id || !nombre || cantidad == null || Number.isNaN(Number(cantidad))) {
      Alert.alert('Error', 'Datos incompletos o inválidos.');
      return false;
    }

    const existe = productos.some((p) => p.id === id); //
    let lista;
    if (existe) {
      lista = productos.map((p) =>// actualiza si ya existe
        p.id === id ? { ...p, nombre, cantidad: Number(cantidad) } : p //
      );
    } else { // agrega nuevo producto
      lista = [
        ...productos,
        { id, nombre, cantidad: Number(cantidad), fecha: new Date().toISOString() },
      ];
    }
    setProductos(lista); // actualiza estado
    await guardarProductos(lista); 
    setProductoEditando(null);
    return true;
  };

  const eliminar = async (id) => { // elimina un producto por id
    const lista = productos.filter((p) => p.id !== id);
    setProductos(lista);
    await guardarProductos(lista);
  };

  const prepararEdicion = (id) => { // prepara un producto para edición
    const p = productos.find((x) => x.id === id);
    if (p) setProductoEditando(p);
  };

  const limpiarEdicion = () => setProductoEditando(null); // limpia el estado de edición

  const totalProductos = useMemo( // suma total de cantidades
    () => productos.reduce((acc, p) => acc + Number(p.cantidad || 0), 0),
    [productos]
  );

  return {
    productos,
    totalProductos,
    productoEditando,
    agregarOActualizar,
    eliminar,
    prepararEdicion,
    limpiarEdicion,
  };
}
