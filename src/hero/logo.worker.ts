// Calcula el campo de distancia del logo fuera del hilo principal para no bloquear la carga.
import { buildLogoField } from "./logo";

self.onmessage = () => {
  const field = buildLogoField();
  (self as unknown as Worker).postMessage(field, [field.data.buffer]);
};
