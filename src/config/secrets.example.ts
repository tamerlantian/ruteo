// Plantilla versionada. Copiala a `secrets.ts` (que esta gitignored) y pon la
// key real:  cp src/config/secrets.example.ts src/config/secrets.ts
//
// La Google Maps API key viaja en la app de todos modos, asi que su defensa NO
// es el secreto sino la RESTRICCION en Google Cloud Console (package Android +
// SHA-1, bundle iOS, referrer) + cuotas. Mantenerla fuera del repo evita que
// quede escaneable en un repo publico.
export const GOOGLE_MAPS_API_KEY = 'REEMPLAZAR_CON_TU_GOOGLE_MAPS_API_KEY';
