import { FlatList, Text, View } from 'react-native';
import ProductItem from './ProductoItem';

export default function ProductList({ productos, onEdit, onDelete }) {
  return ( 
    <FlatList
      style={{ width: '100%', marginTop: 12 }}
      data={productos}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ProductItem
          producto={item}
          onEdit={() => onEdit(item.id)}
          onDelete={() => onDelete(item.id)}
        />
      )}
      ListEmptyComponent={
        <View style={{ paddingVertical: 16 }}>
          <Text style={{ textAlign: 'center' }}>No hay productos registrados.</Text>
        </View>
      }
    />
  );
}
