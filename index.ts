/**
 * ARQUIVO: index.ts
 *
 * PARA QUE SERVE?
 * É o arquivo que o Expo executa primeiro (veja "main" no package.json).
 * registerRootComponent registra o componente App como a "raiz" do aplicativo,
 * tanto no Expo Go quanto em um build nativo (APK/AAB/iOS).
 * Não precisamos mexer aqui: o app de verdade começa em App.tsx.
 */
import { registerRootComponent } from "expo";

import App from "./App";

registerRootComponent(App);
