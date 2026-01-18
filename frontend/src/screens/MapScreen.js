import axios from 'axios';
import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  LoadScript,
  GoogleMap,
  StandaloneSearchBox,
  Marker,
} from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';
import { Store } from '../Store';
import Button from 'react-bootstrap/Button';
import { toast } from 'react-toastify';

const defaultLocation = { lat: 45.516, lng: -73.56 };
const libs = ['places'];

export default function MapScreen() {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo } = state;
  const navigate = useNavigate();

  const [googleApiKey, setGoogleApiKey] = useState('');
  const [center, setCenter] = useState(defaultLocation);
  const [location, setLocation] = useState(defaultLocation);
  const [loadingKey, setLoadingKey] = useState(true);

  const mapRef = useRef(null);
  const placeRef = useRef(null);
  const markerRef = useRef(null);


  useEffect(() => {
    const fetchKey = async () => {
      try {
        const headers = userInfo?.token
          ? { Authorization: `Bearer ${userInfo.token}` }
          : undefined;
        const { data } = await axios.get('/api/keys/google', { headers });
        if (!data?.key) {
          toast.warn('Google Maps key is not configured; map may be disabled.');
        }
        setGoogleApiKey(data?.key || '');
      } catch (e) {
        toast.error('Failed to load Google Maps key');
        setGoogleApiKey('');
      } finally {
        setLoadingKey(false);
      }
    };

    fetchKey();
    ctxDispatch({ type: 'SET_FULLBOX_ON' });
  }, [userInfo?.token, ctxDispatch]);

  const onLoad = (map) => {
    mapRef.current = map;
  };

  const onIdle = () => {
    if (!mapRef.current) return;
    const c = mapRef.current.getCenter();
    if (!c) return;
    setLocation({
      lat: c.lat(),
      lng: c.lng(),
    });
  };

  const onLoadPlaces = (place) => {
    placeRef.current = place;
  };

  const onPlacesChanged = () => {
    const places = placeRef.current?.getPlaces?.();
    const first = Array.isArray(places) ? places[0] : undefined;
    const loc = first?.geometry?.location;
    if (!loc) {
      toast.warn('Please select a valid address from suggestions');
      return;
    }
    const lat = loc.lat();
    const lng = loc.lng();
    setCenter({ lat, lng });
    setLocation({ lat, lng });
  };

  const onMarkerLoad = (marker) => {
    markerRef.current = marker;
  };

  const onConfirm = () => {
    const places = placeRef.current?.getPlaces?.() || [{}];
    const p0 = places[0] || {};
    ctxDispatch({
      type: 'SAVE_SHIPPING_ADDRESS_MAP_LOCATION',
      payload: {
        lat: location.lat,
        lng: location.lng,
        address: p0.formatted_address || '',
        name: p0.name || '',
        vicinity: p0.vicinity || '',
        googleAddressId: p0.place_id || p0.id || '',
      },
    });
    toast.success('Location selected successfully.');
    navigate('/shipping');
  };

  if (loadingKey) return null;

  if (!googleApiKey) {
    return (
      <div className="container my-4">
        <h2>Map is disabled</h2>
        <p>
          Google Maps API key is not configured. Please set it in <code>backend/.env</code> or use
          the default location selector.
        </p>
        <div className="map-input-box">
          <input type="text" placeholder="Enter your address" disabled />
          <Button type="button" disabled>
            Confirm
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="full-box">
      <LoadScript libraries={libs} googleMapsApiKey={googleApiKey}>
        <GoogleMap
          id="sample-map"
          mapContainerStyle={{ height: '100%', width: '100%' }}
          center={center}
          zoom={15}
          onLoad={onLoad}
          onIdle={onIdle}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
        >
          <StandaloneSearchBox onLoad={onLoadPlaces} onPlacesChanged={onPlacesChanged}>
            <div className="map-input-box">
              <input type="text" placeholder="Enter your address" />
              <Button type="button" onClick={onConfirm}>
                Confirm
              </Button>
            </div>
          </StandaloneSearchBox>
          <Marker position={location} onLoad={onMarkerLoad} />
        </GoogleMap>
      </LoadScript>
    </div>
  );
}