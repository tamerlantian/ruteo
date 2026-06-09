/**
 * Construye el HTML (con Google Maps JS) que se carga dentro del WebView del
 * mapa de ruta. Es una función PURA: recibe la data y devuelve el documento.
 *
 * El WebView -> RN se comunica por `window.ReactNativeWebView.postMessage`
 * (acción "navegar" para abrir la app de mapas externa de una parada).
 */

export interface ParadaMapa {
  id: number;
  lat: number;
  lng: number;
  orden: number;
  numero: number;
  destinatario: string;
  direccion: string;
  /** Color del pin (por estado). */
  color: string;
  /** Etiqueta legible del estado (Pendiente / Entregada / etc.). */
  estadoLabel: string;
  cobro: number;
  peso: number;
  unidades: number;
  /** true si la parada forma parte de la ruta pendiente (se une con polyline). */
  ruta: boolean;
}

export interface ConductorMapa {
  lat: number;
  lng: number;
}

interface BuildMapaHtmlParams {
  apiKey: string;
  paradas: ParadaMapa[];
  conductor?: ConductorMapa | null;
}

/** Centro por defecto si no hay paradas (Medellín, como en rutenio). */
const DEFAULT_CENTER = { lat: 6.200713725811437, lng: -75.58609508555918 };

export const buildMapaHtml = ({
  apiKey,
  paradas,
  conductor,
}: BuildMapaHtmlParams): string => {
  // Evitar que un "</script>" dentro de los datos rompa el documento.
  const dataJson = JSON.stringify({ paradas, conductor: conductor ?? null })
    .replace(/</g, '\\u003c');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; }
    .iw { font-family: -apple-system, Roboto, sans-serif; max-width: 230px; }
    .iw h3 { margin: 0 0 4px; font-size: 15px; color: #1c1c1e; }
    .iw .badge { display:inline-block; font-size:11px; font-weight:700; color:#fff; padding:2px 8px; border-radius:999px; margin-bottom:6px; }
    .iw .dir { font-size:12px; color:#475569; margin:0 0 6px; }
    .iw .meta { font-size:11px; color:#64748b; margin:0 0 8px; }
    .iw .cobro { color:#DC2626; font-weight:700; }
    .iw button { width:100%; border:0; background:#0E7BB0; color:#fff; font-size:13px; font-weight:700; padding:8px; border-radius:8px; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var DATA = ${dataJson};
    var DEFAULT_CENTER = ${JSON.stringify(DEFAULT_CENTER)};

    function navegar(id) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'navegar', id: id }));
      }
    }

    function esc(s) {
      return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
        return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c];
      });
    }

    function infoHtml(p) {
      var cobro = p.cobro > 0 ? '<span class="cobro">$' + Number(p.cobro).toLocaleString() + '</span> · ' : '';
      var meta = cobro + Math.round(p.unidades || 0) + ' und · ' + Math.round(p.peso || 0) + ' kg';
      return '<div class="iw">' +
        '<span class="badge" style="background:' + p.color + '">' + esc(p.estadoLabel) + '</span>' +
        '<h3>#' + esc(p.numero) + ' · ' + esc(p.destinatario || 'Sin destinatario') + '</h3>' +
        (p.direccion ? '<p class="dir">' + esc(p.direccion) + '</p>' : '') +
        '<p class="meta">' + meta + '</p>' +
        '<button onclick="navegar(' + p.id + ')">Navegar aquí</button>' +
      '</div>';
    }

    function initMap() {
      var map = new google.maps.Map(document.getElementById('map'), {
        center: DEFAULT_CENTER,
        zoom: 12,
        disableDefaultUI: true,
        zoomControl: true,
        gestureHandling: 'greedy',
      });

      var bounds = new google.maps.LatLngBounds();
      var info = new google.maps.InfoWindow();
      var hayPuntos = false;

      DATA.paradas.forEach(function (p) {
        var pos = { lat: p.lat, lng: p.lng };
        var marker = new google.maps.Marker({
          position: pos, map: map,
          title: p.destinatario,
          label: { text: String(p.orden), color: '#fff', fontSize: '12px', fontWeight: '700' },
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 14, fillColor: p.color, fillOpacity: 1,
            strokeColor: '#fff', strokeWeight: 2,
          },
        });
        marker.addListener('click', function () {
          info.setContent(infoHtml(p));
          info.open(map, marker);
        });
        bounds.extend(pos);
        hayPuntos = true;
      });

      if (DATA.conductor) {
        var cpos = { lat: DATA.conductor.lat, lng: DATA.conductor.lng };
        new google.maps.Marker({
          position: cpos, map: map, title: 'Tu ubicación', zIndex: 9999,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8, fillColor: '#2563EB', fillOpacity: 1,
            strokeColor: '#fff', strokeWeight: 3,
          },
        });
        bounds.extend(cpos);
        hayPuntos = true;
      }

      if (hayPuntos) {
        map.fitBounds(bounds, 60);
        // Evitar zoom excesivo cuando hay una sola parada.
        var once = google.maps.event.addListener(map, 'idle', function () {
          if (map.getZoom() > 16) { map.setZoom(16); }
          google.maps.event.removeListener(once);
        });
      }
    }

    window.gm_authFailure = function () {
      document.body.innerHTML = '<div style="padding:24px;font-family:sans-serif;color:#475569">No se pudo cargar el mapa (clave de Google Maps). Revisa la configuración.</div>';
    };
  </script>
  <script async defer
    src="https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry&callback=initMap">
  </script>
</body>
</html>`;
};
