/* ============================================================
   MNEMOSCIENCES — programme de l'application
   Les sciences à travers la mémoire, du CE1 à la 3e.
   Même ossature que MNEMOMATHS et MNEMOGRAM (bandeau, ambiances, comptes, scores, bilan).
   Les questions sont tirées de banques (une par exercice), et certaines sont fabriquées
   à chaque partie (thermomètres, circuits) : on ne rejoue jamais deux fois la même série.
   ============================================================ */
'use strict';

/* Numéro de version affiché à l'écran (bandeau du haut) : à augmenter à chaque modification.
   v1 : l'ossature (copie de MNEMOMATHS), les personnages, la mosaïque, et tout le CE1 – CE2. */
const APP_VERSION = 'v1';

const $ = (id) => document.getElementById(id);
const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const fmtPts = (n) => String(Math.round((n || 0) * 10) / 10).replace('.', ',');
const capitalize = (t) => t.charAt(0).toUpperCase() + t.slice(1);
/* espaces insécables à la française (guillemets, ! ? : ;) */
const nbspFr = (h) => String(h).replace(/« /g, '« ').replace(/ »/g, ' »').replace(/ ([!?:;])/g, ' $1');

/* ------------------------------------------------------------
   LES QUATRE PERSONNAGES (dessins originaux, dans l'esprit d'une école de sorciers)
   Deux gentils : Maître Fiole et Dame Loupe. Deux grincheux : Maître Court-Circuit et Dame Fausse-Piste.
   Trois sortes de messages par personnage :
   - « messages » : pour tout le monde (joueur sans compte) ;
   - « perso » : avec le prénom de l'enfant ({E}) ;
   - « famille » : avec un adulte de la fiche ({adulte} = « ton papa Marc », {Adulte} = « Ton papa Marc »,
     {fier} = fier / fière selon l'adulte).
   {rep} = la bonne réponse, dite en mots (« la fusion », « un mammifère »).
   ------------------------------------------------------------ */
const CHARACTERS = {
  fiole: {
    nom: 'Maître Fiole', camp: 'good', voix: 'homme',
    messages: [
      'Bravo ! C\'est bien {rep} !',
      'Magnifique ! Ma fiole fait des bulles de joie !',
      'Exactement ! {Rep}, tu l\'as trouvé !',
      'Quelle mémoire ! Je suis fier de toi.',
      'Parfait ! Expérience réussie !',
    ],
    perso: [
      '{E}, c\'est parfait, tu as réussi !',
      '{E}, tu es un vrai savant !',
      'Bravo {E} ! C\'est bien {rep} !',
      'Bien observé, {E} !',
    ],
    famille: [
      'Bravo {E} ! {Adulte} sera {fier} de toi !',
      '{Adulte} sera très {fier} de toi, {E} !',
    ],
  },
  loupe: {
    nom: 'Dame Loupe', camp: 'good', voix: 'femme',
    messages: [
      'Bravo ! C\'est bien {rep} !',
      'Formidable ! Tu deviens un vrai petit savant !',
      'Oui ! {Rep} ! Tu as tout compris.',
      'Superbe ! Continue comme ça !',
      'Excellent ! Rien n\'échappe à ta loupe !',
    ],
    perso: [
      '{E}, c\'est parfait, tu as réussi !',
      'Formidable, {E} ! C\'est bien {rep} !',
      '{E}, tu es une vraie tête chercheuse !',
      'Superbe, {E} ! Continue comme ça !',
    ],
    famille: [
      '{Adulte} sera très {fier} de toi, {E} !',
      'Bravo {E} ! Il faudra raconter ça à {adulte} !',
    ],
  },
  circuit: {
    nom: 'Maître Court-Circuit', camp: 'bad', voix: 'homme',
    messages: [
      'Bzzz… Ce n\'est pas ça. Réfléchis encore et recommence.',
      'Grrr… Raté ! Mais je suis sûr que tu peux trouver.',
      'Pas tout à fait… Allez, encore un petit effort !',
      'Tss tss… Observe bien, tu vas y arriver.',
    ],
    perso: [
      'Bzzz… Ce n\'est pas ça, {E}. Réfléchis encore et recommence.',
      'Grrr… Raté, {E} ! Mais je suis sûr que tu peux trouver.',
      'Allez {E}, encore un petit effort !',
    ],
    famille: [
      'Pas tout à fait, {E}… {Adulte} sait que tu peux trouver !',
    ],
  },
  piste: {
    nom: 'Dame Fausse-Piste', camp: 'bad', voix: 'femme',
    messages: [
      'Oh là là… Ce n\'est pas la bonne réponse. Recommence !',
      'Perdu ! Mais ne te décourage pas, essaie encore.',
      'Hmm… Relis bien la question, et réessaie.',
      'Raté ! Courage, la bonne piste n\'est pas loin.',
    ],
    perso: [
      'Oh là là, {E}… Ce n\'est pas la bonne réponse. Recommence !',
      'Perdu, {E} ! Mais ne te décourage pas, essaie encore.',
      'Courage {E}, la bonne piste n\'est pas loin !',
    ],
    famille: [
      'Raté, {E}… Mais {adulte} compte sur toi : essaie encore !',
    ],
  },
};

/* Dessins en SVG : un sorcier et une sorcière gentils, un sorcier et une sorcière grincheux.
   Sur leurs robes, des symboles scientifiques à la place des étoiles. */
function characterSvg(id) {
  const peauClaire = '#f6cfa8', peauPale = '#efe2cf';
  const signe = (x, y, t, s, c) => `<text x="${x}" y="${y}" font-family="Georgia,serif" font-weight="700" font-size="${s}" fill="${c}" text-anchor="middle">${t}</text>`;
  const atome = (x, y, r, c) => `<g fill="none" stroke="${c}" stroke-width="2.2"><ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.36}"/><ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.36}" transform="rotate(60 ${x} ${y})"/><ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.36}" transform="rotate(-60 ${x} ${y})"/></g><circle cx="${x}" cy="${y}" r="${r * 0.2}" fill="${c}"/>`;
  const eclair = (x, y, s, c) => `<path d="M${x} ${y} l${-6 * s} ${12 * s} h${6 * s} l${-4 * s} ${12 * s} l${12 * s} ${-16 * s} h${-6 * s} l${4 * s} ${-8 * s} Z" fill="${c}"/>`;
  if (id === 'fiole') {
    return `<svg class="character" viewBox="0 0 220 320" xmlns="http://www.w3.org/2000/svg" aria-label="Maître Fiole">
      <path d="M60 165 Q40 240 34 318 H186 Q180 240 160 165 Z" fill="#284b8f"/>
      <path d="M100 168 L110 318 H120 L114 168Z" fill="#1f3b72"/>
      ${signe(66, 258, 'H₂O', 20, '#f2c94c')}${atome(150, 230, 13, '#f2c94c')}${signe(144, 300, '°C', 20, '#f2c94c')}${signe(78, 306, 'O₂', 18, '#f2c94c')}
      <path d="M150 190 Q178 205 186 180" stroke="#284b8f" stroke-width="20" fill="none" stroke-linecap="round"/>
      <path d="M194 118 v30 L176 186 Q172 196 182 196 H214 Q224 196 220 186 L202 148 V118 Z" fill="#dff3f7" fill-opacity=".55" stroke="#e9f6f8" stroke-width="3" stroke-linejoin="round"/>
      <path d="M180 172 Q198 166 216 172 L220 186 Q224 194 214 194 H182 Q172 194 176 186 Z" fill="#5fd35f"/>
      <rect x="191" y="113" width="14" height="7" rx="2" fill="#b07a46"/>
      <circle cx="194" cy="182" r="3" fill="#e9f6f8"/><circle cx="204" cy="176" r="2.2" fill="#e9f6f8"/><circle cx="200" cy="104" r="3" fill="#bfeec0" opacity=".8"/><circle cx="206" cy="94" r="2.2" fill="#bfeec0" opacity=".7"/>
      <circle cx="186" cy="184" r="10" fill="${peauClaire}"/>
      <circle cx="110" cy="128" r="34" fill="${peauClaire}"/>
      <path d="M78 132 Q74 210 110 236 Q146 210 142 132 Q132 160 110 160 Q88 160 78 132Z" fill="#fbfbf7" stroke="#e2e2da" stroke-width="2"/>
      <path d="M92 150 Q110 140 128 150 Q118 158 110 152 Q102 158 92 150Z" fill="#fbfbf7" stroke="#e2e2da" stroke-width="1.5"/>
      <path d="M100 163 Q110 170 120 163" stroke="#b5544a" stroke-width="3" fill="none" stroke-linecap="round"/>
      <circle cx="97" cy="126" r="11" fill="none" stroke="#c9a227" stroke-width="3"/><circle cx="123" cy="126" r="11" fill="none" stroke="#c9a227" stroke-width="3"/>
      <line x1="108" y1="126" x2="112" y2="126" stroke="#c9a227" stroke-width="3"/>
      <path d="M92 127 Q97 122 102 127" stroke="#3a2a20" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M118 127 Q123 122 128 127" stroke="#3a2a20" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M88 112 Q96 106 104 110" stroke="#e8e8e0" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M116 110 Q124 106 132 112" stroke="#e8e8e0" stroke-width="4" fill="none" stroke-linecap="round"/>
      <ellipse cx="110" cy="138" rx="5" ry="6" fill="#eab08a"/>
      <circle cx="88" cy="142" r="5" fill="#f4a3a3" opacity=".6"/><circle cx="132" cy="142" r="5" fill="#f4a3a3" opacity=".6"/>
      <ellipse cx="110" cy="100" rx="62" ry="12" fill="#1f3b72"/>
      <path d="M68 98 Q90 60 104 20 Q112 2 140 6 Q122 12 120 34 Q132 70 152 98Z" fill="#284b8f"/>
      <path d="M72 92 Q110 82 150 92 L148 99 Q110 89 74 99Z" fill="#f2c94c"/>
      ${atome(112, 66, 14, '#f2c94c')}
    </svg>`;
  }
  if (id === 'loupe') {
    return `<svg class="character" viewBox="0 0 220 320" xmlns="http://www.w3.org/2000/svg" aria-label="Dame Loupe">
      <path d="M58 175 Q40 250 30 318 H190 Q180 250 162 175 Z" fill="#8a3f8f"/>
      <path d="M86 175 L110 230 L134 175Z" fill="#f2e6c9"/>
      <path d="M30 318 Q110 300 190 318" stroke="#f2c94c" stroke-width="5" fill="none"/>
      <path d="M56 274 q8 -22 22 -24 q-2 18 -22 24z M66 262 l-6 16" fill="#7ee07e" stroke="#f2c94c" stroke-width="1.5"/>
      ${signe(152, 280, '☼', 26, '#f2c94c')}
      <path d="M150 200 Q180 210 190 184" stroke="#8a3f8f" stroke-width="18" fill="none" stroke-linecap="round"/>
      <line x1="192" y1="178" x2="178" y2="150" stroke="#7a5530" stroke-width="8" stroke-linecap="round"/>
      <circle cx="172" cy="128" r="23" fill="#dff3f7" fill-opacity=".45" stroke="#f2c94c" stroke-width="6"/>
      <path d="M160 120 q6 -8 14 -8" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>
      <circle cx="191" cy="182" r="9" fill="${peauClaire}"/>
      <path d="M72 120 Q66 190 84 200 L136 200 Q154 190 148 120Z" fill="#2b2118"/>
      <circle cx="110" cy="132" r="33" fill="${peauClaire}"/>
      <path d="M78 122 Q90 98 112 104 Q132 100 142 124 Q128 112 110 114 Q92 112 78 122Z" fill="#2b2118"/>
      <path d="M95 130 Q100 124 105 130" stroke="#3a2a20" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M115 130 Q120 124 125 130" stroke="#3a2a20" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M93 125 l-3 -3 M127 125 l3 -3" stroke="#3a2a20" stroke-width="2" stroke-linecap="round"/>
      <path d="M100 148 Q110 158 120 148" stroke="#c0392b" stroke-width="3.5" fill="#e8746a" stroke-linecap="round"/>
      <circle cx="90" cy="142" r="6" fill="#f4a3a3" opacity=".7"/><circle cx="130" cy="142" r="6" fill="#f4a3a3" opacity=".7"/>
      <ellipse cx="110" cy="104" rx="64" ry="12" fill="#5e2a63"/>
      <path d="M70 102 Q92 66 104 28 Q110 10 136 16 Q118 22 120 40 Q130 74 150 102Z" fill="#8a3f8f"/>
      <path d="M74 96 Q110 86 148 96 L147 104 Q110 94 75 104Z" fill="#1f8a7a"/>
      <circle cx="116" cy="62" r="7" fill="none" stroke="#f2c94c" stroke-width="2.5"/><circle cx="116" cy="62" r="2.5" fill="#f2c94c"/>
      <path d="M116 51 v-4 M116 73 v4 M105 62 h-4 M127 62 h4" stroke="#f2c94c" stroke-width="2" stroke-linecap="round"/>
    </svg>`;
  }
  if (id === 'circuit') {
    return `<svg class="character" viewBox="0 0 220 320" xmlns="http://www.w3.org/2000/svg" aria-label="Maître Court-Circuit">
      <path d="M62 165 Q44 240 36 318 H184 Q176 240 158 165 Z" fill="#23272d"/>
      <path d="M92 165 L110 200 L128 165Z" fill="#7a2e2e"/>
      <path d="M70 200 Q110 230 150 200 Q140 220 110 226 Q80 220 70 200Z" fill="#1a1d22"/>
      <path d="M150 210 Q120 222 100 214" stroke="#23272d" stroke-width="18" fill="none" stroke-linecap="round"/>
      <path d="M70 210 Q100 222 120 214" stroke="#2b3037" stroke-width="18" fill="none" stroke-linecap="round"/>
      <rect x="140" y="242" width="56" height="30" rx="4" fill="#c9a227" stroke="#7a5530" stroke-width="3"/><rect x="196" y="250" width="6" height="14" fill="#7a5530"/>
      ${signe(156, 264, '+', 18, '#23272d')}${signe(182, 264, '−', 18, '#23272d')}
      <path d="M150 242 Q140 226 126 232 M188 242 Q200 222 184 214" stroke="#9aa0a6" stroke-width="3" fill="none"/>
      ${eclair(132, 222, 1.1, '#ffe066')}${eclair(192, 200, 0.9, '#ffe066')}
      <path d="M76 118 Q70 175 80 182 L92 182 L92 130Z M144 118 Q150 175 140 182 L128 182 L128 130Z" fill="#15171a"/>
      <circle cx="110" cy="130" r="32" fill="${peauPale}"/>
      <path d="M78 128 Q80 96 110 96 Q140 96 142 128 Q132 108 110 108 Q88 108 78 128Z" fill="#15171a"/>
      <path d="M92 120 L106 126 M128 120 L114 126" stroke="#15171a" stroke-width="4" stroke-linecap="round"/>
      <circle cx="99" cy="131" r="3.5" fill="#15171a"/><circle cx="121" cy="131" r="3.5" fill="#15171a"/>
      <path d="M110 128 Q118 146 108 150" stroke="#c9b59a" stroke-width="3" fill="#e6d3bb" stroke-linejoin="round"/>
      <path d="M99 160 Q110 153 121 160" stroke="#6b3a34" stroke-width="3" fill="none" stroke-linecap="round"/>
      <ellipse cx="110" cy="100" rx="56" ry="10" fill="#15171a"/>
      <path d="M74 98 Q94 64 106 26 Q112 10 150 30 Q124 28 122 44 Q130 74 146 98Z" fill="#23272d"/>
      <path d="M76 92 Q110 84 144 92 L143 98 Q110 90 77 98Z" fill="#7a2e2e"/>
      ${eclair(114, 56, 1, '#9aa0a6')}
    </svg>`;
  }
  /* piste */
  return `<svg class="character" viewBox="0 0 220 320" xmlns="http://www.w3.org/2000/svg" aria-label="Dame Fausse-Piste">
      <path d="M60 172 Q42 248 32 318 H188 Q178 248 160 172 Z" fill="#3f4a23"/>
      <path d="M88 172 L110 196 L132 172Z" fill="#2a3117"/>
      <path d="M32 318 Q110 304 188 318" stroke="#7a8a3f" stroke-width="5" fill="none"/>
      ${signe(70, 262, '?', 26, '#c9b46a')}${signe(148, 296, '≈', 22, '#c9b46a')}
      <path d="M152 200 Q176 196 178 164" stroke="#3f4a23" stroke-width="18" fill="none" stroke-linecap="round"/>
      <circle cx="184" cy="128" r="26" fill="#f4f1e6" stroke="#c9a227" stroke-width="5"/>
      <path d="M184 106 v6 M184 144 v6 M162 128 h6 M200 128 h6" stroke="#7a8a3f" stroke-width="2.5"/>
      <path d="M184 128 L170 112 L186 124 Z" fill="#c0392b"/><path d="M184 128 L198 146 L182 132 Z" fill="#5e6266"/>
      <path d="M156 100 q-8 -10 2 -16 M212 100 q8 -10 -2 -16" stroke="#c9b46a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <circle cx="178" cy="160" r="9" fill="${peauPale}"/>
      <path d="M72 128 Q66 176 82 182 L138 182 Q154 176 148 128Z" fill="#9aa0a6"/>
      <circle cx="110" cy="132" r="32" fill="${peauPale}"/>
      <path d="M78 126 Q86 100 110 102 Q134 100 142 126 Q128 112 110 114 Q92 112 78 126Z" fill="#b3b8bd"/>
      <path d="M92 120 L106 124 M128 120 L114 124" stroke="#5e6266" stroke-width="3.5" stroke-linecap="round"/>
      <circle cx="99" cy="131" r="3.5" fill="#2a3117"/><circle cx="121" cy="131" r="3.5" fill="#2a3117"/>
      <path d="M110 130 Q126 148 112 152" stroke="#c9b59a" stroke-width="3" fill="#e6d3bb" stroke-linejoin="round"/>
      <circle cx="120" cy="146" r="2.6" fill="#a08a6a"/>
      <path d="M100 162 Q110 156 120 162" stroke="#6b3a54" stroke-width="3" fill="none" stroke-linecap="round"/>
      <ellipse cx="110" cy="104" rx="60" ry="11" fill="#2a3117"/>
      <path d="M72 102 Q90 70 100 40 Q104 24 96 8 Q120 14 120 40 Q128 76 148 102Z" fill="#3f4a23"/>
      <path d="M76 96 Q110 88 146 96 L145 103 Q110 95 77 103Z" fill="#7a8a3f"/>
      ${signe(112, 76, '✗', 18, '#c9b46a')}
    </svg>`;
}
/* ------------------------------------------------------------
   VOIX DE SYNTHÈSE (5 niveaux de volume, 0 = muet), réglage gardé d'une visite à l'autre
   ------------------------------------------------------------ */
let volumeLevel = 3;
try { const v = localStorage.getItem('mnemosciences-volume'); if (v !== null) volumeLevel = Number(v); } catch (e) {}
function refreshVolumeBars() {
  document.querySelectorAll('.volume-bar').forEach((b) => b.classList.toggle('on', Number(b.dataset.level) <= volumeLevel));
}
document.querySelectorAll('.volume-bar').forEach((b) => b.addEventListener('click', () => {
  const lvl = Number(b.dataset.level);
  volumeLevel = (lvl === volumeLevel) ? lvl - 1 : lvl;   /* un clic sur la dernière barre allumée baisse d'un cran (jusqu'à muet) */
  try { localStorage.setItem('mnemosciences-volume', String(volumeLevel)); } catch (e) {}
  refreshVolumeBars();
  if (volumeLevel === 0 && 'speechSynthesis' in window) speechSynthesis.cancel();
}));
refreshVolumeBars();

function pickFrenchVoice(prefer) {
  if (!('speechSynthesis' in window)) return null;
  const voices = speechSynthesis.getVoices().filter((v) => /^fr/i.test(v.lang));
  if (!voices.length) return null;
  const fr = voices.filter((v) => /fr[-_]FR/i.test(v.lang));
  const pool = fr.length ? fr : voices;
  const femmes = /(amélie|amelie|audrey|aurélie|aurelie|julie|marie|denise|hortense|virginie|céline|celine|léa|lea|female|femme)/i;
  const hommes = /(thomas|paul|henri|claude|nicolas|mathieu|daniel|male|homme)/i;
  const re = prefer === 'femme' ? femmes : hommes;
  return pool.find((v) => re.test(v.name)) || pool[0];
}
/* ------------------------------------------------------------
   PRONONCIATION (v6) : même principe que Mnemart et son atelier phonétique.
   PRON_COMMUNE : écritures valables pour toutes les voix (« sœur » → « seur », sinon certaines voix disent « sourd »).
   PRON_PAR_VOIX : écritures propres à une voix, repérée par un morceau de son nom ; '' = lire le mot tel quel.
   Point de départ : les réglages de l'atelier de Mnemart pour les mots que MNEMOGRAM utilise. Les exports de
   l'atelier MNEMOGRAM (bouton « Copier pour Claude ») viendront compléter ces deux tables.
   Un nom commun se dit pareil au singulier et au pluriel : régler « sœur » règle aussi « sœurs ».
   ------------------------------------------------------------ */
const PRON_COMMUNE = {
  'sœur': 'seur',
  'soeur': 'seur',
  'poisson': 'Pouasson',
  'paul': 'pol',
  /* v104 : export de l'atelier de prononciation du 25 novembre */
  'claquaient': 'clakè', 'claquais': 'clakè', 'claquait': 'clakè',
  'colomb': 'colon', 'gizeh': 'guizé', 'juteuses': 'jutt-euse',
  'moyen âge': 'moyen-âge', 'oeuf': 'euf', 'oeufs': 'eux', 'œuf': 'euf', 'œufs': 'eux',
  'sandwich': 'sand-witch', 'semer': 'semé', 'trampoline': 'tranpoline',
  /* v104 : liaisons oubliées ou fautives signalées par Stéphane, et mots mal lus */
  'sommes allés': 'sommes zallés', 'sommes allées': 'sommes zallées',
  "s'est assis": "s'est tassis", "s'est assise": "s'est tassise",
  'vont à': 'von ta', 'fait un': 'fai tun', 'en amérique': 'en nAmérique',
  'nez orange': 'né orange', 'chacun aura': 'chacun, aura',
  'chassent': 'chasse', 'montons': 'mon-tons', 'gelaient': 'jelè', 'levons': 'leuvons',
  'les os': 'lé zo', 'des os': 'dé zo', 'ses os': 'sé zo',
};
const PRON_PAR_VOIX = {
  'français france': { 'paul': '' },
  'français canada': { 'paul': '' },
  'hortense': { 'paul': '', 'sandwich': 'sandwitch' },
  'julie': { 'paul': '', 'sandwich': 'sandwitch' },
  'paul': { 'paul': '', 'sandwich': 'sandwitch' },
  'vivienne': { 'poisson': 'Poisson', 'juteuses': 'juteuse' },
  'rémy': { 'poisson': 'Poisson', 'juteuses': 'juteuse' },
  'jean': { 'juteuses': 'juteuse' }, 'antoine': { 'juteuses': 'juteuse' }, 'thierry': { 'juteuses': 'juteuse' },
  'denise': { 'juteuses': 'juteuse' }, 'henri': { 'juteuses': 'juteuse' }, 'eloise': { 'juteuses': 'juteuse' },
};
const sansAccents = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[()\-_]+/g, ' ').replace(/\s+/g, ' ').trim();
function pronOverrides(voice) {
  const name = sansAccents(voice?.name);
  if (!name) return null;
  const hit = Object.keys(PRON_PAR_VOIX).find((part) => name.includes(sansAccents(part)));
  return hit ? PRON_PAR_VOIX[hit] : null;
}
const reEsc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/* v104 : quelques règles générales, valables pour tous les textes, avant la table des mots */
const LETTRE_DITE = { a: 'a', b: 'bé', c: 'cé', d: 'dé', e: 'eu', é: 'é', è: 'è', ê: 'ê', f: 'èf', g: 'jé', h: 'ache', i: 'i', î: 'i', j: 'ji', k: 'ka', l: 'èl', m: 'èm', n: 'èn', o: 'o', ô: 'ô', p: 'pé', q: 'ku', r: 'èr', s: 'èss', t: 'té', u: 'u', û: 'u', v: 'vé', w: 'double vé', x: 'iks', y: 'i grec', z: 'zèd', ç: 'cé cédille', â: 'â' };
const GENT_NOMS = new Set(['argent', 'agent', 'agents', 'urgent', 'sergent', 'régent', 'négligent', 'intelligent', 'diligent', 'indulgent', 'émergent', 'gent', 'entregent', 'contingent', 'tangent', 'convergent', 'divergent']);
function reglesPrononciation(out) {
  /* une terminaison écrite seule (-ez, -ons, -ent, -er) se lit lettre par lettre : « e, z » et non « é » */
  out = out.replace(/(^|[\s«(])-([a-zàâçéèêîôûœ]{1,5})(?=[\s»,.;:)!?]|$)/giu, (m, a, t) => `${a}${[...t.toLowerCase()].map((l) => LETTRE_DITE[l] || l).join(', ')}`);
  /* futur et conditionnel en -rr- (courir, mourir, pouvoir, voir, envoyer, acquérir) : on fait entendre le double r */
  out = out.replace(/(?<![\p{L}])(\p{L}*?(?:cour|mour|pour|ver|enver|acquer))r(ai|as|a|ons|ez|ont|ais|ait|ions|iez|aient)(?![\p{L}])/giu, '$1-r$2');
  /* les verbes en -ger au pluriel (rangent, rechargent) : la voix les lisait comme des participes (« rangeant ») */
  out = out.replace(/(?<![\p{L}])(\p{L}+)gent(?![\p{L}])/giu, (m, b) => (GENT_NOMS.has(m.toLowerCase()) ? m : `${b}ge`));
  /* dix et six : « di » devant une consonne, « diz » devant une voyelle, « disse » en fin de groupe */
  /* MNEMOSCIENCES : devant « plus, moins, fois, divisé, égale, et demi », on dit « disse », « sisse » (six plus quatre) */
  out = out.replace(/(?<![\p{L}\p{N}-])(dix|six|10|6)(?![\p{L}\p{N},.-])(\s+)?(\p{L})?/giu, (m, n, sp, l, pos, all) => {
    const base = /^(dix|10)$/i.test(n) ? 'di' : 'si';
    if (sp && l && /^(plus|moins|fois|divis|égal|egal|font|fait|et demi)/i.test(all.slice(pos + n.length + sp.length))) return `${base}sse${sp}${l}`;
    if (!sp || !l) return `${base}sse${sp || ''}${l || ''}`;
    if (/[aeiouyéèêàâîôûœh]/i.test(l)) return `${base}z ${l}`;
    return `${base} ${l}`;
  });
  /* sigles des classes */
  out = out.replace(/(?<![\p{L}])(CP|CE1|CE2|CM1|CM2)(?![\p{L}\p{N}])/gu, (m) => ({ CP: 'cé-pé', CE1: 'cé-eu un', CE2: 'cé-eu deux', CM1: 'cé-èm un', CM2: 'cé-èm deux' }[m]));
  /* le point d'interrogation collé au dernier mot : certaines voix montent alors mieux le ton */
  out = out.replace(/\s+([?!])/g, '$1');
  return out;
}
function fixPronunciation(text, voice) {
  let out = reglesPrononciation(String(text || ''));
  const NB = '(?<![\\p{L}\\p{N}])', NA = '(?![\\p{L}\\p{N}])';
  const vo = pronOverrides(voice) || {};
  const keys = [...new Set([...Object.keys(PRON_COMMUNE), ...Object.keys(vo)])].sort((a, b) => b.length - a.length);   /* expressions avant les mots seuls */
  keys.forEach((k) => {
    const right = Object.prototype.hasOwnProperty.call(vo, k) ? vo[k] : PRON_COMMUNE[k];
    if (right === '' || right === undefined) return;
    const pluriel = /\s/.test(k) ? '' : '(?:s|x)?';
    out = out.replace(new RegExp(`${NB}${reEsc(k)}${pluriel}${NA}`, 'giu'), right);
  });
  /* v102 : les sigles se lisent lettre par lettre (COD et non « code », COI et non « quoi ») */
  const SIGLES = { COD: 'cé-o-dé', COI: 'cé-o-i', COS: 'cé-o-èss', CC: 'cé-cé', CCL: 'cé-cé-èl', GN: 'gé-ène', GNS: 'gé-ène-èss', GV: 'gé-vé', CDN: 'cé-dé-ène' };
  out = out.replace(/(?<![\p{L}])(COD|COI|COS|CCL|CC|GNS|GN|GV|CDN)(?![\p{L}])/gu, (m) => SIGLES[m]);
  /* v92 : sujet inversé après un verbe en -t ou -d : on écrit la liaison pour la voix (répondit-elle → répondi-t-elle) */
  out = out.replace(/(\p{L}{2,}?)[td]-(il|elle|on|ils|elles)(?![\p{L}])/giu, '$1-t-$2');
  return out;
}

/* v5 : voix plus dynamiques. Les sorciers parlent vite et avec entrain (débit 1,25 ; voix un peu plus aiguë
   pour les gentils, un peu plus grave pour les grincheux). La phrase de l'exercice, elle, reste lue à un débit
   normal (1,05), pour que l'enfant ait le temps de suivre les mots. */
const VOICE_STYLES = {
  good: { rate: 1.25, pitch: 1.2 },
  bad: { rate: 1.2, pitch: 0.9 },
  phrase: { rate: 1.05, pitch: 1 },
};
function speak(text, prefer, style = 'good', enchaine = false) {
  if (!volumeLevel || !('speechSynthesis' in window)) return;
  if (!enchaine) speechSynthesis.cancel();   /* enchaine = true : se dit après la phrase en cours, sans la couper */
  const v = pickFrenchVoice(prefer);
  const u = new SpeechSynthesisUtterance(fixPronunciation(text, v).replace(/…/g, ', '));
  u.lang = 'fr-FR';
  if (v) u.voice = v;
  const st = VOICE_STYLES[style] || VOICE_STYLES.good;
  u.volume = volumeLevel / 5;
  u.rate = st.rate;
  u.pitch = st.pitch;
  speechSynthesis.speak(u);
}
if ('speechSynthesis' in window) speechSynthesis.onvoiceschanged = () => {};


/* ------------------------------------------------------------
   LA VOIX ET LES MATHÉMATIQUES
   La voix lit mal les signes et les abréviations : on les écrit en toutes lettres avant de la faire parler.
   « 7 × 8 = ? » → « 7 fois 8 égale combien ? » ; « 3 cm » → « 3 centimètres » ; « 3 h 15 » → « 3 heures 15 ».
   ------------------------------------------------------------ */
const UNITES_DITES = { mm: 'millimètres', cm: 'centimètres', dm: 'décimètres', m: 'mètres', dam: 'décamètres', hm: 'hectomètres', km: 'kilomètres', mg: 'milligrammes', cg: 'centigrammes', dg: 'décigrammes', g: 'grammes', dag: 'décagrammes', hg: 'hectogrammes', kg: 'kilogrammes', mL: 'millilitres', cL: 'centilitres', dL: 'décilitres', L: 'litres', daL: 'décalitres', hL: 'hectolitres', kL: 'kilolitres', min: 'minutes', s: 'secondes', V: 'volts' };
const UNITES_RE = '(?:dam|daL|dag|hm|hg|hL|kL|km|kg|mm|mg|mL|cm|cg|cL|dm|dg|dL|min|m|g|L|s|V)';
function voixMaths(t) {
  let s = String(t || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/[  ]/g, ' ');
  s = s.replace(/(\d) (?=\d{3}\b)/g, '$1');
  /* MNEMOSCIENCES : les degrés, et les flèches des chaînes (« herbe → lapin ») lues comme une pause */
  s = s.replace(/(\d+(?:,\d+)?) ?°C/g, (m, n) => `${n} degré${n === '1' || n === '0' ? '' : 's'}`).replace(/°C/g, 'degrés').replace(/→/g, ', ');                     /* 3 452 → 3452 : la voix lit le nombre entier */
  s = s.replace(/(\d+)\s*\/\s*(\d+)/g, (m, a, b) => fracMots(Number(a), Number(b)));
  const nb = (n, mot) => `${n} ${n === '1' ? mot.replace(/s$/, '') : mot}`;
  s = s.replace(/(\d+) h (\d+)/g, (m, h, mi) => `${nb(h, 'heures')} ${mi}`).replace(/(\d+) h\b/g, (m, h) => nb(h, 'heures'));
  s = s.replace(/(\d+(?:,\d+)?) ?€/g, (m, n) => nb(n, 'euros')).replace(/(\d+) c\b/g, (m, n) => nb(n, 'centimes'));
  s = s.replace(/(\d+(?:,\d+)?) ?(cm|dm|m)²/g, (m, n, u) => `${nb(n, UNITES_DITES[u])} carrés`).replace(/(\d+(?:,\d+)?) ?(cm|dm|m)³/g, (m, n, u) => `${nb(n, UNITES_DITES[u])} cubes`);
  s = s.replace(/(?<![\p{L}])(cm|dm|m)²/gu, (m, u) => `${UNITES_DITES[u]} carrés`).replace(/(?<![\p{L}])(cm|dm|m)³/gu, (m, u) => `${UNITES_DITES[u]} cubes`).replace(/km\/h/g, 'kilomètres par heure').replace(/(\d+) %/g, '$1 pour cent');
  /* une abréviation n'est remplacée que si elle est isolée : pas de lettre juste après (le « m » de « mètres » reste tel quel) */
  const fin = '(?![\\p{L}\\p{N}])';
  s = s.replace(new RegExp(`(\\d+(?:,\\d+)?) ?(${UNITES_RE})${fin}`, 'gu'), (m, n, u) => nb(n, UNITES_DITES[u]));
  s = s.replace(new RegExp(`combien de (${UNITES_RE})${fin}`, 'gu'), (m, u) => `combien de ${UNITES_DITES[u]}`);
  s = s.replace(/×/g, ' fois ').replace(/÷/g, ' divisé par ').replace(/\+/g, ' plus ').replace(/−/g, ' moins ').replace(/ - /g, ' moins ');
  s = s.replace(/= ?\?/g, ' égale combien ?').replace(/=/g, ' égale ').replace(/</g, ' est plus petit que ').replace(/>/g, ' est plus grand que ');
  s = s.replace(/…/g, ' ').replace(/\?/g, ' ?').replace(/\s+/g, ' ').trim();
  return s;
}

/* ------------------------------------------------------------
   LES NOMBRES EN LETTRES (orthographe traditionnelle, celle des manuels de CE)
   ------------------------------------------------------------ */
const U_MOTS = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize'];
const D_MOTS = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante'];
function moins100(n) {
  if (n < 17) return U_MOTS[n];
  if (n < 20) return `dix-${U_MOTS[n - 10]}`;
  const d = Math.floor(n / 10), u = n % 10;
  if (d === 7) return u === 1 ? 'soixante et onze' : `soixante-${moins100(10 + u)}`;
  if (d === 8) return u === 0 ? 'quatre-vingts' : `quatre-vingt-${U_MOTS[u]}`;
  if (d === 9) return `quatre-vingt-${moins100(10 + u)}`;
  return D_MOTS[d] + (u === 0 ? '' : u === 1 ? ' et un' : `-${U_MOTS[u]}`);
}
function moins1000(n, devantMille) {
  const c = Math.floor(n / 100), r = n % 100;
  let s = '';
  if (c) s = (c > 1 ? `${U_MOTS[c]} ` : '') + 'cent' + (c > 1 && r === 0 && !devantMille ? 's' : '');
  if (r) {
    let m = moins100(r);
    if (devantMille && m === 'quatre-vingts') m = 'quatre-vingt';
    s += (s ? ' ' : '') + m;
  }
  return s;
}
function enLettres(n) {
  if (n === 0) return 'zéro';
  const mi = Math.floor(n / 1000), r = n % 1000;
  return [mi ? (mi === 1 ? 'mille' : `${moins1000(mi, true)} mille`) : '', r ? moins1000(r, false) : ''].filter(Boolean).join(' ');
}
/* les fractions en mots : « un quart », « trois cinquièmes » */
const FRAC_NOMS = { 2: 'demi', 3: 'tiers', 4: 'quart', 5: 'cinquième', 6: 'sixième', 7: 'septième', 8: 'huitième', 9: 'neuvième', 10: 'dixième', 12: 'douzième' };
function fracMots(n, d) {
  const nom = FRAC_NOMS[d] || `${enLettres(d)}ième`;
  return `${n === 1 ? 'un' : enLettres(n)} ${nom}${n > 1 && !/s$/.test(nom) ? 's' : ''}`;
}
const fracHtml = (n, d) => `<span class="frac"><span>${n}</span><span>${d}</span></span>`;

/* ------------------------------------------------------------
   ÉCRIRE ET LIRE LES NOMBRES
   À l'écran : espace fine entre les classes (3 452), virgule pour les décimaux (4,50).
   L'élève peut écrire « 3452 », « 3 452 », « 4.5 » ou « 4,50 » : on compare la valeur.
   ------------------------------------------------------------ */
const NNBSP = ' ';
function fmtN(x, dec) {
  let s = dec != null ? Number(x).toFixed(dec) : String(Math.round(x * 1000) / 1000);
  let [ent, frac] = s.split('.');
  const neg = ent.startsWith('-'); if (neg) ent = ent.slice(1);
  if (ent.length > 3) ent = ent.replace(/\B(?=(\d{3})+(?!\d))/g, NNBSP);
  return (neg ? '−' : '') + ent + (frac ? `,${frac}` : '');
}
const fmtEuros = (c) => (c % 100 ? `${fmtN(c / 100, 2)} €` : `${fmtN(c / 100)} €`);
const fmtHeure = (min) => { const h = Math.floor(min / 60) % 24, m = min % 60; return m ? `${h} h ${String(m).padStart(2, '0')}` : `${h} h`; };
const fmtDuree = (min) => { const h = Math.floor(min / 60), m = min % 60; return h && m ? `${h} h ${m} min` : h ? `${h} h` : `${m} min`; };
function lisNombre(s) {
  /* v6 : le signe moins peut être tapé « - » ou « − » (touche du clavier de l'écran) */
  const t = String(s || '').replace(/[\s\u202f\u00a0]/g, '').replace(/[−–]/g, '-').replace(',', '.').replace(/(€|°|[a-zA-Zé²³]+)$/, '');
  return /^-?\d+(\.\d+)?$/.test(t) ? Number(t) : NaN;
}
/* une heure ou une durée écrite par l'élève : « 15 h 45 », « 15h45 », « 15:45 », « 1 h 15 min », « 90 min » */
function lisMinutes(s) {
  const t = String(s || '').toLowerCase().replace(/[\s  ]/g, '');
  let m = t.match(/^(\d{1,2})(?:h|:)(\d{1,2})?(?:min)?$/); if (m) return Number(m[1]) * 60 + Number(m[2] || 0);
  m = t.match(/^(\d+)min$/); if (m) return Number(m[1]);
  return NaN;
}
const normTexte = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[\s  ]/g, '');

/* ------------------------------------------------------------
   LE PORTAIL DES NIVEAUX (comme dans MNEMOGRAM)
   Quatre onglets au-dessus des trois parties. Les trois parties suivent les trois colonnes de la progression : physique-chimie, vivant, technologie et Terre.
   « avenir » : un exercice prévu dans la progression, pas encore construit (bouton grisé « bientôt »).
   gen : le nom du fabricant de questions (voir GEN plus bas) ; n : le nombre de questions d'une partie.
   ------------------------------------------------------------ */
const CLASSES = [
  { id: 'ce', nom: 'CE1 – CE2', cycle: 'cycle 2 · questionner le monde' },
  { id: 'cm', nom: 'CM1 – CM2', cycle: 'cycle 3 · sciences et technologie' },
  { id: '65', nom: '6e – 5e', cycle: 'fin du cycle 3, début du cycle 4' },
  { id: '43', nom: '4e – 3e', cycle: 'cycle 4 · physique-chimie, SVT, technologie' },
];
const PARTIES = ['matiere', 'vivant', 'technique'];
const PARTIES_NOM = { matiere: 'Matière, mouvement, énergie', vivant: 'Le vivant', technique: 'Objets techniques et planète Terre' };
const regle = '<strong>Si tu te trompes, tu as droit à un deuxième essai.</strong> Chaque bonne réponse du premier coup vaut 1 point.';
const PARCOURS = {
  matiere: [
    { jeu: 'ce-etats', gen: 'etats', titre: 'Solides et liquides', classes: ['ce'],
      consigne: `Le lait, une pierre, le sable, le miel : est-ce un solide ou un liquide ? Un solide garde sa forme ; un liquide coule et prend la forme du récipient. ${regle}` },
    { jeu: 'ce-eau', gen: 'eau', titre: 'Les changements d\'état de l\'eau', classes: ['ce'],
      consigne: `Lis des thermomètres, et retrouve si l'eau est de la glace, de l'eau liquide ou de la vapeur. Puis les mots à connaître : fusion, solidification, vaporisation, condensation, et les températures 0 °C et 100 °C. ${regle}` },
    { jeu: 'ce-air', gen: 'air', titre: 'L\'air, une matière invisible', classes: ['ce'],
      consigne: `On ne le voit pas, mais l'air existe : il prend de la place, il pèse et on peut le comprimer. Retrouve les expériences qui le prouvent. ${regle}` },
    { jeu: 'ce-mouv', gen: 'mouv', titre: 'Mouvements et énergie', classes: ['ce'],
      consigne: `Mesurer une distance et une durée, comparer qui va le plus vite, et découvrir comment le vent et l'eau font bouger les choses. ${regle}` },
    { jeu: 'ce-bilan-mat', mix: ['etats', 'eau', 'air', 'mouv'], n: 14, titre: 'Tout sur la matière, le mouvement et l\'énergie', classes: ['ce'], bilan: true,
      consigne: `<strong>Bilan</strong> : tout ce que tu as appris sur la matière, le mouvement et l'énergie, mélangé. Quatorze questions, de plus en plus difficiles. ${regle}` },
    { jeu: 'ce-quiz-mat', quiz: 'ce-matiere', n: 12, titre: 'Quiz de cours : matière, mouvement, énergie', classes: ['ce'], quizCours: true, consigne: `<strong>Quiz de cours</strong> : 12 questions tirées au hasard parmi les définitions et le vocabulaire à savoir par cœur. Ce sont toujours les mêmes questions qui reviennent : rejoue jusqu'à toutes les connaître ! ${regle}` },
    { titre: 'Les familles de matériaux et leurs propriétés', classes: ['cm'], avenir: true },
    { titre: 'Mélanges, dissolution, filtration, décantation', classes: ['cm'], avenir: true },
    { titre: 'Les sources d\'énergie, renouvelables ou non', classes: ['cm'], avenir: true },
    { titre: 'Décrire un mouvement : trajectoire et vitesse', classes: ['cm'], avenir: true },
    { titre: 'Les chaînes d\'énergie', classes: ['cm'], avenir: true },
    { titre: 'Les signaux et l\'information', classes: ['cm'], avenir: true },
    { titre: 'Masse et volume', classes: ['65'], avenir: true },
    { titre: 'Transformations chimiques simples', classes: ['65'], avenir: true },
    { titre: 'La vitesse moyenne', classes: ['65'], avenir: true },
    { titre: 'Les circuits en série et en dérivation', classes: ['65'], avenir: true },
    { titre: 'Le modèle particulaire et la conservation de la masse (5e)', classes: ['65'], avenir: true },
    { titre: 'Conducteurs et isolants, sens du courant (5e)', classes: ['65'], avenir: true },
    { titre: 'La lumière : sources, propagation, ombres et éclipses (5e)', classes: ['65'], avenir: true },
    { titre: 'Atomes, molécules et combustions (4e)', classes: ['43'], avenir: true },
    { titre: 'Tension, intensité et loi d\'Ohm (4e)', classes: ['43'], avenir: true },
    { titre: 'Le son et la lumière (4e)', classes: ['43'], avenir: true },
    { titre: 'L\'atome, les ions et le pH (3e)', classes: ['43'], avenir: true },
    { titre: 'Forces, poids et masse, gravitation (3e)', classes: ['43'], avenir: true },
    { titre: 'Énergie, puissance et énergie électrique (3e)', classes: ['43'], avenir: true },
  ],
  vivant: [
    { jeu: 'ce-vivant', gen: 'vivant', titre: 'Le vivant et ses besoins', classes: ['ce'],
      consigne: `Vivant ou non vivant ? Un être vivant naît, se nourrit, grandit, se reproduit et meurt. Et de quoi les plantes et les animaux ont-ils besoin pour vivre ? ${regle}` },
    { jeu: 'ce-sante', gen: 'sante', titre: 'Grandir et rester en bonne santé', classes: ['ce'],
      consigne: `Les dents de lait, la croissance, et les bonnes habitudes : bien manger, bien dormir, bouger, se laver les mains. ${regle}` },
    { jeu: 'ce-cycle', gen: 'cycle', titre: 'Le cycle de vie des animaux et des plantes', classes: ['ce'],
      consigne: `De l'œuf au papillon, du têtard à la grenouille, de la graine au fruit : comment naissent et grandissent les êtres vivants. ${regle}` },
    { jeu: 'ce-chaine', gen: 'chaine', titre: 'Qui mange quoi ? Les chaînes alimentaires', classes: ['ce'],
      consigne: `Herbivore, carnivore ou omnivore ? Complète des chaînes alimentaires (la flèche veut dire « est mangé par ») et découvre comment les êtres vivants dépendent les uns des autres. ${regle}` },
    { jeu: 'ce-bilan-viv', mix: ['vivant', 'sante', 'cycle', 'chaine'], n: 14, titre: 'Tout sur le vivant', classes: ['ce'], bilan: true,
      consigne: `<strong>Bilan</strong> : tout ce que tu as appris sur le vivant, mélangé. Quatorze questions, de plus en plus difficiles. ${regle}` },
    { jeu: 'ce-quiz-viv', quiz: 'ce-vivant', n: 12, titre: 'Quiz de cours : le vivant', classes: ['ce'], quizCours: true, consigne: `<strong>Quiz de cours</strong> : 12 questions tirées au hasard parmi les définitions et le vocabulaire à savoir par cœur. Ce sont toujours les mêmes questions qui reviennent : rejoue jusqu'à toutes les connaître ! ${regle}` },
    { titre: 'Classer les êtres vivants', classes: ['cm'], avenir: true },
    { titre: 'La digestion', classes: ['cm'], avenir: true },
    { titre: 'Décomposition et recyclage de la matière organique', classes: ['cm'], avenir: true },
    { titre: 'Respiration et circulation sanguine', classes: ['cm'], avenir: true },
    { titre: 'La puberté et la reproduction humaine', classes: ['cm'], avenir: true },
    { titre: 'La biodiversité et l\'évolution', classes: ['cm'], avenir: true },
    { titre: 'La cellule', classes: ['65'], avenir: true },
    { titre: 'Groupes emboîtés et parenté', classes: ['65'], avenir: true },
    { titre: 'Micro-organismes et production alimentaire', classes: ['65'], avenir: true },
    { titre: 'La Terre et le climat (5e)', classes: ['65'], avenir: true },
    { titre: 'Le corps humain et l\'effort (5e)', classes: ['65'], avenir: true },
    { titre: 'La nutrition des plantes (5e)', classes: ['65'], avenir: true },
    { titre: 'Tectonique des plaques, volcans et séismes (4e)', classes: ['43'], avenir: true },
    { titre: 'Reproduction et hormones (4e)', classes: ['43'], avenir: true },
    { titre: 'Le système nerveux (4e)', classes: ['43'], avenir: true },
    { titre: 'Chromosomes, ADN et gènes (3e)', classes: ['43'], avenir: true },
    { titre: 'L\'évolution et la sélection naturelle (3e)', classes: ['43'], avenir: true },
    { titre: 'Microbes, défenses du corps et vaccination (3e)', classes: ['43'], avenir: true },
    { titre: 'Les enjeux planétaires (3e)', classes: ['43'], avenir: true },
  ],
  technique: [
    { jeu: 'ce-objets', gen: 'objets', titre: 'Les objets et le numérique', classes: ['ce'],
      consigne: `À quoi sert un objet ? C'est sa fonction d'usage. Puis le clavier, la souris, l'imprimante, et les bonnes règles sur Internet. ${regle}` },
    { jeu: 'ce-circuit', gen: 'circuit', titre: 'Les circuits électriques', classes: ['ce'],
      consigne: `Une pile, une ampoule, des fils, un interrupteur : regarde chaque circuit et dis si l'ampoule brille. Le courant doit faire tout le tour ! ${regle}` },
    { jeu: 'ce-meca', gen: 'meca', titre: 'Engrenages, poulies et leviers', classes: ['ce'],
      consigne: `Dans quel sens tourne la roue dentée ? À quoi sert une poulie ? Comment un levier aide-t-il à soulever ? ${regle}` },
    { jeu: 'ce-secu', gen: 'secu', titre: 'La sécurité à la maison', classes: ['ce'],
      consigne: `L'électricité des prises, les produits dangereux et leurs pictogrammes, les numéros d'urgence. ${regle}` },
    { jeu: 'ce-terre', gen: 'terre', titre: 'Le jour, la nuit, les saisons et le système solaire', classes: ['ce'],
      consigne: `Pourquoi le jour et la nuit ? Où se lève le Soleil ? Et le Soleil, la Terre, la Lune, les planètes. ${regle}` },
    { jeu: 'ce-bilan-tec', mix: ['objets', 'circuit', 'meca', 'secu', 'terre'], n: 14, titre: 'Tout sur les objets techniques et la Terre', classes: ['ce'], bilan: true,
      consigne: `<strong>Bilan</strong> : tout ce que tu as appris sur les objets techniques et la Terre, mélangé. Quatorze questions, de plus en plus difficiles. ${regle}` },
    { jeu: 'ce-quiz-tec', quiz: 'ce-technique', n: 12, titre: 'Quiz de cours : objets techniques et Terre', classes: ['ce'], quizCours: true, consigne: `<strong>Quiz de cours</strong> : 12 questions tirées au hasard parmi les définitions et le vocabulaire à savoir par cœur. Ce sont toujours les mêmes questions qui reviennent : rejoue jusqu'à toutes les connaître ! ${regle}` },
    { titre: 'Analyser un objet technique', classes: ['cm'], avenir: true },
    { titre: 'Algorithmes et programmation (Scratch)', classes: ['cm'], avenir: true },
    { titre: 'Les mouvements de la Terre, les séismes et les volcans', classes: ['cm'], avenir: true },
    { titre: 'Choisir un matériau, le recyclage', classes: ['cm'], avenir: true },
    { titre: 'Les réseaux informatiques', classes: ['cm'], avenir: true },
    { titre: 'Ressources, risques naturels et changement climatique', classes: ['cm'], avenir: true },
    { titre: 'Cahier des charges et prototype', classes: ['65'], avenir: true },
    { titre: 'Programmer avec des boucles et des conditions', classes: ['65'], avenir: true },
    { titre: 'La Terre dans le système solaire, météo et climat', classes: ['65'], avenir: true },
    { titre: 'Chaîne d\'énergie et chaîne d\'information (5e)', classes: ['65'], avenir: true },
    { titre: 'Matériaux et structures (5e)', classes: ['65'], avenir: true },
    { titre: 'L\'ordinateur, les capteurs et les actionneurs (5e)', classes: ['65'], avenir: true },
    { titre: 'Les objets connectés (4e)', classes: ['43'], avenir: true },
    { titre: 'La simulation numérique (4e)', classes: ['43'], avenir: true },
    { titre: 'Variables, événements et capteurs (4e)', classes: ['43'], avenir: true },
    { titre: 'Projet et développement durable (3e)', classes: ['43'], avenir: true },
    { titre: 'Réseaux, adresses IP et cybersécurité (3e)', classes: ['43'], avenir: true },
    { titre: 'Représentation fonctionnelle et algorithmes (3e)', classes: ['43'], avenir: true },
  ],
};


/* ------------------------------------------------------------
   LES FIGURES, DESSINÉES À LA CRAIE SUR L'ARDOISE
   Craie blanche pour les traits, craies de couleur pour ce qu'on regarde.
   ------------------------------------------------------------ */
const CRAIE = '#f4f1e6', JAUNE = '#ffe066', ROSE = '#ff9ec7', BLEU = '#8fd3ff', VERT = '#9be59b', ROUGE = '#ff7a6b';
const svgArdoise = (w, h, corps, label) => `<svg class="mm-svg" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label || ''}">${corps}</svg>`;
const txt = (x, y, t, o = {}) => `<text x="${x}" y="${y}" text-anchor="${o.ancre || 'middle'}" dominant-baseline="middle" font-family="Comic Sans MS, Chalkboard SE, cursive" font-size="${o.taille || 16}" font-weight="${o.gras ? 700 : 400}" fill="${o.c || CRAIE}">${t}</text>`;
const pts = (P) => P.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
function tourne(P, deg, cx, cy) {
  const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
  return P.map(([x, y]) => [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c]);
}
/* une marque d'angle droit (petit carré) au sommet B, entre les côtés BA et BC */
function marqueDroit(A, B, C, t = 12, c = JAUNE) {
  const u = (P) => { const dx = P[0] - B[0], dy = P[1] - B[1], l = Math.hypot(dx, dy); return [dx / l, dy / l]; };
  const [ax, ay] = u(A), [cx, cy] = u(C);
  return `<path d="M${B[0] + ax * t} ${B[1] + ay * t} L${B[0] + (ax + cx) * t} ${B[1] + (ay + cy) * t} L${B[0] + cx * t} ${B[1] + cy * t}" fill="none" stroke="${c}" stroke-width="2"/>`;
}

/* --- l'horloge : la petite aiguille avance aussi avec les minutes --- */
function figHorloge(h, m) {
  const cx = 110, cy = 110, R = 92;
  let s = `<circle cx="${cx}" cy="${cy}" r="${R}" fill="rgba(255,255,255,.06)" stroke="${CRAIE}" stroke-width="4"/>`;
  for (let i = 0; i < 60; i += 1) {
    const a = (i * 6 * Math.PI) / 180, l = i % 5 ? 5 : 11;
    s += `<line x1="${cx + Math.sin(a) * (R - 3)}" y1="${cy - Math.cos(a) * (R - 3)}" x2="${cx + Math.sin(a) * (R - 3 - l)}" y2="${cy - Math.cos(a) * (R - 3 - l)}" stroke="${CRAIE}" stroke-width="${i % 5 ? 1.2 : 2.5}"/>`;
  }
  for (let k = 1; k <= 12; k += 1) { const a = (k * 30 * Math.PI) / 180; s += txt(cx + Math.sin(a) * (R - 26), cy - Math.cos(a) * (R - 26) + 1, k, { taille: 18, gras: true }); }
  const ah = (((h % 12) + m / 60) * 30 * Math.PI) / 180, am = (m * 6 * Math.PI) / 180;
  s += `<line x1="${cx}" y1="${cy}" x2="${cx + Math.sin(ah) * 50}" y2="${cy - Math.cos(ah) * 50}" stroke="${ROSE}" stroke-width="8" stroke-linecap="round"/>`;
  s += `<line x1="${cx}" y1="${cy}" x2="${cx + Math.sin(am) * 76}" y2="${cy - Math.cos(am) * 76}" stroke="${BLEU}" stroke-width="5" stroke-linecap="round"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="6" fill="${CRAIE}"/>`;
  return svgArdoise(220, 220, s, 'Une horloge à aiguilles');
}

/* --- une fraction : disque en secteurs, ou bande en parts --- */
function figFraction(n, d, forme) {
  let s = '';
  if (forme === 'disque') {
    const cx = 110, cy = 100, R = 80;
    for (let i = 0; i < d; i += 1) {
      const a0 = (i / d) * 2 * Math.PI - Math.PI / 2, a1 = ((i + 1) / d) * 2 * Math.PI - Math.PI / 2;
      const p0 = [cx + R * Math.cos(a0), cy + R * Math.sin(a0)], p1 = [cx + R * Math.cos(a1), cy + R * Math.sin(a1)];
      s += `<path d="M${cx} ${cy} L${p0[0]} ${p0[1]} A${R} ${R} 0 ${1 / d > 0.5 ? 1 : 0} 1 ${p1[0]} ${p1[1]} Z" fill="${i < n ? JAUNE : 'rgba(255,255,255,.05)'}" fill-opacity="${i < n ? 0.92 : 1}" stroke="${CRAIE}" stroke-width="3"/>`;
    }
    return svgArdoise(220, 200, s, 'Un disque partagé en parts égales');
  }
  const W = 300, x0 = 10, h = 70, y0 = 40, w = W / d;
  for (let i = 0; i < d; i += 1) s += `<rect x="${x0 + i * w}" y="${y0}" width="${w}" height="${h}" fill="${i < n ? JAUNE : 'rgba(255,255,255,.05)'}" fill-opacity="${i < n ? 0.92 : 1}" stroke="${CRAIE}" stroke-width="3"/>`;
  return svgArdoise(320, 150, s, 'Une bande partagée en parts égales');
}

/* --- les billets et les pièces --- */
function figMonnaie(valeurs) {
  let s = '', x = 14, y = 16, hLigne = 0;
  const W = 340;
  valeurs.forEach((v) => {
    if (v >= 500) {
      const w = 96, h = 52; if (x + w > W) { x = 14; y += hLigne + 12; hLigne = 0; }
      const c = { 500: '#9aa7b1', 1000: '#e8908a', 2000: '#7fa6d8', 5000: '#e3a35f' }[v];
      s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="${c}" stroke="${CRAIE}" stroke-width="2.5"/><rect x="${x + 6}" y="${y + 6}" width="${w - 12}" height="${h - 12}" rx="3" fill="none" stroke="rgba(255,255,255,.6)" stroke-width="1.2"/>${txt(x + w / 2, y + h / 2 + 1, `${v / 100} €`, { taille: 20, gras: true, c: '#1b2a22' })}`;
      x += w + 10; hLigne = Math.max(hLigne, h);
    } else {
      const r = { 1: 13, 2: 14, 5: 16, 10: 15, 20: 17, 50: 19, 100: 21, 200: 23 }[v];
      if (x + 2 * r > W) { x = 14; y += hLigne + 12; hLigne = 0; }
      const cuivre = v < 10, euro = v >= 100;
      const fond = cuivre ? '#c8774a' : euro ? '#d9c37a' : '#e2c24f';
      s += `<circle cx="${x + r}" cy="${y + r}" r="${r}" fill="${fond}" stroke="${CRAIE}" stroke-width="2"/>${euro ? `<circle cx="${x + r}" cy="${y + r}" r="${r - 6}" fill="${v === 100 ? '#c9cfd4' : '#d9c37a'}" stroke="${v === 100 ? '#d9c37a' : '#c9cfd4'}" stroke-width="3"/>` : ''}${txt(x + r, y + r + 1, euro ? `${v / 100} €` : `${v} c`, { taille: euro ? 13 : 11, gras: true, c: '#2b2118' })}`;
      x += 2 * r + 10; hLigne = Math.max(hLigne, 2 * r);
    }
  });
  return svgArdoise(W + 14, y + hLigne + 16, s, 'Des billets et des pièces');
}

/* --- un polygone avec la longueur de ses côtés --- */
function figPolygone(P, longueurs, o = {}) {
  const cx = P.reduce((t, p) => t + p[0], 0) / P.length, cy = P.reduce((t, p) => t + p[1], 0) / P.length;
  let s = `<polygon points="${pts(P)}" fill="rgba(255,255,255,.06)" stroke="${CRAIE}" stroke-width="3.5" stroke-linejoin="round"/>`;
  if (longueurs) P.forEach((A, i) => {
    const B = P[(i + 1) % P.length], mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2;
    const dx = mx - cx, dy = my - cy, l = Math.hypot(dx, dy) || 1;
    if (longueurs[i] != null) s += txt(mx + (dx / l) * 22, my + (dy / l) * 16, longueurs[i], { taille: 16, gras: true, c: JAUNE });
  });
  (o.droits || []).forEach((k) => { s += marqueDroit(P[(k + P.length - 1) % P.length], P[k], P[(k + 1) % P.length], 12, o.couleurDroit || CRAIE); });
  return svgArdoise(o.w || 320, o.h || 240, s, o.label || 'Une figure');
}
/* un triangle dont les côtés mesurent a, b, c (en cm), dessiné à l'échelle */
function pointsTriangle(a, b, c, echelle) {
  /* A en (0,0), B en (c,0), C trouvé par la loi des cosinus */
  const x = (b * b + c * c - a * a) / (2 * c), y = Math.sqrt(Math.max(0, b * b - x * x));
  return [[0, 0], [c * echelle, 0], [x * echelle, -y * echelle]];
}
function centre(P, W, H) {
  const xs = P.map((p) => p[0]), ys = P.map((p) => p[1]);
  const dx = (W - (Math.max(...xs) + Math.min(...xs))) / 2, dy = (H - (Math.max(...ys) + Math.min(...ys))) / 2;
  return P.map(([x, y]) => [x + dx, y + dy]);
}

/* --- les solides, en perspective (les arêtes cachées en pointillés) --- */
function figSolide(type) {
  const cache = `stroke="${CRAIE}" stroke-width="2" stroke-dasharray="6 6" fill="none"`;
  const vu = `stroke="${CRAIE}" stroke-width="3.5" fill="rgba(255,255,255,.07)" stroke-linejoin="round"`;
  let s = '';
  if (type === 'cube' || type === 'pave') {
    const w = type === 'cube' ? 110 : 170, h = 110, p = type === 'cube' ? 110 : 70, dx = p * 0.45, dy = p * 0.4;
    const x0 = 160 - (w + dx) / 2, y0 = 70 + (110 - h) / 2 + dy / 2 - 20;
    const A = [x0, y0 + dy], B = [x0 + w, y0 + dy], C = [x0 + w, y0 + dy + h], D = [x0, y0 + dy + h];
    const E = [x0 + dx, y0], F = [x0 + w + dx, y0], G = [x0 + w + dx, y0 + h], Hh = [x0 + dx, y0 + h];
    s += `<path d="M${Hh} L${E} M${Hh} L${G} M${Hh} L${D}" ${cache}/>`;
    s += `<polygon points="${pts([A, B, C, D])}" ${vu}/><polygon points="${pts([A, E, F, B])}" ${vu}/><polygon points="${pts([B, F, G, C])}" ${vu}/>`;
  } else if (type === 'boule') {
    s += `<circle cx="160" cy="110" r="80" ${vu}/><path d="M80 110 A80 24 0 0 0 240 110" stroke="${CRAIE}" stroke-width="2.5" fill="none"/><path d="M80 110 A80 24 0 0 1 240 110" ${cache}/>`;
    s += `<ellipse cx="128" cy="78" rx="18" ry="10" fill="rgba(255,255,255,.25)" transform="rotate(-30 128 78)"/>`;
  } else if (type === 'cylindre') {
    s += `<path d="M95 50 L95 170 A65 20 0 0 0 225 170 L225 50" ${vu}/><ellipse cx="160" cy="50" rx="65" ry="20" ${vu}/><path d="M95 170 A65 20 0 0 1 225 170" ${cache}/>`;
  } else if (type === 'cone') {
    s += `<path d="M160 30 L92 170 A68 20 0 0 0 228 170 Z" ${vu}/><path d="M92 170 A68 20 0 0 1 228 170" ${cache}/>`;
  } else if (type === 'pyramide') {
    const S = [160, 28], A = [90, 175], B = [205, 185], C = [240, 150], D = [125, 140];
    s += `<path d="M${D} L${A} M${D} L${C} M${D} L${S}" ${cache}/>`;
    s += `<polygon points="${pts([S, A, B])}" ${vu}/><polygon points="${pts([S, B, C])}" ${vu}/>`;
  }
  return svgArdoise(320, 220, s, 'Un solide');
}

/* --- un angle : deux demi-droites de même origine ; avec l'équerre en pointillés pour la correction --- */
function figAngle(deg, rot, avecEquerre) {
  const O = [130, 165], L = 150;
  const bout = (a) => [O[0] + L * Math.cos((a * Math.PI) / 180), O[1] - L * Math.sin((a * Math.PI) / 180)];
  const A = bout(rot), B = bout(rot + deg);
  let s = `<path d="M${A[0]} ${A[1]} L${O[0]} ${O[1]} L${B[0]} ${B[1]}" fill="none" stroke="${CRAIE}" stroke-width="4" stroke-linecap="round"/>`;
  const r = 30, a0 = (rot * Math.PI) / 180, a1 = ((rot + deg) * Math.PI) / 180;
  s += `<path d="M${O[0] + r * Math.cos(a0)} ${O[1] - r * Math.sin(a0)} A${r} ${r} 0 0 0 ${O[0] + r * Math.cos(a1)} ${O[1] - r * Math.sin(a1)}" fill="none" stroke="${JAUNE}" stroke-width="3"/>`;
  s += `<circle cx="${O[0]}" cy="${O[1]}" r="4" fill="${CRAIE}"/>`;
  if (avecEquerre) {
    const E1 = [O[0] + 95 * Math.cos(a0), O[1] - 95 * Math.sin(a0)], E2 = [O[0] + 95 * Math.cos(a0 + Math.PI / 2), O[1] - 95 * Math.sin(a0 + Math.PI / 2)];
    s += `<polygon points="${pts([O, E1, E2])}" fill="rgba(143,211,255,.18)" stroke="${BLEU}" stroke-width="2.5" stroke-dasharray="7 5"/>${marqueDroit(E1, O, E2, 14, BLEU)}`;
  }
  return svgArdoise(300, 200, s, 'Un angle');
}

/* --- le quadrillage : cases coloriées et axe en pointillés --- */
function figQuadrillage(nc, nl, cases, o = {}) {
  const t = Math.min(34, Math.floor(300 / nc)), W = nc * t + 2 * 30, H = nl * t + 2 * 30, x0 = 30, y0 = 24;
  let s = '';
  for (let i = 0; i <= nc; i += 1) s += `<line x1="${x0 + i * t}" y1="${y0}" x2="${x0 + i * t}" y2="${y0 + nl * t}" stroke="rgba(244,241,230,.35)" stroke-width="1.2"/>`;
  for (let j = 0; j <= nl; j += 1) s += `<line x1="${x0}" y1="${y0 + j * t}" x2="${x0 + nc * t}" y2="${y0 + j * t}" stroke="rgba(244,241,230,.35)" stroke-width="1.2"/>`;
  cases.forEach(([c, l, coul]) => { s += `<rect x="${x0 + c * t + 2}" y="${y0 + l * t + 2}" width="${t - 4}" height="${t - 4}" rx="3" fill="${coul || JAUNE}" fill-opacity=".8"/>`; });
  (o.erreurs || []).forEach(([c, l]) => { s += `<rect x="${x0 + c * t + 1}" y="${y0 + l * t + 1}" width="${t - 2}" height="${t - 2}" rx="3" fill="none" stroke="${ROUGE}" stroke-width="3.5"/>`; });
  if (o.axeV != null) s += `<line x1="${x0 + o.axeV * t}" y1="${y0 - 14}" x2="${x0 + o.axeV * t}" y2="${y0 + nl * t + 14}" stroke="${ROSE}" stroke-width="3.5" stroke-dasharray="9 6"/>`;
  if (o.axeH != null) s += `<line x1="${x0 - 14}" y1="${y0 + o.axeH * t}" x2="${x0 + nc * t + 14}" y2="${y0 + o.axeH * t}" stroke="${ROSE}" stroke-width="3.5" stroke-dasharray="9 6"/>`;
  if (o.reperes) {
    for (let i = 0; i < nc; i += 1) s += txt(x0 + i * t + t / 2, y0 + nl * t + 15, 'ABCDEFGH'[i], { taille: 15, gras: true, c: JAUNE });
    for (let j = 0; j < nl; j += 1) s += txt(x0 - 14, y0 + j * t + t / 2, nl - j, { taille: 15, gras: true, c: JAUNE });
  }
  (o.icones || []).forEach(([c, l, ic]) => { s += txt(x0 + c * t + t / 2, y0 + l * t + t / 2 + 1, ic, { taille: t * 0.62 }); });
  (o.chemin || []).length > 1 && (s += `<polyline points="${o.chemin.map(([c, l]) => `${x0 + c * t + t / 2},${y0 + l * t + t / 2}`).join(' ')}" fill="none" stroke="${VERT}" stroke-width="3.5" stroke-dasharray="6 5" stroke-linecap="round"/>`);
  return svgArdoise(W, H + 6, s, 'Un quadrillage');
}

/* --- le cercle : centre, rayon, diamètre --- */
function figCercle(element, rot) {
  const cx = 150, cy = 110, R = 85, a = (rot * Math.PI) / 180;
  const P = [cx + R * Math.cos(a), cy - R * Math.sin(a)], Q = [cx - R * Math.cos(a), cy + R * Math.sin(a)];
  let s = `<circle cx="${cx}" cy="${cy}" r="${R}" fill="rgba(255,255,255,.05)" stroke="${CRAIE}" stroke-width="3.5"/>`;
  if (element === 'rayon') s += `<line x1="${cx}" y1="${cy}" x2="${P[0]}" y2="${P[1]}" stroke="${JAUNE}" stroke-width="5" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="3" fill="${CRAIE}"/>`;
  if (element === 'diametre') s += `<line x1="${Q[0]}" y1="${Q[1]}" x2="${P[0]}" y2="${P[1]}" stroke="${JAUNE}" stroke-width="5" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="3" fill="${CRAIE}"/>`;
  if (element === 'centre') s += `<circle cx="${cx}" cy="${cy}" r="8" fill="${JAUNE}"/><path d="M${cx - 16} ${cy - 16} l-14 -14" stroke="${JAUNE}" stroke-width="3" stroke-linecap="round"/>`;
  return svgArdoise(300, 220, s, 'Un cercle');
}

/* --- les instruments de géométrie (pour les choix) --- */
const INSTRUMENTS = {
  'la règle': `<svg class="mm-ico" viewBox="0 0 120 40"><rect x="4" y="10" width="112" height="22" rx="3" fill="#f2c94c" stroke="#8a6d1f" stroke-width="2"/>${[...Array(11)].map((_, i) => `<line x1="${10 + i * 10}" y1="10" x2="${10 + i * 10}" y2="${i % 5 ? 17 : 21}" stroke="#8a6d1f" stroke-width="1.5"/>`).join('')}</svg>`,
  'l\'équerre': `<svg class="mm-ico" viewBox="0 0 60 60"><path d="M6 6 L6 54 L54 54 Z M14 24 L14 46 L36 46 Z" fill="#8fd3ff" fill-rule="evenodd" stroke="#2c6f96" stroke-width="2" stroke-linejoin="round"/></svg>`,
  'le compas': `<svg class="mm-ico" viewBox="0 0 60 60"><line x1="30" y1="10" x2="16" y2="54" stroke="#7f8a94" stroke-width="4" stroke-linecap="round"/><line x1="30" y1="10" x2="44" y2="54" stroke="#7f8a94" stroke-width="4" stroke-linecap="round"/><circle cx="30" cy="9" r="5" fill="#f2c94c" stroke="#8a6d1f" stroke-width="1.5"/></svg>`,
};

/* --- une petite opération posée, pour les explications --- */
function opPosee(a, b, signe, res, retenues) {
  const L = Math.max(String(a).length, String(b).length + 1, String(res).length);
  const ligne = (s, pre = '') => `<tr><td class="op-signe">${pre}</td>${String(s).padStart(L, ' ').split('').map((c) => `<td>${c.trim()}</td>`).join('')}</tr>`;
  const ret = retenues ? `<tr class="op-ret"><td></td>${retenues.padStart(L, ' ').split('').map((c) => `<td>${c.trim()}</td>`).join('')}</tr>` : '';
  return `<table class="op-posee">${ret}${ligne(a)}${ligne(b, signe)}<tr class="op-trait"><td colspan="${L + 1}"></td></tr>${ligne(res)}</table>`;
}
/* --- le tableau des milliers, centaines, dizaines, unités --- */
function tableauNum(x, surligne) {
  const ch = String(x).padStart(4, '0').split(''), noms = ['milliers', 'centaines', 'dizaines', 'unités'];
  const debut = String(x).length >= 4 ? 0 : 4 - String(x).length;
  return `<table class="tab-num"><tr>${noms.slice(debut).map((n, i) => `<th class="${surligne === i + debut ? 'on' : ''}">${n}</th>`).join('')}</tr><tr>${ch.slice(debut).map((c, i) => `<td class="${surligne === i + debut ? 'on' : ''}">${c}</td>`).join('')}</tr></table>`;
}


/* ============================================================
   MNEMOSCIENCES : LES SCHÉMAS À LA CRAIE ET LE TIRAGE DES QUESTIONS
   ============================================================ */
const GEN = {};
const ligne = (x1, y1, x2, y2, c = CRAIE, w = 3) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;

/* --- Le tirage dans une banque ---
   Chaque question de banque : { q: énoncé, r: bonne réponse (texte, ou nombre à écrire), f: [mauvaises réponses],
   e: explication, n: 0 (facile, 1re année du cycle) ou 1 (plus difficile, 2e année), u: unité, fig: schéma (texte ou fonction), v: phrase lue }.
   Au début de la partie on tire surtout des questions faciles, à la fin surtout des difficiles. */
function genBanque(B, notion) {
  return (p) => {
    const faciles = B.filter((x) => !x.n), dures = B.filter((x) => x.n);
    const L = p < 0.45 ? (faciles.length ? faciles : B) : (dures.length && Math.random() < 0.8 ? dures : B);
    return depuisBanque(pick(L), notion);
  };
}
function depuisBanque(x, notion) {
  const base = { enonce: x.q, explication: x.e, notion, voix: x.v, figure: typeof x.fig === 'function' ? x.fig() : x.fig, court: x.q.replace(/<[^>]+>/g, '').slice(0, 90) };
  if (typeof x.r === 'number') return { ...base, saisie: { type: 'nombre', bonne: x.r, unite: x.u, neg: x.r < 0, tol: x.tol }, rep: `${fmtN(x.r)}${x.u ? ` ${x.u}` : ''}` };
  return { ...base, choix: shuffle([x.r, ...x.f]).map((v) => ({ v, html: v })), bonne: x.r, rep: x.r };
}
/* une partie avec des questions fabriquées (fonction) et des questions de banque, mélangées */
function genMixte(B, notion, fab, part = 0.4) {
  const g = genBanque(B, notion);
  return (p) => (Math.random() < part ? fab(p) : g(p));
}

/* --- Le thermomètre --- */
function figThermo(t, o = {}) {
  const bas = o.min ?? -20, haut = o.max ?? 110, y0 = 222, y1 = 22, Y = (v) => y0 - ((v - bas) / (haut - bas)) * (y0 - y1);
  let s = `<rect x="138" y="${y1 - 8}" width="24" height="${y0 - y1 + 16}" rx="12" fill="none" stroke="${CRAIE}" stroke-width="3"/>`;
  s += `<circle cx="150" cy="${y0 + 14}" r="16" fill="${ROUGE}" stroke="${CRAIE}" stroke-width="3"/>`;
  s += `<rect x="145" y="${Y(t).toFixed(1)}" width="10" height="${(y0 + 4 - Y(t)).toFixed(1)}" fill="${ROUGE}"/>`;
  for (let v = bas; v <= haut; v += 5) {
    const y = Y(v).toFixed(1), grand = v % 10 === 0;
    s += ligne(162, y, grand ? 176 : 170, y, CRAIE, grand ? 2.5 : 1.5);
    if (grand) s += txt(184, y, `${v < 0 ? '−' : ''}${Math.abs(v)}`, { taille: haut - bas > 100 ? 13 : 16, ancre: 'start' });
  }
  if (o.reperes) s += [0, 100].map((v) => ligne(110, Y(v), 138, Y(v), BLEU, 2) + txt(98, Y(v), v === 0 ? 'glace' : 'ébullition', { taille: 12, c: BLEU, ancre: 'end' })).join('');
  s += txt(150, 260, '°C', { taille: 15, gras: true });
  return svgArdoise(300, 270, s, `Un thermomètre gradué de ${bas} à ${haut} degrés`);
}

/* --- Le circuit électrique : pile, ampoule, interrupteur ---
   etat : 'ferme' (l'ampoule brille), 'ouvert' (interrupteur ouvert), 'coupe' (un fil débranché), 'sans' (pas d'interrupteur, circuit fermé) */
function figCircuit(etat) {
  const allume = etat === 'ferme' || etat === 'sans';
  let s = '';
  /* fils : rectangle 60..260 x 50..200, avec une ouverture pour la pile (à gauche), l'ampoule (en haut), l'interrupteur (à droite) */
  s += ligne(60, 50, 140, 50) + ligne(180, 50, 260, 50);           /* haut, coupé par l'ampoule */
  s += ligne(60, 50, 60, 105) + ligne(60, 145, 60, 200);           /* gauche, coupé par la pile */
  s += etat === 'coupe' ? ligne(60, 200, 135, 200) + ligne(165, 214, 260, 200) : ligne(60, 200, 260, 200);
  if (etat === 'sans' || etat === 'coupe') s += ligne(260, 50, 260, 200);
  else {
    s += ligne(260, 50, 260, 100) + ligne(260, 150, 260, 200);
    s += `<circle cx="260" cy="100" r="4" fill="${CRAIE}"/><circle cx="260" cy="150" r="4" fill="${CRAIE}"/>`;
    s += etat === 'ouvert' ? ligne(260, 150, 288, 108, JAUNE, 4) : ligne(260, 150, 260, 100, JAUNE, 4);
    s += txt(300, 160, 'interrupteur', { taille: 12, ancre: 'start', c: JAUNE });
  }
  /* pile */
  s += ligne(42, 105, 78, 105, CRAIE, 4) + ligne(50, 145, 70, 145, CRAIE, 8);
  s += txt(30, 98, '+', { taille: 16, gras: true }) + txt(30, 150, '−', { taille: 16, gras: true }) + txt(98, 125, 'pile', { taille: 13, c: JAUNE });
  /* ampoule */
  if (allume) s += [0, 45, 90, 135, 180, 225, 270, 315].map((a) => { const r = (a * Math.PI) / 180; return ligne(160 + 26 * Math.cos(r), 50 + 26 * Math.sin(r), 160 + 36 * Math.cos(r), 50 + 36 * Math.sin(r), JAUNE, 2.5); }).join('');
  s += `<circle cx="160" cy="50" r="20" fill="${allume ? JAUNE : 'none'}" fill-opacity="${allume ? 0.55 : 0}" stroke="${CRAIE}" stroke-width="3"/>`;
  s += ligne(146, 36, 174, 64, CRAIE, 2.5) + ligne(174, 36, 146, 64, CRAIE, 2.5);
  s += txt(160, 96, 'ampoule', { taille: 12, c: JAUNE });
  return svgArdoise(380, 240, s, 'Un circuit électrique avec une pile et une ampoule');
}
function fabCircuit(p) {
  const notion = 'Les circuits électriques';
  const etat = pick(p < 0.4 ? ['ferme', 'ouvert', 'sans'] : ['ferme', 'ouvert', 'coupe', 'sans', 'coupe']);
  const allume = etat === 'ferme' || etat === 'sans';
  const pourquoi = { ferme: 'L\'interrupteur est <strong>fermé</strong> : le courant fait tout le tour, de la pile à l\'ampoule et retour. Le circuit est fermé, l\'ampoule brille.',
    sans: 'Il n\'y a pas d\'interruption : le fil part d\'une borne de la pile, passe par l\'ampoule et revient à l\'autre borne. Le circuit est <strong>fermé</strong>, l\'ampoule brille.',
    ouvert: 'L\'interrupteur est <strong>ouvert</strong> : il coupe le chemin du courant. Le circuit est ouvert, l\'ampoule reste éteinte.',
    coupe: 'Regarde le fil du bas : il est <strong>débranché</strong>. Le courant ne peut pas faire le tour : le circuit est ouvert, l\'ampoule reste éteinte.' };
  return { enonce: 'Regarde bien ce circuit. L\'ampoule est-elle <strong>allumée</strong> ?', figure: figCircuit(etat), choix: [{ v: 'oui', html: 'Oui, elle brille' }, { v: 'non', html: 'Non, elle est éteinte' }], bonne: allume ? 'oui' : 'non', rep: allume ? 'oui, elle brille' : 'non, elle est éteinte', notion, explication: `${pourquoi[etat]} Pour qu'une ampoule brille, il faut une <strong>boucle complète</strong>, sans coupure.` };
}

/* --- Les engrenages : chaque roue fait tourner la suivante dans l'autre sens --- */
function figEngrenages(n, sensHoraire) {
  const R = 34, cy = 120, x0 = 190 - (n - 1) * 40;
  let s = '';
  for (let i = 0; i < n; i += 1) {
    const cx = x0 + i * 80, dents = Array.from({ length: 12 }, (_, k) => { const a = (k * 30 + i * 15) * Math.PI / 180; return ligne(cx + R * Math.cos(a), cy + R * Math.sin(a), cx + (R + 9) * Math.cos(a), cy + (R + 9) * Math.sin(a), CRAIE, 5); }).join('');
    s += dents + `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${CRAIE}" stroke-width="3"/><circle cx="${cx}" cy="${cy}" r="5" fill="${CRAIE}"/>`;
    s += txt(cx, cy + 62, String.fromCharCode(65 + i), { taille: 18, gras: true, c: i === 0 ? JAUNE : i === n - 1 ? ROSE : CRAIE });
  }
  /* flèche de rotation sur la roue A */
  const cx = x0, d = sensHoraire ? `M${cx - 20} ${cy - 20} A28 28 0 0 1 ${cx + 20} ${cy - 20}` : `M${cx + 20} ${cy - 20} A28 28 0 0 0 ${cx - 20} ${cy - 20}`;
  const fx = sensHoraire ? cx + 20 : cx - 20;
  s += `<path d="${d}" fill="none" stroke="${JAUNE}" stroke-width="4"/><path d="M${fx} ${cy - 20} l${sensHoraire ? -10 : 10} -3 l${sensHoraire ? 2 : -2} 10 z" fill="${JAUNE}"/>`;
  return svgArdoise(380, 210, s, `${n} roues dentées qui s'engrènent`);
}
function fabEngrenages(p) {
  const n = p < 0.4 ? 2 : pick([2, 3, 3, 4]), h = Math.random() < 0.5, derniere = String.fromCharCode(64 + n);
  const memeSens = n % 2 === 1, sens = (h === memeSens) ? 'dans le sens des aiguilles d\'une montre' : 'dans le sens inverse des aiguilles d\'une montre';
  return { enonce: `La roue <strong>A</strong> tourne ${h ? 'dans le sens des aiguilles d\'une montre' : 'dans le sens inverse des aiguilles d\'une montre'} (flèche jaune). Dans quel sens tourne la roue <strong>${derniere}</strong> ?`, figure: figEngrenages(n, h),
    choix: [{ v: 'horaire', html: 'Dans le sens des aiguilles d\'une montre' }, { v: 'inverse', html: 'Dans le sens inverse' }], bonne: (h === memeSens) ? 'horaire' : 'inverse', rep: sens, notion: 'Les mécanismes',
    explication: `Deux roues dentées qui s'engrènent tournent toujours <strong>en sens contraires</strong>. ${n === 2 ? 'B tourne donc dans l\'autre sens que A' : `Le sens change à chaque roue : A, puis ${Array.from({ length: n - 1 }, (_, i) => String.fromCharCode(66 + i)).join(', ')}. Avec ${n} roues, la dernière tourne ${memeSens ? 'dans le même sens que A' : 'dans l\'autre sens que A'}`}, ${sens}.` };
}

/* --- Le Soleil et la Terre : le jour et la nuit --- */
function figJourNuit(angle) {
  const cx = 250, cy = 120, R = 62, a = (angle * Math.PI) / 180, px = cx + R * Math.cos(a), py = cy + R * Math.sin(a);
  let s = `<circle cx="34" cy="120" r="30" fill="${JAUNE}"/>` + [0, 1, 2].map((k) => ligne(76, 80 + k * 40, 150, 80 + k * 40, JAUNE, 2)).join('');
  s += txt(34, 172, 'Soleil', { taille: 14, c: JAUNE });
  s += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="#2a4f7a" stroke="${CRAIE}" stroke-width="3"/>`;
  s += `<path d="M${cx} ${cy - R} A${R} ${R} 0 0 1 ${cx} ${cy + R} Z" fill="#0d1520" opacity=".75"/>`;
  s += `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="8" fill="${ROSE}" stroke="${CRAIE}" stroke-width="2"/>`;
  s += txt(cx, cy + R + 22, 'Terre', { taille: 14 });
  return svgArdoise(340, 220, s, 'Le Soleil éclaire la Terre ; un point rose est placé sur la Terre');
}
function fabJourNuit() {
  const jour = Math.random() < 0.5, angle = jour ? pick([140, 160, 180, 200, 220, 120, 240]) : pick([-40, -20, 0, 20, 40, 60, 300]);
  return { enonce: 'Le Soleil éclaire la Terre. Pour un enfant qui habite au <strong>point rose</strong>, fait-il jour ou nuit ?', figure: figJourNuit(angle), choix: [{ v: 'jour', html: 'Il fait jour' }, { v: 'nuit', html: 'Il fait nuit' }], bonne: jour ? 'jour' : 'nuit', rep: jour ? 'il fait jour' : 'il fait nuit', notion: 'La Terre et le Soleil',
    explication: `Le Soleil n'éclaire qu'<strong>une moitié</strong> de la Terre à la fois : la moitié tournée vers lui. Le point rose est ${jour ? 'du côté éclairé : il fait <strong>jour</strong>' : 'du côté sombre : il fait <strong>nuit</strong>'}. Comme la Terre tourne sur elle-même en 24 heures, chaque endroit passe du jour à la nuit.` };
}

/* ============================================================
   CE1 – CE2 : MATIÈRE, MOUVEMENT, ÉNERGIE
   n: 0 = plutôt CE1 (début de partie), n: 1 = plutôt CE2 (fin de partie)
   ============================================================ */
const B_ETATS = [
  { q: 'Le <strong>lait</strong> est…', r: 'un liquide', f: ['un solide'], e: 'Le lait coule et prend la forme du verre : c\'est un <strong>liquide</strong>.' },
  { q: 'Une <strong>pierre</strong> est…', r: 'un solide', f: ['un liquide'], e: 'La pierre garde sa forme, on peut la prendre dans la main : c\'est un <strong>solide</strong>.' },
  { q: 'Le <strong>jus d\'orange</strong> est…', r: 'un liquide', f: ['un solide'], e: 'Le jus coule et prend la forme du récipient : c\'est un <strong>liquide</strong>.' },
  { q: 'Une <strong>règle en bois</strong> est…', r: 'un solide', f: ['un liquide'], e: 'La règle garde sa forme toute seule : c\'est un <strong>solide</strong>.' },
  { q: 'Un <strong>glaçon</strong> est de l\'eau…', r: 'solide', f: ['liquide'], e: 'Le glaçon, c\'est de l\'eau à l\'état <strong>solide</strong> : il garde sa forme. Quand il fond, il devient de l\'eau liquide.' },
  { q: 'Le <strong>miel</strong> est…', r: 'un liquide', f: ['un solide'], e: 'Le miel coule lentement (il est épais, on dit « visqueux »), mais il coule et prend la forme du pot : c\'est un <strong>liquide</strong>.' },
  { q: 'Un liquide prend la forme…', r: 'du récipient qui le contient', f: ['d\'une boule', 'qu\'il avait avant'], e: 'Verse de l\'eau dans un verre, puis dans une bouteille : elle prend à chaque fois la forme du <strong>récipient</strong>.' },
  { q: 'Peut-on prendre un liquide entre ses doigts ?', r: 'Non, il coule', f: ['Oui, comme un caillou'], e: 'Un liquide <strong>coule</strong> entre les doigts : il n\'a pas de forme propre.' },
  { q: 'On verse l\'eau d\'un verre dans une bouteille. L\'eau…', r: 'prend la forme de la bouteille', f: ['garde la forme du verre', 'disparaît'], e: 'Un liquide n\'a pas de forme propre : il prend celle du récipient. La quantité d\'eau, elle, ne change pas.' },
  { q: 'Pour transformer de l\'eau liquide en glace, on la met…', r: 'au congélateur', f: ['sur le radiateur', 'au soleil'], e: 'Il faut <strong>refroidir</strong> l\'eau très fort : au congélateur, elle devient de la glace.' },
  { q: 'Un solide a une <strong>forme propre</strong>. Cela veut dire…', r: 'qu\'il garde sa forme tout seul', f: ['qu\'il prend la forme du récipient', 'qu\'il est toujours propre'], e: 'Un solide garde sa forme quand on le change de récipient : un crayon reste un crayon !', n: 1 },
  { q: 'Le <strong>sable</strong> coule quand on le verse. Est-ce un liquide ?', r: 'Non, c\'est un solide en grains', f: ['Oui, c\'est un liquide'], e: 'Le sable coule, mais regarde un grain à la loupe : il garde sa forme. Le sable est un <strong>solide en grains</strong>, comme la farine ou le sel.', n: 1 },
  { q: 'La <strong>farine</strong> est…', r: 'un solide en poudre', f: ['un liquide'], e: 'La farine est faite de tout petits grains solides : c\'est un <strong>solide en poudre</strong>. On ne peut pas la « boire » !', n: 1 },
  { q: 'La surface d\'un liquide au repos dans un verre est…', r: 'plate et horizontale', f: ['bosselée', 'toujours penchée'], e: 'Même si on penche le verre, la surface de l\'eau reste <strong>plate et horizontale</strong>, comme le niveau d\'une table bien droite.', n: 1 },
  { q: 'Un morceau de <strong>beurre</strong> laissé au soleil…', r: 'fond et devient liquide', f: ['devient plus dur', 'ne change pas'], e: 'La chaleur fait <strong>fondre</strong> le beurre : il passe de l\'état solide à l\'état liquide.', n: 1 },
  { q: 'Quand un glaçon fond, il devient…', r: 'de l\'eau liquide', f: ['du sable', 'de l\'air'], e: 'La glace fond et redevient de l\'<strong>eau liquide</strong> : c\'est toujours de l\'eau, mais sous une autre forme.', n: 1 },
  { q: 'Le <strong>chocolat</strong> d\'une tablette, chauffé au bain-marie, devient…', r: 'liquide', f: ['gazeux', 'plus solide'], e: 'La chaleur fait fondre le chocolat : il devient <strong>liquide</strong>. En refroidissant, il redevient solide.', n: 1 },
];
GEN.etats = genBanque(B_ETATS, 'Solides et liquides');

const B_EAU = [
  { q: 'Quand la glace devient de l\'eau liquide, on dit qu\'elle…', r: 'fond', f: ['gèle', 'bout'], e: 'La glace <strong>fond</strong> : c\'est la <strong>fusion</strong>. Cela arrive quand il fait plus chaud que 0 °C.' },
  { q: 'Quand l\'eau liquide devient de la glace, on dit qu\'elle…', r: 'gèle', f: ['fond', 'bout'], e: 'L\'eau <strong>gèle</strong> : c\'est la <strong>solidification</strong>. Cela arrive quand il fait plus froid que 0 °C.' },
  { q: 'Le passage de la glace à l\'eau liquide s\'appelle…', r: 'la fusion', f: ['la solidification', 'la condensation'], e: 'Solide → liquide : c\'est la <strong>fusion</strong> (la glace fond).' },
  { q: 'Le passage de l\'eau liquide à la glace s\'appelle…', r: 'la solidification', f: ['la fusion', 'la vaporisation'], e: 'Liquide → solide : c\'est la <strong>solidification</strong> (l\'eau devient solide).' },
  { q: 'Un glaçon posé sur la table de la classe…', r: 'fond', f: ['grossit', 'reste un glaçon pour toujours'], e: 'Dans la classe, il fait plus chaud que 0 °C : le glaçon <strong>fond</strong> petit à petit.' },
  { q: 'En hiver, l\'eau d\'une flaque peut geler. Il fait alors…', r: 'moins de 0 °C', f: ['plus de 30 °C', 'exactement 100 °C'], e: 'L\'eau gèle quand la température descend <strong>au-dessous de 0 °C</strong>.' },
  { q: 'La glace fond à partir de quelle température ?', r: 0, u: '°C', e: 'La glace fond à <strong>0 °C</strong> (zéro degré Celsius). Au-dessous, l\'eau gèle ; au-dessus, la glace fond.', n: 1, v: 'La glace fond à partir de quelle température, en degrés ?' },
  { q: 'L\'eau <strong>bout</strong> à quelle température ?', r: 100, u: '°C', e: 'L\'eau bout à <strong>100 °C</strong> : de grosses bulles de vapeur se forment dans la casserole.', n: 1, v: 'L\'eau bout à quelle température, en degrés ?' },
  { q: 'Le passage de l\'eau liquide à la vapeur d\'eau s\'appelle…', r: 'la vaporisation', f: ['la condensation', 'la fusion'], e: 'Liquide → gaz : c\'est la <strong>vaporisation</strong>. Quand l\'eau bout, ou quand elle s\'évapore doucement (une flaque qui sèche).', n: 1 },
  { q: 'Le passage de la vapeur d\'eau à l\'eau liquide s\'appelle…', r: 'la condensation', f: ['la vaporisation', 'la solidification'], e: 'Gaz → liquide : c\'est la <strong>condensation</strong>. La buée sur un miroir de salle de bains en est un exemple.', n: 1 },
  { q: 'La <strong>buée</strong> sur une vitre froide, c\'est…', r: 'de la vapeur d\'eau redevenue liquide', f: ['de l\'eau qui a traversé la vitre', 'de la glace'], e: 'La vapeur d\'eau de l\'air touche la vitre froide et redevient liquide : de toutes petites gouttes. C\'est la <strong>condensation</strong>.', n: 1 },
  { q: 'Le linge mouillé sèche sur le fil parce que l\'eau…', r: 's\'évapore', f: ['gèle', 'tombe dans le sol'], e: 'L\'eau du linge devient de la vapeur invisible qui part dans l\'air : elle <strong>s\'évapore</strong>. C\'est plus rapide quand il fait chaud et qu\'il y a du vent.', n: 1 },
  { q: 'La vapeur d\'eau est…', r: 'un gaz invisible', f: ['un nuage blanc qu\'on voit toujours', 'un solide'], e: 'La vapeur d\'eau est <strong>invisible</strong>. Le petit « nuage » blanc au-dessus d\'une casserole est fait de minuscules gouttes d\'eau liquide : la vapeur a déjà commencé à se condenser.', n: 1 },
  { q: 'Quand l\'eau gèle, son volume…', r: 'augmente', f: ['diminue', 'ne change pas'], e: 'L\'eau qui gèle prend <strong>plus de place</strong> : une bouteille pleine d\'eau oubliée au congélateur peut éclater ! C\'est aussi pourquoi les glaçons flottent.', n: 1 },
  { q: 'On fait fondre un glaçon de 20 g. Quelle est la masse de l\'eau obtenue ?', r: 20, u: 'g', e: 'L\'eau change d\'état, mais il n\'y a ni plus ni moins d\'eau : la masse reste <strong>20 g</strong>.', n: 1, v: 'On fait fondre un glaçon de 20 grammes. Quelle est la masse de l\'eau obtenue, en grammes ?' },
];
const etatEau = (t) => (t < 0 ? 'solide (de la glace)' : t > 100 ? 'gazeuse (de la vapeur)' : 'liquide');
function fabEau(p) {
  const notion = 'Les changements d\'état de l\'eau';
  if (Math.random() < 0.5) {
    const t = p < 0.5 ? 5 * rnd(1, 18) : pick([-15, -10, -5, 5 * rnd(1, 19), 5 * rnd(1, 19)]);
    return { enonce: 'Quelle température indique ce <strong>thermomètre</strong> ?', figure: figThermo(t, t < 0 ? { min: -30, max: 40 } : { min: 0, max: 100 }), saisie: { type: 'nombre', bonne: t, unite: '°C', neg: t < 0 }, rep: `${fmtN(t)} degrés`, notion,
      explication: `Le haut du liquide rouge s'arrête en face de <strong>${fmtN(t)} °C</strong>. Les grands traits sont de 10 en 10 et les petits traits de 5 en 5.${t < 0 ? ' Au-dessous de 0, les températures sont <strong>négatives</strong> : on dit « moins ' + -t + ' degrés ».' : ''}` };
  }
  const t = p < 0.5 ? pick([-15, -10, -5, 20, 40, 60, 80]) : pick([-15, -5, 5, 15, 35, 55, 75, 95, 105]);
  const bonne = etatEau(t);
  return { enonce: 'Une casserole d\'eau pure est à la température indiquée par le thermomètre. L\'eau est…', figure: figThermo(t, { reperes: true }), choix: ['solide (de la glace)', 'liquide', 'gazeuse (de la vapeur)'].map((v) => ({ v, html: v })), bonne, rep: bonne, notion,
    explication: `Le thermomètre indique ${fmtN(t)} °C. ${t < 0 ? 'C\'est <strong>au-dessous de 0 °C</strong> : l\'eau est gelée, c\'est de la glace.' : t > 100 ? 'C\'est <strong>au-dessus de 100 °C</strong> : l\'eau ne peut plus être liquide, elle est devenue de la vapeur.' : '<strong>Entre 0 °C et 100 °C</strong>, l\'eau pure est liquide.'}` };
}
GEN.eau = genMixte(B_EAU, 'Les changements d\'état de l\'eau', fabEau, 0.45);

const B_AIR = [
  { q: 'L\'air est-il de la matière ?', r: 'Oui, même s\'il est invisible', f: ['Non, l\'air c\'est du vide'], e: 'On ne le voit pas, mais l\'air est bien de la <strong>matière</strong> : il prend de la place, il pèse, on peut le sentir quand il bouge (le vent).' },
  { q: 'Une bouteille « vide », bouchée…', r: 'est pleine d\'air', f: ['ne contient rien du tout'], e: 'Une bouteille « vide » est <strong>pleine d\'air</strong>. Plonge-la dans l\'eau et ouvre-la : des bulles d\'air sortent !' },
  { q: 'Le <strong>vent</strong>, c\'est…', r: 'de l\'air qui se déplace', f: ['de la vapeur', 'de la lumière'], e: 'Le vent, c\'est de l\'<strong>air en mouvement</strong>. On ne le voit pas, mais on voit ce qu\'il fait bouger (les feuilles, les nuages).' },
  { q: 'Comment montrer que l\'air existe ?', r: 'En plongeant une bouteille vide dans l\'eau : des bulles sortent', f: ['En le regardant avec une loupe', 'En le goûtant'], e: 'Les <strong>bulles</strong> qui sortent de la bouteille sont faites de l\'air qui était dedans : l\'air existe et prend de la place.' },
  { q: 'Dans l\'eau, les bulles d\'air…', r: 'remontent à la surface', f: ['coulent au fond', 'restent au milieu'], e: 'L\'air est beaucoup plus léger que l\'eau : les bulles <strong>remontent</strong>.' },
  { q: 'Quand on gonfle un ballon, on…', r: 'y fait entrer de l\'air', f: ['le remplit de vide', 'le chauffe'], e: 'On souffle de l\'<strong>air</strong> dans le ballon : l\'air prend de la place, le ballon grossit.' },
  { q: 'On respire…', r: 'de l\'air', f: ['de l\'eau', 'de la vapeur seulement'], e: 'Nous respirons de l\'<strong>air</strong>. Il contient le dioxygène dont notre corps a besoin.' },
  { q: 'On enfonce un verre <strong>retourné</strong> dans l\'eau. L\'eau ne monte pas jusqu\'au fond du verre, parce que…', r: 'l\'air prisonnier prend la place', f: ['le verre est trop lourd', 'l\'eau a peur'], e: 'Le verre est plein d\'<strong>air</strong>. Cet air ne peut pas sortir : il prend de la place, et l\'eau ne peut pas entrer. L\'air est bien de la matière !', n: 1 },
  { q: 'Un ballon <strong>gonflé</strong> est… qu\'un ballon dégonflé.', r: 'un peu plus lourd', f: ['plus léger', 'exactement aussi lourd'], e: 'L\'air <strong>pèse</strong> : un litre d\'air pèse un peu plus d\'un gramme. Une balance très précise montre que le ballon gonflé est un peu plus lourd.', n: 1 },
  { q: 'On bouche le bout d\'une seringue pleine d\'air et on pousse le piston : il s\'enfonce un peu. On dit que l\'air est…', r: 'compressible', f: ['liquide', 'solide'], e: 'On peut <strong>comprimer</strong> l\'air : le serrer dans moins de place. Avec de l\'eau, le piston ne s\'enfoncerait presque pas.', n: 1 },
  { q: 'On comprime l\'air d\'une seringue bouchée, puis on lâche le piston. Il…', r: 'revient en arrière', f: ['reste enfoncé', 'sort de la seringue'], e: 'L\'air comprimé pousse pour reprendre sa place : le piston <strong>revient</strong>. C\'est ce qui rend les ballons et les pneus « élastiques ».', n: 1 },
  { q: 'Un pneu de vélo est rempli…', r: 'd\'air comprimé', f: ['de mousse', 'd\'eau'], e: 'On gonfle le pneu avec une pompe : on y fait entrer beaucoup d\'air, qui est <strong>comprimé</strong>.', n: 1 },
  { q: 'Pourquoi un parachute ralentit-il la chute ?', r: 'L\'air freine sa descente', f: ['Il est plus léger que l\'air', 'Le vent le pousse vers le haut'], e: 'Le parachute est très large : en tombant, il doit pousser beaucoup d\'air, et l\'<strong>air le freine</strong>. Encore une preuve que l\'air est de la matière.', n: 1 },
];
GEN.air = genBanque(B_AIR, 'L\'air');

const B_MOUV = [
  { q: 'Pour mesurer la distance parcourue par une petite voiture, j\'utilise…', r: 'un mètre ou une règle', f: ['une balance', 'un thermomètre'], e: 'Une distance se mesure avec un <strong>instrument gradué</strong> : règle, mètre ruban, décamètre.' },
  { q: 'Pour mesurer une durée, on utilise…', r: 'un chronomètre', f: ['une règle', 'une balance'], e: 'Le <strong>chronomètre</strong> mesure le temps : on l\'arrête quand la course est finie.' },
  { q: 'Deux enfants courent la même distance. Le plus rapide est celui qui…', r: 'met le moins de temps', f: ['met le plus de temps', 'est le plus grand'], e: 'Pour une même distance, le plus rapide arrive <strong>le premier</strong> : il met le moins de temps.' },
  { q: 'Deux petites voitures roulent pendant le même temps. La plus rapide est celle qui…', r: 'va le plus loin', f: ['va le moins loin', 'est la plus lourde'], e: 'Pendant la même durée, la plus rapide <strong>parcourt la plus grande distance</strong>.' },
  { q: 'Qu\'est-ce qui fait tourner les ailes d\'une <strong>éolienne</strong> ?', r: 'le vent', f: ['la pluie', 'un moteur à essence'], e: 'Le <strong>vent</strong> pousse les pales de l\'éolienne et les fait tourner. L\'éolienne transforme ce mouvement en électricité.' },
  { q: 'Qu\'est-ce qui fait tourner la roue d\'un <strong>moulin à eau</strong> ?', r: 'l\'eau qui coule', f: ['le soleil', 'la neige'], e: 'L\'<strong>eau de la rivière</strong> pousse les palettes de la roue et la fait tourner.' },
  { q: 'Un voilier avance grâce…', r: 'au vent dans sa voile', f: ['à l\'eau qui chauffe', 'à la lumière'], e: 'Le <strong>vent</strong> pousse la voile : il fait avancer le bateau sans moteur.' },
  { q: 'Pour faire bouger un objet immobile, il faut…', r: 'le pousser ou le tirer', f: ['le regarder longtemps', 'le peindre'], e: 'Un objet se met en mouvement quand on <strong>agit</strong> sur lui : on le pousse, on le tire, ou le vent, l\'eau le poussent.' },
  { q: 'Pour comparer deux lancers de balle, on mesure…', r: 'la distance du départ au point où la balle tombe', f: ['la couleur de la balle', 'la taille du lanceur'], e: 'On mesure la <strong>distance</strong> entre le point de départ et le point d\'arrivée, avec un mètre ruban.' },
  { q: 'Quelle unité utilise-t-on pour une distance ?', r: 'le mètre', f: ['le kilogramme', 'le litre'], e: 'Les distances se mesurent en <strong>mètres</strong> (m), en centimètres (cm), en kilomètres (km)…', n: 1 },
  { q: 'Une voiture A fait 10 m en 5 secondes, une voiture B fait 10 m en 8 secondes. La plus rapide est…', r: 'la voiture A', f: ['la voiture B', 'aucune des deux'], e: 'Même distance (10 m) : la plus rapide est celle qui met <strong>le moins de temps</strong>, la voiture A (5 s).', n: 1 },
  { q: 'Une petite voiture lâchée en haut d\'une pente…', r: 'descend de plus en plus vite', f: ['reste immobile', 'monte'], e: 'Sur une pente, la voiture <strong>accélère</strong> : elle va de plus en plus vite en descendant.', n: 1 },
  { q: 'Le vent et l\'eau qui coule peuvent servir à…', r: 'produire de l\'électricité', f: ['fabriquer de l\'essence', 'rien du tout'], e: 'Les éoliennes (vent) et les barrages (eau) fabriquent de l\'<strong>électricité</strong> : ce sont des énergies qui ne s\'épuisent pas.', n: 1 },
  { q: 'Quand on lance une balle vers le haut, elle…', r: 'monte en ralentissant, puis retombe', f: ['monte toujours plus vite', 'reste en l\'air'], e: 'La balle <strong>ralentit</strong> en montant, s\'arrête un instant tout en haut, puis <strong>retombe</strong> de plus en plus vite : la Terre l\'attire vers le bas.', n: 1 },
];
GEN.mouv = genBanque(B_MOUV, 'Mouvements et énergie');

/* ============================================================
   CE1 – CE2 : LE VIVANT
   ============================================================ */
const B_VIVANT = [
  { q: 'Lequel est <strong>vivant</strong> ?', r: 'un arbre', f: ['une pierre', 'un nuage'], e: 'L\'arbre naît (d\'une graine), se nourrit, grandit, se reproduit et meurt : il est <strong>vivant</strong>. La pierre et le nuage ne font rien de tout cela.' },
  { q: 'Lequel est <strong>vivant</strong> ?', r: 'une fourmi', f: ['un robot', 'une voiture'], e: 'La fourmi naît, se nourrit, grandit, se reproduit et meurt : elle est <strong>vivante</strong>. Le robot et la voiture bougent, mais ce sont des objets fabriqués.' },
  { q: 'Un être vivant…', r: 'naît, se nourrit, grandit, se reproduit et meurt', f: ['ne change jamais', 'bouge, c\'est tout'], e: 'Ce sont les <strong>caractéristiques du vivant</strong> : naître, se nourrir, respirer, grandir, se reproduire, mourir.' },
  { q: 'Une plante a besoin, pour vivre…', r: 'de lumière, d\'eau et d\'air', f: ['de pain et de lait', 'de rien du tout'], e: 'Une plante verte a besoin de <strong>lumière</strong>, d\'<strong>eau</strong>, d\'<strong>air</strong> (et de sels minéraux pris dans le sol). Elle fabrique elle-même sa nourriture.' },
  { q: 'Un animal a besoin, pour vivre…', r: 'de nourriture, d\'eau et d\'air', f: ['seulement de lumière', 'de rien'], e: 'Un animal doit <strong>manger</strong>, <strong>boire</strong> et <strong>respirer</strong>. Contrairement à la plante, il ne fabrique pas sa nourriture.' },
  { q: 'Une plante qu\'on n\'arrose plus…', r: 'se fane, puis meurt', f: ['pousse plus vite', 'reste toujours pareille'], e: 'Sans eau, la plante <strong>se fane</strong> (elle devient molle), puis elle <strong>meurt</strong> : l\'eau est un besoin vital.' },
  { q: 'Un robot qui bouge et qui parle est-il vivant ?', r: 'Non', f: ['Oui'], e: 'Le robot ne naît pas, ne grandit pas, ne se nourrit pas et ne se reproduit pas : il <strong>n\'est pas vivant</strong>. Bouger ne suffit pas.' },
  { q: 'Un chat a besoin…', r: 'de manger, de boire et de respirer', f: ['seulement de dormir', 'de lumière pour fabriquer sa nourriture'], e: 'Comme tous les animaux, le chat doit <strong>manger, boire et respirer</strong>.' },
  { q: 'Une poule pond des œufs : cela montre qu\'elle…', r: 'se reproduit', f: ['respire', 'se nourrit'], e: 'Pondre des œufs, d\'où sortiront des poussins, c\'est <strong>se reproduire</strong>.' },
  { q: 'Le feu grandit et bouge. Est-il vivant ?', r: 'Non', f: ['Oui'], e: 'Le feu ne naît pas d\'un parent, ne se nourrit pas, ne se reproduit pas comme un être vivant : il <strong>n\'est pas vivant</strong>.', n: 1 },
  { q: 'Lequel est <strong>vivant</strong> ?', r: 'un champignon', f: ['l\'eau d\'une rivière', 'un caillou'], e: 'Le champignon naît (d\'une spore), se nourrit, grandit, se reproduit : il est <strong>vivant</strong>. Ce n\'est ni un animal ni une plante !', n: 1 },
  { q: 'Une feuille morte tombée de l\'arbre est…', r: 'd\'origine vivante, mais plus vivante', f: ['vivante', 'un minéral, comme un caillou'], e: 'La feuille a fait partie d\'un être vivant : elle est <strong>d\'origine vivante</strong>. Mais, détachée et morte, elle ne vit plus.', n: 1 },
  { q: 'Les poissons respirent-ils ?', r: 'Oui, avec leurs branchies', f: ['Non, ils n\'ont pas besoin d\'air'], e: 'Les poissons <strong>respirent</strong> : leurs <strong>branchies</strong> prennent le dioxygène dissous dans l\'eau.', n: 1 },
  { q: 'Les plantes respirent-elles ?', r: 'Oui, comme tous les êtres vivants', f: ['Non, jamais'], e: 'Tous les êtres vivants <strong>respirent</strong>, les plantes aussi, jour et nuit.', n: 1 },
  { q: 'Une graine plantée dans le noir, avec de l\'eau…', r: 'germe, mais la jeune plante devient pâle et fragile', f: ['ne germe jamais', 'pousse aussi bien qu\'à la lumière'], e: 'Une graine peut <strong>germer</strong> dans le noir grâce à ses réserves. Mais ensuite, sans <strong>lumière</strong>, la jeune plante ne peut pas fabriquer sa nourriture : elle reste pâle et finit par mourir.', n: 1 },
];
GEN.vivant = genBanque(B_VIVANT, 'Le vivant et ses besoins');

const B_SANTE = [
  { q: 'Les <strong>dents de lait</strong>…', r: 'tombent et sont remplacées par les dents définitives', f: ['repoussent toute la vie', 'ne tombent jamais'], e: 'Vers 6 ans, les dents de lait commencent à tomber : les <strong>dents définitives</strong> poussent dessous. Elles doivent durer toute la vie !' },
  { q: 'On perd ses premières dents de lait vers…', r: '6 ans', f: ['2 ans', '15 ans'], e: 'Les premières dents de lait tombent <strong>vers 6 ans</strong>, souvent les incisives de devant.' },
  { q: 'Il faut se brosser les dents…', r: 'deux fois par jour, pendant 2 minutes', f: ['une fois par semaine', 'seulement quand elles font mal'], e: 'Matin et soir, <strong>2 minutes</strong> : le brossage enlève les restes d\'aliments et les microbes qui font les caries.' },
  { q: 'Une <strong>alimentation équilibrée</strong>, c\'est…', r: 'manger un peu de tout, chaque jour', f: ['manger seulement ce qu\'on préfère', 'manger beaucoup de sucreries'], e: 'Manger <strong>varié</strong> : des fruits et légumes, des féculents (pain, pâtes, riz), des produits laitiers, un peu de viande, de poisson ou d\'œufs.' },
  { q: 'Quelle est la seule boisson indispensable ?', r: 'l\'eau', f: ['le soda', 'le sirop'], e: 'Le corps a besoin d\'<strong>eau</strong>. Les sodas et les sirops contiennent beaucoup de sucre : seulement de temps en temps.' },
  { q: 'Les fruits et les légumes, on en mange…', r: 'au moins 5 par jour', f: ['une fois par mois', 'jamais'], e: 'Le conseil : <strong>au moins 5 fruits et légumes par jour</strong>, crus ou cuits.' },
  { q: 'Les bonbons et les gâteaux…', r: 'en petite quantité, de temps en temps', f: ['à chaque repas', 'à la place du dîner'], e: 'Trop de sucre abîme les dents et n\'est pas bon pour la santé : <strong>de temps en temps</strong>, en petite quantité.' },
  { q: 'Avant de manger, il faut…', r: 'se laver les mains', f: ['se brosser les dents', 'courir'], e: 'Se <strong>laver les mains</strong> avec du savon enlève les microbes qu\'on pourrait avaler.' },
  { q: 'Pour grandir et rester en forme, il faut aussi…', r: 'bouger et faire du sport', f: ['rester assis toute la journée', 'dormir le moins possible'], e: 'L\'<strong>activité physique</strong> rend les muscles et les os solides, et aide à bien dormir.' },
  { q: 'Un enfant de ton âge doit dormir environ…', r: '10 heures par nuit', f: ['5 heures par nuit', '20 heures par nuit'], e: 'Entre 6 et 12 ans, on a besoin de <strong>9 à 12 heures</strong> de sommeil par nuit. C\'est pendant le sommeil qu\'on grandit et qu\'on retient ce qu\'on a appris !' },
  { q: 'Combien de <strong>dents de lait</strong> a un enfant ?', r: 20, e: 'Un enfant a <strong>20 dents de lait</strong>. Un adulte a jusqu\'à 32 dents définitives.', n: 1 },
  { q: 'Combien de dents a un adulte, avec les dents de sagesse ?', r: 32, e: 'Un adulte a <strong>32 dents</strong> définitives, en comptant les 4 dents de sagesse.', n: 1 },
  { q: 'Pour suivre la croissance d\'un enfant, le médecin mesure…', r: 'sa taille et sa masse', f: ['la couleur de ses yeux', 'la longueur de ses cheveux'], e: 'On mesure la <strong>taille</strong> (en cm) et la <strong>masse</strong> (en kg), et on les note sur une courbe de croissance.', n: 1 },
  { q: 'Le lait, les yaourts et le fromage apportent du calcium, qui est utile…', r: 'aux os et aux dents', f: ['aux cheveux', 'aux yeux'], e: 'Le <strong>calcium</strong> rend les <strong>os et les dents</strong> solides : il est très utile quand on grandit.', n: 1 },
  { q: 'Regarder un écran juste avant de dormir…', r: 'retarde l\'endormissement', f: ['aide à s\'endormir', 'n\'a aucun effet'], e: 'La lumière des écrans « réveille » le cerveau : on <strong>s\'endort plus tard</strong> et on dort moins bien. Mieux vaut lire un livre !', n: 1 },
  { q: 'Pourquoi se laver les mains en rentrant de la récréation ?', r: 'Pour enlever les microbes', f: ['Pour avoir les mains plus chaudes', 'Ça ne sert à rien'], e: 'Les mains touchent beaucoup de choses : elles portent des <strong>microbes</strong> invisibles. Le savon les enlève et évite de tomber malade.', n: 1 },
];
GEN.sante = genBanque(B_SANTE, 'Grandir et rester en bonne santé');

const B_CYCLE = [
  { q: 'La <strong>chenille</strong> devient…', r: 'un papillon', f: ['une abeille', 'un ver de terre'], e: 'La chenille se transforme en chrysalide, puis en <strong>papillon</strong> : c\'est une métamorphose.' },
  { q: 'Le <strong>têtard</strong> devient…', r: 'une grenouille', f: ['un poisson', 'un serpent'], e: 'Le têtard vit dans l\'eau ; ses pattes poussent, sa queue disparaît, il devient une <strong>grenouille</strong>.' },
  { q: 'Le changement complet de forme pendant la croissance s\'appelle…', r: 'la métamorphose', f: ['la germination', 'la respiration'], e: 'La <strong>métamorphose</strong> : le petit ne ressemble pas du tout à l\'adulte (chenille → papillon, têtard → grenouille).' },
  { q: 'Dans l\'ordre, le papillon passe par…', r: 'œuf → chenille → chrysalide → papillon', f: ['chenille → œuf → papillon → chrysalide', 'papillon → chrysalide → chenille → œuf'], e: 'L\'<strong>œuf</strong> donne une <strong>chenille</strong>, qui mange et grandit, puis s\'enferme dans une <strong>chrysalide</strong> d\'où sort le <strong>papillon</strong>.' },
  { q: 'Un chaton…', r: 'ressemble déjà à un chat adulte et grandit peu à peu', f: ['passe par une chrysalide', 'vit d\'abord dans l\'eau'], e: 'Le chaton ressemble déjà à ses parents : sa croissance est <strong>continue</strong>, sans métamorphose.' },
  { q: 'Lequel grandit <strong>sans métamorphose</strong> ?', r: 'le chien', f: ['le papillon', 'la grenouille'], e: 'Le chiot ressemble déjà à un chien adulte : <strong>croissance continue</strong>. Le papillon et la grenouille, eux, changent de forme.' },
  { q: 'Une poule pond…', r: 'des œufs, d\'où sortent des poussins', f: ['des poussins vivants', 'des graines'], e: 'La poule pond des <strong>œufs</strong> ; s\'ils sont couvés, des <strong>poussins</strong> en sortent au bout de 21 jours.' },
  { q: 'Quand une graine commence à pousser, on dit qu\'elle…', r: 'germe', f: ['fleurit', 'fane'], e: 'La graine <strong>germe</strong> : une petite racine sort, puis une tige et des feuilles.' },
  { q: 'Les graines d\'une plante se trouvent…', r: 'dans le fruit', f: ['dans la racine', 'dans la tige'], e: 'Les graines sont dans le <strong>fruit</strong> : les pépins de la pomme, le noyau de la cerise, les graines du haricot dans sa gousse.' },
  { q: 'Après la floraison, la fleur devient…', r: 'un fruit', f: ['une racine', 'une graine toute seule, sans fruit'], e: 'La fleur fanée laisse la place à un <strong>fruit</strong>, qui contient les graines.' },
  { q: 'Dans l\'ordre, la vie d\'une plante à fleurs :', r: 'graine → jeune plante → plante adulte → fleur → fruit', f: ['fleur → graine → fruit → plante', 'fruit → fleur → graine → racine'], e: 'La <strong>graine</strong> germe, la <strong>jeune plante</strong> grandit, la plante adulte fait des <strong>fleurs</strong>, qui donnent des <strong>fruits</strong> avec de nouvelles graines : le cycle recommence.', n: 1 },
  { q: 'Quand une graine germe, ce qui sort en premier, c\'est…', r: 'la racine', f: ['la fleur', 'le fruit'], e: 'La <strong>racine</strong> sort en premier et s\'enfonce dans le sol, puis la tige monte vers la lumière.', n: 1 },
  { q: 'Un animal qui naît d\'un œuf pondu est dit…', r: 'ovipare', f: ['vivipare', 'herbivore'], e: '<strong>Ovipare</strong> : qui pond des œufs (« ovi » veut dire œuf). Les oiseaux, la plupart des poissons, des reptiles et des insectes.', n: 1 },
  { q: 'Un animal dont le petit se développe dans le ventre de sa mère est dit…', r: 'vivipare', f: ['ovipare', 'carnivore'], e: '<strong>Vivipare</strong> : le petit naît vivant, après s\'être développé dans le ventre de sa mère. C\'est le cas de presque tous les mammifères.', n: 1 },
  { q: 'Qui transporte le <strong>pollen</strong> de fleur en fleur ?', r: 'des insectes, comme les abeilles, et le vent', f: ['les racines', 'la pluie seulement'], e: 'Les <strong>abeilles</strong>, les papillons… et le <strong>vent</strong> transportent le pollen. Grâce à lui, la fleur pourra devenir un fruit.', n: 1 },
  { q: 'La coccinelle passe par une larve qui ne lui ressemble pas. Sa croissance est…', r: 'avec métamorphose', f: ['continue, sans métamorphose'], e: 'La larve de coccinelle est allongée et sans points : elle se transforme en nymphe, puis en coccinelle. C\'est une <strong>métamorphose</strong>.', n: 1 },
];
GEN.cycle = genBanque(B_CYCLE, 'Le cycle de vie');

const B_CHAINE = [
  { q: 'Un animal qui mange <strong>seulement des plantes</strong> est…', r: 'herbivore', f: ['carnivore', 'omnivore'], e: '<strong>Herbivore</strong> : qui mange de l\'herbe, des feuilles, des fruits, des graines… seulement des végétaux.' },
  { q: 'Un animal qui mange <strong>d\'autres animaux</strong> est…', r: 'carnivore', f: ['herbivore', 'omnivore'], e: '<strong>Carnivore</strong> : qui mange de la viande, donc d\'autres animaux.' },
  { q: 'Un animal qui mange <strong>des plantes et des animaux</strong> est…', r: 'omnivore', f: ['herbivore', 'carnivore'], e: '<strong>Omnivore</strong> : qui mange de tout (« omni » veut dire tout).' },
  { q: 'La <strong>vache</strong> est…', r: 'herbivore', f: ['carnivore', 'omnivore'], e: 'La vache mange de l\'herbe et du foin : elle est <strong>herbivore</strong>.' },
  { q: 'Le <strong>lion</strong> est…', r: 'carnivore', f: ['herbivore', 'omnivore'], e: 'Le lion chasse des zèbres, des gazelles… : il est <strong>carnivore</strong>.' },
  { q: 'Le <strong>lapin</strong> est…', r: 'herbivore', f: ['carnivore', 'omnivore'], e: 'Le lapin mange de l\'herbe, des feuilles, des racines : il est <strong>herbivore</strong>.' },
  { q: 'L\'<strong>être humain</strong> est…', r: 'omnivore', f: ['herbivore', 'carnivore'], e: 'Nous pouvons manger des végétaux et des aliments d\'origine animale : nous sommes <strong>omnivores</strong>.' },
  { q: 'Complète la chaîne alimentaire (la flèche veut dire « est mangé par ») :<br><strong>herbe → lapin → ?</strong>', r: 'le renard', f: ['la carotte', 'la vache'], e: 'L\'herbe est mangée par le lapin, qui est mangé par le <strong>renard</strong>.' },
  { q: 'Complète la chaîne alimentaire (la flèche veut dire « est mangé par ») :<br><strong>salade → escargot → ?</strong>', r: 'le hérisson', f: ['la vache', 'la carotte'], e: 'La salade est mangée par l\'escargot, qui est mangé par le <strong>hérisson</strong>.' },
  { q: 'Complète la chaîne alimentaire (la flèche veut dire « est mangé par ») :<br><strong>feuille de chêne → chenille → ?</strong>', r: 'la mésange', f: ['le lapin', 'la vache'], e: 'La chenille mange les feuilles, et la <strong>mésange</strong> (un petit oiseau) mange les chenilles.', n: 1 },
  { q: 'Complète la chaîne alimentaire (la flèche veut dire « est mangé par ») :<br><strong>? → puceron → coccinelle</strong>', r: 'le rosier', f: ['la mésange', 'le renard'], e: 'Une chaîne commence toujours par un <strong>végétal</strong> : le puceron suce la sève du <strong>rosier</strong>, et la coccinelle mange les pucerons.', n: 1 },
  { q: 'Dans la chaîne <strong>blé → souris → chouette</strong>, qui mange la souris ?', r: 'la chouette', f: ['le blé', 'personne'], e: 'La flèche part de celui qui est mangé : la souris est mangée par la <strong>chouette</strong>.', n: 1 },
  { q: 'Au début d\'une chaîne alimentaire, il y a toujours…', r: 'un végétal', f: ['un carnivore', 'un omnivore'], e: 'Toute chaîne commence par un <strong>végétal</strong> : la plante fabrique sa nourriture grâce à la lumière, les animaux non.', n: 1 },
  { q: 'Si tous les lapins d\'une forêt disparaissaient, les renards…', r: 'auraient moins à manger', f: ['n\'en seraient pas gênés', 'deviendraient herbivores'], e: 'Les êtres vivants <strong>dépendent les uns des autres</strong> : sans lapins, les renards manquent de nourriture.', n: 1 },
  { q: 'Dans un jardin, on supprime toutes les coccinelles. Les pucerons…', r: 'deviennent très nombreux', f: ['disparaissent aussi', 'ne changent pas'], e: 'Les coccinelles mangent les pucerons. Sans elles, plus rien ne limite les pucerons : ils <strong>se multiplient</strong> et abîment les plantes.', n: 1 },
  { q: 'Le <strong>hérisson</strong> mange des insectes, des vers, des escargots, et parfois des fruits. Il est…', r: 'omnivore', f: ['herbivore', 'carnivore'], e: 'Il mange surtout des petits animaux, mais aussi des fruits : il est <strong>omnivore</strong>.', n: 1 },
];
GEN.chaine = genBanque(B_CHAINE, 'Les chaînes alimentaires');

/* ============================================================
   CE1 – CE2 : OBJETS TECHNIQUES ET PLANÈTE TERRE
   ============================================================ */
const B_OBJETS = [
  { q: 'À quoi sert une <strong>paire de ciseaux</strong> ?', r: 'à couper', f: ['à coller', 'à mesurer'], e: 'Sa <strong>fonction d\'usage</strong> (ce à quoi elle sert) : couper du papier, du tissu…' },
  { q: 'À quoi sert une <strong>lampe de poche</strong> ?', r: 'à éclairer', f: ['à chauffer', 'à mesurer'], e: 'La lampe de poche sert à <strong>éclairer</strong> dans le noir.' },
  { q: 'À quoi sert un <strong>taille-crayon</strong> ?', r: 'à tailler les crayons', f: ['à effacer', 'à couper le papier'], e: 'Le taille-crayon enlève un peu de bois pour refaire la <strong>pointe</strong> du crayon.' },
  { q: 'À quoi sert un <strong>parapluie</strong> ?', r: 'à se protéger de la pluie', f: ['à se protéger du froid', 'à marcher plus vite'], e: 'Le parapluie sert à <strong>ne pas être mouillé</strong> par la pluie.' },
  { q: 'À quoi sert une <strong>balance</strong> ?', r: 'à mesurer une masse', f: ['à mesurer une longueur', 'à mesurer la température'], e: 'La balance indique la <strong>masse</strong> d\'un objet, en grammes ou en kilogrammes.' },
  { q: 'À quoi sert un <strong>thermomètre</strong> ?', r: 'à mesurer la température', f: ['à mesurer le temps', 'à peser'], e: 'Le thermomètre mesure la <strong>température</strong>, en degrés Celsius (°C).' },
  { q: 'Lequel est un <strong>objet technique</strong> (fabriqué par l\'être humain) ?', r: 'un vélo', f: ['un arbre', 'un caillou'], e: 'Un <strong>objet technique</strong> est fabriqué par l\'être humain pour répondre à un besoin. L\'arbre et le caillou existent dans la nature.' },
  { q: 'Pour écrire un texte sur l\'ordinateur, on utilise…', r: 'le clavier', f: ['l\'écran', 'les haut-parleurs'], e: 'Le <strong>clavier</strong> sert à taper les lettres et les chiffres.' },
  { q: 'Pour déplacer la flèche sur l\'écran de l\'ordinateur, on utilise…', r: 'la souris (ou le pavé tactile)', f: ['le clavier seulement', 'l\'imprimante'], e: 'La <strong>souris</strong> (ou le pavé tactile d\'un ordinateur portable) déplace le pointeur à l\'écran.' },
  { q: 'Pour avoir sur papier un texte écrit à l\'ordinateur, on utilise…', r: 'l\'imprimante', f: ['l\'écran', 'la souris'], e: 'L\'<strong>imprimante</strong> recopie sur papier ce qui est dans l\'ordinateur.' },
  { q: 'Une tablette, un ordinateur et un téléphone sont…', r: 'des outils numériques', f: ['des êtres vivants', 'des instruments de musique'], e: 'Ce sont des <strong>outils numériques</strong> : ils enregistrent et traitent des informations (textes, images, sons).' },
  { q: 'Ce à quoi sert un objet s\'appelle sa…', r: 'fonction d\'usage', f: ['couleur', 'matière'], e: 'La <strong>fonction d\'usage</strong> répond à la question « À quoi sert l\'objet ? ». Celle d\'un stylo : écrire.', n: 1 },
  { q: 'À quoi sert une <strong>boussole</strong> ?', r: 'à trouver le nord', f: ['à mesurer la vitesse', 'à éclairer'], e: 'L\'aiguille aimantée de la boussole indique toujours le <strong>nord</strong> : on peut s\'orienter.', n: 1 },
  { q: 'Un <strong>mot de passe</strong>…', r: 'se garde secret', f: ['se dit à tout le monde', 's\'écrit sur l\'écran'], e: 'Ton mot de passe protège tes comptes : il est <strong>secret</strong>. Seuls tes parents peuvent le connaître.', n: 1 },
  { q: 'Sur Internet, quand on trouve une information, il faut…', r: 'vérifier d\'où elle vient', f: ['la croire toujours', 'la recopier sans réfléchir'], e: 'Tout le monde peut écrire sur Internet : il faut <strong>vérifier qui l\'a écrite</strong> et comparer avec d\'autres sources (un livre, un adulte).', n: 1 },
  { q: 'On reçoit un message d\'un inconnu sur Internet qui demande notre adresse. Il faut…', r: 'ne pas répondre et prévenir un adulte', f: ['répondre tout de suite', 'lui envoyer une photo'], e: 'On ne donne <strong>jamais</strong> son adresse, son nom ou des photos à un inconnu. On en parle à un <strong>adulte de confiance</strong>.', n: 1 },
];
GEN.objets = genBanque(B_OBJETS, 'Les objets et le numérique');

const B_CIRCUIT = [
  { q: 'Dans un circuit avec une pile et une ampoule, qui fournit l\'électricité ?', r: 'la pile', f: ['l\'ampoule', 'les fils'], e: 'La <strong>pile</strong> fournit l\'électricité. Les fils la transportent jusqu\'à l\'ampoule.' },
  { q: 'L\'<strong>interrupteur</strong> sert à…', r: 'ouvrir ou fermer le circuit', f: ['fabriquer de l\'électricité', 'rendre l\'ampoule plus brillante'], e: 'Fermé, l\'interrupteur laisse passer le courant : l\'ampoule brille. Ouvert, il coupe le circuit : elle s\'éteint.' },
  { q: 'Pour qu\'une ampoule brille, le circuit doit être…', r: 'fermé, sans coupure', f: ['ouvert', 'coupé au milieu'], e: 'Le courant doit pouvoir faire <strong>tout le tour</strong> : de la pile à l\'ampoule et retour à la pile.' },
  { q: 'Un circuit est <strong>ouvert</strong> quand…', r: 'il est coupé quelque part', f: ['l\'ampoule brille', 'la pile est neuve'], e: 'Un fil débranché, un interrupteur ouvert, une ampoule grillée : le circuit est <strong>ouvert</strong>, le courant ne passe plus.' },
  { q: 'Une pile a deux bornes :', r: 'une borne + et une borne −', f: ['deux bornes +', 'une seule borne'], e: 'La pile a une borne <strong>+</strong> et une borne <strong>−</strong>. Le circuit doit relier les deux en passant par l\'ampoule.', n: 1 },
  { q: 'Si l\'ampoule est grillée (son filament est cassé)…', r: 'le circuit est ouvert, rien ne s\'allume', f: ['le courant passe quand même', 'la pile se recharge'], e: 'Le filament cassé coupe le chemin du courant : le circuit est <strong>ouvert</strong>.', n: 1 },
  { q: 'Le fil électrique est en métal (du cuivre) parce que le métal…', r: 'laisse passer le courant', f: ['est joli', 'bloque le courant'], e: 'Le métal est un <strong>conducteur</strong> : il laisse passer le courant. Le plastique autour du fil, lui, est un <strong>isolant</strong> qui protège.', n: 1 },
  { q: 'L\'électricité d\'une pile de 4,5 V et celle d\'une prise de la maison…', r: 'ne sont pas pareilles : la prise est très dangereuse', f: ['sont aussi dangereuses l\'une que l\'autre', 'sont sans danger toutes les deux'], e: 'On peut faire des expériences avec une <strong>pile</strong>. L\'électricité des <strong>prises</strong> (230 V) peut tuer : on ne fait jamais d\'expérience avec !', n: 1 },
];
GEN.circuit = genMixte(B_CIRCUIT, 'Les circuits électriques', fabCircuit, 0.5);

const B_MECA = [
  { q: 'Deux roues dentées qui s\'engrènent tournent…', r: 'en sens contraires', f: ['dans le même sens', 'jamais'], e: 'Quand une roue tourne dans un sens, ses dents poussent celles de l\'autre roue, qui tourne <strong>dans l\'autre sens</strong>.' },
  { q: 'Sur un vélo, la <strong>chaîne</strong> relie…', r: 'le pédalier et la roue arrière', f: ['les deux roues', 'le guidon et la selle'], e: 'En pédalant, on fait tourner le pédalier ; la <strong>chaîne</strong> transmet ce mouvement à la roue arrière.' },
  { q: 'Une <strong>poulie</strong> sert à…', r: 'soulever une charge en tirant sur une corde', f: ['couper du bois', 'éclairer'], e: 'La corde passe sur la roue de la poulie : on tire vers le bas pour faire <strong>monter</strong> la charge, c\'est plus facile.' },
  { q: 'Une brouette, une balançoire à bascule et un casse-noix utilisent…', r: 'un levier', f: ['un engrenage', 'une poulie'], e: 'Un <strong>levier</strong> est une barre qui tourne autour d\'un point d\'appui. Il aide à soulever ou à serrer avec moins d\'effort.' },
  { q: 'Une <strong>manivelle</strong> sert à…', r: 'faire tourner quelque chose à la main', f: ['mesurer une longueur', 'souder'], e: 'On tourne la <strong>manivelle</strong> pour faire tourner un axe : un moulin à poivre, un taille-crayon de bureau, un puits.' },
  { q: 'Avec un levier, pour soulever une charge lourde le plus facilement, on appuie…', r: 'loin du point d\'appui', f: ['tout près du point d\'appui', 'sur la charge'], e: 'Plus on appuie <strong>loin du point d\'appui</strong>, moins il faut d\'effort. C\'est pourquoi les poignées de la brouette sont longues.', n: 1 },
  { q: 'Une petite roue dentée est entraînée par une grande roue dentée. La petite tourne…', r: 'plus vite que la grande', f: ['moins vite que la grande', 'à la même vitesse'], e: 'Quand la grande roue fait un tour, la petite doit en faire <strong>plusieurs</strong> : elle tourne plus vite.', n: 1 },
  { q: 'Sur une balançoire à bascule, un adulte et un enfant s\'équilibrent si…', r: 'l\'adulte s\'assoit plus près du milieu', f: ['l\'adulte s\'assoit au bout', 'ils sont tous les deux au bout'], e: 'Le plus lourd doit se mettre plus près du <strong>point d\'appui</strong> (le milieu) : c\'est la règle du levier.', n: 1 },
  { q: 'Dans un vélo, les roues dentées reliées par la chaîne s\'appellent…', r: 'le plateau et le pignon', f: ['la selle et le guidon', 'les pédales et le frein'], e: 'Le <strong>plateau</strong> (la grande roue dentée du pédalier) et le <strong>pignon</strong> (la petite, sur la roue arrière).', n: 1 },
];
GEN.meca = genMixte(B_MECA, 'Les mécanismes', fabEngrenages, 0.4);

const B_SECU = [
  { q: 'On ne touche jamais une prise ou un appareil électrique…', r: 'avec les mains mouillées', f: ['avec les mains sèches', 'quand il fait jour'], e: 'L\'eau laisse passer le courant : avec des <strong>mains mouillées</strong>, on risque une électrocution.' },
  { q: 'On voit un fil électrique abîmé. Il faut…', r: 'ne pas le toucher et prévenir un adulte', f: ['le réparer avec du scotch', 'le toucher pour voir'], e: 'Un fil dénudé peut donner une décharge électrique : on <strong>ne le touche pas</strong> et on <strong>prévient un adulte</strong>.' },
  { q: 'L\'électricité des prises de la maison est…', r: 'dangereuse, elle peut tuer', f: ['sans danger, comme une pile', 'sans danger si on va vite'], e: 'Les prises délivrent 230 volts : c\'est <strong>très dangereux</strong>. On ne met jamais d\'objet dans une prise.' },
  { q: 'Pour débrancher un appareil, on tire…', r: 'sur la prise, pas sur le fil', f: ['sur le fil', 'avec les dents'], e: 'Tirer sur le fil peut l\'abîmer et le dénuder : on tient la <strong>prise</strong>.' },
  { q: 'Peut-on verser un produit ménager dans une bouteille de jus vide ?', r: 'Non, jamais', f: ['Oui, si on la rince', 'Oui, c\'est plus pratique'], e: 'Quelqu\'un pourrait le <strong>boire par erreur</strong> ! Un produit dangereux reste dans son flacon d\'origine, rangé en hauteur.' },
  { q: 'Les médicaments…', r: 'se prennent seulement avec un adulte', f: ['se prennent comme des bonbons', 'se partagent avec les copains'], e: 'Un médicament peut être dangereux : on le prend <strong>seulement quand un adulte le donne</strong>.' },
  { q: 'Le numéro d\'appel des <strong>pompiers</strong> en France est le…', r: 18, e: 'Les pompiers : le <strong>18</strong>. Le SAMU : le 15. Le numéro d\'urgence européen : le 112.' },
  { q: 'Le numéro d\'appel du <strong>SAMU</strong> (urgences médicales) est le…', r: 15, e: 'Le SAMU : le <strong>15</strong>. On dit calmement son nom, l\'adresse et ce qui s\'est passé.', n: 1 },
  { q: 'Le numéro d\'urgence valable dans toute l\'Europe est le…', r: 112, e: 'Le <strong>112</strong> fonctionne dans tous les pays d\'Europe, même depuis un téléphone sans forfait.', n: 1 },
  { q: 'Sur un flacon, une <strong>flamme</strong> dans un losange rouge veut dire que le produit…', r: 'peut prendre feu facilement', f: ['se boit chaud', 'est sans danger'], e: 'La flamme signale un produit <strong>inflammable</strong> : jamais près d\'une flamme ou d\'une source de chaleur.', n: 1 },
  { q: 'Sur un flacon, une <strong>tête de mort</strong> veut dire que le produit…', r: 'est un poison très dangereux', f: ['est pour Halloween', 'est périmé'], e: 'La tête de mort signale un produit <strong>toxique</strong> : très dangereux à avaler, à respirer ou sur la peau.', n: 1 },
  { q: 'Sur un flacon, un dessin de main et de matière <strong>rongées</strong> par un liquide veut dire que le produit…', r: 'brûle la peau et les yeux', f: ['lave bien les mains', 'est un aliment'], e: 'Ce pictogramme signale un produit <strong>corrosif</strong> (comme l\'eau de Javel concentrée) : il ronge la peau et abîme les yeux.', n: 1 },
  { q: 'Pourquoi met-on des cache-prises quand il y a un bébé à la maison ?', r: 'Pour qu\'il ne mette pas ses doigts ou un objet dans la prise', f: ['Pour faire joli', 'Pour économiser l\'électricité'], e: 'Un petit enfant ne connaît pas le danger : le <strong>cache-prise</strong> l\'empêche de toucher le courant.', n: 1 },
];
GEN.secu = genBanque(B_SECU, 'La sécurité à la maison');

const B_TERRE = [
  { q: 'Le jour et la nuit existent parce que…', r: 'la Terre tourne sur elle-même', f: ['le Soleil s\'éteint la nuit', 'les nuages cachent le Soleil'], e: 'La Terre <strong>tourne sur elle-même</strong>. La moitié tournée vers le Soleil est dans le jour, l\'autre moitié dans la nuit.' },
  { q: 'La Terre fait un tour complet sur elle-même en…', r: '24 heures (un jour)', f: ['une semaine', 'un an'], e: 'Un tour sur elle-même en <strong>24 heures</strong> : c\'est la durée d\'un jour et d\'une nuit.' },
  { q: 'Le Soleil se lève…', r: 'à l\'est', f: ['à l\'ouest', 'au nord'], e: 'Le Soleil se lève à l\'<strong>est</strong> et se couche à l\'<strong>ouest</strong>. En fait, c\'est la Terre qui tourne !' },
  { q: 'Dans l\'ordre, à partir du printemps, les saisons sont :', r: 'printemps, été, automne, hiver', f: ['printemps, automne, été, hiver', 'printemps, hiver, été, automne'], e: '<strong>Printemps</strong> (mars), <strong>été</strong> (juin), <strong>automne</strong> (septembre), <strong>hiver</strong> (décembre).' },
  { q: 'En hiver, en France, les jours sont…', r: 'plus courts que les nuits', f: ['plus longs que les nuits', 'aussi longs que les nuits'], e: 'En hiver, il fait nuit tôt le soir et tard le matin : les <strong>jours sont courts</strong>. En été, c\'est l\'inverse.' },
  { q: 'Ton ombre est la plus courte…', r: 'vers le milieu de la journée', f: ['le matin', 'le soir'], e: 'En milieu de journée, le Soleil est <strong>au plus haut</strong> dans le ciel : l\'ombre est la plus courte. Le matin et le soir, elle est très longue.' },
  { q: 'Le Soleil est…', r: 'une étoile', f: ['une planète', 'un satellite'], e: 'Le Soleil est une <strong>étoile</strong> : une énorme boule de gaz très chaude qui produit sa propre lumière.' },
  { q: 'La Terre est…', r: 'une planète', f: ['une étoile', 'un satellite'], e: 'La Terre est une <strong>planète</strong> : elle tourne autour du Soleil et ne produit pas de lumière.' },
  { q: 'La Lune…', r: 'tourne autour de la Terre', f: ['tourne autour de Mars', 'ne bouge jamais'], e: 'La Lune est le <strong>satellite</strong> de la Terre : elle tourne autour d\'elle.' },
  { q: 'La Lune brille la nuit parce que…', r: 'le Soleil l\'éclaire', f: ['elle produit sa propre lumière', 'elle est en feu'], e: 'La Lune ne produit pas de lumière : elle est <strong>éclairée par le Soleil</strong>, comme un miroir. C\'est pourquoi on voit ses phases.', n: 1 },
  { q: 'La Terre fait le tour du Soleil en…', r: 'un an', f: ['un jour', 'un mois'], e: 'Un tour du Soleil prend <strong>un an</strong> (365 jours et un quart). Pendant ce voyage, les saisons se succèdent.', n: 1 },
  { q: 'Combien de planètes tournent autour du Soleil ?', r: 8, e: 'Il y a <strong>8 planètes</strong> : Mercure, Vénus, la Terre, Mars, Jupiter, Saturne, Uranus et Neptune.', n: 1 },
  { q: 'La planète la plus proche du Soleil est…', r: 'Mercure', f: ['Mars', 'Neptune'], e: 'Dans l\'ordre : <strong>Mercure</strong>, Vénus, la Terre, Mars, Jupiter, Saturne, Uranus, Neptune. Moyen de s\'en souvenir : « Me Voici Toute Mignonne, Je Suis Une Nébuleuse ».', n: 1 },
  { q: 'La plus grosse planète du système solaire est…', r: 'Jupiter', f: ['la Terre', 'Mercure'], e: '<strong>Jupiter</strong> est une géante de gaz : on pourrait y mettre plus de 1 000 Terres !', n: 1 },
  { q: 'La Lune fait le tour de la Terre en environ…', r: 'un mois', f: ['un jour', 'un an'], e: 'Environ <strong>un mois</strong> (29 jours et demi d\'une pleine lune à la suivante). Le mot « mois » vient d\'ailleurs de la Lune.', n: 1 },
  { q: 'Quand il fait jour en France, en Nouvelle-Calédonie (de l\'autre côté de la Terre), il fait…', r: 'nuit', f: ['jour aussi', 'toujours jour'], e: 'La Nouvelle-Calédonie est presque de l\'<strong>autre côté</strong> de la Terre : quand la France est tournée vers le Soleil, elle est dans la nuit.', n: 1 },
];
GEN.terre = genMixte(B_TERRE, 'La Terre et le Soleil', fabJourNuit, 0.3);

/* ============================================================
   LES QUIZ DE COURS : à la fin de chaque domaine, 12 questions tirées d'une banque fixe
   (définitions, vocabulaire, règles à connaître par cœur). Toujours les mêmes questions qui reviennent.
   Chaque question : { q, r (bonne réponse : texte ou nombre), f (mauvaises réponses), e (explication), u (unité), v (phrase lue) }
   ============================================================ */
const QUIZ = {
  'ce-matiere': [
    { q: 'Un <strong>solide</strong>…', r: 'garde sa forme', f: ['prend la forme du récipient', 'coule entre les doigts'], e: 'Un solide a une <strong>forme propre</strong> : il garde sa forme.' },
    { q: 'Un <strong>liquide</strong>…', r: 'prend la forme du récipient', f: ['garde toujours sa forme', 'se tient debout tout seul'], e: 'Un liquide coule et prend la <strong>forme du récipient</strong>.' },
    { q: 'La surface d\'un liquide au repos est…', r: 'plane et horizontale', f: ['bosselée', 'verticale'], e: 'Au repos, la surface d\'un liquide est <strong>plane et horizontale</strong>.' },
    { q: 'La glace, c\'est de l\'eau à l\'état…', r: 'solide', f: ['liquide', 'gazeux'], e: 'La glace est de l\'eau <strong>solide</strong>.' },
    { q: 'La vapeur d\'eau, c\'est de l\'eau à l\'état…', r: 'gazeux', f: ['solide', 'liquide'], e: 'La vapeur d\'eau est de l\'eau à l\'état de <strong>gaz</strong> : elle est invisible.' },
    { q: 'Solide → liquide : c\'est…', r: 'la fusion', f: ['la solidification', 'la condensation'], e: 'La glace fond : c\'est la <strong>fusion</strong>.' },
    { q: 'Liquide → solide : c\'est…', r: 'la solidification', f: ['la fusion', 'la vaporisation'], e: 'L\'eau gèle : c\'est la <strong>solidification</strong>.' },
    { q: 'Liquide → gaz : c\'est…', r: 'la vaporisation', f: ['la condensation', 'la fusion'], e: 'L\'eau s\'évapore ou bout : c\'est la <strong>vaporisation</strong>.' },
    { q: 'Gaz → liquide : c\'est…', r: 'la condensation', f: ['la vaporisation', 'la solidification'], e: 'La buée sur une vitre froide : c\'est la <strong>condensation</strong>.' },
    { q: 'La glace fond (et l\'eau gèle) à…', r: 0, u: '°C', e: 'La température de fusion de la glace est <strong>0 °C</strong>.', v: 'La glace fond, et l\'eau gèle, à combien de degrés ?' },
    { q: 'L\'eau bout à…', r: 100, u: '°C', e: 'L\'eau bout à <strong>100 °C</strong>.', v: 'L\'eau bout à combien de degrés ?' },
    { q: 'On mesure la température avec…', r: 'un thermomètre', f: ['une balance', 'un chronomètre'], e: 'Le <strong>thermomètre</strong> mesure la température en degrés Celsius (°C).' },
    { q: 'Quand une flaque sèche au soleil, l\'eau…', r: 's\'évapore', f: ['gèle', 'se condense'], e: 'L\'eau devient de la vapeur invisible : elle <strong>s\'évapore</strong>.' },
    { q: 'L\'air est…', r: 'de la matière invisible', f: ['du vide', 'un liquide'], e: 'L\'air est de la <strong>matière</strong> : il occupe de la place et il pèse.' },
    { q: 'L\'air pèse-t-il quelque chose ?', r: 'Oui, un peu', f: ['Non, rien du tout'], e: 'Oui : un litre d\'air pèse un peu plus d\'<strong>un gramme</strong>.' },
    { q: 'On peut serrer l\'air dans une seringue bouchée : l\'air est…', r: 'compressible', f: ['incompressible', 'solide'], e: 'L\'air est <strong>compressible</strong> : on peut le comprimer.' },
    { q: 'Le vent, c\'est…', r: 'de l\'air en mouvement', f: ['de la vapeur', 'du bruit'], e: 'Le vent est de l\'<strong>air qui se déplace</strong>.' },
    { q: 'Pour une même distance, le plus rapide est celui qui met…', r: 'le moins de temps', f: ['le plus de temps'], e: 'Même distance : le plus rapide met <strong>le moins de temps</strong>.' },
    { q: 'Une éolienne utilise l\'énergie…', r: 'du vent', f: ['du soleil', 'du pétrole'], e: 'L\'éolienne transforme l\'énergie du <strong>vent</strong> en électricité.' },
    { q: 'Un moulin à eau utilise l\'énergie…', r: 'de l\'eau qui coule', f: ['du vent', 'du charbon'], e: 'La roue tourne grâce à l\'<strong>eau qui coule</strong>.' },
  ],
  'ce-vivant': [
    { q: 'Un être vivant naît, se nourrit, grandit, se reproduit et…', r: 'meurt', f: ['ne change jamais', 'devient un objet'], e: 'Tout être vivant <strong>naît, se nourrit, grandit, se reproduit et meurt</strong>.' },
    { q: 'Une plante verte a besoin de…', r: 'lumière, d\'eau et d\'air', f: ['viande', 'sucre et de lait'], e: '<strong>Lumière, eau, air</strong> (et sels minéraux du sol).' },
    { q: 'Un animal a besoin de…', r: 'nourriture, d\'eau et d\'air', f: ['lumière seulement', 'rien'], e: 'Un animal doit <strong>manger, boire et respirer</strong>.' },
    { q: 'Les poissons respirent grâce à leurs…', r: 'branchies', f: ['poumons', 'nageoires'], e: 'Les <strong>branchies</strong> prennent le dioxygène dissous dans l\'eau.' },
    { q: 'Un animal qui ne mange que des végétaux est…', r: 'herbivore', f: ['carnivore', 'omnivore'], e: '<strong>Herbivore</strong> : il ne mange que des plantes.' },
    { q: 'Un animal qui mange d\'autres animaux est…', r: 'carnivore', f: ['herbivore', 'omnivore'], e: '<strong>Carnivore</strong> : il mange de la viande.' },
    { q: 'Un animal qui mange de tout est…', r: 'omnivore', f: ['herbivore', 'carnivore'], e: '<strong>Omnivore</strong> : végétaux et animaux.' },
    { q: 'Une chaîne alimentaire commence toujours par…', r: 'un végétal', f: ['un carnivore', 'un omnivore'], e: 'Au début de toute chaîne : un <strong>végétal</strong>.' },
    { q: 'Dans une chaîne alimentaire, la flèche veut dire…', r: '« est mangé par »', f: ['« mange »', '« ressemble à »'], e: 'herbe → lapin : l\'herbe <strong>est mangée par</strong> le lapin.' },
    { q: 'Le changement complet de forme d\'un animal en grandissant s\'appelle…', r: 'la métamorphose', f: ['la germination', 'la digestion'], e: 'Chenille → papillon, têtard → grenouille : c\'est la <strong>métamorphose</strong>.' },
    { q: 'La chenille, avant de devenir papillon, s\'enferme dans…', r: 'une chrysalide', f: ['une coquille', 'un terrier'], e: 'Œuf → chenille → <strong>chrysalide</strong> → papillon.' },
    { q: 'Un animal qui pond des œufs est…', r: 'ovipare', f: ['vivipare'], e: '<strong>Ovipare</strong> : il pond des œufs.' },
    { q: 'Un animal dont le petit se développe dans le ventre de sa mère est…', r: 'vivipare', f: ['ovipare'], e: '<strong>Vivipare</strong> : le petit naît vivant.' },
    { q: 'Quand une graine commence à pousser, elle…', r: 'germe', f: ['fleurit', 'fane'], e: 'La graine <strong>germe</strong>.' },
    { q: 'Les graines se trouvent dans…', r: 'le fruit', f: ['la racine', 'la feuille'], e: 'La fleur devient un <strong>fruit</strong> qui contient les graines.' },
    { q: 'Combien d\'heures de sommeil par nuit à ton âge, environ ?', r: 10, u: 'h', e: 'Environ <strong>10 heures</strong> (entre 9 et 12 heures).', v: 'Combien d\'heures de sommeil par nuit à ton âge, environ ?' },
    { q: 'Combien de fois par jour se brosse-t-on les dents ?', r: 2, e: '<strong>Deux fois</strong> par jour, matin et soir, pendant 2 minutes.' },
    { q: 'Combien de fruits et légumes par jour, au moins ?', r: 5, e: '<strong>Au moins 5</strong> fruits et légumes par jour.' },
    { q: 'Les dents qui tombent vers 6 ans s\'appellent…', r: 'les dents de lait', f: ['les dents de sagesse', 'les dents définitives'], e: 'Les <strong>dents de lait</strong> tombent et laissent la place aux dents définitives.' },
  ],
  'ce-technique': [
    { q: 'Ce à quoi sert un objet, c\'est sa…', r: 'fonction d\'usage', f: ['couleur', 'forme'], e: 'La <strong>fonction d\'usage</strong> : « à quoi sert l\'objet ? ».' },
    { q: 'Un objet fabriqué par l\'être humain pour répondre à un besoin est…', r: 'un objet technique', f: ['un être vivant', 'un objet naturel'], e: 'C\'est un <strong>objet technique</strong> : un vélo, une lampe, des ciseaux.' },
    { q: 'Dans un circuit, ce qui fournit l\'électricité, c\'est…', r: 'la pile', f: ['l\'ampoule', 'l\'interrupteur'], e: 'La <strong>pile</strong> est la source d\'électricité.' },
    { q: 'L\'ampoule brille si le circuit est…', r: 'fermé', f: ['ouvert'], e: 'Circuit <strong>fermé</strong> : le courant fait tout le tour.' },
    { q: 'Un interrupteur ouvert…', r: 'coupe le circuit', f: ['allume l\'ampoule', 'recharge la pile'], e: 'Interrupteur ouvert = circuit <strong>ouvert</strong> : l\'ampoule s\'éteint.' },
    { q: 'Un matériau qui laisse passer le courant est…', r: 'un conducteur', f: ['un isolant'], e: 'Les <strong>métaux</strong> sont des conducteurs.' },
    { q: 'Un matériau qui ne laisse pas passer le courant est…', r: 'un isolant', f: ['un conducteur'], e: 'Le plastique, le bois, le verre sont des <strong>isolants</strong>.' },
    { q: 'Deux roues dentées qui s\'engrènent tournent…', r: 'en sens contraires', f: ['dans le même sens'], e: 'Elles tournent en <strong>sens contraires</strong>.' },
    { q: 'Une barre qui tourne autour d\'un point d\'appui est…', r: 'un levier', f: ['une poulie', 'un engrenage'], e: 'C\'est un <strong>levier</strong> (brouette, balançoire, casse-noix).' },
    { q: 'Le numéro des pompiers :', r: 18, e: 'Les pompiers : <strong>18</strong>.' },
    { q: 'Le numéro du SAMU :', r: 15, e: 'Le SAMU : <strong>15</strong>.' },
    { q: 'Le numéro d\'urgence européen :', r: 112, e: 'Le <strong>112</strong>, dans toute l\'Europe.' },
    { q: 'On ne touche jamais une prise…', r: 'avec les mains mouillées', f: ['avec les mains sèches', 'le matin'], e: 'L\'eau conduit le courant : <strong>jamais avec les mains mouillées</strong>.' },
    { q: 'Le jour et la nuit sont dus à…', r: 'la rotation de la Terre sur elle-même', f: ['la Lune', 'les nuages'], e: 'La Terre <strong>tourne sur elle-même</strong> en 24 heures.' },
    { q: 'La Terre tourne sur elle-même en…', r: 24, u: 'h', e: 'En <strong>24 heures</strong>, un jour.', v: 'La Terre tourne sur elle-même en combien d\'heures ?' },
    { q: 'La Terre fait le tour du Soleil en…', r: 'un an', f: ['un mois', 'un jour'], e: 'En <strong>un an</strong> (365 jours et un quart).' },
    { q: 'Le Soleil se lève à…', r: 'l\'est', f: ['l\'ouest', 'au sud'], e: 'Il se lève à l\'<strong>est</strong> et se couche à l\'<strong>ouest</strong>.' },
    { q: 'Le Soleil est…', r: 'une étoile', f: ['une planète'], e: 'Le Soleil est une <strong>étoile</strong>.' },
    { q: 'La Lune est…', r: 'le satellite de la Terre', f: ['une étoile', 'une planète'], e: 'La Lune est le <strong>satellite</strong> naturel de la Terre.' },
    { q: 'Combien de planètes dans le système solaire ?', r: 8, e: '<strong>8 planètes</strong>, de Mercure à Neptune.' },
  ],
};
const NOTION_QUIZ = { 'ce-matiere': 'Cours : matière, mouvement, énergie', 'ce-vivant': 'Cours : le vivant', 'ce-technique': 'Cours : objets techniques et Terre' };
function questionsQuiz(cle, n) {
  return shuffle(QUIZ[cle]).slice(0, n).map((x) => {
    const base = { enonce: `<span class="mm-cours">Question de cours</span>${x.q.replace(/…/, '<span class="mm-trou">…</span>')}`, voix: x.v || (typeof x.r === 'number' ? x.q : x.q.replace(/…/g, '')), explication: x.e, notion: NOTION_QUIZ[cle], court: x.q.replace(/<[^>]+>/g, '') };
    if (typeof x.r === 'number') return { ...base, saisie: { type: 'nombre', bonne: x.r, unite: x.u, neg: x.r < 0 }, rep: fmtN(x.r) };
    return { ...base, choix: shuffle([x.r, ...x.f]).map((v) => ({ v, html: v })), bonne: x.r, rep: x.r };
  });
}

/* ------------------------------------------------------------
   L'ACCUEIL : les quatre onglets de niveau, les trois parties, la liste des exercices
   ------------------------------------------------------------ */
let classeAccueil = (() => { try { return localStorage.getItem('mnemosciences-classe') || 'ce'; } catch (e) { return 'ce'; } })();
if (!CLASSES.some((c) => c.id === classeAccueil)) classeAccueil = 'ce';
function dessinePortail() {
  const C = CLASSES.find((c) => c.id === classeAccueil);
  $('home-classes').innerHTML = CLASSES.map((c) => `<button type="button" class="classe-onglet${c.id === classeAccueil ? ' on' : ''}" data-classe="${c.id}" role="tab" aria-selected="${c.id === classeAccueil}">${c.nom}</button>`).join('');
  $('home-classes-note').textContent = `Exercices pour le ${C.cycle}. Les autres onglets restent ouverts : tu peux aller voir plus facile ou plus difficile.`;
  PARTIES.forEach((partie) => {
    let n = 0, nb = 0;
    const L0 = PARCOURS[partie].map((e, k) => ({ e, k })).filter(({ e }) => e.classes.includes(classeAccueil));
    const L = [...L0.filter(({ e }) => !e.bilan && !e.avenir && !e.quizCours), ...L0.filter(({ e }) => e.bilan), ...L0.filter(({ e }) => e.quizCours), ...L0.filter(({ e }) => e.avenir)];
    const nEx = L.filter(({ e }) => !e.bilan && !e.avenir && !e.quizCours).length, premierBilan = L.findIndex(({ e }) => e.bilan), premierQuiz = L.findIndex(({ e }) => e.quizCours), premierAvenir = L.findIndex(({ e }) => e.avenir);
    let nq = 0;
    const titreEx = nEx ? `<p class="home-etape"><strong>Apprendre pas à pas</strong> : ${nEx} exercices, une notion à la fois, avec des questions de plus en plus difficiles. Les questions changent à chaque partie.</p>` : '';
    const titreBilan = '<p class="home-etape"><strong>Faire le bilan</strong> : toutes les notions de la partie, mélangées.</p>';
    const titreQuiz = '<p class="home-etape"><strong>Retenir le cours</strong> : les questions de cours à savoir par cœur. Ce sont toujours les mêmes qui reviennent.</p>';
    const titreAvenir = '<p class="home-etape"><strong>Bientôt</strong> : les exercices prévus par le programme, qui arrivent.</p>';
    document.querySelector(`[data-liste="${partie}"]`).innerHTML = titreEx + L.map(({ e, k }, idx) => {
      const nom = e.bilan ? `Bilan ${++nb}` : e.quizCours ? `Quiz ${++nq}` : e.avenir ? '' : `Exercice ${++n}`;
      const avant = (idx === premierBilan ? titreBilan : '') + (idx === premierQuiz ? titreQuiz : '') + (idx === premierAvenir ? titreAvenir : '');
      return avant + (e.avenir
        ? `<button type="button" class="home-mode-button avenir" disabled><span class="label">${e.titre}</span><span class="desc">bientôt</span></button>`
        : `<button type="button" class="home-mode-button${e.bilan ? ' bilan' : ''}${e.quizCours ? ' bilan quiz' : ''}" data-partie-ex="${partie}" data-k="${k}" data-nom="${nom}"><span class="label"><strong>${nom}</strong><br>${e.titre}</span></button>`);
    }).join('') || '<p class="sous">Pas encore d\'exercice à ce niveau.</p>';
  });
  document.querySelectorAll('[data-classe]').forEach((b) => b.addEventListener('click', () => {
    classeAccueil = b.dataset.classe;
    try { localStorage.setItem('mnemosciences-classe', classeAccueil); } catch (e) {}
    dessinePortail();
  }));
  document.querySelectorAll('[data-partie-ex]').forEach((b) => b.addEventListener('click', () => {
    const p = b.dataset.partieEx, e = PARCOURS[p][Number(b.dataset.k)], C = CLASSES.find((c) => c.id === classeAccueil);
    openGame({ ...e, partie: p, titreComplet: `${C.nom} · ${PARTIES_NOM[p]} · ${b.dataset.nom.toLowerCase()} : ${e.titre}` });
  }));
}
let partieAccueil = '';
function montrePartie(p) {
  partieAccueil = p || '';
  $('home-parties').classList.toggle('choisie', !!partieAccueil);
  document.querySelectorAll('#home-parties .home-partie').forEach((b) => { const on = b.dataset.partie === partieAccueil; b.classList.toggle('on', on); b.setAttribute('aria-current', on ? 'true' : 'false'); });
  PARTIES.forEach((k) => $(`home-${k}`).classList.toggle('hidden', partieAccueil !== k));
  window.scrollTo(0, partieAccueil ? $('home-classes').getBoundingClientRect().top + window.scrollY - 70 : 0);
}
document.querySelectorAll('[data-partie]').forEach((b) => b.addEventListener('click', () => montrePartie(b.dataset.partie)));
function showPanel(name) {
  $('welcome-panel').classList.toggle('hidden', name !== 'welcome');
  $('natures-panel').classList.toggle('hidden', name !== 'natures');
  $('results-panel').classList.toggle('hidden', name !== 'results');
  $('bg-mosaic').classList.toggle('hidden', name !== 'welcome');
  document.body.classList.toggle('in-exercise', name !== 'welcome');
  window.scrollTo(0, 0);
}

/* Mosaïque de l'accueil : les images du dossier « mosaïque » (assets/mosaique), floutées et pâlies,
   nettes au survol, comme dans Mnemart. Au centre, sur deux cases, les portraits de Copernic, Gilbert, Galilée et Kepler ;
   une image revient une seconde fois, loin de son double, pour remplir la grille. Les GIF restent animés. */
const BG_MOSAIC_CENTRE = 'quatre-savants.jpg';
const BG_MOSAIC_FILES = [
  'science-symbole.jpg', 'adn.gif', 'einstein.jpg', 'diapirisme.gif',
  'machine-a-vapeur.gif', 'pasteur.jpg', 'spirales.gif', 'grossesse.gif',
  'etat-quantique.gif', 'adn.gif',
];
function initMosaic() {
  const c = $('bg-mosaic');
  const tuile = (f, cl) => `<div class="bg-tile${cl ? ` ${cl}` : ''}"><img src="assets/mosaique/${f}" alt="" loading="lazy" draggable="false" onerror="this.style.visibility='hidden'" /></div>`;
  c.innerHTML = tuile(BG_MOSAIC_CENTRE, 'bg-centre') + BG_MOSAIC_FILES.map((f) => tuile(f)).join('');
  c.querySelectorAll('.bg-tile').forEach((tile) => {
    tile.addEventListener('click', () => {
      const was = tile.classList.contains('touched');
      c.querySelectorAll('.bg-tile.touched').forEach((t) => t.classList.remove('touched'));
      if (!was) tile.classList.add('touched');
    });
    tile.addEventListener('mouseenter', () => tile.classList.add('touched'));
    tile.addEventListener('mouseleave', () => tile.classList.remove('touched'));
  });
}

/* ------------------------------------------------------------
   LE JEU
   Une partie = 10 questions (12 ou 14 pour un bilan), fabriquées au moment où l'on appuie sur « Démarrer ».
   Erreur : un sorcier grincheux encourage à recommencer (2e essai) ; après deux erreurs, la bonne réponse
   s'affiche. Le score compte les réponses trouvées du premier coup.
   ------------------------------------------------------------ */
let currentGame = null;
const game = { questions: [], index: 0, score: 0, essais: 0, fini: false, repondu: false, erreurs: [], parNotion: {} };
function fabriqueQuestions(e) {
  if (e.quiz) return questionsQuiz(e.quiz, e.n || 12);
  const n = e.n || 10, ordre = e.mix ? shuffle(e.mix) : [e.gen], vus = new Set(), L = [];
  for (let k = 0; k < n; k += 1) {
    const p = n > 1 ? k / (n - 1) : 0, g = ordre[k % ordre.length];
    let q, cle, essai = 0;
    do { q = GEN[g](p); cle = `${q.enonce}|${q.rep}`; essai += 1; } while (vus.has(cle) && essai < 30);
    vus.add(cle); L.push(q);
  }
  return L;
}
function openGame(e) {
  currentGame = e;
  $('nat-ready-explanation').innerHTML = e.consigne || '';
  $('nat-game-title').textContent = e.titreComplet || e.titre;
  showPanel('natures');
  $('nat-ready-screen').classList.remove('hidden');
  $('nat-quiz-grid').classList.add('hidden');
  $('nat-progress-label').textContent = `Question 1 / ${e.n || 10}`;
  $('nat-score-label').textContent = scoreLabel(0);
  $('nat-progress-bar').style.width = '0';
}
const scoreLabel = (n) => `${fmtPts(n)} bonne${n > 1 ? 's' : ''} réponse${n > 1 ? 's' : ''}`;
function startGame() {
  if (!currentGame) return;
  game.questions = fabriqueQuestions(currentGame);
  game.index = 0; game.score = 0; game.fini = false; game.erreurs = []; game.parNotion = {};
  showPanel('natures');
  $('nat-ready-screen').classList.add('hidden');
  $('nat-quiz-grid').classList.remove('hidden');
  showQuestion();
}
function updateProgress() {
  $('nat-progress-label').textContent = `Question ${game.index + 1} / ${game.questions.length}`;
  $('nat-score-label').textContent = scoreLabel(game.score);
  $('nat-progress-bar').style.width = `${(game.index / game.questions.length) * 100}%`;
}
const touchesClavier = (h, neg) => ['7', '8', '9', '4', '5', '6', '1', '2', '3', ',', '0', '⌫', ...(h ? ['h'] : []), ...(neg ? ['−'] : [])];
function showQuestion() {
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  const q = game.questions[game.index];
  game.essais = 0; game.repondu = false;
  $('nat-sentence').innerHTML = `<span class="mm-enonce">${nbspFr(q.enonce)}</span>${q.figure ? `<span class="mm-figure">${q.figure}</span>` : ''}`;
  $('nat-character-stage').innerHTML = '';
  $('nat-correction').classList.add('hidden');
  $('nat-verdict-square').className = 'verdict-square';
  $('nat-instruction').textContent = q.saisie ? 'Écris ta réponse :' : 'Choisis la bonne réponse :';
  const z = $('mm-zone');
  if (q.saisie) {
    z.innerHTML = `<form class="mm-saisie" id="mm-form" autocomplete="off"><input id="mm-input" name="mm-reponse-calcul" type="text" inputmode="${q.saisie.h || q.saisie.neg ? 'text' : 'decimal'}" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" data-lpignore="true" data-1p-ignore="true" data-bwignore="true" data-form-type="other" aria-label="Ta réponse" placeholder="${q.saisie.h ? '15 h 45' : '?'}" />${q.saisie.unite ? `<span class="mm-unite">${q.saisie.unite}</span>` : ''}</form>
      <p id="mm-indice" class="mm-indice hidden" aria-live="polite"></p>
      <div class="mm-clavier${q.saisie.h || q.saisie.neg ? ' avec-h' : ''}">${touchesClavier(q.saisie.h, q.saisie.neg).map((t) => `<button type="button" class="mm-touche" data-t="${t}">${t}</button>`).join('')}</div>
      <button type="button" class="primary-button mm-valider" id="mm-valider">Valider ✓</button>`;
    const inp = $('mm-input');
    z.querySelectorAll('.mm-touche').forEach((b) => b.addEventListener('click', () => {
      if (game.repondu) return;
      const t = b.dataset.t;
      if (t === '⌫') inp.value = inp.value.slice(0, -1);
      else if (t === 'h') inp.value = `${inp.value.trim()} h `;
      else if (t === '−') inp.value = inp.value.startsWith('−') ? inp.value.slice(1) : `−${inp.value}`; /* v6 : change le signe */
      else inp.value += t;
    }));
    /* v4 : comme dans MNEMOGRAM, la case est dans son propre petit formulaire, sans aucun champ de mot de passe :
       Chrome ne la rattache donc plus au formulaire de connexion et n'y propose plus l'identifiant enregistré. */
    inp.value = '';
    inp.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') { ev.preventDefault(); valideSaisie(); } });
    $('mm-form').addEventListener('submit', (ev) => { ev.preventDefault(); valideSaisie(); });
    /* au cas où un navigateur forcerait malgré tout un remplissage : on efface ce qui ressemble à un identifiant
       (un @, ou un mot de 4 lettres ou plus). v5 : « 4,50 € », « 12 cm », « 15 h 45 », « 90 min » restent permis. */
    const nettoie = () => { if (/@/.test(inp.value) || /\p{L}{4,}/u.test(inp.value)) inp.value = ''; };
    inp.addEventListener('input', nettoie);
    inp.addEventListener('change', nettoie);
    setTimeout(nettoie, 300);
    $('mm-valider').addEventListener('click', valideSaisie);
    if (window.matchMedia('(hover:hover)').matches) setTimeout(() => inp.focus(), 50);
  } else {
    z.innerHTML = `<p id="mm-indice" class="mm-indice hidden" aria-live="polite"></p><div class="nature-buttons mm-choix${q.choix.length > 3 && q.choix.every((c) => c.html.length < 40) ? ' deux' : ''}">${q.choix.map((c) => `<button type="button" class="nature-button" data-v="${String(c.v).replace(/"/g, '&quot;')}">${c.html}</button>`).join('')}</div>`;
    z.querySelectorAll('.nature-button').forEach((b) => b.addEventListener('click', () => valideChoix(b.dataset.v, b)));
  }
  updateProgress();
}
function montreIndice(t) { const el = $('mm-indice'); if (!el) return; el.innerHTML = t; el.classList.remove('hidden'); }
function valideSaisie() {
  if (game.repondu || game.fini) return;
  const q = game.questions[game.index], inp = $('mm-input'), brut = inp.value.trim();
  if (!brut) { montreIndice('Écris d\'abord ta réponse.'); return; }
  const val = q.saisie.type === 'minutes' ? lisMinutes(brut) : lisNombre(brut);
  if (Number.isNaN(val)) { montreIndice(q.saisie.type === 'minutes' ? 'Écris une heure, par exemple <strong>15 h 45</strong>.' : 'Écris seulement un nombre, par exemple <strong>56</strong> ou <strong>4,50</strong>.'); return; }
  /* v6 : q.saisie.tol = l'écart permis (pour les calculs avec π arrondis) */
  const juste = Math.abs(val - q.saisie.bonne) <= (q.saisie.tol || 1e-9);
  const montre = (v) => (q.saisie.type === 'minutes' ? fmtHeure(v) : fmtN(v));
  if (juste) { inp.value = montre(val); repondu(true); return; }
  erreur(montre(val));
  inp.classList.remove('secoue'); void inp.offsetWidth; inp.classList.add('secoue');
  if (game.essais >= 2) { inp.value = montre(q.saisie.bonne); inp.classList.add('montree'); repondu(false); }
  else { montreIndice(`Ce n'est pas <strong>${montre(val)}</strong>${q.saisie.unite ? ` ${q.saisie.unite}` : ''}. Réfléchis encore, et réessaie !`); inp.select(); }
}
function valideChoix(v, btn) {
  if (game.repondu || game.fini) return;
  const q = game.questions[game.index];
  if (v === String(q.bonne)) { btn.classList.add('correct'); repondu(true); return; }
  if ((q.aussi || []).includes(v)) {
    btn.classList.add('faded'); btn.disabled = true;
    const t = 'C\'est vrai, mais il existe un nom <strong>plus précis</strong> ! Cherche encore.';
    montreIndice(t); speak(voixMaths(t), 'femme', 'good');
    return;
  }
  erreur(btn.textContent.trim());
  btn.classList.add('wrong'); btn.disabled = true;
  if (game.essais >= 2) { document.querySelector(`#mm-zone .nature-button[data-v="${String(q.bonne).replace(/"/g, '\\"')}"]`)?.classList.add('correct'); repondu(false); }
  else montreIndice('Ce n\'est pas la bonne réponse. Réfléchis encore, et réessaie !');
}
function erreur(choisie) {
  const q = game.questions[game.index];
  if (game.essais === 0) game.erreurs.push({ question: q.court || voixMaths(q.voix || q.enonce).slice(0, 90), bonne: q.rep, choisie, notion: q.notion });
  game.essais += 1;
  if (game.essais < 2) showCharacter('bad');
}
function repondu(juste) {
  const q = game.questions[game.index];
  game.repondu = true;
  if (juste && game.essais === 0) game.score += 1;
  const t = game.parNotion[q.notion] || (game.parNotion[q.notion] = { c: 0, p: 0 });
  t.p += 1; if (juste && game.essais === 0) t.c += 1;
  document.querySelectorAll('#mm-zone button').forEach((b) => { b.disabled = true; if (!b.classList.contains('correct') && !b.classList.contains('wrong') && b.classList.contains('nature-button')) b.classList.add('faded'); });
  const inp = $('mm-input'); if (inp) { inp.readOnly = true; inp.classList.add(juste ? 'juste' : 'montree'); }
  $('mm-indice')?.classList.add('hidden');
  if (q.figureCorrection) { const f = document.querySelector('#nat-sentence .mm-figure'); if (f) f.innerHTML = q.figureCorrection; }
  $('nat-correction-details').innerHTML = nbspFr(q.explication);
  $('nat-correction').classList.remove('hidden');
  $('nat-verdict-square').className = `verdict-square ${juste ? (game.essais === 0 ? 'correct' : 'half') : 'wrong'}`;
  $('nat-score-label').textContent = scoreLabel(game.score);
  $('nat-next-button').textContent = game.index + 1 < game.questions.length ? 'Suivant →' : 'Voir mon score →';
  showCharacter(juste ? 'good' : 'bad');
  setTimeout(() => $('nat-next-button').focus({ preventScroll: true }), 60);
}
function nextQuestion() {
  if (!game.repondu) return;
  if (game.index + 1 < game.questions.length) { game.index += 1; showQuestion(); }
  else showResults();
}

/* Les sorciers : un message tiré au hasard, personnalisé avec le prénom et les proches quand il y a un compte */
const recentMessages = [];
function chooseMessage(ch) {
  const enfant = playerProfile?.enfant?.prenom;
  const adultes = (playerProfile?.adultes || []).filter((a) => a.lien);
  const r = Math.random();
  if (enfant && adultes.length && r < 0.3) { const a = pick(adultes); return { tpl: pick(ch.famille), adulte: a, photo: a.photo || playerProfile.enfant.photo }; }
  if (enfant && r < 0.75) return { tpl: pick(ch.perso), photo: playerProfile.enfant.photo };
  return { tpl: pick(ch.messages) };
}
function fillMessage(tpl, rep, adulte) {
  let msg = tpl;
  if (rep) msg = msg.replace('{rep}', rep).replace('{Rep}', capitalize(rep));
  msg = msg.replace(/\{E\}/g, playerProfile?.enfant?.prenom || '');
  if (adulte) {
    const l = LIENS[adulte.lien] || LIENS.papa;
    const ga = adulte.prenom ? `${l.ton} ${adulte.prenom}` : l.ton;
    msg = msg.replace('{adulte}', ga).replace('{Adulte}', capitalize(ga)).replace('{fier}', l.f ? 'fière' : 'fier');
  }
  return msg;
}
const explicationDite = () => voixMaths(String(game.questions[game.index]?.explication || '').replace(/<table[\s\S]*?<\/table>/g, ' ').replace(/•/g, ''));
function showCharacter(camp) {
  const corr = !$('nat-correction').classList.contains('hidden');
  if (!optSorciers(playerProfile)) {
    $('nat-character-stage').innerHTML = '';
    if (corr) speak(explicationDite(), 'femme', 'phrase');
    return;
  }
  const id = pick(Object.keys(CHARACTERS).filter((k) => CHARACTERS[k].camp === camp)), ch = CHARACTERS[id];
  const rep = camp === 'good' ? game.questions[game.index]?.rep : '';
  let msg = '', photo = '';
  for (let essai = 0; essai < 8; essai += 1) {
    const choix = chooseMessage(ch);
    msg = fillMessage(choix.tpl, rep, choix.adulte); photo = choix.photo || '';
    if (/\{[rR]ep\}/.test(msg)) continue;
    if (!recentMessages.includes(msg)) break;
  }
  if (/\{[rR]ep\}/.test(msg)) msg = pick(ch.messages.filter((m) => !/\{[rR]ep\}/.test(m)));
  recentMessages.push(msg); if (recentMessages.length > 4) recentMessages.shift();
  const stage = $('nat-character-stage');
  stage.className = `character-stage ${camp}`;
  stage.innerHTML = `<div class="bubble${photo ? ' has-photo' : ''}">${photo ? `<img class="bubble-photo" src="${photo}" alt="" />` : ''}<div><span class="who">${ch.nom}</span>${nbspFr(msg)}</div></div>${characterSvg(id)}`;
  speak(voixMaths(msg), ch.voix, camp);
  if (corr) speak(explicationDite(), 'femme', 'phrase', true);
}

/* La fin de la partie */
function showResults() {
  game.fini = true;
  const n = game.questions.length, s = game.score, content = s >= Math.ceil(n * 0.6);
  const id = content ? pick(['fiole', 'loupe']) : pick(['circuit', 'piste']);
  const pe = playerProfile?.enfant?.photo;
  $('results-character').innerHTML = characterSvg(id) + (pe ? `<img class="results-photo" src="${pe}" alt="" />` : '');
  $('results-title').textContent = `${s} bonne${s > 1 ? 's' : ''} réponse${s > 1 ? 's' : ''} sur ${n}`;
  const E = playerProfile?.enfant?.prenom;
  const adultes = (playerProfile?.adultes || []).filter((a) => a.lien);
  const a = adultes.length ? pick(adultes) : null;
  const famille = a ? ` ${fillMessage('{Adulte} sera très {fier} de toi !', null, a)}` : '';
  const parole = s === n ? (E ? `Un sans-faute, ${E} ! Tu es un vrai savant !${famille}` : 'Un sans-faute ! Tu es un grand sorcier des sciences !')
    : content ? (E ? `Très bien, ${E} ! Encore une partie, et tu sauras tout par cœur.${famille}` : 'Très bien ! Encore une partie, et tu sauras tout par cœur.')
    : (E ? `Hum… Ce n'est pas encore ça, ${E}. Mais si tu rejoues, je suis sûr que tu feras mieux !` : 'Hum… Ce n\'est pas encore ça. Mais si tu rejoues, je suis sûr que tu feras mieux !');
  const sorciers = optSorciers(playerProfile);
  if (!sorciers) $('results-character').innerHTML = pe ? `<img class="results-photo" src="${pe}" alt="" />` : '';
  const texte = sorciers ? `${CHARACTERS[id].nom} : « ${parole} »` : (s === n ? 'Un sans-faute : bravo !' : content ? 'Très bien : encore une partie, et vous saurez tout par cœur.' : 'Rejouez : chaque partie aide à mieux retenir.');
  $('results-text').textContent = texte;
  lastResult = { jeu: currentGame.titreComplet || currentGame.titre, exercice: currentGame.jeu, score: s, total: n, erreurs: game.erreurs.slice(), parNotion: game.parNotion, date: new Date().toISOString() };
  saveScore(lastResult);
  renderSendBox();
  showPanel('results');
  if (sorciers) speak(texte.replace(/^[^:]+: /, '').replace(/[«»]/g, ''), CHARACTERS[id].voix, content ? 'good' : 'bad');
}


/* ------------------------------------------------------------
   SCORES : enregistrés dans le compte (users/{identifiant}/mnemosciences), et envoyés par e-mail à la famille
   (par la messagerie de l'appareil : le site n'a pas de serveur, il ne peut pas expédier un e-mail tout seul).
   ------------------------------------------------------------ */
const SITE_URL = 'https://stassi-tech.github.io/mnemosciences/';
let lastResult = null;
async function saveScore(r) {
  if (!currentUser || !db) return;
  const id = `score-${Date.now()}`;
  try {
    await db.collection('users').doc(currentUser.uid).collection('mnemosciences').doc(id)
      .set({ type: 'score', ...r, creeLe: firebase.firestore.FieldValue.serverTimestamp() });
  } catch (e) { console.warn('Enregistrement du score', e); }
}
async function loadScores() {
  if (!currentUser || !db) return [];
  try {
    const snap = await db.collection('users').doc(currentUser.uid).collection('mnemosciences').where('type', '==', 'score').get();
    return snap.docs.map((d) => ({ ...d.data(), _id: d.id })).sort((a, b) => String(b.date).localeCompare(String(a.date)));
  } catch (e) { console.warn('Lecture des scores', e); return []; }
}
const ligneErreur = (e) => `- ${e.question} : c'était ${e.bonne}, et j'avais répondu ${e.choisie}.`;
function scoreMessage(r) {
  const E = playerProfile?.enfant?.prenom || '';
  const l = [`J'ai fait l'exercice « ${r.jeu} » sur MNEMOSCIENCES.`, `Mon score : ${r.score} bonne${r.score > 1 ? 's' : ''} réponse${r.score > 1 ? 's' : ''} du premier coup sur ${r.total}.`];
  if ((r.erreurs || []).length) { l.push('', 'Mes erreurs :'); r.erreurs.forEach((e) => l.push(ligneErreur(e))); } else l.push('', 'Aucune erreur !');
  l.push('', E, SITE_URL);
  return l.join('\n');
}
function renderSendBox() {
  const box = $('results-send');
  if (!currentUser) { box.innerHTML = '<p class="send-hint">Avec un compte, tu pourras envoyer ton score à ta famille.</p>'; return; }
  if (!optEnvoi(playerProfile)) { box.innerHTML = ''; return; }
  box.innerHTML = sendBoxHtml('esend', 'Envoyer mon score à :').replace('dans ta fiche (ci-dessus)', 'dans « Mon compte » 👤');
  const E = playerProfile?.enfant?.prenom;
  wireSendBox('esend', () => `${E ? E + ' : ' : ''}mon score sur MNEMOSCIENCES (${fmtPts(lastResult.score)}/${lastResult.total})`, async () => scoreMessage(lastResult));
}

/* ------------------------------------------------------------
   LES FICHES (bouton 📖) : trois aide-mémoire, un par domaine, dans des fichiers à part (fiche-matiere.html,
   fiche-vivant.html, fiche-technique.html) que Stéphane peut modifier librement.
   Pendant un exercice, la fiche de sa partie s'ouvre d'abord.
   ------------------------------------------------------------ */
function showFiche(nom) {
  $('fiche-frame').src = `${nom}?v=${Date.now()}`;
  document.querySelectorAll('.fiche-tab').forEach((b) => b.classList.toggle('on', b.dataset.fiche === nom));
}
function openFiche() {
  const enJeu = currentGame && $('welcome-panel').classList.contains('hidden');
  const p = enJeu ? currentGame.partie : partieAccueil;
  showFiche(`fiche-${p || 'matiere'}.html`);
  $('fiche-modal').classList.remove('hidden');
}
document.querySelectorAll('.fiche-tab').forEach((b) => b.addEventListener('click', () => showFiche(b.dataset.fiche)));

/* ------------------------------------------------------------
   COMPTES (Firebase, le même service que Mnemart)
   Pourquoi le même : la connexion par e-mail fonctionne déjà pour Mnemart, il n'y a rien de nouveau
   à configurer. Les données de MNEMOSCIENCES sont rangées à part, dans
   users/{identifiant}/mnemosciences/profil : elles ne se mélangent pas aux scores de Mnemart.
   Le compte est créé par un adulte (son e-mail), pour un enfant : la fiche contient le prénom et le nom
   de l'enfant, et un ou deux adultes (lien, prénom, nom) dont les prénoms servent aux encouragements.
   Une copie de la fiche est gardée dans le navigateur, au cas où le service serait momentanément injoignable.
   ------------------------------------------------------------ */
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCIc15-0fy_OziKdcOHAv-CYxOku9iFX94",
  authDomain: "quiz-art-7378d.firebaseapp.com",
  projectId: "quiz-art-7378d",
  storageBucket: "quiz-art-7378d.firebasestorage.app",
  messagingSenderId: "489975323244",
  appId: "1:489975323244:web:d7070100f3a0e63cec9649",
};
/* Lien de l'adulte avec l'enfant : « ton / ta » et accord de « fier / fière ». */
const LIENS = {
  papa: { label: 'Papa', ton: 'ton papa', f: false },
  maman: { label: 'Maman', ton: 'ta maman', f: true },
  papi: { label: 'Papi', ton: 'ton papi', f: false },
  mamie: { label: 'Mamie', ton: 'ta mamie', f: true },
  grandpere: { label: 'Grand-père', ton: 'ton grand-père', f: false },
  grandmere: { label: 'Grand-mère', ton: 'ta grand-mère', f: true },
  parrain: { label: 'Parrain', ton: 'ton parrain', f: false },
  marraine: { label: 'Marraine', ton: 'ta marraine', f: true },
  tonton: { label: 'Tonton', ton: 'ton tonton', f: false },
  tata: { label: 'Tata', ton: 'ta tata', f: true },
  oncle: { label: 'Oncle', ton: 'ton oncle', f: false },
  tante: { label: 'Tante', ton: 'ta tante', f: true },
  frere: { label: 'Frère', ton: 'ton frère', f: false },
  soeur: { label: 'Sœur', ton: 'ta sœur', f: true },
  cousin: { label: 'Cousin', ton: 'ton cousin', f: false },
  cousine: { label: 'Cousine', ton: 'ta cousine', f: true },
  ami: { label: 'Ami', ton: 'ton ami', f: false },
  amie: { label: 'Amie', ton: 'ton amie', f: true },
};
let auth = null, db = null, currentUser = null, playerProfile = null, accountMode = 'login';
const firebaseReady = typeof firebase !== 'undefined';
if (firebaseReady) {
  try {
    firebase.initializeApp(FIREBASE_CONFIG);
    auth = firebase.auth();
    db = firebase.firestore();
    try { db.settings({ experimentalAutoDetectLongPolling: true }); } catch (e) {}
  } catch (e) { console.warn('Firebase', e); }
}

/* Champs de la fiche (servent à l'inscription ET à « Mon compte ») */
function lienOptions(sel) {
  return '<option value="">— lien —</option>' + Object.entries(LIENS).map(([k, l]) => `<option value="${k}"${k === sel ? ' selected' : ''}>${l.label}</option>`).join('');
}
const esc = (t) => String(t || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
/* v5 : la famille est une liste ouverte. Chaque proche a un lien, un prénom, un nom et, s'il le veut,
   une adresse e-mail : c'est à ces adresses que l'enfant peut envoyer ses scores. */
/* v7 : une photo par personne (le joueur et chacun de ses proches). La photo est réduite sur l'appareil
   (carré de 240 pixels) avant d'être rangée dans la fiche du compte : elle reste privée, visible seulement
   quand on est connecté à ce compte. */
function photoSlotHtml(photo) {
  return `<div class="photo-slot">
      <span class="photo-thumb">${photo ? `<img src="${photo}" alt="" />` : '<span class="photo-empty">🙂</span>'}</span>
      <input type="hidden" class="f-photo" value="${photo ? esc(photo) : ''}" />
      <label class="photo-pick secondary-button">📷 ${photo ? 'Changer la photo' : 'Ajouter une photo'}<input type="file" accept="image/*" class="f-photo-file" /></label>
      <button type="button" class="photo-del link-label${photo ? '' : ' hidden'}">Retirer</button>
    </div>`;
}
function resizePhoto(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const T = 240, c = document.createElement('canvas'); c.width = T; c.height = T;
      const side = Math.min(img.width, img.height);
      c.getContext('2d').drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, T, T);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('image')); };
    img.src = url;
  });
}
/* Boutons photo d'un formulaire (inscription ou Mon compte), branchés une fois sur le conteneur. */
function wirePhotos(container) {
  if (container.dataset.photosWired) return;
  container.dataset.photosWired = '1';
  container.addEventListener('change', async (e) => {
    const input = e.target.closest('.f-photo-file'); if (!input || !input.files[0]) return;
    const slot = input.closest('.photo-slot');
    try {
      const data = await resizePhoto(input.files[0]);
      slot.querySelector('.f-photo').value = data;
      slot.querySelector('.photo-thumb').innerHTML = `<img src="${data}" alt="" />`;
      slot.querySelector('.photo-pick').firstChild.textContent = '📷 Changer la photo';
      slot.querySelector('.photo-del').classList.remove('hidden');
    } catch (ex) { alert('Cette image ne peut pas être lue. Essayez une photo au format JPEG ou PNG.'); }
    input.value = '';
  });
  container.addEventListener('click', (e) => {
    const del = e.target.closest('.photo-del'); if (!del) return;
    const slot = del.closest('.photo-slot');
    slot.querySelector('.f-photo').value = '';
    slot.querySelector('.photo-thumb').innerHTML = '<span class="photo-empty">🙂</span>';
    slot.querySelector('.photo-pick').firstChild.textContent = '📷 Ajouter une photo';
    del.classList.add('hidden');
  });
}
function adulteRowHtml(a, n) {
  return `
    <fieldset class="account-fieldset adulte-row" data-adulte-row>
      <legend>${n === 1 ? 'Un parent ou un proche (facultatif)' : 'Un autre proche'}</legend>
      <button type="button" class="adulte-remove" title="Retirer ce proche" aria-label="Retirer ce proche">✕</button>
      ${photoSlotHtml(a?.photo)}
      <div class="account-row-3">
        <label>Lien<select class="f-lien">${lienOptions(a?.lien)}</select></label>
        <label>Prénom (facultatif)<input type="text" class="f-prenom" value="${esc(a?.prenom)}" autocomplete="off" /></label>
        <label>Nom<input type="text" class="f-nom" value="${esc(a?.nom)}" autocomplete="off" /></label>
      </div>
      <label class="f-email-label">E-mail (pour recevoir les résultats, facultatif)<input type="email" class="f-email" value="${esc(a?.email)}" autocomplete="off" /></label>
    </fieldset>`;
}
function profileFieldsHtml(prefix, p, withConsent) {
  const adultes = (p?.adultes && p.adultes.length) ? p.adultes : [null];
  return `
    <fieldset class="account-fieldset" id="${prefix}-enfant-box">
      <legend>Le joueur</legend>
      ${photoSlotHtml(p?.enfant?.photo)}
      <div class="account-row">
        <label>Prénom<input type="text" id="${prefix}-enfant-prenom" value="${esc(p?.enfant?.prenom)}" autocomplete="off" required /></label>
        <label>Nom<input type="text" id="${prefix}-enfant-nom" value="${esc(p?.enfant?.nom)}" autocomplete="off" /></label>
      </div>
    </fieldset>
    <div class="adultes-list" id="${prefix}-adultes">${adultes.map((a, i) => adulteRowHtml(a, i + 1)).join('')}</div>
    <button type="button" class="secondary-button add-adulte" id="${prefix}-add-adulte">+ Ajouter un proche (papi, mamie, tonton…)</button>
    <!-- v12 : deux options à cocher -->
    <label class="account-option"><input type="checkbox" id="${prefix}-opt-sorciers"${optSorciers(p) ? ' checked' : ''} />
      <span><b>Les sorciers encouragent le joueur</b> (option plutôt réservée aux enfants).<br>Après chaque réponse, un sorcier apparaît ; les prénoms servent à personnaliser ses encouragements (« Joseph, tu es un génie de la grammaire ! », « Ton papa Marc sera fier de toi ! »).</span></label>
    <label class="account-option"><input type="checkbox" id="${prefix}-opt-envoi"${optEnvoi(p) ? ' checked' : ''} />
      <span><b>Envoyer les résultats par e-mail</b>.<br>Les adresses e-mail des proches servent seulement à leur envoyer les scores et le bilan de progression.</span></label>
    ${withConsent ? `<label class="account-consent"><input type="checkbox" id="${prefix}-consent" required /><span>Je suis le parent ou l'adulte responsable de cet enfant, et je crée ce compte pour lui.</span></label>` : ''}`;
}
/* v12 : options du compte. Sans compte, ou pour une fiche plus ancienne, les deux sont actives. */
function optSorciers(p) { return p?.options?.sorciers !== false; }
function optEnvoi(p) { return p?.options?.envoi !== false; }
/* Boutons « + Ajouter un proche » et « ✕ » (au moins un proche reste toujours). */
function wireAdultes(prefix) {
  const list = $(`${prefix}-adultes`);
  /* v12 : sans l'option « Envoyer les résultats par e-mail », les cases e-mail des proches sont masquées. */
  const opt = $(`${prefix}-opt-envoi`);
  const syncMail = () => list.classList.toggle('no-envoi', !!opt && !opt.checked);
  opt?.addEventListener('change', syncMail); syncMail();
  const renumber = () => list.querySelectorAll('[data-adulte-row]').forEach((row, i) => {
    row.querySelector('legend').textContent = i === 0 ? 'Un parent ou un proche (facultatif)' : 'Un autre proche';
    row.querySelector('.adulte-remove').classList.toggle('hidden', list.children.length === 1);
  });
  $(`${prefix}-add-adulte`).addEventListener('click', () => {
    list.insertAdjacentHTML('beforeend', adulteRowHtml(null, 2));
    renumber();
    list.lastElementChild.querySelector('.f-lien').focus();
  });
  list.addEventListener('click', (e) => {
    const b = e.target.closest('.adulte-remove'); if (!b) return;
    if (list.children.length > 1) b.closest('[data-adulte-row]').remove();
    renumber();
  });
  renumber();
}
function readProfileFields(prefix) {
  const v = (id) => ($(`${prefix}-${id}`)?.value || '').trim();
  const adultes = [...$(`${prefix}-adultes`).querySelectorAll('[data-adulte-row]')].map((row) => ({
    lien: row.querySelector('.f-lien').value,
    prenom: row.querySelector('.f-prenom').value.trim(),
    nom: row.querySelector('.f-nom').value.trim(),
    email: row.querySelector('.f-email').value.trim(),
    photo: row.querySelector('.f-photo').value || '',
  })).filter((a) => a.prenom || a.lien || a.email);
  const photoEnfant = $(`${prefix}-enfant-box`)?.querySelector('.f-photo').value || '';
  return { enfant: { prenom: v('enfant-prenom'), nom: v('enfant-nom'), photo: photoEnfant }, adultes,
    options: { sorciers: !!$(`${prefix}-opt-sorciers`)?.checked, envoi: !!$(`${prefix}-opt-envoi`)?.checked } };
}
function checkProfile(p) {
  if (!p.enfant.prenom) return 'Indiquez le prénom du joueur.';
  /* v8 : les proches sont facultatifs, leur prénom aussi (« Ton papa sera fier de toi » marche sans prénom). */
  if (p.adultes.some((a) => a.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.email))) return 'Une des adresses e-mail n\'est pas valide.';
  return '';
}

const localKey = (uid) => `mnemosciences-profil-${uid}`;
async function loadProfile(uid) {
  let p = null;
  try { const snap = await db.collection('users').doc(uid).collection('mnemosciences').doc('profil').get(); if (snap.exists) p = snap.data(); } catch (e) { console.warn('Lecture de la fiche', e); }
  if (!p) { try { p = JSON.parse(localStorage.getItem(localKey(uid)) || 'null'); } catch (e) {} }
  return p;
}
async function saveProfile(uid, p) {
  try { localStorage.setItem(localKey(uid), JSON.stringify(p)); } catch (e) {}
  await db.collection('users').doc(uid).collection('mnemosciences').doc('profil')
    .set({ ...p, misAJour: firebase.firestore.FieldValue.serverTimestamp() });
}

function updateAccountBar() {
  const slot = $('home-account-slot'), label = $('home-account-label'), mail = $('home-account-email'), sw = $('home-account-switch');
  if (!auth) {
    label.textContent = 'Comptes indisponibles pour l\'instant';
    slot.classList.add('is-disabled'); sw.classList.add('hidden'); mail.classList.add('hidden');
    return;
  }
  slot.classList.remove('is-disabled'); sw.classList.remove('hidden');
  if (currentUser) {
    label.textContent = playerProfile?.enfant?.prenom ? `Compte de ${playerProfile.enfant.prenom}` : 'Mon compte';
    const ph = playerProfile?.enfant?.photo;
    $('home-account-photo').innerHTML = ph ? `<img src="${ph}" alt="" />` : '';
    $('home-account-photo').classList.toggle('hidden', !ph);
    mail.textContent = currentUser.email; mail.classList.remove('hidden');
    sw.classList.add('is-connected'); sw.setAttribute('aria-checked', 'true'); sw.title = 'Se déconnecter';
  } else {
    label.textContent = 'Se connecter / Créer un compte';
    $('home-account-photo').classList.add('hidden');
    mail.classList.add('hidden');
    sw.classList.remove('is-connected'); sw.setAttribute('aria-checked', 'false'); sw.title = 'Se connecter';
  }
}

function setAccountMode(mode) {
  accountMode = mode;
  $('account-modal-title').textContent = mode === 'login' ? 'Se connecter' : 'Créer un compte';
  $('account-submit-button').textContent = mode === 'login' ? 'Se connecter' : 'Créer le compte';
  $('account-toggle-mode').textContent = mode === 'login' ? 'Pas encore de compte ? Créez-en un' : 'Déjà un compte ? Connectez-vous';
  $('account-forgot-row').classList.toggle('hidden', mode !== 'login');
  $('account-password').setAttribute('autocomplete', mode === 'login' ? 'current-password' : 'new-password');
  const reg = $('account-register-fields');
  if (mode === 'register') { reg.innerHTML = profileFieldsHtml('reg', null, true); reg.classList.remove('hidden'); reg.style.display = 'grid'; reg.style.gap = '12px'; wireAdultes('reg'); wirePhotos(reg); }
  else { reg.innerHTML = ''; reg.classList.add('hidden'); }
  $('account-error').classList.add('hidden'); $('account-notice').classList.add('hidden');
}
function openAccount() {
  if (!auth) return;
  if (currentUser) openProfile(false);
  else { setAccountMode('login'); $('account-modal').classList.remove('hidden'); }
}
/* « Mon compte » : la fiche de l'enfant, modifiable. first = true juste après une connexion sans fiche
   (par exemple un parent qui avait déjà un compte Mnemart avec la même adresse). */
function openProfile(first) {
  $('profile-modal-title').textContent = first ? 'La fiche du joueur' : 'Mon compte';
  $('profile-intro').textContent = first ? 'Votre compte est prêt. Complétez la fiche du joueur pour que les sorciers puissent l\'encourager par son prénom.' : '';
  $('profile-intro').classList.toggle('hidden', !first);
  $('profile-fields').innerHTML = profileFieldsHtml('pro', playerProfile, false);
  $('profile-fields').style.display = 'grid'; $('profile-fields').style.gap = '12px';
  wireAdultes('pro');
  wirePhotos($('profile-fields'));
  renderScoreHistory();
  $('profile-email-row').textContent = currentUser ? `Connecté avec l'adresse ${currentUser.email}` : '';
  $('profile-error').classList.add('hidden'); $('profile-notice').classList.add('hidden');
  $('profile-modal').classList.remove('hidden');
}

/* le nom de l'exercice, tel qu'il est enregistré avec le score */
function scoreType(jeu) { return jeu || 'Exercice'; }
/* Mes derniers scores, dans la fenêtre Mon compte */
async function renderScoreHistory() {
  const box = $('profile-scores');
  if (!box) return;
  box.innerHTML = '';
  const scores = await loadScores();
  if (!scores.length) { box.innerHTML = '<p class="send-hint">Pas encore de score enregistré.</p>'; $('profile-send').innerHTML = ''; return; }
  /* v12 : bilan de progression, puis (si l'option est cochée) deux envois bien distincts :
     l'envoi des scores (la liste des dernières parties) et l'envoi du bilan de progression (le résumé). */
  const avecMail = (playerProfile?.adultes || []).filter((a) => a.email);
  let h = `<div class="send-block"><p class="send-title">🏅 Bilan de progression</p><button type="button" class="primary-button bilan-button" id="open-bilan">Voir mon bilan de progression</button></div>`;
  if (optEnvoi(playerProfile)) {
    h += !avecMail.length ? '<p class="send-hint">Pour envoyer tes résultats, ajoute l\'adresse e-mail d\'un proche dans ta fiche (ci-dessus).</p>' : `
      <div class="send-block"><p class="send-title">✉️ Envoi par e-mail à :</p>
        <p class="send-hint send-howto">Le message s'ouvre déjà écrit, avec les adresses : il ne reste qu'à cliquer sur « Envoyer ».</p>
        <div class="send-list" id="psend-list">${avecMail.map((a) => `<label class="send-person"><input type="checkbox" value="${esc(a.email)}" checked />${a.photo ? `<img class="send-photo" src="${a.photo}" alt="" />` : ''}<span>${esc(LIENS[a.lien]?.label || a.email)}${a.prenom ? ' ' + esc(a.prenom) : ''}</span></label>`).join('')}</div>
        <div class="send-row"><span>Envoi des scores</span><button type="button" class="primary-button" id="pscore-gmail">✉️ Gmail</button><button type="button" class="secondary-button" id="pscore-mail">Autre messagerie</button></div>
        <div class="send-row"><span>Envoi du bilan de progression</span><button type="button" class="primary-button" id="pbilan-gmail">✉️ Gmail</button><button type="button" class="secondary-button" id="pbilan-mail">Autre messagerie</button></div>
      </div>`;
  }
  $('profile-send').innerHTML = h;
  $('open-bilan').addEventListener('click', openBilan);
  if (optEnvoi(playerProfile) && avecMail.length) {
    const E = playerProfile?.enfant?.prenom;
    wireSendButtons('psend-list', 'pscore', () => `${E ? E + ' : ' : ''}mes scores sur MNEMOSCIENCES`, async () => scoresMessage(await loadScores()));
    wireSendButtons('psend-list', 'pbilan', bilanSubject, async () => bilanMessage(await loadScores()));
  }
  box.innerHTML = '<p class="send-title">Derniers scores</p><ul class="score-list">' + scores.slice(0, 10).map((r) => {
    const d = new Date(r.date);
    const quand = isNaN(d) ? '' : d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) + ', ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    return `<li><span>${esc(scoreType(r.jeu))}</span><span>${quand}</span><strong>${fmtPts(r.score)} / ${r.total}</strong><button type="button" class="score-del" data-id="${esc(r._id)}" title="Effacer ce score" aria-label="Effacer ce score">✕</button></li>`;
  }).join('') + '</ul>';
  /* v8 : chaque score peut être effacé (après confirmation). */
  box.querySelectorAll('.score-del').forEach((b) => b.addEventListener('click', async () => {
    if (!confirm('Effacer ce score ?')) return;
    try { await db.collection('users').doc(currentUser.uid).collection('mnemosciences').doc(b.dataset.id).delete(); }
    catch (e) { alert('Le score n\'a pas pu être effacé. Réessayez.'); return; }
    renderScoreHistory();
  }));
}

function bilanEmblem() {
  const leaves = [];
  for (let i = 0; i < 10; i++) {
    const th = 105 + i * (150 / 9), rad = th * Math.PI / 180;
    const x = 60 + 45 * Math.cos(rad), y = 60 + 45 * Math.sin(rad), rot = th + (i % 2 ? 28 : -28);
    leaves.push(`<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="3" ry="7.5" transform="rotate(${rot.toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})" fill="url(#rpg)"/>`);
    leaves.push(`<ellipse cx="${(120 - x).toFixed(1)}" cy="${y.toFixed(1)}" rx="3" ry="7.5" transform="rotate(${(-rot).toFixed(0)} ${(120 - x).toFixed(1)} ${y.toFixed(1)})" fill="url(#rpg)"/>`);
  }
  return `<svg class="rp-emblem" viewBox="0 0 120 120" aria-hidden="true">
    <defs><linearGradient id="rpg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e6c978"/><stop offset=".5" stop-color="#b08d4c"/><stop offset="1" stop-color="#7a5c35"/></linearGradient></defs>
    ${leaves.join('')}
    <circle cx="60" cy="60" r="31" fill="#fffaf0" stroke="url(#rpg)" stroke-width="3"/>
    <circle cx="60" cy="60" r="26" fill="none" stroke="#c9a85c" stroke-width=".8"/>
    <text x="60" y="70" text-anchor="middle" font-family="Georgia,serif" font-size="28" font-weight="700" fill="#7a5c35">M</text>
  </svg>`;
}
function bilanCorners() {
  const c = `<svg viewBox="0 0 60 60" aria-hidden="true"><path d="M2 58 V2 H58" fill="none" stroke="#b08d4c" stroke-width="2.2"/><path d="M9 58 V9 H58" fill="none" stroke="#d9c08a" stroke-width="1"/><path d="M2 2 C20 6 28 14 30 30 C14 28 6 20 2 2 Z" fill="#b08d4c" opacity=".85"/><circle cx="36" cy="36" r="2.4" fill="#b08d4c"/></svg>`;
  return ['tl', 'tr', 'bl', 'br'].map((p) => `<span class="rp-corner rp-${p}">${c}</span>`).join('');
}
function bilanSeal() {
  return `<svg class="rp-seal" viewBox="0 0 80 80" aria-hidden="true">
    <defs><radialGradient id="rps" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#f0d98f"/><stop offset=".6" stop-color="#b08d4c"/><stop offset="1" stop-color="#7a5c35"/></radialGradient></defs>
    <path d="M26 56 L18 78 L30 72 L36 78 L40 58 Z" fill="#8a5449"/><path d="M54 56 L62 78 L50 72 L44 78 L40 58 Z" fill="#a8665a"/>
    <path d="M40 4 l5 5 7-2 3 7 7 2-1 7 6 4-4 6 3 7-7 3-1 7-7-1-5 6-5-5-7 1-1-7-7-3 3-7-4-6 6-4-1-7 7-2 3-7 7 2z" fill="url(#rps)" transform="translate(0,2)"/>
    <circle cx="40" cy="38" r="19" fill="none" stroke="#fff3cf" stroke-width="1.2" opacity=".8"/>
    <text x="40" y="46" text-anchor="middle" font-family="Georgia,serif" font-size="24" font-weight="700" fill="#fff3cf">M</text>
  </svg>`;
}
/* Analyse des scores : réussite par niveau (et progrès), par nature, confusions les plus fréquentes. */

/* ------------------------------------------------------------
   BILAN DE PROGRESSION (le « diplôme », comme dans MNEMOGRAM) : réussite par exercice (et progrès),
   notions bien connues et notions à revoir.
   ------------------------------------------------------------ */
const pctOf = (r) => (r.total ? (r.score / r.total) * 100 : 0);
const avg = (l) => (l.length ? l.reduce((t, r) => t + pctOf(r), 0) / l.length : 0);
const fmtDate = (d) => d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
function analyseScores(scores) {
  const list = scores.slice().sort((a, b) => String(a.date).localeCompare(String(b.date)));
  const dates = list.map((r) => new Date(r.date)).filter((d) => !isNaN(d));
  const parJeu = {};
  list.forEach((r) => { (parJeu[r.jeu] || (parJeu[r.jeu] = [])).push(r); });
  const exercices = Object.entries(parJeu).map(([jeu, l]) => {
    const res = { jeu, count: l.length, avg: Math.round(avg(l)) };
    if (l.length >= 4) { const k = Math.min(5, Math.floor(l.length / 2)); res.early = Math.round(avg(l.slice(0, k))); res.recent = Math.round(avg(l.slice(-k))); res.diff = res.recent - res.early; }
    return res;
  });
  const nat = {};
  list.forEach((r) => Object.entries(r.parNotion || {}).forEach(([k, v]) => { const t = nat[k] || (nat[k] = { c: 0, p: 0 }); t.c += v.c || 0; t.p += v.p || 0; }));
  const parNotion = Object.entries(nat).filter(([, v]) => v.p >= 2).map(([nom, v]) => ({ nom, pct: Math.round((v.c / v.p) * 100), p: v.p })).sort((a, b) => b.pct - a.pct);
  return {
    list, exercices, parNotion, first: dates[0], last: dates[dates.length - 1],
    jours: new Set(dates.map((d) => d.toDateString())).size,
    questions: list.reduce((t, r) => t + (r.total || 0), 0),
    bonnes: list.reduce((t, r) => t + (r.score || 0), 0),
  };
}
function buildBilan(scores) {
  const A = analyseScores(scores);
  const E = playerProfile?.enfant || {};
  const nom = [E.prenom, E.nom].filter(Boolean).join(' ');
  const taux = A.questions ? Math.round((A.bonnes / A.questions) * 100) : 0;
  const bar = (pct) => `<span class="rp-bar"><span style="width:${Math.max(2, Math.min(100, pct))}%"></span></span>`;
  const line = (label, pct) => `<div class="rp-line"><span class="rp-line-label">${esc(label)}</span>${bar(pct)}<span class="rp-line-pct">${pct} %</span></div>`;
  const cards = A.exercices.map((r) => `
    <div class="rp-card">
      <div class="rp-card-title">${esc(r.jeu)}</div>
      <div class="rp-card-big">${r.avg} %</div>
      <div class="rp-card-sub">moyenne sur ${r.count} partie${r.count > 1 ? 's' : ''}</div>
      ${r.diff !== undefined ? `<div class="rp-card-trend ${r.diff > 0 ? 'up' : r.diff < 0 ? 'down' : ''}">${r.diff > 0 ? '▲ +' + r.diff : r.diff < 0 ? '▼ ' + r.diff : '= stable'} pts<br><span>${r.early} % au début → ${r.recent} % récemment</span></div>` : ''}
    </div>`).join('');
  const reussies = A.parNotion.filter((x) => x.pct >= 75), aRevoir = A.parNotion.filter((x) => x.pct < 75).sort((a, b) => a.pct - b.pct);
  const defis = aRevoir.slice(0, 3).map((x) => `Revoir « ${x.nom} » (${x.pct} %) : relis la fiche 📖, puis rejoue.`);
  if (!defis.length) defis.push('Essayer un bilan, ou passer à l\'onglet du niveau suivant !');
  const intro = taux >= 80 ? `Bravo ! Tu as trouvé ${taux} % des réponses du premier coup : tu connais très bien tes leçons de sciences.`
    : taux >= 60 ? `Tu as trouvé ${taux} % des réponses du premier coup : c'est un beau travail. Continue, les notions deviennent de plus en plus faciles.`
    : `Tu as trouvé ${taux} % des réponses du premier coup. Chaque partie t'aide à mieux retenir : l'important est de continuer.`;
  const notionsHtml = A.parNotion.length ? `<div class="rp-cols">
      <div class="rp-col"><h3>Ce que tu connais bien</h3>${reussies.length ? reussies.slice(0, 8).map((x) => line(x.nom, x.pct)).join('') : '<p class="rp-empty">Bientôt !</p>'}</div>
      <div class="rp-col"><h3>Ce qu'il faut revoir</h3>${aRevoir.length ? aRevoir.slice(0, 8).map((x) => line(x.nom, x.pct)).join('') : '<p class="rp-empty">Rien : bravo !</p>'}</div>
    </div>` : '';
  return `${bilanCorners()}
    <div class="rp-frame"></div>
    <div class="rp-inner">
      <div class="rp-header">
        ${bilanEmblem()}
        <div class="rp-eyebrow">MNEMOSCIENCES</div>
        <h2>Bilan de progression</h2>
        <div class="rp-decor"><span></span><i>❖</i><span></span></div>
        <div class="rp-award">${nom ? 'est décerné avec félicitations à' : 'est décerné avec félicitations'}</div>
        ${nom ? `<div class="rp-name">${esc(nom)}</div>` : ''}
        ${A.first ? `<div class="rp-period">${fmtDate(A.first) === fmtDate(A.last) ? 'le ' + esc(fmtDate(A.first)) : `du ${esc(fmtDate(A.first))} au ${esc(fmtDate(A.last))}`}</div>` : ''}
      </div>
      <p class="rp-intro">${esc(intro)}</p>
      <div class="rp-figures">
        <div><strong>${A.list.length}</strong><span>partie${A.list.length > 1 ? 's' : ''}</span></div>
        <div><strong>${A.jours}</strong><span>jour${A.jours > 1 ? 's' : ''} de pratique</span></div>
        <div><strong>${A.questions}</strong><span>questions</span></div>
        <div><strong>${taux} %</strong><span>trouvées du premier coup</span></div>
      </div>
      <div class="rp-cards">${cards}</div>
      ${notionsHtml}
      <section class="rp-section rp-next"><h3>Ton prochain défi</h3><ul class="rp-list">${defis.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></section>
      <p class="rp-closing">${E.prenom ? esc(E.prenom) + ', continue' : 'Continue'} à compter, à mesurer et à observer : chaque partie rend ta mémoire plus forte.</p>
      <div class="rp-bottom">
        <span class="rp-foot">Établi le ${esc(fmtDate(new Date()))}<br>d'après les scores de ton compte</span>
        ${bilanSeal()}
        <span class="rp-foot rp-sign">Les sciences à travers la mémoire<br><strong>MNEMOSCIENCES</strong></span>
      </div>
    </div>`;
}
function bilanMessage(scores) {
  const A = analyseScores(scores);
  const E = playerProfile?.enfant?.prenom || '';
  const taux = A.questions ? Math.round((A.bonnes / A.questions) * 100) : 0;
  const l = [`Mon bilan sur MNEMOSCIENCES : ${A.list.length} partie${A.list.length > 1 ? 's' : ''}, ${taux} % des réponses trouvées du premier coup.`, ''];
  A.exercices.forEach((r) => l.push(`- ${r.jeu} : ${r.avg} % en moyenne sur ${r.count} partie${r.count > 1 ? 's' : ''}${r.diff !== undefined ? ` (${r.early} % au début, ${r.recent} % récemment)` : ''}.`));
  const aRevoir = A.parNotion.filter((x) => x.pct < 75).sort((a, b) => a.pct - b.pct).slice(0, 4);
  if (aRevoir.length) { l.push('', 'À revoir :'); aRevoir.forEach((x) => l.push(`- ${x.nom} : ${x.pct} %`)); }
  l.push('', 'Mes dernières parties :');
  A.list.slice(-10).reverse().forEach((r) => { const d = new Date(r.date); l.push(`- ${isNaN(d) ? '' : d.toLocaleDateString('fr-FR') + ' : '}${scoreType(r.jeu)}, ${fmtPts(r.score)} / ${r.total}`); });
  l.push('', E, SITE_URL);
  return l.join('\n');
}
function sendBoxHtml(idPrefix, intro) {
  const avecMail = (playerProfile?.adultes || []).filter((a) => a.email);
  if (!avecMail.length) return '<p class="send-hint">Pour envoyer tes scores, ajoute l\'adresse e-mail d\'un proche dans ta fiche (ci-dessus).</p>';
  return `<p class="send-title">${intro}</p>
    <p class="send-hint send-howto">Le message s'ouvre déjà écrit, avec les adresses : il ne reste qu'à cliquer sur « Envoyer ».</p>
    <div class="send-list" id="${idPrefix}-list">${avecMail.map((a) => `<label class="send-person"><input type="checkbox" value="${esc(a.email)}" checked />${a.photo ? `<img class="send-photo" src="${a.photo}" alt="" />` : ''}<span>${esc(LIENS[a.lien]?.label || '')} ${esc(a.prenom || '')}</span></label>`).join('')}</div>
    <div class="send-buttons">
      <button type="button" class="primary-button" id="${idPrefix}-gmail">✉️ Envoyer avec Gmail</button>
      <button type="button" class="secondary-button" id="${idPrefix}-mail">Autre messagerie</button>
    </div>`;
}
function scoresMessage(scores) {
  const E = playerProfile?.enfant?.prenom || '';
  const list = scores.slice(0, 10);
  const l = ['Mes derniers scores sur MNEMOSCIENCES :', ''];
  list.forEach((r) => { const d = new Date(r.date); l.push(`- ${isNaN(d) ? '' : d.toLocaleDateString('fr-FR') + ' : '}${scoreType(r.jeu)}, ${r.score} bonne${r.score > 1 ? 's' : ''} réponse${r.score > 1 ? 's' : ''} sur ${r.total}`); });
  const last = list[0];
  if (last && (last.erreurs || []).length) { l.push('', 'Mes erreurs à la dernière partie :'); last.erreurs.forEach((e) => l.push(ligneErreur(e))); }
  l.push('', E, SITE_URL);
  return l.join('\n');
}
function ouvreMail(to, sujet, corps, gmail) {
  if (!to.length) return;
  if (gmail) window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to.join(','))}&su=${encodeURIComponent(sujet)}&body=${encodeURIComponent(corps)}`, '_blank', 'noopener');
  else location.href = `mailto:${to.join(',')}?subject=${encodeURIComponent(sujet)}&body=${encodeURIComponent(corps)}`;
}
function wireSendButtons(listId, idPrefix, getSubject, getBody) {
  const to = () => [...document.querySelectorAll(`#${listId} input:checked`)].map((c) => c.value);
  $(`${idPrefix}-gmail`)?.addEventListener('click', async () => ouvreMail(to(), getSubject(), await getBody(), true));
  $(`${idPrefix}-mail`)?.addEventListener('click', async () => ouvreMail(to(), getSubject(), await getBody(), false));
}
const wireSendBox = (idPrefix, getSubject, getBody) => wireSendButtons(`${idPrefix}-list`, idPrefix, getSubject, getBody);
const bilanSubject = () => `${playerProfile?.enfant?.prenom ? playerProfile.enfant.prenom + ' : ' : ''}mon bilan sur MNEMOSCIENCES`;
async function openBilan() {
  const overlay = $('report-overlay'), sheet = $('report-sheet');
  sheet.innerHTML = '<p class="rp-loading">Préparation de ton bilan…</p>';
  $('report-send').innerHTML = '';
  overlay.classList.remove('hidden');
  const scores = await loadScores();
  if (!scores.length) { sheet.innerHTML = '<p class="rp-loading">Pas encore de score enregistré : termine une partie, et ton bilan apparaîtra ici.</p>'; return; }
  sheet.innerHTML = buildBilan(scores);
  if (optEnvoi(playerProfile)) {
    $('report-send').innerHTML = sendBoxHtml('rsend', 'Envoi du bilan de progression à :');
    wireSendBox('rsend', bilanSubject, async () => bilanMessage(scores));
  }
}

/* ------------------------------------------------------------
   v13 : « MES DONNÉES » — chacun efface lui-même ses scores, ses données MNEMOSCIENCES, ou son compte entier,
   sans avoir à écrire au contact.
   Le compte est commun avec MNEMOMATHS, MNEMOGRAM et MNEMART (même service Firebase) : le supprimer efface aussi leurs données
   (scores et atelier) et l'accès aux deux sites. Par sécurité, Firebase demande alors le mot de passe.
   ------------------------------------------------------------ */
async function deleteCollection(name, filtre) {
  const snap = await db.collection('users').doc(currentUser.uid).collection(name).get();
  const docs = filtre ? snap.docs.filter((d) => filtre(d.data(), d.id)) : snap.docs;
  for (const d of docs) await d.ref.delete();
  return docs.length;
}
function setDataMsg(kind, t) { const el = $('data-msg'); el.className = kind === 'ok' ? 'account-notice' : 'account-error'; el.textContent = t; el.classList.remove('hidden'); }
function wireMesDonnees() {
  $('data-del-scores').addEventListener('click', async () => {
    if (!currentUser || !confirm('Effacer tous les scores MNEMOSCIENCES de ce compte ? Le bilan de progression repartira de zéro.')) return;
    try { const n = await deleteCollection('mnemosciences', (d) => d.type === 'score'); setDataMsg('ok', `${n} score${n > 1 ? 's' : ''} effacé${n > 1 ? 's' : ''}.`); renderScoreHistory(); }
    catch (e) { setDataMsg('err', 'Les scores n\'ont pas pu être effacés. Réessayez.'); }
  });
  $('data-del-mnemosciences').addEventListener('click', async () => {
    if (!currentUser || !confirm('Effacer toutes vos données MNEMOSCIENCES : la fiche du joueur, les photos, les proches et tous les scores ?\n\nLe compte lui-même est gardé (vous pourrez toujours vous connecter, ici, sur MNEMOGRAM et sur MNEMART).')) return;
    try {
      await deleteCollection('mnemosciences');
      try { localStorage.removeItem(localKey(currentUser.uid)); } catch (e) {}
      playerProfile = null; updateAccountBar();
      $('profile-modal').classList.add('hidden');
      openProfile(true);
    } catch (e) { setDataMsg('err', 'Les données n\'ont pas pu être effacées. Réessayez.'); }
  });
  $('data-del-account').addEventListener('click', () => { $('data-del-account-box').classList.toggle('hidden'); $('data-password').focus(); });
  $('data-del-account-confirm').addEventListener('click', async () => {
    const pw = $('data-password').value;
    if (!pw) { setDataMsg('err', 'Écrivez votre mot de passe pour confirmer.'); return; }
    if (!confirm('Dernière vérification : supprimer définitivement ce compte, pour MNEMOSCIENCES, MNEMOMATHS, MNEMOGRAM ET MNEMART ? Cette action ne peut pas être annulée.')) return;
    try {
      const cred = firebase.auth.EmailAuthProvider.credential(currentUser.email, pw);
      await currentUser.reauthenticateWithCredential(cred);
      for (const c of ['mnemosciences', 'mnemomaths', 'mnemogram', 'scores', 'atelier']) { try { await deleteCollection(c); } catch (e) { console.warn('Effacement', c, e); } }
      try { localStorage.removeItem(localKey(currentUser.uid)); } catch (e) {}
      await currentUser.delete();
      $('profile-modal').classList.add('hidden');
      alert('Votre compte a été supprimé. Merci d\'avoir joué avec MNEMOSCIENCES !');
    } catch (e) {
      setDataMsg('err', e?.code === 'auth/wrong-password' || e?.code === 'auth/invalid-credential' ? 'Mot de passe incorrect : le compte n\'a pas été supprimé.' : 'Le compte n\'a pas pu être supprimé. Réessayez.');
    }
  });
}

function authErrorMessage(error) {
  const map = {
    'auth/email-already-in-use': 'Un compte existe déjà avec cette adresse e-mail (peut-être un compte Mnemart : c\'est le même). Connectez-vous avec, puis complétez la fiche du joueur.',
    'auth/invalid-email': 'Adresse e-mail invalide.',
    'auth/weak-password': 'Le mot de passe doit contenir au moins 6 caractères.',
    'auth/user-not-found': 'Aucun compte ne correspond à cette adresse e-mail.',
    'auth/wrong-password': 'Mot de passe incorrect.',
    'auth/invalid-credential': 'E-mail ou mot de passe incorrect.',
    'auth/operation-not-supported-in-this-environment': 'Les comptes ne fonctionnent que sur le site en ligne (pas en ouvrant le fichier directement sur l\'ordinateur).',
    'auth/network-request-failed': 'Pas de connexion à Internet. Réessayez.',
  };
  return map[error?.code] || 'Une erreur est survenue. Réessayez.';
}

function wireAccount() {
  $('home-account-slot').addEventListener('click', openAccount);
  $('home-account-slot').addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openAccount(); } });
  $('global-account-button').addEventListener('click', openAccount);
  $('home-account-switch').addEventListener('click', (e) => {
    e.stopPropagation();
    if (!auth) return;
    if (currentUser) auth.signOut(); else openAccount();
  });
  document.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => $(b.dataset.close).classList.add('hidden')));
  $('account-toggle-mode').addEventListener('click', () => setAccountMode(accountMode === 'login' ? 'register' : 'login'));
  $('account-forgot-button').addEventListener('click', async () => {
    const email = $('account-email').value.trim();
    const err = $('account-error'), ok = $('account-notice');
    err.classList.add('hidden'); ok.classList.add('hidden');
    if (!email) { err.textContent = 'Écrivez d\'abord votre adresse e-mail ci-dessus, puis recliquez sur « Mot de passe oublié ? ».'; err.classList.remove('hidden'); return; }
    try { await auth.sendPasswordResetEmail(email); ok.textContent = `Un e-mail de réinitialisation a été envoyé à ${email} (pensez à regarder dans les spams).`; ok.classList.remove('hidden'); }
    catch (e) { err.textContent = authErrorMessage(e); err.classList.remove('hidden'); }
  });
  $('account-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const err = $('account-error');
    err.classList.add('hidden');
    const email = $('account-email').value.trim(), password = $('account-password').value;
    try {
      if (accountMode === 'login') {
        await auth.signInWithEmailAndPassword(email, password);
      } else {
        const p = readProfileFields('reg');
        const pb = checkProfile(p); if (pb) { err.textContent = pb; err.classList.remove('hidden'); return; }
        pendingProfile = p;   /* enregistrée dès que la connexion est établie (voir onAuthStateChanged) */
        await auth.createUserWithEmailAndPassword(email, password);
      }
      $('account-modal').classList.add('hidden');
      $('account-form').reset();
    } catch (ex) { pendingProfile = null; err.textContent = authErrorMessage(ex); err.classList.remove('hidden'); }
  });
  $('profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const err = $('profile-error'), ok = $('profile-notice');
    err.classList.add('hidden'); ok.classList.add('hidden');
    const p = readProfileFields('pro');
    const pb = checkProfile(p); if (pb) { err.textContent = pb; err.classList.remove('hidden'); return; }
    playerProfile = p; updateAccountBar();
    try { await saveProfile(currentUser.uid, p); ok.textContent = 'Fiche enregistrée.'; ok.classList.remove('hidden'); setTimeout(() => $('profile-modal').classList.add('hidden'), 900); }
    catch (ex) { console.warn(ex); ok.textContent = 'Fiche gardée sur cet appareil (l\'enregistrement en ligne a échoué, il sera retenté à la prochaine modification).'; ok.classList.remove('hidden'); }
  });
  $('profile-logout-button').addEventListener('click', () => { $('profile-modal').classList.add('hidden'); auth.signOut(); });
  wireMesDonnees();
  auth.onAuthStateChanged(async (user) => {
    currentUser = user;
    playerProfile = null;
    if (user) {
      if (pendingProfile) {
        playerProfile = pendingProfile; pendingProfile = null;
        try { await saveProfile(user.uid, playerProfile); } catch (ex) { console.warn('Enregistrement de la fiche', ex); }
      } else {
        playerProfile = await loadProfile(user.uid);
        if (!playerProfile) openProfile(true);
      }
    }
    updateAccountBar();
  });
}
let pendingProfile = null;

/* ------------------------------------------------------------
   DÉMARRAGE
   ------------------------------------------------------------ */
$('global-version-badge').textContent = APP_VERSION;
initMosaic();
dessinePortail();
$('nat-start-button').addEventListener('click', startGame);
$('nat-next-button').addEventListener('click', nextQuestion);
/* Entrée : passer à la question suivante quand la correction est affichée */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && game.repondu && !$('nat-correction').classList.contains('hidden') && !$('natures-panel').classList.contains('hidden') && document.activeElement?.id !== 'mm-input') { e.preventDefault(); nextQuestion(); }
});
/* le bouton de la voix lit la question (avec ses nombres et ses signes dits en mots) */
$('nat-listen-button').addEventListener('click', () => {
  const q = game.questions[game.index]; if (!q) return;
  const prev = volumeLevel; if (!volumeLevel) volumeLevel = 3;
  speak(voixMaths(q.voix || q.enonce), 'femme', 'phrase');
  volumeLevel = prev;
});
$('results-replay').addEventListener('click', startGame);
$('results-home').addEventListener('click', () => { showPanel('welcome'); montrePartie(currentGame?.partie || ''); });
/* la flèche ← du bandeau revient à la page précédente : elle ferme d'abord une fenêtre ouverte ;
   sinon partie en cours → écran « Démarrer le jeu », écran « Démarrer » → page de la partie, partie → accueil. */
function goBack() {
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  if (!$('report-overlay').classList.contains('hidden')) { $('report-overlay').classList.add('hidden'); return; }
  if (!$('ambiance-picker').classList.contains('hidden')) { $('ambiance-picker').classList.add('hidden'); return; }
  const ouvertes = [...document.querySelectorAll('.modal-backdrop:not(.hidden)')];
  if (ouvertes.length) { ouvertes[ouvertes.length - 1].classList.add('hidden'); return; }
  if (!$('natures-panel').classList.contains('hidden') && $('nat-ready-screen').classList.contains('hidden')) { openGame(currentGame); return; }
  if (!$('welcome-panel').classList.contains('hidden') && partieAccueil) { montrePartie(''); return; }
  showPanel('welcome');
  if (currentGame && !partieAccueil) montrePartie(currentGame.partie || '');
}
$('global-back-button').addEventListener('click', goBack);
function majHauteurBandeau() { const t = document.querySelector('.topbar-banner'); if (t) document.documentElement.style.setProperty('--topbar-h', `${t.offsetHeight}px`); }
window.addEventListener('resize', majHauteurBandeau); majHauteurBandeau();
$('global-home-button').addEventListener('click', () => { if ('speechSynthesis' in window) speechSynthesis.cancel(); showPanel('welcome'); montrePartie(''); });
$('global-fullscreen-button').addEventListener('click', () => { if (document.fullscreenElement) document.exitFullscreen?.(); else document.documentElement.requestFullscreen?.(); });
$('global-fiche-button').addEventListener('click', openFiche);
$('report-close').addEventListener('click', () => $('report-overlay').classList.add('hidden'));
$('open-mentions-legales').addEventListener('click', () => $('mentions-modal').classList.remove('hidden'));
$('open-contact').addEventListener('click', () => $('contact-modal').classList.remove('hidden'));
$('global-info-button').addEventListener('click', () => $('info-modal').classList.remove('hidden'));
$('global-contact-button').addEventListener('click', () => $('contact-modal').classList.remove('hidden'));
$('global-quit-button').addEventListener('click', () => {
  if (!confirm(currentUser ? 'Quitter la session ? La partie en cours s\'arrête et le compte se déconnecte.' : 'Quitter la session ? La partie en cours s\'arrête.')) return;
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  game.fini = true;
  if (auth && currentUser) auth.signOut();
  showPanel('welcome'); montrePartie('');
});
/* les ambiances de Mnemart (les couleurs du site), gardées sur l'appareil */
function applyAmbiance(v) { if (v) document.body.setAttribute('data-ambiance', v); else document.body.removeAttribute('data-ambiance'); }
let ambiance = ''; try { ambiance = localStorage.getItem('mnemosciences-ambiance') || ''; } catch (e) {}
applyAmbiance(ambiance);
$('global-ambiance-button').addEventListener('click', (e) => {
  e.stopPropagation();
  const p = $('ambiance-picker');
  if (p.classList.contains('hidden')) { const r = document.querySelector(`input[name="ambiance"][value="${ambiance}"]`); if (r) r.checked = true; }
  p.classList.toggle('hidden');
});
document.querySelectorAll('input[name="ambiance"]').forEach((r) => r.addEventListener('change', () => {
  if (!r.checked) return;
  ambiance = r.value; applyAmbiance(ambiance);
  try { localStorage.setItem('mnemosciences-ambiance', ambiance); } catch (e) {}
}));
document.addEventListener('click', (e) => { const p = $('ambiance-picker'); if (!p.classList.contains('hidden') && !p.contains(e.target) && e.target.id !== 'global-ambiance-button') p.classList.add('hidden'); });
['mentions-modal', 'contact-modal', 'info-modal'].forEach((id) => {
  $(id).addEventListener('click', (e) => { if (e.target.id === id || e.target.closest('[data-close]')) $(id).classList.add('hidden'); });
});
$('report-print').addEventListener('click', () => window.print());
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') $('report-overlay').classList.add('hidden'); });
$('fiche-close').addEventListener('click', () => $('fiche-modal').classList.add('hidden'));
$('fiche-modal').addEventListener('click', (e) => { if (e.target.id === 'fiche-modal') $('fiche-modal').classList.add('hidden'); });
if (auth) wireAccount();
updateAccountBar();
showPanel('welcome');
