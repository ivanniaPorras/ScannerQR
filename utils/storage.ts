import AsyncStorage from '@react-native-async-storage/async-storage';

export type Producto = {
  id: string;
  nombre: string;
  cantidad: number;
  fecha?: string;
};

const CLAVE = '@scanlist:productos:v1';

export async function cargarProductos(): Promise<Producto[]> {
  try {
    const raw = await AsyncStorage.getItem(CLAVE);
    if (!raw) return [];
    const lista = JSON.parse(raw) as Producto[];
    // sanea campos mínimos
    return Array.isArray(lista)
      ? lista.map(p => ({
          id: String(p.id),
          nombre: String(p.nombre ?? ''),
          cantidad: Number.isFinite(p.cantidad as any) ? Number(p.cantidad) : 0,
          fecha: p.fecha,
        }))
      : [];
  } catch {
    return [];
  }
}
// Guarda (sobrescribe) la lista completa
export async function guardarProductos(lista: Producto[]): Promise<void> {
  await AsyncStorage.setItem(CLAVE, JSON.stringify(lista));
}
