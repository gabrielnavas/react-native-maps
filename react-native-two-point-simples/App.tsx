import React, { useState, useEffect, useRef } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { calculateDistance } from './helpers/calculate-distance';

type Marker = {
  latitude: number,
  longitude: number,
  title: string,
  subtitle: string,
  icon?: any
}

const MapScreen = () => {
  const [location, setLocation] = useState<any>(null);
  const mapRef = useRef<MapView>(null); // Referência ao MapView

  const [isGPSEnabled, setIsGPSEnabled] = useState(false);

  const [markerYou, setMarkerYou] = useState<Marker | null>(null)
  const [markerTarget, setMarkerTarget] = useState<Marker | null>(null)

  const [distanceBetweenMarkers, setDistanceBetweenMarkers] = useState(0.0)

  useEffect(() => {
    const checkGPS = async () => {
      try {
        const { locationServicesEnabled } = await Location.getProviderStatusAsync();
        setIsGPSEnabled(locationServicesEnabled)

      } catch (error) {
        console.error('Erro ao verificar o status do GPS:', error);
      }
    };

    checkGPS();

    const interval = setInterval(checkGPS, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const checkDistanceBetweenMarkers = () => {
      if (markerYou && markerTarget) {
        // localizacao entre os dois pontos
        const distanceBetweenMarkers = calculateDistance(
          markerYou.latitude,
          markerYou.longitude,
          markerTarget.latitude,
          markerTarget.longitude
        );
        setDistanceBetweenMarkers(distanceBetweenMarkers)
      }
    }

    const interval = setInterval(checkDistanceBetweenMarkers, 2000);

    return () => clearInterval(interval);
  }, [])


  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permissão de localização negada.');
        return;
      }

      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (newLocation) => {
          setLocation(newLocation);

          setMarkerYou({
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
            title: 'Você',
            subtitle: 'Você',
          })
          setMarkerTarget({
            icon: require('./assets/img1.png'),
            latitude: 40.730610,
            longitude: -73.935242,
            title: 'Moto boy',
            subtitle: 'Moto boy',
          })
        }
      );
    })();
  }, []);

  useEffect(() => {
    if (mapRef.current && markerYou && markerTarget) {
      mapRef.current.fitToCoordinates(
        [
          {
            latitude: markerYou.latitude,
            longitude: markerYou.longitude,
          },
          {
            latitude: markerTarget.latitude,
            longitude: markerTarget.longitude,
          },
        ],
        {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        }
      );
    }
  }, [location, markerYou, markerTarget]);

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        loadingEnabled={true}
        showsUserLocation={true}
      >
        {
          markerYou && (
            <Marker
              coordinate={{
                latitude: markerYou.latitude,
                longitude: markerYou.longitude,
              }}
              title={markerYou.title}
              description={markerYou.subtitle}
              image={markerYou.icon} // Define o ícone personalizado
            />
          )
        }
        {
          markerTarget && (
            <Marker
              coordinate={{
                latitude: markerTarget.latitude,
                longitude: markerTarget.longitude,
              }}
              title={markerTarget.title}
              description={markerTarget.subtitle}
              image={markerTarget.icon} // Define o ícone personalizado
            />
          )
        }
      </MapView>
      <View style={styles.bottom}>
        <View style={styles.distanceKmContainer}>
          <Text style={styles.distanceKmText}>
            Distância entre os markers: {distanceBetweenMarkers} km
          </Text>
        </View>
        {(
          <View style={styles.distanceKmContainer}>
            <Text style={styles.distanceKmText}>
              GPS is {isGPSEnabled ? 'on' : 'off'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  bottom: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    right: 10,
  },
  distanceKmContainer: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  distanceKmText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});


export default MapScreen;
