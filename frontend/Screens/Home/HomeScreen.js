import React from 'react';
import { Text, View, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import useHome from './useHome';
import { styles } from './HomeStyle'; 

export default function HomeScreen({ route, onLogout }) {
  const { userName, fitcoinsAccumulated, handleLogout } = useHome(route, onLogout);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      
      <View style={styles.content}>
        
        {/* ENCABEZADO: Usuario e indicador de sesión */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>¡Hola, qué bueno verte!</Text>
            <Text style={styles.userNameText}>{userName}</Text>
          </View>
          
          <View style={styles.sessionBadge}>
            <View style={styles.greenDot} />
            <Text style={styles.sessionText}>Sesión Activa</Text>
          </View>
        </View>

        {/* TARJETA DE BALANCE: Puntos acumulados */}
        <View style={styles.balanceCard}>
          <Text style={styles.cardLabel}>PUNTOS ACUMULADOS</Text>
          <Text style={styles.cardBalance}>
            {fitcoinsAccumulated} <Text style={styles.currency}>$FTC</Text>
          </Text>
          <Text style={styles.cardSubtext}>
            ¡Sigue acumulando FitCoins con tu actividad física!
          </Text>
        </View>

        {/* ÁREA DE CONTENIDO: Espacio para OAuth 2.0 y Multi-factor */}
        <View style={styles.placeholderSection}>
          <Text style={styles.placeholderText}>
            Próximamente nuevas funciones...
          </Text>
        </View>

        {/* BOTÓN DE CIERRE DE SESIÓN */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}