// Google Maps TypeScript declarations
// These are minimal declarations for the features used in this app

declare global {
  interface Window {
    google: typeof google;
  }
}

declare namespace google.maps {
  class Map {
    constructor(mapDiv: Element, opts?: MapOptions);
    setCenter(latlng: LatLng | LatLngLiteral): void;
    setZoom(zoom: number): void;
    getCenter(): LatLng;
    getZoom(): number;
  }

  interface MapOptions {
    center?: LatLng | LatLngLiteral;
    zoom?: number;
    styles?: MapTypeStyle[];
    disableDefaultUI?: boolean;
    zoomControl?: boolean;
    mapTypeControl?: boolean;
    streetViewControl?: boolean;
    fullscreenControl?: boolean;
  }

  interface MapTypeStyle {
    elementType?: string;
    featureType?: string;
    stylers?: Array<{ [key: string]: string | number }>;
  }

  class Marker {
    constructor(opts?: MarkerOptions);
    setMap(map: Map | null): void;
  }

  interface MarkerOptions {
    position?: LatLng | LatLngLiteral;
    map?: Map;
    icon?: string | Icon | Symbol;
    title?: string;
  }

  interface Icon {
    url: string;
    scaledSize?: Size;
  }

  interface Symbol {
    path: SymbolPath | string;
    scale?: number;
    fillColor?: string;
    fillOpacity?: number;
    strokeColor?: string;
    strokeWeight?: number;
  }

  enum SymbolPath {
    CIRCLE = 0,
    FORWARD_CLOSED_ARROW = 1,
    FORWARD_OPEN_ARROW = 2,
    BACKWARD_CLOSED_ARROW = 3,
    BACKWARD_OPEN_ARROW = 4,
  }

  class LatLng {
    constructor(lat: number, lng: number);
    lat(): number;
    lng(): number;
  }

  interface LatLngLiteral {
    lat: number;
    lng: number;
  }

  class Size {
    constructor(width: number, height: number);
  }

  class Polyline {
    constructor(opts?: PolylineOptions);
    setMap(map: Map | null): void;
  }

  interface PolylineOptions {
    path?: LatLng[] | LatLngLiteral[];
    strokeColor?: string;
    strokeOpacity?: number;
    strokeWeight?: number;
    geodesic?: boolean;
    map?: Map;
  }

  class OverlayView {
    onAdd(): void;
    draw(): void;
    onRemove(): void;
    setMap(map: Map | null): void;
    getMap(): Map | null;
    getPanes(): MapPanes | null;
    getProjection(): MapCanvasProjection;
  }

  interface MapPanes {
    floatPane: Element;
    mapPane: Element;
    markerLayer: Element;
    overlayLayer: Element;
    overlayMouseTarget: Element;
  }

  interface MapCanvasProjection {
    fromLatLngToDivPixel(latLng: LatLng | LatLngLiteral): Point | null;
  }

  interface Point {
    x: number;
    y: number;
  }
}

export {};
