import AsyncStorage from '@react-native-async-storage/async-storage';

export type Producto = {
  id: string;       // código escaneado
  nombre: string;
  cantidad: number;
  fecha?: string;   // ISO
};

const KEY = 'productos';

export const cargarProductos = async (): Promise<Producto[]> => {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Producto[]) : [];
  } catch (e) {
    console.log('Error al cargar productos:', e);
    return [];
  }
};

export const guardarProductos = async (productos: Producto[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(productos));
  } catch (e) {
    console.log('Error al guardar productos:', e);
  }
};
