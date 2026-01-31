import { useEffect, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  ZoomControl,
  Popup,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import { motion } from 'framer-motion';

interface RouteMapProps {
  userLat: number;
  userLng: number;
  destLat: number;
  destLng: number;
  showHospitalPins?: boolean;
  selectedHospitalId?: string;
  sosTriggered?: boolean;
  onRouteFound?: (distance: number, time: number) => void;
}

/* ---------------- AUTO FOLLOW USER ---------------- */
function FollowUser({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();

  useEffect(() => {
    map.setView([lat, lng], map.getZoom(), { animate: true });
  }, [lat, lng, map]);

  return null;
}

/* ---------------- ROUTING ---------------- */
function Routing({
  userLat,
  userLng,
  destLat,
  destLng,
  onRouteFound,
}: RouteMapProps) {
  const map = useMap();
  const routingRef = useRef<L.Routing.Control | null>(null);

  useEffect(() => {
    if (routingRef.current) {
      map.removeControl(routingRef.current);
      routingRef.current = null;
    }

    const control = L.Routing.control({
      waypoints: [L.latLng(userLat, userLng), L.latLng(destLat, destLng)],
      router: L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1',
        profile: 'driving',
      }),
      addWaypoints: false,
      draggableWaypoints: false,
      routeWhileDragging: false,
      show: false,
      lineOptions: { styles: [{ color: '#dc2626', weight: 6 }] },
    }).addTo(map);

    control.on('routesfound', (e: any) => {
      const route = e.routes[0];
      if (!route) return;

      // Send distance/time to parent
      if (onRouteFound) {
        onRouteFound(route.summary.totalDistance, route.summary.totalTime);
      }

      // Voice directions
      speechSynthesis.cancel();
      const instructions = route.instructions || [];
      let delay = 0;
      instructions.forEach((step: any) => {
        const msg = new SpeechSynthesisUtterance(
          step.text.replace(/<[^>]+>/g, ''),
        );
        msg.lang = 'en-US';
        setTimeout(() => speechSynthesis.speak(msg), delay);
        delay += 3500;
      });
    });

    routingRef.current = control;

    return () => {
      speechSynthesis.cancel();
      if (routingRef.current) {
        map.removeControl(routingRef.current);
      }
    };
  }, [map, userLat, userLng, destLat, destLng, onRouteFound]);

  return null;
}

/* ---------------- MAIN MAP ---------------- */
export default function RouteMap(props: RouteMapProps) {
  // Fix marker icons
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });

  return (
    <MapContainer
      center={[props.userLat, props.userLng]}
      zoom={15}
      zoomControl={false}
      style={{ height: '100%', width: '100%' }}
    >
      <ZoomControl position="topright" />

      {/* Tiles */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap contributors"
      />

      {/* Auto follow user */}
      <FollowUser lat={props.userLat} lng={props.userLng} />

      {/* User Marker */}
      <Marker position={[props.userLat, props.userLng]}>
        <Popup>You are here</Popup>
      </Marker>

      {/* Destination Marker */}
      {props.sosTriggered ? (
        <motion.div
          className="glow-marker"
          style={{
            position: 'absolute',
            width: 25,
            height: 25,
            backgroundColor: '#dc2626',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1000,
          }}
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
        >
          <Marker position={[props.destLat, props.destLng]}>
            <Popup>Hospital / Destination</Popup>
          </Marker>
        </motion.div>
      ) : (
        <Marker position={[props.destLat, props.destLng]}>
          <Popup>Hospital / Destination</Popup>
        </Marker>
      )}

      {/* Routing */}
      <Routing {...props} />
    </MapContainer>
  );
}
