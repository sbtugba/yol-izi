import { useEffect, useRef, useState, Component } from 'react';
import Globe from 'react-globe.gl';
export class GlobeBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="globe-fallback">
        3D görünüm açılamadı. WebGL destekleyen bir tarayıcı kullanın. Gezilerinize listeden
        erişebilirsiniz.
      </div>
    ) : (
      this.props.children
    );
  }
}
export default function GlobeView({ trips, selected, onSelect, globeRef }) {
  const holder = useRef();
  const [size, setSize] = useState({ width: 800, height: 800 });
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) =>
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height }),
    );
    observer.observe(holder.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (ready && selected)
      globeRef.current.pointOfView({ lat: selected.lat, lng: selected.lng, altitude: 1.65 }, 1200);
  }, [selected, ready, globeRef]);
  return (
    <div className="globe-host" ref={holder}>
      <Globe
        ref={globeRef}
        {...size}
        backgroundColor="#00000000"
        globeImageUrl="https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg"
        atmosphereColor="#c7edff"
        atmosphereAltitude={0.16}
        showGraticules
        htmlElementsData={trips}
        htmlLat="lat"
        htmlLng="lng"
        htmlAltitude={0.025}
        htmlElement={(trip) => {
          const pin = document.createElement('button');
          pin.className = `map-pin ${selected?.id === trip.id ? 'active' : ''}`;
          pin.title = `${trip.city}, ${trip.country}`;
          pin.setAttribute('aria-label', `${trip.city} gezisini göster`);
          const dot = document.createElement('span');
          dot.className = 'pin-dot';
          const label = document.createElement('span');
          label.className = 'pin-label';
          label.textContent = trip.city;
          pin.append(dot, label);
          pin.onclick = () => onSelect(trip);
          return pin;
        }}
        onGlobeReady={() => {
          globeRef.current.lights().forEach((light) => {
            if (light.isAmbientLight) {
              light.color.set('#ffffff');
              light.intensity = Math.PI * 1.3;
            }
          });
          const controls = globeRef.current.controls();
          controls.enablePan = false;
          controls.minDistance = 130;
          controls.maxDistance = 500;
          globeRef.current.pointOfView({ lat: 26, lng: 30, altitude: 1.65 });
          setReady(true);
        }}
      />
      {!ready && <p className="globe-loading">Dünyan hazırlanıyor…</p>}
    </div>
  );
}
