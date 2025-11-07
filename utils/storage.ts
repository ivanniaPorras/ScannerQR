// utils/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Producto = {
  id: string;
  nombre: string;
  cantidad: number;
  fecha?: string; // ISO
};

const KEY = '@productos_v1';
// Cargar lista de productos
export async function cargarProductos(): Promise<Producto[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const arr: Producto[] = JSON.parse(raw);
    // Validar estructura básica
    if (!Array.isArray(arr)) return [];
    return arr.filter(p => p && typeof p.id === 'string');
  } catch {
    return [];
  }
}
// Guardar lista de productos
export async function guardarProductos(productos: Producto[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(productos));
  } catch {
    // opcional: puedes mostrar un Alert desde el componente si deseas
  }
}

export async function limpiarProductos(): Promise<void> {
  try { await AsyncStorage.removeItem(KEY); } catch {}
}
