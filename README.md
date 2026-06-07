# Scanner Móviles

Aplicación móvil de **inventario por escaneo de códigos** construida con **React Native + Expo** (TypeScript). Usa la cámara del dispositivo para escanear códigos de barras y QR, y con ellos crear y gestionar una lista de productos que se guarda localmente. Cada producto se identifica por el código escaneado, junto a su nombre y cantidad.

## Características

- **Escaneo con la cámara** de códigos QR, EAN-13 y EAN-8 mediante `expo-camera`.
- **Gestión de permisos de cámara**: la app solicita el permiso al usuario antes de activar el escáner.
- **Registro de productos**: al escanear un código se abre un modal para ingresar el nombre y la cantidad del producto.
- **CRUD completo**: crear, editar y eliminar productos. Si se escanea un código ya existente, se actualiza el producto en lugar de duplicarlo.
- **Buscador** que filtra productos por nombre, ID (código) o cantidad en tiempo real.
- **Ordenamiento** de la lista por fecha de registro (más recientes primero).
- **Persistencia local** con AsyncStorage: los productos se conservan entre sesiones sin necesidad de conexión ni backend.
- **Validaciones**: campos obligatorios y cantidad numérica válida.

## Tecnologías

- **Framework:** React Native 0.81 con Expo (~54) y **TypeScript**
- **Enrutamiento:** Expo Router (rutas basadas en archivos)
- **Cámara y escaneo:** `expo-camera` y `expo-barcode-scanner`
- **Almacenamiento local:** AsyncStorage
- **Plataformas:** Android, iOS y Web

## Estructura del proyecto

```
scanner_moviles/
├── app/
│   ├── _layout.tsx          # Layout raíz (Stack de Expo Router)
│   └── index.tsx            # Pantalla principal: escáner, lista y acciones
├── components/
│   └── ProductItem.tsx      # Modal de alta/edición y función de filtrado
├── utils/
│   └── storage.ts           # Tipo Producto y persistencia con AsyncStorage
├── assets/images/           # Íconos e imágenes de la app
├── app.json                 # Configuración de Expo y plugins
└── package.json
```

### Modelo de datos
Cada **producto** se representa así:

```ts
type Producto = {
  id: string;        // Código escaneado (identificador único)
  nombre: string;    // Nombre del producto
  cantidad: number;  // Cantidad en inventario
  fecha?: string;    // Fecha de registro (ISO)
};
```

La lista completa se guarda en AsyncStorage bajo la clave `@scanlist:productos:v1`.

## Instalación y ejecución

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/ivanniaPorras/scanner_moviles.git
   cd scanner_moviles
   ```
2. Instalar las dependencias:
   ```bash
   npm install
   ```
3. Iniciar el proyecto con Expo:
   ```bash
   npm start
   ```
4. Ejecutar en la plataforma deseada:
   ```bash
   npm run android   # Android
   npm run ios       # iOS
   npm run web       # Web
   ```

Para probar el escaneo es necesario un **dispositivo físico** con cámara (por ejemplo mediante la app **Expo Go**), ya que los emuladores no disponen de una cámara real.

## Cómo se usa

1. Concede el permiso de cámara cuando la app lo solicite.
2. Apunta la cámara a un código de barras o QR.
3. En el modal, ingresa el nombre y la cantidad y confirma para guardarlo.
4. Usa el buscador para encontrar productos, o los botones **Editar** y **Eliminar** de cada tarjeta para gestionarlos.

## Autoría

Proyecto desarrollado por [ivanniaPorras](https://github.com/ivanniaPorras).
