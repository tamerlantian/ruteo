import ReactNativeBlobUtil from 'react-native-blob-util';

/**
 * Persistencia de fotos de entregas.
 *
 * PROBLEMA QUE RESUELVE: la cámara / el resizer escriben las fotos en el
 * directorio temporal (`Library/Caches` en iOS), que el SO PURGA cuando quiere
 * (reinicio de app, presión de almacenamiento). Si una entrega queda guardada
 * para reintento offline, en Redux solo se persiste la RUTA del archivo — y
 * para cuando corre el reintento/auto-sync el archivo ya no existe, así que el
 * multipart falla ("no such file"). Copiamos las fotos a `Documents` (que NO se
 * purga) y guardamos esa ruta, de modo que el reintento siempre tenga el bytes.
 */

const fs = ReactNativeBlobUtil.fs;

/** Directorio PERSISTENTE para fotos de entregas (Documents, no se purga). */
export const ENTREGAS_FOTOS_DIR = `${fs.dirs.DocumentDir}/entregas_fotos`;

const stripFilePrefix = (uri: string) => uri.replace('file://', '');

/** Asegura que el directorio persistente exista. Idempotente. */
const ensureFotosDir = async (): Promise<void> => {
  const exists = await fs.exists(ENTREGAS_FOTOS_DIR);
  if (!exists) {
    await fs.mkdir(ENTREGAS_FOTOS_DIR);
  }
};

/**
 * Copia una foto al directorio persistente y devuelve su nueva uri (file://).
 * Si la foto ya vive ahí, la devuelve tal cual. Si algo falla, devuelve la uri
 * original (mejor degradar a "puede fallar el reintento" que romper la entrega).
 */
export const persistFoto = async (uri: string): Promise<string> => {
  try {
    await ensureFotosDir();
    const src = stripFilePrefix(uri);

    // Ya está en el dir persistente → no re-copiar.
    if (src.startsWith(ENTREGAS_FOTOS_DIR)) {
      return `file://${src}`;
    }

    const extMatch = src.match(/\.(\w+)$/);
    const ext = extMatch ? extMatch[1] : 'jpg';
    const fileName = `entrega-${Date.now()}-${Math.floor(
      Math.random() * 1e9,
    )}.${ext}`;
    const dest = `${ENTREGAS_FOTOS_DIR}/${fileName}`;

    await fs.cp(src, dest);
    return `file://${dest}`;
  } catch (error) {
    console.warn('⚠️ persistFoto falló, se usa la uri original:', error);
    return uri;
  }
};

/** Borra archivos de fotos por uri. Best-effort: nunca lanza. */
export const deleteFotos = async (uris: string[]): Promise<void> => {
  await Promise.all(
    uris.map(async uri => {
      try {
        const path = stripFilePrefix(uri);
        // Solo tocamos nuestro directorio persistente, no archivos del sistema.
        if (path.startsWith(ENTREGAS_FOTOS_DIR) && (await fs.exists(path))) {
          await fs.unlink(path);
        }
      } catch {
        // best-effort, ignoramos
      }
    }),
  );
};
