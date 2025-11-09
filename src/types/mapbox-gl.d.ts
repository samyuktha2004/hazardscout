// Type definitions for Mapbox GL JS
declare module 'mapbox-gl' {
  export interface MapboxOptions {
    container: string | HTMLElement;
    style: string;
    center?: [number, number];
    zoom?: number;
    pitch?: number;
    bearing?: number;
    attributionControl?: boolean;
  }

  export class Map {
    constructor(options: MapboxOptions);
    on(event: string, callback: () => void): this;
    addControl(control: any, position?: string): this;
    remove(): void;
    setBearing(bearing: number): void;
    scrollZoom: {
      disable(): void;
      enable(): void;
    };
    boxZoom: {
      disable(): void;
    };
    dragRotate: {
      disable(): void;
    };
    dragPan: {
      disable(): void;
    };
    keyboard: {
      disable(): void;
    };
    doubleClickZoom: {
      disable(): void;
    };
    touchZoomRotate: {
      disable(): void;
    };
  }

  export interface MarkerOptions {
    element?: HTMLElement;
    anchor?: string;
  }

  export class Marker {
    constructor(options?: MarkerOptions);
    setLngLat(lngLat: [number, number]): this;
    addTo(map: Map): this;
    remove(): void;
  }

  export class NavigationControl {
    constructor();
  }

  export let accessToken: string;
}

declare module 'mapbox-gl/dist/mapbox-gl.css' {
  const content: any;
  export default content;
}
