
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'fitcoin_user_token';

// Guardar el JWT de forma cifrada (Cifrado Simétrico por Hardware)
export const saveToken = async (token) => {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch (error) {
    console.error('Error al guardar el token de forma segura:', error);
    throw error;
  }
};

// Recuperar el JWT para hacer peticiones protegidas al backend
export const getToken = async () => {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('Error al recuperar el token seguro:', error);
    return null;
  }
};

// Eliminar el token (Cerrar sesión)
export const removeToken = async () => {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('Error al eliminar el token seguro:', error);
  }
};