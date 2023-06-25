import { useState, useMemo, useCallback, useRef } from "react";
import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
  Circle,
  MarkerClusterer,
} from "@react-google-maps/api";
import Places from "./places";
import Distance from "./distance";

type LatLngLiteral = google.maps.LatLngLiteral;
type DirectionsResult = google.maps.DirectionsResult;
type MapOptions = google.maps.MapOptions;

export default function Map() {
  const [work, setWork] = useState<LatLngLiteral>();
  const [home, setHome] = useState<LatLngLiteral | null>(null);
  const [directions, setDirections] = useState<DirectionsResult>();
  const [showWorkInput, setShowWorkInput] = useState(true);
  const [showHomeInput, setShowHomeInput] = useState(true);
  const mapRef = useRef<GoogleMap>();
  const center = useMemo<LatLngLiteral>(
    () => ({ lat: 40, lng: -75 }),
    []
  );
  const options = useMemo<MapOptions>(
    () => ({
      mapId: "b181cac70f27f5e6",
      disableDefaultUI: true,
      clickableIcons: false,
    }),
    []
  );
  const onLoad = useCallback((map) => (mapRef.current = map), []);
  const houses = useMemo(() => generateHouses(work || center), [work, center]);

  const fetchDirections = (house: LatLngLiteral) => {
    if (!work) return;

    const service = new google.maps.DirectionsService();
    service.route(
      {
        origin: house,
        destination: work,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK" && result) {


          setDirections(result);
        }
      }
    );
  };



  const handleWorkSelect = (position: LatLngLiteral) => {
    setWork(position);
    mapRef.current?.panTo(position);
    setShowWorkInput(false);
  };

  const handleHomeSelect = (position: LatLngLiteral) => {
    setHome(position);
    mapRef.current?.panTo(position);
    fetchDirections(position);
    setShowHomeInput(false);
  };

  const handleReset = () => {
    setWork(undefined);
    setHome(null);
    setDirections(undefined);
    setShowWorkInput(true);
    setShowHomeInput(true);
    mapRef.current?.panTo(center);
  };

  return (
    <div className="container">
      <div className="controls">
        <h1>What&apos;s your commute?</h1>
        {showWorkInput && (
          <Places setWork={handleWorkSelect} />
        )}
        {work && !home && (
          <Places setWork={handleWorkSelect} setHome={handleHomeSelect} />
        )}
        {directions && <Distance leg={directions.routes[0].legs[0]} />}
        {(work || home) && (
          <button onClick={handleReset}>Reset</button>
        )}
      </div>



      <div className="map">
        <GoogleMap
          zoom={10}
          center={center}
          mapContainerClassName="map-container"
          options={options}
          onLoad={onLoad}
        >
          {directions && (
            <DirectionsRenderer
              directions={directions}
              options={{
                polylineOptions: {
                  zIndex: 50,
                  strokeColor: "#1976D2",
                  strokeWeight: 5,
                },
              }}
            />
          )}

          {home && (
            <>
              <Marker
                position={home}
                icon={"https://maps.google.com/mapfiles/kml/shapes/homegardenbusiness.png"}
              />
              {directions && (
                <DirectionsRenderer
                  directions={directions}
                  options={{
                    polylineOptions: {
                      zIndex: 50,
                      strokeColor: "#1976D2",
                      strokeWeight: 5,
                    },
                  }}
                />
              )}
            </>
          )}

          {work && (
            <>
              <Marker
                position={work}
                icon="https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png"
              />

              <MarkerClusterer>
                {(clusterer) =>
                  houses.map((house) => (
                    <Marker
                      key={house.lat}
                      position={house}
                      clusterer={clusterer}
                      onClick={() => {
                        fetchDirections(house);
                      }}
                    />
                  ))
                }
              </MarkerClusterer>

              <Circle center={work} radius={15000} options={closeOptions} />
              <Circle center={work} radius={30000} options={middleOptions} />
              <Circle center={work} radius={45000} options={farOptions} />
            </>
          )}
        </GoogleMap>
      </div>
    </div>
  );
}

const defaultOptions = {
  strokeOpacity: 0.5,
  strokeWeight: 2,
  clickable: false,
  draggable: false,
  editable: false,
  visible: true,
};
const closeOptions = {
  ...defaultOptions,
  zIndex: 3,
  fillOpacity: 0.05,
  strokeColor: "#8BC34A",
  fillColor: "#8BC34A",
};
const middleOptions = {
  ...defaultOptions,
  zIndex: 2,
  fillOpacity: 0.05,
  strokeColor: "#FBC02D",
  fillColor: "#FBC02D",
};
const farOptions = {
  ...defaultOptions,
  zIndex: 1,
  fillOpacity: 0.05,
  strokeColor: "#FF5252",
  fillColor: "#FF5252",
};

const generateHouses = (position: LatLngLiteral) => {
  const numHouses = 4000;
  const radius = 0.065; // Adjust this value as needed
  const minDistance = 2 * radius;

  const houses: LatLngLiteral[] = [];
  const activePoints: LatLngLiteral[] = [];
  const grid: LatLngLiteral[][] = [];
  const gridSize = Math.ceil(position.lat * 2 / minDistance);

  for (let i = 0; i < gridSize; i++) {
    grid[i] = [];
  }

  function generateRandomPointAround(point: LatLngLiteral) {
    const angle = 2 * Math.PI * Math.random();
    const distance = radius + radius * Math.random();
    const newLat = point.lat + distance * Math.cos(angle);
    const newLng = point.lng + distance * Math.sin(angle);
    return { lat: newLat, lng: newLng };
  }

  function generatePoissonPoints() {
    if (activePoints.length === 0) {
      const initialPoint = { lat: position.lat, lng: position.lng };
      activePoints.push(initialPoint);
      houses.push(initialPoint);
      const gridX = Math.floor(position.lat / minDistance);
      const gridY = Math.floor(position.lng / minDistance);
      grid[gridX][gridY] = initialPoint;
    }

    while (activePoints.length > 0 && houses.length < numHouses) {
      const randomIndex = Math.floor(Math.random() * activePoints.length);
      const currentPoint = activePoints[randomIndex];
      let foundValidPoint = false;

      for (let i = 0; i < 30; i++) {
        const newPoint = generateRandomPointAround(currentPoint);

        const gridX = Math.floor(newPoint.lat / minDistance);
        const gridY = Math.floor(newPoint.lng / minDistance);

        let isValidPoint = true;

        for (let dx = -2; dx <= 2; dx++) {
          for (let dy = -2; dy <= 2; dy++) {
            if (gridX + dx >= 0 && gridX + dx < gridSize && gridY + dy >= 0 && gridY + dy < gridSize) {
              const neighbor = grid[gridX + dx][gridY + dy];
              if (neighbor && calculateDistance(neighbor, newPoint) < minDistance) {
                isValidPoint = false;
                break;
              }
            }
          }
        }

        if (isValidPoint) {
          houses.push(newPoint);
          activePoints.push(newPoint);
          grid[gridX][gridY] = newPoint;
          foundValidPoint = true;
          break;
        }
      }

      if (!foundValidPoint) {
        activePoints.splice(randomIndex, 1);
      }
    }
  }

  function calculateDistance(p1: LatLngLiteral, p2: LatLngLiteral) {
    const latDiff = p1.lat - p2.lat;
    const lngDiff = p1.lng - p2.lng;
    return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
  }

  generatePoissonPoints();

  return houses;
};
