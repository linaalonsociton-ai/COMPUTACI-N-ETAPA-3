//  QUÉ HACE EL SONIDO:
//  - Agudos             →  líneas divisorias MÁS FINAS  (grosor mínimo = 0.5px)
//  - Graves             →  líneas divisorias MÁS GRUESAS (grosor máximo = 28px)
//  - Volumen sostenido  →  muta formas progresivamente
//  - Golpe en mesa      →  CAMBIA LA PALETA de colores
//  - Silbido            →  las figuras VIBRAN en su lugar (cada una individualmente)
//
//  Las líneas blancas divisorias son SIEMPRE visibles y responden al espectro.
//  Los controles de teclado SIGUEN FUNCIONANDO igual que antes.
//  Requiere p5.js + p5.sound
// ============================================================

// --- AUDIO ---
let mic;
let analizadorVolumen;
let analizadorFFT;
let BANDAS_FFT = 512;
let ruidoConstante = false;
let framesRuidoConstante = 0;

let UMBRAL_RUIDO = 0.08;
let FRAMES_RUIDO = 15;

let vibracionBorde = 0;
let volumenSuavizado = 0;

// --- PALETA POR GRAVES ---
let framesBloqueoPaleta = 0;
let UMBRAL_CAMBIO_PALETA = 0.55;

// --- RESET CON SILENCIO ---
let framesSilencio        = 0;
let FRAMES_SILENCIO_RESET = 180;

// --- SENSIBILIDAD ---
let SENSIBILIDAD = 2.5;

// --- LÍNEAS DIVISORIAS → grosor controlado por espectro agudos/graves ---
// El grosor va de muy fino (agudos) a muy grueso (graves).
// Las líneas son SIEMPRE visibles; el espectro solo cambia su ancho.
let grosorLineaSuav  = 6.0;   // valor actual suavizado (en px grilla)
let GROSOR_LINEA_MIN = 0.5;   // agudos puros → casi invisible
let GROSOR_LINEA_MAX = 28.0;  // graves puros → muy gruesa
let factorGrosorManual = 1.0;
// --- MUTACIÓN PROGRESIVA → volumen sostenido muta formas ---
let framesSonido     = 0;
let FRAMES_MUTAR     = 90;    // cada ~1.5 seg de sonido continuo muta una forma
// --- RITMO ---
// --- GOLPES / MUTACIÓN ---
let energiaAnterior = 0;
let golpeBloqueado = false;
let framesBloqueoGolpe = 0;
let UMBRAL_GOLPE = 0.12;
let BLOQUEO_GOLPE = 15;
// --- GRAVES ---
let nivelGraves = 0;
let nivelGravesSuav = 0;

let paletaBloqueada = false;
let bloqueoGraves = 0;
let bloqueoAgudos = 0;
// --- SILBIDO → figuras vibran individualmente ---
let nivelAgudos        = 0;
let nivelAgudosSuav    = 0;
let UMBRAL_SILBIDO     = 0.35;
let silbando           = false;
let AMPLITUD_VIBRACION = 4.0;

// Offset de vibración independiente por forma (índice = índice de forma)
let vibX = [];
let vibY = [];
for (let i = 0; i < 10; i++) { vibX[i] = 0; vibY[i] = 0; }

// ============================================================
// CANVAS
let LADO  = 600;
let MARCO = 22;
let GRID  = 500.0;
let s;

// ============================================================
// PALETAS
let paleta = new Array(14);
let NUM_PALETAS  = 4;
let indicePaleta = 0;

// Paleta 0
let p0_fondo         = "#0C482E";
let p0_zigzag        = "#602143";
let p0_onda          = "#88B914";
let p0_cuartoCirculo = "#D63583";
let p0_barraAmarilla = "#F0B000";
let p0_rectAzul      = "#1C3D92";
let p0_triangulo     = "#2FA7D1";
let p0_arcada        = "#BA81B9";
let p0_cuadradoRojo  = "#D12731";
let p0_pildora       = "#279E39";
let p0_motivoSup     = "#00A4B2";
let p0_motivoDer     = "#1D1D1B";
let p0_motivoInf     = "#FBDF15";
let p0_motivoIzq     = "#F15C29";

// Paleta 1
let p1_fondo         = "#2B1A4C";
let p1_zigzag        = "#D63583";
let p1_onda          = "#2FA7D1";
let p1_cuartoCirculo = "#F0B000";
let p1_barraAmarilla = "#88B914";
let p1_rectAzul      = "#00A4B2";
let p1_triangulo     = "#BA81B9";
let p1_arcada        = "#F15C29";
let p1_cuadradoRojo  = "#1C3D92";
let p1_pildora       = "#FBDF15";
let p1_motivoSup     = "#D12731";
let p1_motivoDer     = "#1D1D1B";
let p1_motivoInf     = "#88B914";
let p1_motivoIzq     = "#D63583";

// Paleta 2
let p2_fondo         = "#0F1E4D";
let p2_zigzag        = "#F15C29";
let p2_onda          = "#FBDF15";
let p2_cuartoCirculo = "#00A4B2";
let p2_barraAmarilla = "#D63583";
let p2_rectAzul      = "#D12731";
let p2_triangulo     = "#F0B000";
let p2_arcada        = "#88B914";
let p2_cuadradoRojo  = "#BA81B9";
let p2_pildora       = "#2FA7D1";
let p2_motivoSup     = "#88B914";
let p2_motivoDer     = "#1D1D1B";
let p2_motivoInf     = "#D63583";
let p2_motivoIzq     = "#F0B000";

// Paleta 3
let p3_fondo         = "#103A2E";
let p3_zigzag        = "#1C3D92";
let p3_onda          = "#F0B000";
let p3_cuartoCirculo = "#00A4B2";
let p3_barraAmarilla = "#D63583";
let p3_rectAzul      = "#F15C29";
let p3_triangulo     = "#BA81B9";
let p3_arcada        = "#FBDF15";
let p3_cuadradoRojo  = "#D63583";
let p3_pildora       = "#88B914";
let p3_motivoSup     = "#D12731";
let p3_motivoDer     = "#1D1D1B";
let p3_motivoInf     = "#2FA7D1";
let p3_motivoIzq     = "#F0B000";

// ============================================================
// INTENSIDAD Y PROPORCIONES
let intensidad         = 0.0;
let pasoIntensidad     = 0.05;
let grosorBordeMin     = 12.0;
let grosorBordeMax     = 32.0;
let amplZigzagMin      = 1.0;
let amplZigzagMax      = 1.8;
let amplOndaMin        = 1.0;
let amplOndaMax        = 1.4;
let factorSatMin       = 0.85;
let factorSatMax       = 1.15;
let factorBrMin        = 0.95;
let factorBrMax        = 1.10;
let motivoLadoMin      = 70;
let motivoLadoMax      = 110;

// ============================================================
// MUTACIÓN
let NUM_FORMAS        = 10;
let F_ZIGZAG          = 0;
let F_ONDA            = 1;
let F_CUARTO_CIRCULO  = 2;
let F_BARRA_AMARILLA  = 3;
let F_RECT_AZUL       = 4;
let F_TRIANGULO       = 5;
let F_ARCADA          = 6;
let F_CUADRADO_ROJO   = 7;
let F_PILDORA         = 8;
let F_MOTIVO          = 9;

let VARIANTES_POR_FORMA = 4;
let FLASH_DURACION      = 20;

let variantes   = [];
let flashFrames = [];
for (let i = 0; i < 10; i++) {
  variantes[i]   = 0;
  flashFrames[i] = 0;
}

let modoDebug = false;

// ============================================================
function setup() {
  let canvas = createCanvas(LADO, LADO);
  canvas.parent("canvas-container");
  canvas.mouseClicked(activarAudio);
  s = (LADO - 2 * MARCO) / GRID;
  cargarPaleta();
}

function activarAudio() {
  userStartAudio();
  mic = new p5.AudioIn();
  mic.start();
  analizadorVolumen = new p5.Amplitude();
  analizadorVolumen.setInput(mic);
  analizadorFFT = new p5.FFT(0.8, BANDAS_FFT);
  analizadorFFT.setInput(mic);
}

// ============================================================
// CARGAR PALETA ACTIVA
// ============================================================
function cargarPaleta() {
  if (indicePaleta == 0) {
    paleta[0]=p0_fondo;  paleta[1]=p0_zigzag;  paleta[2]=p0_onda;
    paleta[3]=p0_cuartoCirculo;  paleta[4]=p0_barraAmarilla;
    paleta[5]=p0_rectAzul;  paleta[6]=p0_triangulo;  paleta[7]=p0_arcada;
    paleta[8]=p0_cuadradoRojo;  paleta[9]=p0_pildora;
    paleta[10]=p0_motivoSup;  paleta[11]=p0_motivoDer;
    paleta[12]=p0_motivoInf;  paleta[13]=p0_motivoIzq;
  } else if (indicePaleta == 1) {
    paleta[0]=p1_fondo;  paleta[1]=p1_zigzag;  paleta[2]=p1_onda;
    paleta[3]=p1_cuartoCirculo;  paleta[4]=p1_barraAmarilla;
    paleta[5]=p1_rectAzul;  paleta[6]=p1_triangulo;  paleta[7]=p1_arcada;
    paleta[8]=p1_cuadradoRojo;  paleta[9]=p1_pildora;
    paleta[10]=p1_motivoSup;  paleta[11]=p1_motivoDer;
    paleta[12]=p1_motivoInf;  paleta[13]=p1_motivoIzq;
  } else if (indicePaleta == 2) {
    paleta[0]=p2_fondo;  paleta[1]=p2_zigzag;  paleta[2]=p2_onda;
    paleta[3]=p2_cuartoCirculo;  paleta[4]=p2_barraAmarilla;
    paleta[5]=p2_rectAzul;  paleta[6]=p2_triangulo;  paleta[7]=p2_arcada;
    paleta[8]=p2_cuadradoRojo;  paleta[9]=p2_pildora;
    paleta[10]=p2_motivoSup;  paleta[11]=p2_motivoDer;
    paleta[12]=p2_motivoInf;  paleta[13]=p2_motivoIzq;
  } else {
    paleta[0]=p3_fondo;  paleta[1]=p3_zigzag;  paleta[2]=p3_onda;
    paleta[3]=p3_cuartoCirculo;  paleta[4]=p3_barraAmarilla;
    paleta[5]=p3_rectAzul;  paleta[6]=p3_triangulo;  paleta[7]=p3_arcada;
    paleta[8]=p3_cuadradoRojo;  paleta[9]=p3_pildora;
    paleta[10]=p3_motivoSup;  paleta[11]=p3_motivoDer;
    paleta[12]=p3_motivoInf;  paleta[13]=p3_motivoIzq;
  }
}

function colorDePaleta(idx) {
  return ajustarColor(paleta[idx]);
}

// ============================================================
// HELPERS
// ============================================================
function grosorBordeBlanco() {

 let total =
  nivelGravesSuav +
  nivelAgudosSuav +
  0.001;

let relacion =
  nivelGravesSuav / total;

let base =
  lerp(
    grosorBordeMin,
    grosorBordeMax,
    relacion
  );

  if (ruidoConstante) {

    let vibracion =
      map(
        nivelGravesSuav + nivelAgudosSuav,
        0,
        1,
        0,
        8
      );

    vibracion *= sin(frameCount * 0.4);

    return (base + vibracion)
      * factorGrosorManual;
  }

  return base * factorGrosorManual;
}
function actualizarVibracion() {
  let fuerza = silbando
    ? map(nivelAgudosSuav, UMBRAL_SILBIDO, 1.0, 0.3, 1.0, true)
    : 0;

  for (let i = 0; i < NUM_FORMAS; i++) {
    if (silbando) {
      // Offset aleatorio independiente por forma, escalado por la fuerza del silbido
      vibX[i] = random(-AMPLITUD_VIBRACION, AMPLITUD_VIBRACION) * fuerza;
      vibY[i] = random(-AMPLITUD_VIBRACION, AMPLITUD_VIBRACION) * fuerza;
    } else {
      // Retorno suave a cero
      vibX[i] = lerp(vibX[i], 0, 0.4);
      vibY[i] = lerp(vibY[i], 0, 0.4);
    }
  }
}

// Aplica la vibración de una forma: push/translate/[dibujo]/pop.
// Se llama desde dentro de cada función de dibujo.
function iniciarVibracion(idxForma) {
  push();
  translate(vibX[idxForma] * s, vibY[idxForma] * s);
}

function finalizarVibracion() {
  pop();
}

function amplitudZigzag() { return lerp(amplZigzagMin, amplZigzagMax, intensidad); }
function amplitudOnda()   { return lerp(amplOndaMin,   amplOndaMax,   intensidad); }
function ladoMotivo()     { return lerp(motivoLadoMin, motivoLadoMax, intensidad); }

function amplificar(valor, eje, factor) {
  return eje + (valor - eje) * factor;
}

function ajustarColor(c) {
  let fSat = lerp(factorSatMin, factorSatMax, intensidad);
  let fBr  = lerp(factorBrMin,  factorBrMax,  intensidad);
  push();
  colorMode(HSB, 360, 100, 100);
  let col = color(c);
  let h   = hue(col);
  let sa  = constrain(saturation(col) * fSat, 0, 100);
  let br  = constrain(brightness(col) * fBr,  0, 100);
  let resultado = color(h, sa, br);
  pop();
  return resultado;
}

function aplicarFlash(idxForma, x, y, w, h) {
  if (flashFrames[idxForma] <= 0) return;
  let alpha = map(flashFrames[idxForma], 0, FLASH_DURACION, 0, 200);
  push();
  noStroke();
  fill(255, alpha);
  rect(x, y, w, h);
  pop();
}

// ============================================================
// AUDIO
// ============================================================
function procesarAudio() {
  if (!mic) return;

  let volBruto = analizadorVolumen.getLevel() * SENSIBILIDAD;
  volBruto = constrain(volBruto, 0, 1);

  if (volBruto > volumenSuavizado) {
    volumenSuavizado = lerp(volumenSuavizado, volBruto, 0.1);
  } else {
    volumenSuavizado = lerp(volumenSuavizado, volBruto, 0.05);
  }

  intensidad = volumenSuavizado;
  // --- Silencio: reset de mutaciones ---
if (
  nivelGravesSuav < 0.05 &&
  nivelAgudosSuav < 0.05
) {
    framesSilencio++;
    framesSonido = 0;
  } else {
    framesSilencio = 0;
  }
  if (framesSilencio >= FRAMES_SILENCIO_RESET) {
    resetearMutaciones();
    framesSilencio = 0;
  }

  let spectrum = analizadorFFT.analyze();

  // --- Graves (bandas 0-9) ---
  let sumaGraves = 0;
  let BANDAS_GRAVES = 10;
  for (let i = 0; i < BANDAS_GRAVES; i++) sumaGraves += spectrum[i];
  nivelGraves = (sumaGraves / BANDAS_GRAVES) * SENSIBILIDAD * 3.0;
  nivelGraves = constrain(nivelGraves, 0, 1);
  nivelGravesSuav = lerp(nivelGravesSuav, nivelGraves, 0.15);

  // --- Agudos (bandas 46-138) ---
  let BANDA_AGUDOS_INI = 46;
  let BANDA_AGUDOS_FIN = 139;
  let sumaAgudos = 0;
  for (let i = BANDA_AGUDOS_INI; i < BANDA_AGUDOS_FIN; i++) sumaAgudos += spectrum[i];
  nivelAgudos = (sumaAgudos / (BANDA_AGUDOS_FIN - BANDA_AGUDOS_INI)) * SENSIBILIDAD * 6.0;
  nivelAgudos = constrain(nivelAgudos, 0, 1);
  nivelAgudosSuav = lerp(nivelAgudosSuav, nivelAgudos, 0.1);
  if (bloqueoGraves > 0) bloqueoGraves--;
if (bloqueoAgudos > 0) bloqueoAgudos--;
  

  // --- GROSOR DE LÍNEAS DIVISORIAS según espectro ---
  // Agudos dominan → fino. Graves dominan → grueso.
  // Se normaliza la relación graves/(graves+agudos) como factor 0-1.
  let totalEspectral = nivelGravesSuav + nivelAgudosSuav;
  let factorGraves = (totalEspectral > 0.01)
    ? constrain(nivelGravesSuav / totalEspectral, 0, 1)
    : 0.5;  // sin sonido: grosor medio
  let grosorObjetivo = lerp(GROSOR_LINEA_MIN, GROSOR_LINEA_MAX, factorGraves);
  // Si no hay sonido, vuelve a grosor medio suavemente

  grosorLineaSuav = lerp(grosorLineaSuav, grosorObjetivo, 0.08);
  
  // --- Silbido: predominio de agudos, graves bajos, volumen presente ---
  silbando = nivelAgudosSuav > UMBRAL_SILBIDO
             && nivelGravesSuav < 0.2
             && volBruto > 0.05;

  // Actualizar offsets de vibración individuales por forma
  actualizarVibracion();
}

// ============================================================
// DRAW
// ============================================================
function draw() {
  procesarAudio();
  if (keyIsDown(UP_ARROW)) {
    factorGrosorManual = min(3.0, factorGrosorManual + 0.02);
  }

  if (keyIsDown(DOWN_ARROW)) {
    factorGrosorManual = max(0.2, factorGrosorManual - 0.02);
  }

  background(255);
  push();
  translate(MARCO, MARCO);

  // ELIMINADO: el translate global de vibración.
  // Cada forma vibra individualmente usando iniciarVibracion() / finalizarVibracion().

  noStroke();
  fill(colorDePaleta(0));
  rect(0, 0, GRID * s, GRID * s);

  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(0, 0, GRID * s, GRID * s);
  drawingContext.clip();

  dibujarFormaZigzag();
  dibujarFormaOnda();
  dibujarCuartoCirculoRosa();
  dibujarBarraAmarilla();
  dibujarRectanguloAzul();
  dibujarTrianguloCeleste();
  dibujarArcadaLavanda();
  dibujarCuadradoRojo();
  dibujarPildoraVerde();
  dibujarMotivo();
  drawingContext.restore();

  for (let i = 0; i < NUM_FORMAS; i++) {
    if (flashFrames[i] > 0) flashFrames[i]--;
  }

  pop();

  if (modoDebug) dibujarDebug();
}

// ============================================================
// 1. ZIGZAG
// ============================================================
function dibujarFormaZigzag() {
  let v = variantes[F_ZIGZAG];
  let px, py, ejeX;

  if (v == 1) {
    px = [-30, 110, 30, 130, 40, 200];
    py = [230, 300, 350, 400, 450, 530];
    ejeX = -30;
  } else if (v == 2) {
    px = [530, 375, 460, 290];
    py = [250, 365, 430, 530];
    ejeX = 530;
  } else if (v == 3) {
    px = [-30, 180, 30, 250];
    py = [230, 340, 400, 530];
    ejeX = -30;
  } else {
    px = [-30, 125, 40, 210];
    py = [250, 365, 430, 530];
    ejeX = -30;
  }

  let a = amplitudZigzag();
  let ax = [];
  for (let i = 0; i < px.length; i++) ax[i] = amplificar(px[i], ejeX, a);

  iniciarVibracion(F_ZIGZAG);
  fill(colorDePaleta(1));
  noStroke();
  beginShape();
  for (let i = 0; i < ax.length; i++) vertex(ax[i] * s, py[i] * s);
  vertex(ejeX * s, 530 * s);
  endShape(CLOSE);

  stroke("#FBFCFC");
  strokeWeight(grosorBordeBlanco() * s);
  noFill();
  strokeCap(SQUARE);
  strokeJoin(MITER);
  beginShape();
  for (let i = 0; i < ax.length; i++) vertex(ax[i] * s, py[i] * s);
  endShape();
  noStroke();

  aplicarFlash(F_ZIGZAG, min(ejeX, 290) * s, 220 * s, 320 * s, 320 * s);
  finalizarVibracion();
}

// ============================================================
// 2. ONDA
// ============================================================
function dibujarFormaOnda() {
  let v = variantes[F_ONDA];
  let a = amplitudOnda();
  let xs, ejeX, espejada = false;

  if (v == 1) {
    xs = [320, 470, 470, 320, 190, 560, 450, 510, 510];
    ejeX = 510;
  } else if (v == 2) {
    xs = [175, 60, 60, 175, 290, -30, 55, 20, 0];
    ejeX = 0;
    espejada = true;
  } else if (v == 3) {
    xs = [380, 470, 470, 380, 280, 520, 450, 480, 510];
    ejeX = 510;
  } else {
    xs = [335, 450, 450, 335, 220, 530, 455, 490, 510];
    ejeX = 510;
  }

  let ax = [];
  for (let i = 0; i < 9; i++) ax[i] = amplificar(xs[i], ejeX, a);

  iniciarVibracion(F_ONDA);
  fill(colorDePaleta(2));
  noStroke();
  beginShape();
  vertex(ax[0]*s, -10*s);
  bezierVertex(ax[1]*s, 45*s,  ax[2]*s, 65*s,  ax[3]*s, 115*s);
  bezierVertex(ax[4]*s, 160*s, ax[5]*s, 175*s, ax[6]*s, 255*s);
  bezierVertex(ax[7]*s, 330*s, ax[8]*s, 370*s, ejeX*s,  400*s);
  vertex(ejeX*s, -10*s);
  endShape(CLOSE);

  stroke("#FBFCFC");
  strokeWeight(grosorBordeBlanco() * s);
  noFill();
  strokeCap(SQUARE);
  strokeJoin(ROUND);
  beginShape();
  vertex(ax[0]*s, -10*s);
  bezierVertex(ax[1]*s, 45*s,  ax[2]*s, 65*s,  ax[3]*s, 115*s);
  bezierVertex(ax[4]*s, 160*s, ax[5]*s, 175*s, ax[6]*s, 255*s);
  bezierVertex(ax[7]*s, 330*s, ax[8]*s, 370*s, ejeX*s,  400*s);
  endShape();
  noStroke();

  let flashX = espejada ? 0 : 200;
  aplicarFlash(F_ONDA, flashX * s, 0, 310 * s, 410 * s);
  finalizarVibracion();
}

// ============================================================
// 3. CUARTO DE CÍRCULO
// ============================================================
function dibujarCuartoCirculoRosa() {
  let v = variantes[F_CUARTO_CIRCULO];
  let d = 210 * s;
  let cx, cy, startAng, stopAng;

  if (v == 1) {
    cx = GRID*s; cy = 0;      startAng = HALF_PI; stopAng = PI;
  } else if (v == 2) {
    cx = 0; cy = GRID*s;      startAng = -HALF_PI; stopAng = 0;
  } else if (v == 3) {
    cx = GRID*s; cy = GRID*s; startAng = PI; stopAng = PI + HALF_PI;
  } else {
    cx = 0; cy = 0;           startAng = 0; stopAng = HALF_PI;
  }

  iniciarVibracion(F_CUARTO_CIRCULO);
  fill(colorDePaleta(3));
  noStroke();
  arc(cx, cy, d, d, startAng, stopAng, PIE);
  aplicarFlash(F_CUARTO_CIRCULO, cx - d/2, cy - d/2, d, d);
  finalizarVibracion();
}

// ============================================================
// 4. BARRA AMARILLA
// ============================================================
function dibujarBarraAmarilla() {
  let v = variantes[F_BARRA_AMARILLA];
  let x, y, w, h;

  if (v == 1)      { x = 0;   y = 300; w = 35; h = 85; }
  else if (v == 2) { x = 415; y = 142; w = 85; h = 35; }
  else if (v == 3) { x = 60;  y = 465; w = 85; h = 35; }
  else             { x = 0;   y = 142; w = 85; h = 35; }

  iniciarVibracion(F_BARRA_AMARILLA);
  fill(colorDePaleta(4));
  noStroke();
  rect(x*s, y*s, w*s, h*s);
  aplicarFlash(F_BARRA_AMARILLA, x*s, y*s, w*s, h*s);
  finalizarVibracion();
}

// ============================================================
// 5. RECT AZUL
// ============================================================
function dibujarRectanguloAzul() {
  let v = variantes[F_RECT_AZUL];
  let x, y, w, h;

  if (v == 1)      { x = 0;   y = 0; w = 140; h = 95;  }
  else if (v == 2) { x = 330; y = 0; w = 170; h = 95;  }
  else if (v == 3) { x = 405; y = 0; w = 95;  h = 190; }
  else             { x = 105; y = 0; w = 190; h = 95;  }

  iniciarVibracion(F_RECT_AZUL);
  fill(colorDePaleta(5));
  noStroke();
  rect(x*s, y*s, w*s, h*s);
  aplicarFlash(F_RECT_AZUL, x*s, y*s, w*s, h*s);
  finalizarVibracion();
}

// ============================================================
// 6. TRIÁNGULO CELESTE
// ============================================================
function dibujarTrianguloCeleste() {
  let v = variantes[F_TRIANGULO];
  let x1, y1, x2, y2, x3, y3;

  if (v == 1)      { x1=105; y1=250; x2=295; y2=250; x3=200; y3=95;  }
  else if (v == 2) { x1=295; y1=95;  x2=295; y2=250; x3=105; y3=170; }
  else if (v == 3) { x1=105; y1=95;  x2=105; y2=250; x3=295; y3=170; }
  else             { x1=105; y1=95;  x2=295; y2=95;  x3=200; y3=250; }

  iniciarVibracion(F_TRIANGULO);
  fill(colorDePaleta(6));
  noStroke();
  triangle(x1*s, y1*s, x2*s, y2*s, x3*s, y3*s);
  aplicarFlash(F_TRIANGULO, 105*s, 95*s, 190*s, 160*s);
  finalizarVibracion();
}

// ============================================================
// 7. ARCADA LAVANDA
// ============================================================
function dibujarArcadaLavanda() {
  let v = variantes[F_ARCADA];
  let cx = 330, cy = 350, d = 185, rectAltoBase = 50;

  iniciarVibracion(F_ARCADA);
  fill(colorDePaleta(7));
  noStroke();

  if (v == 1) {
    arc(cx*s, cy*s, d*s, d*s, 0, PI, PIE);
    rect((cx - d/2)*s, (cy - rectAltoBase)*s, d*s, rectAltoBase*s);
  } else if (v == 2) {
    arc(cx*s, cy*s, (d*0.6)*s, (d*0.6)*s, PI, TWO_PI, PIE);
    rect((cx - d*0.3)*s, cy*s, (d*0.6)*s, rectAltoBase*s);
  } else if (v == 3) {
    cx = 160;
    arc(cx*s, cy*s, d*s, d*s, PI, TWO_PI, PIE);
    rect((cx - d/2)*s, cy*s, d*s, rectAltoBase*s);
  } else {
    arc(cx*s, cy*s, d*s, d*s, PI, TWO_PI, PIE);
    rect((cx - d/2)*s, cy*s, d*s, rectAltoBase*s);
  }

  aplicarFlash(F_ARCADA, 60*s, 250*s, 380*s, 160*s);
  finalizarVibracion();
}

// ============================================================
// 8. CUADRADO ROJO
// ============================================================
function dibujarCuadradoRojo() {
  let v = variantes[F_CUADRADO_ROJO];
  let x = 270, y = 400, w = 152, h = 100;

  iniciarVibracion(F_CUADRADO_ROJO);
  fill(colorDePaleta(8));
  noStroke();

  if (v == 1)      { triangle(x*s, (y+h)*s, (x+w)*s, (y+h)*s, (x+w/2)*s, y*s); }
  else if (v == 2) { arc((x+w/2)*s, (y+h)*s, w*s, h*2*s, PI, TWO_PI, PIE);      }
  else if (v == 3) { rect((x+25)*s, (y-40)*s, (w-50)*s, (h+40)*s);              }
  else             { rect(x*s, y*s, w*s, h*s);                                   }

  aplicarFlash(F_CUADRADO_ROJO, x*s, (y-40)*s, w*s, (h+40)*s);
  finalizarVibracion();
}

// ============================================================
// 9. PÍLDORA VERDE
// ============================================================
function dibujarPildoraVerde() {
  let v = variantes[F_PILDORA];
  let x, y, w, h, r;

  if (v == 1)      { x=205; y=340; w=45;  h=130; r=22; }
  else if (v == 2) { x=175; y=390; w=110; h=45;  r=22; }
  else if (v == 3) { x=195; y=365; w=95;  h=95;  r=40; }
  else             { x=205; y=375; w=75;  h=75;  r=35; }

  iniciarVibracion(F_PILDORA);
  fill(colorDePaleta(9));
  noStroke();
  rect(x*s, y*s, w*s, h*s, r*s);
  aplicarFlash(F_PILDORA, x*s, y*s, w*s, h*s);
  finalizarVibracion();
}

// ============================================================
// 10. MOTIVO
// ============================================================
function dibujarMotivo() {
  let v = variantes[F_MOTIVO];
  let lado = ladoMotivo();
  let half = lado / 2.0;
  let cx, cy;

  if (v == 1)      { cx = half;       cy = 500 - half; }
  else if (v == 2) { cx = 500 - half; cy = half;       }
  else if (v == 3) { cx = half;       cy = half;       }
  else             { cx = 500 - half; cy = 500 - half; }

  let x1 = (cx - half) * s;
  let y1 = (cy - half) * s;
  let x2 = (cx + half) * s;
  let y2 = (cy + half) * s;
  let mx = cx * s;
  let my = cy * s;

  iniciarVibracion(F_MOTIVO);
  noStroke();
  fill(colorDePaleta(10)); triangle(x1, y1, x2, y1, mx, my);
  fill(colorDePaleta(11)); triangle(x2, y1, x2, y2, mx, my);
  fill(colorDePaleta(12)); triangle(x2, y2, x1, y2, mx, my);
  fill(colorDePaleta(13)); triangle(x1, y2, x1, y1, mx, my);
  aplicarFlash(F_MOTIVO, x1, y1, lado * s, lado * s);
  finalizarVibracion();
}

// ============================================================
// MUTACIÓN
// ============================================================
function mutarUnaForma() {
  let forma = floor(random(NUM_FORMAS));
  let varActual = variantes[forma];
  let varNueva = floor(random(VARIANTES_POR_FORMA));
  if (varNueva === varActual) varNueva = (varNueva + 1) % VARIANTES_POR_FORMA;
  variantes[forma] = varNueva;
  flashFrames[forma] = FLASH_DURACION;
}

function resetearMutaciones() {
  for (let i = 0; i < NUM_FORMAS; i++) {
    variantes[i]   = 0;
    flashFrames[i] = FLASH_DURACION;
  }
}

// ============================================================
// CONTROLES
// ============================================================
function keyPressed() {

  if (key === ' ') {
    indicePaleta = (indicePaleta + 1) % NUM_PALETAS;
    cargarPaleta();
  }

  if (key === 'd' || key === 'D') {
    modoDebug = !modoDebug;
  }

  if (key === 'r' || key === 'R') {
    resetearMutaciones();
  }

  if (keyCode === ENTER) {
    mutarUnaForma();
  }

  return false;
}
// ============================================================
// DEBUG
// ============================================================
function dibujarDebug() {
  push();
  noStroke();
  fill(0, 180);
  rect(10, 10, 340, 360);
  fill(255);
  textSize(12);
  textAlign(LEFT, TOP);
  text("=== DEBUG ===",                                                    20, 18);
  text("Paleta: " + indicePaleta + " / " + (NUM_PALETAS - 1),             20, 36);
  text("Intensidad: " + nf(intensidad, 1, 2),                             20, 52);
  text("Grosor borde formas: " + nf(grosorBordeBlanco(), 1, 1),           20, 68);
  text("Lado motivo: " + nf(ladoMotivo(), 1, 1),                          20, 84);
  text("--- AUDIO ---",                                                    20, 106);
  text("Volumen: " + nf(volumenSuavizado, 1, 3),                          20, 122);
  text("Graves: " + nf(nivelGravesSuav, 1, 3) +
       "  (umbral: " + nf(UMBRAL_GRAVES, 1, 2) + ")",                     20, 138);
  text("Agudos: " + nf(nivelAgudosSuav, 1, 3) +
       "  silbando: " + silbando,                                          20, 154);
  text("Grosor líneas: " + nf(grosorLineaSuav, 1, 2) +
       "px  [" + nf(GROSOR_LINEA_MIN,1,1) + "-" + nf(GROSOR_LINEA_MAX,1,1) + "]", 20, 170);
  text("Frames sonido: " + framesSonido + " / " + FRAMES_MUTAR,           20, 186);
  text("Factor grosor: " + nf(factorGrosorManual,1,2),20,314);
text("Grosor real: " + nf(grosorBordeBlanco(),1,2),20,330);
  text("Golpe bloqueado: " + golpeBloqueado,                              20, 202);
  text("Silencio: " + framesSilencio + " / " + FRAMES_SILENCIO_RESET,     20, 218);
  text("Vibración X[0]: " + nf(vibX[0],1,1) +
       "  Y[0]: " + nf(vibY[0],1,1),                                      20, 234);
  let linea = "";
  for (let i = 0; i < NUM_FORMAS; i++) {
    linea += variantes[i];
    if (i < NUM_FORMAS - 1) linea += " ";
  }
text("↑↓ = grosor bordes   SPACE = paleta", 20, 282);
text("ENTER = mutar   R = reset   D = debug", 20, 298);
text("Factor grosor: " + nf(factorGrosorManual,1,2), 20, 314);
text("FPS: " + nf(frameRate(), 2, 1), 20, 330);                           
  pop();
}
window.addEventListener("keydown", function(e) {
  if (
    e.key === "ArrowUp" ||
    e.key === "ArrowDown" ||
    e.key === " "
  ) {
    e.preventDefault();
  }
});
