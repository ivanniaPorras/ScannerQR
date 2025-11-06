import AsyncStorage from '@react-native-async-storage/async-storage';

const CLAVE = 'productos';

export async function cargarProductos() {
  try { // lee la lista de productos almacenados
    const raw = await AsyncStorage.getItem(CLAVE); // obtener el string JSON
    return raw ? JSON.parse(raw) : []; // si no hay nada, devuelve lista vacía
  } catch (e) {
    console.log('Error al cargar productos', e);
    return [];
  }
}

export async function guardarProductos(productos) {
  try { // guarda la lista de productos
    await AsyncStorage.setItem(CLAVE, JSON.stringify(productos)); // guarda como string JSON
    return true; 
  } catch (e) {
    console.log('Error al guardar productos', e);
    return false;
  }
}
