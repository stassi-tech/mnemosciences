/* ============================================================
   MNEMOSCIENCES — programme de l'application
   Les sciences à travers la mémoire, du CE1 à la 3e.
   Même ossature que MNEMOMATHS et MNEMOGRAM (bandeau, ambiances, comptes, scores, bilan).
   Les questions sont tirées de banques (une par exercice), et certaines sont fabriquées
   à chaque partie (thermomètres, circuits) : on ne rejoue jamais deux fois la même série.
   ============================================================ */
'use strict';

/* Numéro de version affiché à l'écran (bandeau du haut) : à augmenter à chaque modification.
   v1 : l'ossature (copie de MNEMOMATHS), les personnages, la mosaïque, et tout le CE1 – CE2.
   v2 : tout le CM1 – CM2 (matériaux, mélanges, énergies, trajectoires, classification, digestion, respiration, puberté, algorithmes avec le lutin, réseaux, climat…).
   v3 : tout le 6e – 5e (masse et volume, vitesse, circuits en série et en dérivation, modèle particulaire, lumière, cellule, photosynthèse, effort, boucles et conditions, chaînes d'énergie et d'information, structures, ordinateur…).
   v4 : tout le 4e – 3e (combustions, loi d'Ohm, son, atomes et pH, poids, énergie ; tectonique, hormones, système nerveux, génétique, évolution, immunologie ; objets connectés, simulation, cartes programmables, cybersécurité…) : tout le programme est construit.
   v5 : chaque question de banque du CE a son illustration, dans le style de MNEMOGRAM (sa bibliothèque de dessins est reprise, complétée de dessins scientifiques).
   v6 : les quiz de cours du CE illustrés aussi ; au CM, des schémas à la craie par notion (sans légende qui donnerait la réponse).
   v7 : schémas à la craie pour la 6e – 5e et la 4e – 3e (exercices et quiz de cours), y compris les questions de calcul.
   v8 : utilisable hors connexion (sw.js garde une copie de l'application ; les scores attendent le retour d'internet).
   v9 : l'exemple d'encouragement des sorciers dit « génie des sciences » (il restait « génie de la grammaire »).
   v10 : après une erreur, le sorcier s'efface au bout de 3 secondes (ou dès qu'on répond) pour laisser voir la figure.
   v11 : au CE, chaque exercice passe d'une quinzaine à une trentaine de questions (213 nouvelles, toutes illustrées).
   v12 : sur smartphone, le bandeau ne garde que ←, 🏠, le volume et ☰ ; les autres icônes passent dans le menu ☰. */
const APP_VERSION = 'v12';

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
    { jeu: 'cm-materiaux', gen: 'materiaux', titre: 'Les familles de matériaux et leurs propriétés', classes: ['cm'],
      consigne: `Métal, verre, plastique, matériaux minéraux ou d'origine vivante : d'où viennent-ils ? Lesquels sont attirés par un aimant, lesquels conduisent le courant ? ${regle}` },
    { jeu: 'cm-melanges', gen: 'melanges', titre: 'Mélanges, dissolution, filtration, décantation', classes: ['cm'],
      consigne: `Mélange homogène ou hétérogène ? Comment séparer le sable de l'eau, récupérer le sel d'une eau salée ? Attention : se dissoudre n'est pas fondre ! ${regle}` },
    { jeu: 'cm-energie', gen: 'energie', titre: 'Les sources d\'énergie, renouvelables ou non', classes: ['cm'],
      consigne: `Soleil, vent, eau, bois, pétrole, charbon, gaz, uranium : quelles énergies s'épuisent, lesquelles se renouvellent ? ${regle}` },
    { jeu: 'cm-mouv', gen: 'mouv2', titre: 'Décrire un mouvement : trajectoire et vitesse', classes: ['cm'],
      consigne: `Des objets photographiés à intervalles réguliers : leur trajectoire est-elle droite, circulaire ou courbe ? Leur vitesse augmente-t-elle, diminue-t-elle ou reste-t-elle la même ? ${regle}` },
    { jeu: 'cm-conv', gen: 'conv', titre: 'Les chaînes d\'énergie', classes: ['cm'],
      consigne: `Source → convertisseur → énergie utile : une lampe, un moteur, un radiateur, une éolienne transforment l'énergie d'une forme en une autre. ${regle}` },
    { jeu: 'cm-signaux', gen: 'signaux', titre: 'Les signaux et l\'information', classes: ['cm'],
      consigne: `Signal lumineux, sonore ou radio : comment transmettre une information, de l'émetteur au récepteur ? ${regle}` },
    { jeu: 'cm-bilan-mat', mix: ['materiaux', 'melanges', 'energie', 'mouv2', 'conv', 'signaux'], n: 14, titre: 'Tout sur la matière, le mouvement et l\'énergie (CM)', classes: ['cm'], bilan: true,
      consigne: `<strong>Bilan</strong> : tout ce que tu as appris au CM sur la matière, le mouvement, l'énergie et les signaux, mélangé. Quatorze questions, de plus en plus difficiles. ${regle}` },
    { jeu: 'cm-quiz-mat', quiz: 'cm-matiere', n: 12, titre: 'Quiz de cours : matière, mouvement, énergie (CM)', classes: ['cm'], quizCours: true, consigne: `<strong>Quiz de cours</strong> : 12 questions tirées au hasard parmi les définitions et le vocabulaire à savoir par cœur. Ce sont toujours les mêmes questions qui reviennent : rejoue jusqu'à toutes les connaître ! ${regle}` },
    { jeu: '65-masse', gen: 'masse', titre: 'Masse et volume', classes: ['65'],
      consigne: `Balance, éprouvette, conversions (g, kg, mL, L, cm³), et le volume d'un caillou mesuré par déplacement d'eau. ${regle}` },
    { jeu: '65-transfo', gen: 'transfo', titre: 'Transformations chimiques simples', classes: ['65'],
      consigne: `Changement d'état, mélange ou transformation chimique ? Une transformation chimique fait apparaître de nouvelles substances. ${regle}` },
    { jeu: '65-vitesse', gen: 'vitesse', titre: 'La vitesse moyenne', classes: ['65'],
      consigne: `v = d ÷ t, d = v × t, t = d ÷ v : calcule des vitesses, des distances et des durées, en km/h et en m/s. ${regle}` },
    { jeu: '65-circuits', gen: 'circuits65', titre: 'Les circuits en série et en dérivation', classes: ['65'],
      consigne: `Deux lampes sur une même boucle ou sur deux boucles ? Que se passe-t-il si on en dévisse une ? Et où passe l'énergie perdue ? ${regle}` },
    { jeu: '65-particules', gen: 'particules', titre: 'Le modèle particulaire et la conservation de la masse (5e)', classes: ['65'],
      consigne: `Comment sont rangées les particules dans un solide, un liquide, un gaz ? Pourquoi la masse se conserve-t-elle ? ${regle}` },
    { jeu: '65-courant', gen: 'courant', titre: 'Conducteurs et isolants, sens du courant (5e)', classes: ['65'],
      consigne: `Le sens conventionnel du courant, la diode, les conducteurs et les isolants, les symboles et le court-circuit. ${regle}` },
    { jeu: '65-lumiere', gen: 'lumiere', titre: 'La lumière : sources, propagation, ombres et éclipses (5e)', classes: ['65'],
      consigne: `Sources primaires et objets diffusants, propagation en ligne droite, ombres, éclipses et phases de la Lune. ${regle}` },
    { jeu: '65-bilan-mat', mix: ['masse', 'transfo', 'vitesse', 'circuits65', 'particules', 'courant', 'lumiere'], n: 14, titre: 'Tout sur la matière, le mouvement et l\'énergie (6e – 5e)', classes: ['65'], bilan: true,
      consigne: `<strong>Bilan</strong> : tout ce que tu as appris en 6e et en 5e en physique-chimie, mélangé. Quatorze questions, de plus en plus difficiles. ${regle}` },
    { jeu: '65-quiz-mat', quiz: '65-matiere', n: 12, titre: 'Quiz de cours : matière, mouvement, énergie (6e – 5e)', classes: ['65'], quizCours: true, consigne: `<strong>Quiz de cours</strong> : 12 questions tirées au hasard parmi les définitions et le vocabulaire à savoir par cœur. Ce sont toujours les mêmes questions qui reviennent : rejoue jusqu'à toutes les connaître ! ${regle}` },
    { jeu: '43-combustion', gen: 'combustion', titre: 'Atomes, molécules et combustions (4e)', classes: ['43'],
      consigne: `Formules des molécules, triangle du feu, produits d'une combustion, conservation des atomes et de la masse. ${regle}` },
    { jeu: '43-ohm', gen: 'ohm', titre: 'Tension, intensité et loi d\'Ohm (4e)', classes: ['43'],
      consigne: `Voltmètre et ampèremètre, U = R × I, et les lois des tensions et des intensités en série et en dérivation. ${regle}` },
    { jeu: '43-son', gen: 'son', titre: 'Le son et la lumière (4e)', classes: ['43'],
      consigne: `Vitesses du son et de la lumière (calcule la distance d'un orage !), fréquences, spectre de la lumière blanche. ${regle}` },
    { jeu: '43-atome', gen: 'atome', titre: 'L\'atome, les ions et le pH (3e)', classes: ['43'],
      consigne: `Protons, neutrons, électrons ; ions positifs et négatifs ; solutions acides, neutres ou basiques. ${regle}` },
    { jeu: '43-forces', gen: 'forces', titre: 'Forces, poids et masse, gravitation (3e)', classes: ['43'],
      consigne: `P = m × g sur la Terre et sur la Lune, actions de contact et à distance, gravitation universelle. ${regle}` },
    { jeu: '43-energie', gen: 'energie43', titre: 'Énergie, puissance et énergie électrique (3e)', classes: ['43'],
      consigne: `Énergie cinétique et potentielle, E = P × t en joules et en kilowattheures, Ec = ½ m v². ${regle}` },
    { jeu: '43-bilan-mat', mix: ['combustion', 'ohm', 'son', 'atome', 'forces', 'energie43'], n: 14, titre: 'Tout sur la physique-chimie (4e – 3e)', classes: ['43'], bilan: true,
      consigne: `<strong>Bilan</strong> : tout ce que tu as appris en 4e et en 3e en physique-chimie, mélangé. Quatorze questions, de plus en plus difficiles. ${regle}` },
    { jeu: '43-quiz-mat', quiz: '43-matiere', n: 12, titre: 'Quiz de cours : physique-chimie (4e – 3e)', classes: ['43'], quizCours: true, consigne: `<strong>Quiz de cours</strong> : 12 questions tirées au hasard parmi les définitions, les formules et le vocabulaire à savoir par cœur. Ce sont toujours les mêmes questions qui reviennent : rejoue jusqu'à toutes les connaître ! ${regle}` },
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
    { jeu: 'cm-classe', gen: 'classe', titre: 'Classer les êtres vivants', classes: ['cm'],
      consigne: `On classe les animaux selon ce qu'ils possèdent : squelette, poils, plumes, mamelles, nombre de pattes. La chauve-souris est-elle un oiseau ? ${regle}` },
    { jeu: 'cm-digestion', gen: 'digestion', titre: 'La digestion', classes: ['cm'],
      consigne: `Le trajet des aliments dans le tube digestif, de la bouche à l'intestin, et ce que deviennent les nutriments. ${regle}` },
    { jeu: 'cm-decompo', gen: 'decompo', titre: 'Décomposition et recyclage de la matière organique', classes: ['cm'],
      consigne: `Vers de terre, champignons, bactéries : les décomposeurs transforment les feuilles mortes et les épluchures en humus et en compost. ${regle}` },
    { jeu: 'cm-respi', gen: 'respi', titre: 'Respiration et circulation sanguine', classes: ['cm'],
      consigne: `Les poumons, le cœur, le sang : comment le dioxygène et les nutriments arrivent jusqu'aux muscles. ${regle}` },
    { jeu: 'cm-repro', gen: 'repro', titre: 'La puberté et la reproduction humaine', classes: ['cm'],
      consigne: `Les changements du corps à la puberté, les cellules reproductrices, la fécondation et la grossesse. ${regle}` },
    { jeu: 'cm-biodiv', gen: 'biodiv', titre: 'La biodiversité et l\'évolution', classes: ['cm'],
      consigne: `Les fossiles, les espèces éteintes, l'évolution, et ce que font les humains pour abîmer ou protéger la biodiversité. ${regle}` },
    { jeu: 'cm-bilan-viv', mix: ['classe', 'digestion', 'decompo', 'respi', 'repro', 'biodiv'], n: 14, titre: 'Tout sur le vivant (CM)', classes: ['cm'], bilan: true,
      consigne: `<strong>Bilan</strong> : tout ce que tu as appris au CM sur le vivant, mélangé. Quatorze questions, de plus en plus difficiles. ${regle}` },
    { jeu: 'cm-quiz-viv', quiz: 'cm-vivant', n: 12, titre: 'Quiz de cours : le vivant (CM)', classes: ['cm'], quizCours: true, consigne: `<strong>Quiz de cours</strong> : 12 questions tirées au hasard parmi les définitions et le vocabulaire à savoir par cœur. Ce sont toujours les mêmes questions qui reviennent : rejoue jusqu'à toutes les connaître ! ${regle}` },
    { jeu: '65-cellule', gen: 'cellule', titre: 'La cellule', classes: ['65'],
      consigne: `Noyau, membrane, cytoplasme, paroi et chloroplastes ; unicellulaires et pluricellulaires ; le grossissement du microscope. ${regle}` },
    { jeu: '65-parente', gen: 'parente', titre: 'Groupes emboîtés et parenté', classes: ['65'],
      consigne: `Classer par attributs partagés, des groupes qui s'emboîtent, et ce qu'un arbre de parenté nous apprend. ${regle}` },
    { jeu: '65-microbes', gen: 'microbes', titre: 'Micro-organismes et production alimentaire', classes: ['65'],
      consigne: `Yaourt, pain, fromage : les fermentations ; conserver les aliments ; l'agriculture raisonnée. ${regle}` },
    { jeu: '65-climat', gen: 'climat65', titre: 'La Terre et le climat (5e)', classes: ['65'],
      consigne: `Météo et climat, masses d'air et courants marins, instruments de mesure, aléas et risques. ${regle}` },
    { jeu: '65-effort', gen: 'effort', titre: 'Le corps humain et l\'effort (5e)', classes: ['65'],
      consigne: `Comment le cœur et les poumons apportent dioxygène et nutriments aux muscles ; calcule une fréquence cardiaque. ${regle}` },
    { jeu: '65-plantes', gen: 'plantes', titre: 'La nutrition des plantes (5e)', classes: ['65'],
      consigne: `La photosynthèse, les racines, les stomates, la sève brute et la sève élaborée. ${regle}` },
    { jeu: '65-bilan-viv', mix: ['cellule', 'parente', 'microbes', 'climat65', 'effort', 'plantes'], n: 14, titre: 'Tout sur le vivant (6e – 5e)', classes: ['65'], bilan: true,
      consigne: `<strong>Bilan</strong> : tout ce que tu as appris en 6e et en 5e en sciences de la vie et de la Terre, mélangé. Quatorze questions, de plus en plus difficiles. ${regle}` },
    { jeu: '65-quiz-viv', quiz: '65-vivant', n: 12, titre: 'Quiz de cours : le vivant (6e – 5e)', classes: ['65'], quizCours: true, consigne: `<strong>Quiz de cours</strong> : 12 questions tirées au hasard parmi les définitions et le vocabulaire à savoir par cœur. Ce sont toujours les mêmes questions qui reviennent : rejoue jusqu'à toutes les connaître ! ${regle}` },
    { jeu: '43-tecto', gen: 'tecto', titre: 'Tectonique des plaques, volcans et séismes (4e)', classes: ['43'],
      consigne: `Plaques, dorsales et subductions, éruptions effusives et explosives, foyer et épicentre, prévention des risques. ${regle}` },
    { jeu: '43-repro', gen: 'repro43', titre: 'Reproduction et hormones (4e)', classes: ['43'],
      consigne: `Reproduction sexuée et asexuée, gamètes, hormones, cycle menstruel, contraception. ${regle}` },
    { jeu: '43-nerfs', gen: 'nerfs', titre: 'Le système nerveux (4e)', classes: ['43'],
      consigne: `Cerveau, moelle épinière, nerfs et neurones ; perception ; sommeil, réflexes et effets des substances sur les synapses. ${regle}` },
    { jeu: '43-genetique', gen: 'genetique', titre: 'Chromosomes, ADN et gènes (3e)', classes: ['43'],
      consigne: `46 chromosomes, gènes et allèles, XX et XY, mitose et méiose, ce qui fait de chacun un être unique. ${regle}` },
    { jeu: '43-evolution', gen: 'evolution', titre: 'L\'évolution et la sélection naturelle (3e)', classes: ['43'],
      consigne: `Darwin, mutations, sélection naturelle, résistance aux antibiotiques, ancêtres communs. ${regle}` },
    { jeu: '43-immuno', gen: 'immuno', titre: 'Microbes, défenses du corps et vaccination (3e)', classes: ['43'],
      consigne: `Barrières naturelles, phagocytose, lymphocytes et anticorps, vaccins, antibiotiques et virus. ${regle}` },
    { jeu: '43-enjeux', gen: 'enjeux', titre: 'Les enjeux planétaires (3e)', classes: ['43'],
      consigne: `Ressources, transition énergétique, climat, biodiversité, développement durable. ${regle}` },
    { jeu: '43-bilan-viv', mix: ['tecto', 'repro43', 'nerfs', 'genetique', 'evolution', 'immuno', 'enjeux'], n: 14, titre: 'Tout sur les SVT (4e – 3e)', classes: ['43'], bilan: true,
      consigne: `<strong>Bilan</strong> : tout ce que tu as appris en 4e et en 3e en sciences de la vie et de la Terre, mélangé. Quatorze questions, de plus en plus difficiles. ${regle}` },
    { jeu: '43-quiz-viv', quiz: '43-vivant', n: 12, titre: 'Quiz de cours : SVT (4e – 3e)', classes: ['43'], quizCours: true, consigne: `<strong>Quiz de cours</strong> : 12 questions tirées au hasard parmi les définitions, les formules et le vocabulaire à savoir par cœur. Ce sont toujours les mêmes questions qui reviennent : rejoue jusqu'à toutes les connaître ! ${regle}` },
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
    { jeu: 'cm-analyse', gen: 'analyse', titre: 'Analyser un objet technique', classes: ['cm'],
      consigne: `Le besoin, la fonction d'usage, la fonction d'estime, et la fonction technique de chaque pièce. ${regle}` },
    { jeu: 'cm-algo', gen: 'algo', titre: 'Algorithmes et programmation (Scratch)', classes: ['cm'],
      consigne: `Suis le programme du lutin pas à pas sur le quadrillage, puis (au CM2) avec la boucle « répéter ». Tourner à droite ou à gauche, c'est par rapport au lutin ! ${regle}` },
    { jeu: 'cm-terre2', gen: 'terre2', titre: 'Les mouvements de la Terre, les séismes et les volcans', classes: ['cm'],
      consigne: `Rotation, révolution, saisons ; et la Terre qui bouge : séismes, volcans, plaques, tsunamis. ${regle}` },
    { jeu: 'cm-recycle', gen: 'recycle', titre: 'Choisir un matériau, le recyclage', classes: ['cm'],
      consigne: `Pourquoi choisir le verre, le cuivre ou l'acier pour un objet ? Comment trier, réduire, réutiliser et recycler ? ${regle}` },
    { jeu: 'cm-reseau', gen: 'reseau', titre: 'Les réseaux informatiques', classes: ['cm'],
      consigne: `La box, le Wi-Fi, le routeur, le serveur, Internet : comment les informations voyagent d'un ordinateur à l'autre. ${regle}` },
    { jeu: 'cm-climat', gen: 'climat', titre: 'Ressources, risques naturels et changement climatique', classes: ['cm'],
      consigne: `L'eau douce et l'énergie à économiser, les risques naturels à prévoir, l'effet de serre et le réchauffement du climat. ${regle}` },
    { jeu: 'cm-bilan-tec', mix: ['analyse', 'algo', 'terre2', 'recycle', 'reseau', 'climat'], n: 14, titre: 'Tout sur les objets techniques et la Terre (CM)', classes: ['cm'], bilan: true,
      consigne: `<strong>Bilan</strong> : tout ce que tu as appris au CM sur les objets techniques, l'informatique et la Terre, mélangé. Quatorze questions, de plus en plus difficiles. ${regle}` },
    { jeu: 'cm-quiz-tec', quiz: 'cm-technique', n: 12, titre: 'Quiz de cours : objets techniques et Terre (CM)', classes: ['cm'], quizCours: true, consigne: `<strong>Quiz de cours</strong> : 12 questions tirées au hasard parmi les définitions et le vocabulaire à savoir par cœur. Ce sont toujours les mêmes questions qui reviennent : rejoue jusqu'à toutes les connaître ! ${regle}` },
    { jeu: '65-cdc', gen: 'cdc', titre: 'Cahier des charges et prototype', classes: ['65'],
      consigne: `Du besoin au prototype : cahier des charges, contraintes, modélisation 3D, essais et améliorations. ${regle}` },
    { jeu: '65-cond', gen: 'cond', titre: 'Programmer avec des boucles et des conditions', classes: ['65'],
      consigne: `Suis des petits programmes : boucles, variables, « si … alors … sinon », capteurs. Que vaut le score ? Que fait le robot ? ${regle}` },
    { jeu: '65-systsol', gen: 'systsol', titre: 'La Terre dans le système solaire, météo et climat', classes: ['65'],
      consigne: `Pourquoi la vie est-elle possible sur Terre ? Planètes rocheuses et géantes, eau liquide, atmosphère. ${regle}` },
    { jeu: '65-chaines', gen: 'chaines', titre: 'Chaîne d\'énergie et chaîne d\'information (5e)', classes: ['65'],
      consigne: `Acquérir, traiter, communiquer ; alimenter, distribuer, convertir, transmettre : le rôle de chaque élément d'un système automatisé. ${regle}` },
    { jeu: '65-struct', gen: 'struct', titre: 'Matériaux et structures (5e)', classes: ['65'],
      consigne: `Traction, compression, flexion, torsion ; pourquoi des triangles ; quel matériau choisir. ${regle}` },
    { jeu: '65-ordi', gen: 'ordi', titre: 'L\'ordinateur, les capteurs et les actionneurs (5e)', classes: ['65'],
      consigne: `Processeur, mémoires, périphériques d'entrée et de sortie, binaire ; capteurs qui mesurent et actionneurs qui agissent. ${regle}` },
    { jeu: '65-bilan-tec', mix: ['cdc', 'cond', 'systsol', 'chaines', 'struct', 'ordi'], n: 14, titre: 'Tout sur la technologie et la Terre (6e – 5e)', classes: ['65'], bilan: true,
      consigne: `<strong>Bilan</strong> : tout ce que tu as appris en 6e et en 5e en technologie et sur la Terre, mélangé. Quatorze questions, de plus en plus difficiles. ${regle}` },
    { jeu: '65-quiz-tec', quiz: '65-technique', n: 12, titre: 'Quiz de cours : technologie et Terre (6e – 5e)', classes: ['65'], quizCours: true, consigne: `<strong>Quiz de cours</strong> : 12 questions tirées au hasard parmi les définitions et le vocabulaire à savoir par cœur. Ce sont toujours les mêmes questions qui reviennent : rejoue jusqu'à toutes les connaître ! ${regle}` },
    { jeu: '43-connecte', gen: 'connecte', titre: 'Les objets connectés (4e)', classes: ['43'],
      consigne: `Objets connectés, protocoles, Bluetooth, Wi-Fi et fibre optique, débit et données personnelles. ${regle}` },
    { jeu: '43-simu', gen: 'simu', titre: 'La simulation numérique (4e)', classes: ['43'],
      consigne: `Modèles, variables d'entrée, simulations de ponts, de crash-tests ou de la météo, et validation par des essais réels. ${regle}` },
    { jeu: '43-carte', gen: 'carte', titre: 'Variables, événements et capteurs (4e)', classes: ['43'],
      consigne: `Programmer une carte comme la Micro:bit : événements, variables, boucles, conditions, capteurs et actionneurs. ${regle}` },
    { jeu: '43-projet', gen: 'projet', titre: 'Projet et développement durable (3e)', classes: ['43'],
      consigne: `Cycle de vie, écoconception, planning, validation d'un prototype, obsolescence programmée. ${regle}` },
    { jeu: '43-cyber', gen: 'cyber', titre: 'Réseaux, adresses IP et cybersécurité (3e)', classes: ['43'],
      consigne: `Adresses IP, routage, DNS, mots de passe, hameçonnage, chiffrement et RGPD. ${regle}` },
    { jeu: '43-fonc', gen: 'fonc43', titre: 'Représentation fonctionnelle et algorithmes (3e)', classes: ['43'],
      consigne: `Organigrammes (ovale, rectangle, losange), chaînes d'information et d'énergie, et petits programmes à suivre, comme à l'épreuve du brevet. ${regle}` },
    { jeu: '43-bilan-tec', mix: ['connecte', 'simu', 'carte', 'projet', 'cyber', 'fonc43'], n: 14, titre: 'Tout sur la technologie (4e – 3e)', classes: ['43'], bilan: true,
      consigne: `<strong>Bilan</strong> : tout ce que tu as appris en 4e et en 3e en technologie, mélangé. Quatorze questions, de plus en plus difficiles. ${regle}` },
    { jeu: '43-quiz-tec', quiz: '43-technique', n: 12, titre: 'Quiz de cours : technologie (4e – 3e)', classes: ['43'], quizCours: true, consigne: `<strong>Quiz de cours</strong> : 12 questions tirées au hasard parmi les définitions, les formules et le vocabulaire à savoir par cœur. Ce sont toujours les mêmes questions qui reviennent : rejoue jusqu'à toutes les connaître ! ${regle}` },
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
  /* la banque se souvient des questions qu'elle vient de poser, pour ne pas les reposer dans la même partie */
  let recents = [];
  return (p) => {
    const neuf = (L) => L.filter((x) => !recents.includes(x));
    const faciles = B.filter((x) => !x.n), dures = B.filter((x) => x.n);
    const voulu = p < 0.45 ? faciles : dures;
    let L = neuf(voulu);
    if (!L.length || Math.random() < 0.15) L = neuf(B);
    if (!L.length) L = B;
    const x = pick(L);
    recents = [...recents, x].slice(-(B.length - 1));
    return depuisBanque(x, notion);
  };
}
function depuisBanque(x, notion) {
  /* les questions du CE sans schéma reçoivent une scène dessinée dans le style de MNEMOGRAM */
  const sc = !x.fig && typeof SCENES_CE !== 'undefined' ? (SCENES_CE[`${x.q}|${x.r}`] || SCENES_CE[x.q]) : null;
  const figure = typeof x.fig === 'function' ? x.fig() : x.fig || (sc ? `<span class="illus-ce">${ILLUS.svgIllus(sc, x.q.replace(/<[^>]+>/g, ''))}</span>` : (typeof schemaPour === 'function' ? schemaPour(x.q, notion) || undefined : undefined));
  const base = { enonce: x.q, explication: x.e, notion, voix: x.v, figure, court: x.q.replace(/<[^>]+>/g, '').slice(0, 90) };
  if (typeof x.r === 'number') return { ...base, saisie: { type: 'nombre', bonne: x.r, unite: x.u, neg: x.r < 0, tol: x.tol }, rep: `${fmtN(x.r)}${x.u ? ` ${x.u}` : ''}` };
  return { ...base, choix: shuffle([x.r, ...x.f]).map((v) => ({ v, html: v })), bonne: x.r, rep: x.r };
}
/* une partie avec des questions fabriquées (fonction) et des questions de banque, mélangées */
function genMixte(B, notion, fab, part = 0.4) {
  const g = genBanque(B, notion);
  return (p) => {
    if (Math.random() >= part) return g(p);
    const q = fab(p);
    if (!q.figure && typeof schemaPour === 'function') q.figure = schemaPour(q.enonce, notion) || undefined;
    return q;
  };
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
   CM1 – CM2 : SCHÉMAS FABRIQUÉS À CHAQUE PARTIE
   - les trajectoires (chronophotographie : la position de l'objet à intervalles de temps réguliers)
   - les programmes de déplacement d'un lutin (comme dans Scratch), avec la boucle « répéter » au CM2
   ============================================================ */
const nomCase = (c, l, nl) => `${'ABCDEFGH'[c]}${nl - l}`;

function figTrajectoire(forme, vitesse) {
  const N = 7, pas = (i) => (vitesse === 'uniforme' ? i : vitesse === 'accelere' ? (i * i) / (N - 1) : (N - 1) - ((N - 1 - i) ** 2) / (N - 1));
  const P = [];
  for (let i = 0; i < N; i += 1) {
    const t = pas(i) / (N - 1);
    if (forme === 'rectiligne') P.push([40 + t * 300, 110]);
    else if (forme === 'circulaire') { const a = -Math.PI / 2 + t * 1.6 * Math.PI; P.push([190 + 80 * Math.cos(a), 115 + 80 * Math.sin(a)]); }
    else P.push([40 + t * 300, 190 - 300 * t * (1 - t) * 1.6]);
  }
  let s = '';
  if (forme === 'circulaire') s += `<circle cx="190" cy="115" r="80" fill="none" stroke="${CRAIE}" stroke-width="1.5" stroke-dasharray="4 6" opacity=".5"/>`;
  s += P.map(([x, y], i) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="9" fill="${i === 0 ? JAUNE : i === N - 1 ? ROSE : CRAIE}" opacity="${0.55 + 0.45 * i / (N - 1)}"/>`).join('');
  s += txt(P[0][0], P[0][1] + 24, 'départ', { taille: 12, c: JAUNE });
  return svgArdoise(380, 230, s, 'Les positions successives d\'un objet, photographiées à intervalles de temps réguliers');
}
function fabTrajectoire(p) {
  const notion = 'Décrire un mouvement';
  if (Math.random() < 0.45) {
    const forme = pick(['rectiligne', 'circulaire', 'curviligne']);
    const nom = { rectiligne: 'rectiligne (une ligne droite)', circulaire: 'circulaire (un cercle)', curviligne: 'curviligne (une courbe qui n\'est pas un cercle)' };
    return { enonce: 'On a photographié un objet à intervalles de temps réguliers. Sa <strong>trajectoire</strong> est…', figure: figTrajectoire(forme, 'uniforme'), choix: Object.values(nom).map((v) => ({ v, html: v })), bonne: nom[forme], rep: forme, notion,
      explication: `La trajectoire, c'est la <strong>ligne</strong> que dessine l'objet en se déplaçant. Ici, les positions sont ${forme === 'rectiligne' ? 'sur une <strong>ligne droite</strong> : la trajectoire est rectiligne (comme une voiture sur une route droite)' : forme === 'circulaire' ? 'sur un <strong>cercle</strong> : la trajectoire est circulaire (comme une nacelle de grande roue)' : 'sur une <strong>courbe</strong> qui n\'est pas un cercle : la trajectoire est curviligne (comme un ballon lancé en l\'air)'}.` };
  }
  const v = pick(['uniforme', 'accelere', 'ralenti']);
  const nom = { uniforme: 'sa vitesse reste la même', accelere: 'sa vitesse augmente', ralenti: 'sa vitesse diminue' };
  return { enonce: 'Une petite voiture est photographiée à intervalles de temps <strong>réguliers</strong> (par exemple toutes les secondes). Pendant ce trajet…', figure: figTrajectoire('rectiligne', v), choix: Object.values(nom).map((x) => ({ v: x, html: x })), bonne: nom[v], rep: nom[v], notion,
    explication: `Entre deux photos, il s'écoule toujours le même temps. ${v === 'uniforme' ? 'Les points sont <strong>également espacés</strong> : la voiture parcourt la même distance à chaque seconde, sa vitesse est constante (mouvement uniforme).' : v === 'accelere' ? 'Les points sont de plus en plus <strong>écartés</strong> : la voiture parcourt une distance de plus en plus grande à chaque seconde, elle <strong>accélère</strong>.' : 'Les points sont de plus en plus <strong>rapprochés</strong> : la voiture parcourt une distance de plus en plus petite à chaque seconde, elle <strong>ralentit</strong>.'}` };
}

/* --- Le lutin programmé (comme dans Scratch) --- */
function fabProg(p) {
  const notion = 'Algorithmes et programmation';
  const n = 6, DIRS = [[1, 0], [0, 1], [-1, 0], [0, -1]];
  const boucle = p >= 0.5 && Math.random() < 0.6;
  let c0, l0, c, l, o, chemin, lignes, ok, pasApas;
  do {
    c0 = rnd(0, n - 1); l0 = rnd(0, n - 1); c = c0; l = l0; o = 0; chemin = [[c, l]]; ok = true; lignes = []; pasApas = [];
    const av = (k) => { for (let j = 0; j < k; j += 1) { c += DIRS[o][0]; l += DIRS[o][1]; if (c < 0 || l < 0 || c >= n || l >= n) { ok = false; return; } chemin.push([c, l]); } };
    const tourne = (t) => { o = (o + (t === 'droite' ? 1 : 3)) % 4; };
    if (boucle) {
      const k = rnd(2, 3), a = rnd(1, 2), t = pick(['droite', 'gauche', null]);
      lignes.push(`répéter <strong>${k} fois</strong> :<ul class="mm-boucle"><li>avancer de ${a}</li>${t ? `<li>tourner à ${t}</li>` : ''}</ul>`);
      for (let i = 0; i < k && ok; i += 1) { av(a); if (t) tourne(t); }
      pasApas.push(`la boucle répète ${k} fois « avancer de ${a}${t ? `, tourner à ${t}` : ''} »`);
    } else {
      const nb = p < 0.5 ? 2 : 3;
      for (let i = 0; i < nb && ok; i += 1) {
        if (i > 0) { const t = pick(['droite', 'gauche']); tourne(t); lignes.push(`tourner à ${t}`); }
        const k = rnd(1, 3); av(k); lignes.push(`avancer de ${k}`);
      }
    }
  } while (!ok || (c === c0 && l === l0));
  const bonne = nomCase(c, l, n), opts = new Set([bonne]);
  [[c + 1, l], [c - 1, l], [c, l + 1], [c, l - 1], [c + 2, l], [c, l - 2]].forEach(([x, y]) => { if (opts.size < 4 && x >= 0 && y >= 0 && x < n && y < n) opts.add(nomCase(x, y, n)); });
  while (opts.size < 4) opts.add(nomCase(rnd(0, n - 1), rnd(0, n - 1), n));
  return { enonce: `Le lutin 🐱 est en <strong>${nomCase(c0, l0, n)}</strong> et regarde vers la <strong>droite</strong> →. Il exécute ce programme :<ol class="mm-prog">${lignes.map((x) => `<li>${x}</li>`).join('')}</ol>Sur quelle case arrive-t-il ?`,
    voix: `Le lutin est en ${nomCase(c0, l0, n)} et regarde vers la droite. Il suit le programme : ${lignes.map((x) => x.replace(/<\/li><li>/g, ', ').replace(/<[^>]+>|&nbsp;/g, ' ')).join(', ').replace(/\s+/g, ' ')}. Sur quelle case arrive-t-il ?`,
    figure: figQuadrillage(n, n, [], { reperes: true, icones: [[c0, l0, '🐱']] }), figureCorrection: figQuadrillage(n, n, [], { reperes: true, icones: [[c0, l0, '🐱'], [c, l, '🏁']], chemin }),
    choix: shuffle([...opts]).map((v) => ({ v, html: v })), bonne, rep: bonne, notion,
    explication: `On suit l'algorithme pas à pas, en se mettant à la place du lutin : « tourner à droite » ou « à gauche », c'est par rapport à <strong>sa</strong> direction.${boucle ? ` Ici, ${pasApas[0]} : une <strong>boucle</strong> évite d'écrire plusieurs fois les mêmes instructions.` : ''} Le lutin arrive en <strong>${bonne}</strong> (le chemin est dessiné sur le quadrillage).` };
}

/* ============================================================
   CM1 – CM2 : MATIÈRE, MOUVEMENT, ÉNERGIE, SIGNAUX
   n: 0 = plutôt CM1, n: 1 = plutôt CM2
   ============================================================ */
const B_MATERIAUX = [
  { q: 'Une casserole, une cuillère, une canette sont en…', r: 'métal', f: ['plastique', 'verre'], e: 'Ces objets sont en <strong>métal</strong> (acier, aluminium) : solide, il conduit bien la chaleur et l\'électricité.' },
  { q: 'Une bouteille d\'eau minérale transparente et légère est en…', r: 'plastique', f: ['verre', 'métal'], e: 'Légère, souple et transparente : c\'est du <strong>plastique</strong>, fabriqué à partir du pétrole.' },
  { q: 'Le bois, le coton, le papier et la laine sont des matériaux…', r: 'd\'origine vivante (matière organique)', f: ['d\'origine minérale', 'métalliques'], e: 'Ils viennent d\'êtres vivants : le bois et le papier des arbres, le coton d\'une plante, la laine du mouton. C\'est de la <strong>matière organique</strong>.' },
  { q: 'Le sable, l\'argile et les pierres sont des matériaux…', r: 'minéraux', f: ['organiques', 'plastiques'], e: 'Ils viennent des roches de la Terre : ce sont des matériaux <strong>minéraux</strong>. Le verre est fabriqué en faisant fondre du sable.' },
  { q: 'Le verre est fabriqué à partir de…', r: 'sable fondu', f: ['pétrole', 'bois'], e: 'On chauffe du <strong>sable</strong> à plus de 1 400 °C : il fond et devient du verre en refroidissant.' },
  { q: 'Le plastique est fabriqué surtout à partir de…', r: 'pétrole', f: ['sable', 'laine'], e: 'La plupart des plastiques viennent du <strong>pétrole</strong>.' },
  { q: 'Un aimant attire…', r: 'le fer (et l\'acier)', f: ['tous les métaux', 'le bois et le plastique'], e: 'L\'aimant attire les objets en <strong>fer</strong> ou en acier (et quelques autres métaux rares). Il n\'attire ni l\'aluminium d\'une canette, ni le cuivre, ni le bois.' },
  { q: 'Une canette en aluminium est-elle attirée par un aimant ?', r: 'Non', f: ['Oui, car c\'est un métal'], e: 'Attention au piège : <strong>tous les métaux ne sont pas attirés</strong> par l\'aimant. L\'aluminium ne l\'est pas. C\'est ainsi qu\'on trie les canettes d\'acier et d\'aluminium.' },
  { q: 'Un matériau qui laisse passer le courant électrique est…', r: 'conducteur', f: ['isolant', 'magnétique'], e: 'Les <strong>métaux</strong> sont conducteurs : c\'est pourquoi les fils électriques sont en cuivre.' },
  { q: 'Le plastique autour des fils électriques est là parce qu\'il est…', r: 'isolant', f: ['conducteur', 'magnétique'], e: 'Le plastique ne laisse pas passer le courant : il est <strong>isolant</strong>. Il nous protège.' },
  { q: 'Pour fabriquer une poignée de casserole qui ne brûle pas les doigts, on choisit…', r: 'du bois ou du plastique dur', f: ['du métal', 'du verre fin'], e: 'Le métal conduit très bien la <strong>chaleur</strong>. Le bois et certains plastiques la conduisent mal : ce sont des <strong>isolants thermiques</strong>.', n: 1 },
  { q: 'Pour tester si un matériau est conducteur, on le place…', r: 'dans un circuit avec une pile et une ampoule', f: ['près d\'un aimant', 'dans l\'eau'], e: 'Si l\'ampoule brille, le courant traverse le matériau : il est <strong>conducteur</strong>. Sinon, il est isolant.', n: 1 },
  { q: 'Le magnétisme, c\'est la propriété…', r: 'd\'être attiré par un aimant', f: ['de laisser passer le courant', 'de flotter'], e: 'Un matériau <strong>magnétique</strong> est attiré par un aimant : le fer, l\'acier, le nickel.', n: 1 },
  { q: 'Le cuivre est un métal…', r: 'conducteur, mais pas attiré par l\'aimant', f: ['isolant', 'attiré par l\'aimant'], e: 'Le cuivre conduit très bien le courant, mais l\'aimant ne l\'attire pas. Conducteur et magnétique, ce sont <strong>deux propriétés différentes</strong>.', n: 1 },
  { q: 'L\'eau du robinet…', r: 'conduit un peu le courant', f: ['est un parfait isolant', 'est magnétique'], e: 'L\'eau du robinet contient des sels dissous : elle <strong>conduit</strong> un peu le courant. C\'est pourquoi l\'électricité et l\'eau sont un mélange dangereux.', n: 1 },
];
GEN.materiaux = genBanque(B_MATERIAUX, 'Les matériaux et leurs propriétés');

const B_MELANGES = [
  { q: 'Du sel bien mélangé dans de l\'eau : on ne le voit plus. On dit que le sel…', r: 's\'est dissous', f: ['a disparu', 's\'est évaporé'], e: 'Le sel est toujours là (l\'eau est salée !), mais en tout petits morceaux invisibles : il s\'est <strong>dissous</strong>.' },
  { q: 'Un mélange où l\'on ne distingue plus les constituants (eau sucrée) est…', r: 'homogène', f: ['hétérogène'], e: '<strong>Homogène</strong> : on ne voit qu\'une seule chose, partout pareille.' },
  { q: 'Un mélange où l\'on voit plusieurs constituants (eau et sable) est…', r: 'hétérogène', f: ['homogène'], e: '<strong>Hétérogène</strong> : on distingue plusieurs choses à l\'œil nu.' },
  { q: 'L\'eau et l\'huile, mélangées puis laissées au repos…', r: 'se séparent : l\'huile flotte au-dessus', f: ['forment un mélange homogène', 'l\'huile coule au fond'], e: 'L\'huile ne se mélange pas à l\'eau et elle est plus légère : elle <strong>remonte</strong>. Le mélange est hétérogène.' },
  { q: 'Le sucre se dissout dans l\'eau. On dit qu\'il est…', r: 'soluble', f: ['insoluble'], e: 'Le sucre est <strong>soluble</strong> dans l\'eau. Le sable, lui, est insoluble.' },
  { q: 'Le sable dans l\'eau…', r: 'ne se dissout pas et tombe au fond', f: ['se dissout', 'flotte toujours'], e: 'Le sable est <strong>insoluble</strong> : il ne se dissout pas, et laissé au repos il <strong>tombe au fond</strong>.' },
  { q: 'Pour séparer le sable de l\'eau, on peut…', r: 'filtrer avec un filtre à café', f: ['ajouter du sel', 'secouer très fort'], e: 'La <strong>filtration</strong> : l\'eau passe à travers le filtre, les grains de sable restent dedans.' },
  { q: 'Laisser reposer de l\'eau boueuse pour que la terre tombe au fond, c\'est…', r: 'la décantation', f: ['la filtration', 'la dissolution'], e: 'La <strong>décantation</strong> : les particules lourdes tombent au fond. On peut ensuite verser doucement l\'eau du dessus.' },
  { q: 'Peut-on récupérer le sel dissous dans de l\'eau salée en la filtrant ?', r: 'Non, il passe à travers le filtre', f: ['Oui, il reste dans le filtre'], e: 'Le sel dissous est en morceaux si petits qu\'il <strong>traverse le filtre</strong>. Pour le récupérer, on fait évaporer l\'eau : c\'est ainsi que fonctionnent les marais salants.', n: 1 },
  { q: 'Comment récupérer le sel d\'une eau salée ?', r: 'en faisant évaporer l\'eau', f: ['en la filtrant', 'en la mettant au congélateur'], e: 'L\'eau s\'<strong>évapore</strong>, le sel reste. C\'est le principe des marais salants.', n: 1 },
  { q: 'On met de plus en plus de sel dans un verre d\'eau. À la fin…', r: 'le sel ne se dissout plus et reste au fond', f: ['on peut en mettre sans fin', 'l\'eau devient solide'], e: 'Une quantité d\'eau ne peut dissoudre qu\'une quantité <strong>limitée</strong> de sel : on dit que la solution est <strong>saturée</strong>.', n: 1 },
  { q: 'Le sucre fond-il dans le café ?', r: 'Non, il se dissout', f: ['Oui, il fond'], e: 'Fondre, c\'est passer de solide à liquide par la <strong>chaleur</strong> (la glace fond). Le sucre, lui, se <strong>dissout</strong> : il se disperse dans le liquide. Les deux mots ne veulent pas dire la même chose.', n: 1 },
  { q: 'Dans une station d\'épuration, pour nettoyer l\'eau, on utilise…', r: 'la décantation et la filtration', f: ['la dissolution', 'l\'aimantation'], e: 'On laisse <strong>décanter</strong> l\'eau dans de grands bassins, puis on la <strong>filtre</strong> (et des bactéries mangent les saletés).', n: 1 },
  { q: 'Mélanger de l\'eau et du sirop donne un mélange…', r: 'homogène', f: ['hétérogène'], e: 'Une fois bien remué, on ne distingue plus l\'eau et le sirop : le mélange est <strong>homogène</strong>.', n: 1 },
];
GEN.melanges = genBanque(B_MELANGES, 'Les mélanges');

const B_ENERGIE = [
  { q: 'Le soleil, le vent et l\'eau des rivières sont des sources d\'énergie…', r: 'renouvelables', f: ['non renouvelables'], e: 'Elles ne s\'épuisent pas à l\'échelle humaine : ce sont des énergies <strong>renouvelables</strong>.' },
  { q: 'Le pétrole, le charbon et le gaz naturel sont des sources d\'énergie…', r: 'non renouvelables', f: ['renouvelables'], e: 'Ils se sont formés en des millions d\'années : les réserves <strong>s\'épuisent</strong>. Ce sont des énergies non renouvelables (et fossiles).' },
  { q: 'Les panneaux solaires transforment la lumière du Soleil en…', r: 'électricité', f: ['pétrole', 'vent'], e: 'Les panneaux <strong>photovoltaïques</strong> produisent de l\'électricité à partir de la lumière.' },
  { q: 'Une éolienne utilise l\'énergie…', r: 'du vent', f: ['du charbon', 'de l\'uranium'], e: 'L\'énergie du <strong>vent</strong> fait tourner les pales, qui entraînent un alternateur : il produit de l\'électricité.' },
  { q: 'Un barrage hydraulique utilise l\'énergie…', r: 'de l\'eau', f: ['du soleil', 'du gaz'], e: 'L\'eau qui tombe du barrage fait tourner des turbines : énergie <strong>hydraulique</strong>, renouvelable.' },
  { q: 'Le bois de chauffage est une énergie renouvelable si…', r: 'on replante les arbres coupés', f: ['on le brûle vite', 'jamais'], e: 'Le bois repousse : c\'est une énergie <strong>renouvelable</strong>, à condition de replanter autant d\'arbres qu\'on en coupe.' },
  { q: 'Brûler du pétrole, du charbon ou du gaz rejette dans l\'air…', r: 'du dioxyde de carbone, qui réchauffe le climat', f: ['de l\'oxygène pur', 'rien du tout'], e: 'Leur combustion rejette du <strong>dioxyde de carbone</strong> (CO₂), un gaz à effet de serre qui contribue au réchauffement climatique.' },
  { q: 'Pour se déplacer, notre corps utilise l\'énergie…', r: 'des aliments', f: ['du soleil directement', 'de l\'électricité'], e: 'Les <strong>aliments</strong> sont le « carburant » du corps : ils nous donnent l\'énergie pour bouger, grandir, garder notre température.' },
  { q: 'L\'énergie des centrales nucléaires vient…', r: 'de l\'uranium, non renouvelable', f: ['du vent', 'du soleil'], e: 'Les centrales nucléaires utilisent l\'<strong>uranium</strong>, un minerai dont les réserves s\'épuisent : c\'est une énergie non renouvelable. Elle ne rejette pas de CO₂ mais produit des déchets radioactifs.', n: 1 },
  { q: 'Laquelle est une énergie <strong>fossile</strong> ?', r: 'le charbon', f: ['le vent', 'le soleil'], e: 'Le charbon, le pétrole et le gaz viennent de restes d\'êtres vivants enfouis il y a des millions d\'années : ce sont des énergies <strong>fossiles</strong>.', n: 1 },
  { q: 'Pour économiser l\'énergie à la maison, on peut…', r: 'éteindre la lumière en quittant une pièce', f: ['laisser la télé en veille toute la nuit', 'ouvrir les fenêtres avec le chauffage allumé'], e: 'Chaque geste compte : <strong>éteindre</strong> les lumières, ne pas laisser les appareils en veille, baisser un peu le chauffage.', n: 1 },
  { q: 'Le principal inconvénient du soleil et du vent pour produire de l\'électricité, c\'est…', r: 'qu\'ils ne sont pas toujours disponibles', f: ['qu\'ils polluent beaucoup', 'qu\'ils vont s\'épuiser bientôt'], e: 'Pas de soleil la nuit, pas toujours de vent : leur production est <strong>irrégulière</strong>. Il faut savoir stocker l\'énergie ou la compléter.', n: 1 },
  { q: 'Une source d\'énergie <strong>renouvelable</strong> est une source qui…', r: 'se renouvelle assez vite pour ne pas s\'épuiser', f: ['ne coûte rien', 'ne sert qu\'une fois'], e: 'Renouvelable : la nature la <strong>reconstitue</strong> à notre échelle de temps (le soleil revient chaque jour, le vent souffle, la pluie remplit les rivières).', n: 1 },
];
GEN.energie = genBanque(B_ENERGIE, 'Les sources d\'énergie');

const B_MOUV2 = [
  { q: 'La ligne que dessine un objet en se déplaçant s\'appelle…', r: 'sa trajectoire', f: ['sa vitesse', 'sa distance'], e: 'La <strong>trajectoire</strong> : le chemin suivi par l\'objet.' },
  { q: 'La trajectoire d\'une nacelle de grande roue est…', r: 'circulaire', f: ['rectiligne', 'curviligne'], e: 'La nacelle tourne autour de l\'axe de la roue : elle dessine un <strong>cercle</strong>.' },
  { q: 'Un ballon lancé en l\'air a une trajectoire…', r: 'curviligne', f: ['rectiligne', 'circulaire'], e: 'Il monte puis redescend en dessinant une <strong>courbe</strong> (qui n\'est pas un cercle) : trajectoire curviligne.' },
  { q: 'Une bille qui tombe tout droit a une trajectoire…', r: 'rectiligne', f: ['circulaire', 'curviligne'], e: 'Elle tombe en <strong>ligne droite</strong>, verticalement : trajectoire rectiligne.', n: 1 },
  { q: 'Une voiture roule toujours à 50 km/h. Son mouvement est…', r: 'uniforme', f: ['accéléré', 'ralenti'], e: 'Sa vitesse ne change pas : le mouvement est <strong>uniforme</strong>.', n: 1 },
  { q: 'Une voiture qui freine devant un feu rouge a un mouvement…', r: 'ralenti', f: ['accéléré', 'uniforme'], e: 'Sa vitesse <strong>diminue</strong> : le mouvement est ralenti.', n: 1 },
  { q: 'Un objet qui tombe…', r: 'va de plus en plus vite', f: ['va toujours à la même vitesse', 'ralentit'], e: 'En tombant, un objet <strong>accélère</strong> : la Terre l\'attire vers le bas (dans l\'air, le frottement finit par limiter sa vitesse).', n: 1 },
  { q: 'Pour décrire un mouvement, on dit…', r: 'quelle est sa trajectoire et comment varie sa vitesse', f: ['de quelle couleur est l\'objet', 'combien l\'objet pèse'], e: 'Décrire un mouvement : la <strong>trajectoire</strong> (droite, cercle, courbe) et la <strong>vitesse</strong> (constante, qui augmente, qui diminue).' },
];
GEN.mouv2 = genMixte(B_MOUV2, 'Décrire un mouvement', fabTrajectoire, 0.55);

const B_CONV = [
  { q: 'Une lampe de poche transforme l\'énergie électrique de la pile en…', r: 'lumière', f: ['mouvement', 'son'], e: 'L\'ampoule est un <strong>convertisseur</strong> : énergie électrique → <strong>lumière</strong> (et un peu de chaleur).' },
  { q: 'Le moteur d\'un ventilateur transforme l\'électricité en…', r: 'mouvement', f: ['lumière', 'froid'], e: 'Le moteur électrique : énergie électrique → énergie de <strong>mouvement</strong>.' },
  { q: 'Un radiateur électrique transforme l\'électricité en…', r: 'chaleur', f: ['lumière', 'son'], e: 'Énergie électrique → énergie <strong>thermique</strong> (de la chaleur).' },
  { q: 'Un haut-parleur transforme l\'électricité en…', r: 'son', f: ['chaleur seulement', 'lumière'], e: 'Énergie électrique → <strong>son</strong> : la membrane vibre et fait vibrer l\'air.' },
  { q: 'Un panneau solaire transforme la lumière en…', r: 'électricité', f: ['chaleur seulement', 'mouvement'], e: 'Lumière du Soleil → énergie <strong>électrique</strong>.' },
  { q: 'Dans une chaîne d\'énergie, l\'ordre est :', r: 'source → convertisseur → forme d\'énergie utile', f: ['convertisseur → source → énergie', 'énergie → source → convertisseur'], e: 'Exemple : pile (<strong>source</strong>) → ampoule (<strong>convertisseur</strong>) → lumière (<strong>énergie utile</strong>).', n: 1 },
  { q: 'Dans la chaîne « vent → éolienne → électricité », l\'éolienne est…', r: 'le convertisseur', f: ['la source', 'l\'énergie utile'], e: 'Le vent est la <strong>source</strong>, l\'éolienne le <strong>convertisseur</strong>, l\'électricité la forme d\'énergie obtenue.', n: 1 },
  { q: 'Une ampoule chauffe un peu en éclairant. Cette chaleur est…', r: 'une énergie perdue', f: ['le but de l\'ampoule', 'impossible'], e: 'Le but est la lumière ; la chaleur est de l\'énergie <strong>perdue</strong>. Les ampoules LED en perdent beaucoup moins : elles consomment moins.', n: 1 },
  { q: 'Dans une voiture à essence, le moteur transforme l\'énergie du carburant en…', r: 'mouvement (et beaucoup de chaleur perdue)', f: ['lumière', 'électricité seulement'], e: 'Carburant (<strong>source</strong>) → moteur (<strong>convertisseur</strong>) → <strong>mouvement</strong>. Le moteur chauffe beaucoup : une grande partie de l\'énergie est perdue en chaleur.', n: 1 },
  { q: 'Une dynamo de vélo transforme le mouvement de la roue en…', r: 'électricité', f: ['chaleur seulement', 'son'], e: 'Mouvement → énergie <strong>électrique</strong> : la dynamo allume le phare quand on pédale.', n: 1 },
  { q: 'Un grille-pain transforme l\'électricité en…', r: 'chaleur', f: ['mouvement', 'son'], e: 'Ses fils rougissent et chauffent : énergie électrique → énergie <strong>thermique</strong>.' },
];
GEN.conv = genBanque(B_CONV, 'Les chaînes d\'énergie');

const B_SIGNAUX = [
  { q: 'Un feu tricolore donne une information grâce à un signal…', r: 'lumineux', f: ['sonore', 'radio'], e: 'Les couleurs du feu sont un signal <strong>lumineux</strong> : rouge, orange, vert.' },
  { q: 'La sonnerie de l\'école est un signal…', r: 'sonore', f: ['lumineux', 'radio'], e: 'On l\'entend : c\'est un signal <strong>sonore</strong>.' },
  { q: 'Un téléphone portable communique grâce à des ondes…', r: 'radio', f: ['sonores', 'lumineuses visibles'], e: 'Le téléphone envoie et reçoit des ondes <strong>radio</strong>, invisibles, qui vont jusqu\'aux antennes-relais.' },
  { q: 'Le phare au bord de la mer envoie aux bateaux un signal…', r: 'lumineux', f: ['sonore', 'radio'], e: 'Ses éclats de lumière sont un signal <strong>lumineux</strong> ; chaque phare a son rythme pour être reconnu.' },
  { q: 'La sirène des pompiers est un signal…', r: 'sonore', f: ['lumineux', 'radio'], e: 'On l\'entend de loin : c\'est un signal <strong>sonore</strong> (et le gyrophare, un signal lumineux).' },
  { q: 'Le code Morse peut être transmis…', r: 'par des sons, des lumières ou la radio', f: ['seulement par écrit', 'seulement par la voix'], e: 'Le Morse code les lettres avec des points et des traits : on peut l\'envoyer en <strong>sons</strong>, en <strong>éclairs de lumière</strong> ou par <strong>radio</strong>.', n: 1 },
  { q: 'Un signal sert à…', r: 'transmettre une information', f: ['produire de l\'énergie', 'mesurer une masse'], e: 'Un signal porte une <strong>information</strong> d\'un émetteur à un récepteur.', n: 1 },
  { q: 'Dans « la télécommande envoie un ordre à la télévision », l\'émetteur est…', r: 'la télécommande', f: ['la télévision', 'le canapé'], e: 'La télécommande <strong>émet</strong> le signal (infrarouge, invisible), la télévision le <strong>reçoit</strong>.', n: 1 },
  { q: 'La télécommande de la télévision envoie un signal…', r: 'infrarouge, une lumière invisible', f: ['sonore', 'qu\'on voit à l\'œil nu'], e: 'C\'est une <strong>lumière infrarouge</strong>, invisible pour nos yeux. L\'appareil photo d\'un téléphone peut parfois la voir clignoter !', n: 1 },
  { q: 'La radio FM reçoit…', r: 'des ondes radio transformées en son', f: ['du son venu directement de la station', 'de la lumière'], e: 'La station émet des <strong>ondes radio</strong> ; le poste les reçoit et les transforme en <strong>son</strong>.', n: 1 },
  { q: 'Le son se propage…', r: 'dans l\'air, l\'eau et les solides, mais pas dans le vide', f: ['seulement dans l\'air', 'aussi dans le vide de l\'espace'], e: 'Le son a besoin de <strong>matière</strong> pour se propager : dans l\'espace, il n\'y a pas de son.', n: 1 },
];
GEN.signaux = genBanque(B_SIGNAUX, 'Les signaux et l\'information');

/* ============================================================
   CM1 – CM2 : LE VIVANT
   ============================================================ */
const B_CLASSE = [
  { q: 'Pour classer les animaux, on regarde…', r: 'ce qu\'ils ont (leurs attributs)', f: ['où ils vivent', 'ce qu\'ils mangent'], e: 'En sciences, on classe selon ce que les animaux <strong>possèdent</strong> en commun (squelette, poils, plumes, mamelles…), pas selon leur milieu ou leur régime.' },
  { q: 'Le chat, le pigeon, la truite et le lézard ont tous…', r: 'un squelette intérieur (ce sont des vertébrés)', f: ['des poils', 'des plumes'], e: 'Ils ont une <strong>colonne vertébrale</strong> et un squelette intérieur : ce sont des <strong>vertébrés</strong>.' },
  { q: 'Les animaux qui ont des <strong>poils</strong> et des <strong>mamelles</strong> sont…', r: 'les mammifères', f: ['les oiseaux', 'les reptiles'], e: 'Poils et mamelles (pour allaiter les petits) : ce sont les <strong>mammifères</strong>.' },
  { q: 'Les animaux qui ont des <strong>plumes</strong> sont…', r: 'les oiseaux', f: ['les mammifères', 'les insectes'], e: 'Seuls les <strong>oiseaux</strong> ont des plumes.' },
  { q: 'La <strong>chauve-souris</strong> vole. C\'est…', r: 'un mammifère', f: ['un oiseau', 'un insecte'], e: 'Elle a des <strong>poils</strong> et allaite ses petits : c\'est un mammifère. Voler ne suffit pas à être un oiseau : il faut des plumes !' },
  { q: 'La <strong>baleine</strong> vit dans la mer. C\'est…', r: 'un mammifère', f: ['un poisson', 'un reptile'], e: 'La baleine respire avec des poumons et allaite son petit : c\'est un <strong>mammifère</strong>.' },
  { q: 'Le <strong>manchot</strong> ne vole pas. C\'est…', r: 'un oiseau', f: ['un mammifère', 'un poisson'], e: 'Il a des <strong>plumes</strong> et un bec : c\'est un oiseau, même s\'il ne vole pas.' },
  { q: 'Les insectes ont…', r: '6 pattes', f: ['8 pattes', '4 pattes'], e: 'Un <strong>insecte</strong> a 6 pattes (et souvent des ailes). L\'araignée, avec 8 pattes, n\'est pas un insecte.', n: 1 },
  { q: 'L\'<strong>araignée</strong> a 8 pattes. Est-ce un insecte ?', r: 'Non', f: ['Oui'], e: 'Les insectes ont 6 pattes. L\'araignée en a <strong>8</strong> : c\'est un arachnide.', n: 1 },
  { q: 'Un animal sans squelette intérieur (escargot, ver de terre, insecte) est…', r: 'un invertébré', f: ['un vertébré', 'un mammifère'], e: 'Pas de colonne vertébrale : c\'est un <strong>invertébré</strong>.', n: 1 },
  { q: 'Qu\'ont en commun le chat et le dauphin ?', r: 'des mamelles', f: ['des nageoires', 'des plumes'], e: 'Les deux allaitent leurs petits avec des <strong>mamelles</strong> : ce sont des mammifères.', n: 1 },
  { q: 'Qu\'ont en commun le lézard, la grenouille, le pigeon et le chat ?', r: 'quatre membres', f: ['des écailles', 'des poils'], e: 'Ils ont tous <strong>quatre membres</strong> (pattes, ou ailes et pattes chez l\'oiseau) : ce sont des tétrapodes.', n: 1 },
  { q: 'Le <strong>serpent</strong> a des écailles et pas de pattes. C\'est…', r: 'un reptile', f: ['un poisson', 'un mammifère'], e: 'Peau à <strong>écailles</strong>, respire de l\'air : c\'est un reptile, comme le lézard et la tortue.', n: 1 },
];
GEN.classe = genBanque(B_CLASSE, 'Classer les êtres vivants');

const B_DIGESTION = [
  { q: 'La digestion commence…', r: 'dans la bouche', f: ['dans l\'estomac', 'dans l\'intestin'], e: 'Dans la <strong>bouche</strong>, les dents broient les aliments et la salive commence à les transformer.' },
  { q: 'Après la bouche, les aliments descendent par…', r: 'l\'œsophage', f: ['la trachée', 'l\'intestin grêle'], e: 'L\'<strong>œsophage</strong> est le tuyau qui va de la bouche à l\'estomac. (La trachée, elle, conduit l\'air aux poumons.)' },
  { q: 'Dans l\'ordre, les aliments passent par :', r: 'bouche → œsophage → estomac → intestin grêle → gros intestin', f: ['bouche → estomac → œsophage → gros intestin → intestin grêle', 'bouche → intestin grêle → estomac → œsophage'], e: 'C\'est le <strong>tube digestif</strong>, long de presque 9 mètres chez l\'adulte !' },
  { q: 'L\'estomac…', r: 'brasse les aliments et les transforme avec des sucs', f: ['fabrique les dents', 'envoie l\'air aux poumons'], e: 'L\'<strong>estomac</strong> malaxe les aliments et les mélange aux sucs digestifs : ils deviennent une bouillie.' },
  { q: 'Les nutriments passent dans le sang au niveau…', r: 'de l\'intestin grêle', f: ['de l\'œsophage', 'des dents'], e: 'Dans l\'<strong>intestin grêle</strong>, les aliments transformés en nutriments traversent la paroi et passent dans le <strong>sang</strong>.' },
  { q: 'Ce qui n\'est pas digéré…', r: 'est rejeté sous forme d\'excréments', f: ['reste dans l\'estomac pour toujours', 'repart dans la bouche'], e: 'Les restes passent dans le <strong>gros intestin</strong> puis sont rejetés : ce sont les excréments.' },
  { q: 'À quoi servent les dents ?', r: 'à couper et broyer les aliments', f: ['à digérer les nutriments', 'à respirer'], e: 'Les <strong>incisives</strong> coupent, les canines déchirent, les <strong>molaires</strong> broient.' },
  { q: 'Les aliments transformés en très petits éléments qui passent dans le sang s\'appellent…', r: 'les nutriments', f: ['les excréments', 'les sucs'], e: 'Les <strong>nutriments</strong> : le sang les apporte à toutes les parties du corps.', n: 1 },
  { q: 'Les sucs digestifs (salive, suc gastrique…) servent à…', r: 'transformer les aliments en nutriments', f: ['colorer les aliments', 'refroidir l\'estomac'], e: 'Les <strong>sucs digestifs</strong> découpent les aliments en morceaux minuscules : les nutriments.', n: 1 },
  { q: 'Pourquoi faut-il bien mâcher ?', r: 'pour faciliter la digestion', f: ['pour avaler plus vite', 'ça ne sert à rien'], e: 'Des morceaux plus petits sont plus vite <strong>transformés</strong> par les sucs digestifs.', n: 1 },
  { q: 'Le foie et le pancréas…', r: 'fabriquent des sucs qui aident la digestion', f: ['font partie du tube digestif', 'servent à respirer'], e: 'Le foie et le pancréas ne sont pas traversés par les aliments, mais ils envoient leurs <strong>sucs digestifs</strong> dans l\'intestin.', n: 1 },
  { q: 'Les fibres des fruits, des légumes et du pain complet…', r: 'aident l\'intestin à bien fonctionner', f: ['sont dangereuses', 'ne servent à rien'], e: 'Les <strong>fibres</strong> ne sont pas digérées, mais elles aident les restes à avancer dans l\'intestin.', n: 1 },
];
GEN.digestion = genBanque(B_DIGESTION, 'La digestion');

const B_DECOMPO = [
  { q: 'En automne, les feuilles mortes tombées au sol…', r: 'se décomposent peu à peu', f: ['restent intactes pour toujours', 'repartent sur l\'arbre'], e: 'Des petits êtres vivants les mangent et les <strong>décomposent</strong> : elles deviennent de l\'humus.' },
  { q: 'Les êtres vivants qui décomposent la matière morte s\'appellent…', r: 'les décomposeurs', f: ['les prédateurs', 'les herbivores'], e: 'Les <strong>décomposeurs</strong> : vers de terre, cloportes, champignons, bactéries…' },
  { q: 'Lequel est un décomposeur ?', r: 'le ver de terre', f: ['le renard', 'la vache'], e: 'Le <strong>ver de terre</strong> mange les feuilles mortes et la terre, et rend le sol fertile.' },
  { q: 'L\'humus, c\'est…', r: 'la terre noire riche faite de matière décomposée', f: ['du sable', 'une roche'], e: 'L\'<strong>humus</strong> se forme avec les restes décomposés des êtres vivants : il nourrit les plantes.' },
  { q: 'Dans un composteur, on met…', r: 'les épluchures et les restes de végétaux', f: ['le plastique et le verre', 'les piles usagées'], e: 'Les <strong>déchets organiques</strong> (épluchures, marc de café, feuilles) se décomposent en compost.' },
  { q: 'Le compost sert à…', r: 'nourrir les plantes du jardin', f: ['fabriquer du plastique', 'nourrir les chats'], e: 'Le <strong>compost</strong> rend aux plantes les sels minéraux contenus dans les déchets : la matière est <strong>recyclée</strong>.' },
  { q: 'Une bouteille en plastique jetée dans la nature…', r: 'met des centaines d\'années à se dégrader', f: ['se décompose en un mois', 'devient du compost'], e: 'Les décomposeurs ne savent pas « manger » le plastique : il reste des <strong>centaines d\'années</strong>.', n: 1 },
  { q: 'Les champignons et les bactéries du sol…', r: 'décomposent la matière morte', f: ['fabriquent de la lumière', 'mangent les cailloux'], e: 'Invisibles ou presque, ils sont les plus grands <strong>décomposeurs</strong> : ils transforment les restes en sels minéraux.', n: 1 },
  { q: 'Grâce aux décomposeurs, la matière des êtres morts…', r: 'retourne au sol et nourrit de nouvelles plantes', f: ['disparaît complètement', 'devient du pétrole tout de suite'], e: 'C\'est un <strong>cycle</strong> : plante → animal → restes → décomposeurs → sels minéraux → plante. Rien ne se perd.', n: 1 },
  { q: 'Sans décomposeurs, la forêt…', r: 'serait couverte de feuilles et de cadavres', f: ['pousserait plus vite', 'ne changerait pas'], e: 'Les décomposeurs « nettoient » le sol et <strong>recyclent</strong> la matière : sans eux, les plantes manqueraient de sels minéraux.', n: 1 },
  { q: 'Une épluchure de banane dans le compost se décompose plus vite quand…', r: 'il fait doux et humide', f: ['il gèle', 'elle est dans un sac fermé'], e: 'Les décomposeurs aiment la <strong>chaleur douce</strong>, l\'<strong>humidité</strong> et l\'air.', n: 1 },
];
GEN.decompo = genBanque(B_DECOMPO, 'La décomposition');

const B_RESPI = [
  { q: 'Quand on inspire, l\'air entre dans…', r: 'les poumons', f: ['l\'estomac', 'le cœur'], e: 'L\'air passe par le nez ou la bouche, la <strong>trachée</strong>, puis arrive dans les <strong>poumons</strong>.' },
  { q: 'Notre corps prend dans l\'air…', r: 'le dioxygène', f: ['le dioxyde de carbone', 'la vapeur d\'eau'], e: 'Les poumons font passer le <strong>dioxygène</strong> de l\'air dans le sang.' },
  { q: 'Quand on expire, on rejette surtout plus de…', r: 'dioxyde de carbone', f: ['dioxygène', 'azote'], e: 'L\'air expiré contient moins de dioxygène et plus de <strong>dioxyde de carbone</strong>, un déchet produit par le corps.' },
  { q: 'Le cœur est…', r: 'un muscle qui pompe le sang', f: ['un os', 'un poumon'], e: 'Le <strong>cœur</strong> est un muscle creux : il se contracte et envoie le sang dans tout le corps.' },
  { q: 'Le sang circule dans…', r: 'des vaisseaux sanguins', f: ['l\'œsophage', 'les nerfs'], e: 'Les <strong>vaisseaux sanguins</strong> : artères, veines et tout petits capillaires.' },
  { q: 'Pendant un effort, le cœur bat…', r: 'plus vite', f: ['moins vite', 'à la même vitesse'], e: 'Les muscles ont besoin de plus de dioxygène et de nutriments : le cœur bat <strong>plus vite</strong> et on respire plus vite.' },
  { q: 'Le sang transporte…', r: 'le dioxygène et les nutriments vers les organes', f: ['seulement de l\'eau', 'l\'air jusqu\'à l\'estomac'], e: 'Le sang apporte à chaque organe le <strong>dioxygène</strong> (venu des poumons) et les <strong>nutriments</strong> (venus de l\'intestin).', n: 1 },
  { q: 'Le sang rapporte des organes vers les poumons…', r: 'le dioxyde de carbone', f: ['le dioxygène', 'les nutriments'], e: 'Le sang emporte le <strong>dioxyde de carbone</strong>, déchet des organes, qui est rejeté par les poumons.', n: 1 },
  { q: 'Les échanges de gaz se font dans les poumons au niveau…', r: 'de minuscules sacs, les alvéoles', f: ['de la trachée', 'du cœur'], e: 'Les <strong>alvéoles pulmonaires</strong> sont entourées de capillaires : le dioxygène y passe dans le sang, le dioxyde de carbone en sort.', n: 1 },
  { q: 'Les vaisseaux qui partent du cœur vers les organes s\'appellent…', r: 'les artères', f: ['les veines', 'les bronches'], e: '<strong>Artères</strong> : du cœur vers les organes. <strong>Veines</strong> : des organes vers le cœur.', n: 1 },
  { q: 'Le tabac abîme surtout…', r: 'les poumons et le cœur', f: ['les dents seulement', 'les cheveux'], e: 'La fumée de tabac encrasse les <strong>poumons</strong> et fatigue le <strong>cœur</strong> et les vaisseaux.', n: 1 },
  { q: 'On sent son cœur battre au poignet ou au cou : c\'est…', r: 'le pouls', f: ['la respiration', 'la digestion'], e: 'Le <strong>pouls</strong> : chaque battement du cœur fait gonfler les artères. On peut le compter en une minute.', n: 1 },
];
GEN.respi = genBanque(B_RESPI, 'Respiration et circulation');

const B_REPRO = [
  { q: 'La <strong>puberté</strong>, c\'est…', r: 'la période où le corps de l\'enfant devient capable de se reproduire', f: ['une maladie', 'la naissance'], e: 'Entre 10 et 16 ans environ, le corps change : c\'est la <strong>puberté</strong>. Chacun la vit à son rythme.' },
  { q: 'Pendant la puberté…', r: 'chacun change à son rythme, plus tôt ou plus tard', f: ['tout le monde change au même âge', 'seuls les garçons changent'], e: 'Il n\'y a pas d\'âge « normal » précis : la puberté commence plus tôt chez certains, plus tard chez d\'autres. C\'est <strong>normal</strong>.' },
  { q: 'Pendant la puberté, chez les filles comme chez les garçons…', r: 'des poils apparaissent et on grandit vite', f: ['on rapetisse', 'rien ne change'], e: 'On grandit vite, des <strong>poils</strong> poussent (aisselles, pubis), la peau et la transpiration changent.' },
  { q: 'Pendant la puberté, chez les garçons, la voix…', r: 'devient plus grave', f: ['devient plus aiguë', 'disparaît'], e: 'La voix des garçons <strong>mue</strong> : elle devient plus grave.' },
  { q: 'Chez les filles, la puberté s\'accompagne…', r: 'du développement des seins et des premières règles', f: ['d\'une voix plus grave', 'de la barbe'], e: 'Les <strong>seins</strong> se développent et les <strong>règles</strong> apparaissent : le corps devient capable d\'avoir un bébé.' },
  { q: 'La cellule reproductrice de la femme s\'appelle…', r: 'l\'ovule', f: ['le spermatozoïde', 'le placenta'], e: 'L\'<strong>ovule</strong> est produit par les ovaires.', n: 1 },
  { q: 'La cellule reproductrice de l\'homme s\'appelle…', r: 'le spermatozoïde', f: ['l\'ovule', 'l\'embryon'], e: 'Les <strong>spermatozoïdes</strong> sont produits par les testicules.', n: 1 },
  { q: 'La rencontre d\'un ovule et d\'un spermatozoïde s\'appelle…', r: 'la fécondation', f: ['la naissance', 'la digestion'], e: 'La <strong>fécondation</strong> donne une cellule-œuf, qui va se développer en embryon puis en fœtus.', n: 1 },
  { q: 'Chez l\'être humain, la grossesse dure environ…', r: '9 mois', f: ['3 mois', '2 ans'], e: 'Environ <strong>9 mois</strong> : le bébé grandit dans l\'utérus de sa mère.', n: 1 },
  { q: 'Pendant la grossesse, le bébé se développe dans…', r: 'l\'utérus de sa mère', f: ['l\'estomac de sa mère', 'un œuf pondu'], e: 'Le fœtus grandit dans l\'<strong>utérus</strong>, protégé par une poche remplie de liquide.', n: 1 },
  { q: 'Le bébé reçoit nourriture et dioxygène de sa mère par…', r: 'le cordon ombilical et le placenta', f: ['sa bouche', 'ses poumons'], e: 'Le <strong>placenta</strong> fait passer les nutriments et le dioxygène du sang de la mère à celui du bébé, par le <strong>cordon ombilical</strong>. Le nombril en est la trace !', n: 1 },
  { q: 'Pendant la puberté, il faut se laver chaque jour parce que…', r: 'la transpiration devient plus forte', f: ['la peau devient sale toute seule', 'ce n\'est pas utile'], e: 'Les glandes de la peau travaillent plus : une <strong>douche quotidienne</strong> et des vêtements propres suffisent.', n: 1 },
];
GEN.repro = genBanque(B_REPRO, 'Puberté et reproduction');

const B_BIODIV = [
  { q: 'La <strong>biodiversité</strong>, c\'est…', r: 'la diversité de tous les êtres vivants', f: ['le nombre d\'êtres humains', 'la couleur des fleurs'], e: 'La <strong>biodiversité</strong> : toutes les espèces vivantes (animaux, plantes, champignons, microbes) et leurs milieux.' },
  { q: 'Les dinosaures (sauf les ancêtres des oiseaux) ont disparu. On dit que ces espèces sont…', r: 'éteintes', f: ['endormies', 'cachées'], e: 'Une espèce <strong>éteinte</strong> n\'existe plus. On la connaît par ses fossiles.' },
  { q: 'Un fossile, c\'est…', r: 'la trace d\'un être vivant très ancien, conservée dans la roche', f: ['un caillou ordinaire', 'un animal vivant'], e: 'Les <strong>fossiles</strong> (os, coquilles, empreintes) montrent que les êtres vivants ont changé au cours du temps.' },
  { q: 'Les êtres vivants ont changé au cours des millions d\'années : c\'est…', r: 'l\'évolution', f: ['la digestion', 'la germination'], e: 'L\'<strong>évolution</strong> : les espèces se transforment très lentement, de génération en génération.' },
  { q: 'Les oiseaux descendent…', r: 'de dinosaures', f: ['des poissons volants', 'des chauves-souris'], e: 'Des fossiles de dinosaures à plumes le montrent : les <strong>oiseaux</strong> sont des descendants de dinosaures.', n: 1 },
  { q: 'Couper une forêt pour construire une route…', r: 'détruit le milieu de vie de nombreuses espèces', f: ['n\'a aucun effet sur les animaux', 'augmente la biodiversité'], e: 'Détruire un <strong>milieu</strong> est la première cause de disparition des espèces.' },
  { q: 'Quelle action protège la biodiversité ?', r: 'laisser une haie et un coin de jardin sauvage', f: ['utiliser beaucoup d\'insecticides', 'goudronner les jardins'], e: 'Les haies et les coins sauvages offrent <strong>abri et nourriture</strong> aux insectes, aux oiseaux, aux hérissons.' },
  { q: 'Pourquoi les abeilles sont-elles si importantes ?', r: 'elles pollinisent beaucoup de plantes que nous mangeons', f: ['elles mangent les moustiques', 'elles nettoient l\'eau'], e: 'En transportant le pollen, elles permettent aux fleurs de devenir des <strong>fruits</strong> : sans pollinisateurs, beaucoup de fruits et légumes disparaîtraient.', n: 1 },
  { q: 'Une espèce venue d\'ailleurs qui se répand et nuit aux espèces locales est dite…', r: 'invasive', f: ['éteinte', 'fossile'], e: 'Une espèce <strong>invasive</strong> (comme le frelon asiatique en France) prend la place des espèces locales.', n: 1 },
  { q: 'Les parcs nationaux et les réserves naturelles servent à…', r: 'protéger des milieux et leurs espèces', f: ['élever des animaux pour les manger', 'construire des usines'], e: 'Ce sont des espaces <strong>protégés</strong> où la nature est préservée.', n: 1 },
  { q: 'La pollution des rivières par des produits chimiques…', r: 'peut tuer les poissons et les plantes aquatiques', f: ['nourrit les poissons', 'n\'a aucun effet'], e: 'Les produits toxiques empoisonnent les êtres vivants du milieu, et toute la <strong>chaîne alimentaire</strong> est touchée.', n: 1 },
  { q: 'Les espèces vivantes d\'aujourd\'hui…', r: 'descendent d\'espèces plus anciennes', f: ['existent sans changer depuis toujours', 'sont toutes apparues en même temps'], e: 'C\'est l\'idée de l\'<strong>évolution</strong> : chaque espèce a des ancêtres, et les espèces ont une parenté entre elles.', n: 1 },
];
GEN.biodiv = genBanque(B_BIODIV, 'La biodiversité et l\'évolution');

/* ============================================================
   CM1 – CM2 : OBJETS TECHNIQUES, INFORMATIQUE ET PLANÈTE TERRE
   ============================================================ */
const B_ANALYSE = [
  { q: 'Un objet technique est fabriqué pour répondre à…', r: 'un besoin', f: ['une couleur', 'un hasard'], e: 'Tout objet technique répond à un <strong>besoin</strong> : se déplacer, s\'éclairer, conserver les aliments…' },
  { q: 'La fonction d\'usage d\'un réfrigérateur est…', r: 'conserver les aliments au froid', f: ['être joli dans la cuisine', 'faire de la lumière'], e: 'Sa <strong>fonction d\'usage</strong> : à quoi il sert. Ici, garder les aliments au frais.' },
  { q: 'La fonction d\'usage d\'un vélo est…', r: 'se déplacer', f: ['avoir une belle couleur', 'faire du bruit'], e: 'Le vélo sert à <strong>se déplacer</strong>.' },
  { q: 'On choisit une trousse parce qu\'elle a son héros préféré dessus. C\'est sa fonction…', r: 'd\'estime', f: ['d\'usage', 'technique'], e: 'La <strong>fonction d\'estime</strong>, c\'est ce qui fait qu\'on aime l\'objet : sa couleur, sa forme, sa marque, sa beauté.' },
  { q: 'La couleur et le design d\'un téléphone correspondent à sa fonction…', r: 'd\'estime', f: ['d\'usage', 'de sécurité'], e: 'Ce qui plaît, ce qui donne envie : c\'est la fonction d\'<strong>estime</strong>.' },
  { q: 'La fonction technique d\'un élément de l\'objet, c\'est…', r: 'le rôle de cette pièce dans l\'objet', f: ['le prix de l\'objet', 'sa couleur'], e: 'Par exemple, la <strong>fonction technique</strong> du frein du vélo : ralentir la roue. Celle de la chaîne : transmettre le mouvement.', n: 1 },
  { q: 'Dans une lampe de poche, la fonction technique de la pile est…', r: 'fournir l\'énergie électrique', f: ['éclairer', 'protéger les doigts'], e: 'La pile <strong>fournit</strong> l\'énergie ; l\'ampoule éclaire ; le boîtier protège.', n: 1 },
  { q: 'Un objet technique évolue au cours du temps parce que…', r: 'on l\'améliore avec de nouvelles techniques et de nouveaux matériaux', f: ['il se transforme tout seul', 'il ne change jamais'], e: 'Du téléphone à cadran au smartphone, de la bougie à la LED : les objets <strong>évoluent</strong> grâce aux inventions.', n: 1 },
  { q: 'Pour comprendre comment fonctionne un objet technique, on peut…', r: 'le démonter et observer le rôle de chaque pièce', f: ['le peindre', 'le regarder de loin'], e: 'On <strong>observe</strong> chaque élément et on cherche sa fonction technique : c\'est analyser l\'objet.', n: 1 },
  { q: 'La fonction d\'usage d\'une montre est…', r: 'indiquer l\'heure', f: ['être en or', 'faire tic-tac'], e: 'Sa fonction d\'<strong>usage</strong> : donner l\'heure. Être en or, c\'est sa fonction d\'estime.' },
  { q: 'La fonction d\'usage d\'une gourde est…', r: 'transporter de l\'eau pour boire', f: ['avoir de jolies couleurs', 'faire de la lumière'], e: 'Sa fonction d\'<strong>usage</strong> : contenir et transporter une boisson.' },
  { q: 'Dans un vélo, la fonction technique du frein est…', r: 'ralentir et arrêter la roue', f: ['faire avancer le vélo', 'éclairer la route'], e: 'Chaque pièce a sa <strong>fonction technique</strong> : le frein ralentit la roue.', n: 1 },
  { q: 'Un parapluie de couleur vive qu\'on achète parce qu\'il est beau : c\'est sa fonction…', r: 'd\'estime', f: ['d\'usage', 'technique'], e: 'La beauté, la couleur, la mode : fonction d\'<strong>estime</strong>. La fonction d\'usage reste de protéger de la pluie.', n: 1 },
];
GEN.analyse = genBanque(B_ANALYSE, 'Analyser un objet technique');

const B_ALGO = [
  { q: 'Un <strong>algorithme</strong>, c\'est…', r: 'une suite d\'instructions pour faire une tâche', f: ['un ordinateur', 'un jeu vidéo'], e: 'Un <strong>algorithme</strong> est une suite ordonnée d\'instructions. Une recette de cuisine en est un !' },
  { q: 'Scratch est…', r: 'un logiciel pour programmer avec des blocs', f: ['un jeu de cartes', 'un moteur de recherche'], e: 'Dans <strong>Scratch</strong>, on assemble des blocs d\'instructions pour faire bouger des lutins.' },
  { q: 'Dans un programme, l\'ordre des instructions…', r: 'est important', f: ['n\'a aucune importance'], e: '« Avancer puis tourner » ne donne pas le même résultat que « tourner puis avancer » : l\'<strong>ordre</strong> compte.' },
  { q: 'Pour répéter plusieurs fois les mêmes instructions, on utilise…', r: 'une boucle « répéter »', f: ['un interrupteur', 'une souris'], e: 'La boucle <strong>« répéter … fois »</strong> évite d\'écrire plusieurs fois les mêmes blocs.', n: 1 },
  { q: 'Pour tracer un carré, le lutin peut faire :', r: 'répéter 4 fois : avancer, tourner d\'un quart de tour', f: ['répéter 3 fois : avancer, tourner d\'un quart de tour', 'avancer 4 fois sans tourner'], e: 'Un carré a 4 côtés égaux et 4 angles droits : on <strong>répète 4 fois</strong> « avancer, tourner de 90° ».', n: 1 },
  { q: 'Un « bug », c\'est…', r: 'une erreur dans un programme', f: ['un ordinateur neuf', 'une instruction qui marche'], e: 'Un <strong>bug</strong> est une erreur. On le cherche et on le corrige : c\'est « déboguer ».', n: 1 },
];
GEN.algo = genMixte(B_ALGO, 'Algorithmes et programmation', fabProg, 0.6);

const B_TERRE2 = [
  { q: 'La Terre tourne sur elle-même : c\'est la…', r: 'rotation', f: ['révolution', 'gravitation'], e: 'La <strong>rotation</strong> de la Terre sur elle-même dure 24 heures : elle explique le jour et la nuit.' },
  { q: 'La Terre tourne autour du Soleil : c\'est la…', r: 'révolution', f: ['rotation', 'germination'], e: 'La <strong>révolution</strong> autour du Soleil dure un an (365 jours et un quart).' },
  { q: 'Les saisons existent parce que…', r: 'l\'axe de la Terre est penché', f: ['la Terre s\'éloigne beaucoup du Soleil en hiver', 'la Lune cache le Soleil'], e: 'L\'axe de la Terre est <strong>incliné</strong> : en été, notre moitié de la Terre reçoit les rayons du Soleil plus directement et plus longtemps. (La distance au Soleil n\'y est presque pour rien.)', n: 1 },
  { q: 'Quand c\'est l\'été en France, en Australie c\'est…', r: 'l\'hiver', f: ['l\'été aussi', 'le printemps'], e: 'Les deux moitiés de la Terre (hémisphères) ont des saisons <strong>inversées</strong> : Noël est en plein été en Australie !', n: 1 },
  { q: 'Un volcan rejette…', r: 'de la lave, des cendres et des gaz', f: ['de l\'eau douce', 'du sable de plage'], e: 'La roche fondue (le <strong>magma</strong>) monte des profondeurs et sort en <strong>lave</strong>, avec des cendres et des gaz.' },
  { q: 'Un tremblement de terre s\'appelle aussi…', r: 'un séisme', f: ['une éruption', 'une marée'], e: 'Un <strong>séisme</strong> : le sol tremble parce que des roches cassent et glissent en profondeur.' },
  { q: 'La lave est…', r: 'de la roche fondue', f: ['de l\'eau très chaude', 'du feu'], e: 'La <strong>lave</strong> est de la roche fondue, à plus de 1 000 °C. En refroidissant, elle redevient une roche dure.' },
  { q: 'Pendant un séisme, à l\'école, il faut…', r: 'se protéger sous une table, loin des fenêtres', f: ['courir dans l\'escalier', 'sortir sous les balcons'], e: 'On se met <strong>sous une table solide</strong>, loin des vitres, et on attend la fin des secousses.', n: 1 },
  { q: 'L\'enveloppe rigide de la Terre est découpée en…', r: 'plaques', f: ['volcans', 'saisons'], e: 'La surface de la Terre est faite de grandes <strong>plaques</strong> qui bougent très lentement : c\'est surtout à leurs limites qu\'il y a des volcans et des séismes.', n: 1 },
  { q: 'Un séisme sous la mer peut provoquer…', r: 'un tsunami', f: ['une tornade', 'une éclipse'], e: 'Le fond de la mer bouge et soulève une énorme <strong>vague</strong> : le tsunami.', n: 1 },
  { q: 'Les volcans d\'Auvergne, en France…', r: 'sont éteints ou endormis depuis des milliers d\'années', f: ['crachent de la lave chaque année', 'n\'ont jamais existé'], e: 'La <strong>chaîne des Puys</strong> compte de nombreux volcans ; la dernière éruption date d\'environ 7 000 ans. Il y a en revanche des volcans actifs dans les territoires d\'outre-mer, comme le piton de la Fournaise à La Réunion.', n: 1 },
];
GEN.terre2 = genBanque(B_TERRE2, 'La Terre : mouvements, séismes et volcans');

const B_RECYCLE = [
  { q: 'Pour fabriquer une vitre, on choisit…', r: 'le verre, car il est transparent', f: ['le bois', 'le métal'], e: 'On choisit le matériau selon ses <strong>propriétés</strong> : pour voir à travers, il faut un matériau <strong>transparent</strong>.' },
  { q: 'Pour un câble électrique, on choisit du cuivre parce que…', r: 'il conduit bien le courant', f: ['il est joli', 'il est isolant'], e: 'Le cuivre est un très bon <strong>conducteur</strong> électrique.' },
  { q: 'Les bouteilles en verre se jettent…', r: 'dans le conteneur à verre', f: ['avec les épluchures', 'dans la nature'], e: 'Le verre se recycle <strong>à l\'infini</strong> : on le refond pour faire de nouvelles bouteilles.' },
  { q: 'Recycler, c\'est…', r: 'transformer un déchet en nouvelle matière première', f: ['jeter un déchet dans la nature', 'brûler tous les déchets'], e: 'Avec des bouteilles en plastique recyclées, on fabrique par exemple des fibres pour des pulls polaires.' },
  { q: 'Une canette en aluminium…', r: 'se recycle et peut redevenir une canette', f: ['ne se recycle pas', 'se décompose en un mois'], e: 'L\'aluminium se <strong>recycle</strong> très bien, en économisant beaucoup d\'énergie par rapport à l\'aluminium neuf.' },
  { q: 'Le meilleur déchet est…', r: 'celui qu\'on ne produit pas', f: ['celui qu\'on brûle', 'celui qu\'on enterre'], e: 'Avant de recycler, on peut <strong>réduire</strong> (moins d\'emballages) et <strong>réutiliser</strong> (gourde plutôt que bouteilles jetables).', n: 1 },
  { q: 'Les piles usagées…', r: 'se rapportent dans un point de collecte', f: ['se jettent à la poubelle ordinaire', 'se mettent au compost'], e: 'Les piles contiennent des métaux <strong>polluants</strong> : on les dépose dans les bacs de collecte (magasins, déchetterie).', n: 1 },
  { q: 'Pour une gourde réutilisable, l\'acier inoxydable est un bon choix parce qu\'il…', r: 'est solide, ne rouille pas et dure longtemps', f: ['est jetable', 'fond au soleil'], e: 'Solide, durable, lavable : le choix d\'un matériau tient compte de ses propriétés et de son <strong>impact sur l\'environnement</strong>.', n: 1 },
  { q: 'Fabriquer un objet en plastique neuf utilise…', r: 'du pétrole, une ressource qui s\'épuise', f: ['seulement de l\'eau', 'du sable'], e: 'Le plastique vient du <strong>pétrole</strong> : en le recyclant, on économise cette ressource.', n: 1 },
  { q: 'Le papier recyclé permet…', r: 'de couper moins d\'arbres', f: ['d\'utiliser plus de pétrole', 'de fabriquer du verre'], e: 'Recycler le papier, c\'est économiser du <strong>bois</strong>, de l\'eau et de l\'énergie.', n: 1 },
  { q: 'Pour une casserole, on choisit un métal parce qu\'il…', r: 'résiste à la chaleur et la conduit bien', f: ['est transparent', 'est isolant électrique'], e: 'La casserole doit chauffer les aliments : le métal <strong>conduit la chaleur</strong> et ne fond pas sur le feu.' },
  { q: 'Les emballages en carton se jettent…', r: 'dans la poubelle de tri (recyclage)', f: ['dans le conteneur à verre', 'dans la nature'], e: 'Le carton se <strong>recycle</strong> en nouveau carton ou papier.' },
];
GEN.recycle = genBanque(B_RECYCLE, 'Choisir un matériau, recycler');

const B_RESEAU = [
  { q: 'Plusieurs ordinateurs reliés entre eux forment…', r: 'un réseau', f: ['un algorithme', 'un circuit électrique'], e: 'Des appareils reliés qui échangent des informations forment un <strong>réseau</strong>.' },
  { q: 'Internet, c\'est…', r: 'un immense réseau qui relie des réseaux du monde entier', f: ['un seul gros ordinateur', 'un logiciel de dessin'], e: '<strong>Internet</strong> relie des milliards d\'appareils, dans le monde entier.' },
  { q: 'À la maison, la « box » sert à…', r: 'relier les appareils de la maison à Internet', f: ['recharger les piles', 'imprimer'], e: 'La <strong>box</strong> relie le réseau local de la maison (ordinateurs, téléphones) au réseau Internet.' },
  { q: 'Le Wi-Fi permet de se connecter…', r: 'sans fil, par des ondes radio', f: ['seulement avec un câble', 'avec de la lumière visible'], e: 'Le <strong>Wi-Fi</strong> utilise des ondes radio : pas besoin de câble.' },
  { q: 'Un réseau local, c\'est par exemple…', r: 'les ordinateurs d\'une école reliés entre eux', f: ['tous les ordinateurs du monde', 'une seule tablette'], e: 'Un <strong>réseau local</strong> relie les appareils d\'un même lieu (maison, école).', n: 1 },
  { q: 'Un serveur est…', r: 'un ordinateur qui fournit des services aux autres', f: ['un câble', 'un clavier'], e: 'Le <strong>serveur</strong> stocke des fichiers, des sites ou des messages et les envoie aux ordinateurs qui les demandent.', n: 1 },
  { q: 'Pour envoyer un message sur Internet, celui-ci est découpé en…', r: 'petits paquets', f: ['lettres de l\'alphabet séparées', 'images'], e: 'Les données voyagent en <strong>paquets</strong>, qui peuvent prendre des chemins différents et sont rassemblés à l\'arrivée.', n: 1 },
  { q: 'Le matériel qui oriente les informations entre les réseaux s\'appelle…', r: 'un routeur', f: ['une imprimante', 'une souris'], e: 'Le <strong>routeur</strong> envoie chaque paquet dans la bonne direction, comme un aiguilleur. La box de la maison en contient un.', n: 1 },
  { q: 'Pourquoi ne pas publier sa photo et son adresse sur Internet ?', r: 'parce qu\'elles peuvent être vues et copiées par n\'importe qui', f: ['parce qu\'Internet les efface tout de suite', 'il n\'y a aucun risque'], e: 'Ce qui est publié peut être <strong>copié et partagé</strong> sans qu\'on le sache, et très difficile à effacer.', n: 1 },
  { q: 'Un câble réseau (Ethernet) sert à…', r: 'relier un ordinateur au réseau par un fil', f: ['recharger la souris', 'imprimer des photos'], e: 'Le câble <strong>Ethernet</strong> relie un appareil à la box ou au réseau : la liaison est stable et rapide.' },
  { q: 'Une adresse de site Internet sécurisé commence par…', r: 'https://', f: ['@', 'www.fr'], e: 'Le <strong>https</strong> indique que la connexion au site est sécurisée (le petit cadenas dans la barre d\'adresse).', n: 1 },
  { q: 'Un courriel (e-mail) passe…', r: 'par des serveurs de messagerie avant d\'arriver', f: ['directement d\'un écran à l\'autre', 'par la poste'], e: 'Le message est déposé sur un <strong>serveur</strong> de messagerie, qui le transmet au serveur du destinataire.', n: 1 },
  { q: 'Le « cloud » (le nuage), ce sont…', r: 'des fichiers stockés sur des serveurs, loin de chez soi', f: ['des données cachées dans les nuages du ciel', 'des fichiers sur une clé USB'], e: 'Le <strong>cloud</strong> : nos photos ou documents sont gardés sur des serveurs, dans de grands centres de données.', n: 1 },
  { q: 'Pour aller sur Internet, il faut…', r: 'être connecté à un réseau relié à Internet', f: ['avoir seulement un clavier', 'une imprimante'], e: 'L\'appareil doit être relié à un <strong>réseau</strong> (Wi-Fi, câble ou réseau mobile) connecté à Internet.' },
];
GEN.reseau = genBanque(B_RESEAU, 'Les réseaux informatiques');

const B_CLIMAT = [
  { q: 'L\'eau douce, le pétrole, les forêts sont…', r: 'des ressources naturelles', f: ['des déchets', 'des objets techniques'], e: 'Ce que la nature nous fournit et que nous utilisons : les <strong>ressources naturelles</strong>. Certaines s\'épuisent.' },
  { q: 'Pour économiser l\'eau, on peut…', r: 'prendre une douche plutôt qu\'un bain', f: ['laisser couler le robinet en se brossant les dents', 'arroser en plein soleil'], e: 'Une douche rapide consomme bien moins d\'eau qu\'un bain : l\'eau douce est une <strong>ressource précieuse</strong>.' },
  { q: 'Le climat de la Terre se réchauffe surtout à cause…', r: 'des gaz rejetés par les activités humaines', f: ['de la Lune', 'des volcans éteints'], e: 'Brûler du pétrole, du charbon et du gaz rejette du <strong>dioxyde de carbone</strong> : il renforce l\'effet de serre et réchauffe la planète.' },
  { q: 'Une conséquence du réchauffement climatique est…', r: 'la fonte des glaciers', f: ['des hivers toujours plus froids partout', 'la disparition des océans'], e: 'Les <strong>glaciers fondent</strong>, le niveau de la mer monte, les canicules et les sécheresses sont plus fréquentes.' },
  { q: 'Un moyen de transport qui rejette peu de dioxyde de carbone :', r: 'le vélo', f: ['l\'avion', 'la voiture seule pour 1 km'], e: 'Le <strong>vélo</strong> et la marche ne rejettent rien ; le train et le bus beaucoup moins que la voiture ou l\'avion.' },
  { q: 'Les inondations, les tempêtes, les séismes sont des…', r: 'risques naturels', f: ['ressources naturelles', 'énergies renouvelables'], e: 'Ce sont des <strong>risques naturels</strong>. On ne peut pas les empêcher, mais on peut les prévoir et s\'en protéger.', n: 1 },
  { q: 'Pour réduire le risque d\'inondation, on évite…', r: 'de construire des maisons au bord des rivières qui débordent', f: ['de planter des arbres', 'de nettoyer les fossés'], e: 'Des cartes indiquent les <strong>zones inondables</strong> : on n\'y construit pas, ou on adapte les bâtiments.', n: 1 },
  { q: 'L\'effet de serre, c\'est…', r: 'des gaz de l\'atmosphère qui retiennent la chaleur de la Terre', f: ['une serre de jardin géante', 'un trou dans le Soleil'], e: 'Sans effet de serre, il ferait −18 °C sur Terre ! Mais trop de gaz à effet de serre <strong>réchauffe</strong> la planète.', n: 1 },
  { q: 'Les prévisions de Météo-France servent à…', r: 'prévenir des orages, tempêtes ou canicules', f: ['empêcher la pluie', 'changer le climat'], e: 'Les <strong>vigilances</strong> météo (jaune, orange, rouge) permettent de se protéger à temps.', n: 1 },
  { q: 'La météo, c\'est le temps qu\'il fait…', r: 'un jour donné, à un endroit', f: ['en moyenne sur 30 ans', 'sur toute la planète pour toujours'], e: '<strong>Météo</strong> : le temps d\'un jour précis. <strong>Climat</strong> : le temps habituel d\'une région, en moyenne sur une trentaine d\'années.', n: 1 },
  { q: 'Les arbres aident à lutter contre le réchauffement parce qu\'ils…', r: 'absorbent du dioxyde de carbone', f: ['rejettent du pétrole', 'chauffent l\'air'], e: 'Pour fabriquer leur matière, les arbres <strong>absorbent du dioxyde de carbone</strong> : les forêts sont des puits de carbone.' },
  { q: 'Une canicule, c\'est…', r: 'une période de très fortes chaleurs, jour et nuit', f: ['une tempête de neige', 'une petite pluie'], e: 'Pendant une <strong>canicule</strong>, on boit souvent, on reste au frais et on veille sur les personnes âgées.' },
];
GEN.climat = genBanque(B_CLIMAT, 'Ressources, risques et climat');

/* ============================================================
   6e – 5e : QUESTIONS FABRIQUÉES À CHAQUE PARTIE
   conversions de masse et de volume, vitesse moyenne, circuits à deux lampes,
   grossissement du microscope, fréquence cardiaque, petits programmes (boucles et conditions)
   ============================================================ */
function fabMasse(p) {
  const notion = 'Masse et volume';
  const C = pick(p < 0.5 ? [
    () => { const x = rnd(2, 9) * pick([100, 250, 500]); return [`${fmtN(x)} g = … kg`, x / 1000, 'kg', `1 kg = 1 000 g : on divise par 1 000. ${fmtN(x)} g = <strong>${fmtN(x / 1000)} kg</strong>.`]; },
    () => { const x = pick([1, 2, 3, 1.5, 2.5, 0.5]); return [`${fmtN(x)} kg = … g`, x * 1000, 'g', `1 kg = 1 000 g : on multiplie par 1 000. <strong>${fmtN(x * 1000)} g</strong>.`]; },
    () => { const x = pick([1, 2, 1.5, 0.5, 0.25, 0.75]); return [`${fmtN(x)} L = … mL`, x * 1000, 'mL', `1 L = 1 000 mL. ${fmtN(x)} L = <strong>${fmtN(x * 1000)} mL</strong>.`]; },
    () => { const x = rnd(1, 9) * 50; return [`${fmtN(x)} mL = … cL`, x / 10, 'cL', `1 cL = 10 mL : on divise par 10. <strong>${fmtN(x / 10)} cL</strong>.`]; },
  ] : [
    () => { const x = rnd(1, 9) * 25; return [`${fmtN(x)} cm³ = … mL`, x, 'mL', `1 cm³ = <strong>1 mL</strong> : un petit cube de 1 cm de côté contient exactement 1 millilitre. Donc ${fmtN(x)} cm³ = <strong>${fmtN(x)} mL</strong>.`]; },
    () => { const x = pick([1, 2, 5, 1.5, 0.5]); return [`${fmtN(x)} dm³ = … L`, x, 'L', `1 dm³ = <strong>1 L</strong>. Donc ${fmtN(x)} dm³ = <strong>${fmtN(x)} L</strong>.`]; },
    () => { const x = rnd(2, 9) * 100; return [`${fmtN(x)} mg = … g`, x / 1000, 'g', `1 g = 1 000 mg : on divise par 1 000. <strong>${fmtN(x / 1000)} g</strong>.`]; },
    () => { const v1 = rnd(20, 45), v2 = v1 + rnd(5, 30); return [`On verse de l'eau dans une éprouvette jusqu'à <strong>${v1} mL</strong>, puis on plonge un caillou : l'eau monte à <strong>${v2} mL</strong>. Volume du caillou (en mL) ?`, v2 - v1, 'mL', `Le caillou prend la place de l'eau qu'il fait monter : ${v2} − ${v1} = <strong>${v2 - v1} mL</strong>, soit ${v2 - v1} cm³. C'est la mesure du volume par <strong>déplacement d'eau</strong>.`]; },
    () => { const m1 = rnd(100, 300), m2 = rnd(20, 90); return [`Un bécher vide pèse <strong>${m1} g</strong>. Rempli d'eau, il pèse <strong>${m1 + m2} g</strong>. Quelle est la masse de l'eau (en g) ?`, m2, 'g', `On enlève la masse du récipient : ${m1 + m2} − ${m1} = <strong>${m2} g</strong>. (On peut aussi « tarer » la balance avec le bécher vide.)`]; },
  ])();
  const [q, r, u, e] = C;
  const phrase = q.includes('…') ? `Convertis :<br><strong>${q.replace('…', '<span class="mm-trou">…</span>')}</strong>` : q;
  return { enonce: phrase, saisie: { type: 'nombre', bonne: r, unite: u }, rep: `${fmtN(r)} ${u}`, notion, explication: e };
}

function fabVitesse(p) {
  const notion = 'La vitesse moyenne';
  const type = pick(p < 0.5 ? [0, 0, 1] : [0, 1, 2, 3]);
  if (type === 0) {
    const T = pick([1, 2, 3, 4, 0.5]), v = pick([4, 5, 12, 15, 20, 30, 60, 80, 90]), d = v * T;
    return { enonce: `<span class="mm-pb">Un cycliste parcourt <strong>${fmtN(d)} km</strong> en <strong>${T === 0.5 ? '30 min' : `${T} h`}</strong>. Quelle est sa vitesse moyenne (en km/h) ?</span>`, saisie: { type: 'nombre', bonne: v, unite: 'km/h' }, rep: `${v} kilomètres heure`, notion,
      explication: `v = <strong>d ÷ t</strong> = ${fmtN(d)} km ÷ ${fmtN(T)} h = <strong>${v} km/h</strong>.${T === 0.5 ? ' 30 min, c\'est 0,5 h.' : ''}` };
  }
  if (type === 1) {
    const t = rnd(5, 20), v = rnd(2, 9), d = v * t;
    return { enonce: `<span class="mm-pb">Un élève court <strong>${d} m</strong> en <strong>${t} s</strong>. Quelle est sa vitesse moyenne (en m/s) ?</span>`, saisie: { type: 'nombre', bonne: v, unite: 'm/s' }, rep: `${v} mètres par seconde`, notion,
      explication: `v = d ÷ t = ${d} m ÷ ${t} s = <strong>${v} m/s</strong> : il parcourt ${v} mètres chaque seconde.` };
  }
  if (type === 2) {
    const v = pick([50, 60, 80, 90, 100, 120]), t = pick([2, 3, 1.5, 0.5, 2.5]), d = v * t;
    return { enonce: `<span class="mm-pb">Un train roule à <strong>${v} km/h</strong> pendant <strong>${fmtN(t)} h</strong>. Quelle distance parcourt-il (en km) ?</span>`, saisie: { type: 'nombre', bonne: d, unite: 'km' }, rep: `${fmtN(d)} kilomètres`, notion,
      explication: `d = <strong>v × t</strong> = ${v} × ${fmtN(t)} = <strong>${fmtN(d)} km</strong>.` };
  }
  const v = pick([4, 5, 10, 20, 50, 60, 80]), t = rnd(2, 6), d = v * t;
  return { enonce: `<span class="mm-pb">Combien de temps (en heures) faut-il pour parcourir <strong>${d} km</strong> à <strong>${v} km/h</strong> ?</span>`, saisie: { type: 'nombre', bonne: t, unite: 'h' }, rep: `${t} heures`, notion,
    explication: `t = <strong>d ÷ v</strong> = ${d} ÷ ${v} = <strong>${t} h</strong>.` };
}

/* Circuit à deux lampes, en série ou en dérivation ; une lampe peut être dévissée */
function figDeuxLampes(montage, devissee) {
  let s = '';
  const lampe = (x, y, allume, vide) => {
    if (vide) return `<circle cx="${x}" cy="${y}" r="18" fill="none" stroke="${CRAIE}" stroke-width="2" stroke-dasharray="4 4"/>` + txt(x, y + 34, 'dévissée', { taille: 12, c: ROSE });
    let t = allume ? [0, 60, 120, 180, 240, 300].map((a) => { const r = a * Math.PI / 180; return ligne(x + 23 * Math.cos(r), y + 23 * Math.sin(r), x + 31 * Math.cos(r), y + 31 * Math.sin(r), JAUNE, 2.5); }).join('') : '';
    return t + `<circle cx="${x}" cy="${y}" r="18" fill="${allume ? JAUNE : '#22352b'}" fill-opacity="${allume ? 0.55 : 1}" stroke="${CRAIE}" stroke-width="3"/>` + ligne(x - 12, y - 12, x + 12, y + 12, CRAIE, 2) + ligne(x + 12, y - 12, x - 12, y + 12, CRAIE, 2);
  };
  const pile = ligne(42, 120, 78, 120, CRAIE, 4) + ligne(50, 140, 70, 140, CRAIE, 8) + txt(30, 116, '+', { taille: 15, gras: true }) + txt(30, 146, '−', { taille: 15, gras: true });
  if (montage === 'serie') {
    const allume = !devissee;
    s += pile + ligne(60, 120, 60, 50) + ligne(60, 160, 60, 140) + ligne(60, 50, 132, 50) + ligne(168, 50, 232, 50) + ligne(268, 50, 320, 50) + ligne(320, 50, 320, 210) + ligne(320, 210, 60, 210) + ligne(60, 210, 60, 160);
    s += lampe(150, 50, allume, devissee === 1) + lampe(250, 50, allume, devissee === 2);
    s += txt(150, 18, 'L1', { taille: 14, gras: true, c: JAUNE }) + txt(250, 18, 'L2', { taille: 14, gras: true, c: JAUNE });
  } else {
    s += pile + ligne(60, 120, 60, 50) + ligne(60, 140, 60, 210) + ligne(60, 50, 300, 50) + ligne(60, 210, 300, 210);
    s += ligne(200, 50, 200, 82) + ligne(200, 118, 200, 210) + ligne(300, 50, 300, 82) + ligne(300, 118, 300, 210);
    s += `<circle cx="200" cy="50" r="4" fill="${CRAIE}"/><circle cx="200" cy="210" r="4" fill="${CRAIE}"/>`;
    s += lampe(200, 100, devissee !== 1, devissee === 1) + lampe(300, 100, devissee !== 2, devissee === 2);
    s += txt(152, 100, 'L1', { taille: 14, gras: true, c: JAUNE }) + txt(350, 100, 'L2', { taille: 14, gras: true, c: JAUNE });
  }
  return svgArdoise(380, 240, s, montage === 'serie' ? 'Deux lampes branchées l\'une après l\'autre' : 'Deux lampes branchées chacune sur sa propre boucle');
}
function fabDeuxLampes(p) {
  const notion = 'Circuits en série et en dérivation';
  const montage = pick(['serie', 'derivation']);
  if (p < 0.4 || Math.random() < 0.35) {
    const b = montage === 'serie' ? 'en série' : 'en dérivation';
    return { enonce: 'Comment les deux lampes sont-elles branchées ?', figure: figDeuxLampes(montage, 0), choix: ['en série', 'en dérivation'].map((v) => ({ v, html: capitalize(v) })), bonne: b, rep: b, notion,
      explication: montage === 'serie' ? 'Les lampes sont l\'une <strong>après</strong> l\'autre, sur une <strong>seule boucle</strong> : le montage est <strong>en série</strong>.' : 'Chaque lampe est sur sa <strong>propre boucle</strong> avec la pile (les fils se séparent en deux branches) : le montage est <strong>en dérivation</strong>.' };
  }
  const dev = pick([1, 2]), autre = dev === 1 ? 2 : 1, brille = montage === 'derivation';
  return { enonce: `On <strong>dévisse</strong> la lampe L${dev}. La lampe <strong>L${autre}</strong> brille-t-elle encore ?`, figure: figDeuxLampes(montage, 0), figureCorrection: figDeuxLampes(montage, dev), choix: [{ v: 'oui', html: 'Oui, elle brille' }, { v: 'non', html: 'Non, elle s\'éteint' }], bonne: brille ? 'oui' : 'non', rep: brille ? 'oui, elle brille encore' : 'non, elle s\'éteint', notion,
    explication: montage === 'serie' ? 'En <strong>série</strong>, il n\'y a qu\'une boucle : dévisser une lampe <strong>ouvre</strong> tout le circuit, et l\'autre s\'éteint (comme une vieille guirlande de Noël).' : 'En <strong>dérivation</strong>, chaque lampe a sa propre boucle avec la pile : l\'autre boucle reste fermée, la lampe <strong>brille encore</strong>. C\'est ainsi que sont branchées les prises et les lampes d\'une maison.' };
}

function fabMicroscope() {
  const oc = pick([10, 15]), ob = pick([4, 10, 40]);
  return { enonce: `Un microscope a un oculaire <strong>×${oc}</strong> et un objectif <strong>×${ob}</strong>. Quel est son grossissement total ?`, saisie: { type: 'nombre', bonne: oc * ob, unite: 'fois' }, rep: `${oc * ob} fois`, notion: 'La cellule',
    voix: `Un microscope a un oculaire qui grossit ${oc} fois et un objectif qui grossit ${ob} fois. Quel est son grossissement total ?`,
    explication: `On <strong>multiplie</strong> les deux grossissements : ${oc} × ${ob} = <strong>${oc * ob}</strong>. L'objet paraît ${oc * ob} fois plus grand.` };
}

function fabPouls(p) {
  const notion = 'Le corps humain et l\'effort';
  const duree = pick([15, 20, 30]), f = pick(p < 0.5 ? [60, 72, 80, 84, 90] : [120, 132, 140, 150, 160]), n = (f * duree) / 60;
  if (!Number.isInteger(n)) return fabPouls(p);
  return { enonce: `${p < 0.5 ? 'Au repos' : 'Après une course'}, Inès compte <strong>${n} battements</strong> de cœur en <strong>${duree} secondes</strong>. Quelle est sa fréquence cardiaque, en battements par minute ?`, saisie: { type: 'nombre', bonne: f, unite: 'battements/min' }, rep: `${f} battements par minute`, notion,
    explication: `Une minute = 60 s = ${60 / duree} fois ${duree} s. ${n} × ${60 / duree} = <strong>${f} battements par minute</strong>. ${f > 100 ? 'Après l\'effort, le cœur bat plus vite pour apporter plus de dioxygène et de nutriments aux muscles.' : 'Au repos, le cœur d\'un enfant bat environ 70 à 100 fois par minute.'}` };
}

/* Petits programmes : boucles, variables et conditions (si … alors … sinon) */
function fabAlgo65(p) {
  const notion = 'Boucles et conditions';
  const type = pick(p < 0.5 ? [0, 1] : [0, 1, 2, 3]);
  const prog = (L) => `<ol class="mm-prog">${L.map((x) => `<li>${x}</li>`).join('')}</ol>`;
  if (type === 0) {
    const d = rnd(0, 5), k = rnd(3, 6), a = rnd(2, 5);
    return { enonce: `Que vaut <strong>score</strong> à la fin de ce programme ?${prog([`mettre score à ${d}`, `répéter <strong>${k} fois</strong> :<ul class="mm-boucle"><li>ajouter ${a} à score</li></ul>`])}`, saisie: { type: 'nombre', bonne: d + k * a }, rep: String(d + k * a), notion,
      voix: `Mettre score à ${d}. Répéter ${k} fois : ajouter ${a} à score. Que vaut score à la fin ?`,
      explication: `La boucle ajoute ${a} à chaque tour, ${k} fois : ${d} + ${k} × ${a} = <strong>${d + k * a}</strong>.` };
  }
  if (type === 1) {
    const x = rnd(1, 20), s = rnd(5, 15), op = pick(['&gt;', '&lt;']), vrai = op === '&gt;' ? x > s : x < s;
    const [m1, m2] = pick([['Bravo !', 'Essaie encore'], ['Allumer la lampe', 'Éteindre la lampe'], ['Ouvrir la porte', 'Fermer la porte']]);
    return { enonce: `La variable <strong>température</strong> vaut <strong>${x}</strong>. Que fait ce programme ?${prog([`si température ${op} ${s} alors :<ul class="mm-boucle"><li>${m1}</li></ul>sinon :<ul class="mm-boucle"><li>${m2}</li></ul>`])}`, choix: [m1, m2].map((v) => ({ v, html: v })), bonne: vrai ? m1 : m2, rep: vrai ? m1 : m2, notion,
      voix: `La température vaut ${x}. Si température ${op === '&gt;' ? 'plus grande que' : 'plus petite que'} ${s}, alors ${m1}, sinon ${m2}. Que fait le programme ?`,
      explication: `On teste la <strong>condition</strong> : ${x} ${op} ${s} est <strong>${vrai ? 'vrai' : 'faux'}</strong>. ${vrai ? 'On fait donc ce qui suit « alors »' : 'On fait donc ce qui suit « sinon »'} : <strong>${vrai ? m1 : m2}</strong>.` };
  }
  if (type === 2) {
    const k = rnd(3, 6), a = rnd(2, 4), seuil = rnd(5, 12);
    let n = 0, lampe = 0; for (let i = 0; i < k; i += 1) { n += a; if (n > seuil) lampe += 1; }
    return { enonce: `Combien de fois le programme dit-il « Bip » ?${prog(['mettre n à 0', `répéter <strong>${k} fois</strong> :<ul class="mm-boucle"><li>ajouter ${a} à n</li><li>si n &gt; ${seuil} alors dire « Bip »</li></ul>`])}`, saisie: { type: 'nombre', bonne: lampe }, rep: String(lampe), notion,
      voix: `Mettre n à 0. Répéter ${k} fois : ajouter ${a} à n, et si n est plus grand que ${seuil}, dire bip. Combien de fois le programme dit-il bip ?`,
      explication: `On suit les tours : n vaut ${Array.from({ length: k }, (_, i) => (i + 1) * a).join(', ')}. La condition n &gt; ${seuil} est vraie <strong>${lampe} fois</strong>.` };
  }
  const c = rnd(1, 3), dist = rnd(5, 40);
  const obst = dist < 10 * c;
  return { enonce: `Un robot aspirateur lit son <strong>capteur de distance</strong> : <strong>${dist} cm</strong>. Que fait-il ?${prog([`si distance &lt; ${10 * c} cm alors :<ul class="mm-boucle"><li>tourner</li></ul>sinon :<ul class="mm-boucle"><li>avancer</li></ul>`])}`, choix: ['tourner', 'avancer'].map((v) => ({ v, html: capitalize(v) })), bonne: obst ? 'tourner' : 'avancer', rep: obst ? 'tourner' : 'avancer', notion,
    voix: `Le capteur de distance du robot lit ${dist} centimètres. Si la distance est plus petite que ${10 * c} centimètres, il tourne, sinon il avance. Que fait-il ?`,
    explication: `${dist} &lt; ${10 * c} est <strong>${obst ? 'vrai' : 'faux'}</strong> : le robot <strong>${obst ? 'tourne' : 'avance'}</strong>. Le capteur <strong>acquiert</strong> l'information, le programme la <strong>traite</strong>, les moteurs (actionneurs) <strong>agissent</strong>.` };
}

/* ============================================================
   6e – 5e : MATIÈRE, MOUVEMENT, ÉNERGIE (physique-chimie)
   n: 0 = plutôt 6e, n: 1 = plutôt 5e
   ============================================================ */
const B_MASSE = [
  { q: 'La masse d\'un objet se mesure avec…', r: 'une balance', f: ['une éprouvette', 'un thermomètre'], e: 'La <strong>balance</strong> mesure la masse, en grammes (g) ou kilogrammes (kg).' },
  { q: 'Le volume d\'un liquide se mesure avec…', r: 'une éprouvette graduée', f: ['une balance', 'un dynamomètre'], e: 'L\'<strong>éprouvette graduée</strong> mesure un volume en millilitres (mL). On lit en bas du ménisque, les yeux à la hauteur du liquide.' },
  { q: 'L\'unité de masse du système international est…', r: 'le kilogramme', f: ['le litre', 'le mètre'], e: 'Le <strong>kilogramme</strong> (kg). On utilise aussi le gramme et la tonne.' },
  { q: 'Pour lire le volume dans une éprouvette, l\'œil doit être…', r: 'à la hauteur du bas du ménisque', f: ['au-dessus de l\'éprouvette', 'en dessous de l\'éprouvette'], e: 'La surface de l\'eau est un peu creusée (le <strong>ménisque</strong>) : on lit le bas de ce creux, l\'œil à sa hauteur.', n: 1 },
  { q: '1 L d\'eau a une masse d\'environ…', r: '1 kg', f: ['1 g', '10 kg'], e: '1 L d\'eau pèse environ <strong>1 kg</strong> (1 mL d\'eau pèse 1 g). Ce n\'est pas vrai pour tous les liquides : 1 L d\'huile pèse moins.', n: 1 },
  { q: '1 L d\'huile et 1 L d\'eau ont-ils la même masse ?', r: 'Non, l\'huile est plus légère', f: ['Oui, même volume donc même masse'], e: 'Même volume ne veut pas dire même masse : l\'huile est <strong>moins dense</strong> que l\'eau (c\'est pourquoi elle flotte).', n: 1 },
  { q: 'Masse et volume, est-ce la même chose ?', r: 'Non : la masse se mesure en kg, le volume en L ou en m³', f: ['Oui, ce sont deux mots pour la même chose'], e: 'La <strong>masse</strong> (kg) dit combien de matière il y a ; le <strong>volume</strong> (L, m³) dit quelle place elle occupe. Un kilo de plumes prend beaucoup plus de place qu\'un kilo de plomb !' },
];
GEN.masse = genMixte(B_MASSE, 'Masse et volume', fabMasse, 0.6);

const B_TRANSFO = [
  { q: 'Quand du bois brûle, il se forme des fumées et des cendres. C\'est…', r: 'une transformation chimique', f: ['un changement d\'état', 'un simple mélange'], e: 'De <strong>nouvelles substances</strong> apparaissent (cendres, gaz) : c\'est une transformation chimique. On ne peut pas refaire du bois avec les cendres.' },
  { q: 'Quand la glace fond, c\'est…', r: 'un changement d\'état, pas une transformation chimique', f: ['une transformation chimique'], e: 'La glace devient de l\'eau liquide : c\'est toujours de l\'<strong>eau</strong>. Aucune nouvelle substance : c\'est un changement d\'état.' },
  { q: 'Un clou laissé dehors se couvre de rouille. C\'est…', r: 'une transformation chimique', f: ['un changement d\'état', 'une dissolution'], e: 'Le fer réagit avec le dioxygène de l\'air et l\'eau : il se forme une <strong>nouvelle substance</strong>, la rouille.' },
  { q: 'Dissoudre du sucre dans l\'eau, c\'est…', r: 'un mélange, pas une transformation chimique', f: ['une transformation chimique'], e: 'Le sucre est toujours du sucre (l\'eau est sucrée, et en évaporant l\'eau on le récupère) : c\'est un <strong>mélange</strong>.' },
  { q: 'Un œuf qui cuit dans la poêle subit…', r: 'une transformation chimique', f: ['un changement d\'état', 'un mélange'], e: 'Le blanc devient blanc et dur : de nouvelles substances se forment et on ne peut pas revenir en arrière. C\'est une <strong>transformation chimique</strong>.' },
  { q: 'On verse du vinaigre sur du bicarbonate : ça mousse. Cela montre…', r: 'qu\'un gaz nouveau se forme : c\'est une transformation chimique', f: ['que le vinaigre bout', 'qu\'il ne se passe rien'], e: 'Les bulles sont un <strong>gaz nouveau</strong> (du dioxyde de carbone) : signe d\'une transformation chimique.' },
  { q: 'Lequel n\'est PAS un signe de transformation chimique ?', r: 'un glaçon qui fond', f: ['un gaz qui se dégage', 'un changement de couleur inattendu'], e: 'Un changement d\'état ne crée pas de nouvelle substance. Gaz qui se dégage, changement de couleur, chaleur, odeur : ce sont des <strong>indices</strong> de transformation chimique.', n: 1 },
  { q: 'Pour savoir si un mélange eau + sel est une transformation chimique, on peut…', r: 'évaporer l\'eau et vérifier qu\'on retrouve le sel', f: ['le goûter', 'le secouer'], e: 'Si on retrouve le sel intact, rien de nouveau ne s\'est formé : c\'était un <strong>mélange</strong>.', n: 1 },
  { q: 'Une bougie qui brûle consomme…', r: 'de la cire et le dioxygène de l\'air', f: ['seulement de la cire', 'de l\'eau'], e: 'Une combustion a besoin d\'un <strong>combustible</strong> (la cire) et d\'un <strong>comburant</strong> (le dioxygène). Sous un verre retourné, la bougie s\'éteint.', n: 1 },
  { q: 'Le lait qui tourne (il devient aigre et caillé) subit…', r: 'une transformation chimique', f: ['un changement d\'état'], e: 'Des bactéries transforment le sucre du lait en acide : une nouvelle substance apparaît, le lait <strong>caille</strong>.', n: 1 },
];
GEN.transfo = genBanque(B_TRANSFO, 'Les transformations chimiques');

const B_VITESSE = [
  { q: 'La formule de la vitesse moyenne est…', r: 'v = d ÷ t', f: ['v = d × t', 'v = t ÷ d'], e: '<strong>Vitesse = distance ÷ durée</strong>. Donc d = v × t et t = d ÷ v.' },
  { q: 'Une vitesse en km/h indique…', r: 'le nombre de km parcourus en une heure', f: ['le nombre d\'heures pour un km', 'la distance totale'], e: '90 km/h : en roulant ainsi pendant <strong>une heure</strong>, on parcourt 90 km.' },
  { q: 'Un objet qui va toujours à la même vitesse sur une ligne droite a un mouvement…', r: 'rectiligne uniforme', f: ['circulaire accéléré', 'rectiligne ralenti'], e: 'Ligne droite + vitesse constante : mouvement <strong>rectiligne uniforme</strong>.', n: 1 },
  { q: 'Une voiture qui démarre au feu vert a un mouvement…', r: 'accéléré', f: ['uniforme', 'ralenti'], e: 'Sa vitesse <strong>augmente</strong> : mouvement accéléré.', n: 1 },
  { q: 'La vitesse moyenne d\'un trajet tient compte…', r: 'de tout le trajet, arrêts compris', f: ['seulement de la vitesse la plus grande', 'seulement des moments sans arrêt'], e: 'On divise la distance totale par la durée <strong>totale</strong> : c\'est une moyenne, même si on a parfois roulé plus vite ou plus lentement.', n: 1 },
];
GEN.vitesse = genMixte(B_VITESSE, 'La vitesse moyenne', fabVitesse, 0.7);

const B_CIRC65 = [
  { q: 'Dans un circuit en série, si une lampe grille…', r: 'toutes les lampes s\'éteignent', f: ['les autres brillent encore', 'les autres brillent plus fort'], e: 'En <strong>série</strong>, il n\'y a qu\'une boucle : elle est coupée, plus rien ne fonctionne.' },
  { q: 'Les lampes et les prises d\'une maison sont branchées…', r: 'en dérivation', f: ['en série'], e: 'En <strong>dérivation</strong>, chaque appareil fonctionne même si on en éteint un autre.' },
  { q: 'Un appareil électrique qui fonctionne chauffe toujours un peu. Cette chaleur est…', r: 'de l\'énergie perdue (énergie thermique)', f: ['de l\'énergie créée', 'impossible'], e: 'L\'énergie ne disparaît pas et ne se crée pas : une partie devient de la <strong>chaleur</strong>, souvent inutile. On parle de pertes.', n: 1 },
  { q: 'L\'énergie peut-elle disparaître ?', r: 'Non, elle se transforme', f: ['Oui, elle s\'use'], e: 'L\'énergie se <strong>conserve</strong> : elle passe d\'une forme à une autre (électrique → lumière + chaleur), mais elle ne disparaît pas.', n: 1 },
  { q: 'Deux lampes en série, avec une seule pile, brillent…', r: 'moins fort qu\'une seule lampe', f: ['plus fort qu\'une seule lampe', 'exactement pareil'], e: 'En série, les lampes se <strong>partagent</strong> la tension de la pile : chacune brille moins.', n: 1 },
];
GEN.circuits65 = genMixte(B_CIRC65, 'Circuits en série et en dérivation', fabDeuxLampes, 0.7);

const B_PARTICULES = [
  { q: 'Selon le modèle particulaire, la matière est faite de…', r: 'minuscules particules (molécules)', f: ['un seul bloc continu', 'lumière'], e: 'Toute matière est formée de particules beaucoup trop petites pour être vues : les <strong>molécules</strong>.' },
  { q: 'Dans un solide, les particules sont…', r: 'serrées et ordonnées, elles vibrent sur place', f: ['éloignées et en désordre', 'immobiles et très espacées'], e: 'Serrées et rangées : c\'est pourquoi le solide a une <strong>forme propre</strong>.' },
  { q: 'Dans un liquide, les particules sont…', r: 'serrées mais en désordre, elles glissent les unes sur les autres', f: ['éloignées les unes des autres', 'rangées comme dans un solide'], e: 'Serrées mais mobiles : le liquide <strong>coule</strong> et prend la forme du récipient.' },
  { q: 'Dans un gaz, les particules sont…', r: 'très éloignées et en mouvement rapide', f: ['serrées et ordonnées', 'collées les unes aux autres'], e: 'Très espacées et très agitées : un gaz occupe <strong>tout l\'espace</strong> disponible et on peut le comprimer.' },
  { q: 'On peut comprimer un gaz parce que…', r: 'ses particules sont très éloignées', f: ['ses particules rapetissent', 'il disparaît'], e: 'Il y a beaucoup d\'<strong>espace vide</strong> entre les particules d\'un gaz : on peut les rapprocher.', n: 1 },
  { q: 'Lors d\'un changement d\'état, la masse…', r: 'se conserve', f: ['augmente', 'diminue'], e: 'Les particules ne disparaissent pas, elles se réorganisent : la <strong>masse se conserve</strong>. 100 g de glace donnent 100 g d\'eau.', n: 1 },
  { q: 'Quand l\'eau gèle, son volume augmente un peu, mais sa masse…', r: 'reste la même', f: ['augmente aussi', 'diminue'], e: 'Le volume change, la <strong>masse ne change pas</strong> : ce sont les mêmes particules, rangées autrement.', n: 1 },
  { q: 'On fait fondre 250 g de glace. Masse de l\'eau obtenue (en g) ?', r: 250, u: 'g', e: 'La masse se conserve : <strong>250 g</strong>.', n: 1 },
  { q: 'On dissout 20 g de sel dans 200 g d\'eau. Masse de l\'eau salée (en g) ?', r: 220, u: 'g', e: 'Lors d\'une dissolution, la masse se conserve : 200 + 20 = <strong>220 g</strong>.', n: 1 },
  { q: 'Une molécule d\'eau est formée…', r: 'de deux atomes d\'hydrogène et un atome d\'oxygène', f: ['d\'un seul atome', 'de trois atomes d\'oxygène'], e: 'H₂O : 2 atomes d\'<strong>hydrogène</strong> (H) et 1 atome d\'<strong>oxygène</strong> (O).', n: 1, v: 'Une molécule d\'eau, H 2 O, est formée…' },
];
GEN.particules = genBanque(B_PARTICULES, 'Le modèle particulaire');

const B_COURANT = [
  { q: 'Par convention, à l\'extérieur de la pile, le courant circule…', r: 'de la borne + vers la borne −', f: ['de la borne − vers la borne +', 'dans les deux sens à la fois'], e: 'Le sens <strong>conventionnel</strong> du courant : de la borne <strong>+</strong> vers la borne <strong>−</strong>, à l\'extérieur du générateur.' },
  { q: 'Une diode…', r: 'ne laisse passer le courant que dans un sens', f: ['laisse passer le courant dans les deux sens', 'produit de l\'électricité'], e: 'Une <strong>diode</strong> est comme un sens unique : branchée à l\'envers, elle bloque le courant.' },
  { q: 'On branche une DEL (diode électroluminescente) à l\'envers. Elle…', r: 'ne s\'allume pas', f: ['s\'allume quand même', 'brille plus fort'], e: 'La DEL est une diode : dans le mauvais sens, le courant ne passe pas, elle reste <strong>éteinte</strong>.' },
  { q: 'Lequel est un bon conducteur électrique ?', r: 'le cuivre', f: ['le plastique', 'le verre'], e: 'Les <strong>métaux</strong> (cuivre, fer, aluminium) sont conducteurs.' },
  { q: 'Lequel est un isolant électrique ?', r: 'le caoutchouc', f: ['l\'aluminium', 'le fer'], e: 'Le caoutchouc, le plastique, le verre, le bois sec sont des <strong>isolants</strong>.' },
  { q: 'Le corps humain est…', r: 'conducteur : c\'est pour cela que l\'électricité est dangereuse', f: ['parfaitement isolant'], e: 'Le corps contient de l\'eau salée : il <strong>conduit</strong> le courant. Le courant du secteur peut provoquer une électrocution.', n: 1 },
  { q: 'Un générateur, comme une pile, sert à…', r: 'faire circuler le courant dans le circuit', f: ['bloquer le courant', 'mesurer le courant'], e: 'Le <strong>générateur</strong> fournit l\'énergie électrique et fait circuler le courant.', n: 1 },
  { q: 'Le symbole normalisé d\'une lampe dans un schéma est…', r: 'un cercle avec une croix', f: ['un carré vide', 'deux traits parallèles'], e: 'Lampe : un <strong>cercle barré d\'une croix</strong>. Pile : deux traits parallèles, un long (+) et un court (−).', n: 1 },
  { q: 'Un court-circuit, c\'est quand…', r: 'le courant passe par un fil sans traverser l\'appareil', f: ['le circuit est ouvert', 'on éteint l\'interrupteur'], e: 'Le courant prend le chemin le plus facile : l\'appareil ne fonctionne plus, et le fil et la pile peuvent <strong>chauffer dangereusement</strong>.', n: 1 },
  { q: 'Le bois sec est…', r: 'isolant', f: ['conducteur'], e: 'Le bois sec ne laisse pas passer le courant : il est <strong>isolant</strong>. Mouillé, il devient un peu conducteur.' },
  { q: 'À l\'intérieur de la pile, le courant va…', r: 'de la borne − vers la borne +', f: ['de la borne + vers la borne −'], e: 'Le courant fait une <strong>boucle</strong> : du + vers le − à l\'extérieur, et du − vers le + à l\'intérieur de la pile.', n: 1 },
];
GEN.courant = genBanque(B_COURANT, 'Le courant électrique');

const B_LUMIERE = [
  { q: 'Lequel est une <strong>source primaire</strong> de lumière (qui produit sa propre lumière) ?', r: 'le Soleil', f: ['la Lune', 'un miroir'], e: 'Le Soleil, une flamme, une lampe allumée <strong>produisent</strong> de la lumière. La Lune ne fait que renvoyer celle du Soleil.' },
  { q: 'La Lune est…', r: 'un objet diffusant : elle renvoie la lumière du Soleil', f: ['une source primaire de lumière', 'une étoile'], e: 'La Lune est <strong>éclairée</strong> par le Soleil et renvoie (diffuse) sa lumière.' },
  { q: 'Dans un milieu transparent et homogène (l\'air), la lumière se propage…', r: 'en ligne droite', f: ['en zigzag', 'en cercle'], e: 'La lumière va <strong>en ligne droite</strong> : c\'est pourquoi on ne voit pas derrière un mur.' },
  { q: 'Une ombre se forme quand…', r: 'un objet opaque arrête la lumière', f: ['un objet transparent laisse passer la lumière', 'il fait nuit'], e: 'L\'objet <strong>opaque</strong> bloque la lumière : derrière lui, une zone n\'est pas éclairée, c\'est l\'ombre portée.' },
  { q: 'Pour voir un objet, il faut que…', r: 'de la lumière venant de l\'objet entre dans notre œil', f: ['notre œil envoie de la lumière vers l\'objet', 'l\'objet soit chaud'], e: 'L\'œil <strong>reçoit</strong> la lumière : il n\'en envoie pas. Dans le noir complet, on ne voit rien.' },
  { q: 'On approche une lampe d\'un objet. Son ombre sur le mur…', r: 'devient plus grande', f: ['devient plus petite', 'ne change pas'], e: 'Plus la source est proche de l\'objet, plus l\'objet cache de lumière : l\'ombre <strong>grandit</strong>.', n: 1 },
  { q: 'Une éclipse de Soleil se produit quand…', r: 'la Lune passe entre le Soleil et la Terre', f: ['la Terre passe entre le Soleil et la Lune', 'le Soleil s\'éteint'], e: 'L\'<strong>ombre de la Lune</strong> tombe sur la Terre : en plein jour, le ciel s\'assombrit. Ne jamais regarder le Soleil sans lunettes spéciales !', n: 1 },
  { q: 'Une éclipse de Lune se produit quand…', r: 'la Terre passe entre le Soleil et la Lune', f: ['la Lune passe entre le Soleil et la Terre', 'un nuage cache la Lune'], e: 'La Lune entre dans l\'<strong>ombre de la Terre</strong> : elle devient sombre et rougeâtre.', n: 1 },
  { q: 'La lumière du Soleil met environ combien de minutes pour arriver jusqu\'à la Terre ?', r: 8, u: 'min', e: 'Environ <strong>8 minutes</strong> : la lumière va à 300 000 km par seconde, et le Soleil est à 150 millions de km.', n: 1 },
  { q: 'Les phases de la Lune (croissant, pleine lune…) s\'expliquent parce que…', r: 'on voit une partie plus ou moins grande de sa face éclairée', f: ['l\'ombre de la Terre la cache chaque soir', 'la Lune change de forme'], e: 'La Lune est toujours à moitié éclairée par le Soleil ; selon sa position autour de la Terre, nous voyons une <strong>part plus ou moins grande</strong> de cette moitié éclairée.', n: 1 },
];
GEN.lumiere = genBanque(B_LUMIERE, 'La lumière');

/* ============================================================
   6e – 5e : LE VIVANT (sciences de la vie et de la Terre)
   ============================================================ */
const B_CELLULE = [
  { q: 'Tous les êtres vivants sont formés de…', r: 'cellules', f: ['atomes seulement, sans cellules', 'cristaux'], e: 'La <strong>cellule</strong> est l\'unité du vivant : tout être vivant est fait d\'une ou de plusieurs cellules.' },
  { q: 'Pour observer des cellules, on utilise…', r: 'un microscope', f: ['des jumelles', 'une loupe de cuisine'], e: 'Les cellules sont trop petites pour l\'œil nu : il faut un <strong>microscope</strong>.' },
  { q: 'La partie de la cellule qui contient l\'information génétique est…', r: 'le noyau', f: ['la membrane', 'le cytoplasme'], e: 'Le <strong>noyau</strong> contient l\'ADN, le « plan de construction » de l\'être vivant.' },
  { q: 'L\'enveloppe qui entoure toute cellule s\'appelle…', r: 'la membrane', f: ['le noyau', 'la paroi'], e: 'La <strong>membrane</strong> limite la cellule et contrôle ce qui entre et sort.' },
  { q: 'L\'intérieur de la cellule, autour du noyau, s\'appelle…', r: 'le cytoplasme', f: ['la membrane', 'le chloroplaste'], e: 'Le <strong>cytoplasme</strong> : une sorte de gelée où se passent les activités de la cellule.' },
  { q: 'Un être vivant formé d\'une seule cellule est…', r: 'unicellulaire', f: ['pluricellulaire'], e: '<strong>Unicellulaire</strong> : une seule cellule (bactérie, levure, paramécie).' },
  { q: 'L\'être humain est…', r: 'pluricellulaire', f: ['unicellulaire'], e: 'Nous sommes faits de milliers de milliards de cellules : nous sommes <strong>pluricellulaires</strong>.' },
  { q: 'Qu\'a une cellule végétale qu\'une cellule animale n\'a pas ?', r: 'une paroi et des chloroplastes', f: ['un noyau', 'une membrane'], e: 'La cellule végétale a une <strong>paroi</strong> rigide autour de la membrane et des <strong>chloroplastes</strong> verts (pour la photosynthèse).', n: 1 },
  { q: 'Les chloroplastes donnent aux plantes…', r: 'leur couleur verte', f: ['leur odeur', 'leurs racines'], e: 'Ils contiennent la <strong>chlorophylle</strong>, verte, qui capte la lumière.', n: 1 },
  { q: 'Les bactéries ont-elles un noyau ?', r: 'Non', f: ['Oui, comme toutes les cellules'], e: 'Les bactéries sont des cellules <strong>sans noyau</strong> : leur ADN flotte dans le cytoplasme.', n: 1 },
];
GEN.cellule = genMixte(B_CELLULE, 'La cellule', fabMicroscope, 0.25);

const B_PARENTE = [
  { q: 'Pour classer les êtres vivants en groupes emboîtés, on se base sur…', r: 'les attributs qu\'ils partagent', f: ['leur milieu de vie', 'leur taille'], e: 'Un groupe = tous les êtres vivants qui partagent un même <strong>attribut</strong> (un caractère).' },
  { q: 'Le groupe des « vertébrés » réunit les animaux qui ont…', r: 'une colonne vertébrale', f: ['des plumes', 'des poils'], e: 'Vertébrés : <strong>squelette intérieur</strong> avec colonne vertébrale.' },
  { q: 'Le groupe des mammifères est à l\'intérieur du groupe…', r: 'des vertébrés', f: ['des oiseaux', 'des insectes'], e: 'Tous les mammifères sont des vertébrés : le groupe des mammifères est <strong>emboîté</strong> dans celui des vertébrés.' },
  { q: 'Le dauphin vit dans la mer comme le thon, mais il a…', r: 'des mamelles et des poumons : c\'est un mammifère', f: ['des branchies : c\'est un poisson', 'des plumes'], e: 'Le <strong>dauphin</strong> respire de l\'air et allaite : il est plus proche du chat que du thon !' },
  { q: 'Plus deux espèces partagent d\'attributs…', r: 'plus elles sont proches parentes', f: ['moins elles sont parentes', 'plus elles sont grandes'], e: 'Partager beaucoup d\'attributs montre une <strong>parenté</strong> : un ancêtre commun récent.', n: 1 },
  { q: 'Un arbre de parenté montre…', r: 'les liens de parenté entre espèces', f: ['les arbres d\'une forêt', 'la taille des animaux'], e: 'Il indique quelles espèces ont des <strong>ancêtres communs</strong> plus ou moins récents.', n: 1 },
  { q: 'Qui est le plus proche parent de l\'humain ?', r: 'le chimpanzé', f: ['le chien', 'le dauphin'], e: 'Le <strong>chimpanzé</strong> partage le plus d\'attributs avec nous : nous avons un ancêtre commun récent (quelques millions d\'années).', n: 1 },
  { q: 'Le crocodile est plus proche parent…', r: 'des oiseaux que des lézards', f: ['des poissons que des oiseaux', 'des mammifères'], e: 'Surprise de la classification : crocodiles et oiseaux (descendants des dinosaures) ont un <strong>ancêtre commun</strong> plus récent qu\'avec les lézards.', n: 1 },
  { q: 'Dans un tableau d\'attributs, la chauve-souris partage avec le chat…', r: 'les poils et les mamelles', f: ['les ailes', 'les plumes'], e: 'Poils et mamelles : elle est dans le groupe des <strong>mammifères</strong>, comme le chat.' },
  { q: 'L\'escargot et la limace, qui ont un corps mou, font partie…', r: 'des mollusques', f: ['des vertébrés', 'des insectes'], e: 'Corps mou, souvent protégé par une coquille : les <strong>mollusques</strong>.', n: 1 },
];
GEN.parente = genBanque(B_PARENTE, 'Groupes emboîtés et parenté');

const B_MICROBES = [
  { q: 'Pour faire un yaourt, on utilise du lait et…', r: 'des bactéries', f: ['de la levure de boulanger', 'du sel'], e: 'Des <strong>bactéries</strong> transforment le sucre du lait (le lactose) en acide : le lait s\'épaissit.' },
  { q: 'La pâte à pain gonfle grâce à…', r: 'la levure, un champignon microscopique', f: ['des bactéries du yaourt', 'l\'eau chaude seulement'], e: 'La <strong>levure</strong> transforme les sucres de la farine et rejette du gaz carbonique : les bulles font gonfler la pâte.' },
  { q: 'La transformation d\'un aliment par des micro-organismes s\'appelle…', r: 'la fermentation', f: ['la germination', 'la cuisson'], e: 'La <strong>fermentation</strong> donne le yaourt, le fromage, le pain, la choucroute…' },
  { q: 'Les micro-organismes sont…', r: 'des êtres vivants invisibles à l\'œil nu', f: ['des poussières', 'des minéraux'], e: 'Bactéries, levures : ce sont des <strong>êtres vivants</strong> microscopiques.' },
  { q: 'Tous les microbes sont-ils dangereux ?', r: 'Non, beaucoup sont utiles', f: ['Oui, tous rendent malade'], e: 'La plupart sont <strong>inoffensifs</strong> ou utiles : fermentations, digestion (nos intestins en contiennent des milliards), décomposition.' },
  { q: 'Mettre les aliments au réfrigérateur…', r: 'ralentit la multiplication des microbes', f: ['tue tous les microbes', 'les fait se multiplier plus vite'], e: 'Le froid <strong>ralentit</strong> les microbes sans les tuer. La cuisson à haute température, elle, en tue beaucoup.', n: 1 },
  { q: 'La pasteurisation (inventée par Pasteur) consiste à…', r: 'chauffer un aliment pour tuer la plupart des microbes', f: ['le congeler', 'ajouter des microbes'], e: 'On chauffe le lait par exemple vers 72 °C quelques secondes : les microbes dangereux sont détruits et il se conserve plus longtemps.', n: 1 },
  { q: 'L\'agriculture raisonnée cherche à…', r: 'produire en limitant les engrais et les pesticides', f: ['utiliser le plus de pesticides possible', 'ne rien produire'], e: 'Elle utilise engrais et traitements <strong>seulement quand il le faut</strong>, pour protéger les sols, l\'eau et la santé.', n: 1 },
  { q: 'Un engrais apporte aux plantes…', r: 'des sels minéraux pour mieux pousser', f: ['de la lumière', 'des insectes'], e: 'Les <strong>engrais</strong> apportent azote, phosphore, potassium… Trop d\'engrais pollue les rivières.', n: 1 },
  { q: 'Le fromage est fabriqué grâce à…', r: 'des bactéries et parfois des moisissures', f: ['la levure de boulanger seulement', 'de la cuisson seulement'], e: 'Bactéries pour cailler le lait, <strong>moisissures</strong> (champignons) pour certains fromages : le bleu, le camembert.', n: 1 },
];
GEN.microbes = genBanque(B_MICROBES, 'Micro-organismes et production alimentaire');

const B_CLIMAT65 = [
  { q: 'La météo décrit le temps…', r: 'd\'un lieu sur quelques jours', f: ['moyen d\'une région sur 30 ans', 'qu\'il fera dans 100 ans'], e: '<strong>Météo</strong> : le temps qu\'il fait ou fera dans les jours qui viennent.' },
  { q: 'Le climat d\'une région, c\'est…', r: 'le temps moyen observé sur au moins 30 ans', f: ['le temps d\'aujourd\'hui', 'la température d\'un jour'], e: '<strong>Climat</strong> : moyennes de températures et de précipitations sur une trentaine d\'années.' },
  { q: 'Le vent est dû…', r: 'aux différences de pression et de température entre masses d\'air', f: ['aux arbres qui bougent', 'à la Lune'], e: 'L\'air se déplace des zones de <strong>haute pression</strong> vers les zones de <strong>basse pression</strong> : c\'est le vent.' },
  { q: 'Les courants marins (comme le Gulf Stream)…', r: 'transportent de la chaleur d\'une région à l\'autre', f: ['n\'ont aucun effet sur le climat', 'sont des vagues'], e: 'Le <strong>Gulf Stream</strong> apporte de l\'eau tiède vers l\'Europe de l\'Ouest : il adoucit notre climat.' },
  { q: 'Un « aléa », c\'est…', r: 'un phénomène naturel possible (tempête, crue, séisme)', f: ['les dégâts qu\'il cause', 'une prévision météo'], e: 'L\'<strong>aléa</strong> est le phénomène lui-même. Le risque apparaît quand il menace des personnes ou des biens.', n: 1 },
  { q: 'Le risque, c\'est…', r: 'un aléa qui menace des personnes ou des biens', f: ['un aléa dans un désert vide', 'une belle journée'], e: '<strong>Risque = aléa × enjeux</strong> : une crue dans une vallée vide n\'est pas un risque, dans une ville, si.', n: 1 },
  { q: 'L\'air chaud…', r: 'monte, car il est plus léger', f: ['descend', 'reste toujours au sol'], e: 'L\'air chaud est <strong>moins dense</strong> : il s\'élève. C\'est ainsi que se forment des nuages d\'orage et que volent les montgolfières.', n: 1 },
  { q: 'Les zones proches de l\'équateur sont plus chaudes parce que…', r: 'elles reçoivent les rayons du Soleil plus directement', f: ['elles sont plus proches du Soleil', 'il y a plus de volcans'], e: 'À l\'équateur, le Soleil est presque à la verticale : la même énergie chauffe une <strong>plus petite surface</strong>. Aux pôles, les rayons arrivent rasants.', n: 1 },
  { q: 'Une station météo mesure la pluie avec…', r: 'un pluviomètre', f: ['un thermomètre', 'un baromètre'], e: '<strong>Pluviomètre</strong> : pluie (en mm). Thermomètre : température. Baromètre : pression. Anémomètre : vent.' },
  { q: 'La pression de l\'air se mesure avec…', r: 'un baromètre', f: ['un pluviomètre', 'un anémomètre'], e: 'Le <strong>baromètre</strong> : une pression qui baisse annonce souvent du mauvais temps.', n: 1 },
];
GEN.climat65 = genBanque(B_CLIMAT65, 'La Terre et le climat');

const B_EFFORT = [
  { q: 'Pendant un effort, les muscles ont besoin de plus de…', r: 'dioxygène et de nutriments', f: ['dioxyde de carbone', 'sommeil'], e: 'Les muscles <strong>consomment</strong> dioxygène et nutriments (le glucose) pour produire l\'énergie du mouvement.' },
  { q: 'Pendant un effort, la fréquence respiratoire…', r: 'augmente', f: ['diminue', 'ne change pas'], e: 'On respire <strong>plus vite et plus fort</strong> pour faire entrer plus de dioxygène.' },
  { q: 'Le dioxygène passe de l\'air au sang dans…', r: 'les alvéoles des poumons', f: ['l\'estomac', 'le cœur'], e: 'Dans les <strong>alvéoles pulmonaires</strong>, la paroi est très fine : le dioxygène passe dans le sang.' },
  { q: 'Le sang apporte le dioxygène aux muscles grâce…', r: 'au cœur qui le pompe dans les vaisseaux', f: ['aux os', 'à la peau'], e: 'Le <strong>cœur</strong> propulse le sang dans les artères jusqu\'aux muscles.' },
  { q: 'Les muscles rejettent un déchet gazeux :', r: 'le dioxyde de carbone', f: ['le dioxygène', 'l\'azote'], e: 'Le <strong>dioxyde de carbone</strong> est emporté par le sang et rejeté par les poumons.' },
  { q: 'Le sang qui part du cœur vers les muscles circule dans…', r: 'les artères', f: ['les veines', 'les bronches'], e: '<strong>Artères</strong> : du cœur vers les organes ; veines : retour au cœur.', n: 1 },
  { q: 'Après l\'effort, le cœur et la respiration…', r: 'reviennent peu à peu à leur rythme de repos', f: ['restent rapides pour toujours', 's\'arrêtent'], e: 'C\'est la <strong>récupération</strong>. Plus on est entraîné, plus elle est rapide.', n: 1 },
  { q: 'Les nutriments utilisés par les muscles viennent…', r: 'de la digestion des aliments', f: ['de l\'air', 'des os'], e: 'Ils sont absorbés dans l\'<strong>intestin grêle</strong> puis transportés par le sang.', n: 1 },
  { q: 'Pour être en forme et éviter les blessures, avant un effort il faut…', r: 's\'échauffer progressivement', f: ['courir très vite tout de suite', 'manger beaucoup juste avant'], e: 'L\'<strong>échauffement</strong> prépare le cœur, les muscles et les articulations.', n: 1 },
  { q: 'Le dopage est…', r: 'dangereux pour la santé et interdit', f: ['sans risque', 'recommandé aux enfants'], e: 'Les produits dopants ont des <strong>effets graves</strong> sur le cœur et le corps, et ils sont interdits dans le sport.', n: 1 },
];
GEN.effort = genMixte(B_EFFORT, 'Le corps humain et l\'effort', fabPouls, 0.35);

const B_PLANTES = [
  { q: 'Une plante verte fabrique sa matière grâce à…', r: 'la photosynthèse', f: ['la digestion', 'la fermentation'], e: 'La <strong>photosynthèse</strong> : avec la lumière, la plante fabrique ses sucres à partir d\'eau et de dioxyde de carbone.' },
  { q: 'Pour la photosynthèse, la plante a besoin de lumière, d\'eau et…', r: 'de dioxyde de carbone', f: ['de dioxygène', 'de sucre'], e: 'Lumière + eau + <strong>dioxyde de carbone</strong> (+ sels minéraux) → matière de la plante (sucres) + dioxygène.' },
  { q: 'La photosynthèse rejette…', r: 'du dioxygène', f: ['du dioxyde de carbone', 'de la fumée'], e: 'Les plantes <strong>produisent le dioxygène</strong> que nous respirons.' },
  { q: 'Les plantes prélèvent l\'eau et les sels minéraux par…', r: 'les racines', f: ['les fleurs', 'les feuilles seulement'], e: 'Les <strong>poils absorbants</strong> des racines prélèvent l\'eau et les sels minéraux du sol.' },
  { q: 'Le dioxyde de carbone entre dans la feuille par…', r: 'de petits orifices, les stomates', f: ['les racines', 'les fleurs'], e: 'Sous la feuille, les <strong>stomates</strong> laissent entrer le dioxyde de carbone et sortir le dioxygène et la vapeur d\'eau.', n: 1 },
  { q: 'La photosynthèse a lieu dans…', r: 'les chloroplastes des cellules vertes', f: ['le noyau des racines', 'les graines seulement'], e: 'Les <strong>chloroplastes</strong> contiennent la chlorophylle qui capte la lumière.', n: 1 },
  { q: 'La sève brute, qui monte des racines aux feuilles, contient…', r: 'de l\'eau et des sels minéraux', f: ['des sucres', 'du dioxygène'], e: '<strong>Sève brute</strong> : eau + sels minéraux, des racines vers les feuilles.', n: 1 },
  { q: 'La sève élaborée transporte…', r: 'les sucres fabriqués dans les feuilles', f: ['seulement de l\'eau', 'de la terre'], e: '<strong>Sève élaborée</strong> : elle distribue les sucres fabriqués par la photosynthèse à toute la plante (fruits, racines…).', n: 1 },
  { q: 'Une plante placée dans le noir pendant longtemps…', r: 'ne peut plus faire la photosynthèse et dépérit', f: ['pousse mieux', 'fait plus de photosynthèse'], e: 'Sans <strong>lumière</strong>, pas de photosynthèse : la plante épuise ses réserves.', n: 1 },
  { q: 'La matière d\'un grand arbre vient surtout…', r: 'du dioxyde de carbone de l\'air et de l\'eau', f: ['de la terre qu\'il mange', 'des insectes'], e: 'Étonnant mais vrai : le bois est fabriqué surtout avec le <strong>carbone de l\'air</strong> (grâce à la photosynthèse) et l\'eau. Le sol n\'apporte que les sels minéraux.', n: 1 },
];
GEN.plantes = genBanque(B_PLANTES, 'La nutrition des plantes');

/* ============================================================
   6e – 5e : TECHNOLOGIE ET LA TERRE DANS LE SYSTÈME SOLAIRE
   ============================================================ */
const B_CDC = [
  { q: 'Le document qui décrit tout ce que doit faire un objet à fabriquer s\'appelle…', r: 'le cahier des charges', f: ['le mode d\'emploi', 'la facture'], e: 'Le <strong>cahier des charges</strong> liste le besoin, les fonctions et les contraintes (taille, prix, matériaux, sécurité…).' },
  { q: 'Une contrainte, dans un cahier des charges, c\'est…', r: 'une exigence à respecter (prix, taille, sécurité…)', f: ['une couleur au hasard', 'une erreur de fabrication'], e: 'Par exemple : « l\'objet doit coûter moins de 10 € » ou « être utilisable par un enfant de 6 ans ». Ce sont des <strong>contraintes</strong>.' },
  { q: 'Un prototype est…', r: 'un premier modèle pour tester l\'objet avant de le produire', f: ['l\'objet vendu en magasin', 'un dessin rapide'], e: 'Le <strong>prototype</strong> permet de vérifier que l\'objet fonctionne et respecte le cahier des charges.' },
  { q: 'Pour concevoir un objet sur ordinateur, on utilise…', r: 'un logiciel de modélisation 3D', f: ['un tableur', 'un traitement de texte'], e: 'La <strong>modélisation 3D</strong> (CAO) permet de dessiner l\'objet en volume, de le tourner, de le modifier facilement.' },
  { q: 'Une imprimante 3D fabrique un objet…', r: 'en déposant de la matière couche par couche', f: ['en le découpant dans un bloc', 'en le peignant'], e: 'Elle fait fondre un fil de plastique et dépose l\'objet <strong>couche par couche</strong>.', n: 1 },
  { q: 'On fabrique un prototype qui ne respecte pas une contrainte. On…', r: 'modifie la conception et on teste à nouveau', f: ['le vend quand même', 'abandonne le projet tout de suite'], e: 'La conception avance par <strong>essais et améliorations</strong> successives.', n: 1 },
  { q: 'Dans quel ordre se déroule un projet ?', r: 'besoin → cahier des charges → conception → prototype → tests', f: ['prototype → besoin → tests → cahier des charges', 'tests → prototype → besoin'], e: 'On part du <strong>besoin</strong>, on écrit le cahier des charges, on <strong>conçoit</strong>, on fabrique un <strong>prototype</strong>, on le <strong>teste</strong>.', n: 1 },
  { q: 'Le design d\'un objet, c\'est…', r: 'sa conception, qui allie forme, usage et esthétique', f: ['seulement sa couleur', 'son prix'], e: 'Le <strong>design</strong> pense à la fois à l\'usage, à la forme, aux matériaux et à la beauté de l\'objet.', n: 1 },
  { q: 'Le besoin auquel répond un objet s\'exprime souvent par la question…', r: '« À qui rend-il service, sur quoi agit-il, pour quoi faire ? »', f: ['« Combien coûte-t-il ? »', '« De quelle couleur est-il ? »'], e: 'C\'est la « bête à cornes » : <strong>à qui</strong> l\'objet rend-il service, <strong>sur quoi</strong> agit-il, <strong>dans quel but</strong> ?' },
  { q: 'Tester un prototype sert à…', r: 'vérifier qu\'il respecte le cahier des charges', f: ['le décorer', 'le vendre plus cher'], e: 'On compare le prototype à chaque exigence du <strong>cahier des charges</strong>.' },
  { q: 'Une contrainte de sécurité pour un jouet d\'enfant de 2 ans peut être…', r: 'pas de petites pièces qui pourraient être avalées', f: ['une jolie couleur', 'un prix élevé'], e: 'Les jouets pour les tout-petits ne doivent pas avoir de <strong>petites pièces</strong> : c\'est une contrainte de sécurité.' },
  { q: 'Le logiciel qui permet de dessiner un objet en 3D sur ordinateur s\'appelle un logiciel de…', r: 'CAO (conception assistée par ordinateur)', f: ['traitement de texte', 'messagerie'], e: '<strong>CAO</strong> : conception assistée par ordinateur.', n: 1 },
];
GEN.cdc = genBanque(B_CDC, 'Cahier des charges et prototype');

const B_COND = [
  { q: 'Dans un programme, une <strong>condition</strong> s\'écrit…', r: 'si … alors … sinon …', f: ['répéter … fois', 'avancer de …'], e: 'La structure <strong>si … alors … sinon</strong> permet au programme de choisir quoi faire selon la situation.' },
  { q: 'Une variable, dans un programme, sert à…', r: 'garder en mémoire une valeur qui peut changer', f: ['dessiner le lutin', 'arrêter le programme'], e: 'Une <strong>variable</strong> (score, vies, température…) est une case mémoire avec un nom.', n: 1 },
  { q: 'Une boucle « répéter jusqu\'à … »…', r: 'recommence jusqu\'à ce qu\'une condition soit vraie', f: ['ne s\'exécute qu\'une fois', 'arrête tout de suite le programme'], e: 'Elle combine <strong>boucle</strong> et <strong>condition</strong> : « répéter jusqu\'à toucher le bord ».', n: 1 },
];
GEN.cond = genMixte(B_COND, 'Boucles et conditions', fabAlgo65, 0.8);

const B_SYSTSOL = [
  { q: 'La Terre est la … planète à partir du Soleil.', r: 'troisième', f: ['première', 'cinquième'], e: 'Mercure, Vénus, la <strong>Terre</strong> : troisième planète.' },
  { q: 'La vie est possible sur Terre surtout parce qu\'on y trouve…', r: 'de l\'eau liquide', f: ['beaucoup de volcans', 'des anneaux'], e: 'Grâce à sa <strong>distance au Soleil</strong>, la Terre n\'est ni trop chaude ni trop froide : l\'eau y reste liquide.' },
  { q: 'L\'atmosphère de la Terre…', r: 'nous protège et garde une température douce', f: ['n\'existe pas', 'est faite d\'eau liquide'], e: 'L\'<strong>atmosphère</strong> filtre certains rayons du Soleil et garde la chaleur (effet de serre naturel).' },
  { q: 'Les planètes Jupiter et Saturne sont des planètes…', r: 'gazeuses, géantes', f: ['rocheuses, petites', 'en glace d\'eau'], e: 'Jupiter, Saturne, Uranus, Neptune : planètes <strong>géantes gazeuses</strong>. Mercure, Vénus, la Terre, Mars : planètes <strong>rocheuses</strong>.' },
  { q: 'Pourquoi n\'y a-t-il pas d\'eau liquide à la surface de Vénus ?', r: 'il y fait beaucoup trop chaud', f: ['il y fait trop froid', 'elle est trop loin du Soleil'], e: 'Vénus a une atmosphère épaisse qui crée un effet de serre énorme : plus de 450 °C ! L\'eau ne peut pas y être liquide.', n: 1 },
  { q: 'Sur Mars aujourd\'hui, l\'eau se trouve surtout…', r: 'sous forme de glace', f: ['dans de grands océans', 'nulle part, jamais'], e: 'Mars est froide et son atmosphère très mince : l\'eau y est surtout en <strong>glace</strong> (aux pôles, dans le sol). Elle a peut-être coulé autrefois.', n: 1 },
  { q: 'La différence entre météo et climat :', r: 'la météo, c\'est le temps d\'un jour ; le climat, la moyenne sur 30 ans', f: ['ce sont deux mots pour la même chose', 'le climat, c\'est la météo de demain'], e: '<strong>Météo</strong> : quelques jours. <strong>Climat</strong> : moyenne sur une trentaine d\'années.', n: 1 },
  { q: 'Les premières formes de vie sur Terre sont apparues…', r: 'dans les océans, il y a plus de 3,5 milliards d\'années', f: ['sur la terre ferme il y a 1 000 ans', 'avec les dinosaures'], e: 'Les plus anciennes traces de vie (des êtres <strong>unicellulaires</strong>) ont plus de 3,5 milliards d\'années, dans les océans.', n: 1 },
  { q: 'La Lune n\'a pas d\'atmosphère. Conséquence :', r: 'il y fait très chaud le jour et très froid la nuit', f: ['il y pleut souvent', 'on peut y respirer'], e: 'Sans atmosphère pour garder la chaleur, la température passe de plus de 100 °C à moins de −150 °C.', n: 1 },
  { q: 'La Terre est-elle la seule planète du système solaire où l\'on connaît la vie ?', r: 'Oui, à ce jour', f: ['Non, on en a trouvé sur Mars'], e: 'Les scientifiques cherchent, mais pour l\'instant la <strong>Terre</strong> est la seule planète où la vie est connue.' },
  { q: 'Les planètes rocheuses sont Mercure, Vénus, la Terre et…', r: 'Mars', f: ['Jupiter', 'Neptune'], e: 'Les quatre planètes <strong>rocheuses</strong>, les plus proches du Soleil : Mercure, Vénus, la Terre, <strong>Mars</strong>.' },
];
GEN.systsol = genBanque(B_SYSTSOL, 'La Terre dans le système solaire');

const B_CHAINES = [
  { q: 'Dans un système automatisé, la chaîne d\'<strong>information</strong> sert à…', r: 'acquérir, traiter et communiquer l\'information', f: ['alimenter et convertir l\'énergie', 'fabriquer les pièces'], e: 'Chaîne d\'information : <strong>acquérir</strong> (capteurs), <strong>traiter</strong> (programme), <strong>communiquer</strong> (ordres, messages).' },
  { q: 'Dans un système automatisé, la chaîne d\'<strong>énergie</strong> sert à…', r: 'alimenter, distribuer, convertir et transmettre l\'énergie pour agir', f: ['acquérir l\'information', 'écrire le programme'], e: 'Chaîne d\'énergie : <strong>alimenter</strong> (pile, secteur), <strong>distribuer</strong> (relais), <strong>convertir</strong> (moteur), <strong>transmettre</strong> (engrenages).' },
  { q: 'Dans un portail automatique, le capteur qui détecte une voiture sert à…', r: 'acquérir l\'information', f: ['convertir l\'énergie', 'transmettre le mouvement'], e: 'Un capteur <strong>acquiert</strong> une information : il fait partie de la chaîne d\'information.' },
  { q: 'Dans un portail automatique, le moteur sert à…', r: 'convertir l\'énergie électrique en mouvement', f: ['acquérir l\'information', 'traiter l\'information'], e: 'Le moteur est un <strong>convertisseur</strong> : il fait partie de la chaîne d\'énergie.' },
  { q: 'La carte électronique avec son programme (le microcontrôleur) sert à…', r: 'traiter l\'information', f: ['alimenter en énergie', 'convertir l\'énergie'], e: 'Le microcontrôleur reçoit les informations des capteurs, applique le programme et <strong>décide</strong> : c\'est le traitement.' },
  { q: 'Dans une lampe automatique, le détecteur de mouvement est…', r: 'un capteur', f: ['un actionneur', 'une source d\'énergie'], e: 'Il détecte quelqu\'un : c\'est un <strong>capteur</strong>. La lampe qui s\'allume est un actionneur.', n: 1 },
  { q: 'Dans une voiture électrique, la batterie sert à…', r: 'alimenter en énergie', f: ['traiter l\'information', 'acquérir l\'information'], e: 'La batterie <strong>stocke et fournit</strong> l\'énergie : fonction alimenter.', n: 1 },
  { q: 'Les engrenages entre le moteur et les roues d\'un robot servent à…', r: 'transmettre le mouvement', f: ['acquérir l\'information', 'alimenter en énergie'], e: 'Ils <strong>transmettent</strong> (et adaptent) le mouvement du moteur jusqu\'aux roues.', n: 1 },
  { q: 'Le voyant qui s\'allume pour dire « porte ouverte » sert à…', r: 'communiquer une information', f: ['convertir l\'énergie', 'alimenter'], e: 'Le voyant <strong>communique</strong> une information à l\'utilisateur.', n: 1 },
  { q: 'Un système automatisé, c\'est…', r: 'un système qui fonctionne sans intervention humaine permanente', f: ['un objet qu\'on doit toujours actionner à la main', 'un ordinateur éteint'], e: 'Portail, ascenseur, lave-linge : un <strong>programme</strong> et des capteurs les font fonctionner tout seuls.' },
];
GEN.chaines = genBanque(B_CHAINES, 'Chaîne d\'énergie et chaîne d\'information');

const B_STRUCT = [
  { q: 'Une corde qui retient une charge est soumise à…', r: 'la traction', f: ['la compression', 'la torsion'], e: 'Elle est <strong>étirée</strong> : c\'est la traction.' },
  { q: 'Un pilier qui soutient un toit est soumis à…', r: 'la compression', f: ['la traction', 'la torsion'], e: 'Il est <strong>écrasé</strong> par la charge : c\'est la compression.' },
  { q: 'Une planche posée sur deux appuis, avec quelqu\'un debout au milieu, subit…', r: 'la flexion', f: ['la torsion', 'la traction seulement'], e: 'Elle se <strong>courbe</strong> : c\'est la flexion.' },
  { q: 'Tordre une serviette pour l\'essorer, c\'est…', r: 'la torsion', f: ['la compression', 'la flexion'], e: 'On la fait tourner sur elle-même : <strong>torsion</strong>.' },
  { q: 'Pour rendre une structure rigide (pylône, grue), on utilise…', r: 'des triangles', f: ['des carrés', 'des cercles'], e: 'Le <strong>triangle</strong> ne se déforme pas : c\'est la triangulation, comme sur la tour Eiffel.' },
  { q: 'Un câble de pont suspendu est fait en acier parce que l\'acier…', r: 'résiste très bien à la traction', f: ['est transparent', 'est léger comme le papier'], e: 'On choisit le matériau selon la <strong>contrainte</strong> qu\'il subit : l\'acier résiste à la traction.', n: 1 },
  { q: 'Le béton résiste bien…', r: 'à la compression, mais mal à la traction', f: ['à la traction, mais mal à la compression', 'à rien du tout'], e: 'C\'est pourquoi on y met des barres d\'acier : le <strong>béton armé</strong> résiste aux deux.', n: 1 },
  { q: 'Pour le cadre d\'un vélo de course, on choisit un matériau…', r: 'à la fois léger et résistant (aluminium, carbone)', f: ['lourd et fragile', 'mou comme le caoutchouc'], e: 'Le choix d\'un matériau tient compte de ses <strong>propriétés</strong> (masse, résistance, prix).', n: 1 },
  { q: 'Un tabouret à trois pieds…', r: 'est toujours stable, même sur un sol irrégulier', f: ['est moins stable qu\'à quatre pieds sur sol plat', 'tombe toujours'], e: 'Trois points forment toujours un plan : les trois pieds touchent le sol, il <strong>ne boite jamais</strong>.', n: 1 },
  { q: 'Une étagère chargée de livres qui se courbe au milieu subit…', r: 'la flexion', f: ['la traction', 'la torsion'], e: 'Elle se <strong>courbe</strong> sous la charge : flexion.' },
  { q: 'Pourquoi les poutres métalliques ont-elles souvent une forme en « I » ?', r: 'pour résister à la flexion avec peu de matière', f: ['pour être plus jolies', 'pour être plus lourdes'], e: 'La forme en <strong>I</strong> met la matière là où elle travaille le plus : la poutre est rigide et légère.', n: 1 },
];
GEN.struct = genBanque(B_STRUCT, 'Matériaux et structures');

const B_ORDI = [
  { q: 'Le « cerveau » de l\'ordinateur, qui fait les calculs, est…', r: 'le processeur', f: ['l\'écran', 'le clavier'], e: 'Le <strong>processeur</strong> (CPU) exécute les instructions des programmes.' },
  { q: 'La mémoire vive (RAM)…', r: 'garde les données pendant que l\'ordinateur est allumé', f: ['garde les fichiers quand l\'ordinateur est éteint', 'affiche les images'], e: 'La <strong>mémoire vive</strong> est rapide mais s\'efface à l\'extinction.' },
  { q: 'Pour garder ses fichiers quand l\'ordinateur est éteint, on les enregistre…', r: 'sur le disque dur ou le SSD', f: ['dans la mémoire vive', 'sur l\'écran'], e: 'Le <strong>disque dur</strong> ou le SSD stockent les données durablement.' },
  { q: 'Le clavier et la souris sont des périphériques…', r: 'd\'entrée', f: ['de sortie'], e: 'Ils <strong>envoient</strong> des informations à l\'ordinateur : périphériques d\'entrée.' },
  { q: 'L\'écran et l\'imprimante sont des périphériques…', r: 'de sortie', f: ['d\'entrée'], e: 'Ils <strong>reçoivent</strong> des informations de l\'ordinateur : périphériques de sortie.' },
  { q: 'Un capteur sert à…', r: 'mesurer ou détecter quelque chose (lumière, température, distance)', f: ['faire bouger un moteur', 'stocker des fichiers'], e: 'Le <strong>capteur</strong> transforme une grandeur physique en information : capteur de lumière, de température, de distance…' },
  { q: 'Un actionneur sert à…', r: 'agir : faire bouger, éclairer, sonner', f: ['mesurer la température', 'détecter un obstacle'], e: 'Moteur, lampe, haut-parleur : les <strong>actionneurs</strong> agissent sur le monde.' },
  { q: 'Dans un robot, lequel est un actionneur ?', r: 'le moteur des roues', f: ['le capteur de distance', 'le capteur de lumière'], e: 'Le moteur <strong>agit</strong> : c\'est un actionneur.', n: 1 },
  { q: 'Dans une serre automatique, lequel est un capteur ?', r: 'le thermomètre électronique', f: ['le ventilateur', 'l\'arrosage'], e: 'Le thermomètre <strong>mesure</strong> : capteur. Le ventilateur et l\'arrosage agissent : actionneurs.', n: 1 },
  { q: 'Toutes les informations dans un ordinateur sont codées avec…', r: 'des 0 et des 1 (le binaire)', f: ['des lettres seulement', 'des couleurs'], e: 'Textes, images, sons : tout est codé en <strong>binaire</strong>, avec des bits qui valent 0 ou 1.', n: 1 },
  { q: '1 octet, c\'est…', r: '8 bits', f: ['10 bits', '2 bits'], e: 'Un <strong>octet</strong> = 8 bits. Un kilo-octet ≈ 1 000 octets, un mégaoctet ≈ 1 million.', n: 1 },
];
GEN.ordi = genBanque(B_ORDI, 'L\'ordinateur, les capteurs et les actionneurs');

/* ============================================================
   4e – 3e : CALCULS FABRIQUÉS À CHAQUE PARTIE
   loi d'Ohm et lois des circuits, son et lumière, atomes et ions, pH,
   poids et masse, énergie et puissance, adresses IP
   ============================================================ */
function fabOhm(p) {
  const notion = 'Tension, intensité et loi d\'Ohm';
  const type = pick(p < 0.5 ? [0, 1, 3] : [0, 1, 2, 3, 4]);
  if (type <= 2) {
    const R = pick([10, 20, 47, 50, 100, 220]), I = pick([0.01, 0.02, 0.05, 0.1, 0.2]), U = Math.round(R * I * 1000) / 1000;
    if (type === 0) return { enonce: `Une résistance de <strong>${R} Ω</strong> est traversée par un courant de <strong>${fmtN(I)} A</strong>. Quelle est la tension à ses bornes (en V) ?`, saisie: { type: 'nombre', bonne: U, unite: 'V' }, rep: `${fmtN(U)} volts`, notion,
      voix: `Une résistance de ${R} ohms est traversée par un courant de ${fmtN(I)} ampère. Quelle est la tension à ses bornes, en volts ?`,
      explication: `Loi d'Ohm : <strong>U = R × I</strong> = ${R} × ${fmtN(I)} = <strong>${fmtN(U)} V</strong>.` };
    if (type === 1) return { enonce: `La tension aux bornes d'une résistance de <strong>${R} Ω</strong> est <strong>${fmtN(U)} V</strong>. Quelle est l'intensité du courant (en A) ?`, saisie: { type: 'nombre', bonne: I, unite: 'A' }, rep: `${fmtN(I)} ampère`, notion,
      voix: `La tension aux bornes d'une résistance de ${R} ohms est ${fmtN(U)} volts. Quelle est l'intensité du courant, en ampères ?`,
      explication: `I = <strong>U ÷ R</strong> = ${fmtN(U)} ÷ ${R} = <strong>${fmtN(I)} A</strong>.` };
    return { enonce: `Aux bornes d'une résistance, on mesure <strong>${fmtN(U)} V</strong> et <strong>${fmtN(I)} A</strong>. Quelle est sa valeur (en Ω) ?`, saisie: { type: 'nombre', bonne: R, unite: 'Ω' }, rep: `${R} ohms`, notion,
      voix: `Aux bornes d'une résistance, on mesure ${fmtN(U)} volts et ${fmtN(I)} ampère. Quelle est sa valeur en ohms ?`,
      explication: `R = <strong>U ÷ I</strong> = ${fmtN(U)} ÷ ${fmtN(I)} = <strong>${R} Ω</strong>.` };
  }
  if (type === 3) {
    const U = pick([4.5, 6, 9, 12]), U1 = Math.round(U * pick([0.3, 0.4, 0.5, 0.6]) * 10) / 10, U2 = Math.round((U - U1) * 10) / 10;
    return { enonce: `Deux lampes sont branchées <strong>en série</strong> sur un générateur de <strong>${fmtN(U)} V</strong>. La tension aux bornes de la première est <strong>${fmtN(U1)} V</strong>. Quelle est la tension aux bornes de la seconde (en V) ?`, saisie: { type: 'nombre', bonne: U2, unite: 'V' }, rep: `${fmtN(U2)} volts`, notion,
      explication: `En série, les tensions s'<strong>additionnent</strong> : U = U₁ + U₂, donc U₂ = ${fmtN(U)} − ${fmtN(U1)} = <strong>${fmtN(U2)} V</strong>.` };
  }
  const I1 = pick([0.1, 0.2, 0.15, 0.25, 0.3]), I2 = pick([0.1, 0.2, 0.35, 0.4]), I = Math.round((I1 + I2) * 100) / 100;
  return { enonce: `Deux lampes sont branchées <strong>en dérivation</strong>. La première est traversée par <strong>${fmtN(I1)} A</strong>, la seconde par <strong>${fmtN(I2)} A</strong>. Quelle est l'intensité dans la branche principale (en A) ?`, saisie: { type: 'nombre', bonne: I, unite: 'A' }, rep: `${fmtN(I)} ampère`, notion,
    explication: `En dérivation, les intensités des branches s'<strong>additionnent</strong> (loi des nœuds) : ${fmtN(I1)} + ${fmtN(I2)} = <strong>${fmtN(I)} A</strong>.` };
}

function fabSon(p) {
  const notion = 'Le son et la lumière';
  const type = pick(p < 0.5 ? [0, 0, 1] : [0, 1, 2]);
  if (type === 0) {
    const t = rnd(2, 9), d = 340 * t;
    return { enonce: `Pendant un orage, on voit l'éclair, puis on entend le tonnerre <strong>${t} secondes</strong> plus tard. Le son va à 340 m/s. À quelle distance est l'orage (en m) ?`, saisie: { type: 'nombre', bonne: d, unite: 'm' }, rep: `${fmtN(d)} mètres`, notion,
      explication: `La lumière de l'éclair arrive presque instantanément. Le son met ${t} s : d = v × t = 340 × ${t} = <strong>${fmtN(d)} m</strong>, environ ${fmtN(Math.round(d / 100) / 10)} km. Astuce : à peu près 1 km toutes les 3 secondes.` };
  }
  if (type === 1) {
    const d = pick([680, 1020, 1360, 1700, 3400]), t = d / 340;
    return { enonce: `Le son va à 340 m/s dans l'air. Combien de temps met-il pour parcourir <strong>${fmtN(d)} m</strong> (en s) ?`, saisie: { type: 'nombre', bonne: t, unite: 's' }, rep: `${fmtN(t)} secondes`, notion,
      explication: `t = d ÷ v = ${fmtN(d)} ÷ 340 = <strong>${fmtN(t)} s</strong>.` };
  }
  const t = pick([1, 2, 5]), d = 300000 * t;
  return { enonce: `La lumière va à <strong>300 000 km/s</strong>. Quelle distance parcourt-elle en <strong>${t} s</strong> (en km) ?`, saisie: { type: 'nombre', bonne: d, unite: 'km' }, rep: `${fmtN(d)} kilomètres`, notion,
    explication: `d = v × t = 300 000 × ${t} = <strong>${fmtN(d)} km</strong>. La lumière va presque <strong>un million de fois</strong> plus vite que le son.` };
}

const deDe = (n) => (/^[aeiouhéèâ]/i.test(n) ? `d'${n}` : `de ${n}`);
const ATOMES = [['hydrogène', 'H', 1], ['carbone', 'C', 6], ['azote', 'N', 7], ['oxygène', 'O', 8], ['sodium', 'Na', 11], ['magnésium', 'Mg', 12], ['aluminium', 'Al', 13], ['chlore', 'Cl', 17], ['calcium', 'Ca', 20], ['fer', 'Fe', 26], ['cuivre', 'Cu', 29]];
const IONS = [['sodium', 'Na⁺', 11, 1], ['chlorure', 'Cl⁻', 17, -1], ['calcium', 'Ca²⁺', 20, 2], ['magnésium', 'Mg²⁺', 12, 2], ['cuivre', 'Cu²⁺', 29, 2], ['aluminium', 'Al³⁺', 13, 3], ['fer', 'Fe³⁺', 26, 3]];
function fabAtome(p) {
  const notion = 'L\'atome, les ions et le pH';
  const type = pick(p < 0.5 ? [0, 0, 1, 3] : [0, 1, 2, 3, 3]);
  if (type === 0) {
    const [nom, sym, Z] = pick(ATOMES);
    return { enonce: `L'atome ${deDe(nom)} (symbole <strong>${sym}</strong>) a <strong>${Z} proton${Z > 1 ? 's' : ''}</strong> dans son noyau. Combien a-t-il d'électrons ?`, saisie: { type: 'nombre', bonne: Z }, rep: String(Z), notion,
      explication: `Un atome est <strong>électriquement neutre</strong> : il a autant d'électrons (négatifs) que de protons (positifs). Donc <strong>${Z} électrons</strong>.` };
  }
  if (type === 1) {
    const [nom, sym, Z, q] = pick(IONS), e = Z - q;
    return { enonce: `L'ion ${nom} <strong>${sym}</strong> vient d'un atome qui a <strong>${Z} protons</strong>. Combien l'ion a-t-il d'électrons ?`, saisie: { type: 'nombre', bonne: e }, rep: String(e), notion,
      voix: `L'ion ${nom}, de charge ${q > 0 ? 'plus' : 'moins'} ${Math.abs(q)}, vient d'un atome qui a ${Z} protons. Combien l'ion a-t-il d'électrons ?`,
      explication: `${q > 0 ? `Un ion positif a <strong>perdu</strong> ${q} électron${q > 1 ? 's' : ''}` : `Un ion négatif a <strong>gagné</strong> ${-q} électron`} : ${Z} ${q > 0 ? '−' : '+'} ${Math.abs(q)} = <strong>${e} électrons</strong>. Le nombre de protons, lui, ne change pas.` };
  }
  if (type === 2) {
    const [nom, sym, Z] = pick(ATOMES.slice(1)), A = pick({ 6: [12], 7: [14], 8: [16], 11: [23], 12: [24], 13: [27], 17: [35], 20: [40], 26: [56], 29: [63] }[Z]);
    return { enonce: `Le noyau d'un atome ${deDe(nom)} (${sym}) contient <strong>${A} nucléons</strong>, dont <strong>${Z} protons</strong>. Combien de neutrons ?`, saisie: { type: 'nombre', bonne: A - Z }, rep: String(A - Z), notion,
      explication: `Les nucléons sont les protons et les neutrons du noyau : ${A} − ${Z} = <strong>${A - Z} neutrons</strong>.` };
  }
  const L = [['du jus de citron', 2.5], ['du vinaigre', 3], ['d\'un soda au cola', 2.5], ['du café', 5], ['de l\'eau pure', 7], ['de l\'eau de mer', 8], ['de l\'eau savonneuse', 10], ['de l\'eau de Javel', 12], ['de l\'eau avec du bicarbonate', 8.5]];
  const [nom, ph] = pick(L), b = ph < 6.9 ? 'acide' : ph > 7.1 ? 'basique' : 'neutre';
  return { enonce: `Le pH <strong>${nom}</strong> est environ <strong>${fmtN(ph)}</strong>. Cette solution est…`, choix: ['acide', 'neutre', 'basique'].map((v) => ({ v, html: capitalize(v) })), bonne: b, rep: b, notion,
    explication: `pH inférieur à 7 : <strong>acide</strong> ; égal à 7 : <strong>neutre</strong> ; supérieur à 7 : <strong>basique</strong>. Ici ${fmtN(ph)} : la solution est <strong>${b}</strong>.${b === 'neutre' ? '' : ` Plus on s'éloigne de 7, plus elle est ${b === 'acide' ? 'acide' : 'basique'}.`}` };
}

function fabPoids(p) {
  const notion = 'Forces, poids et masse';
  const type = pick(p < 0.5 ? [0, 0, 1] : [0, 1, 2]);
  if (type === 0) {
    const m = pick([2, 5, 10, 20, 40, 50, 60]), P = Math.round(m * 9.8 * 10) / 10;
    return { enonce: `Quel est le <strong>poids</strong> sur Terre d'un objet de masse <strong>${m} kg</strong> ? (g = 9,8 N/kg)`, saisie: { type: 'nombre', bonne: P, unite: 'N', tol: 0.051 }, rep: `${fmtN(P)} newtons`, notion,
      voix: `Quel est le poids sur Terre d'un objet de masse ${m} kilogrammes ? g vaut 9,8 newtons par kilogramme.`,
      explication: `<strong>P = m × g</strong> = ${m} × 9,8 = <strong>${fmtN(P)} N</strong>. Le poids est une force, en newtons ; la masse est en kilogrammes.` };
  }
  if (type === 1) {
    const m = pick([60, 75, 90, 100, 120, 150]), P = Math.round(m * 1.6 * 10) / 10;
    return { enonce: `Sur la Lune, g = 1,6 N/kg. Quel est le poids d'un astronaute de <strong>${m} kg</strong> (avec équipement) sur la Lune ?`, saisie: { type: 'nombre', bonne: P, unite: 'N', tol: 0.051 }, rep: `${fmtN(P)} newtons`, notion,
      voix: `Sur la Lune, g vaut 1,6 newton par kilogramme. Quel est le poids d'un astronaute de ${m} kilogrammes sur la Lune ?`,
      explication: `P = m × g = ${m} × 1,6 = <strong>${fmtN(P)} N</strong>. Sa <strong>masse</strong> est la même que sur Terre (${m} kg), mais son poids est environ 6 fois plus faible.` };
  }
  const P = pick([49, 98, 196, 490, 588]), m = Math.round(P / 9.8 * 10) / 10;
  return { enonce: `Un objet a un poids de <strong>${P} N</strong> sur Terre (g = 9,8 N/kg). Quelle est sa masse (en kg) ?`, saisie: { type: 'nombre', bonne: m, unite: 'kg', tol: 0.051 }, rep: `${fmtN(m)} kilogrammes`, notion,
    voix: `Un objet a un poids de ${P} newtons sur Terre, avec g égal à 9,8 newtons par kilogramme. Quelle est sa masse en kilogrammes ?`,
    explication: `m = <strong>P ÷ g</strong> = ${P} ÷ 9,8 = <strong>${fmtN(m)} kg</strong>.` };
}

function fabEnergie43(p) {
  const notion = 'Énergie et puissance';
  const type = pick(p < 0.5 ? [0, 1] : [0, 1, 2, 3]);
  if (type === 0) {
    const P = pick([1, 2, 1.5, 2.5, 0.5]), t = pick([2, 3, 4, 0.5]), E = P * t;
    return { enonce: `Un radiateur de <strong>${fmtN(P)} kW</strong> fonctionne pendant <strong>${fmtN(t)} h</strong>. Quelle énergie consomme-t-il (en kWh) ?`, saisie: { type: 'nombre', bonne: E, unite: 'kWh' }, rep: `${fmtN(E)} kilowattheures`, notion,
      voix: `Un radiateur de ${fmtN(P)} kilowatts fonctionne pendant ${fmtN(t)} heures. Quelle énergie consomme-t-il, en kilowattheures ?`,
      explication: `<strong>E = P × t</strong> = ${fmtN(P)} kW × ${fmtN(t)} h = <strong>${fmtN(E)} kWh</strong>. C'est le kilowattheure que l'on paie sur la facture d'électricité.` };
  }
  if (type === 1) {
    const P = pick([5, 10, 20, 60, 100]), t = pick([10, 30, 60, 120]), E = P * t;
    return { enonce: `Une lampe de <strong>${P} W</strong> reste allumée <strong>${t} s</strong>. Quelle énergie reçoit-elle (en J) ?`, saisie: { type: 'nombre', bonne: E, unite: 'J' }, rep: `${fmtN(E)} joules`, notion,
      voix: `Une lampe de ${P} watts reste allumée ${t} secondes. Quelle énergie reçoit-elle, en joules ?`,
      explication: `E = P × t = ${P} W × ${t} s = <strong>${fmtN(E)} J</strong>. Avec la puissance en watts et la durée en secondes, l'énergie est en <strong>joules</strong>.` };
  }
  if (type === 2) {
    const m = pick([1, 2, 4, 10, 50]), v = pick([2, 4, 10, 20]), Ec = 0.5 * m * v * v;
    return { enonce: `Quelle est l'<strong>énergie cinétique</strong> d'un objet de <strong>${m} kg</strong> qui se déplace à <strong>${v} m/s</strong> (en J) ?`, saisie: { type: 'nombre', bonne: Ec, unite: 'J' }, rep: `${fmtN(Ec)} joules`, notion,
      voix: `Quelle est l'énergie cinétique d'un objet de ${m} kilogrammes qui se déplace à ${v} mètres par seconde, en joules ?`,
      explication: `<strong>Ec = ½ × m × v²</strong> = 0,5 × ${m} × ${v}² = 0,5 × ${m} × ${v * v} = <strong>${fmtN(Ec)} J</strong>. Si la vitesse double, l'énergie cinétique est multipliée par 4 : c'est pourquoi la vitesse est si dangereuse sur la route.` };
  }
  const E = pick([3, 6, 12, 24]), t = pick([2, 3, 4, 6].filter((x) => E % x === 0)), P = E / t;
  return { enonce: `Un appareil a consommé <strong>${E} kWh</strong> en <strong>${t} h</strong>. Quelle est sa puissance (en kW) ?`, saisie: { type: 'nombre', bonne: P, unite: 'kW' }, rep: `${fmtN(P)} kilowatts`, notion,
    voix: `Un appareil a consommé ${E} kilowattheures en ${t} heures. Quelle est sa puissance en kilowatts ?`,
    explication: `P = <strong>E ÷ t</strong> = ${E} ÷ ${t} = <strong>${fmtN(P)} kW</strong>.` };
}

function fabIP() {
  const oct = () => rnd(0, 255), bon = `192.168.${rnd(0, 9)}.${rnd(2, 254)}`;
  const faux = shuffle([`192.168.1.${rnd(256, 399)}`, `${oct()}.${oct()}.${oct()}`, `10.${oct()}.${rnd(300, 999)}.${oct()}`, `172.16.${oct()}.${oct()}.${oct()}`]).slice(0, 3);
  return { enonce: 'Laquelle est une <strong>adresse IP</strong> (version 4) valide ?', choix: shuffle([bon, ...faux]).map((v) => ({ v, html: v })), bonne: bon, rep: bon, notion: 'Réseaux et cybersécurité', voix: 'Laquelle de ces adresses I P, version 4, est valide ?',
    explication: `Une adresse IPv4 est faite de <strong>4 nombres</strong> séparés par des points, chacun entre <strong>0 et 255</strong>. <strong>${bon}</strong> respecte ces règles ; les autres ont un nombre trop grand ou pas le bon nombre de parties.` };
}

/* ============================================================
   4e – 3e : PHYSIQUE-CHIMIE
   n: 0 = plutôt 4e, n: 1 = plutôt 3e
   ============================================================ */
const B_COMBUSTION = [
  { q: 'Une molécule est formée…', r: 'd\'atomes liés entre eux', f: ['de cellules', 'd\'une seule particule indivisible'], e: 'Une <strong>molécule</strong> est un assemblage d\'<strong>atomes</strong> : H₂O = 2 atomes d\'hydrogène + 1 atome d\'oxygène.' },
  { q: 'La formule chimique du dioxyde de carbone est…', r: 'CO₂', f: ['O₂', 'H₂O'], e: '<strong>CO₂</strong> : 1 atome de carbone et 2 atomes d\'oxygène.', v: 'La formule chimique du dioxyde de carbone est…' },
  { q: 'La formule chimique du dioxygène est…', r: 'O₂', f: ['CO₂', 'H₂'], e: '<strong>O₂</strong> : 2 atomes d\'oxygène.' },
  { q: 'Pour qu\'une combustion ait lieu, il faut un combustible, de la chaleur et…', r: 'un comburant (le dioxygène)', f: ['de l\'eau', 'du dioxyde de carbone'], e: 'C\'est le <strong>triangle du feu</strong> : combustible, comburant (dioxygène), énergie d\'activation (chaleur). Enlever un des trois éteint le feu.' },
  { q: 'La combustion du carbone (charbon) dans le dioxygène produit…', r: 'du dioxyde de carbone', f: ['de l\'eau', 'du dioxygène'], e: 'Carbone + dioxygène → <strong>dioxyde de carbone</strong>. On le met en évidence avec l\'eau de chaux, qui se trouble.' },
  { q: 'L\'eau de chaux se trouble en présence de…', r: 'dioxyde de carbone', f: ['dioxygène', 'vapeur d\'eau'], e: 'L\'<strong>eau de chaux</strong> est le test du dioxyde de carbone.' },
  { q: 'Lors d\'une transformation chimique, les atomes…', r: 'se conservent : ils se réarrangent', f: ['disparaissent', 'se créent'], e: 'Les atomes ne disparaissent pas et ne se créent pas : ils se <strong>réorganisent</strong> en de nouvelles molécules. C\'est pourquoi la masse se conserve.', n: 1 },
  { q: 'Lors d\'une combustion en récipient fermé, la masse totale…', r: 'reste la même', f: ['diminue', 'augmente'], e: 'Les atomes se conservent : la <strong>masse totale se conserve</strong> (Lavoisier : « Rien ne se perd, rien ne se crée, tout se transforme »).', n: 1 },
  { q: 'Dans l\'équation « C + O₂ → CO₂ », les réactifs sont…', r: 'C et O₂', f: ['CO₂', 'C seulement'], e: 'Les <strong>réactifs</strong> sont à gauche de la flèche (ils sont consommés), les <strong>produits</strong> à droite (ils se forment).', n: 1, v: 'Dans l\'équation, carbone plus dioxygène donne dioxyde de carbone, les réactifs sont…' },
  { q: 'Une combustion incomplète (manque de dioxygène) peut produire…', r: 'du monoxyde de carbone, un gaz mortel', f: ['de l\'eau pure', 'du dioxygène'], e: 'Le <strong>monoxyde de carbone</strong> (CO) est inodore et toxique : chaudières et chauffages doivent être entretenus et la pièce aérée.', n: 1 },
  { q: 'La combustion du méthane (gaz de ville) produit…', r: 'du dioxyde de carbone et de l\'eau', f: ['seulement de l\'eau', 'du dioxygène'], e: 'CH₄ + 2 O₂ → CO₂ + 2 H₂O : du <strong>dioxyde de carbone</strong> et de l\'<strong>eau</strong>.', n: 1, v: 'La combustion du méthane, le gaz de ville, produit…' },
];
GEN.combustion = genBanque(B_COMBUSTION, 'Atomes, molécules et combustions');

const B_OHM = [
  { q: 'La tension électrique se mesure avec…', r: 'un voltmètre, branché en dérivation', f: ['un ampèremètre, branché en série', 'une balance'], e: 'Le <strong>voltmètre</strong> se branche en dérivation, aux bornes du dipôle. Unité : le <strong>volt</strong> (V).' },
  { q: 'L\'intensité du courant se mesure avec…', r: 'un ampèremètre, branché en série', f: ['un voltmètre, branché en dérivation', 'un thermomètre'], e: 'L\'<strong>ampèremètre</strong> se branche en série, dans le circuit. Unité : l\'<strong>ampère</strong> (A).' },
  { q: 'La loi d\'Ohm s\'écrit…', r: 'U = R × I', f: ['U = R + I', 'I = R × U'], e: 'Loi d\'Ohm : <strong>U = R × I</strong> (U en volts, R en ohms, I en ampères).' },
  { q: 'L\'unité de la résistance est…', r: 'l\'ohm (Ω)', f: ['le volt (V)', 'l\'ampère (A)'], e: 'La résistance se mesure en <strong>ohms</strong> (Ω).' },
  { q: 'Dans un circuit en série, l\'intensité…', r: 'est la même partout', f: ['s\'additionne', 'est nulle'], e: 'Une seule boucle : le courant est <strong>le même</strong> en tout point.' },
  { q: 'Dans un circuit en dérivation, la tension aux bornes de chaque branche…', r: 'est la même', f: ['s\'additionne', 'est nulle'], e: 'Les branches en dérivation ont <strong>la même tension</strong> que le générateur.', n: 1 },
];
GEN.ohm = genMixte(B_OHM, 'Tension, intensité et loi d\'Ohm', fabOhm, 0.65);

const B_SON = [
  { q: 'Le son a besoin pour se propager…', r: 'd\'un milieu matériel (air, eau, solide)', f: ['du vide', 'de la lumière'], e: 'Le son est une <strong>vibration</strong> de la matière : il ne se propage pas dans le vide.' },
  { q: 'Le son va plus vite…', r: 'dans l\'eau et les solides que dans l\'air', f: ['dans l\'air que dans l\'eau', 'dans le vide'], e: 'Environ 340 m/s dans l\'air, 1 500 m/s dans l\'eau, plus de 5 000 m/s dans l\'acier.' },
  { q: 'La lumière se propage…', r: 'beaucoup plus vite que le son, même dans le vide', f: ['moins vite que le son', 'seulement dans l\'air'], e: '<strong>300 000 km/s</strong> dans le vide : c\'est la vitesse limite de l\'Univers.' },
  { q: 'Un son aigu a une fréquence…', r: 'élevée', f: ['faible', 'nulle'], e: 'Plus la vibration est rapide (fréquence en hertz, Hz), plus le son est <strong>aigu</strong>.', n: 1 },
  { q: 'L\'oreille humaine entend les sons entre environ…', r: '20 Hz et 20 000 Hz', f: ['0 et 10 Hz', '1 et 2 Hz'], e: 'En dessous de 20 Hz : infrasons. Au-dessus de 20 000 Hz : <strong>ultrasons</strong> (les chauves-souris les utilisent).', n: 1 },
  { q: 'La lumière blanche du Soleil est…', r: 'un mélange de toutes les couleurs', f: ['d\'une seule couleur', 'invisible'], e: 'Un prisme ou un arc-en-ciel la décompose en un <strong>spectre</strong> : rouge, orange, jaune, vert, bleu, indigo, violet.', n: 1 },
  { q: 'Un niveau sonore supérieur à 85 décibels…', r: 'peut abîmer l\'audition', f: ['est sans danger', 'est inaudible'], e: 'Au-delà de 85 dB (concert, casque trop fort), l\'oreille interne peut être lésée <strong>définitivement</strong>.', n: 1 },
];
GEN.son = genMixte(B_SON, 'Le son et la lumière', fabSon, 0.5);

const B_ATOME = [
  { q: 'Un atome est formé…', r: 'd\'un noyau et d\'électrons qui tournent autour', f: ['seulement d\'électrons', 'de cellules'], e: 'Au centre, le <strong>noyau</strong> (protons et neutrons) ; autour, les <strong>électrons</strong>.' },
  { q: 'Les protons ont une charge…', r: 'positive', f: ['négative', 'nulle'], e: 'Protons : <strong>+</strong> ; électrons : <strong>−</strong> ; neutrons : pas de charge.' },
  { q: 'Les électrons ont une charge…', r: 'négative', f: ['positive', 'nulle'], e: 'Les <strong>électrons</strong> sont négatifs.' },
  { q: 'Un ion positif est un atome qui a…', r: 'perdu un ou des électrons', f: ['gagné des électrons', 'gagné des protons'], e: 'Perdre des électrons (négatifs) rend l\'atome <strong>positif</strong> : Na → Na⁺.', v: 'Un ion positif est un atome qui a…' },
  { q: 'Une solution de pH 3 est…', r: 'acide', f: ['basique', 'neutre'], e: 'pH < 7 : <strong>acide</strong>.' },
  { q: 'Une solution de pH 11 est…', r: 'basique', f: ['acide', 'neutre'], e: 'pH > 7 : <strong>basique</strong>.' },
  { q: 'Le pH se mesure avec…', r: 'du papier pH ou un pH-mètre', f: ['un thermomètre', 'un voltmètre'], e: 'Le <strong>papier pH</strong> change de couleur ; le <strong>pH-mètre</strong> donne une valeur précise.', n: 1 },
  { q: 'Si on dilue un acide avec de l\'eau, son pH…', r: 'se rapproche de 7', f: ['s\'éloigne de 7', 'devient 0'], e: 'Diluer rend la solution <strong>moins acide</strong> : le pH augmente vers 7.', n: 1 },
  { q: 'Le test de l\'ion chlorure (Cl⁻) se fait avec du nitrate d\'argent : il se forme…', r: 'un précipité blanc qui noircit à la lumière', f: ['une flamme bleue', 'aucun changement'], e: 'Le précipité <strong>blanc</strong> de chlorure d\'argent noircit à la lumière : c\'est le test des ions chlorure.', n: 1, v: 'Le test de l\'ion chlorure se fait avec du nitrate d\'argent : il se forme…' },
];
GEN.atome = genMixte(B_ATOME, 'L\'atome, les ions et le pH', fabAtome, 0.55);

const B_FORCES = [
  { q: 'Une force se mesure en…', r: 'newtons (N)', f: ['kilogrammes (kg)', 'joules (J)'], e: 'L\'unité de force est le <strong>newton</strong> (N). On la mesure avec un dynamomètre.' },
  { q: 'Le poids d\'un objet, c\'est…', r: 'la force d\'attraction exercée par la Terre sur lui', f: ['sa masse', 'son volume'], e: 'Le <strong>poids</strong> est une force (en N) ; la masse est une quantité de matière (en kg).' },
  { q: 'La relation entre le poids et la masse est…', r: 'P = m × g', f: ['P = m + g', 'm = P × g'], e: '<strong>P = m × g</strong>, avec g ≈ 9,8 N/kg sur Terre.' },
  { q: 'Sur la Lune, la masse d\'un astronaute…', r: 'est la même que sur Terre', f: ['est plus faible', 'est nulle'], e: 'La <strong>masse ne change pas</strong> ; c\'est le poids qui est environ 6 fois plus faible.' },
  { q: 'Une action à distance, sans contact, c\'est par exemple…', r: 'l\'attraction d\'un aimant sur un clou', f: ['un pied qui pousse un ballon', 'une main qui tire une corde'], e: 'L\'aimant agit <strong>sans contact</strong>, comme la gravitation.' },
  { q: 'La gravitation universelle, c\'est…', r: 'l\'attraction entre tous les objets qui ont une masse', f: ['une force qui n\'existe que sur Terre', 'la force du vent'], e: 'Tous les corps s\'<strong>attirent</strong> : c\'est elle qui fait tourner la Lune autour de la Terre et la Terre autour du Soleil (Newton).', n: 1 },
  { q: 'La gravitation entre deux objets est plus forte quand…', r: 'ils sont plus massifs et plus proches', f: ['ils sont plus légers', 'ils sont plus éloignés'], e: 'Elle augmente avec les <strong>masses</strong> et diminue quand la <strong>distance</strong> augmente.', n: 1 },
  { q: 'Une force se représente par…', r: 'une flèche (point d\'application, direction, sens, valeur)', f: ['un cercle', 'un carré'], e: 'Une flèche montre où la force s\'applique, dans quelle direction et quel sens, et sa longueur indique sa <strong>valeur</strong>.', n: 1 },
];
GEN.forces = genMixte(B_FORCES, 'Forces, poids et masse', fabPoids, 0.45);

const B_ENERGIE43 = [
  { q: 'L\'énergie d\'un objet en mouvement s\'appelle…', r: 'l\'énergie cinétique', f: ['l\'énergie potentielle', 'l\'énergie chimique'], e: '<strong>Cinétique</strong> : liée à la vitesse (Ec = ½ m v²).' },
  { q: 'L\'énergie d\'un objet en hauteur s\'appelle…', r: 'l\'énergie potentielle de position', f: ['l\'énergie cinétique', 'l\'énergie thermique'], e: 'Plus il est <strong>haut</strong>, plus il a d\'énergie potentielle ; en tombant, elle se transforme en énergie cinétique.' },
  { q: 'L\'énergie se mesure en…', r: 'joules (J)', f: ['watts (W)', 'newtons (N)'], e: 'Unité d\'énergie : le <strong>joule</strong>. Le kilowattheure (kWh) sert pour l\'électricité.' },
  { q: 'La puissance se mesure en…', r: 'watts (W)', f: ['joules (J)', 'volts (V)'], e: 'Unité de puissance : le <strong>watt</strong>.' },
  { q: 'La relation entre énergie et puissance est…', r: 'E = P × t', f: ['E = P + t', 'P = E × t'], e: '<strong>E = P × t</strong> : plus un appareil est puissant et longtemps allumé, plus il consomme.', n: 1 },
  { q: 'Si la vitesse d\'une voiture double, son énergie cinétique…', r: 'est multipliée par 4', f: ['double', 'ne change pas'], e: 'Ec dépend du <strong>carré</strong> de la vitesse : 2² = 4. La distance de freinage augmente beaucoup.', n: 1 },
  { q: 'Une balle lâchée du haut d\'un immeuble : pendant la chute…', r: 'son énergie potentielle se transforme en énergie cinétique', f: ['son énergie cinétique diminue', 'elle perd toute son énergie'], e: 'Elle descend (moins d\'énergie potentielle) et accélère (plus d\'énergie cinétique) : l\'énergie se <strong>transforme</strong>.', n: 1 },
];
GEN.energie43 = genMixte(B_ENERGIE43, 'Énergie et puissance', fabEnergie43, 0.55);

/* ============================================================
   4e – 3e : SCIENCES DE LA VIE ET DE LA TERRE
   ============================================================ */
const B_TECTO = [
  { q: 'La surface de la Terre (la lithosphère) est découpée en…', r: 'plaques qui se déplacent lentement', f: ['plaques immobiles', 'cubes de roche'], e: 'Les <strong>plaques lithosphériques</strong> bougent de quelques centimètres par an, à peu près la vitesse de pousse des ongles.' },
  { q: 'La plupart des séismes et des volcans se trouvent…', r: 'aux limites des plaques', f: ['au milieu des plaques', 'au hasard partout'], e: 'C\'est là que les plaques s\'écartent, se rapprochent ou coulissent : <strong>séismes</strong> et <strong>volcans</strong> y sont concentrés.' },
  { q: 'Un volcan à coulées de lave fluide (comme le piton de la Fournaise) a des éruptions…', r: 'effusives', f: ['explosives'], e: 'Lave fluide qui coule : éruption <strong>effusive</strong>.' },
  { q: 'Un volcan dont la lave est épaisse et visqueuse a souvent des éruptions…', r: 'explosives', f: ['effusives'], e: 'La lave visqueuse bloque les gaz qui finissent par exploser : éruption <strong>explosive</strong> (nuées ardentes), très dangereuse.' },
  { q: 'L\'endroit en profondeur où un séisme commence s\'appelle…', r: 'le foyer', f: ['l\'épicentre', 'le cratère'], e: 'Le <strong>foyer</strong> est en profondeur ; l\'<strong>épicentre</strong> est le point de la surface juste au-dessus.' },
  { q: 'L\'appareil qui enregistre les secousses d\'un séisme est…', r: 'un sismographe', f: ['un baromètre', 'un thermomètre'], e: 'Le <strong>sismographe</strong> trace les ondes sismiques (le sismogramme).' },
  { q: 'Au milieu de l\'océan Atlantique, les plaques…', r: 's\'écartent, et une nouvelle croûte océanique se forme', f: ['se rapprochent', 'ne bougent pas'], e: 'Au niveau de la <strong>dorsale</strong>, le magma monte et fabrique de la nouvelle lithosphère : l\'Atlantique s\'élargit de quelques cm par an.', n: 1 },
  { q: 'Quand une plaque océanique plonge sous une autre, c\'est…', r: 'la subduction', f: ['la dorsale', 'l\'érosion'], e: 'La <strong>subduction</strong> provoque des séismes profonds et des volcans explosifs (ex. : Japon, Andes).', n: 1 },
  { q: 'On ne peut pas prévoir précisément un séisme, mais on peut…', r: 'construire des bâtiments parasismiques', f: ['l\'empêcher', 'le faire arriver ailleurs'], e: 'La <strong>prévention</strong> : constructions parasismiques, plans d\'évacuation, exercices.', n: 1 },
  { q: 'Les Alpes et l\'Himalaya se sont formées…', r: 'par la collision de deux plaques', f: ['par une seule éruption', 'par l\'érosion'], e: 'Deux plaques continentales se rapprochent et se <strong>plissent</strong> : les montagnes s\'élèvent.', n: 1 },
];
GEN.tecto = genBanque(B_TECTO, 'Tectonique, volcans et séismes');

const B_REPRO43 = [
  { q: 'La reproduction sexuée fait intervenir…', r: 'deux cellules reproductrices, de deux parents', f: ['un seul parent qui se coupe en deux', 'aucune cellule'], e: '<strong>Reproduction sexuée</strong> : un gamète mâle et un gamète femelle s\'unissent lors de la fécondation.' },
  { q: 'Le fraisier qui produit des stolons, ou la bouture d\'une plante, c\'est…', r: 'une reproduction asexuée', f: ['une reproduction sexuée', 'une fécondation'], e: 'Un seul parent, sans gamètes : <strong>reproduction asexuée</strong>. Les descendants sont identiques au parent.' },
  { q: 'Les gamètes de l\'homme sont produits par…', r: 'les testicules', f: ['les ovaires', 'l\'utérus'], e: 'Les <strong>testicules</strong> produisent les spermatozoïdes, à partir de la puberté et toute la vie.' },
  { q: 'Les gamètes de la femme sont produits par…', r: 'les ovaires', f: ['les testicules', 'l\'utérus'], e: 'Les <strong>ovaires</strong> libèrent en général un ovule par cycle, de la puberté à la ménopause.' },
  { q: 'Les hormones sont…', r: 'des messagers chimiques transportés par le sang', f: ['des cellules nerveuses', 'des microbes'], e: 'Une <strong>hormone</strong> est fabriquée par une glande et agit à distance sur des organes cibles.' },
  { q: 'Le cycle menstruel dure en moyenne…', r: 'environ 28 jours', f: ['7 jours', 'un an'], e: 'Environ <strong>28 jours</strong>, mais il varie d\'une personne à l\'autre. Il est contrôlé par des hormones.', n: 1 },
  { q: 'Les règles correspondent…', r: 'à l\'élimination de la muqueuse de l\'utérus quand il n\'y a pas eu fécondation', f: ['à la fécondation', 'à l\'ovulation'], e: 'Sans fécondation, la muqueuse utérine préparée chaque mois est <strong>éliminée</strong> : ce sont les règles.', n: 1 },
  { q: 'Le préservatif…', r: 'protège à la fois d\'une grossesse et des infections sexuellement transmissibles', f: ['protège seulement d\'une grossesse', 'ne protège de rien'], e: 'C\'est le seul moyen de contraception qui protège aussi des <strong>IST</strong>.', n: 1 },
  { q: 'Les hormones qui déclenchent la puberté sont commandées par…', r: 'le cerveau', f: ['l\'estomac', 'les poumons'], e: 'Une région du <strong>cerveau</strong> (l\'hypothalamus et l\'hypophyse) envoie des hormones qui activent testicules et ovaires.', n: 1 },
  { q: 'La fécondation chez l\'être humain a lieu…', r: 'dans une trompe, près de l\'ovaire', f: ['dans l\'estomac', 'dans le cerveau'], e: 'Le spermatozoïde rencontre l\'ovule dans une <strong>trompe</strong> ; la cellule-œuf descend ensuite s\'implanter dans l\'utérus.', n: 1 },
  { q: 'La testostérone est…', r: 'une hormone produite par les testicules', f: ['un gamète', 'un organe'], e: 'La <strong>testostérone</strong> déclenche les transformations de la puberté chez les garçons.', n: 1 },
];
GEN.repro43 = genBanque(B_REPRO43, 'Reproduction et hormones');

const B_NERFS = [
  { q: 'Le système nerveux comprend…', r: 'le cerveau, la moelle épinière et les nerfs', f: ['le cœur et les vaisseaux', 'l\'estomac et l\'intestin'], e: 'Le <strong>cerveau</strong> et la <strong>moelle épinière</strong> (centres nerveux), reliés au corps par les <strong>nerfs</strong>.' },
  { q: 'Les cellules nerveuses s\'appellent…', r: 'les neurones', f: ['les globules rouges', 'les gamètes'], e: 'Les <strong>neurones</strong> transmettent des messages nerveux électriques.' },
  { q: 'L\'œil, l\'oreille, la peau sont des…', r: 'organes des sens', f: ['centres nerveux', 'muscles'], e: 'Les <strong>organes des sens</strong> captent des informations (récepteurs) et envoient des messages au cerveau.' },
  { q: 'Le trajet d\'un message nerveux lors d\'un mouvement volontaire :', r: 'organe des sens → nerf → cerveau → nerf → muscle', f: ['muscle → cerveau → organe des sens', 'cerveau → œil → muscle'], e: 'Le cerveau reçoit l\'information, l\'<strong>interprète</strong> et commande la réponse.' },
  { q: 'Manquer de sommeil…', r: 'diminue la concentration et la mémoire', f: ['améliore les réflexes', 'n\'a aucun effet'], e: 'Le sommeil permet au cerveau de <strong>récupérer</strong> et de mémoriser ce qu\'on a appris.' },
  { q: 'L\'alcool, le tabac et les drogues…', r: 'perturbent le fonctionnement des neurones et peuvent créer une dépendance', f: ['améliorent le fonctionnement du cerveau', 'n\'agissent que sur l\'estomac'], e: 'Ces substances agissent sur les <strong>synapses</strong> (les zones de communication entre neurones) et peuvent rendre <strong>dépendant</strong>.', n: 1 },
  { q: 'La zone où deux neurones se transmettent un message s\'appelle…', r: 'la synapse', f: ['l\'alvéole', 'le noyau'], e: 'À la <strong>synapse</strong>, le message passe grâce à des substances chimiques, les neurotransmetteurs.', n: 1 },
  { q: 'Conduire après avoir bu de l\'alcool est dangereux parce que…', r: 'le temps de réaction augmente', f: ['la vue devient meilleure', 'les réflexes sont plus rapides'], e: 'L\'alcool <strong>ralentit</strong> la transmission des messages nerveux : on réagit trop tard.', n: 1 },
  { q: 'Écouter de la musique trop fort au casque peut abîmer…', r: 'les cellules de l\'oreille interne, qui ne repoussent pas', f: ['le cerveau directement', 'les dents'], e: 'Les cellules sensorielles de l\'<strong>oreille interne</strong> détruites ne se régénèrent pas : la perte d\'audition est définitive.', n: 1 },
  { q: 'Le réflexe qui fait retirer la main d\'une plaque brûlante passe par…', r: 'la moelle épinière, avant même que le cerveau en soit informé', f: ['l\'estomac', 'les poumons'], e: 'Un <strong>réflexe</strong> est automatique et très rapide : la moelle épinière commande directement le muscle.', n: 1 },
  { q: 'Les messages nerveux sont de nature…', r: 'électrique, puis chimique au niveau des synapses', f: ['sonore', 'lumineuse'], e: 'Le long du neurone, un message <strong>électrique</strong> ; entre deux neurones, des messagers <strong>chimiques</strong>.', n: 1 },
];
GEN.nerfs = genBanque(B_NERFS, 'Le système nerveux');

const B_GENETIQUE = [
  { q: 'Les chromosomes se trouvent…', r: 'dans le noyau des cellules', f: ['dans le sang seulement', 'dans les os seulement'], e: 'Les <strong>chromosomes</strong>, faits d\'ADN, sont dans le noyau de chaque cellule.' },
  { q: 'Une cellule humaine (sauf les gamètes) contient…', r: '46 chromosomes (23 paires)', f: ['23 chromosomes', '100 chromosomes'], e: '<strong>46 chromosomes</strong>, en 23 paires : une moitié vient de la mère, l\'autre du père.' },
  { q: 'Un gamète humain (ovule ou spermatozoïde) contient…', r: '23 chromosomes', f: ['46 chromosomes', '92 chromosomes'], e: 'Un seul chromosome de chaque paire : <strong>23</strong>. À la fécondation, 23 + 23 = 46.' },
  { q: 'Un gène est…', r: 'une portion d\'ADN qui détermine un caractère', f: ['un chromosome entier', 'une cellule'], e: 'Un <strong>gène</strong> est un morceau d\'ADN, à un endroit précis d\'un chromosome.' },
  { q: 'Les différentes versions d\'un même gène s\'appellent…', r: 'des allèles', f: ['des chromosomes', 'des neurones'], e: 'Par exemple, le gène du groupe sanguin a plusieurs <strong>allèles</strong> : A, B, O.' },
  { q: 'Chez l\'être humain, le sexe est déterminé par la paire de chromosomes…', r: 'XX ou XY', f: ['n° 1', 'il n\'y a pas de chromosomes sexuels'], e: '<strong>XX</strong> : femme ; <strong>XY</strong> : homme. C\'est le spermatozoïde (X ou Y) qui détermine le sexe.' },
  { q: 'La mitose est une division cellulaire qui produit…', r: 'deux cellules identiques à la cellule de départ', f: ['des gamètes à 23 chromosomes', 'quatre cellules différentes'], e: 'La <strong>mitose</strong> sert à la croissance et à la réparation : chaque cellule fille a les mêmes 46 chromosomes.', n: 1 },
  { q: 'La méiose produit…', r: 'les gamètes, avec la moitié des chromosomes', f: ['des cellules de peau', 'des cellules identiques à 46 chromosomes'], e: 'La <strong>méiose</strong> donne des gamètes à 23 chromosomes, tous différents : c\'est une source de diversité.', n: 1 },
  { q: 'Deux enfants des mêmes parents (sauf vrais jumeaux) sont différents parce que…', r: 'chacun reçoit une combinaison différente d\'allèles', f: ['ils n\'ont pas les mêmes parents', 'leurs gènes changent tous les jours'], e: 'La méiose et la fécondation <strong>brassent</strong> les allèles : chaque enfant est unique.', n: 1 },
  { q: 'Les vrais jumeaux ont…', r: 'les mêmes allèles, car ils viennent du même œuf', f: ['des allèles différents', 'des chromosomes différents'], e: 'Ils viennent d\'une <strong>seule cellule-œuf</strong> qui s\'est séparée en deux.', n: 1 },
];
GEN.genetique = genBanque(B_GENETIQUE, 'Chromosomes, ADN et gènes');

const B_EVOLUTION = [
  { q: 'Selon la théorie de l\'évolution, les espèces…', r: 'se transforment au cours des générations', f: ['ne changent jamais', 'apparaissent toutes en même temps'], e: 'Les espèces <strong>évoluent</strong> : des fossiles et des comparaisons le montrent.' },
  { q: 'Le scientifique qui a proposé la sélection naturelle est…', r: 'Charles Darwin', f: ['Louis Pasteur', 'Isaac Newton'], e: '<strong>Charles Darwin</strong> l\'a exposée en 1859 dans <em>L\'Origine des espèces</em>.' },
  { q: 'La sélection naturelle, c\'est le fait que…', r: 'les individus les mieux adaptés à leur milieu se reproduisent davantage', f: ['les animaux choisissent de changer', 'les plus gros gagnent toujours'], e: 'Les individus porteurs de caractères <strong>avantageux</strong> dans leur milieu survivent et se reproduisent plus : ces caractères deviennent plus fréquents.' },
  { q: 'La source de nouveauté, à l\'origine de la diversité des individus, est…', r: 'les mutations de l\'ADN', f: ['la volonté de l\'animal', 'l\'entraînement'], e: 'Les <strong>mutations</strong> créent de nouveaux allèles, par hasard ; la sélection naturelle trie ensuite.', n: 1 },
  { q: 'Des bactéries deviennent résistantes à un antibiotique parce que…', r: 'celles qui ont une mutation de résistance survivent et se multiplient', f: ['elles apprennent à résister', 'l\'antibiotique les rend plus fortes'], e: 'C\'est la <strong>sélection naturelle</strong> en direct : d\'où l\'importance de ne pas prendre d\'antibiotiques inutilement.', n: 1 },
  { q: 'L\'être humain et le chimpanzé…', r: 'ont un ancêtre commun', f: ['le chimpanzé est notre ancêtre direct', 'n\'ont aucun lien de parenté'], e: 'Nous ne descendons pas du chimpanzé : nous partageons un <strong>ancêtre commun</strong> qui vivait il y a quelques millions d\'années.', n: 1 },
  { q: 'Une phalène (papillon) claire sur des troncs noircis par la pollution…', r: 'est plus facilement mangée par les oiseaux', f: ['est mieux cachée', 'devient noire'], e: 'Les formes sombres, mieux <strong>camouflées</strong>, ont été favorisées : exemple célèbre de sélection naturelle en Angleterre.', n: 1 },
  { q: 'Un caractère acquis pendant la vie (des muscles développés par le sport)…', r: 'ne se transmet pas aux enfants', f: ['se transmet aux enfants', 'modifie l\'ADN des gamètes'], e: 'Seuls les caractères inscrits dans l\'<strong>ADN des gamètes</strong> se transmettent.', n: 1 },
  { q: 'Les fossiles permettent de montrer…', r: 'que des espèces ont existé puis disparu, et que les espèces ont changé', f: ['que les espèces n\'ont jamais changé', 'la couleur exacte des dinosaures toujours'], e: 'Les <strong>fossiles</strong> sont les archives de l\'évolution.' },
  { q: 'Une mutation est…', r: 'une modification de l\'ADN', f: ['un changement de saison', 'une maladie toujours grave'], e: 'Une <strong>mutation</strong> peut être sans effet, défavorable ou avantageuse.' },
  { q: 'L\'évolution d\'une espèce se fait…', r: 'sur de nombreuses générations', f: ['pendant la vie d\'un seul individu', 'en une seule nuit'], e: 'C\'est une <strong>population</strong> qui évolue, de génération en génération.', n: 1 },
];
GEN.evolution = genBanque(B_EVOLUTION, 'L\'évolution et la sélection naturelle');

const B_IMMUNO = [
  { q: 'La peau et les muqueuses sont…', r: 'des barrières naturelles contre les microbes', f: ['des cellules du sang', 'des antibiotiques'], e: 'La première défense : la <strong>peau</strong>, les muqueuses, les larmes, le mucus.' },
  { q: 'La phagocytose, c\'est…', r: 'des globules blancs qui avalent et digèrent les microbes', f: ['la multiplication des microbes', 'un médicament'], e: 'Les <strong>phagocytes</strong> englobent les microbes : c\'est une réaction rapide et non spécifique.' },
  { q: 'Les anticorps sont produits par…', r: 'des lymphocytes', f: ['les globules rouges', 'les neurones'], e: 'Les <strong>lymphocytes B</strong> produisent des anticorps, spécifiques d\'un microbe.' },
  { q: 'Un vaccin contient…', r: 'un microbe rendu inoffensif, ou un morceau de microbe', f: ['un antibiotique', 'un microbe dangereux non modifié'], e: 'Le vaccin « entraîne » le système immunitaire, qui garde une <strong>mémoire</strong> : en cas de vraie infection, il réagit vite.' },
  { q: 'Les antibiotiques agissent…', r: 'sur les bactéries, mais pas sur les virus', f: ['sur les virus', 'sur tous les microbes'], e: 'Un antibiotique est <strong>inutile contre un virus</strong> (grippe, rhume) : « les antibiotiques, c\'est pas automatique ».' },
  { q: 'La grippe est due à…', r: 'un virus', f: ['une bactérie', 'un champignon'], e: 'La grippe est <strong>virale</strong> : les antibiotiques ne la soignent pas.' },
  { q: 'Les lymphocytes T…', r: 'détruisent les cellules infectées par un virus', f: ['fabriquent les globules rouges', 'transportent le dioxygène'], e: 'Les <strong>lymphocytes T</strong> tueurs reconnaissent et détruisent les cellules infectées.', n: 1 },
  { q: 'Après un vaccin, le corps garde…', r: 'des lymphocytes mémoire', f: ['le microbe pour toujours', 'aucun souvenir'], e: 'Les <strong>cellules mémoire</strong> permettent une réponse rapide et forte lors d\'un contact ultérieur.', n: 1 },
  { q: 'La vaccination d\'une grande partie de la population protège aussi…', r: 'les personnes qui ne peuvent pas être vaccinées', f: ['personne d\'autre', 'seulement les animaux'], e: 'Si le microbe ne circule plus, les plus fragiles sont protégés : c\'est l\'<strong>immunité collective</strong>.', n: 1 },
  { q: 'Le scientifique qui a mis au point le premier vaccin contre la rage est…', r: 'Louis Pasteur', f: ['Charles Darwin', 'Marie Curie'], e: '<strong>Louis Pasteur</strong>, en 1885, avec le jeune Joseph Meister.', n: 1 },
];
GEN.immuno = genBanque(B_IMMUNO, 'Microbes, défenses du corps et vaccination');

const B_ENJEUX = [
  { q: 'La transition énergétique consiste à…', r: 'remplacer les énergies fossiles par des énergies bas-carbone', f: ['brûler plus de charbon', 'consommer plus d\'énergie'], e: 'Moins de pétrole, de charbon et de gaz, plus d\'<strong>énergies renouvelables</strong>, et moins de gaspillage.' },
  { q: 'La principale cause du réchauffement climatique actuel est…', r: 'l\'augmentation des gaz à effet de serre due aux activités humaines', f: ['le rapprochement de la Terre et du Soleil', 'les volcans'], e: 'Le <strong>CO₂</strong> et le méthane émis par les humains renforcent l\'effet de serre (constat du GIEC).' },
  { q: 'Une ressource non renouvelable est…', r: 'une ressource dont le stock s\'épuise (pétrole, minerais)', f: ['une ressource qui se renouvelle vite', 'le vent'], e: 'Pétrole, gaz, charbon, minerais : leurs stocks sont <strong>limités</strong>.' },
  { q: 'La biodiversité diminue surtout à cause…', r: 'de la destruction des milieux, de la pollution et du changement climatique', f: ['des parcs nationaux', 'du recyclage'], e: 'Les principales menaces : <strong>destruction des habitats</strong>, surexploitation, pollution, espèces invasives, climat.' },
  { q: 'Le développement durable cherche à…', r: 'répondre aux besoins d\'aujourd\'hui sans compromettre ceux des générations futures', f: ['produire le plus possible tout de suite', 'arrêter toute activité humaine'], e: 'Trois piliers : <strong>environnement</strong>, <strong>économie</strong>, <strong>social</strong>.', n: 1 },
  { q: 'L\'empreinte carbone, c\'est…', r: 'la quantité de gaz à effet de serre émise par une activité ou une personne', f: ['la trace laissée par une chaussure', 'la quantité de charbon dans le sol'], e: 'On la mesure en tonnes d\'<strong>équivalent CO₂</strong> : transports, alimentation, logement, achats.', n: 1 },
  { q: 'L\'acidification des océans est due…', r: 'au CO₂ de l\'air qui se dissout dans l\'eau de mer', f: ['au sel', 'aux poissons'], e: 'Plus de CO₂ dans l\'air → plus dans l\'eau → pH plus bas : les coraux et les coquillages en souffrent.', n: 1 },
  { q: 'Lequel réduit le plus son empreinte carbone ?', r: 'prendre le train plutôt que l\'avion', f: ['prendre l\'avion pour un court trajet', 'laisser le chauffage à fond fenêtres ouvertes'], e: 'Le <strong>train</strong> émet bien moins de CO₂ par voyageur que l\'avion ou la voiture.', n: 1 },
  { q: 'Les énergies renouvelables sont par exemple…', r: 'le solaire, l\'éolien, l\'hydraulique', f: ['le pétrole, le charbon', 'le gaz naturel'], e: 'Elles se renouvellent à notre échelle de temps et émettent <strong>peu de CO₂</strong>.' },
  { q: 'Le GIEC est…', r: 'un groupe de scientifiques qui étudie le changement climatique', f: ['une entreprise pétrolière', 'un parc national'], e: 'Le <strong>GIEC</strong> rassemble et évalue les travaux scientifiques sur le climat.', n: 1 },
  { q: 'Manger moins de viande permet de…', r: 'réduire les émissions de gaz à effet de serre', f: ['les augmenter', 'n\'avoir aucun effet'], e: 'L\'élevage émet beaucoup de <strong>méthane</strong> et demande de grandes surfaces.', n: 1 },
];
GEN.enjeux = genBanque(B_ENJEUX, 'Les enjeux planétaires');

/* ============================================================
   4e – 3e : TECHNOLOGIE
   ============================================================ */
const B_CONNECTE = [
  { q: 'Un objet connecté, c\'est…', r: 'un objet qui échange des informations par un réseau', f: ['un objet branché sur une prise', 'un objet en métal'], e: 'Montre, thermostat, enceinte, ampoule… un <strong>objet connecté</strong> communique avec d\'autres appareils, souvent par Internet.' },
  { q: 'Le Bluetooth sert surtout à communiquer…', r: 'sans fil, sur une courte distance', f: ['par câble, à l\'autre bout du monde', 'par la lumière visible'], e: 'Le <strong>Bluetooth</strong> relie des appareils proches (écouteurs, montre) par ondes radio.' },
  { q: 'Un protocole de communication, c\'est…', r: 'un ensemble de règles pour que les appareils se comprennent', f: ['un câble', 'un mot de passe'], e: 'Comme une langue commune : Wi-Fi, Bluetooth, HTTP sont des <strong>protocoles</strong>.' },
  { q: 'Un thermostat connecté mesure la température grâce à…', r: 'un capteur', f: ['un actionneur', 'un écran'], e: 'Le <strong>capteur</strong> de température acquiert l\'information, envoyée ensuite au téléphone ou à la chaudière.' },
  { q: 'Les informations numériques circulent sous forme de…', r: 'signaux codés en binaire', f: ['lettres manuscrites', 'sons audibles'], e: 'Elles sont codées en <strong>0 et 1</strong>, puis transmises par des signaux électriques, lumineux (fibre optique) ou radio.', n: 1 },
  { q: 'La fibre optique transporte l\'information grâce à…', r: 'la lumière', f: ['le son', 'l\'eau'], e: 'Des impulsions de <strong>lumière</strong> voyagent dans un fil de verre très fin : c\'est très rapide.', n: 1 },
  { q: 'Un risque des objets connectés est…', r: 'la collecte et le piratage des données personnelles', f: ['qu\'ils soient trop lourds', 'qu\'ils consomment de l\'eau'], e: 'Ils peuvent collecter beaucoup de <strong>données personnelles</strong> : il faut changer les mots de passe par défaut et les mettre à jour.', n: 1 },
  { q: 'Le débit d\'une connexion s\'exprime en…', r: 'bits par seconde (Mbit/s)', f: ['kilogrammes', 'degrés'], e: 'Le <strong>débit</strong> est la quantité d\'informations transmises chaque seconde.', n: 1 },
  { q: 'L\'émetteur et le récepteur d\'une enceinte Bluetooth sont…', r: 'le téléphone qui envoie la musique et l\'enceinte qui la reçoit', f: ['deux enceintes', 'le chargeur et la prise'], e: 'Le téléphone <strong>émet</strong>, l\'enceinte <strong>reçoit</strong>.' },
  { q: 'Pour qu\'un objet connecté accède à Internet depuis la maison, il passe souvent par…', r: 'la box (le routeur)', f: ['le lave-linge', 'l\'imprimante seulement'], e: 'La <strong>box</strong> relie le réseau de la maison à Internet.' },
];
GEN.connecte = genBanque(B_CONNECTE, 'Les objets connectés');

const B_SIMU = [
  { q: 'Une simulation numérique sert à…', r: 'prévoir le comportement d\'un objet avant de le fabriquer', f: ['décorer l\'objet', 'remplacer tous les essais réels pour toujours'], e: 'On teste sur ordinateur (résistance, mouvement, température) pour <strong>gagner du temps et de l\'argent</strong>.' },
  { q: 'Un modèle numérique est…', r: 'une représentation simplifiée de la réalité', f: ['la réalité exacte', 'un objet en plastique'], e: 'Un <strong>modèle</strong> simplifie : ses résultats doivent être comparés à des mesures réelles.' },
  { q: 'Avant de construire un pont, les ingénieurs simulent…', r: 'les charges et le vent qu\'il devra supporter', f: ['sa couleur', 'son nom'], e: 'La simulation montre où la structure est la plus <strong>sollicitée</strong> et si elle résiste.' },
  { q: 'Les prévisions météo reposent sur…', r: 'des simulations numériques de l\'atmosphère', f: ['le hasard', 'un seul thermomètre'], e: 'Des supercalculateurs simulent l\'évolution de l\'<strong>atmosphère</strong> à partir de millions de mesures.' },
  { q: 'Un avantage de la simulation sur les essais réels :', r: 'tester de nombreuses versions sans détruire de prototype', f: ['elle est toujours parfaitement exacte', 'elle n\'utilise pas d\'ordinateur'], e: 'On peut changer un paramètre (matériau, épaisseur) et <strong>comparer</strong> rapidement.', n: 1 },
  { q: 'Les résultats d\'une simulation doivent être…', r: 'vérifiés par des essais réels', f: ['acceptés sans vérification', 'effacés'], e: 'Un modèle peut se tromper : on <strong>valide</strong> avec des mesures sur un prototype.', n: 1 },
  { q: 'Dans une simulation, un paramètre que l\'on fait varier s\'appelle…', r: 'une variable d\'entrée', f: ['un résultat', 'un périphérique'], e: 'On change une <strong>entrée</strong> (vitesse, masse, matériau) et on observe l\'effet sur la <strong>sortie</strong>.', n: 1 },
  { q: 'Les « crash-tests » de voitures sont souvent d\'abord…', r: 'simulés sur ordinateur', f: ['faits avec des passagers', 'interdits'], e: 'On simule des milliers de chocs avant quelques crash-tests réels, plus coûteux.', n: 1 },
  { q: 'La modélisation 3D d\'une pièce permet de…', r: 'la visualiser et la tester avant de la fabriquer', f: ['la manger', 'la rendre invisible'], e: 'Avec le modèle 3D, on vérifie les dimensions, l\'assemblage, et on peut la <strong>simuler</strong>.' },
  { q: 'Simuler le mouvement d\'un robot permet de vérifier…', r: 'que le programme fait ce qui est prévu', f: ['la couleur de ses roues', 'son prix de vente'], e: 'On teste le <strong>programme</strong> dans un simulateur avant de le téléverser sur le vrai robot.', n: 1 },
];
GEN.simu = genBanque(B_SIMU, 'La simulation numérique');

const B_CARTE = [
  { q: 'Une carte programmable (Micro:bit, Arduino) contient…', r: 'un microcontrôleur qui exécute le programme', f: ['un moteur à essence', 'une batterie de voiture'], e: 'Le <strong>microcontrôleur</strong> est un petit ordinateur sur une puce : il lit les capteurs et commande les actionneurs.' },
  { q: 'Un événement, en programmation, c\'est…', r: 'une action qui déclenche une partie du programme (bouton appuyé)', f: ['une erreur', 'une variable'], e: '« Quand le bouton A est pressé » est un <strong>événement</strong>.' },
  { q: 'Sur la carte Micro:bit, l\'accéléromètre est…', r: 'un capteur qui détecte les mouvements', f: ['un actionneur', 'une mémoire'], e: 'L\'<strong>accéléromètre</strong> détecte quand on secoue ou incline la carte.' },
  { q: 'Pour compter le nombre d\'appuis sur un bouton, on utilise…', r: 'une variable', f: ['une boucle infinie seulement', 'un capteur de lumière'], e: 'Une <strong>variable</strong> « compteur » augmente de 1 à chaque appui.' },
  { q: 'Le programme principal d\'une carte tourne souvent dans…', r: 'une boucle « répéter indéfiniment »', f: ['une seule instruction', 'une condition sans boucle'], e: 'La carte <strong>surveille en permanence</strong> ses capteurs.', n: 1 },
  { q: 'Téléverser un programme, c\'est…', r: 'l\'envoyer de l\'ordinateur vers la carte', f: ['l\'effacer', 'l\'imprimer'], e: 'On écrit le programme sur l\'ordinateur puis on le <strong>téléverse</strong> sur la carte.', n: 1 },
  { q: 'Un buzzer ou une LED sur une carte sont…', r: 'des actionneurs', f: ['des capteurs', 'des variables'], e: 'Ils <strong>agissent</strong> : son, lumière.', n: 1 },
];
GEN.carte = genMixte(B_CARTE, 'Variables, événements et capteurs', fabAlgo65, 0.35);

const B_PROJET = [
  { q: 'Le développement durable repose sur trois piliers :', r: 'environnemental, économique et social', f: ['sportif, musical et artistique', 'rapide, cher et lourd'], e: 'Un projet durable respecte l\'<strong>environnement</strong>, est <strong>économiquement</strong> viable et <strong>socialement</strong> juste.' },
  { q: 'Le cycle de vie d\'un objet va…', r: 'de l\'extraction des matières premières jusqu\'à son recyclage', f: ['seulement de l\'achat à la poubelle', 'seulement de la fabrication'], e: 'Extraction, fabrication, transport, utilisation, <strong>fin de vie</strong> : chaque étape a un impact.' },
  { q: 'L\'écoconception consiste à…', r: 'concevoir un objet en limitant son impact sur l\'environnement', f: ['le peindre en vert', 'le rendre jetable'], e: 'Moins de matière, matériaux recyclables, réparable, économe en énergie : c\'est l\'<strong>écoconception</strong>.' },
  { q: 'Dans un projet, les tâches et les délais se planifient avec…', r: 'un planning (diagramme de Gantt)', f: ['un thermomètre', 'une boussole'], e: 'Le <strong>diagramme de Gantt</strong> montre qui fait quoi, et quand.', n: 1 },
  { q: 'Valider un prototype, c\'est…', r: 'vérifier qu\'il respecte toutes les exigences du cahier des charges', f: ['le jeter', 'le peindre'], e: 'On mesure, on teste, on compare aux <strong>critères</strong> du cahier des charges.', n: 1 },
  { q: 'Un objet réparable et dont on trouve les pièces détachées…', r: 'dure plus longtemps et produit moins de déchets', f: ['pollue davantage', 'coûte toujours plus cher à l\'usage'], e: 'Allonger la <strong>durée de vie</strong> est l\'un des meilleurs moyens de réduire l\'impact d\'un objet.', n: 1 },
  { q: 'L\'obsolescence programmée, c\'est…', r: 'réduire volontairement la durée de vie d\'un produit', f: ['un programme informatique', 'une méthode de recyclage'], e: 'Pratique interdite en France depuis 2015 : un produit conçu pour tomber en panne trop tôt.', n: 1 },
  { q: 'Pour comparer deux solutions techniques, on peut utiliser…', r: 'un tableau de critères (coût, masse, impact…)', f: ['le hasard', 'seulement la couleur'], e: 'On note chaque solution selon les <strong>critères</strong> du cahier des charges et on choisit la meilleure.', n: 1 },
  { q: 'Un projet pluridisciplinaire fait travailler ensemble…', r: 'plusieurs disciplines (technologie, sciences, mathématiques…)', f: ['une seule personne', 'seulement des ordinateurs'], e: 'Comme dans les métiers réels, il faut <strong>croiser</strong> les compétences.' },
  { q: 'Une énergie bas-carbone pour alimenter un prototype autonome :', r: 'un petit panneau solaire', f: ['un groupe électrogène au fioul', 'des piles jetables changées chaque jour'], e: 'Le <strong>panneau solaire</strong> fournit une énergie renouvelable sur place.' },
];
GEN.projet = genBanque(B_PROJET, 'Projet et développement durable');

const B_CYBER = [
  { q: 'Une adresse IP sert à…', r: 'identifier un appareil sur un réseau', f: ['protéger un mot de passe', 'mesurer le débit'], e: 'Comme une adresse postale : elle permet aux données d\'<strong>arriver au bon appareil</strong>.' },
  { q: 'Le routage, c\'est…', r: 'choisir le chemin des paquets de données entre les réseaux', f: ['effacer les données', 'chiffrer un message'], e: 'Les <strong>routeurs</strong> font passer chaque paquet de réseau en réseau jusqu\'à sa destination.' },
  { q: 'Un bon mot de passe est…', r: 'long, avec des lettres, des chiffres et des symboles, différent pour chaque site', f: ['son prénom', '123456', 'le même partout'], e: 'Long et unique : il est beaucoup plus difficile à deviner. Un gestionnaire de mots de passe aide à les retenir.' },
  { q: 'Le « hameçonnage » (phishing), c\'est…', r: 'un faux message qui cherche à voler des identifiants', f: ['un jeu vidéo de pêche', 'une mise à jour officielle'], e: 'On ne clique pas sur un lien suspect et on ne donne <strong>jamais</strong> son mot de passe par message.' },
  { q: 'Le chiffrement des données sert à…', r: 'les rendre illisibles pour ceux qui n\'ont pas la clé', f: ['les compter', 'les rendre plus lourdes'], e: 'Le <strong>https</strong> chiffre les échanges entre le navigateur et le site.' },
  { q: 'La double authentification, c\'est…', r: 'demander un code en plus du mot de passe', f: ['avoir deux comptes', 'écrire deux fois son mot de passe'], e: 'Même si le mot de passe est volé, il faut le <strong>second code</strong> (SMS, application).', n: 1 },
  { q: 'Le serveur DNS sert à…', r: 'traduire un nom de site en adresse IP', f: ['stocker les photos', 'bloquer les virus'], e: 'Le <strong>DNS</strong> est l\'annuaire d\'Internet : il trouve l\'adresse IP qui correspond à « exemple.fr ».', n: 1 },
  { q: 'Le RGPD est…', r: 'une loi européenne qui protège les données personnelles', f: ['un virus', 'un réseau Wi-Fi'], e: 'Le <strong>RGPD</strong> donne des droits sur ses données (accès, effacement) et oblige les entreprises à les protéger.', n: 1 },
  { q: 'Faire des mises à jour régulières permet…', r: 'de corriger des failles de sécurité', f: ['de rendre l\'appareil plus lent volontairement', 'rien du tout'], e: 'Les <strong>mises à jour</strong> bouchent les failles que les pirates pourraient utiliser.', n: 1 },
];
GEN.cyber = genMixte(B_CYBER, 'Réseaux et cybersécurité', fabIP, 0.25);

const B_FONC = [
  { q: 'Un algorithme peut se représenter par…', r: 'un organigramme (logigramme)', f: ['un cahier des charges', 'une facture'], e: 'L\'<strong>organigramme</strong> utilise des formes : ovale pour début/fin, rectangle pour une action, losange pour une condition.' },
  { q: 'Dans un organigramme, la forme en losange représente…', r: 'une condition (un test)', f: ['une action', 'le début du programme'], e: 'Le <strong>losange</strong> : une question avec deux sorties, « oui » et « non ».' },
  { q: 'Dans un organigramme, un rectangle représente…', r: 'une action (une instruction)', f: ['une condition', 'la fin'], e: 'Le <strong>rectangle</strong> : une instruction à exécuter.' },
  { q: 'Le diagramme qui montre la chaîne d\'énergie et la chaîne d\'information d\'un système est…', r: 'une représentation fonctionnelle', f: ['un diagramme de Gantt', 'un organigramme'], e: 'Elle montre les <strong>fonctions</strong> (acquérir, traiter, communiquer ; alimenter, distribuer, convertir, transmettre) et les composants qui les réalisent.' },
  { q: 'Dans un ascenseur, le capteur qui détecte l\'étage atteint fait partie de…', r: 'la chaîne d\'information (acquérir)', f: ['la chaîne d\'énergie (convertir)'], e: 'Il <strong>acquiert</strong> une information : chaîne d\'information.', n: 1 },
  { q: 'Dans un ascenseur, le moteur qui fait monter la cabine…', r: 'convertit l\'énergie électrique en énergie mécanique', f: ['acquiert l\'information', 'traite l\'information'], e: 'Le moteur est le <strong>convertisseur</strong> de la chaîne d\'énergie.', n: 1 },
  { q: 'Dans un portail automatique, le relais qui autorise le passage du courant vers le moteur sert à…', r: 'distribuer l\'énergie', f: ['convertir l\'énergie', 'acquérir l\'information'], e: 'Le relais (ou le variateur) <strong>distribue</strong> l\'énergie selon les ordres du programme.', n: 1 },
  { q: 'Dans un organigramme, une flèche qui revient en arrière représente…', r: 'une boucle', f: ['une condition', 'la fin du programme'], e: 'Revenir en arrière, c\'est <strong>répéter</strong> une partie de l\'algorithme.', n: 1 },
  { q: 'Dans un organigramme, l\'ovale représente…', r: 'le début ou la fin', f: ['une action', 'une condition'], e: 'L\'<strong>ovale</strong> marque le début et la fin de l\'algorithme.' },
  { q: 'Le diagramme fonctionnel d\'un système automatisé sépare…', r: 'la chaîne d\'information et la chaîne d\'énergie', f: ['le début et la fin', 'les entrées et la couleur'], e: 'En haut, la chaîne d\'<strong>information</strong> (qui décide) ; en bas, la chaîne d\'<strong>énergie</strong> (qui agit).' },
];
GEN.fonc43 = genMixte(B_FONC, 'Représentation fonctionnelle et algorithmes', fabAlgo65, 0.3);

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
const NOTION_QUIZ = { 'ce-matiere': 'Cours CE : matière, mouvement, énergie', 'ce-vivant': 'Cours CE : le vivant', 'ce-technique': 'Cours CE : objets techniques et Terre' };
function questionsQuiz(cle, n) {
  return shuffle(QUIZ[cle]).slice(0, n).map((x) => {
    /* une illustration quand le quiz en a une (CE : scènes dans le style de MNEMOGRAM ; autres niveaux : schémas à la craie) */
    const sc = typeof SCENES_QUIZ_CE !== 'undefined' ? SCENES_QUIZ_CE[x.q] : null;
    const figure = sc ? `<span class="illus-ce">${ILLUS.svgIllus(sc, x.q.replace(/<[^>]+>/g, ''))}</span>` : (typeof schemaQuiz === 'function' ? schemaQuiz(cle, x.q) || undefined : undefined);
    const base = { figure, enonce: `<span class="mm-cours">Question de cours</span>${x.q.replace(/…/, '<span class="mm-trou">…</span>')}`, voix: x.v || (typeof x.r === 'number' ? x.q : x.q.replace(/…/g, '')), explication: x.e, notion: NOTION_QUIZ[cle], court: x.q.replace(/<[^>]+>/g, '') };
    if (typeof x.r === 'number') return { ...base, saisie: { type: 'nombre', bonne: x.r, unite: x.u, neg: x.r < 0 }, rep: fmtN(x.r) };
    return { ...base, choix: shuffle([x.r, ...x.f]).map((v) => ({ v, html: v })), bonne: x.r, rep: x.r };
  });
}

/* --- Les quiz de cours du CM1 – CM2 --- */
Object.assign(QUIZ, {
  'cm-matiere': [
    { q: 'Le bois, le coton, la laine sont des matériaux…', r: 'd\'origine vivante', f: ['minéraux', 'métalliques'], e: 'Ils viennent d\'êtres vivants : c\'est de la <strong>matière organique</strong>.' },
    { q: 'Le verre est fabriqué à partir de…', r: 'sable', f: ['pétrole', 'bois'], e: 'Le verre est du <strong>sable</strong> fondu.' },
    { q: 'Le plastique est surtout fabriqué à partir de…', r: 'pétrole', f: ['sable', 'coton'], e: 'Le plastique vient du <strong>pétrole</strong>.' },
    { q: 'Un aimant attire…', r: 'le fer et l\'acier', f: ['tous les métaux', 'le plastique'], e: 'Il attire le <strong>fer</strong> et l\'acier, pas l\'aluminium ni le cuivre.' },
    { q: 'Un matériau qui laisse passer le courant est…', r: 'conducteur', f: ['isolant'], e: 'Les métaux sont <strong>conducteurs</strong>.' },
    { q: 'Un mélange où l\'on ne distingue qu\'une seule chose est…', r: 'homogène', f: ['hétérogène'], e: 'Eau sucrée : mélange <strong>homogène</strong>.' },
    { q: 'Un mélange où l\'on distingue plusieurs constituants est…', r: 'hétérogène', f: ['homogène'], e: 'Eau et sable : mélange <strong>hétérogène</strong>.' },
    { q: 'Le sel « disparaît » dans l\'eau : il…', r: 'se dissout', f: ['fond', 's\'évapore'], e: 'Il se <strong>dissout</strong>, il est toujours là.' },
    { q: 'Séparer avec un filtre, c\'est…', r: 'la filtration', f: ['la décantation', 'la dissolution'], e: 'La <strong>filtration</strong> retient les particules solides.' },
    { q: 'Laisser les particules tomber au fond, c\'est…', r: 'la décantation', f: ['la filtration', 'l\'évaporation'], e: 'La <strong>décantation</strong>.' },
    { q: 'Le soleil, le vent, l\'eau sont des énergies…', r: 'renouvelables', f: ['non renouvelables'], e: 'Elles ne s\'épuisent pas : <strong>renouvelables</strong>.' },
    { q: 'Le pétrole, le charbon, le gaz sont des énergies…', r: 'non renouvelables (fossiles)', f: ['renouvelables'], e: 'Leurs réserves <strong>s\'épuisent</strong>.' },
    { q: 'La ligne suivie par un objet en mouvement s\'appelle…', r: 'la trajectoire', f: ['la vitesse', 'la chronophotographie'], e: 'La <strong>trajectoire</strong> : rectiligne, circulaire ou curviligne.' },
    { q: 'Une trajectoire en ligne droite est…', r: 'rectiligne', f: ['circulaire', 'curviligne'], e: 'Ligne droite : <strong>rectiligne</strong>.' },
    { q: 'Un mouvement à vitesse constante est…', r: 'uniforme', f: ['accéléré', 'ralenti'], e: 'Vitesse constante : mouvement <strong>uniforme</strong>.' },
    { q: 'Dans une chaîne d\'énergie, l\'ampoule d\'une lampe de poche est…', r: 'le convertisseur', f: ['la source', 'l\'énergie utile'], e: 'Pile (source) → ampoule (<strong>convertisseur</strong>) → lumière.' },
    { q: 'Un moteur électrique transforme l\'électricité en…', r: 'mouvement', f: ['lumière', 'son'], e: 'Énergie électrique → <strong>mouvement</strong>.' },
    { q: 'Le téléphone portable utilise des signaux…', r: 'radio', f: ['sonores', 'lumineux'], e: 'Des <strong>ondes radio</strong>, invisibles.' },
    { q: 'Un signal sert à…', r: 'transmettre une information', f: ['produire de l\'énergie'], e: 'Un signal transporte une <strong>information</strong>.' },
    { q: 'Le son peut-il se propager dans le vide ?', r: 'Non', f: ['Oui'], e: 'Le son a besoin de matière : <strong>pas de son dans le vide</strong>.' },
  ],
  'cm-vivant': [
    { q: 'Pour classer les êtres vivants, on regarde…', r: 'les attributs qu\'ils partagent', f: ['où ils vivent', 'ce qu\'ils mangent'], e: 'On classe selon ce qu\'ils <strong>ont</strong> en commun.' },
    { q: 'Poils et mamelles : ce sont…', r: 'les mammifères', f: ['les oiseaux', 'les reptiles'], e: 'Les <strong>mammifères</strong>.' },
    { q: 'Les animaux à plumes sont…', r: 'les oiseaux', f: ['les mammifères', 'les insectes'], e: 'Seuls les <strong>oiseaux</strong> ont des plumes.' },
    { q: 'Combien de pattes a un insecte ?', r: 6, e: 'Un insecte a <strong>6 pattes</strong>.' },
    { q: 'Un animal avec une colonne vertébrale est…', r: 'un vertébré', f: ['un invertébré'], e: 'Squelette intérieur : <strong>vertébré</strong>.' },
    { q: 'Le tuyau entre la bouche et l\'estomac s\'appelle…', r: 'l\'œsophage', f: ['la trachée', 'l\'intestin'], e: 'L\'<strong>œsophage</strong>.' },
    { q: 'Les nutriments passent dans le sang au niveau de…', r: 'l\'intestin grêle', f: ['l\'estomac', 'la bouche'], e: 'Dans l\'<strong>intestin grêle</strong>.' },
    { q: 'Les êtres vivants qui recyclent la matière morte sont…', r: 'les décomposeurs', f: ['les prédateurs', 'les pollinisateurs'], e: 'Les <strong>décomposeurs</strong> : vers de terre, champignons, bactéries.' },
    { q: 'Les épluchures se transforment en…', r: 'compost', f: ['plastique', 'verre'], e: 'Le <strong>compost</strong> nourrit les plantes.' },
    { q: 'Les poumons font passer dans le sang…', r: 'le dioxygène', f: ['le dioxyde de carbone', 'les nutriments'], e: 'Le <strong>dioxygène</strong> de l\'air.' },
    { q: 'On rejette en expirant…', r: 'du dioxyde de carbone', f: ['du dioxygène pur', 'des nutriments'], e: 'Le <strong>dioxyde de carbone</strong>, déchet des organes.' },
    { q: 'Le cœur est…', r: 'un muscle qui pompe le sang', f: ['un os', 'un poumon'], e: 'Le <strong>cœur</strong> est un muscle.' },
    { q: 'Les vaisseaux qui partent du cœur sont…', r: 'les artères', f: ['les veines'], e: '<strong>Artères</strong> : du cœur vers les organes.' },
    { q: 'La période où le corps devient capable de se reproduire s\'appelle…', r: 'la puberté', f: ['la fécondation', 'la naissance'], e: 'La <strong>puberté</strong>.' },
    { q: 'La rencontre de l\'ovule et du spermatozoïde s\'appelle…', r: 'la fécondation', f: ['la grossesse', 'la puberté'], e: 'La <strong>fécondation</strong>.' },
    { q: 'La grossesse humaine dure environ…', r: 9, u: 'mois', e: 'Environ <strong>9 mois</strong>.', v: 'La grossesse humaine dure environ combien de mois ?' },
    { q: 'Le bébé reçoit nourriture et dioxygène par…', r: 'le placenta et le cordon ombilical', f: ['la bouche', 'les poumons'], e: 'Par le <strong>placenta</strong> et le <strong>cordon ombilical</strong>.' },
    { q: 'La diversité de tous les êtres vivants s\'appelle…', r: 'la biodiversité', f: ['l\'évolution', 'la classification'], e: 'La <strong>biodiversité</strong>.' },
    { q: 'La transformation des espèces au cours du temps s\'appelle…', r: 'l\'évolution', f: ['la métamorphose', 'la digestion'], e: 'L\'<strong>évolution</strong>, révélée par les fossiles.' },
  ],
  'cm-technique': [
    { q: 'Ce à quoi sert un objet, c\'est sa fonction…', r: 'd\'usage', f: ['d\'estime', 'technique'], e: 'Fonction d\'<strong>usage</strong>.' },
    { q: 'Ce qui fait qu\'on aime un objet (couleur, forme, marque), c\'est sa fonction…', r: 'd\'estime', f: ['d\'usage', 'technique'], e: 'Fonction d\'<strong>estime</strong>.' },
    { q: 'Le rôle d\'une pièce dans un objet, c\'est sa fonction…', r: 'technique', f: ['d\'usage', 'd\'estime'], e: 'Fonction <strong>technique</strong>.' },
    { q: 'Une suite d\'instructions pour réaliser une tâche est…', r: 'un algorithme', f: ['un réseau', 'un serveur'], e: 'Un <strong>algorithme</strong>.' },
    { q: 'Pour répéter des instructions, on utilise…', r: 'une boucle', f: ['un bug', 'un routeur'], e: 'Une <strong>boucle</strong> « répéter ».' },
    { q: 'Une erreur dans un programme s\'appelle…', r: 'un bug', f: ['une boucle', 'un lutin'], e: 'Un <strong>bug</strong>.' },
    { q: 'La Terre tourne sur elle-même en…', r: 24, u: 'h', e: 'En <strong>24 heures</strong> : c\'est la rotation.', v: 'La Terre tourne sur elle-même en combien d\'heures ?' },
    { q: 'Le mouvement de la Terre autour du Soleil s\'appelle…', r: 'la révolution', f: ['la rotation'], e: 'La <strong>révolution</strong> : un an.' },
    { q: 'Les saisons existent parce que…', r: 'l\'axe de la Terre est incliné', f: ['la Terre s\'éloigne du Soleil en hiver'], e: 'L\'axe de la Terre est <strong>incliné</strong>.' },
    { q: 'Un tremblement de terre s\'appelle…', r: 'un séisme', f: ['une éruption', 'un tsunami'], e: 'Un <strong>séisme</strong>.' },
    { q: 'La roche fondue qui sort d\'un volcan est…', r: 'la lave', f: ['le magma refroidi', 'le sable'], e: 'La <strong>lave</strong>.' },
    { q: 'Transformer un déchet en matière première, c\'est…', r: 'recycler', f: ['jeter', 'brûler'], e: '<strong>Recycler</strong>.' },
    { q: 'Le verre se recycle…', r: 'à l\'infini', f: ['une seule fois', 'jamais'], e: 'Le verre se recycle <strong>à l\'infini</strong>.' },
    { q: 'Des ordinateurs reliés entre eux forment…', r: 'un réseau', f: ['un algorithme'], e: 'Un <strong>réseau</strong>.' },
    { q: 'L\'appareil qui oriente les informations entre réseaux est…', r: 'un routeur', f: ['un serveur', 'une imprimante'], e: 'Un <strong>routeur</strong>.' },
    { q: 'L\'ordinateur qui fournit des sites ou des fichiers aux autres est…', r: 'un serveur', f: ['un routeur', 'un clavier'], e: 'Un <strong>serveur</strong>.' },
    { q: 'Le temps qu\'il fait un jour donné, c\'est…', r: 'la météo', f: ['le climat'], e: 'La <strong>météo</strong> ; le climat est une moyenne sur une trentaine d\'années.' },
    { q: 'Le principal gaz rejeté par les voitures qui réchauffe le climat est…', r: 'le dioxyde de carbone', f: ['le dioxygène', 'la vapeur d\'eau'], e: 'Le <strong>dioxyde de carbone</strong> (CO₂).' },
    { q: 'Inondations, séismes, tempêtes sont des…', r: 'risques naturels', f: ['ressources naturelles'], e: 'Des <strong>risques naturels</strong>.' },
  ],
});
Object.assign(NOTION_QUIZ, { 'cm-matiere': 'Cours CM : matière, mouvement, énergie', 'cm-vivant': 'Cours CM : le vivant', 'cm-technique': 'Cours CM : objets techniques et Terre' });

/* --- Les quiz de cours du 6e – 5e --- */
Object.assign(QUIZ, {
  '65-matiere': [
    { q: 'On mesure une masse avec…', r: 'une balance', f: ['une éprouvette', 'un thermomètre'], e: 'Une <strong>balance</strong>.' },
    { q: 'On mesure le volume d\'un liquide avec…', r: 'une éprouvette graduée', f: ['une balance', 'un chronomètre'], e: 'Une <strong>éprouvette graduée</strong>.' },
    { q: '1 L = … mL', r: 1000, u: 'mL', e: '1 L = <strong>1 000 mL</strong>.', v: 'Un litre égale combien de millilitres ?' },
    { q: '1 cm³ = … mL', r: 1, u: 'mL', e: '1 cm³ = <strong>1 mL</strong>.', v: 'Un centimètre cube égale combien de millilitres ?' },
    { q: '1 kg = … g', r: 1000, u: 'g', e: '1 kg = <strong>1 000 g</strong>.', v: 'Un kilogramme égale combien de grammes ?' },
    { q: 'Une transformation chimique, c\'est quand…', r: 'de nouvelles substances apparaissent', f: ['l\'état change seulement', 'on mélange sans rien créer'], e: 'De <strong>nouvelles substances</strong> se forment.' },
    { q: 'La glace qui fond est…', r: 'un changement d\'état', f: ['une transformation chimique'], e: 'C\'est toujours de l\'eau : <strong>changement d\'état</strong>.' },
    { q: 'Vitesse moyenne = …', r: 'distance ÷ durée', f: ['distance × durée', 'durée ÷ distance'], e: '<strong>v = d ÷ t</strong>.' },
    { q: 'Une voiture qui parcourt 120 km en 2 h roule à…', r: 60, u: 'km/h', e: '120 ÷ 2 = <strong>60 km/h</strong>.', v: 'Une voiture qui parcourt 120 kilomètres en 2 heures roule à combien de kilomètres heure ?' },
    { q: 'Deux lampes l\'une après l\'autre sur une seule boucle sont branchées…', r: 'en série', f: ['en dérivation'], e: '<strong>En série</strong>.' },
    { q: 'Les prises d\'une maison sont branchées…', r: 'en dérivation', f: ['en série'], e: '<strong>En dérivation</strong> : chaque appareil a sa boucle.' },
    { q: 'L\'énergie peut-elle disparaître ?', r: 'Non, elle se transforme', f: ['Oui'], e: 'L\'énergie se <strong>conserve</strong> ; une partie devient souvent de la chaleur.' },
    { q: 'Dans un gaz, les particules sont…', r: 'très éloignées et agitées', f: ['serrées et ordonnées', 'serrées et en désordre'], e: 'Gaz : particules <strong>très éloignées</strong>.' },
    { q: 'Dans un solide, les particules sont…', r: 'serrées et ordonnées', f: ['très éloignées', 'serrées et en désordre'], e: 'Solide : <strong>serrées et ordonnées</strong>.' },
    { q: 'Lors d\'un changement d\'état, la masse…', r: 'se conserve', f: ['augmente', 'diminue'], e: 'La masse se <strong>conserve</strong>.' },
    { q: 'À l\'extérieur de la pile, le courant va…', r: 'de la borne + vers la borne −', f: ['de la borne − vers la borne +'], e: 'Sens conventionnel : du <strong>+ vers le −</strong>.' },
    { q: 'Un composant qui ne laisse passer le courant que dans un sens est…', r: 'une diode', f: ['une lampe', 'un interrupteur'], e: 'Une <strong>diode</strong>.' },
    { q: 'Le Soleil est une source de lumière…', r: 'primaire', f: ['diffusante'], e: 'Il produit sa propre lumière : source <strong>primaire</strong>.' },
    { q: 'Dans l\'air, la lumière se propage…', r: 'en ligne droite', f: ['en courbe', 'en zigzag'], e: 'En <strong>ligne droite</strong>.' },
    { q: 'Une éclipse de Soleil : c\'est … qui passe devant le Soleil.', r: 'la Lune', f: ['la Terre', 'Mars'], e: 'La <strong>Lune</strong> passe entre le Soleil et la Terre.' },
  ],
  '65-vivant': [
    { q: 'L\'unité de base de tout être vivant est…', r: 'la cellule', f: ['l\'organe', 'l\'atome'], e: 'La <strong>cellule</strong>.' },
    { q: 'La partie de la cellule qui contient l\'ADN est…', r: 'le noyau', f: ['la membrane', 'le cytoplasme'], e: 'Le <strong>noyau</strong>.' },
    { q: 'L\'enveloppe de la cellule est…', r: 'la membrane', f: ['le noyau', 'le cytoplasme'], e: 'La <strong>membrane</strong>.' },
    { q: 'Un être vivant d\'une seule cellule est…', r: 'unicellulaire', f: ['pluricellulaire'], e: '<strong>Unicellulaire</strong>.' },
    { q: 'La cellule végétale a en plus…', r: 'une paroi et des chloroplastes', f: ['un noyau', 'une membrane'], e: '<strong>Paroi</strong> et <strong>chloroplastes</strong>.' },
    { q: 'Grossissement d\'un microscope avec oculaire ×10 et objectif ×40 :', r: 400, e: '10 × 40 = <strong>400</strong>.' },
    { q: 'Pour classer en groupes emboîtés, on utilise…', r: 'les attributs partagés', f: ['le milieu de vie', 'le régime alimentaire'], e: 'Les <strong>attributs</strong> partagés.' },
    { q: 'Le groupe des mammifères est inclus dans celui…', r: 'des vertébrés', f: ['des oiseaux', 'des insectes'], e: 'Des <strong>vertébrés</strong>.' },
    { q: 'La transformation d\'un aliment par des micro-organismes s\'appelle…', r: 'la fermentation', f: ['la photosynthèse', 'la digestion'], e: 'La <strong>fermentation</strong>.' },
    { q: 'Le pain gonfle grâce à…', r: 'la levure', f: ['des bactéries du yaourt', 'du sel'], e: 'La <strong>levure</strong>, un champignon microscopique.' },
    { q: 'Le climat se calcule sur une durée d\'au moins…', r: 30, u: 'ans', e: 'Au moins <strong>30 ans</strong>.', v: 'Le climat se calcule sur une durée d\'au moins combien d\'années ?' },
    { q: 'Un phénomène naturel possible (crue, tempête) s\'appelle…', r: 'un aléa', f: ['un risque', 'un climat'], e: 'Un <strong>aléa</strong> ; il devient un risque quand il menace des personnes.' },
    { q: 'Pendant un effort, la fréquence cardiaque…', r: 'augmente', f: ['diminue', 'ne change pas'], e: 'Elle <strong>augmente</strong>.' },
    { q: 'Les muscles consomment…', r: 'du dioxygène et des nutriments', f: ['du dioxyde de carbone', 'de l\'azote'], e: '<strong>Dioxygène</strong> et <strong>nutriments</strong>.' },
    { q: 'Le dioxygène passe dans le sang au niveau des…', r: 'alvéoles pulmonaires', f: ['bronches', 'artères'], e: 'Les <strong>alvéoles</strong>.' },
    { q: 'Les plantes vertes fabriquent leur matière par…', r: 'la photosynthèse', f: ['la fermentation', 'la respiration'], e: 'La <strong>photosynthèse</strong>.' },
    { q: 'La photosynthèse utilise lumière, eau et…', r: 'dioxyde de carbone', f: ['dioxygène', 'sucre'], e: '<strong>Dioxyde de carbone</strong>.' },
    { q: 'La photosynthèse rejette…', r: 'du dioxygène', f: ['du dioxyde de carbone'], e: 'Du <strong>dioxygène</strong>.' },
    { q: 'Les petits orifices des feuilles s\'appellent…', r: 'les stomates', f: ['les alvéoles', 'les poils absorbants'], e: 'Les <strong>stomates</strong>.' },
    { q: 'La sève qui monte des racines (eau et sels minéraux) est…', r: 'la sève brute', f: ['la sève élaborée'], e: 'La <strong>sève brute</strong>.' },
  ],
  '65-technique': [
    { q: 'Le document qui décrit ce que doit faire un objet est…', r: 'le cahier des charges', f: ['le prototype', 'le mode d\'emploi'], e: 'Le <strong>cahier des charges</strong>.' },
    { q: 'Le premier modèle pour tester un objet est…', r: 'un prototype', f: ['un cahier des charges', 'une contrainte'], e: 'Un <strong>prototype</strong>.' },
    { q: 'Dans un programme, « si … alors … sinon » est…', r: 'une condition', f: ['une boucle', 'une variable'], e: 'Une <strong>condition</strong>.' },
    { q: '« Répéter 10 fois » est…', r: 'une boucle', f: ['une condition', 'une variable'], e: 'Une <strong>boucle</strong>.' },
    { q: 'Une case mémoire qui a un nom (score, vies) est…', r: 'une variable', f: ['une boucle', 'un capteur'], e: 'Une <strong>variable</strong>.' },
    { q: 'La vie est possible sur Terre surtout grâce à…', r: 'l\'eau liquide', f: ['ses volcans', 'sa Lune'], e: 'L\'<strong>eau liquide</strong>.' },
    { q: 'Les planètes géantes gazeuses sont Jupiter, Saturne, Uranus et…', r: 'Neptune', f: ['Mars', 'Vénus'], e: '<strong>Neptune</strong>.' },
    { q: 'Acquérir, traiter, communiquer : c\'est la chaîne…', r: 'd\'information', f: ['d\'énergie'], e: 'Chaîne d\'<strong>information</strong>.' },
    { q: 'Alimenter, distribuer, convertir, transmettre : c\'est la chaîne…', r: 'd\'énergie', f: ['d\'information'], e: 'Chaîne d\'<strong>énergie</strong>.' },
    { q: 'Un détecteur de mouvement est…', r: 'un capteur', f: ['un actionneur'], e: 'Un <strong>capteur</strong>.' },
    { q: 'Un moteur est…', r: 'un actionneur', f: ['un capteur'], e: 'Un <strong>actionneur</strong>.' },
    { q: 'Une corde tirée subit…', r: 'la traction', f: ['la compression', 'la flexion'], e: 'La <strong>traction</strong>.' },
    { q: 'Un pilier écrasé par une charge subit…', r: 'la compression', f: ['la traction', 'la torsion'], e: 'La <strong>compression</strong>.' },
    { q: 'La forme qui rend une structure rigide est…', r: 'le triangle', f: ['le carré', 'le cercle'], e: 'Le <strong>triangle</strong>.' },
    { q: 'Le composant qui exécute les calculs de l\'ordinateur est…', r: 'le processeur', f: ['la mémoire vive', 'l\'écran'], e: 'Le <strong>processeur</strong>.' },
    { q: 'La mémoire qui s\'efface quand on éteint l\'ordinateur est…', r: 'la mémoire vive (RAM)', f: ['le disque dur'], e: 'La <strong>mémoire vive</strong>.' },
    { q: 'Le clavier est un périphérique…', r: 'd\'entrée', f: ['de sortie'], e: 'D\'<strong>entrée</strong>.' },
    { q: 'L\'écran est un périphérique…', r: 'de sortie', f: ['d\'entrée'], e: 'De <strong>sortie</strong>.' },
    { q: 'Un octet contient combien de bits ?', r: 8, e: '<strong>8 bits</strong>.' },
  ],
});
Object.assign(NOTION_QUIZ, { '65-matiere': 'Cours 6e – 5e : matière, mouvement, énergie', '65-vivant': 'Cours 6e – 5e : le vivant', '65-technique': 'Cours 6e – 5e : technologie et Terre' });

/* --- Les quiz de cours du 4e – 3e --- */
Object.assign(QUIZ, {
  '43-matiere': [
    { q: 'Une molécule est formée…', r: 'd\'atomes', f: ['de cellules', 'd\'ions seulement'], e: 'Une molécule = des <strong>atomes</strong> liés.' },
    { q: 'Le triangle du feu : combustible, chaleur et…', r: 'comburant (dioxygène)', f: ['eau', 'dioxyde de carbone'], e: 'Le <strong>comburant</strong> : le dioxygène.' },
    { q: 'Le test du dioxyde de carbone se fait avec…', r: 'l\'eau de chaux', f: ['le papier pH', 'le nitrate d\'argent'], e: 'L\'<strong>eau de chaux</strong> se trouble.' },
    { q: 'Lors d\'une transformation chimique, les atomes…', r: 'se conservent', f: ['disparaissent', 'se créent'], e: 'Ils se <strong>conservent</strong> et se réarrangent.' },
    { q: 'La tension se mesure en…', r: 'volts (V)', f: ['ampères (A)', 'ohms (Ω)'], e: 'En <strong>volts</strong>, avec un voltmètre en dérivation.' },
    { q: 'L\'intensité se mesure en…', r: 'ampères (A)', f: ['volts (V)', 'watts (W)'], e: 'En <strong>ampères</strong>, avec un ampèremètre en série.' },
    { q: 'La loi d\'Ohm :', r: 'U = R × I', f: ['U = R + I', 'R = U × I'], e: '<strong>U = R × I</strong>.' },
    { q: 'En série, les tensions…', r: 's\'additionnent', f: ['sont égales', 'sont nulles'], e: 'U = U₁ + U₂.' },
    { q: 'La vitesse du son dans l\'air est d\'environ…', r: 340, u: 'm/s', e: 'Environ <strong>340 m/s</strong>.', v: 'La vitesse du son dans l\'air est d\'environ combien de mètres par seconde ?' },
    { q: 'La vitesse de la lumière est d\'environ…', r: '300 000 km/s', f: ['340 m/s', '300 km/h'], e: '<strong>300 000 km/s</strong>.' },
    { q: 'Le son peut-il se propager dans le vide ?', r: 'Non', f: ['Oui'], e: 'Non : il lui faut de la <strong>matière</strong>.' },
    { q: 'Le noyau d\'un atome contient…', r: 'des protons et des neutrons', f: ['des électrons', 'des molécules'], e: '<strong>Protons</strong> et <strong>neutrons</strong>.' },
    { q: 'Un atome est électriquement…', r: 'neutre', f: ['positif', 'négatif'], e: 'Autant d\'électrons que de protons : <strong>neutre</strong>.' },
    { q: 'Une solution de pH inférieur à 7 est…', r: 'acide', f: ['basique', 'neutre'], e: 'pH &lt; 7 : <strong>acide</strong>.' },
    { q: 'Une force se mesure en…', r: 'newtons (N)', f: ['kilogrammes', 'joules'], e: 'En <strong>newtons</strong>.' },
    { q: 'Poids et masse : P = …', r: 'm × g', f: ['m + g', 'm ÷ g'], e: '<strong>P = m × g</strong>.' },
    { q: 'Sur Terre, g vaut environ…', r: 9.8, u: 'N/kg', e: 'Environ <strong>9,8 N/kg</strong>.', v: 'Sur Terre, g vaut environ combien de newtons par kilogramme ?' },
    { q: 'L\'énergie cinétique : Ec = …', r: '½ × m × v²', f: ['m × v', 'm × g'], e: '<strong>Ec = ½ m v²</strong>.' },
    { q: 'Énergie et puissance : E = …', r: 'P × t', f: ['P + t', 'P ÷ t'], e: '<strong>E = P × t</strong>.' },
    { q: 'La puissance se mesure en…', r: 'watts (W)', f: ['joules (J)', 'newtons (N)'], e: 'En <strong>watts</strong>.' },
  ],
  '43-vivant': [
    { q: 'La surface de la Terre est découpée en…', r: 'plaques', f: ['cubes', 'couches immobiles'], e: 'En <strong>plaques lithosphériques</strong>.' },
    { q: 'Le point de la surface au-dessus du foyer d\'un séisme est…', r: 'l\'épicentre', f: ['le cratère', 'la faille'], e: 'L\'<strong>épicentre</strong>.' },
    { q: 'Une plaque qui plonge sous une autre : c\'est…', r: 'la subduction', f: ['la dorsale', 'la collision'], e: 'La <strong>subduction</strong>.' },
    { q: 'Une reproduction avec un seul parent, sans gamètes, est…', r: 'asexuée', f: ['sexuée'], e: '<strong>Asexuée</strong>.' },
    { q: 'Les messagers chimiques transportés par le sang sont…', r: 'les hormones', f: ['les neurones', 'les anticorps'], e: 'Les <strong>hormones</strong>.' },
    { q: 'Les cellules nerveuses sont…', r: 'les neurones', f: ['les lymphocytes', 'les gamètes'], e: 'Les <strong>neurones</strong>.' },
    { q: 'La zone de communication entre deux neurones est…', r: 'la synapse', f: ['l\'alvéole', 'le chromosome'], e: 'La <strong>synapse</strong>.' },
    { q: 'Une cellule humaine contient combien de chromosomes ?', r: 46, e: '<strong>46</strong> (23 paires).' },
    { q: 'Un gamète humain contient combien de chromosomes ?', r: 23, e: '<strong>23</strong>.' },
    { q: 'Une portion d\'ADN qui détermine un caractère est…', r: 'un gène', f: ['un chromosome', 'une cellule'], e: 'Un <strong>gène</strong>.' },
    { q: 'Les versions d\'un même gène sont…', r: 'des allèles', f: ['des mutations', 'des neurones'], e: 'Des <strong>allèles</strong>.' },
    { q: 'La division qui donne deux cellules identiques est…', r: 'la mitose', f: ['la méiose', 'la fécondation'], e: 'La <strong>mitose</strong>.' },
    { q: 'La division qui produit les gamètes est…', r: 'la méiose', f: ['la mitose'], e: 'La <strong>méiose</strong>.' },
    { q: 'Le scientifique de la sélection naturelle est…', r: 'Darwin', f: ['Pasteur', 'Newton'], e: '<strong>Charles Darwin</strong>.' },
    { q: 'La source de nouveaux allèles est…', r: 'la mutation', f: ['l\'entraînement', 'la volonté'], e: 'La <strong>mutation</strong>.' },
    { q: 'Les globules blancs qui avalent les microbes réalisent…', r: 'la phagocytose', f: ['la photosynthèse', 'la méiose'], e: 'La <strong>phagocytose</strong>.' },
    { q: 'Les anticorps sont produits par…', r: 'les lymphocytes B', f: ['les globules rouges', 'les neurones'], e: 'Les <strong>lymphocytes B</strong>.' },
    { q: 'Les antibiotiques agissent sur…', r: 'les bactéries', f: ['les virus', 'tous les microbes'], e: 'Sur les <strong>bactéries</strong>, pas sur les virus.' },
    { q: 'Un vaccin donne au corps…', r: 'une mémoire immunitaire', f: ['un antibiotique', 'une maladie grave'], e: 'Une <strong>mémoire immunitaire</strong>.' },
    { q: 'Répondre aux besoins d\'aujourd\'hui sans compromettre ceux des générations futures, c\'est…', r: 'le développement durable', f: ['la transition énergétique', 'la biodiversité'], e: 'Le <strong>développement durable</strong>.' },
  ],
  '43-technique': [
    { q: 'Un objet qui échange des informations par un réseau est…', r: 'un objet connecté', f: ['un objet technique simple', 'un actionneur'], e: 'Un <strong>objet connecté</strong>.' },
    { q: 'Un ensemble de règles de communication entre appareils est…', r: 'un protocole', f: ['un algorithme', 'un capteur'], e: 'Un <strong>protocole</strong> (Wi-Fi, Bluetooth, HTTP).' },
    { q: 'La fibre optique transporte l\'information grâce à…', r: 'la lumière', f: ['le son', 'l\'électricité'], e: 'La <strong>lumière</strong>.' },
    { q: 'Prévoir le comportement d\'un objet sur ordinateur avant de le fabriquer, c\'est…', r: 'la simulation numérique', f: ['le prototypage', 'le recyclage'], e: 'La <strong>simulation</strong>.' },
    { q: 'Le petit ordinateur d\'une carte programmable est…', r: 'le microcontrôleur', f: ['le capteur', 'l\'actionneur'], e: 'Le <strong>microcontrôleur</strong>.' },
    { q: '« Quand le bouton A est pressé » est…', r: 'un événement', f: ['une variable', 'une boucle'], e: 'Un <strong>événement</strong>.' },
    { q: 'Envoyer le programme de l\'ordinateur vers la carte, c\'est…', r: 'téléverser', f: ['télécharger un film', 'imprimer'], e: '<strong>Téléverser</strong>.' },
    { q: 'Les trois piliers du développement durable :', r: 'environnemental, économique, social', f: ['rapide, cher, lourd', 'solide, liquide, gaz'], e: '<strong>Environnemental, économique, social</strong>.' },
    { q: 'Concevoir un objet en limitant son impact sur l\'environnement, c\'est…', r: 'l\'écoconception', f: ['l\'obsolescence programmée', 'la simulation'], e: 'L\'<strong>écoconception</strong>.' },
    { q: 'Le diagramme qui planifie les tâches d\'un projet est…', r: 'le diagramme de Gantt', f: ['l\'organigramme', 'le schéma électrique'], e: 'Le <strong>diagramme de Gantt</strong>.' },
    { q: 'Ce qui identifie un appareil sur un réseau est…', r: 'son adresse IP', f: ['son mot de passe', 'sa couleur'], e: 'Son <strong>adresse IP</strong>.' },
    { q: 'Une adresse IPv4 est formée de combien de nombres ?', r: 4, e: '<strong>4 nombres</strong> de 0 à 255.' },
    { q: 'Le plus grand nombre possible dans une adresse IPv4 est…', r: 255, e: '<strong>255</strong>.' },
    { q: 'L\'annuaire qui traduit un nom de site en adresse IP est…', r: 'le DNS', f: ['le RGPD', 'le Wi-Fi'], e: 'Le <strong>DNS</strong>.' },
    { q: 'Un faux message qui cherche à voler des identifiants est…', r: 'de l\'hameçonnage', f: ['une mise à jour', 'un protocole'], e: 'Du <strong>hameçonnage</strong> (phishing).' },
    { q: 'La loi européenne sur les données personnelles est…', r: 'le RGPD', f: ['le DNS', 'le GIEC'], e: 'Le <strong>RGPD</strong>.' },
    { q: 'Dans un organigramme, une condition est représentée par…', r: 'un losange', f: ['un rectangle', 'un ovale'], e: 'Un <strong>losange</strong>.' },
    { q: 'Dans un organigramme, le début et la fin sont représentés par…', r: 'un ovale', f: ['un losange', 'un rectangle'], e: 'Un <strong>ovale</strong>.' },
    { q: 'Acquérir, traiter, communiquer : c\'est la chaîne…', r: 'd\'information', f: ['d\'énergie'], e: 'La chaîne d\'<strong>information</strong>.' },
  ],
});
Object.assign(NOTION_QUIZ, { '43-matiere': 'Cours 4e – 3e : physique-chimie', '43-vivant': 'Cours 4e – 3e : SVT', '43-technique': 'Cours 4e – 3e : technologie' });
/* ============================================================
   MNEMOSCIENCES — ILLUSTRATIONS DU CE (style de MNEMOGRAM)
   La bibliothèque de dessins est reprise telle quelle de MNEMOGRAM (illustrations.js, v110) :
   personnages, animaux, objets, décors ; on y ajoute les dessins propres aux sciences.
   ------------------------------------------------------------ */
const ILLUS = (function () {
  const K = '#2b2118';                      /* couleur du trait */
  const ST = `stroke="${K}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"`;
  const H = 240, SOL = 198;                 /* hauteur d'un moment, ligne du sol */
  const PEAUX = { c: '#ffd9b8', m: '#e8b48a', f: '#b77b4f', t: '#8a5a3a' };

  /* ---------- PERSONNAGES ---------- */
  /* p : { peau, ch (court, long, tresses, chignon, boucle, chauve, couettes), cc, haut, bas, jupe, taille (1 enfant, 1.3 adulte, .7 bébé),
          bras (bas, haut, tend, deux), visage (sourit, rit, peur, triste, dort, crie), acc : [lunettes, chapeau, tablier, casquette, toque, nez, barbe, moustache, bonnet] } */
  function personne(p) {
    const t = p.taille || 1, peau = PEAUX[p.peau || 'c'] || p.peau, cc = p.cc || '#6b3a1e';
    const jambe = 24 * t, corps = 28 * t, r = 11 + (t > 1.1 ? 1 : 0), yc = -jambe - corps - r + 2;
    let s = '';
    /* jambes */
    s += `<path d="M-6 ${-jambe} L-7 -2 M6 ${-jambe} L7 -2" fill="none" ${ST} stroke-width="5" stroke="${p.bas || '#3b4a6b'}"/>`;
    s += `<path d="M-11 -1 L-3 -1 M3 -1 L11 -1" fill="none" ${ST} stroke-width="4"/>`;
    /* corps */
    if (p.jupe) s += `<path d="M-10 ${-jambe - corps} Q0 ${-jambe - corps - 3} 10 ${-jambe - corps} L16 ${-jambe + 2} Q0 ${-jambe + 6} -16 ${-jambe + 2} Z" fill="${p.haut || '#ff8fd0'}" ${ST}/>`;
    else s += `<path d="M-11 ${-jambe - corps} Q0 ${-jambe - corps - 3} 11 ${-jambe - corps} L12 ${-jambe + 1} Q0 ${-jambe + 4} -12 ${-jambe + 1} Z" fill="${p.haut || '#3a7bd5'}" ${ST}/>`;
    if ((p.acc || []).includes('tablier')) s += `<path d="M-7 ${-jambe - corps + 8} L7 ${-jambe - corps + 8} L8 ${-jambe} L-8 ${-jambe} Z" fill="#fff" ${ST}/>`;
    /* bras */
    const ya = -jambe - corps + 5, b = p.bras || 'bas';
    const bras = {
      bas: `M-11 ${ya} L-17 ${ya + 22} M11 ${ya} L17 ${ya + 22}`,
      haut: `M-11 ${ya} L-20 ${ya - 20} M11 ${ya} L20 ${ya - 20}`,
      tend: `M-11 ${ya} L-17 ${ya + 22} M11 ${ya} L30 ${ya + 4}`,
      deux: `M-11 ${ya} L-28 ${ya + 4} M11 ${ya} L28 ${ya + 4}`,
      leve: `M-11 ${ya} L-17 ${ya + 22} M11 ${ya} L18 ${ya - 22}`,
    }[b] || '';
    s += `<path d="${bras}" fill="none" ${ST} stroke-width="5" stroke="${p.haut || '#3a7bd5'}"/>`;
    /* tête */
    const ch = p.ch || 'court';
    if (ch === 'long' || ch === 'tresses' || ch === 'couettes') s += `<path d="M-13 ${yc} Q-15 ${yc + 18} -10 ${yc + 20} L10 ${yc + 20} Q15 ${yc + 18} 13 ${yc} Z" fill="${cc}" ${ST}/>`;
    s += `<circle cx="0" cy="${yc}" r="${r}" fill="${peau}" ${ST}/>`;
    if (ch !== 'chauve') {
      const top = {
        court: `M-${r} ${yc - 1} Q-${r} ${yc - r - 6} 0 ${yc - r - 3} Q${r} ${yc - r - 6} ${r} ${yc - 1} Q${r - 2} ${yc - 7} 2 ${yc - 8} Q-${r - 2} ${yc - 8} -${r} ${yc - 1} Z`,
        long: `M-${r + 1} ${yc + 2} Q-${r + 2} ${yc - r - 5} 0 ${yc - r - 3} Q${r + 2} ${yc - r - 5} ${r + 1} ${yc + 2} Q${r - 3} ${yc - 8} 0 ${yc - 7} Q-${r - 3} ${yc - 8} -${r + 1} ${yc + 2} Z`,
        boucle: `M-${r + 2} ${yc} q-3 -8 3 -12 q0 -7 8 -6 q4 -6 10 -1 q7 -1 7 6 q5 4 1 12 q-6 -7 -14 -7 q-9 0 -15 8 Z`,
        chignon: `M-${r} ${yc - 1} Q-${r} ${yc - r - 5} 0 ${yc - r - 3} Q${r} ${yc - r - 5} ${r} ${yc - 1} Q0 ${yc - 9} -${r} ${yc - 1} Z`,
      };
      const d = top[ch === 'tresses' || ch === 'couettes' ? 'long' : ch] || top.court;
      s += `<path d="${d}" fill="${cc}" ${ST}/>`;
      if (ch === 'chignon') s += `<circle cx="0" cy="${yc - r - 6}" r="6" fill="${cc}" ${ST}/>`;
      if (ch === 'couettes') s += `<circle cx="-${r + 5}" cy="${yc - 2}" r="5" fill="${cc}" ${ST}/><circle cx="${r + 5}" cy="${yc - 2}" r="5" fill="${cc}" ${ST}/>`;
      if (ch === 'tresses') s += `<path d="M-${r} ${yc + 6} l-3 16 M${r} ${yc + 6} l3 16" fill="none" ${ST} stroke-width="5" stroke="${cc}"/>`;
    }
    /* visage */
    const v = p.visage || 'sourit';
    if (v === 'dort') s += `<path d="M-6 ${yc} q2 2 4 0 M2 ${yc} q2 2 4 0" fill="none" ${ST} stroke-width="1.5"/>`;
    else s += `<circle cx="-4" cy="${yc - 1}" r="1.6" fill="${K}"/><circle cx="4" cy="${yc - 1}" r="1.6" fill="${K}"/>`;
    const bouche = { sourit: `M-4 ${yc + 5} Q0 ${yc + 8} 4 ${yc + 5}`, rit: `M-5 ${yc + 4} Q0 ${yc + 11} 5 ${yc + 4} Z`, triste: `M-4 ${yc + 7} Q0 ${yc + 4} 4 ${yc + 7}`, dort: `M-2 ${yc + 6} L2 ${yc + 6}` }[v];
    if (v === 'peur' || v === 'crie') s += `<ellipse cx="0" cy="${yc + 6}" rx="2.5" ry="${v === 'crie' ? 4 : 3}" fill="${K}"/>`;
    else s += `<path d="${bouche}" fill="${v === 'rit' ? '#c0392b' : 'none'}" ${ST} stroke-width="1.5"/>`;
    /* accessoires */
    const A = p.acc || [];
    if (A.includes('lunettes')) s += `<circle cx="-4" cy="${yc - 1}" r="3.5" fill="none" ${ST} stroke-width="1.2"/><circle cx="4" cy="${yc - 1}" r="3.5" fill="none" ${ST} stroke-width="1.2"/>`;
    if (A.includes('moustache')) s += `<path d="M-5 ${yc + 3} Q0 ${yc + 1} 5 ${yc + 3}" fill="none" ${ST} stroke-width="2.5" stroke="${cc}"/>`;
    if (A.includes('barbe')) s += `<path d="M-${r} ${yc + 2} Q0 ${yc + r + 10} ${r} ${yc + 2} Q0 ${yc + 9} -${r} ${yc + 2} Z" fill="${cc}" ${ST}/>`;
    if (A.includes('nez')) s += `<circle cx="0" cy="${yc + 2}" r="3.5" fill="#ff3b3b" ${ST} stroke-width="1"/>`;
    if (A.includes('chapeau')) s += `<path d="M-${r + 7} ${yc - r + 1} L${r + 7} ${yc - r + 1} M-8 ${yc - r + 1} L-7 ${yc - r - 12} L7 ${yc - r - 12} L8 ${yc - r + 1}" fill="${p.chapeau || '#2b2118'}" ${ST}/>`;
    if (A.includes('casquette')) s += `<path d="M-${r} ${yc - 4} Q0 ${yc - r - 8} ${r} ${yc - 4} Z M${r - 2} ${yc - 5} L${r + 9} ${yc - 3}" fill="${p.chapeau || '#e74c3c'}" ${ST}/>`;
    if (A.includes('bonnet')) s += `<path d="M-${r} ${yc - 3} Q0 ${yc - r - 12} ${r} ${yc - 3} Z" fill="${p.chapeau || '#e74c3c'}" ${ST}/><circle cx="0" cy="${yc - r - 8}" r="3.5" fill="#fff" ${ST} stroke-width="1"/>`;
    if (A.includes('toque')) s += `<path d="M-8 ${yc - r + 2} L-8 ${yc - r - 6} q-6 -10 4 -10 q4 -6 8 0 q10 0 4 10 L8 ${yc - r + 2} Z" fill="#fff" ${ST}/>`;
    if (A.includes('couronne')) s += `<path d="M-8 ${yc - r} L-8 ${yc - r - 9} L-4 ${yc - r - 4} L0 ${yc - r - 10} L4 ${yc - r - 4} L8 ${yc - r - 9} L8 ${yc - r} Z" fill="#ffd23f" ${ST}/>`;
    return s;
  }
  /* personnages récurrents */
  const PERSOS = {
    leo: { peau: 'c', ch: 'court', cc: '#6b3a1e', haut: '#3a7bd5', bas: '#2b3a55' },
    lina: { peau: 'm', ch: 'couettes', cc: '#2b2118', haut: '#ff7eb6', jupe: true, bas: '#7a4fa0' },
    maman: { peau: 'c', ch: 'long', cc: '#e0a52a', haut: '#2fb67c', jupe: true, taille: 1.3, bas: '#2f6f5a' },
    papa: { peau: 'c', ch: 'court', cc: '#2b2118', haut: '#e85d3a', taille: 1.35, bas: '#3b4a6b' },
    mamie: { peau: 'c', ch: 'chignon', cc: '#d9d9d9', haut: '#9b59b6', jupe: true, taille: 1.25, acc: ['lunettes'] },
    papi: { peau: 'c', ch: 'chauve', cc: '#d9d9d9', haut: '#8d6e63', taille: 1.3, acc: ['moustache', 'lunettes'] },
    maitresse: { peau: 'f', ch: 'chignon', cc: '#2b2118', haut: '#f39c12', jupe: true, taille: 1.3, acc: ['lunettes'] },
    tom: { peau: 'f', ch: 'boucle', cc: '#2b2118', haut: '#27ae60', bas: '#34495e' },
    hugo: { peau: 'c', ch: 'court', cc: '#e0a52a', haut: '#c0392b', bas: '#2c3e50' },
    soeur: { peau: 'c', ch: 'tresses', cc: '#c0702a', haut: '#9b59b6', jupe: true, taille: .9 },
    frere: { peau: 'c', ch: 'court', cc: '#c0702a', haut: '#f1c40f', bas: '#2980b9', taille: .85 },
    bebe: { peau: 'c', ch: 'chauve', haut: '#f9e79f', taille: .6 },
    fermier: { peau: 'm', ch: 'court', cc: '#6b3a1e', haut: '#2980b9', taille: 1.35, acc: ['chapeau'], chapeau: '#d4a24c', bas: '#5d4037' },
    clown: { peau: 'c', ch: 'boucle', cc: '#ff6b00', haut: '#f1c40f', taille: 1.3, acc: ['nez'], bas: '#e74c3c' },
    magicien: { peau: 'c', ch: 'court', cc: '#2b2118', haut: '#2c3e50', taille: 1.35, acc: ['chapeau', 'moustache'] },
    marchand: { peau: 'f', ch: 'court', cc: '#2b2118', haut: '#ecf0f1', taille: 1.35, acc: ['casquette', 'tablier'], chapeau: '#3498db' },
    gardien: { peau: 't', ch: 'court', cc: '#2b2118', haut: '#6d8b3a', taille: 1.35, acc: ['casquette'], chapeau: '#556b2f' },
    cuisinier: { peau: 'c', ch: 'court', cc: '#6b3a1e', haut: '#fff', taille: 1.35, acc: ['toque'] },
    fille: { peau: 'f', ch: 'long', cc: '#2b2118', haut: '#e67e22', jupe: true },
    garcon: { peau: 't', ch: 'court', cc: '#2b2118', haut: '#16a085', bas: '#2c3e50' },
    zoe: { peau: 'c', ch: 'long', cc: '#c0392b', haut: '#1abc9c', jupe: true },
  };

  /* ---------- ANIMAUX (tournés vers la droite, pieds au point d'origine) ---------- */
  const oeil = (x, y) => `<circle cx="${x}" cy="${y}" r="1.8" fill="${K}"/>`;
  const quad = (c, l, h, tete, queue) => `<path d="M${-l / 2} ${-6} L${-l / 2} -2 M${-l / 2 + 8} -6 L${-l / 2 + 8} -2 M${l / 2 - 8} -6 L${l / 2 - 8} -2 M${l / 2} -6 L${l / 2} -2" fill="none" ${ST} stroke-width="4"/><ellipse cx="0" cy="${-6 - h / 2}" rx="${l / 2 + 4}" ry="${h / 2}" fill="${c}" ${ST}/>${queue || ''}${tete}`;
  const ANIMAUX = {
    chat: (c = '#f39c12') => quad(c, 30, 14, `<circle cx="20" cy="-24" r="9" fill="${c}" ${ST}/><path d="M14 -30 l2 -9 l5 6 M22 -32 l4 -8 l3 8" fill="${c}" ${ST}/>${oeil(23, -25)}<path d="M28 -22 l8 -1 M28 -20 l8 2" fill="none" ${ST} stroke-width="1"/>`, `<path d="M-19 -14 Q-32 -22 -26 -36" fill="none" ${ST} stroke-width="4" stroke="${c}"/>`),
    chien: (c = '#c8874b') => quad(c, 36, 16, `<circle cx="24" cy="-28" r="10" fill="${c}" ${ST}/><path d="M18 -34 q-6 4 -4 14" fill="#8a5a2e" ${ST}/>${oeil(27, -30)}<circle cx="34" cy="-27" r="2.5" fill="${K}"/>`, `<path d="M-22 -16 Q-30 -26 -26 -32" fill="none" ${ST} stroke-width="4" stroke="${c}"/>`),
    lapin: (c = '#ecf0f1') => `<ellipse cx="0" cy="-12" rx="14" ry="11" fill="${c}" ${ST}/><circle cx="12" cy="-24" r="8" fill="${c}" ${ST}/><path d="M9 -30 q-2 -18 3 -18 q4 2 1 18 M14 -30 q4 -16 8 -14 q2 4 -4 15" fill="${c}" ${ST}/>${oeil(15, -25)}<circle cx="-14" cy="-14" r="4" fill="#fff" ${ST}/>`,
    vache: () => quad('#fff', 50, 24, `<path d="M26 -36 q8 -4 16 4 q2 12 -6 14 q-8 0 -12 -6 Z" fill="#fff" ${ST}/><path d="M28 -38 l-4 -6 M38 -36 l4 -6" fill="none" ${ST}/><ellipse cx="40" cy="-21" rx="5" ry="4" fill="#f5b7b1" ${ST}/>${oeil(32, -31)}`, `<circle cx="-8" cy="-22" r="5" fill="${K}"/><circle cx="8" cy="-14" r="4" fill="${K}"/><path d="M-27 -24 Q-34 -14 -30 -6" fill="none" ${ST}/>`),
    cochon: () => quad('#f8b6c4', 36, 18, `<circle cx="22" cy="-22" r="10" fill="#f8b6c4" ${ST}/><ellipse cx="31" cy="-20" rx="4" ry="5" fill="#f19cb0" ${ST}/>${oeil(22, -25)}<path d="M16 -30 l3 -6 l4 5" fill="#f8b6c4" ${ST}/>`, `<path d="M-22 -18 q-6 -2 -4 -8 q4 0 2 4" fill="none" ${ST} stroke-width="1.5"/>`),
    poule: (c = '#c0703a') => `<path d="M-4 -2 L-4 -8 M4 -2 L4 -8" fill="none" ${ST} stroke-width="2"/><ellipse cx="0" cy="-16" rx="13" ry="10" fill="${c}" ${ST}/><circle cx="10" cy="-26" r="6" fill="${c}" ${ST}/><path d="M8 -32 l2 -4 l2 4 l2 -3 l1 4" fill="#e74c3c" ${ST} stroke-width="1"/><path d="M16 -26 l5 2 l-5 2 Z" fill="#f1c40f" ${ST} stroke-width="1"/>${oeil(11, -27)}`,
    coq: () => `<path d="M-4 -2 L-4 -10 M4 -2 L4 -10" fill="none" ${ST} stroke-width="2"/><path d="M-12 -18 Q-26 -34 -18 -44 Q-12 -30 -6 -26" fill="#1e8449" ${ST}/><ellipse cx="0" cy="-18" rx="13" ry="10" fill="#d35400" ${ST}/><circle cx="10" cy="-30" r="7" fill="#d35400" ${ST}/><path d="M6 -37 l3 -6 l3 5 l3 -5 l1 6" fill="#e74c3c" ${ST} stroke-width="1"/><path d="M17 -30 l6 2 l-6 2 Z" fill="#f1c40f" ${ST} stroke-width="1"/>${oeil(11, -31)}`,
    canard: () => `<ellipse cx="0" cy="-8" rx="14" ry="8" fill="#fff" ${ST}/><circle cx="10" cy="-20" r="7" fill="#27ae60" ${ST}/><path d="M16 -20 l8 1 l-8 3 Z" fill="#f39c12" ${ST} stroke-width="1"/>${oeil(11, -22)}`,
    mouton: () => quad('#fdfefe', 34, 20, `<ellipse cx="22" cy="-22" rx="7" ry="9" fill="#2b2118" ${ST}/>${'<circle cx="24" cy="-24" r="1.5" fill="#fff"/>'}`, `<path d="M-18 -26 q4 -8 10 -4 q4 -8 10 -2 q6 -6 10 2" fill="#fdfefe" ${ST}/>`),
    cheval: () => quad('#a0522d', 50, 20, `<path d="M20 -24 L30 -52 Q40 -56 46 -46 L38 -40 L32 -28 Z" fill="#a0522d" ${ST}/><path d="M28 -50 Q20 -40 22 -28" fill="none" ${ST} stroke-width="5" stroke="#2b2118"/>${oeil(36, -48)}`, `<path d="M-28 -24 Q-38 -16 -34 -4" fill="none" ${ST} stroke-width="5" stroke="#2b2118"/>`),
    oiseau: (c = '#3498db') => `<ellipse cx="0" cy="-6" rx="8" ry="6" fill="${c}" ${ST}/><circle cx="7" cy="-11" r="4.5" fill="${c}" ${ST}/><path d="M11 -11 l5 1 l-5 2 Z" fill="#f39c12" stroke="${K}" stroke-width="1"/><path d="M-4 -8 q-2 -8 6 -6" fill="none" ${ST} stroke-width="1.5"/>${oeil(8, -12)}`,
    lion: () => quad('#e6a23c', 44, 20, `<circle cx="28" cy="-34" r="16" fill="#a0521d" ${ST}/><circle cx="30" cy="-33" r="10" fill="#f0b858" ${ST}/>${oeil(33, -35)}<path d="M33 -28 q3 2 6 0" fill="none" ${ST} stroke-width="1.5"/>`, `<path d="M-26 -18 Q-36 -10 -34 -2" fill="none" ${ST} stroke-width="3"/>`),
    singe: () => `<path d="M-6 -2 L-6 -14 M6 -2 L6 -14 M-10 -26 L-20 -14 M10 -26 L20 -36" fill="none" ${ST} stroke-width="5" stroke="#8d5524"/><ellipse cx="0" cy="-22" rx="11" ry="12" fill="#8d5524" ${ST}/><circle cx="0" cy="-42" r="10" fill="#8d5524" ${ST}/><ellipse cx="1" cy="-40" rx="7" ry="6" fill="#e0ac69" ${ST}/>${oeil(-2, -42)}${oeil(4, -42)}<path d="M-4 -37 q4 3 8 0" fill="none" ${ST} stroke-width="1.5"/><path d="M-12 -10 Q-28 -4 -24 -26" fill="none" ${ST} stroke-width="3" stroke="#8d5524"/>`,
    girafe: () => `<path d="M-14 -2 L-14 -30 M-6 -2 L-6 -30 M10 -2 L10 -30 M18 -2 L18 -30" fill="none" ${ST} stroke-width="4" stroke="#f4c542"/><ellipse cx="2" cy="-36" rx="22" ry="11" fill="#f4c542" ${ST}/><path d="M14 -40 L26 -96 L34 -94 L24 -38 Z" fill="#f4c542" ${ST}/><ellipse cx="34" cy="-98" rx="11" ry="7" fill="#f4c542" ${ST}/><path d="M28 -104 l-2 -8 M34 -104 l1 -8" fill="none" ${ST}/>${oeil(34, -100)}<circle cx="-6" cy="-38" r="4" fill="#a0522d"/><circle cx="8" cy="-34" r="3.5" fill="#a0522d"/><circle cx="21" cy="-62" r="3" fill="#a0522d"/><circle cx="25" cy="-82" r="3" fill="#a0522d"/>`,
    elephant: () => quad('#95a5a6', 56, 32, `<circle cx="30" cy="-40" r="16" fill="#95a5a6" ${ST}/><path d="M42 -34 Q52 -20 46 -6" fill="none" ${ST} stroke-width="7" stroke="#95a5a6"/><ellipse cx="22" cy="-40" rx="9" ry="13" fill="#7f8c8d" ${ST}/>${oeil(36, -45)}`, ''),
    ours: () => quad('#6e4b2a', 46, 26, `<circle cx="28" cy="-36" r="13" fill="#6e4b2a" ${ST}/><circle cx="22" cy="-48" r="5" fill="#6e4b2a" ${ST}/><circle cx="34" cy="-48" r="5" fill="#6e4b2a" ${ST}/><ellipse cx="35" cy="-32" rx="5" ry="4" fill="#c69c6d" ${ST}/>${oeil(30, -39)}`, ''),
    serpent: () => `<path d="M-30 -6 Q-20 -18 -8 -6 Q4 6 14 -6 Q20 -14 26 -14" fill="none" ${ST} stroke-width="9" stroke="#27ae60"/><path d="M-30 -6 Q-20 -18 -8 -6 Q4 6 14 -6 Q20 -14 26 -14" fill="none" stroke="#2b2118" stroke-width="1" stroke-dasharray="2 6"/><circle cx="28" cy="-15" r="6" fill="#27ae60" ${ST}/>${oeil(30, -17)}<path d="M33 -14 l6 0 l3 -2 M39 -14 l3 2" fill="none" stroke="#e74c3c" stroke-width="1.5"/>`,
    pingouin: () => `<ellipse cx="0" cy="-18" rx="11" ry="17" fill="#2b2118" ${ST}/><ellipse cx="2" cy="-16" rx="7" ry="12" fill="#fff"/><circle cx="2" cy="-36" r="8" fill="#2b2118" ${ST}/><circle cx="4" cy="-37" r="2" fill="#fff"/><path d="M9 -35 l6 2 l-6 2 Z" fill="#f39c12"/><path d="M-6 -1 l5 0 M3 -1 l6 0" fill="none" stroke="#f39c12" stroke-width="3"/>`,
    ecureuil: () => `<path d="M-6 -6 Q-26 -14 -18 -34 Q-10 -46 -4 -34 Q-12 -24 -4 -14" fill="#d35400" ${ST}/><ellipse cx="4" cy="-12" rx="8" ry="10" fill="#e67e22" ${ST}/><circle cx="8" cy="-26" r="6" fill="#e67e22" ${ST}/><path d="M6 -31 l1 -5 l3 4" fill="#e67e22" ${ST} stroke-width="1"/>${oeil(10, -27)}`,
    biche: () => quad('#c68642', 38, 16, `<path d="M16 -18 L24 -40 L30 -40 L26 -18 Z" fill="#c68642" ${ST}/><ellipse cx="30" cy="-42" rx="8" ry="6" fill="#c68642" ${ST}/><path d="M24 -46 l-4 -7 M28 -47 l0 -8" fill="none" ${ST}/>${oeil(31, -44)}`, `<circle cx="-14" cy="-20" r="2" fill="#fff"/><circle cx="-4" cy="-24" r="2" fill="#fff"/>`),
    souris: () => `<ellipse cx="0" cy="-6" rx="9" ry="6" fill="#bdc3c7" ${ST}/><circle cx="7" cy="-10" r="4" fill="#bdc3c7" ${ST}/><circle cx="5" cy="-15" r="3" fill="#f5b7b1" ${ST} stroke-width="1"/>${oeil(9, -10)}<path d="M-9 -5 Q-18 -2 -20 -10" fill="none" ${ST} stroke-width="1.5"/>`,
    renard: () => quad('#e67e22', 36, 14, `<path d="M16 -22 L34 -22 L22 -36 Z M18 -30 l1 -10 l6 6 M24 -32 l5 -8 l2 9" fill="#e67e22" ${ST}/>${oeil(24, -27)}`, `<path d="M-20 -12 Q-38 -14 -34 -28 Q-26 -18 -20 -16" fill="#e67e22" ${ST}/><path d="M-34 -28 l-2 4 l4 0 Z" fill="#fff"/>`),
    chouette: () => `<ellipse cx="0" cy="-16" rx="12" ry="16" fill="#8e6e53" ${ST}/><circle cx="-5" cy="-24" r="6" fill="#fff36b" ${ST}/><circle cx="5" cy="-24" r="6" fill="#fff36b" ${ST}/>${oeil(-5, -24)}${oeil(5, -24)}<path d="M-2 -19 l2 4 l2 -4 Z" fill="#f39c12" stroke="${K}" stroke-width="1"/><path d="M-10 -32 l-2 -6 l6 3 M10 -32 l2 -6 l-6 3" fill="#8e6e53" ${ST}/>`,
    poisson: (c = '#ff8a1f') => `<path d="M-14 -8 Q0 -20 12 -8 Q0 4 -14 -8 Z M-14 -8 l-8 -6 l0 12 Z" fill="${c}" ${ST}/>${oeil(5, -10)}`,
    crabe: () => `<ellipse cx="0" cy="-8" rx="12" ry="7" fill="#e74c3c" ${ST}/><path d="M-10 -12 l-8 -8 M10 -12 l8 -8 M-8 -4 l-6 4 M8 -4 l6 4" fill="none" ${ST} stroke-width="2"/><circle cx="-18" cy="-22" r="4" fill="#e74c3c" ${ST}/><circle cx="18" cy="-22" r="4" fill="#e74c3c" ${ST}/>${oeil(-3, -12)}${oeil(3, -12)}`,
    dragon: () => `<path d="M-40 -10 Q-60 -20 -54 -40 Q-44 -24 -32 -22" fill="#2ecc71" ${ST}/><ellipse cx="-6" cy="-24" rx="32" ry="18" fill="#2ecc71" ${ST}/><path d="M-14 -38 Q-30 -76 4 -64 Q-6 -52 -2 -40 Z" fill="#27ae60" ${ST}/><path d="M-20 -6 L-20 -2 M10 -6 L10 -2" fill="none" ${ST} stroke-width="6"/><path d="M18 -30 L34 -54 Q52 -60 58 -48 L50 -40 L36 -36 Z" fill="#2ecc71" ${ST}/>${oeil(46, -50)}<path d="M38 -58 l-2 -8 l6 4" fill="#f1c40f" ${ST} stroke-width="1"/><path d="M-30 -42 l4 -8 l4 8 M-16 -44 l4 -8 l4 8 M-2 -42 l4 -8 l4 8" fill="#f1c40f" ${ST} stroke-width="1"/>`,
    chevreau: () => quad('#fdfefe', 30, 14, `<path d="M16 -18 L22 -32 L30 -30 L26 -18 Z" fill="#fdfefe" ${ST}/><path d="M22 -34 l-2 -6 M26 -34 l2 -6" fill="none" ${ST}/>${oeil(26, -28)}`, ''),
    loup: () => quad('#7f8c8d', 44, 18, `<path d="M20 -26 L46 -24 L28 -40 Z M22 -36 l0 -10 l7 6 M28 -38 l5 -8 l2 9" fill="#7f8c8d" ${ST}/>${oeil(30, -32)}<path d="M38 -24 l2 3 l2 -3 l2 3" fill="none" ${ST} stroke-width="1" stroke="#fff"/>`, `<path d="M-26 -18 Q-40 -16 -38 -30" fill="none" ${ST} stroke-width="5" stroke="#7f8c8d"/>`),
    fourmi: () => `<circle cx="-6" cy="-4" r="3" fill="${K}"/><circle cx="0" cy="-4" r="2.5" fill="${K}"/><circle cx="5" cy="-5" r="2.5" fill="${K}"/><path d="M-4 -2 l-3 3 M0 -2 l0 3 M3 -2 l3 3" stroke="${K}" stroke-width="1"/>`,
  };

  /* ---------- OBJETS ---------- */
  const OBJETS = {
    arbre: (c = '#2fb46a') => `<path d="M-6 0 L-5 -50 L5 -50 L6 0 Z" fill="#8a5a2e" ${ST}/><path d="M-36 -54 Q-44 -86 -16 -92 Q-6 -112 16 -98 Q42 -100 38 -72 Q48 -50 22 -46 Q0 -38 -18 -46 Q-38 -42 -36 -54 Z" fill="${c}" ${ST}/>`,
    pommier: () => OBJETS.arbre() + '<circle cx="-18" cy="-66" r="4" fill="#e74c3c" stroke="#2b2118"/><circle cx="12" cy="-80" r="4" fill="#e74c3c" stroke="#2b2118"/><circle cx="20" cy="-58" r="4" fill="#e74c3c" stroke="#2b2118"/>',
    sapin: () => `<path d="M-4 0 L-4 -12 L4 -12 L4 0 Z" fill="#8a5a2e" ${ST}/><path d="M0 -80 L-22 -44 L-12 -44 L-28 -12 L28 -12 L12 -44 L22 -44 Z" fill="#1e7a46" ${ST}/>`,
    buisson: () => `<path d="M-24 0 Q-30 -20 -12 -22 Q-4 -34 10 -24 Q28 -24 24 0 Z" fill="#3cb371" ${ST}/>`,
    fleur: (c = '#ff5a8a') => `<path d="M0 0 L0 -18" fill="none" ${ST} stroke="#2e8b57"/><circle cx="-4" cy="-22" r="4" fill="${c}" ${ST} stroke-width="1.2"/><circle cx="4" cy="-22" r="4" fill="${c}" ${ST} stroke-width="1.2"/><circle cx="0" cy="-26" r="4" fill="${c}" ${ST} stroke-width="1.2"/><circle cx="0" cy="-18" r="4" fill="${c}" ${ST} stroke-width="1.2"/><circle cx="0" cy="-22" r="2.5" fill="#ffd23f"/>`,
    fleurs: () => [-14, 0, 14].map((x, i) => `<g transform="translate(${x} 0)">${OBJETS.fleur(['#ff5a8a', '#ffd23f', '#9b59b6'][i])}</g>`).join(''),
    maison: (c = '#fff1d6') => `<path d="M-40 0 L-40 -50 L40 -50 L40 0 Z" fill="${c}" ${ST}/><path d="M-48 -48 L0 -86 L48 -48 Z" fill="#e74c3c" ${ST}/><path d="M-10 0 L-10 -28 L10 -28 L10 0" fill="#8a4b20" ${ST}/><path d="M-32 -40 L-18 -40 L-18 -26 L-32 -26 Z M18 -40 L32 -40 L32 -26 L18 -26 Z" fill="#7ad0ff" ${ST}/>`,
    grange: () => `<path d="M-46 0 L-46 -56 L0 -84 L46 -56 L46 0 Z" fill="#c0392b" ${ST}/><path d="M-16 0 L-16 -36 L16 -36 L16 0 Z" fill="#7b241c" ${ST}/><path d="M-16 -36 L16 0 M16 -36 L-16 0" stroke="#f5e6c8" stroke-width="2"/><path d="M-8 -64 L8 -64 L8 -50 L-8 -50 Z" fill="#f5e6c8" ${ST}/>`,
    niche: () => `<path d="M-20 0 L-20 -24 L0 -40 L20 -24 L20 0 Z" fill="#d68910" ${ST}/><path d="M-8 0 Q-8 -16 0 -16 Q8 -16 8 0 Z" fill="${K}"/>`,
    cage: () => `<path d="M-34 0 L-34 -60 L34 -60 L34 0 Z" fill="none" ${ST}/>` + [-22, -11, 0, 11, 22].map((x) => `<path d="M${x} 0 L${x} -60" ${ST}/>`).join(''),
    table: (c = '#c98a4b') => `<path d="M-40 -34 L40 -34 L40 -28 L-40 -28 Z" fill="${c}" ${ST}/><path d="M-34 -28 L-34 0 M34 -28 L34 0" ${ST} stroke-width="4"/>`,
    lit: () => `<path d="M-44 -8 L-44 -40 M44 -8 L44 -24" ${ST} stroke-width="5"/><path d="M-44 -24 L44 -24 L44 -10 L-44 -10 Z" fill="#7ad0ff" ${ST}/><ellipse cx="-30" cy="-28" rx="11" ry="6" fill="#fff" ${ST}/>`,
    tableau: () => `<path d="M-60 -50 L60 -50 L60 -110 L-60 -110 Z" fill="#1f4d3a" stroke="#8a5a2e" stroke-width="6"/><path d="M-46 -92 l30 0 M-46 -80 l50 0 M-46 -68 l40 0" stroke="#fff" stroke-width="2"/>`,
    pupitre: () => `<path d="M-22 -26 L22 -26 L22 -20 L-22 -20 Z" fill="#c98a4b" ${ST}/><path d="M-18 -20 L-18 0 M18 -20 L18 0" ${ST} stroke-width="3"/>`,
    livre: (c = '#e74c3c') => `<path d="M-12 0 L12 0 L12 -8 L-12 -8 Z" fill="${c}" ${ST}/><path d="M-10 -8 L-10 -1 L10 -1" fill="#fff" stroke="none"/>`,
    livreOuvert: () => `<path d="M-14 -4 Q-7 -9 0 -6 Q7 -9 14 -4 L14 4 Q7 0 0 3 Q-7 0 -14 4 Z" fill="#fff" ${ST}/><path d="M0 -6 L0 3" ${ST} stroke-width="1"/>`,
    ballon: (c = '#e74c3c') => `<circle cx="0" cy="-9" r="9" fill="${c}" ${ST}/><path d="M-9 -9 Q0 -14 9 -9 M0 -18 Q-4 -9 0 0" fill="none" stroke="#fff" stroke-width="2"/>`,
    ballonFete: (c = '#e74c3c') => `<ellipse cx="0" cy="-40" rx="10" ry="12" fill="${c}" ${ST}/><path d="M0 -28 Q4 -14 0 0" fill="none" ${ST} stroke-width="1"/>`,
    valise: (c = '#ff5a5a') => `<path d="M-20 0 L20 0 L20 -28 L-20 -28 Z" fill="${c}" ${ST}/><path d="M-6 -28 Q0 -38 6 -28" fill="none" ${ST}/>`,
    voiture: (c = '#ff8a1f') => `<path d="M-44 -10 L-40 -26 Q-30 -28 -20 -40 L16 -40 L28 -26 L44 -22 L46 -10 Z" fill="${c}" ${ST}/><path d="M-16 -36 L-2 -36 L-2 -26 L-26 -26 Z M4 -36 L14 -36 L22 -26 L4 -26 Z" fill="#cfefff" ${ST}/><circle cx="-26" cy="-8" r="9" fill="${K}"/><circle cx="-26" cy="-8" r="3" fill="#ccc"/><circle cx="28" cy="-8" r="9" fill="${K}"/><circle cx="28" cy="-8" r="3" fill="#ccc"/>`,
    autobus: () => `<path d="M-56 -8 L-56 -50 L52 -50 L58 -30 L58 -8 Z" fill="#f1c40f" ${ST}/>` + [-48, -26, -4, 18].map((x) => `<path d="M${x} -44 L${x + 18} -44 L${x + 18} -30 L${x} -30 Z" fill="#cfefff" ${ST} stroke-width="1.5"/>`).join('') + `<circle cx="-34" cy="-8" r="9" fill="${K}"/><circle cx="36" cy="-8" r="9" fill="${K}"/>`,
    train: () => `<path d="M-70 -10 L-70 -50 L-10 -50 L-10 -10 Z M-4 -10 L-4 -50 L56 -50 L66 -30 L66 -10 Z" fill="#2e86de" ${ST}/>` + [-62, -38, 4, 28].map((x) => `<path d="M${x} -44 L${x + 18} -44 L${x + 18} -30 L${x} -30 Z" fill="#cfefff" ${ST} stroke-width="1.5"/>`).join('') + [-58, -22, 8, 50].map((x) => `<circle cx="${x}" cy="-8" r="7" fill="${K}"/>`).join(''),
    avion: () => `<path d="M-50 -20 Q-50 -32 -30 -32 L40 -32 Q56 -30 58 -22 Q56 -16 40 -14 L-30 -14 Q-46 -14 -50 -20 Z" fill="#ecf0f1" ${ST}/><path d="M-6 -22 L-22 4 L-8 4 L14 -22 Z M-40 -30 L-52 -48 L-42 -48 L-28 -30 Z" fill="#3498db" ${ST}/>` + [10, 22, 34].map((x) => `<circle cx="${x}" cy="-24" r="3" fill="#7ad0ff" stroke="${K}"/>`).join(''),
    bateau: (c = '#fff8e6') => `<path d="M-30 -8 Q0 4 30 -8 L24 4 Q0 12 -24 4 Z" fill="#8a4b20" ${ST}/><path d="M0 -8 L0 -52" ${ST}/><path d="M2 -50 Q24 -30 2 -12 Z" fill="${c}" ${ST}/>`,
    caravelle: () => OBJETS.bateau(),
    parasol: () => `<path d="M0 0 L0 -52" ${ST} stroke-width="3"/><path d="M-30 -48 Q0 -76 30 -48 Z" fill="#ff5a5a" ${ST}/><path d="M-10 -66 L-6 -48 M10 -66 L6 -48" stroke="#fff" stroke-width="5"/>`,
    chateauSable: () => `<path d="M-22 0 L-22 -24 L-14 -24 L-14 -30 L-8 -30 L-8 -24 L8 -24 L8 -30 L14 -30 L14 -24 L22 -24 L22 0 Z" fill="#f5cd79" ${ST}/><path d="M-4 0 Q-4 -10 0 -10 Q4 -10 4 0" fill="#c8a25a"/><path d="M0 -30 L0 -42 L8 -38 L0 -36" fill="#e74c3c" ${ST} stroke-width="1"/>`,
    gateau: (n = 4) => `<path d="M-26 0 L-26 -20 L26 -20 L26 0 Z" fill="#8b4513" ${ST}/><path d="M-26 -20 Q-20 -14 -13 -20 Q-6 -14 0 -20 Q7 -14 13 -20 Q20 -14 26 -20" fill="#fff" ${ST}/>` + Array.from({ length: n }, (_, i) => { const x = -18 + i * 36 / Math.max(1, n - 1); return `<path d="M${x} -20 L${x} -32" stroke="#3498db" stroke-width="3"/><path d="M${x} -33 q-3 -4 0 -8 q3 4 0 8" fill="#f39c12"/>`; }).join(''),
    cadeau: (c = '#9b59b6') => `<path d="M-14 0 L14 0 L14 -22 L-14 -22 Z" fill="${c}" ${ST}/><path d="M0 0 L0 -22 M-14 -11 L14 -11" stroke="#ffd23f" stroke-width="3"/><path d="M0 -22 q-10 -10 -10 0 Z M0 -22 q10 -10 10 0 Z" fill="#ffd23f" ${ST} stroke-width="1"/>`,
    panier: () => `<path d="M-18 -14 L18 -14 L14 0 L-14 0 Z" fill="#d4a24c" ${ST}/><path d="M-14 -14 Q0 -34 14 -14" fill="none" ${ST}/>`,
    nappe: () => `<path d="M-50 0 L50 0 L40 -14 L-40 -14 Z" fill="#ff6b6b" ${ST}/><path d="M-30 -14 L-36 0 M-10 -14 L-12 0 M10 -14 L12 0 M30 -14 L36 0" stroke="#fff" stroke-width="2"/>`,
    casserole: () => `<path d="M-18 0 L18 0 L18 -20 L-18 -20 Z" fill="#7f8c8d" ${ST}/><path d="M18 -16 L40 -18" ${ST} stroke-width="4"/><path d="M-10 -24 q2 -8 0 -14 M0 -24 q2 -8 0 -14 M10 -24 q2 -8 0 -14" fill="none" stroke="#bdc3c7" stroke-width="2"/>`,
    poele: () => `<ellipse cx="0" cy="-4" rx="22" ry="6" fill="#34495e" ${ST}/><ellipse cx="0" cy="-6" rx="16" ry="4" fill="#f5cd79"/><path d="M20 -6 L44 -12" ${ST} stroke-width="4"/>`,
    crepe: () => `<ellipse cx="0" cy="-30" rx="14" ry="5" fill="#f5cd79" ${ST}/>`,
    saladier: () => `<path d="M-22 -18 Q0 6 22 -18 Z" fill="#7ad0ff" ${ST}/>`,
    oeufs: () => `<ellipse cx="-8" cy="-6" rx="5" ry="6" fill="#fff8e6" ${ST} stroke-width="1.5"/><ellipse cx="4" cy="-6" rx="5" ry="6" fill="#fff8e6" ${ST} stroke-width="1.5"/>`,
    carte: () => `<path d="M-18 -4 L-6 -8 L6 -4 L18 -8 L18 8 L6 12 L-6 8 L-18 12 Z" fill="#f9e79f" ${ST}/><path d="M-10 4 Q0 -2 8 2" fill="none" stroke="#e74c3c" stroke-width="2" stroke-dasharray="3 2"/><path d="M8 -1 l4 4 M12 -1 l-4 4" stroke="#e74c3c" stroke-width="2"/>`,
    enveloppe: () => `<path d="M-14 -2 L14 -2 L14 16 L-14 16 Z" fill="#fff" ${ST}/><path d="M-14 -2 L0 8 L14 -2" fill="none" ${ST}/>`,
    pont: () => `<path d="M-40 -12 Q0 -34 40 -12 L40 -6 Q0 -28 -40 -6 Z" fill="#a0522d" ${ST}/><path d="M-30 -18 L-30 -30 M0 -26 L0 -38 M30 -18 L30 -30 M-30 -30 Q0 -44 30 -30" fill="none" ${ST}/>`,
    ruisseau: () => `<path d="M-80 0 Q-40 -10 0 -2 Q40 6 80 -4 L80 10 Q40 18 0 10 Q-40 2 -80 12 Z" fill="#5dade2" ${ST}/>`,
    cabane: () => `<path d="M-30 0 L-30 -40 L30 -40 L30 0 Z" fill="#c98a4b" ${ST}/><path d="M-38 -38 L0 -64 L38 -38 Z" fill="#8a5a2e" ${ST}/><path d="M-30 -28 L30 -28 M-30 -14 L30 -14" stroke="${K}" stroke-width="1"/><path d="M-8 0 L-8 -24 L8 -24 L8 0" fill="#5d4037" ${ST}/>`,
    echelle: () => `<path d="M-8 0 L-8 -60 M8 0 L8 -60 M-8 -10 L8 -10 M-8 -22 L8 -22 M-8 -34 L8 -34 M-8 -46 L8 -46" fill="none" ${ST} stroke="#8a5a2e" stroke-width="3"/>`,
    marteau: () => `<path d="M0 0 L0 -20" ${ST} stroke="#8a5a2e" stroke-width="4"/><path d="M-8 -24 L8 -24 L8 -18 L-8 -18 Z" fill="#7f8c8d" ${ST}/>`,
    pinceau: () => `<path d="M0 0 L0 -18" ${ST} stroke="#c98a4b" stroke-width="4"/><path d="M-4 -18 L4 -18 L2 -26 L-2 -26 Z" fill="#3498db" ${ST} stroke-width="1"/>`,
    boite: (c = '#3498db') => `<path d="M-16 0 L16 0 L16 -20 L-16 -20 Z" fill="${c}" ${ST}/>`,
    balancoire: () => `<path d="M-30 0 L-20 -70 L20 -70 L30 0" fill="none" ${ST} stroke="#c0392b" stroke-width="4"/><path d="M-6 -70 L-6 -24 M6 -70 L6 -24" ${ST} stroke-width="1.5"/><path d="M-10 -24 L10 -24" ${ST} stroke-width="4"/>`,
    toboggan: () => `<path d="M-30 0 L-30 -56 L-18 -56 M-30 -20 L-18 -20 M-30 -38 L-18 -38 M-18 0 L-18 -56" fill="none" ${ST} stroke-width="3"/><path d="M-18 -56 Q10 -40 30 0 L20 0 Q4 -34 -18 -46 Z" fill="#f1c40f" ${ST}/>`,
    robot: () => `<path d="M-14 -10 L14 -10 L14 -36 L-14 -36 Z" fill="#bdc3c7" ${ST}/><path d="M-10 -36 L10 -36 L10 -54 L-10 -54 Z" fill="#d5dbdb" ${ST}/><circle cx="-4" cy="-46" r="2.5" fill="#3498db"/><circle cx="4" cy="-46" r="2.5" fill="#3498db"/><path d="M0 -54 L0 -60" ${ST}/><circle cx="0" cy="-62" r="3" fill="#e74c3c" ${ST} stroke-width="1"/><circle cx="-8" cy="-5" r="5" fill="${K}"/><circle cx="8" cy="-5" r="5" fill="${K}"/>`,
    glace: (c = '#ff9ff3') => `<path d="M-7 -14 L0 4 L7 -14 Z" fill="#f5cd79" ${ST}/><circle cx="0" cy="-18" r="7" fill="${c}" ${ST}/>`,
    chariotGlaces: () => `<path d="M-30 -14 L30 -14 L30 -46 L-30 -46 Z" fill="#fff" ${ST}/><path d="M-34 -46 Q0 -70 34 -46 Z" fill="#ff9ff3" ${ST}/><circle cx="-18" cy="-8" r="7" fill="${K}"/><circle cx="18" cy="-8" r="7" fill="${K}"/><path d="M-18 -30 l10 0 M2 -30 l14 0" stroke="#e74c3c" stroke-width="3"/>`,
    bonhommeNeige: () => `<circle cx="0" cy="-14" r="15" fill="#fff" ${ST}/><circle cx="0" cy="-38" r="10" fill="#fff" ${ST}/>${oeil(-3, -40)}${oeil(3, -40)}<path d="M0 -37 l8 2 l-8 1 Z" fill="#f39c12"/><path d="M-8 -48 L8 -48 L6 -62 L-6 -62 Z" fill="${K}"/>`,
    chapiteau: () => `<path d="M-60 0 L-60 -40 L60 -40 L60 0 Z" fill="#fff" ${ST}/><path d="M-36 0 L-36 -40 M-12 0 L-12 -40 M12 0 L12 -40 M36 0 L36 -40" stroke="#e74c3c" stroke-width="10"/><path d="M-66 -38 L0 -86 L66 -38 Z" fill="#e74c3c" ${ST}/><path d="M0 -86 L0 -98 L12 -94 L0 -90" fill="#f1c40f" ${ST} stroke-width="1"/><path d="M-12 0 Q0 -24 12 0" fill="${K}"/>`,
    rideau: () => `<path d="M-80 0 L-80 -150 L-40 -150 Q-50 -80 -60 0 Z M80 0 L80 -150 L40 -150 Q50 -80 60 0 Z" fill="#c0392b" ${ST}/><path d="M-80 -150 L80 -150 L80 -136 Q0 -126 -80 -136 Z" fill="#922b21" ${ST}/>`,
    scene: () => `<path d="M-90 0 L90 0 L90 -14 L-90 -14 Z" fill="#8a5a2e" ${ST}/>`,
    chapeauMagique: () => `<path d="M-12 0 L-10 -24 L10 -24 L12 0 Z M-18 0 L18 0" fill="${K}" ${ST}/><path d="M-4 -24 q-4 -14 0 -16 q4 2 2 16 M2 -24 q4 -14 8 -12 q0 4 -6 13" fill="#fff" ${ST} stroke-width="1"/>`,
    squelette: () => `<g fill="none" ${ST} stroke="#efe6cf" stroke-width="5"><path d="M-60 -40 Q-20 -80 30 -60 Q50 -54 60 -76"/><path d="M-30 -56 L-30 0 M-14 -64 L-14 0 M10 -64 L10 0 M24 -60 L24 0"/><path d="M-54 -46 l-6 12 M-44 -52 l-6 12 M-4 -66 l-2 12 M16 -64 l0 12"/></g><g fill="none" ${ST} stroke-width="1.6"><path d="M-60 -40 Q-20 -80 30 -60 Q50 -54 60 -76"/><path d="M-30 -56 L-30 0 M-14 -64 L-14 0 M10 -64 L10 0 M24 -60 L24 0"/></g><path d="M56 -78 L74 -82 L76 -70 L60 -68 Z" fill="#efe6cf" ${ST}/><path d="M64 -70 l2 4 l2 -4 l2 4" stroke="${K}" fill="none" stroke-width="1"/>`,
    vitrine: () => `<path d="M-22 0 L-22 -40 L22 -40 L22 0 Z" fill="#d6eaf8" ${ST}/><path d="M-14 -34 L-4 -24" stroke="#fff" stroke-width="3"/>`,
    banc: () => `<path d="M-30 -14 L30 -14 L30 -10 L-30 -10 Z M-30 -26 L30 -26 L30 -22 L-30 -22 Z" fill="#a0522d" ${ST}/><path d="M-24 -10 L-24 0 M24 -10 L24 0" ${ST} stroke-width="3"/>`,
    etagere: () => `<path d="M-40 0 L-40 -90 L40 -90 L40 0 Z" fill="#a0522d" ${ST}/><path d="M-40 -30 L40 -30 M-40 -60 L40 -60" ${ST}/>` + [[-34, -60, '#e74c3c'], [-26, -60, '#3498db'], [-18, -60, '#f1c40f'], [-8, -60, '#27ae60'], [10, -30, '#9b59b6'], [18, -30, '#e67e22'], [26, -30, '#3498db'], [-30, -30, '#1abc9c'], [8, -60, '#e74c3c'], [16, -60, '#f39c12']].map(([x, y, c]) => `<path d="M${x} ${y} L${x + 7} ${y} L${x + 7} ${y - 22} L${x} ${y - 22} Z" fill="${c}" stroke="${K}" stroke-width="1"/>`).join(''),
    etal: () => `<path d="M-50 -30 L50 -30 L50 0 L-50 0 Z" fill="#c98a4b" ${ST}/><path d="M-56 -60 L56 -60 L50 -46 L-50 -46 Z" fill="#e74c3c" ${ST}/><path d="M-36 -60 L-32 -46 M-12 -60 L-10 -46 M12 -60 L10 -46 M36 -60 L32 -46" stroke="#fff" stroke-width="6"/><path d="M-50 -46 L-50 -30 M50 -46 L50 -30" ${ST}/>` + [-38, -28, -18].map((x) => `<circle cx="${x}" cy="-35" r="6" fill="#e74c3c" ${ST} stroke-width="1"/>`).join('') + [0, 10, 20].map((x) => `<path d="M${x} -40 q4 -2 6 2 q-2 6 -6 6 q-4 -2 0 -8 Z" fill="#e74c3c" ${ST} stroke-width="1"/>`).join('') + `<path d="M28 -30 L46 -30 L46 -40 Z" fill="#f4d03f" ${ST} stroke-width="1"/>`,
    champignon: () => `<path d="M-4 0 L-4 -10 L4 -10 L4 0 Z" fill="#fff" ${ST}/><path d="M-14 -10 Q0 -30 14 -10 Z" fill="#e74c3c" ${ST}/><circle cx="-4" cy="-17" r="2" fill="#fff"/><circle cx="5" cy="-15" r="2" fill="#fff"/>`,
    lampe: () => `<path d="M-6 0 L6 0 L6 -16 L-6 -16 Z" fill="#7f8c8d" ${ST}/><path d="M-8 -16 L8 -16 L4 -24 L-4 -24 Z" fill="#f1c40f" ${ST}/><path d="M10 -20 L60 -40 L60 0 Z" fill="#fff36b" opacity=".45"/>`,
    cartes: () => `<path d="M-12 -2 L0 -2 L0 -18 L-12 -18 Z" fill="#fff" ${ST} stroke-width="1.5" transform="rotate(-12)"/><path d="M0 -2 L12 -2 L12 -18 L0 -18 Z" fill="#fff" ${ST} stroke-width="1.5" transform="rotate(10)"/><path d="M-6 -12 l2 -3 l2 3 l-2 3 Z" fill="#e74c3c"/><path d="M5 -9 l2 -3 l2 3 l-2 3 Z" fill="#e74c3c" transform="rotate(10)"/>`,
    velo: () => `<circle cx="-22" cy="-14" r="14" fill="none" ${ST}/><circle cx="22" cy="-14" r="14" fill="none" ${ST}/><path d="M-22 -14 L-4 -38 L16 -38 L22 -14 M-4 -38 L0 -14 L16 -38 M-8 -42 L2 -42 M16 -38 L14 -48 L22 -50" fill="none" ${ST} stroke="#e74c3c" stroke-width="3"/>`,
    poupee: () => `<path d="M-8 0 L-10 -16 L10 -16 L8 0 Z" fill="#ff7eb6" ${ST}/><circle cx="0" cy="-22" r="6" fill="#ffd9b8" ${ST}/><path d="M-6 -24 q6 -10 12 0" fill="#f1c40f" ${ST} stroke-width="1"/>`,
    rocher: () => `<path d="M-30 0 Q-34 -20 -14 -26 Q4 -34 20 -22 Q34 -14 30 0 Z" fill="#95a5a6" ${ST}/>`,
    grotte: () => `<path d="M-70 0 Q-74 -70 0 -76 Q70 -70 70 0 Z" fill="#7f8c8d" ${ST}/><path d="M-30 0 Q-30 -44 0 -44 Q30 -44 30 0 Z" fill="${K}"/>`,
    nuage: () => `<path d="M-30 0 Q-34 -14 -18 -16 Q-12 -30 4 -24 Q16 -32 26 -20 Q38 -18 32 0 Z" fill="#fff" ${ST}/>`,
    soleil: () => `<circle cx="0" cy="0" r="16" fill="#ffd23f" ${ST}/>` + [0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<path d="M0 -22 L0 -30" ${ST} transform="rotate(${a})"/>`).join(''),
    lune: () => `<path d="M0 -18 A18 18 0 1 0 0 18 A11 18 0 1 1 0 -18 Z" fill="#fff36b" ${ST}/>`,
    reveil: () => `<circle cx="0" cy="-12" r="11" fill="#e74c3c" ${ST}/><circle cx="0" cy="-12" r="8" fill="#fff"/><path d="M0 -12 L0 -18 M0 -12 L4 -10" ${ST} stroke-width="1.5"/><path d="M-12 -20 l4 -4 M12 -20 l-4 -4" ${ST}/>`,
    cloche: () => `<path d="M-12 0 Q-12 -22 0 -24 Q12 -22 12 0 Z" fill="#f1c40f" ${ST}/><circle cx="0" cy="2" r="3" fill="${K}"/>`,
    billes: () => ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f'].map((c, i) => `<circle cx="${-12 + i * 8}" cy="-4" r="3.5" fill="${c}" ${ST} stroke-width="1"/>`).join(''),
    corde: () => `<path d="M-22 -2 Q0 30 22 -2" fill="none" stroke="#e74c3c" stroke-width="2.5"/>`,
    tracteur: () => `<path d="M-30 -14 L-30 -34 L4 -34 L4 -50 L24 -50 L24 -14 Z" fill="#27ae60" ${ST}/><path d="M8 -46 L20 -46 L20 -34 L8 -34 Z" fill="#cfefff" ${ST}/><circle cx="12" cy="-14" r="16" fill="${K}"/><circle cx="12" cy="-14" r="6" fill="#f1c40f"/><circle cx="-22" cy="-10" r="10" fill="${K}"/><circle cx="-22" cy="-10" r="4" fill="#f1c40f"/>`,
    foin: () => `<path d="M-22 0 Q-24 -26 0 -28 Q24 -26 22 0 Z" fill="#f4d03f" ${ST}/><path d="M-12 -6 l4 -12 M0 -4 l0 -16 M10 -6 l-2 -14" stroke="#c9a227" stroke-width="1.5"/>`,
    mare: () => `<ellipse cx="0" cy="-2" rx="54" ry="10" fill="#5dade2" ${ST}/>`,
    seau: () => `<path d="M-10 -18 L10 -18 L8 0 L-8 0 Z" fill="#3498db" ${ST}/><path d="M-10 -18 Q0 -30 10 -18" fill="none" ${ST} stroke-width="1.5"/>`,
    ble: () => [-12, -4, 4, 12].map((x) => `<path d="M${x} 0 L${x} -26" stroke="#c9a227" stroke-width="2"/><ellipse cx="${x}" cy="-30" rx="3" ry="6" fill="#f4d03f" ${ST} stroke-width="1"/>`).join(''),
    pain: () => `<ellipse cx="0" cy="-8" rx="20" ry="9" fill="#d4a24c" ${ST}/><path d="M-10 -12 l4 6 M0 -14 l4 6 M10 -12 l4 6" stroke="${K}" stroke-width="1.5"/>`,
    porte: () => `<path d="M-18 0 L-18 -70 L18 -70 L18 0 Z" fill="#8a4b20" ${ST}/><circle cx="10" cy="-34" r="2.5" fill="#f1c40f"/>`,
    fenetre: () => `<path d="M-24 -50 L24 -50 L24 -90 L-24 -90 Z" fill="#7ad0ff" ${ST}/><path d="M0 -50 L0 -90 M-24 -70 L24 -70" ${ST} stroke-width="2"/>`,
    tele: () => `<path d="M-24 -20 L24 -20 L24 -52 L-24 -52 Z" fill="#34495e" ${ST}/><path d="M-20 -24 L20 -24 L20 -48 L-20 -48 Z" fill="#85c1e9"/><path d="M-10 -20 L-14 0 M10 -20 L14 0" ${ST}/>`,
    saut: () => `<path d="M-6 0 Q0 -20 6 0" fill="none" ${ST} stroke-dasharray="3 3"/>`,
    bougie: () => `<path d="M-3 0 L3 0 L3 -14 L-3 -14 Z" fill="#fff" ${ST}/><path d="M0 -15 q-3 -4 0 -8 q3 4 0 8" fill="#f39c12"/>`,
    pommeDePin: () => `<ellipse cx="0" cy="-8" rx="6" ry="9" fill="#8a5a2e" ${ST}/><path d="M-5 -10 l10 0 M-5 -5 l10 0" stroke="#5d4037"/>`,
    olives: () => `<path d="M-14 0 L14 0 L12 -10 L-12 -10 Z" fill="#fff" ${ST}/>` + [-8, 0, 8].map((x) => `<ellipse cx="${x}" cy="-13" rx="4" ry="3" fill="#556b2f" stroke="${K}" stroke-width="1"/>`).join(''),
    fromage: () => `<path d="M-16 0 L16 0 L16 -12 L-16 -2 Z" fill="#f4d03f" ${ST}/><circle cx="-2" cy="-4" r="2" fill="#c9a227"/><circle cx="8" cy="-6" r="1.8" fill="#c9a227"/>`,
    pastille: (c = '#f1c40f') => `<circle cx="0" cy="-6" r="6" fill="${c}" ${ST} stroke-width="1"/>`,
    sac: (c = '#2980b9') => `<path d="M-12 0 L12 0 L12 -22 Q0 -28 -12 -22 Z" fill="${c}" ${ST}/><path d="M-6 -14 L6 -14 L6 -6 L-6 -6 Z" fill="none" ${ST} stroke-width="1"/>`,
    manteau: () => `<path d="M-12 0 L-14 -30 L-6 -34 L0 -30 L6 -34 L14 -30 L12 0 Z" fill="#c0392b" ${ST}/>`,
    chaussures: () => `<path d="M-14 0 L-14 -6 Q-8 -10 -2 -6 L-2 0 Z M2 0 L2 -6 Q8 -10 14 -6 L14 0 Z" fill="#6e4b2a" ${ST}/>`,
    tasse: () => `<path d="M-8 0 L8 0 L10 -14 L-10 -14 Z" fill="#fff" ${ST}/><path d="M10 -12 q8 2 0 8" fill="none" ${ST}/><path d="M-4 -18 q2 -4 0 -8 M4 -18 q2 -4 0 -8" stroke="#bdc3c7" fill="none" stroke-width="2"/>`,
    bol: () => `<path d="M-12 -12 Q0 8 12 -12 Z" fill="#3498db" ${ST}/>`,
    skis: () => `<path d="M-30 -2 L30 -6 M-30 4 L30 0" ${ST} stroke="#e74c3c" stroke-width="4"/>`,
    chalet: () => `<path d="M-40 0 L-40 -40 L40 -40 L40 0 Z" fill="#a0522d" ${ST}/><path d="M-50 -38 L0 -76 L50 -38 Z" fill="#fff" ${ST}/><path d="M-26 -30 L-10 -30 L-10 -16 L-26 -16 Z M10 -30 L26 -30 L26 -16 L10 -16 Z" fill="#f9e79f" ${ST}/>`,
    tourniquet: () => `<ellipse cx="0" cy="-8" rx="30" ry="7" fill="#e74c3c" ${ST}/><path d="M0 -8 L0 -30 M-20 -24 L20 -24" ${ST} stroke-width="3"/>`,
    pelle: () => `<path d="M0 0 L0 -36" ${ST} stroke="#8a5a2e" stroke-width="3"/><path d="M-6 0 L6 0 L4 10 L-4 10 Z" fill="#7f8c8d" ${ST}/>`,
    radis: () => [-10, 0, 10].map((x) => `<circle cx="${x}" cy="-4" r="4" fill="#e74c3c" ${ST} stroke-width="1"/><path d="M${x} -8 l-3 -8 M${x} -8 l3 -8" stroke="#27ae60" stroke-width="2"/>`).join(''),
    tomates: () => `<path d="M0 0 L0 -50" stroke="#8a5a2e" stroke-width="2"/><path d="M0 -10 l-10 -6 M0 -26 l10 -6 M0 -40 l-8 -6" stroke="#27ae60" stroke-width="2"/>` + [[-10, -14], [10, -30], [-8, -44]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#e74c3c" ${ST} stroke-width="1"/>`).join(''),
    feuilles: () => [[-12, -2, '#e67e22'], [0, -6, '#d35400'], [12, -2, '#f1c40f']].map(([x, y, c]) => `<ellipse cx="${x}" cy="${y}" rx="6" ry="3" fill="${c}" ${ST} stroke-width="1"/>`).join(''),
    portail: () => `<path d="M-30 0 L-30 -40 M30 0 L30 -40 M-30 -36 L30 -36 M-30 -8 L30 -8" fill="none" ${ST} stroke-width="3"/>` + [-18, -6, 6, 18].map((x) => `<path d="M${x} -8 L${x} -36" ${ST} stroke-width="2"/>`).join(''),
    ciseaux: () => `<circle cx="-6" cy="-4" r="4" fill="none" ${ST} stroke="#e74c3c"/><circle cx="6" cy="-4" r="4" fill="none" ${ST} stroke="#e74c3c"/><path d="M-4 -7 L8 -24 M4 -7 L-8 -24" ${ST} stroke-width="2"/>`,
    planche: () => `<path d="M-40 -6 L40 -10 L40 -2 L-40 2 Z" fill="#d4a24c" ${ST}/>`,
    bouteille: () => `<path d="M-5 0 L5 0 L5 -16 L2 -20 L2 -26 L-2 -26 L-2 -20 L-5 -16 Z" fill="#f39c12" ${ST}/>`,
    boussole: () => `<circle cx="0" cy="-8" r="8" fill="#fff" ${ST}/><path d="M0 -14 l2 6 l-2 6 l-2 -6 Z" fill="#e74c3c"/>`,
    lac: () => `<ellipse cx="0" cy="-4" rx="80" ry="14" fill="#5dade2" ${ST}/>`,
    lacGele: () => `<ellipse cx="0" cy="-4" rx="70" ry="12" fill="#d6eaf8" ${ST}/><path d="M-30 -6 l16 -2 M10 -4 l20 -2" stroke="#fff" stroke-width="2"/>`,
    rails: () => `<path d="M-100 0 L100 0 M-100 -4 L100 -4" stroke="#7f8c8d" stroke-width="2"/>`,
    tableauNoir: () => OBJETS.tableau(),
    nid: () => `<path d="M-12 0 Q0 8 12 0 Q10 -8 0 -6 Q-10 -8 -12 0 Z" fill="#8a5a2e" ${ST}/>`,
    os: () => `<path d="M-10 -4 L10 -4" stroke="#fff" stroke-width="5"/><circle cx="-11" cy="-6" r="3" fill="#fff" ${ST} stroke-width="1"/><circle cx="-11" cy="-2" r="3" fill="#fff" ${ST} stroke-width="1"/><circle cx="11" cy="-6" r="3" fill="#fff" ${ST} stroke-width="1"/><circle cx="11" cy="-2" r="3" fill="#fff" ${ST} stroke-width="1"/>`,
    gamelle: () => `<path d="M-12 0 L12 0 L10 -8 L-10 -8 Z" fill="#e74c3c" ${ST}/><path d="M-8 -8 q8 -6 16 0" fill="#8a5a2e"/>`,
    biscuit: () => `<circle cx="0" cy="-5" r="5" fill="#d4a24c" ${ST} stroke-width="1"/>`,
    assiette: () => `<ellipse cx="0" cy="-2" rx="14" ry="4" fill="#fff" ${ST}/>`,
    verre: () => `<path d="M-5 0 L5 0 L6 -14 L-6 -14 Z" fill="#fff" ${ST} stroke-width="1.5"/>`,
    baguette: () => `<path d="M0 0 L14 -24" stroke="${K}" stroke-width="2.5"/><path d="M14 -24 l2 -6 l2 6 l6 0 l-5 4 l2 6 l-5 -4 l-5 4 l2 -6 l-5 -4 Z" fill="#ffd23f" ${ST} stroke-width="1"/>`,
    appareilPhoto: () => `<path d="M-10 0 L10 0 L10 -12 L-10 -12 Z" fill="#34495e" ${ST}/><circle cx="0" cy="-6" r="4" fill="#85c1e9" ${ST} stroke-width="1"/>`,
    bulles: () => `<circle cx="0" cy="-6" r="3" fill="none" stroke="#fff" stroke-width="1.5"/><circle cx="6" cy="-14" r="2.5" fill="none" stroke="#fff" stroke-width="1.5"/>`,
    ville: () => [[-90, 60, '#f5b7b1'], [-50, 90, '#aed6f1'], [-10, 70, '#f9e79f'], [30, 100, '#d7bde2'], [70, 66, '#a9dfbf']].map(([x, h, c]) => `<path d="M${x} 0 L${x + 36} 0 L${x + 36} -${h} L${x} -${h} Z" fill="${c}" ${ST}/>` + `<path d="M${x + 8} -${h - 12} l8 0 l0 10 l-8 0 Z M${x + 20} -${h - 12} l8 0 l0 10 l-8 0 Z" fill="#fff" stroke="${K}" stroke-width="1"/>`).join(''),
    gare: () => `<path d="M-70 0 L-70 -60 L70 -60 L70 0 Z" fill="#f5e6c8" ${ST}/><path d="M-78 -58 L0 -86 L78 -58 Z" fill="#7f8c8d" ${ST}/><circle cx="0" cy="-70" r="8" fill="#fff" ${ST}/><path d="M0 -70 L0 -76 M0 -70 L4 -68" stroke="${K}" stroke-width="1.5"/>`,
    piscine: () => `<path d="M-100 0 L100 0 L100 -30 L-100 -30 Z" fill="#48c9f0" ${ST}/><path d="M-90 -20 q10 -4 20 0 t20 0 M10 -14 q10 -4 20 0 t20 0" fill="none" stroke="#fff" stroke-width="2"/><path d="M-100 -30 L100 -30" stroke="#fff" stroke-width="4"/>`,
    lunettesSoleil: () => `<circle cx="-7" cy="-5" r="5" fill="${K}"/><circle cx="7" cy="-5" r="5" fill="${K}"/><path d="M-2 -6 L2 -6" stroke="${K}" stroke-width="2"/>`,
    plongeoir: () => `<path d="M-4 0 L-4 -40 L4 -40 L4 0 Z" fill="#bdc3c7" ${ST}/><path d="M-4 -40 L40 -42 L40 -38 L-4 -36 Z" fill="#3498db" ${ST}/>`,
  };

  /* ---------- DÉCORS (fond d'un moment, largeur w) ---------- */
  const DECORS = {
    jardin: (w) => `<rect x="0" y="0" width="${w}" height="${H}" fill="#9fdcff"/><path d="M0 ${SOL - 10} Q${w / 2} ${SOL - 24} ${w} ${SOL - 10} L${w} ${H} L0 ${H} Z" fill="#7ccf5b" ${ST}/>`,
    parc: (w) => DECORS.jardin(w),
    ferme: (w) => `<rect x="0" y="0" width="${w}" height="${H}" fill="#b8e6ff"/><path d="M0 ${SOL - 30} Q${w / 3} ${SOL - 60} ${w * .7} ${SOL - 36} Q${w * .9} ${SOL - 30} ${w} ${SOL - 40} L${w} ${H} L0 ${H} Z" fill="#a9d86e" ${ST}/><path d="M0 ${SOL - 8} L${w} ${SOL - 8} L${w} ${H} L0 ${H} Z" fill="#8bc34a"/>`,
    maison: (w) => `<rect x="0" y="0" width="${w}" height="${H}" fill="#fff1c9"/><path d="M0 ${SOL - 6} L${w} ${SOL - 6} L${w} ${H} L0 ${H} Z" fill="#c98a4b" ${ST}/><path d="M0 ${SOL - 70} L${w} ${SOL - 70}" stroke="#f5d79e" stroke-width="3"/>`,
    cuisine: (w) => `<rect x="0" y="0" width="${w}" height="${H}" fill="#e8f8f5"/>` + Array.from({ length: Math.ceil(w / 20) }, (_, i) => `<path d="M${i * 20} 90 L${i * 20} ${SOL - 6}" stroke="#d1f2eb" stroke-width="1"/>`).join('') + `<path d="M0 90 L${w} 90" stroke="#a3e4d7" stroke-width="2"/><path d="M0 ${SOL - 6} L${w} ${SOL - 6} L${w} ${H} L0 ${H} Z" fill="#d7ccc8" ${ST}/>`,
    classe: (w) => `<rect x="0" y="0" width="${w}" height="${H}" fill="#fdebd0"/><path d="M0 ${SOL - 6} L${w} ${SOL - 6} L${w} ${H} L0 ${H} Z" fill="#b9770e" ${ST}/>`,
    plage: (w) => `<rect x="0" y="0" width="${w}" height="${H}" fill="#87d5ff"/><path d="M0 120 L${w} 120 L${w} ${SOL - 16} L0 ${SOL - 16} Z" fill="#2e86de"/><path d="M0 130 q12 -5 24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0" fill="none" stroke="#fff" stroke-width="2"/><path d="M0 ${SOL - 20} Q${w / 2} ${SOL - 30} ${w} ${SOL - 18} L${w} ${H} L0 ${H} Z" fill="#f7dc8f" ${ST}/>`,
    mer: (w) => `<rect x="0" y="0" width="${w}" height="${H}" fill="#87d5ff"/><path d="M0 110 L${w} 110 L${w} ${H} L0 ${H} Z" fill="#2e86de" ${ST}/><path d="M0 140 q12 -6 24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0" fill="none" stroke="#fff" stroke-width="2"/>`,
    foret: (w) => `<rect x="0" y="0" width="${w}" height="${H}" fill="#cdeccd"/><path d="M0 ${SOL - 10} L${w} ${SOL - 10} L${w} ${H} L0 ${H} Z" fill="#6fae4b" ${ST}/>` + [.12, .45, .8].map((f) => `<g transform="translate(${w * f} ${SOL - 40}) scale(.8)">${OBJETS.sapin()}</g>`).join(''),
    nuit: (w) => `<rect x="0" y="0" width="${w}" height="${H}" fill="#1b2a49"/><path d="M0 ${SOL - 10} L${w} ${SOL - 10} L${w} ${H} L0 ${H} Z" fill="#24452e" ${ST}/>` + [[.1, 20], [.3, 40], [.55, 18], [.75, 50], [.9, 26]].map(([f, y]) => `<circle cx="${w * f}" cy="${y}" r="1.8" fill="#fff"/>`).join(''),
    neige: (w) => `<rect x="0" y="0" width="${w}" height="${H}" fill="#cfe6f5"/><path d="M0 ${SOL - 20} Q${w / 2} ${SOL - 40} ${w} ${SOL - 18} L${w} ${H} L0 ${H} Z" fill="#fff" ${ST}/>` + [[.1, 30], [.25, 70], [.4, 20], [.6, 60], [.75, 30], [.9, 80], [.5, 110], [.15, 120]].map(([f, y]) => `<circle cx="${w * f}" cy="${y}" r="3" fill="#fff" stroke="#9fb8c8" stroke-width=".8"/>`).join(''),
    cirque: (w) => `<rect x="0" y="0" width="${w}" height="${H}" fill="#3b1f4a"/><path d="M0 0 L${w / 2} 60 L${w} 0" fill="#e74c3c" opacity=".55"/><path d="M0 ${SOL - 6} L${w} ${SOL - 6} L${w} ${H} L0 ${H} Z" fill="#d68910" ${ST}/><ellipse cx="${w / 2}" cy="${SOL}" rx="${w * .42}" ry="14" fill="#f5cba7" ${ST}/>`,
    theatre: (w) => `<rect x="0" y="0" width="${w}" height="${H}" fill="#2c1a35"/><path d="M0 ${SOL - 20} L${w} ${SOL - 20} L${w} ${H} L0 ${H} Z" fill="#8a5a2e" ${ST}/><path d="M0 0 L${w * .2} 0 Q${w * .14} 90 ${w * .06} ${SOL - 20} L0 ${SOL - 20} Z M${w} 0 L${w * .8} 0 Q${w * .86} 90 ${w * .94} ${SOL - 20} L${w} ${SOL - 20} Z" fill="#c0392b" ${ST}/>`,
    zoo: (w) => `<rect x="0" y="0" width="${w}" height="${H}" fill="#b8e6ff"/><path d="M0 ${SOL - 10} L${w} ${SOL - 10} L${w} ${H} L0 ${H} Z" fill="#d4b483" ${ST}/>`,
    musee: (w) => `<rect x="0" y="0" width="${w}" height="${H}" fill="#efe6d4"/><path d="M0 ${SOL - 6} L${w} ${SOL - 6} L${w} ${H} L0 ${H} Z" fill="#b89b72" ${ST}/><path d="M${w * .1} 30 L${w * .3} 30 L${w * .3} 70 L${w * .1} 70 Z" fill="#fff" stroke="#8a6d3b" stroke-width="3"/><circle cx="${w * .2}" cy="50" r="9" fill="#7fb3d5"/>`,
    rue: (w) => `<rect x="0" y="0" width="${w}" height="${H}" fill="#aee1ff"/><g transform="translate(${w / 2} ${SOL - 12})">${OBJETS.ville()}</g><path d="M0 ${SOL - 12} L${w} ${SOL - 12} L${w} ${H} L0 ${H} Z" fill="#95a5a6" ${ST}/>`,
    route: (w) => `<rect x="0" y="0" width="${w}" height="${H}" fill="#aee1ff"/><path d="M0 ${SOL - 40} Q${w / 2} ${SOL - 70} ${w} ${SOL - 44} L${w} ${H} L0 ${H} Z" fill="#7ccf5b" ${ST}/><path d="M0 ${SOL - 14} L${w} ${SOL - 14} L${w} ${SOL + 14} L0 ${SOL + 14} Z" fill="#7f8c8d" ${ST}/><path d="M6 ${SOL} L${w} ${SOL}" stroke="#fff" stroke-width="3" stroke-dasharray="14 10"/>`,
    piscine: (w) => `<rect x="0" y="0" width="${w}" height="${H}" fill="#e8f8f5"/><path d="M0 ${SOL - 50} L${w} ${SOL - 50} L${w} ${H} L0 ${H} Z" fill="#48c9f0" ${ST}/><path d="M10 ${SOL - 30} q10 -4 20 0 t20 0 t20 0 M${w / 2} ${SOL - 10} q10 -4 20 0 t20 0" fill="none" stroke="#fff" stroke-width="2"/>`,
    bibliotheque: (w) => `<rect x="0" y="0" width="${w}" height="${H}" fill="#fbeee6"/><g transform="translate(${w * .25} ${SOL - 6})">${OBJETS.etagere()}</g><g transform="translate(${w * .78} ${SOL - 6})">${OBJETS.etagere()}</g><path d="M0 ${SOL - 6} L${w} ${SOL - 6} L${w} ${H} L0 ${H} Z" fill="#a04000" ${ST}/>`,
    marche: (w) => `<rect x="0" y="0" width="${w}" height="${H}" fill="#aee1ff"/><path d="M0 ${SOL - 10} L${w} ${SOL - 10} L${w} ${H} L0 ${H} Z" fill="#d5d8dc" ${ST}/>`,
    montagne: (w) => `<rect x="0" y="0" width="${w}" height="${H}" fill="#b8e6ff"/><path d="M0 ${SOL - 40} L${w * .3} 50 L${w * .55} ${SOL - 60} L${w * .8} 40 L${w} ${SOL - 50} L${w} ${H} L0 ${H} Z" fill="#fff" ${ST}/><path d="M${w * .22} 80 L${w * .3} 50 L${w * .38} 80 M${w * .72} 70 L${w * .8} 40 L${w * .88} 70" fill="none" stroke="#9fb8c8" stroke-width="2"/>`,
    ciel: (w) => `<rect x="0" y="0" width="${w}" height="${H}" fill="#9fdcff"/>`,
    gare: (w) => `<rect x="0" y="0" width="${w}" height="${H}" fill="#d6eaf8"/><path d="M0 ${SOL - 10} L${w} ${SOL - 10} L${w} ${H} L0 ${H} Z" fill="#bfc9ca" ${ST}/>`,
    grotte: (w) => `<rect x="0" y="0" width="${w}" height="${H}" fill="#b8e6ff"/><path d="M0 ${SOL - 10} L${w} ${SOL - 10} L${w} ${H} L0 ${H} Z" fill="#a9d86e" ${ST}/>`,
    lac: (w) => `<rect x="0" y="0" width="${w}" height="${H}" fill="#b8e6ff"/><path d="M0 ${SOL - 50} L${w} ${SOL - 50} L${w} ${H} L0 ${H} Z" fill="#7ccf5b" ${ST}/><ellipse cx="${w * .6}" cy="${SOL - 30}" rx="${w * .38}" ry="16" fill="#5dade2" ${ST}/>`,
    reve: (w) => `<rect x="0" y="0" width="${w}" height="${H}" fill="#c9b8ff"/>` + [[.15, 40], [.5, 26], [.85, 50]].map(([f, y]) => `<g transform="translate(${w * f} ${y})">${OBJETS.nuage()}</g>`).join(''),
  };

  /* ---------- BULLES ---------- */
  function bulle(txt, o = {}) {
    const n = String(txt).length, w = Math.max(22, n * 7.5 + 14), h = 22, dx = o.gauche ? -w + 6 : -6;
    return `<path d="M${dx} ${-h} L${dx + w} ${-h} L${dx + w} 0 L${o.gauche ? -2 : 10} 0 L${o.gauche ? -8 : 2} 8 L${o.gauche ? -10 : 4} 0 L${dx} 0 Z" fill="#fff" ${ST} stroke-width="1.6"/><text x="${dx + w / 2}" y="-6" text-anchor="middle" font-family="Comic Sans MS, Chalkboard SE, cursive" font-size="14" font-weight="bold" fill="${K}">${String(txt).replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text>`;
  }

  /* ---------- UN ÉLÉMENT ---------- */
  /* [nom, x (0..100 % de la largeur du moment), y (px, défaut : le sol), échelle, options] */
  function element(it, w) {
    const [nom, xp, y0, s0, o0] = it, x = (xp / 100) * w, y = y0 == null ? SOL : y0, s = s0 || 1, o = o0 || {};
    let corps = '';
    if (PERSOS[nom] || nom === 'perso') corps = personne(Object.assign({}, PERSOS[nom] || {}, o));
    else if (ANIMAUX[nom]) corps = ANIMAUX[nom](o.c);
    else if (OBJETS[nom]) corps = OBJETS[nom](o.c != null ? o.c : o.n);
    else if (nom === 'bulle') return `<g transform="translate(${x} ${y})">${bulle(o.t, o)}</g>`;
    else if (nom === 'texte') return `<text x="${x}" y="${y}" text-anchor="middle" font-family="Comic Sans MS, Chalkboard SE, cursive" font-size="${o.taille || 22}" font-weight="bold" fill="${o.c || K}">${o.t}</text>`;
    else if (nom === 'pluie') {
      if (!xp) return Array.from({ length: 14 }, (_, i) => `<path d="M${(i * 37) % w} ${(i * 53) % 150} l-4 12" stroke="#5dade2" stroke-width="2"/>`).join('');
      /* la pluie vue par la fenêtre (posée au même x que la fenêtre) */
      return [[-14, -84], [4, -80], [-6, -68], [14, -66], [-16, -60], [8, -56]].map(([dx, dy]) => `<path d="M${x + dx} ${SOL + dy} l-3 8" stroke="#1f5fa8" stroke-width="2"/>`).join('');
    }
    else if (nom === 'notes') return `<g transform="translate(${x} ${y})"><path d="M0 0 l0 -16 l8 -2 l0 16" fill="none" ${ST}/><circle cx="-2" cy="0" r="3" fill="${K}"/><circle cx="6" cy="-2" r="3" fill="${K}"/><path d="M18 -10 l0 -14" ${ST}/><circle cx="16" cy="-10" r="3" fill="${K}"/></g>`;
    else if (nom === 'zzz') return `<text x="${x}" y="${y}" font-family="Comic Sans MS, cursive" font-size="16" font-weight="bold" fill="#5d6d7e">z z z</text>`;
    else if (nom === 'mouvement') return `<path d="M${x} ${y} l-18 0 M${x} ${y + 8} l-12 0 M${x} ${y - 8} l-12 0" stroke="${K}" stroke-width="2"/>`;
    else if (nom === 'eclairs') return `<path d="M${x} ${y} l-8 18 l8 0 l-8 18" fill="none" stroke="#f1c40f" stroke-width="4"/>`;
    else if (nom === 'feu') return `<g transform="translate(${x} ${y})"><path d="M0 0 Q20 -14 44 -6 Q30 0 44 8 Q20 14 0 0 Z" fill="#ff6b00" ${ST}/><path d="M4 0 Q18 -6 30 -2 Q20 2 30 4 Q16 6 4 0 Z" fill="#ffd23f"/></g>`;
    else if (nom === 'coeur') return `<path d="M${x} ${y} c-6 -8 -16 -2 -8 6 l8 8 l8 -8 c8 -8 -2 -14 -8 -6 Z" fill="#e74c3c" ${ST} stroke-width="1"/>`;
    else return '';
    const flip = o.flip ? ' scale(-1 1)' : '';
    return `<g transform="translate(${x} ${y}) scale(${s})${flip}">${corps}</g>`;
  }

  /* ---------- UNE SCÈNE : 1 à 3 moments ---------- */
  /* scene = { moments: [ { decor, el: [...], titre } ] } */
  function svgScene(scene) {
    const M = scene.moments || [scene], n = M.length, W = 600, G = 8, w = (W - G * (n - 1)) / n;
    let s = '';
    M.forEach((m, i) => {
      const x0 = i * (w + G), id = `c${Math.random().toString(36).slice(2, 7)}`;
      s += `<clipPath id="${id}"><rect x="0" y="0" width="${w}" height="${H}" rx="10"/></clipPath><g transform="translate(${x0} 0)"><g clip-path="url(#${id})">${(DECORS[m.decor] || DECORS.jardin)(w)}${(m.el || []).map((it) => element(it, w)).join('')}</g><rect x="1" y="1" width="${w - 2}" height="${H - 2}" rx="10" fill="none" ${ST} stroke-width="3"/>${n > 1 ? `<circle cx="18" cy="${H - 18}" r="12" fill="#fff" ${ST}/><text x="18" y="${H - 13}" text-anchor="middle" font-family="Comic Sans MS, cursive" font-size="14" font-weight="bold" fill="${K}">${i + 1}</text>` : ''}</g>`;
      if (i < n - 1) s += `<path d="M${x0 + w - 6} ${H / 2} l${G + 10} 0" stroke="${K}" stroke-width="3" marker-end="url(#fl)"/>`;
    });
    return `<svg class="illus-svg" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${(scene.alt || '').replace(/"/g, '&quot;')}"><defs><marker id="fl" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="${K}"/></marker></defs>${s}</svg>`;
  }

  
  /* ============================================================
     MNEMOSCIENCES — AJOUTS À LA BIBLIOTHÈQUE DE MNEMOGRAM
     Mêmes règles : origine au pied de l'objet (y négatif vers le haut), trait sombre K, aplats vifs.
     ============================================================ */
  Object.assign(ANIMAUX, {
    papillon: (c = '#ff8a1f') => `<path d="M0 -20 Q-18 -38 -20 -22 Q-20 -12 0 -18 Q-16 -10 -12 -2 Q-6 2 0 -16 Z" fill="${c}" ${ST}/><path d="M0 -20 Q18 -38 20 -22 Q20 -12 0 -18 Q16 -10 12 -2 Q6 2 0 -16 Z" fill="${c}" ${ST}/><path d="M0 -24 L0 -8" ${ST} stroke-width="3"/><path d="M0 -24 q-3 -6 -6 -7 M0 -24 q3 -6 6 -7" fill="none" ${ST} stroke-width="1.2"/><circle cx="-11" cy="-24" r="2.5" fill="#fff"/><circle cx="11" cy="-24" r="2.5" fill="#fff"/>`,
    chenille: (c = '#7ccf3a') => [-20, -12, -4, 4, 12].map((x) => `<circle cx="${x}" cy="-6" r="6" fill="${c}" ${ST} stroke-width="1.6"/>`).join('') + `<circle cx="20" cy="-8" r="7" fill="${c}" ${ST}/>${oeil(22, -10)}<path d="M18 -15 l-2 -5 M22 -15 l2 -5" ${ST} stroke-width="1.2"/>`,
    chrysalide: () => `<path d="M0 -40 L0 -32" ${ST}/><path d="M0 -32 Q10 -22 6 -8 Q0 2 -6 -8 Q-10 -22 0 -32 Z" fill="#b5a33c" ${ST}/><path d="M-5 -20 q5 3 10 0 M-5 -13 q5 3 10 0" fill="none" ${ST} stroke-width="1"/>`,
    tetard: () => `<ellipse cx="0" cy="-6" rx="7" ry="5.5" fill="#3d3d3d" ${ST}/><path d="M-6 -6 Q-14 -12 -22 -4 Q-14 -6 -6 -4" fill="#3d3d3d" ${ST} stroke-width="1.4"/><circle cx="3" cy="-8" r="1.6" fill="#fff"/>`,
    grenouille: (c = '#4caf50') => `<ellipse cx="0" cy="-10" rx="15" ry="10" fill="${c}" ${ST}/><circle cx="-7" cy="-20" r="5" fill="${c}" ${ST}/><circle cx="7" cy="-20" r="5" fill="${c}" ${ST}/><circle cx="-7" cy="-21" r="2" fill="${K}"/><circle cx="7" cy="-21" r="2" fill="${K}"/><path d="M-6 -10 q6 4 12 0" fill="none" ${ST} stroke-width="1.4"/><path d="M-14 -4 l-8 4 l10 0 M14 -4 l8 4 l-10 0" fill="${c}" ${ST} stroke-width="1.6"/>`,
    abeille: () => `<ellipse cx="0" cy="-10" rx="11" ry="7" fill="#ffd23f" ${ST}/><path d="M-3 -17 l0 14 M4 -16 l0 12" ${ST} stroke-width="3"/><ellipse cx="-4" cy="-20" rx="6" ry="4" fill="#e8f8ff" ${ST} stroke-width="1.2" transform="rotate(-25 -4 -20)"/><ellipse cx="4" cy="-21" rx="6" ry="4" fill="#e8f8ff" ${ST} stroke-width="1.2" transform="rotate(25 4 -21)"/>${oeil(8, -11)}`,
    coccinelle: () => `<path d="M-12 -2 Q-12 -20 0 -20 Q12 -20 12 -2 Z" fill="#e74c3c" ${ST}/><path d="M0 -20 L0 -2" ${ST} stroke-width="1.4"/><circle cx="-6" cy="-12" r="2.4" fill="${K}"/><circle cx="6" cy="-12" r="2.4" fill="${K}"/><circle cx="-5" cy="-6" r="2" fill="${K}"/><circle cx="5" cy="-6" r="2" fill="${K}"/><circle cx="13" cy="-6" r="4" fill="${K}"/>`,
    escargot: () => `<path d="M-18 0 L16 0 Q22 0 22 -6 L22 -12" fill="#d7b68a" ${ST}/><path d="M18 -12 l-2 -8 M22 -12 l3 -8" ${ST} stroke-width="1.2"/><circle cx="-2" cy="-14" r="12" fill="#c0702a" ${ST}/><path d="M-2 -14 m-6 0 a6 6 0 1 1 6 6 a3 3 0 1 1 -2 -4" fill="none" ${ST} stroke-width="1.4"/>`,
    herisson: () => `<path d="M-20 0 Q-22 -22 0 -24 Q16 -24 20 -8 L28 -4 L20 0 Z" fill="#8d6e63" ${ST}/>` + [-16, -10, -4, 2, 8].map((x) => `<path d="M${x} -20 l-4 -8 l8 4" fill="#5d4037" ${ST} stroke-width="1"/>`).join('') + `${oeil(18, -8)}<circle cx="28" cy="-4" r="1.6" fill="${K}"/>`,
    ver: () => `<path d="M-20 -2 Q-12 -10 -4 -2 Q4 6 12 -2 Q16 -6 20 -4" fill="none" stroke="#d98880" stroke-width="6" stroke-linecap="round"/>`,
    poussin: () => `<circle cx="0" cy="-8" r="8" fill="#ffe066" ${ST}/><circle cx="6" cy="-16" r="5" fill="#ffe066" ${ST}/><path d="M10 -16 l5 1 l-5 2 Z" fill="#f39c12"/>${oeil(7, -17)}`,
    puceron: () => [[-8, -3], [0, -6], [8, -3], [4, 0]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="3" ry="2" fill="#8bd35a" ${ST} stroke-width="1"/>`).join(''),
  });

  const flacon = (picto) => {
    let p = '';
    if (picto === 'flamme') p = `<path d="M0 -14 Q-6 -20 -2 -28 Q2 -24 3 -30 Q8 -22 4 -14 Z" fill="${K}"/>`;
    if (picto === 'tete') p = `<circle cx="0" cy="-24" r="5" fill="${K}"/><path d="M-6 -16 l12 4 M6 -16 l-12 4" ${ST} stroke-width="2"/><circle cx="-2" cy="-25" r="1.4" fill="#fff"/><circle cx="2" cy="-25" r="1.4" fill="#fff"/>`;
    if (picto === 'corrosif') p = `<path d="M-6 -30 l4 0 l0 4 M2 -30 l4 0 l0 4" ${ST} stroke-width="1.5"/><path d="M-4 -24 l0 3 M4 -24 l0 3" stroke="${K}" stroke-width="1.6"/><path d="M-8 -16 L8 -16 L8 -12 L-8 -12 Z" fill="${K}"/>`;
    return `<path d="M-12 0 L12 0 L12 -34 Q12 -40 6 -40 L6 -46 L-6 -46 L-6 -40 Q-12 -40 -12 -34 Z" fill="#e8f6f3" ${ST}/><rect x="-7" y="-50" width="14" height="5" fill="#e74c3c" ${ST} stroke-width="1.4"/>`
      + (picto ? `<g><path d="M0 -36 L10 -22 L0 -8 L-10 -22 Z" fill="#fff" stroke="#e74c3c" stroke-width="2.4"/><g transform="translate(0 -22) scale(.55) translate(0 22)">${p}</g></g>` : '');
  };

  Object.assign(OBJETS, {
    glacon: () => `<path d="M-12 0 L10 0 L14 -20 L-8 -22 Z" fill="#d6f1ff" ${ST}/><path d="M-8 -22 L-4 -26 L18 -24 L14 -20 M10 0 L16 -4 L18 -24" fill="#aedcf5" ${ST}/><path d="M-6 -16 l4 -2" stroke="#fff" stroke-width="2"/>`,
    flaque: () => `<ellipse cx="0" cy="-2" rx="26" ry="5" fill="#85c1e9" ${ST} stroke-width="1.6"/>`,
    verreEau: (c = '#5dade2') => `<path d="M-9 0 L9 0 L11 -26 L-11 -26 Z" fill="#fff" ${ST}/><path d="M-8.5 -2 L8.5 -2 L10 -18 L-10 -18 Z" fill="${c}" opacity=".85"/>`,
    brique: (c = '#fff') => `<path d="M-10 0 L10 0 L10 -30 L0 -38 L-10 -30 Z" fill="${c}" ${ST}/><path d="M-10 -30 L10 -30" ${ST} stroke-width="1.4"/><text x="0" y="-12" text-anchor="middle" font-family="Comic Sans MS, cursive" font-size="8" font-weight="bold" fill="#3498db">LAIT</text>`,
    miel: () => `<path d="M-12 0 L12 0 L13 -22 L-13 -22 Z" fill="#f5b041" ${ST}/><path d="M-14 -22 L14 -22 L14 -27 L-14 -27 Z" fill="#c0702a" ${ST}/><path d="M-6 -22 q0 6 2 4 q2 -2 2 2" fill="#f5b041" ${ST} stroke-width="1"/><text x="0" y="-8" text-anchor="middle" font-family="Comic Sans MS, cursive" font-size="8" font-weight="bold" fill="${K}">MIEL</text>`,
    tasSable: () => `<path d="M-26 0 Q-10 -22 0 -22 Q12 -22 26 0 Z" fill="#f4d58d" ${ST}/>` + [[-8, -10], [4, -14], [10, -6], [-2, -4]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1" fill="#b9770e"/>`).join(''),
    sacFarine: () => `<path d="M-14 0 L14 0 L12 -30 L-12 -30 Z" fill="#fdfefe" ${ST}/><path d="M-12 -30 L-8 -36 L8 -36 L12 -30" fill="#fdfefe" ${ST}/><text x="0" y="-12" text-anchor="middle" font-family="Comic Sans MS, cursive" font-size="7" font-weight="bold" fill="#c0702a">FARINE</text>`,
    beurre: () => `<path d="M-16 0 L16 0 L16 -10 L-16 -10 Z" fill="#fff" ${ST}/><path d="M-12 -10 L10 -10 L12 -18 L-10 -18 Z" fill="#ffe680" ${ST}/>`,
    chocolat: () => `<path d="M-16 0 L16 0 L16 -20 L-16 -20 Z" fill="#6e3b1f" ${ST}/><path d="M-16 -10 L16 -10 M-5 0 L-5 -20 M5 0 L5 -20" stroke="#4a2511" stroke-width="1.5"/>`,
    pierre: () => `<path d="M-16 0 Q-20 -12 -8 -16 Q4 -22 14 -12 Q20 -4 16 0 Z" fill="#a6acaf" ${ST}/><path d="M-6 -10 l6 -2" stroke="#d5d8dc" stroke-width="2"/>`,
    regle: () => `<path d="M-30 0 L30 0 L30 -8 L-30 -8 Z" fill="#d4a24c" ${ST}/>` + Array.from({ length: 11 }, (_, i) => `<path d="M${-27 + i * 5.4} -8 l0 ${i % 2 ? 3 : 5}" stroke="${K}" stroke-width="1"/>`).join(''),
    frigo: () => `<path d="M-18 0 L18 0 L18 -70 L-18 -70 Z" fill="#ecf0f1" ${ST}/><path d="M-18 -48 L18 -48" ${ST}/><path d="M12 -60 l0 6 M12 -40 l0 10" ${ST} stroke-width="3"/><text x="0" y="-55" text-anchor="middle" font-family="Comic Sans MS, cursive" font-size="7" fill="#3498db">❄</text>`,
    vapeur: () => [-8, 0, 8].map((x) => `<path d="M${x} 0 q-5 -6 0 -12 q5 -6 0 -12" fill="none" stroke="#aeb6bf" stroke-width="2.4" stroke-linecap="round"/>`).join(''),
    gouttes: () => [[-8, -4], [2, -10], [10, -2], [-2, 0]].map(([x, y]) => `<path d="M${x} ${y} q-3 4 0 6 q3 -2 0 -6 Z" fill="#5dade2" ${ST} stroke-width="1"/>`).join(''),
    filLinge: () => `<path d="M-40 -50 L-40 0 M40 -50 L40 0" ${ST} stroke-width="3"/><path d="M-40 -46 Q0 -40 40 -46" fill="none" ${ST} stroke-width="1.4"/><path d="M-26 -44 L-10 -43 L-12 -22 L-24 -22 Z" fill="#e74c3c" ${ST} stroke-width="1.6"/><path d="M4 -42 L24 -43 L22 -26 L6 -26 Z" fill="#3498db" ${ST} stroke-width="1.6"/>`,
    seringue: () => `<path d="M-24 -6 L16 -6 L16 -16 L-24 -16 Z" fill="#e8f6f3" ${ST}/><path d="M16 -11 L26 -11" ${ST} stroke-width="3"/><path d="M-24 -11 L-36 -11 M-36 -18 L-36 -4" ${ST} stroke-width="3"/><path d="M-12 -16 l0 4 M-4 -16 l0 4 M4 -16 l0 4" stroke="${K}" stroke-width="1"/>`,
    parachute: () => `<path d="M-30 -60 Q0 -96 30 -60 Q15 -66 0 -60 Q-15 -66 -30 -60 Z" fill="#e74c3c" ${ST}/><path d="M-30 -60 L-4 -22 M30 -60 L4 -22 M0 -60 L0 -22" ${ST} stroke-width="1"/><circle cx="0" cy="-18" r="4" fill="${PEAUX.c}" ${ST} stroke-width="1.4"/><path d="M0 -14 L0 -4 M0 -4 l-4 4 M0 -4 l4 4 M-5 -12 l10 0" ${ST} stroke-width="1.6"/>`,
    eolienne: () => `<path d="M-3 0 L3 0 L2 -70 L-2 -70 Z" fill="#fff" ${ST}/>` + [0, 120, 240].map((a) => `<path d="M0 -70 L-3 -100 Q0 -104 3 -100 Z" fill="#fff" ${ST} stroke-width="1.6" transform="rotate(${a} 0 -70)"/>`).join('') + `<circle cx="0" cy="-70" r="3.5" fill="#bdc3c7" ${ST} stroke-width="1.4"/>`,
    moulinEau: () => `<path d="M-30 0 L-30 -44 L-6 -62 L18 -44 L18 0 Z" fill="#f5cba7" ${ST}/><path d="M-36 -42 L-6 -66 L24 -42" fill="none" ${ST} stroke="#922b21" stroke-width="4"/><circle cx="26" cy="-18" r="16" fill="none" ${ST} stroke="#8a5a2e" stroke-width="3"/>` + [0, 45, 90, 135].map((a) => `<path d="M26 -34 L26 -2" ${ST} stroke="#8a5a2e" transform="rotate(${a} 26 -18)"/>`).join('') + `<path d="M8 0 Q26 4 46 0" fill="none" stroke="#2e86de" stroke-width="4"/>`,
    voilier: () => `<path d="M-26 -8 L26 -8 L18 0 L-18 0 Z" fill="#c0702a" ${ST}/><path d="M0 -8 L0 -60" ${ST}/><path d="M2 -58 L2 -12 L26 -12 Z" fill="#fff" ${ST}/><path d="M-2 -52 L-2 -12 L-20 -12 Z" fill="#fdebd0" ${ST}/>`,
    chrono: () => `<circle cx="0" cy="-14" r="14" fill="#fff" ${ST}/><path d="M-3 -30 L3 -30 L3 -28 L-3 -28 Z M0 -28 L0 -30" fill="${K}" ${ST}/><path d="M0 -14 L0 -23 M0 -14 L6 -10" ${ST} stroke="#e74c3c"/>`,
    metre: () => `<circle cx="-16" cy="-12" r="12" fill="#f1c40f" ${ST}/><circle cx="-16" cy="-12" r="3" fill="${K}"/><path d="M-6 -4 L30 -4 L30 0 L-6 0 Z" fill="#f9e79f" ${ST} stroke-width="1.4"/>` + [0, 8, 16, 24].map((x) => `<path d="M${x} -4 l0 2" stroke="${K}" stroke-width="1"/>`).join(''),
    plantePot: (n = 'verte') => `<path d="M-12 0 L12 0 L15 -18 L-15 -18 Z" fill="#c0702a" ${ST}/><path d="M0 -18 L0 -44" ${ST} stroke="#2e8b57" stroke-width="2.6"/>` + (n === 'fanee'
      ? `<path d="M0 -30 Q-12 -26 -14 -16 Q-6 -22 0 -28 Z M0 -40 Q10 -36 12 -26 Q4 -32 0 -38 Z" fill="#b7950b" ${ST} stroke-width="1.4"/>`
      : `<path d="M0 -28 Q-16 -36 -18 -24 Q-8 -20 0 -28 Z M0 -36 Q14 -46 18 -34 Q8 -30 0 -36 Z M0 -44 Q-6 -54 0 -56 Q6 -54 0 -44 Z" fill="${n === 'pale' ? '#d4e6a5' : '#58d68d'}" ${ST} stroke-width="1.4"/>`),
    graine: () => `<path d="M-30 0 L30 0 L30 -16 L-30 -16 Z" fill="#8d6e63" ${ST}/><ellipse cx="0" cy="-8" rx="5" ry="3.5" fill="#f5cba7" ${ST} stroke-width="1.4"/><path d="M0 -4 q-2 4 -6 6" fill="none" stroke="#f5f5dc" stroke-width="1.6"/>`,
    pousse: () => `<path d="M-30 0 L30 0 L30 -12 L-30 -12 Z" fill="#8d6e63" ${ST}/><path d="M0 -6 q-2 6 -6 8 M0 -6 q2 6 5 8" fill="none" stroke="#f5f5dc" stroke-width="1.6"/><path d="M0 -12 L0 -30" ${ST} stroke="#2e8b57" stroke-width="2.4"/><path d="M0 -30 Q-10 -38 -12 -28 Q-4 -26 0 -30 Z M0 -30 Q10 -38 12 -28 Q4 -26 0 -30 Z" fill="#58d68d" ${ST} stroke-width="1.4"/>`,
    pomme: (c = '#e74c3c') => `<circle cx="0" cy="-10" r="10" fill="${c}" ${ST}/><path d="M0 -20 l1 -6" ${ST}/><path d="M1 -24 q6 -4 8 0 q-4 3 -8 0" fill="#27ae60" ${ST} stroke-width="1"/>`,
    pommeCoupee: () => `<path d="M-12 -10 A12 12 0 0 0 12 -10 Z" fill="#fdebd0" ${ST}/><path d="M-12 -10 A12 12 0 0 1 12 -10" fill="none" ${ST} stroke="#e74c3c" stroke-width="3"/><ellipse cx="-3" cy="-6" rx="1.6" ry="2.6" fill="#6e3b1f"/><ellipse cx="3" cy="-6" rx="1.6" ry="2.6" fill="#6e3b1f"/>`,
    carotte: () => `<path d="M-4 -22 L4 -22 L0 0 Z" fill="#f39c12" ${ST}/><path d="M0 -22 l-5 -8 M0 -22 l0 -9 M0 -22 l5 -8" stroke="#27ae60" stroke-width="2.4" stroke-linecap="round"/>`,
    salade: () => `<path d="M-16 0 Q-20 -16 -6 -18 Q0 -26 8 -18 Q20 -16 16 0 Z" fill="#82e0aa" ${ST}/><path d="M-8 -2 Q-6 -12 0 -14 Q6 -12 8 -2" fill="none" stroke="#27ae60" stroke-width="1.6"/>`,
    feuilleChene: (c = '#58d68d') => `<path d="M0 0 L0 -6 Q-12 -6 -10 -14 Q-16 -18 -8 -22 Q-12 -30 -2 -30 Q0 -38 4 -30 Q14 -30 8 -22 Q16 -18 10 -14 Q12 -6 0 -6" fill="${c}" ${ST} stroke-width="1.6"/>`,
    rosier: () => `<path d="M0 0 L0 -40 M0 -20 l-10 -8 M0 -30 l10 -6" ${ST} stroke="#2e8b57" stroke-width="2.4"/><circle cx="0" cy="-44" r="6" fill="#ff5a8a" ${ST} stroke-width="1.4"/><circle cx="12" cy="-38" r="5" fill="#ff5a8a" ${ST} stroke-width="1.4"/><ellipse cx="-10" cy="-28" rx="5" ry="3" fill="#58d68d" ${ST} stroke-width="1"/>`,
    brosseDents: () => `<path d="M-30 -6 L16 -10" ${ST} stroke="#3498db" stroke-width="5"/><path d="M14 -10 L30 -12 L30 -18 L14 -16 Z" fill="#fff" ${ST} stroke-width="1.4"/>` + [17, 21, 25].map((x) => `<path d="M${x} -16 l0 -6" stroke="#5dade2" stroke-width="2"/>`).join(''),
    dent: () => `<path d="M-10 -26 Q-12 -34 -4 -34 Q0 -30 4 -34 Q12 -34 10 -26 Q10 -14 6 0 Q2 -10 0 -10 Q-2 -10 -6 0 Q-10 -14 -10 -26 Z" fill="#fff" ${ST}/>`,
    bonbons: () => [[-12, '#e74c3c'], [0, '#f1c40f'], [12, '#9b59b6']].map(([x, c]) => `<ellipse cx="${x}" cy="-6" rx="5" ry="4" fill="${c}" ${ST} stroke-width="1.2"/><path d="M${x - 5} -6 l-4 -3 l0 6 Z M${x + 5} -6 l4 -3 l0 6 Z" fill="${c}" ${ST} stroke-width="1"/>`).join(''),
    savon: () => `<path d="M-14 0 L14 0 Q18 0 18 -6 L18 -10 Q18 -14 14 -14 L-14 -14 Q-18 -14 -18 -10 L-18 -6 Q-18 0 -14 0 Z" fill="#f9c6dd" ${ST}/>` + [[-6, -22], [4, -26], [12, -20]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.5" fill="#d6eaf8" ${ST} stroke-width="1"/>`).join(''),
    ordinateur: () => `<path d="M-26 -26 L26 -26 L26 -60 L-26 -60 Z" fill="#34495e" ${ST}/><path d="M-22 -30 L22 -30 L22 -56 L-22 -56 Z" fill="#85c1e9"/><path d="M-6 -26 L-8 -18 L8 -18 L6 -26" fill="#7f8c8d" ${ST} stroke-width="1.6"/><path d="M-30 0 L22 0 L18 -10 L-26 -10 Z" fill="#bdc3c7" ${ST}/>` + [-22, -14, -6, 2, 10].map((x) => `<path d="M${x} -6 l6 0" stroke="${K}" stroke-width="1.4"/>`).join('') + `<path d="M30 0 Q34 -4 30 -8 Q26 -4 30 0 Z" fill="#ecf0f1" ${ST} stroke-width="1.4"/><path d="M30 -8 Q30 -14 24 -14" fill="none" ${ST} stroke-width="1"/>`,
    imprimante: () => `<path d="M-24 0 L24 0 L24 -22 L-24 -22 Z" fill="#bdc3c7" ${ST}/><path d="M-14 -22 L-14 -36 L14 -36 L14 -22" fill="#fff" ${ST}/><path d="M-16 -6 L16 -6 L14 4 L-14 4 Z" fill="#fff" ${ST} stroke-width="1.4"/><circle cx="18" cy="-14" r="2" fill="#2ecc71"/>`,
    tablette: () => `<path d="M-18 0 L18 0 L18 -48 L-18 -48 Z" fill="#2c3e50" ${ST}/><path d="M-15 -4 L15 -4 L15 -44 L-15 -44 Z" fill="#a9cce3"/><circle cx="0" cy="-2" r="1" fill="#fff"/>`,
    cadenas: () => `<path d="M-8 -16 L-8 -24 Q-8 -32 0 -32 Q8 -32 8 -24 L8 -16" fill="none" ${ST} stroke-width="3.4"/><path d="M-12 0 L12 0 L12 -16 L-12 -16 Z" fill="#f1c40f" ${ST}/><circle cx="0" cy="-9" r="2.4" fill="${K}"/>`,
    pile: () => `<path d="M-8 0 L8 0 L8 -34 L-8 -34 Z" fill="#2c3e50" ${ST}/><path d="M-8 -34 L8 -34 L8 -26 L-8 -26 Z" fill="#e67e22" ${ST} stroke-width="1.4"/><path d="M-3 -34 L3 -34 L3 -38 L-3 -38 Z" fill="#bdc3c7" ${ST} stroke-width="1.2"/><text x="0" y="-12" text-anchor="middle" font-family="Comic Sans MS, cursive" font-size="10" font-weight="bold" fill="#fff">+</text>`,
    ampoule: (allume) => (allume ? [0, 60, 120, 180, 240, 300].map((a) => `<path d="M0 -40 L0 -48" stroke="#f1c40f" stroke-width="2.4" transform="rotate(${a} 0 -26)"/>`).join('') : '') + `<circle cx="0" cy="-26" r="11" fill="${allume ? '#fff36b' : '#f4f6f7'}" ${ST}/><path d="M-5 -16 L5 -16 L5 -6 L-5 -6 Z" fill="#bdc3c7" ${ST} stroke-width="1.4"/><path d="M-4 -26 l2 -4 l2 4 l2 -4 l2 4" fill="none" stroke="#e67e22" stroke-width="1.2"/>`,
    prise: () => `<path d="M-14 -40 L14 -40 L14 -12 L-14 -12 Z" fill="#fdfefe" ${ST}/><circle cx="0" cy="-26" r="9" fill="#ecf0f1" ${ST} stroke-width="1.4"/><circle cx="-4" cy="-26" r="1.8" fill="${K}"/><circle cx="4" cy="-26" r="1.8" fill="${K}"/>`,
    flacon: (picto) => flacon(picto),
    telephone: () => `<path d="M-10 0 L10 0 L10 -36 L-10 -36 Z" fill="#2c3e50" ${ST}/><path d="M-7 -6 L7 -6 L7 -32 L-7 -32 Z" fill="#a9cce3"/><text x="0" y="-15" text-anchor="middle" font-family="Comic Sans MS, cursive" font-size="8" font-weight="bold" fill="#c0392b">SOS</text>`,
    medicaments: () => `<path d="M-14 0 L2 0 L2 -26 L-14 -26 Z" fill="#fff" ${ST}/><path d="M-10 -22 L-2 -22 L-2 -14 L-10 -14 Z" fill="#2ecc71"/><path d="M-6 -24 L-6 -12 M-12 -18 L0 -18" stroke="#fff" stroke-width="2"/><ellipse cx="12" cy="-4" rx="6" ry="3" fill="#e74c3c" ${ST} stroke-width="1.2"/>`,
    parapluie: () => `<path d="M-26 -40 Q0 -70 26 -40 Q20 -44 13 -40 Q6 -44 0 -40 Q-6 -44 -13 -40 Q-20 -44 -26 -40 Z" fill="#8e44ad" ${ST}/><path d="M0 -40 L0 -4 Q0 2 6 2 Q10 2 10 -4" fill="none" ${ST} stroke-width="2.4"/>`,
    balance: () => `<path d="M-20 0 L20 0 L16 -12 L-16 -12 Z" fill="#bdc3c7" ${ST}/><path d="M-22 -14 L22 -14 L22 -18 L-22 -18 Z" fill="#7f8c8d" ${ST} stroke-width="1.4"/><path d="M-8 -6 L8 -6" stroke="#2ecc71" stroke-width="3"/>`,
    tailleCrayon: () => `<path d="M-10 0 L10 0 L10 -16 L-10 -16 Z" fill="#3498db" ${ST}/><path d="M10 -10 L34 -8 L34 -12 Z" fill="#f1c40f" ${ST} stroke-width="1.4"/><path d="M10 -8 L4 -10 L10 -12 Z" fill="${K}"/>`,
    poulie: () => `<path d="M-30 -96 L30 -96" ${ST} stroke-width="4"/><path d="M0 -96 L0 -84" ${ST}/><circle cx="0" cy="-74" r="10" fill="#bdc3c7" ${ST}/><circle cx="0" cy="-74" r="2.4" fill="${K}"/><path d="M-10 -74 L-10 -26 M10 -74 L10 -8" ${ST} stroke-width="1.6"/><path d="M-20 -26 L0 -26 L0 0 L-20 0 Z" fill="#c0702a" ${ST}/><path d="M6 -8 L14 -8" ${ST} stroke-width="3"/>`,
    brouette: () => `<path d="M-26 -16 L14 -16 L8 -32 L-30 -32 Z" fill="#27ae60" ${ST}/><circle cx="-14" cy="-8" r="8" fill="#555" ${ST}/><path d="M8 -24 L36 -14 M-2 -16 L4 0" ${ST} stroke-width="3"/>`,
    bascule: () => `<path d="M-10 0 L10 0 L0 -18 Z" fill="#c0702a" ${ST}/><path d="M-60 -24 L60 -12" ${ST} stroke="#d4a24c" stroke-width="6"/>`,
    cassenoix: () => `<path d="M-20 -6 L22 -22 M-20 -6 L22 -2" ${ST} stroke="#7f8c8d" stroke-width="4"/><circle cx="-20" cy="-6" r="3" fill="${K}"/><circle cx="-6" cy="-11" r="5" fill="#a0522d" ${ST} stroke-width="1.4"/>`,
    manivelle: () => `<path d="M-20 0 L20 0 L20 -24 L-20 -24 Z" fill="#d4a24c" ${ST}/><circle cx="0" cy="-12" r="5" fill="#7f8c8d" ${ST}/><path d="M0 -12 L22 -30 L22 -40" ${ST} stroke="#7f8c8d" stroke-width="3"/><circle cx="22" cy="-42" r="4" fill="#e74c3c" ${ST} stroke-width="1.4"/>`,
    roueDentee: (n) => { const R = 14, d = Array.from({ length: 10 }, (_, k) => `<path d="M0 ${-R} l0 -6" ${ST} stroke-width="4" transform="rotate(${k * 36})"/>`).join(''); return `<g transform="translate(0 -22)">${d}<circle r="${R}" fill="#f5b041" ${ST}/><circle r="3" fill="${K}"/></g>`; },
    terre: () => `<circle cx="0" cy="-26" r="26" fill="#3498db" ${ST}/><path d="M-18 -40 Q-8 -46 -2 -38 Q-6 -30 -14 -32 Q-20 -30 -18 -40 Z M4 -20 Q14 -26 20 -16 Q14 -6 6 -10 Q0 -14 4 -20 Z M-10 -14 Q-4 -10 -8 -4 Q-14 -8 -10 -14 Z" fill="#58d68d" ${ST} stroke-width="1.4"/>`,
    planetes: () => [[-70, 4, '#b2babb'], [-54, 6, '#f5cba7'], [-36, 7, '#3498db'], [-18, 5, '#e74c3c'], [6, 14, '#f0b27a'], [40, 12, '#f7dc6f'], [66, 9, '#aed6f1'], [86, 9, '#5d6d7e']].map(([x, r, c], i) => `<circle cx="${x}" cy="${-20}" r="${r}" fill="${c}" ${ST} stroke-width="1.4"/>${i === 5 ? `<ellipse cx="${x}" cy="-20" rx="${r + 7}" ry="3" fill="none" ${ST} stroke-width="1.4"/>` : ''}`).join(''),
    soleilGrand: () => `<circle cx="0" cy="0" r="24" fill="#ffd23f" ${ST}/>` + [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((a) => `<path d="M0 -30 L0 -40" ${ST} stroke="#f39c12" transform="rotate(${a})"/>`).join(''),
    ombre: () => `<path d="M0 0 L46 0 L40 -6 Z" fill="#5d6d7e" opacity=".45"/>`,
    maillot: () => `<path d="M-14 -40 L-6 -44 Q0 -38 6 -44 L14 -40 L20 -30 L12 -26 L12 0 L-12 0 L-12 -26 L-20 -30 Z" fill="#3498db" ${ST}/>`,
    ecranNuit: () => `<path d="M-12 0 L12 0 L12 -22 L-12 -22 Z" fill="#2c3e50" ${ST}/><path d="M-10 -2 L10 -2 L10 -20 L-10 -20 Z" fill="#aed6f1"/><path d="M10 -14 L40 -30 L40 6 Z" fill="#aed6f1" opacity=".35"/>`,
    poubelleTri: (c = '#f1c40f') => `<path d="M-14 0 L14 0 L16 -34 L-16 -34 Z" fill="${c}" ${ST}/><path d="M-18 -34 L18 -34 L18 -40 L-18 -40 Z" fill="${c}" ${ST}/><path d="M-4 -24 L4 -24 L0 -16 Z" fill="none" stroke="#fff" stroke-width="2"/>`,
    thermo: () => `<path d="M-5 -10 L-5 -70 Q-5 -76 0 -76 Q5 -76 5 -70 L5 -10" fill="#fff" ${ST}/><circle cx="0" cy="-8" r="8" fill="#e74c3c" ${ST}/><path d="M0 -12 L0 -44" stroke="#e74c3c" stroke-width="4"/>` + [-20, -30, -40, -50, -60].map((y) => `<path d="M5 ${y} l5 0" stroke="${K}" stroke-width="1.2"/>`).join(''),
    verreRetourne: () => `<path d="M-9 -26 L9 -26 L11 0 L-11 0 Z" fill="#fff" ${ST}/><path d="M-10.5 -4 L10.5 -4 L11 0 L-11 0 Z" fill="#5dade2" opacity=".85"/>`,
    flammes: () => `<path d="M-16 0 L16 0" ${ST} stroke="#8a5a2e" stroke-width="5"/><path d="M-12 -2 Q-18 -20 -6 -30 Q-6 -20 0 -18 Q-2 -34 8 -44 Q8 -28 14 -22 Q18 -10 12 -2 Z" fill="#ff6b00" ${ST}/><path d="M-6 -4 Q-8 -14 0 -20 Q2 -12 6 -10 Q8 -4 4 -4 Z" fill="#ffd23f"/>`,
    fusee: () => `<path d="M0 -70 Q12 -54 10 -20 L-10 -20 Q-12 -54 0 -70 Z" fill="#ecf0f1" ${ST}/><circle cx="0" cy="-44" r="5" fill="#85c1e9" ${ST} stroke-width="1.4"/><path d="M-10 -28 L-18 -14 L-10 -20 Z M10 -28 L18 -14 L10 -20 Z" fill="#e74c3c" ${ST} stroke-width="1.4"/><path d="M-6 -20 Q0 -4 6 -20" fill="#ff6b00" ${ST} stroke-width="1.4"/>`,
  });

  /* une illustration d'une seule question : une case plus étroite que dans MNEMOGRAM, pour des dessins plus grands */
  function svgIllus(sc, alt) {
    const M = Array.isArray(sc[0]) || (sc.length && typeof sc[0] === 'object' && sc[0].decor) ? sc : [sc];
    const n = M.length, W = n === 1 ? 300 : 300 * n + 8 * (n - 1), G = 8, w = 300;
    /* identifiant fixe tiré du contenu : une même scène donne toujours le même dessin */
    const cle = Math.abs([...JSON.stringify(sc)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7)).toString(36);
    let s = '';
    M.forEach((m, i) => {
      const decor = m.decor || m[0], el = m.el || m[1] || [];
      const x0 = i * (w + G), id = `il${cle}${i}`;
      s += `<clipPath id="${id}"><rect x="0" y="0" width="${w}" height="${H}" rx="10"/></clipPath><g transform="translate(${x0} 0)"><g clip-path="url(#${id})">${(DECORS[decor] || DECORS.jardin)(w)}${el.map((it) => element(it, w)).join('')}</g><rect x="1" y="1" width="${w - 2}" height="${H - 2}" rx="10" fill="none" ${ST} stroke-width="3"/></g>`;
      if (i < n - 1) s += `<path d="M${x0 + w - 6} ${H / 2} l${G + 10} 0" stroke="${K}" stroke-width="3" marker-end="url(#fl)"/>`;
    });
    return `<svg class="illus-svg" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${(alt || '').replace(/"/g, '&quot;')}"><defs><marker id="fl" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="${K}"/></marker></defs>${s}</svg>`;
  }

  return { svgScene, svgIllus, PERSOS, ANIMAUX, OBJETS, DECORS };
})();

/* ============================================================
   MNEMOSCIENCES — LES SCÈNES DU CE (une par question de banque)
   Clé : l'énoncé exact (ou « énoncé|bonne réponse » quand plusieurs questions ont le même énoncé).
   Une scène : [décor, éléments] ; ou deux scènes à la suite (avant → après).
   Un élément : [nom, x en % de la largeur, y (null = sur le sol), échelle, options].
   L'image montre la situation sans jamais souffler la réponse.
   ------------------------------------------------------------ */
const e = (n, x, s = 2, o, y = null) => [n, x, y, s, o || {}];
const SCENES_CE = {
  /* ---------- Solides et liquides ---------- */
  'Le <strong>lait</strong> est…': ['cuisine', [e('table', 50, 2.4), e('brique', 38, 2, {}, 150), e('verreEau', 60, 2, { c: '#fdfefe' }, 150)]],
  'Une <strong>pierre</strong> est…': ['jardin', [e('pierre', 50, 3), e('fleur', 20, 2)]],
  'Le <strong>jus d\'orange</strong> est…': ['cuisine', [e('table', 50, 2.4), e('verreEau', 45, 2.2, { c: '#f5b041' }, 150), e('pomme', 62, 1.6, { c: '#f39c12' }, 150)]],
  'Une <strong>règle en bois</strong> est…': ['classe', [e('pupitre', 50, 2.2), e('regle', 50, 1.6, {}, 150)]],
  'Un <strong>glaçon</strong> est de l\'eau…': ['cuisine', [e('glacon', 50, 3)]],
  'Le <strong>miel</strong> est…': ['cuisine', [e('table', 50, 2.4), e('miel', 50, 2, {}, 150), e('abeille', 78, 1.6, {}, 80)]],
  'Un liquide prend la forme…': ['cuisine', [e('verreEau', 30, 3), e('bouteille', 70, 3)]],
  'Peut-on prendre un liquide entre ses doigts ?': ['maison', [e('leo', 50, 1.6, { bras: 'tend' }), e('gouttes', 64, 1.6, {}, 150)]],
  'On verse l\'eau d\'un verre dans une bouteille. L\'eau…': [['cuisine', [e('verreEau', 50, 3)]], ['cuisine', [e('bouteille', 50, 3.2)]]],
  'Pour transformer de l\'eau liquide en glace, on la met…': ['cuisine', [e('verreEau', 30, 2.4), e('frigo', 70, 1.9)]],
  'Un solide a une <strong>forme propre</strong>. Cela veut dire…': ['maison', [e('pierre', 30, 2.4), e('cadeau', 70, 2)]],
  'Le <strong>sable</strong> coule quand on le verse. Est-ce un liquide ?': ['plage', [e('tasSable', 40, 2.4), e('seau', 70, 2)]],
  'La <strong>farine</strong> est…': ['cuisine', [e('table', 50, 2.4), e('sacFarine', 44, 2, {}, 150), e('oeufs', 64, 1.6, {}, 150)]],
  'La surface d\'un liquide au repos dans un verre est…': ['cuisine', [e('verreEau', 50, 4)]],
  'Un morceau de <strong>beurre</strong> laissé au soleil…': ['jardin', [e('soleil', 80, 1.4, {}, 40), e('table', 45, 2.4), e('beurre', 45, 2, {}, 150)]],
  'Quand un glaçon fond, il devient…': [['cuisine', [e('glacon', 50, 2.6)]], ['cuisine', [e('soleil', 80, 1, {}, 40), e('flaque', 50, 1.4)]]],
  'Le <strong>chocolat</strong> d\'une tablette, chauffé au bain-marie, devient…': ['cuisine', [e('chocolat', 30, 2), e('casserole', 68, 2.4), e('vapeur', 68, 1.4, {}, 130)]],
  /* ---------- Les changements d'état de l'eau ---------- */
  'Quand la glace devient de l\'eau liquide, on dit qu\'elle…': [['cuisine', [e('glacon', 50, 2.6)]], ['cuisine', [e('flaque', 50, 1.4)]]],
  'Quand l\'eau liquide devient de la glace, on dit qu\'elle…': [['cuisine', [e('verreEau', 50, 2.6)]], ['neige', [e('glacon', 50, 2.6)]]],
  'Le passage de la glace à l\'eau liquide s\'appelle…': [['neige', [e('glacon', 50, 2.6)]], ['jardin', [e('flaque', 50, 1.4), e('soleil', 80, 1, {}, 40)]]],
  'Le passage de l\'eau liquide à la glace s\'appelle…': [['jardin', [e('flaque', 50, 1.4)]], ['neige', [e('lacGele', 50, 1.2)]]],
  'Un glaçon posé sur la table de la classe…': ['classe', [e('pupitre', 50, 2.2), e('glacon', 50, 1.4, {}, 150), e('maitresse', 20, 1.2)]],
  'En hiver, l\'eau d\'une flaque peut geler. Il fait alors…': ['neige', [e('lacGele', 50, 1.2), e('bonhommeNeige', 80, 1.4)]],
  'La glace fond à partir de quelle température ?': ['neige', [e('glacon', 40, 2.4), e('soleil', 80, 1, {}, 40)]],
  'L\'eau <strong>bout</strong> à quelle température ?': ['cuisine', [e('casserole', 50, 3), e('vapeur', 50, 1.8, {}, 120)]],
  'Le passage de l\'eau liquide à la vapeur d\'eau s\'appelle…': ['cuisine', [e('casserole', 50, 3), e('vapeur', 50, 1.8, {}, 120)]],
  'Le passage de la vapeur d\'eau à l\'eau liquide s\'appelle…': ['maison', [e('fenetre', 50, 2.2), e('gouttes', 50, 1.6, {}, 110)]],
  'La <strong>buée</strong> sur une vitre froide, c\'est…': ['maison', [e('fenetre', 50, 2.2), e('gouttes', 46, 1.6, {}, 110)]],
  'Le linge mouillé sèche sur le fil parce que l\'eau…': ['jardin', [e('filLinge', 45, 2), e('soleil', 85, 1, {}, 36)]],
  'La vapeur d\'eau est…': ['cuisine', [e('casserole', 50, 3), e('vapeur', 50, 1.8, {}, 120)]],
  'Quand l\'eau gèle, son volume…': [['cuisine', [e('bouteille', 50, 3.2)]], ['neige', [e('bouteille', 50, 3.2, {}, null), e('eclairs', 62, 1, {}, 110)]]],
  'On fait fondre un glaçon de 20 g. Quelle est la masse de l\'eau obtenue ?': [['cuisine', [e('balance', 50, 2.4), e('glacon', 50, 1.4, {}, 160)]], ['cuisine', [e('balance', 50, 2.4), e('verreEau', 50, 1.4, {}, 160)]]],
  /* ---------- L'air ---------- */
  'L\'air est-il de la matière ?': ['parc', [e('arbre', 30, 1.6), e('nuage', 70, 1.4, {}, 70), e('mouvement', 60, 1, {}, 120)]],
  'Une bouteille « vide », bouchée…': ['cuisine', [e('bouteille', 50, 3.4)]],
  'Le <strong>vent</strong>, c\'est…': ['parc', [e('arbre', 35, 1.8), e('mouvement', 75, 1.6, {}, 110), e('feuilles', 80, 1.6, {}, 140)]],
  'Comment montrer que l\'air existe ?': ['mer', [e('bouteille', 50, 3, {}, 200), e('bulles', 54, 1.6, {}, 120)]],
  'Dans l\'eau, les bulles d\'air…': ['mer', [e('poisson', 40, 2, {}, 170), e('bulles', 60, 1.8, {}, 140)]],
  'Quand on gonfle un ballon, on…': ['parc', [e('lina', 40, 1.5), e('ballonFete', 58, 1.6, {}, 140)]],
  'On respire…': ['parc', [e('leo', 50, 1.6, { visage: 'sourit' }), e('arbre', 20, 1.6)]],
  'On enfonce un verre <strong>retourné</strong> dans l\'eau. L\'eau ne monte pas jusqu\'au fond du verre, parce que…': ['mer', [e('verreRetourne', 50, 3.6, {}, 150)]],
  'Un ballon <strong>gonflé</strong> est… qu\'un ballon dégonflé.': ['maison', [e('balance', 50, 2.6), e('ballonFete', 50, 1.4, {}, 210)]],
  'On bouche le bout d\'une seringue pleine d\'air et on pousse le piston : il s\'enfonce un peu. On dit que l\'air est…': ['classe', [e('seringue', 50, 2.6, {}, 150)]],
  'On comprime l\'air d\'une seringue bouchée, puis on lâche le piston. Il…': ['classe', [e('seringue', 50, 2.6, {}, 150)]],
  'Un pneu de vélo est rempli…': ['rue', [e('velo', 50, 2.2)]],
  'Pourquoi un parachute ralentit-il la chute ?': ['ciel', [e('parachute', 50, 1.8, {}, 190)]],
  /* ---------- Mouvements et énergie ---------- */
  'Pour mesurer la distance parcourue par une petite voiture, j\'utilise…': ['maison', [e('voiture', 30, .9), e('metre', 70, 1.8)]],
  'Pour mesurer une durée, on utilise…': ['parc', [e('hugo', 30, 1.4, { bras: 'deux' }), e('chrono', 70, 2.2)]],
  'Deux enfants courent la même distance. Le plus rapide est celui qui…': ['parc', [e('leo', 35, 1.3, { bras: 'deux' }), e('mouvement', 26, 1, {}, 150), e('lina', 70, 1.3, { bras: 'deux' }), e('mouvement', 61, 1, {}, 150)]],
  'Deux petites voitures roulent pendant le même temps. La plus rapide est celle qui…': ['route', [e('voiture', 30, .8, {}, 150), e('voiture', 75, .8, { c: '#3498db' })]],
  'Qu\'est-ce qui fait tourner les ailes d\'une <strong>éolienne</strong> ?': ['ferme', [e('eolienne', 50, 1.6), e('nuage', 80, 1, {}, 50)]],
  'Qu\'est-ce qui fait tourner la roue d\'un <strong>moulin à eau</strong> ?': ['jardin', [e('moulinEau', 45, 1.8)]],
  'Un voilier avance grâce…': ['mer', [e('voilier', 50, 2, {}, 140), e('mouvement', 26, 1.2, {}, 90)]],
  'Pour faire bouger un objet immobile, il faut…': ['parc', [e('ballon', 50, 2)]],
  'Pour comparer deux lancers de balle, on mesure…': ['parc', [e('tom', 20, 1.3, { bras: 'haut' }), e('ballon', 80, 1.6)]],
  'Quelle unité utilise-t-on pour une distance ?': ['classe', [e('regle', 50, 2.4, {}, 150)]],
  'Une voiture A fait 10 m en 5 secondes, une voiture B fait 10 m en 8 secondes. La plus rapide est…': ['route', [e('voiture', 30, .8, {}, 150), e('voiture', 70, .8, { c: '#3498db' }), e('chrono', 88, 1.4, {}, 70)]],
  'Une petite voiture lâchée en haut d\'une pente…': ['montagne', [e('voiture', 30, .7, {}, 110)]],
  'Le vent et l\'eau qui coule peuvent servir à…': [['ferme', [e('eolienne', 50, 1.6)]], ['jardin', [e('moulinEau', 45, 1.8)]]],
  'Quand on lance une balle vers le haut, elle…': ['parc', [e('hugo', 40, 1.4, { bras: 'haut' }), e('ballon', 48, 1.6, {}, 60)]],
  /* ---------- Le vivant et ses besoins ---------- */
  'Lequel est <strong>vivant</strong> ?|un arbre': ['jardin', [e('arbre', 20, 1.6), e('pierre', 55, 2), e('nuage', 80, 1.2, {}, 50)]],
  'Lequel est <strong>vivant</strong> ?|une fourmi': ['jardin', [e('fourmi', 20, 2.4), e('robot', 50, 1.6), e('voiture', 82, .6)]],
  'Lequel est <strong>vivant</strong> ?|un champignon': ['foret', [e('champignon', 22, 2.4), e('ruisseau', 55, 1), e('pierre', 82, 2)]],
  'Un être vivant…': [['ferme', [e('oeufs', 50, 2.4)]], ['ferme', [e('poussin', 50, 2.4)]], ['ferme', [e('poule', 50, 2.4)]]],
  'Une plante a besoin, pour vivre…': ['jardin', [e('plantePot', 50, 2.4), e('soleil', 82, 1, {}, 40)]],
  'Un animal a besoin, pour vivre…': ['maison', [e('chien', 40, 2.2, { c: '#c8874b' }), e('gamelle', 72, 2)]],
  'Une plante qu\'on n\'arrose plus…': [['maison', [e('plantePot', 50, 2.6)]], ['maison', [e('plantePot', 50, 2.6, { n: 'fanee' })]]],
  'Un robot qui bouge et qui parle est-il vivant ?': ['maison', [e('robot', 50, 2.2), e('bulle', 62, 1, { t: 'Bonjour !' }, 70)]],
  'Un chat a besoin…': ['maison', [e('chat', 40, 2.4), e('gamelle', 72, 2)]],
  'Une poule pond des œufs : cela montre qu\'elle…': ['ferme', [e('poule', 40, 2.4), e('oeufs', 70, 2)]],
  'Le feu grandit et bouge. Est-il vivant ?': ['foret', [e('flammes', 40, 2.4), e('sapin', 85, 1.4)]],
  'Une feuille morte tombée de l\'arbre est…': ['foret', [e('arbre', 30, 1.6), e('feuilles', 66, 2.4)]],
  'Les poissons respirent-ils ?': ['mer', [e('poisson', 50, 3, {}, 170), e('bulles', 64, 1.4, {}, 130)]],
  'Les plantes respirent-elles ?': ['jardin', [e('plantePot', 50, 2.6)]],
  'Une graine plantée dans le noir, avec de l\'eau…': ['nuit', [e('plantePot', 50, 2.4, { n: 'pale' })]],
  /* ---------- Grandir et rester en bonne santé ---------- */
  'Les <strong>dents de lait</strong>…': ['maison', [e('dent', 50, 3)]],
  'On perd ses premières dents de lait vers…': ['maison', [e('lina', 50, 1.6, { visage: 'rit' }), e('dent', 75, 1.4, {}, 110)]],
  'Il faut se brosser les dents…': ['maison', [e('brosseDents', 50, 2.2, {}, 150), e('dent', 80, 1.6, {}, 170)]],
  'Une <strong>alimentation équilibrée</strong>, c\'est…': ['cuisine', [e('table', 50, 2.6), e('pomme', 30, 1.4, {}, 150), e('pain', 48, 1.4, {}, 150), e('fromage', 62, 1.4, {}, 150), e('carotte', 76, 1.4, {}, 150)]],
  'Quelle est la seule boisson indispensable ?': ['cuisine', [e('verreEau', 50, 3)]],
  'Les fruits et les légumes, on en mange…': ['marche', [e('panier', 50, 2.4), e('pomme', 40, 1.4, {}, 150), e('carotte', 58, 1.4, {}, 150)]],
  'Les bonbons et les gâteaux…': ['cuisine', [e('table', 50, 2.4), e('bonbons', 40, 1.6, {}, 150), e('gateau', 64, 1.4, {}, 150)]],
  'Avant de manger, il faut…': ['cuisine', [e('savon', 50, 2.4)]],
  'Pour grandir et rester en forme, il faut aussi…': ['parc', [e('leo', 30, 1.4, { bras: 'haut', visage: 'rit' }), e('ballon', 55, 1.6), e('velo', 80, 1.2)]],
  'Un enfant de ton âge doit dormir environ…': ['nuit', [e('lit', 50, 2), e('zzz', 60, 1, {}, 120), e('lune', 82, 1, {}, 40)]],
  'Combien de <strong>dents de lait</strong> a un enfant ?': ['maison', [e('dent', 50, 3)]],
  'Combien de dents a un adulte, avec les dents de sagesse ?': ['maison', [e('brosseDents', 50, 2.2, {}, 150)]],
  'Pour suivre la croissance d\'un enfant, le médecin mesure…': ['maison', [e('tom', 40, 1.5), e('regle', 70, 1.4, {}, 120), e('balance', 75, 1.8)]],
  'Le lait, les yaourts et le fromage apportent du calcium, qui est utile…': ['cuisine', [e('table', 50, 2.4), e('brique', 40, 1.6, {}, 150), e('fromage', 62, 1.6, {}, 150)]],
  'Regarder un écran juste avant de dormir…': ['nuit', [e('lit', 45, 2), e('tablette', 70, 1.2, {}, 130)]],
  'Pourquoi se laver les mains en rentrant de la récréation ?': ['classe', [e('savon', 50, 2.4)]],
  /* ---------- Le cycle de vie ---------- */
  'La <strong>chenille</strong> devient…': ['jardin', [e('feuilleChene', 40, 2.4), e('chenille', 62, 1.8)]],
  'Le <strong>têtard</strong> devient…': ['lac', [e('tetard', 40, 2.4, {}, 200), e('tetard', 70, 2, {}, 214)]],
  'Le changement complet de forme pendant la croissance s\'appelle…': [['jardin', [e('chenille', 50, 2)]], ['jardin', [e('papillon', 50, 2.2, {}, 140)]]],
  'Dans l\'ordre, le papillon passe par…': ['jardin', [e('papillon', 50, 2.6, {}, 140), e('fleurs', 20, 2)]],
  'Un chaton…': ['maison', [e('chat', 30, 2.6), e('chat', 70, 1.4, { c: '#f5cba7' })]],
  'Lequel grandit <strong>sans métamorphose</strong> ?': ['jardin', [e('chien', 22, 1.8, { c: '#c8874b' }), e('papillon', 52, 1.6, {}, 130), e('grenouille', 82, 1.6)]],
  'Une poule pond…': ['ferme', [e('poule', 40, 2.4), e('foin', 72, 1.4)]],
  'Quand une graine commence à pousser, on dit qu\'elle…': ['jardin', [e('pousse', 50, 2.4)]],
  'Les graines d\'une plante se trouvent…': ['cuisine', [e('pommeCoupee', 50, 3)]],
  'Après la floraison, la fleur devient…': ['jardin', [e('pommier', 50, 1.6)]],
  'Dans l\'ordre, la vie d\'une plante à fleurs :': [['jardin', [e('graine', 50, 1.8)]], ['jardin', [e('pousse', 50, 1.8)]], ['jardin', [e('pommier', 50, 1.4)]]],
  'Quand une graine germe, ce qui sort en premier, c\'est…': ['jardin', [e('graine', 50, 2.6)]],
  'Un animal qui naît d\'un œuf pondu est dit…': ['ferme', [e('oeufs', 40, 2.4), e('poussin', 68, 2)]],
  'Un animal dont le petit se développe dans le ventre de sa mère est dit…': ['ferme', [e('vache', 40, 1.8), e('mouton', 75, 1.4)]],
  'Qui transporte le <strong>pollen</strong> de fleur en fleur ?': ['jardin', [e('fleurs', 30, 2.4), e('fleur', 70, 2.4, { c: '#f1c40f' })]],
  'La coccinelle passe par une larve qui ne lui ressemble pas. Sa croissance est…': ['jardin', [e('feuilleChene', 40, 2.4), e('coccinelle', 70, 2.2)]],
  /* ---------- Les chaînes alimentaires ---------- */
  'Un animal qui mange <strong>seulement des plantes</strong> est…': ['ferme', [e('vache', 50, 2)]],
  'Un animal qui mange <strong>d\'autres animaux</strong> est…': ['zoo', [e('lion', 50, 2)]],
  'Un animal qui mange <strong>des plantes et des animaux</strong> est…': ['foret', [e('ours', 50, 1.8)]],
  'La <strong>vache</strong> est…': ['ferme', [e('vache', 45, 2.2), e('foin', 80, 1.4)]],
  'Le <strong>lion</strong> est…': ['zoo', [e('lion', 50, 2.2)]],
  'Le <strong>lapin</strong> est…': ['jardin', [e('lapin', 40, 2.4), e('carotte', 70, 2)]],
  'L\'<strong>être humain</strong> est…': ['cuisine', [e('table', 50, 2.4), e('pomme', 36, 1.4, {}, 150), e('poisson', 60, 1.4, {}, 150), e('pain', 76, 1.2, {}, 150)]],
  'Complète la chaîne alimentaire (la flèche veut dire « est mangé par ») :<br><strong>herbe → lapin → ?</strong>': ['jardin', [e('lapin', 40, 2.4), e('bulle', 60, 1.2, { t: '?' }, 100)]],
  'Complète la chaîne alimentaire (la flèche veut dire « est mangé par ») :<br><strong>salade → escargot → ?</strong>': ['jardin', [e('salade', 30, 2), e('escargot', 66, 2)]],
  'Complète la chaîne alimentaire (la flèche veut dire « est mangé par ») :<br><strong>feuille de chêne → chenille → ?</strong>': ['foret', [e('feuilleChene', 36, 2.4), e('chenille', 64, 1.6)]],
  'Complète la chaîne alimentaire (la flèche veut dire « est mangé par ») :<br><strong>? → puceron → coccinelle</strong>': ['jardin', [e('puceron', 40, 2.4, {}, 170), e('coccinelle', 70, 2)]],
  'Dans la chaîne <strong>blé → souris → chouette</strong>, qui mange la souris ?': ['ferme', [e('ble', 25, 2), e('souris', 55, 2)]],
  'Au début d\'une chaîne alimentaire, il y a toujours…': ['jardin', [e('fleurs', 25, 2.2), e('arbre', 55, 1.4), e('salade', 82, 1.6)]],
  'Si tous les lapins d\'une forêt disparaissaient, les renards…': ['foret', [e('renard', 50, 2.2)]],
  'Dans un jardin, on supprime toutes les coccinelles. Les pucerons…': ['jardin', [e('rosier', 40, 2), e('puceron', 62, 1.8, {}, 130)]],
  'Le <strong>hérisson</strong> mange des insectes, des vers, des escargots, et parfois des fruits. Il est…': ['jardin', [e('herisson', 40, 2.2), e('ver', 75, 1.6)]],
  /* ---------- Les objets et le numérique ---------- */
  'À quoi sert une <strong>paire de ciseaux</strong> ?': ['classe', [e('ciseaux', 50, 3, {}, 170)]],
  'À quoi sert une <strong>lampe de poche</strong> ?': ['nuit', [e('lampe', 40, 2.6)]],
  'À quoi sert un <strong>taille-crayon</strong> ?': ['classe', [e('tailleCrayon', 45, 2.6, {}, 170)]],
  'À quoi sert un <strong>parapluie</strong> ?': ['rue', [e('parapluie', 50, 2.4), e('pluie', 0)]],
  'À quoi sert une <strong>balance</strong> ?': ['cuisine', [e('balance', 50, 2.8), e('pomme', 50, 1.6, {}, 150)]],
  'À quoi sert un <strong>thermomètre</strong> ?': ['maison', [e('thermo', 50, 2.2, {}, 200)]],
  'Lequel est un <strong>objet technique</strong> (fabriqué par l\'être humain) ?': ['parc', [e('velo', 25, 1.4), e('arbre', 58, 1.2), e('pierre', 85, 1.4)]],
  'Pour écrire un texte sur l\'ordinateur, on utilise…': ['classe', [e('ordinateur', 50, 2.4)]],
  'Pour déplacer la flèche sur l\'écran de l\'ordinateur, on utilise…': ['classe', [e('ordinateur', 50, 2.4)]],
  'Pour avoir sur papier un texte écrit à l\'ordinateur, on utilise…': ['classe', [e('ordinateur', 35, 1.8), e('imprimante', 75, 1.6)]],
  'Une tablette, un ordinateur et un téléphone sont…': ['maison', [e('tablette', 25, 1.6), e('ordinateur', 55, 1.4), e('telephone', 85, 1.6)]],
  'Ce à quoi sert un objet s\'appelle sa…': ['classe', [e('ciseaux', 30, 2.4, {}, 170), e('tailleCrayon', 70, 2, {}, 170)]],
  'À quoi sert une <strong>boussole</strong> ?': ['foret', [e('boussole', 50, 3.6, {}, 170)]],
  'Un <strong>mot de passe</strong>…': ['maison', [e('ordinateur', 40, 2), e('cadenas', 78, 1.8)]],
  'Sur Internet, quand on trouve une information, il faut…': ['maison', [e('ordinateur', 50, 2.2), e('bulle', 70, 1.2, { t: '?' }, 70)]],
  'On reçoit un message d\'un inconnu sur Internet qui demande notre adresse. Il faut…': ['maison', [e('tablette', 40, 1.8), e('bulle', 58, 1, { t: 'Ton adresse ?' }, 70)]],
  /* ---------- Les circuits électriques ---------- */
  'Dans un circuit avec une pile et une ampoule, qui fournit l\'électricité ?': ['classe', [e('pile', 35, 2.4), e('ampoule', 70, 2.4, { n: true })]],
  'L\'<strong>interrupteur</strong> sert à…': ['maison', [e('ampoule', 50, 2.4, { n: true }, 120)]],
  'Pour qu\'une ampoule brille, le circuit doit être…': ['classe', [e('pile', 35, 2.4), e('ampoule', 70, 2.4, { n: true })]],
  'Un circuit est <strong>ouvert</strong> quand…': ['classe', [e('pile', 35, 2.4), e('ampoule', 70, 2.4)]],
  'Une pile a deux bornes :': ['classe', [e('pile', 50, 3.4)]],
  'Si l\'ampoule est grillée (son filament est cassé)…': ['classe', [e('ampoule', 50, 3.2)]],
  'Le fil électrique est en métal (du cuivre) parce que le métal…': ['classe', [e('pile', 35, 2.4), e('ampoule', 70, 2.4, { n: true })]],
  'L\'électricité d\'une pile de 4,5 V et celle d\'une prise de la maison…': ['maison', [e('pile', 30, 2.4), e('prise', 70, 2.2)]],
  /* ---------- Engrenages, poulies et leviers ---------- */
  'Deux roues dentées qui s\'engrènent tournent…': ['classe', [e('roueDentee', 38, 2.4, {}, 160), e('roueDentee', 64, 2.4, {}, 160)]],
  'Sur un vélo, la <strong>chaîne</strong> relie…': ['rue', [e('velo', 50, 2.6)]],
  'Une <strong>poulie</strong> sert à…': ['ferme', [e('poulie', 50, 1.6)]],
  'Une brouette, une balançoire à bascule et un casse-noix utilisent…': ['jardin', [e('brouette', 30, 1.6), e('cassenoix', 75, 1.6, {}, 150)]],
  'Une <strong>manivelle</strong> sert à…': ['maison', [e('manivelle', 50, 2.4)]],
  'Avec un levier, pour soulever une charge lourde le plus facilement, on appuie…': ['jardin', [e('brouette', 50, 2.4)]],
  'Une petite roue dentée est entraînée par une grande roue dentée. La petite tourne…': ['classe', [e('roueDentee', 38, 3, {}, 170), e('roueDentee', 70, 1.6, {}, 130)]],
  'Sur une balançoire à bascule, un adulte et un enfant s\'équilibrent si…': ['parc', [e('bascule', 50, 1.8)]],
  'Dans un vélo, les roues dentées reliées par la chaîne s\'appellent…': ['rue', [e('velo', 50, 2.6)]],
  /* ---------- La sécurité à la maison ---------- */
  'On ne touche jamais une prise ou un appareil électrique…': ['maison', [e('prise', 50, 2.6, {}, 170), e('gouttes', 30, 1.6, {}, 140)]],
  'On voit un fil électrique abîmé. Il faut…': ['maison', [e('prise', 40, 2.4, {}, 170), e('eclairs', 66, 1, {}, 120)]],
  'L\'électricité des prises de la maison est…': ['maison', [e('prise', 50, 3, {}, 170)]],
  'Pour débrancher un appareil, on tire…': ['maison', [e('prise', 40, 2.4, {}, 170), e('lampe', 75, 1.6)]],
  'Peut-on verser un produit ménager dans une bouteille de jus vide ?': ['cuisine', [e('flacon', 35, 2), e('bouteille', 70, 2.6)]],
  'Les médicaments…': ['maison', [e('medicaments', 50, 2.6)]],
  'Le numéro d\'appel des <strong>pompiers</strong> en France est le…': ['rue', [e('telephone', 50, 2.6)]],
  'Le numéro d\'appel du <strong>SAMU</strong> (urgences médicales) est le…': ['rue', [e('telephone', 50, 2.6)]],
  'Le numéro d\'urgence valable dans toute l\'Europe est le…': ['rue', [e('telephone', 50, 2.6)]],
  'Sur un flacon, une <strong>flamme</strong> dans un losange rouge veut dire que le produit…': ['maison', [e('flacon', 50, 2.8, { n: 'flamme' })]],
  'Sur un flacon, une <strong>tête de mort</strong> veut dire que le produit…': ['maison', [e('flacon', 50, 2.8, { n: 'tete' })]],
  'Sur un flacon, un dessin de main et de matière <strong>rongées</strong> par un liquide veut dire que le produit…': ['maison', [e('flacon', 50, 2.8, { n: 'corrosif' })]],
  'Pourquoi met-on des cache-prises quand il y a un bébé à la maison ?': ['maison', [e('bebe', 35, 2), e('prise', 70, 1.8, {}, 170)]],
  /* ---------- Le jour, la nuit, les saisons et le système solaire ---------- */
  'Le jour et la nuit existent parce que…': ['ciel', [e('soleilGrand', 25, 1.4, {}, 110), e('terre', 72, 2)]],
  'La Terre fait un tour complet sur elle-même en…': ['ciel', [e('terre', 50, 2.6)]],
  'Le Soleil se lève…': ['ferme', [e('soleil', 20, 1.4, {}, 150)]],
  'Dans l\'ordre, à partir du printemps, les saisons sont :': [['jardin', [e('fleurs', 50, 2)]], ['plage', [e('soleil', 50, 1.2, {}, 50)]], ['foret', [e('feuilles', 50, 2)]], ['neige', [e('bonhommeNeige', 50, 1.4)]]],
  'En hiver, en France, les jours sont…': ['neige', [e('bonhommeNeige', 40, 1.6), e('lune', 80, 1, {}, 40)]],
  'Ton ombre est la plus courte…': ['parc', [e('leo', 50, 1.6), e('ombre', 50, 1.4), e('soleil', 80, 1, {}, 36)]],
  'Le Soleil est…': ['ciel', [e('soleilGrand', 50, 2, {}, 120)]],
  'La Terre est…': ['ciel', [e('terre', 50, 2.6)]],
  'La Lune…': ['nuit', [e('lune', 50, 2.2, {}, 100)]],
  'La Lune brille la nuit parce que…': ['nuit', [e('lune', 50, 2.2, {}, 100)]],
  'La Terre fait le tour du Soleil en…': ['ciel', [e('soleilGrand', 30, 1.4, {}, 110), e('terre', 78, 1.4)]],
  'Combien de planètes tournent autour du Soleil ?': ['ciel', [e('soleilGrand', 50, 2, {}, 120)]],
  'La planète la plus proche du Soleil est…': ['ciel', [e('soleilGrand', 20, 1.6, {}, 110), e('terre', 75, 1.2)]],
  'La plus grosse planète du système solaire est…': ['ciel', [e('planetes', 45, 1.4, {}, 150)]],
  'La Lune fait le tour de la Terre en environ…': ['nuit', [e('terre', 40, 1.8), e('lune', 80, 1.2, {}, 80)]],
  'Quand il fait jour en France, en Nouvelle-Calédonie (de l\'autre côté de la Terre), il fait…': ['ciel', [e('soleilGrand', 20, 1.4, {}, 110), e('terre', 70, 2.2)]],
};

/* ---------- Les quiz de cours du CE ---------- */
const SCENES_QUIZ_CE = {
  'Un <strong>solide</strong>…': ['jardin', [e('pierre', 50, 3)]],
  'Un <strong>liquide</strong>…': ['cuisine', [e('verreEau', 30, 3), e('bouteille', 70, 3)]],
  'La surface d\'un liquide au repos est…': ['cuisine', [e('verreEau', 50, 4)]],
  'La glace, c\'est de l\'eau à l\'état…': ['neige', [e('glacon', 50, 3)]],
  'La vapeur d\'eau, c\'est de l\'eau à l\'état…': ['cuisine', [e('casserole', 50, 3), e('vapeur', 50, 1.8, {}, 120)]],
  'Solide → liquide : c\'est…': [['neige', [e('glacon', 50, 2.6)]], ['jardin', [e('flaque', 50, 1.4)]]],
  'Liquide → solide : c\'est…': [['jardin', [e('flaque', 50, 1.4)]], ['neige', [e('lacGele', 50, 1.2)]]],
  'Liquide → gaz : c\'est…': [['cuisine', [e('verreEau', 50, 2.6)]], ['cuisine', [e('vapeur', 50, 2.2, {}, 150)]]],
  'Gaz → liquide : c\'est…': ['maison', [e('fenetre', 50, 2.2), e('gouttes', 50, 1.6, {}, 110)]],
  'La glace fond (et l\'eau gèle) à…': ['neige', [e('glacon', 40, 2.4), e('thermo', 75, 1.8, {}, 200)]],
  'L\'eau bout à…': ['cuisine', [e('casserole', 45, 3), e('vapeur', 45, 1.8, {}, 120), e('thermo', 85, 1.6, {}, 200)]],
  'On mesure la température avec…': ['maison', [e('leo', 50, 1.6)]],
  'Quand une flaque sèche au soleil, l\'eau…': ['jardin', [e('flaque', 45, 1.6), e('soleil', 80, 1.2, {}, 40)]],
  'L\'air est…': ['parc', [e('arbre', 30, 1.6), e('mouvement', 70, 1.4, {}, 120)]],
  'L\'air pèse-t-il quelque chose ?': ['maison', [e('balance', 50, 2.6), e('ballonFete', 50, 1.4, {}, 210)]],
  'On peut serrer l\'air dans une seringue bouchée : l\'air est…': ['classe', [e('seringue', 50, 2.6, {}, 150)]],
  'Le vent, c\'est…': ['mer', [e('voilier', 50, 2, {}, 140), e('mouvement', 26, 1.2, {}, 90)]],
  'Pour une même distance, le plus rapide est celui qui met…': ['parc', [e('leo', 35, 1.3, { bras: 'deux' }), e('lina', 70, 1.3, { bras: 'deux' }), e('chrono', 88, 1.4, {}, 70)]],
  'Une éolienne utilise l\'énergie…': ['ferme', [e('eolienne', 50, 1.6)]],
  'Un moulin à eau utilise l\'énergie…': ['jardin', [e('moulinEau', 45, 1.8)]],
  'Un être vivant naît, se nourrit, grandit, se reproduit et…': [['ferme', [e('oeufs', 50, 2.4)]], ['ferme', [e('poussin', 50, 2.4)]], ['ferme', [e('poule', 50, 2.4)]]],
  'Une plante verte a besoin de…': ['jardin', [e('plantePot', 50, 2.4), e('soleil', 82, 1, {}, 40)]],
  'Un animal a besoin de…': ['maison', [e('chat', 40, 2.4), e('gamelle', 72, 2)]],
  'Les poissons respirent grâce à leurs…': ['mer', [e('poisson', 50, 3, {}, 170), e('bulles', 64, 1.4, {}, 130)]],
  'Un animal qui ne mange que des végétaux est…': ['jardin', [e('lapin', 40, 2.4), e('carotte', 70, 2)]],
  'Un animal qui mange d\'autres animaux est…': ['zoo', [e('lion', 50, 2.2)]],
  'Un animal qui mange de tout est…': ['foret', [e('ours', 50, 1.8)]],
  'Une chaîne alimentaire commence toujours par…': ['jardin', [e('salade', 25, 2), e('escargot', 55, 1.8), e('herisson', 82, 1.6)]],
  'Dans une chaîne alimentaire, la flèche veut dire…': [['jardin', [e('salade', 50, 2.4)]], ['jardin', [e('lapin', 50, 2.4)]], ['foret', [e('renard', 50, 2)]]],
  'Le changement complet de forme d\'un animal en grandissant s\'appelle…': [['lac', [e('tetard', 50, 2.6, {}, 210)]], ['lac', [e('grenouille', 50, 2.4)]]],
  'La chenille, avant de devenir papillon, s\'enferme dans…': [['jardin', [e('chenille', 50, 2)]], ['jardin', [e('bulle', 50, 1.4, { t: '?' }, 120)]], ['jardin', [e('papillon', 50, 2.2, {}, 140)]]],
  'Un animal qui pond des œufs est…': ['ferme', [e('poule', 40, 2.4), e('oeufs', 70, 2)]],
  'Un animal dont le petit se développe dans le ventre de sa mère est…': ['ferme', [e('vache', 40, 1.8), e('mouton', 75, 1.4)]],
  'Quand une graine commence à pousser, elle…': ['jardin', [e('pousse', 50, 2.4)]],
  'Les graines se trouvent dans…': ['cuisine', [e('pommeCoupee', 50, 3)]],
  'Combien d\'heures de sommeil par nuit à ton âge, environ ?': ['nuit', [e('lit', 50, 2), e('zzz', 60, 1, {}, 120), e('lune', 82, 1, {}, 40)]],
  'Combien de fois par jour se brosse-t-on les dents ?': ['maison', [e('brosseDents', 50, 2.2, {}, 150), e('dent', 80, 1.6, {}, 170)]],
  'Combien de fruits et légumes par jour, au moins ?': ['marche', [e('panier', 50, 2.4), e('pomme', 40, 1.4, {}, 150), e('carotte', 58, 1.4, {}, 150)]],
  'Les dents qui tombent vers 6 ans s\'appellent…': ['maison', [e('lina', 50, 1.6, { visage: 'rit' }), e('dent', 75, 1.4, {}, 110)]],
  'Ce à quoi sert un objet, c\'est sa…': ['classe', [e('ciseaux', 30, 2.4, {}, 170), e('parapluie', 70, 1.8)]],
  'Un objet fabriqué par l\'être humain pour répondre à un besoin est…': ['parc', [e('velo', 50, 2.2)]],
  'Dans un circuit, ce qui fournit l\'électricité, c\'est…': ['classe', [e('pile', 35, 2.4), e('ampoule', 70, 2.4, { n: true })]],
  'L\'ampoule brille si le circuit est…': ['classe', [e('ampoule', 50, 3, { n: true })]],
  'Un interrupteur ouvert…': ['classe', [e('ampoule', 50, 3)]],
  'Un matériau qui laisse passer le courant est…': ['classe', [e('pile', 35, 2.4), e('ampoule', 70, 2.4, { n: true })]],
  'Un matériau qui ne laisse pas passer le courant est…': ['classe', [e('pile', 35, 2.4), e('ampoule', 70, 2.4)]],
  'Deux roues dentées qui s\'engrènent tournent…': ['classe', [e('roueDentee', 38, 2.4, {}, 160), e('roueDentee', 64, 2.4, {}, 160)]],
  'Une barre qui tourne autour d\'un point d\'appui est…': ['parc', [e('bascule', 50, 1.8)]],
  'Le numéro des pompiers :': ['rue', [e('telephone', 50, 2.6)]],
  'Le numéro du SAMU :': ['rue', [e('telephone', 50, 2.6)]],
  'Le numéro d\'urgence européen :': ['rue', [e('telephone', 50, 2.6)]],
  'On ne touche jamais une prise…': ['maison', [e('prise', 50, 2.6, {}, 170), e('gouttes', 30, 1.6, {}, 140)]],
  'Le jour et la nuit sont dus à…': ['ciel', [e('soleilGrand', 25, 1.4, {}, 110), e('terre', 72, 2)]],
  'La Terre tourne sur elle-même en…': ['ciel', [e('terre', 50, 2.6)]],
  'La Terre fait le tour du Soleil en…': ['ciel', [e('soleilGrand', 30, 1.4, {}, 110), e('terre', 78, 1.4)]],
  'Le Soleil se lève à…': ['ferme', [e('soleil', 20, 1.4, {}, 150)]],
  'Le Soleil est…': ['ciel', [e('soleilGrand', 50, 2, {}, 120)]],
  'La Lune est…': ['nuit', [e('terre', 40, 1.8), e('lune', 80, 1.2, {}, 80)]],
  'Combien de planètes dans le système solaire ?': ['ciel', [e('soleilGrand', 50, 2, {}, 120)]],
};
/* ============================================================
   MNEMOSCIENCES — v11 : DES QUESTIONS EN PLUS POUR LE CE (une trentaine par exercice)
   Chaque ligne : [énoncé, bonne réponse, mauvaises réponses (ou null pour une réponse à écrire),
                   explication, scène dessinée, options { n: 1 = plutôt CE2, u: unité, v: phrase lue }].
   La scène montre la situation sans souffler la réponse.
   ------------------------------------------------------------ */
function plusCE(B, L) {
  L.forEach(([q, r, f, ex, sc, o]) => {
    const x = Object.assign({ q, r, e: ex }, o || {});
    if (f) x.f = f;
    const cle = B.some((y) => y.q === q && y.r !== r) ? `${q}|${r}` : q;
    B.push(x);
    SCENES_CE[cle] = sc;
  });
}

/* ---------- Solides et liquides ---------- */
plusCE(B_ETATS, [
  ["Le <strong>sirop</strong> est…", "un liquide", ["un solide"], "Le sirop coule et prend la forme de la bouteille : c'est un <strong>liquide</strong>.", ['cuisine', [e('table', 50, 2.4), e('bouteille', 50, 1.6, { c: '#c0392b' }, 131)]]],
  ["L'<strong>huile</strong> est…", "un liquide", ["un solide"], "L'huile coule et prend la forme du récipient : c'est un <strong>liquide</strong>.", ['cuisine', [e('table', 50, 2.4), e('bouteille', 44, 1.6, { c: '#f4d03f' }, 131), e('poele', 66, 1.4, {}, 131)]]],
  ["Une <strong>bougie</strong> éteinte est…", "un solide", ["un liquide"], "La bougie garde sa forme quand on la pose ou qu'on la prend : c'est un <strong>solide</strong>.", ['maison', [e('table', 50, 2.4), e('bougie', 50, 1.8, {}, 131)]]],
  ["Une <strong>assiette</strong> est…", "un solide", ["un liquide"], "L'assiette garde sa forme toute seule : c'est un <strong>solide</strong>.", ['cuisine', [e('table', 50, 2.4), e('assiette', 50, 1.8, {}, 131)]]],
  ["L'<strong>eau de la mer</strong> est…", "un liquide", ["un solide"], "L'eau de mer coule, fait des vagues et prend la forme de ce qui la contient : c'est un <strong>liquide</strong>.", ['plage', [e('parasol', 25, 1.6), e('seau', 70, 1.6)]]],
  ["On met un <strong>caillou</strong> dans un verre. Le caillou…", "garde sa forme", ["prend la forme du verre", "coule au fond comme de l'eau et s'étale"], "Un caillou est un solide : il garde sa forme, quel que soit le récipient.", ['cuisine', [e('pierre', 32, 2.2), e('verre', 68, 2.4)]]],
  ["On verse le <strong>lait</strong> de la brique dans un bol. Le lait…", "prend la forme du bol", ["garde la forme de la brique", "devient solide"], "Le lait est un liquide : il prend la forme du récipient, ici le bol.", [['cuisine', [e('table', 50, 2.4), e('brique', 50, 2, {}, 131)]], ['cuisine', [e('table', 50, 2.4), e('bol', 50, 2, {}, 131)]]]],
  ["Lequel est un <strong>liquide</strong> ?", "l'eau", ["le pain", "un biscuit"], "L'eau coule et prend la forme du verre : c'est un <strong>liquide</strong>. Le pain et le biscuit gardent leur forme : ce sont des solides.", ['cuisine', [e('table', 50, 2.6), e('pain', 30, 1.4, {}, 131), e('verreEau', 52, 1.6, {}, 131), e('biscuit', 72, 1.4, {}, 131)]]],
  ["Lequel est un <strong>solide</strong> ?", "un livre", ["le lait", "l'huile"], "Le livre garde sa forme tout seul : c'est un <strong>solide</strong>. Le lait et l'huile coulent : ce sont des liquides.", ['classe', [e('pupitre', 50, 2.2), e('livre', 50, 1.4, {}, 150)]]],
  ["La <strong>neige</strong> est de l'eau…", "solide", ["liquide"], "La neige est faite de petits cristaux de glace : c'est de l'eau à l'état <strong>solide</strong>. Quand il fait plus chaud, elle fond.", ['neige', [e('bonhommeNeige', 50, 2)]], { n: 1 }],
  ["Le chocolat fondu, quand il refroidit…", "redevient solide", ["reste liquide pour toujours", "devient de l'eau"], "En refroidissant, le chocolat fondu <strong>redevient solide</strong> : c'est comme ça qu'on fait des tablettes et des moulages.", [['cuisine', [e('casserole', 50, 2.6)]], ['cuisine', [e('frigo', 50, 1.8)]]], { n: 1 }],
  ["Une <strong>glace à la vanille</strong> oubliée au soleil…", "fond", ["devient plus dure", "grossit"], "La chaleur fait <strong>fondre</strong> la glace : elle devient liquide et coule.", ['plage', [e('soleil', 82, 1.2, {}, 40), e('glace', 45, 2)]]],
  ["Près de la flamme, la <strong>cire</strong> d'une bougie allumée…", "fond et coule", ["devient plus dure", "se transforme en sable"], "La chaleur de la flamme fait <strong>fondre</strong> la cire : elle devient liquide. En refroidissant, les coulures redeviennent solides.", ['maison', [e('table', 50, 2.4), e('bougie', 50, 2, {}, 131)]], { n: 1 }],
  ["On verse la même quantité d'eau dans un verre haut, puis dans une assiette. La quantité d'eau…", "est la même", ["est plus grande dans le verre", "est plus grande dans l'assiette"], "L'eau change de forme, mais pas de quantité : c'est <strong>la même</strong> eau. Elle paraît plus haute dans le verre parce qu'il est étroit.", ['cuisine', [e('table', 50, 2.6), e('verreEau', 36, 2, {}, 131), e('assiette', 66, 1.8, {}, 131)]], { n: 1 }],
  ["Pour mesurer une quantité de liquide, on utilise…", "un verre doseur gradué", ["une règle", "un thermomètre"], "Le verre doseur a des <strong>graduations</strong> : on lit le niveau du liquide, en litres ou en millilitres.", ['cuisine', [e('table', 50, 2.4), e('verreEau', 50, 2, {}, 131), e('saladier', 72, 1.4, {}, 131)]], { n: 1 }],
  ["Le <strong>sucre en poudre</strong> se verse comme un liquide. Pourtant, c'est…", "un solide en grains", ["un liquide", "de l'eau"], "Chaque grain de sucre garde sa forme : le sucre en poudre est un <strong>solide</strong> fait de tout petits grains.", ['cuisine', [e('table', 50, 2.4), e('bol', 44, 1.8, {}, 131), e('gateau', 68, 1.4, {}, 131)]], { n: 1 }],
]);

/* ---------- Les changements d'état de l'eau ---------- */
plusCE(B_EAU, [
  ["Au printemps, la neige fond et devient…", "de l'eau liquide", ["de l'air", "du sable"], "Quand il fait plus chaud que 0 °C, la neige <strong>fond</strong> : elle devient de l'eau liquide, qui coule dans les ruisseaux.", ['neige', [e('bonhommeNeige', 40, 1.8), e('soleil', 80, 1.2, {}, 40)]]],
  ["Une <strong>flaque d'eau</strong> au soleil…", "disparaît peu à peu : l'eau s'évapore", ["devient de la glace", "grossit toute seule"], "La chaleur du Soleil transforme l'eau de la flaque en vapeur invisible : elle <strong>s'évapore</strong>.", ['jardin', [e('flaque', 50, 1.6), e('soleil', 82, 1.2, {}, 40)]]],
  ["Les <strong>nuages</strong> sont faits…", "de minuscules gouttes d'eau", ["de fumée", "de coton"], "La vapeur d'eau monte, se refroidit en hauteur et forme de <strong>minuscules gouttes d'eau</strong> (ou de glace) : ce sont les nuages.", ['ciel', [e('nuage', 35, 1.6, {}, 70), e('nuage', 72, 1.2, {}, 110)]], { n: 1 }],
  ["La <strong>pluie</strong>, c'est de l'eau…", "liquide", ["solide", "gazeuse"], "Les gouttes de pluie sont de l'eau à l'état <strong>liquide</strong> qui tombe des nuages.", ['rue', [e('pluie', 0), e('parapluie', 50, 2)]]],
  ["La <strong>grêle</strong>, ce sont des billes d'eau…", "solide (de la glace)", ["liquide", "gazeuse"], "Les grêlons sont des billes de <strong>glace</strong> : de l'eau solide qui tombe des gros nuages d'orage.", ['ciel', [e('nuage', 50, 2, {}, 80)]], { n: 1 }],
  ["Le linge sèche plus vite quand il y a du soleil et du vent, parce que…", "la chaleur et le vent aident l'eau à s'évaporer", ["le soleil boit l'eau", "le vent fait geler l'eau"], "L'eau du linge <strong>s'évapore</strong> plus vite quand il fait chaud et quand le vent emporte la vapeur.", ['jardin', [e('filLinge', 50, 2), e('soleil', 82, 1.1, {}, 40)]], { n: 1 }],
  ["Quand l'eau bout, les grosses bulles sont faites…", "de vapeur d'eau", ["d'air", "de glace"], "Au fond de la casserole, l'eau devient de la <strong>vapeur</strong> : elle forme des bulles qui remontent et éclatent à la surface.", ['cuisine', [e('casserole', 50, 3)]], { n: 1 }],
  ["Le matin, de petites gouttes couvrent l'herbe : c'est la <strong>rosée</strong>. Elle vient…", "de la vapeur d'eau de l'air qui se condense", ["des fleurs qui pleurent", "de la mer"], "La nuit, l'herbe se refroidit ; la vapeur d'eau de l'air qui la touche redevient liquide : c'est une <strong>condensation</strong>.", ['jardin', [e('fleurs', 40, 1.6), e('gouttes', 60, 1.4, {}, 160)]], { n: 1 }],
  ["L'eau peut exister sous trois états :", "solide, liquide et gaz", ["chaud, froid et tiède", "glace, neige et grêle"], "Glace (<strong>solide</strong>), eau (<strong>liquide</strong>), vapeur (<strong>gaz</strong>) : c'est toujours de l'eau, dans trois états différents.", ['montagne', [e('lac', 50, 1.6)]], { n: 1 }],
  ["Un glaçon fond plus vite…", "dans un endroit chaud", ["au congélateur", "dans la neige"], "Plus il fait chaud autour du glaçon, plus il <strong>fond</strong> vite.", ['cuisine', [e('table', 50, 2.4), e('glacon', 50, 1.6, {}, 131)]]],
  ["Une bouteille très froide, sortie du réfrigérateur, se couvre de gouttelettes, parce que…", "la vapeur d'eau de l'air se condense dessus", ["l'eau traverse le verre", "la bouteille fuit"], "La vapeur d'eau invisible de l'air touche la bouteille froide et redevient liquide : c'est la <strong>condensation</strong>.", ['cuisine', [e('frigo', 30, 1.8), e('bouteille', 68, 2.2)]], { n: 1 }],
  ["En hiver, l'eau d'un lac devient…", "de la glace", ["de la vapeur", "du sable"], "Quand il fait plus froid que 0 °C, l'eau du lac <strong>gèle</strong> : elle devient de la glace.", ['neige', [e('lacGele', 50, 1.4)]]],
  ["On fait chauffer de la glace dans une casserole. Elle devient d'abord…", "de l'eau liquide", ["de la vapeur", "de la neige"], "La glace <strong>fond</strong> d'abord (elle devient liquide) ; si on chauffe encore, l'eau finit par bouillir et devenir vapeur.", ['cuisine', [e('glacon', 30, 2), e('casserole', 68, 2.4)]], { n: 1 }],
  ["L'eau gèle à quelle température ?", 0, null, "L'eau gèle à <strong>0 °C</strong>, la même température que celle où la glace fond.", ['neige', [e('lacGele', 50, 1.4)]], { n: 1, u: '°C', v: "L'eau gèle à quelle température, en degrés ?" }],
  ["Une bouteille pleine d'eau, oubliée au congélateur, peut éclater, parce que…", "l'eau prend plus de place en gelant", ["la glace est chaude", "le froid fait fondre le plastique"], "En devenant de la glace, l'eau <strong>prend plus de place</strong> : elle pousse sur les parois de la bouteille.", ['cuisine', [e('frigo', 35, 1.8), e('bouteille', 70, 2)]], { n: 1 }],
  ["Le petit nuage blanc au-dessus d'une casserole d'eau chaude, c'est…", "de toutes petites gouttes d'eau", ["de la fumée de feu", "de la glace"], "La vapeur d'eau est invisible : le nuage blanc, ce sont de <strong>minuscules gouttes</strong> d'eau, formées quand la vapeur se refroidit dans l'air.", ['cuisine', [e('casserole', 50, 3), e('vapeur', 50, 1.8, {}, 120)]], { n: 1 }],
]);

/* ---------- L'air ---------- */
plusCE(B_AIR, [
  ["L'air est…", "invisible", ["rouge", "toujours blanc"], "On ne voit pas l'air : il est <strong>invisible</strong>. On le sent quand il bouge (le vent) et on le voit faire des bulles dans l'eau.", ['parc', [e('arbre', 25, 1.6), e('banc', 65, 1.6)]]],
  ["Les feuilles des arbres bougent quand il y a…", "du vent", ["du soleil seulement", "de la lumière"], "Le <strong>vent</strong>, c'est de l'air qui se déplace : il pousse les feuilles.", ['foret', [e('arbre', 30, 1.8), e('feuilles', 65, 1.6, {}, 120)]]],
  ["Pour gonfler un pneu de vélo, on utilise…", "une pompe", ["un tuyau d'eau", "une loupe"], "La <strong>pompe</strong> pousse de l'air dans le pneu.", ['rue', [e('velo', 50, 1.6)]]],
  ["On souffle dans une paille plongée dans un verre d'eau. On voit…", "des bulles d'air", ["de la glace", "rien du tout"], "L'air soufflé sort au bout de la paille et remonte : ce sont des <strong>bulles d'air</strong>.", ['cuisine', [e('table', 50, 2.4), e('verreEau', 50, 2.2, {}, 131)]]],
  ["On lâche un ballon de baudruche gonflé sans l'avoir fermé. Il…", "part en se dégonflant : l'air sort", ["reste immobile", "grossit"], "L'air sort du ballon d'un seul côté et le pousse dans l'autre sens : le ballon file en se <strong>dégonflant</strong>.", ['maison', [e('lina', 40, 1.4), e('ballonFete', 68, 1.4, {}, 100)]]],
  ["Un cerf-volant tient dans le ciel grâce…", "au vent", ["à une pile", "à la pluie"], "Le <strong>vent</strong> appuie sous le cerf-volant et le porte, pendant qu'on tient le fil.", ['plage', [e('leo', 40, 1.4)]]],
  ["Un oiseau peut planer sans battre des ailes parce que…", "l'air le porte", ["il ne pèse rien", "il n'y a pas d'air en hauteur"], "Les ailes s'appuient sur l'<strong>air</strong>, qui porte l'oiseau, comme l'eau porte un bateau.", ['ciel', [e('oiseau', 40, 2, {}, 90), e('nuage', 75, 1.2, {}, 60)]], { n: 1 }],
  ["Pour se rafraîchir avec un éventail, on…", "fait bouger l'air", ["chauffe l'air", "fait de la lumière"], "L'éventail <strong>fait bouger l'air</strong> : ce petit vent sur la peau rafraîchit.", ['plage', [e('lina', 40, 1.4), e('parasol', 70, 1.6)]]],
  ["L'air que nous respirons contient un gaz indispensable à la vie :", "l'oxygène", ["la vapeur", "le sable"], "Nous avons besoin de l'<strong>oxygène</strong> (son nom exact est le dioxygène) de l'air pour vivre.", ['parc', [e('leo', 35, 1.4), e('arbre', 72, 1.6)]], { n: 1 }],
  ["Quand le vent souffle très très fort, c'est…", "une tempête", ["du brouillard", "une canicule"], "Une <strong>tempête</strong> est un vent très violent, qui peut casser des branches.", ['mer', [e('bateau', 50, 1.4), e('nuage', 30, 1.4, {}, 50)]]],
  ["Un voilier n'avance pas quand…", "il n'y a pas de vent", ["il fait soleil", "la mer est bleue"], "C'est le <strong>vent</strong> qui pousse la voile : sans vent, le voilier reste sur place.", ['mer', [e('voilier', 50, 1.8)]]],
  ["On bouche le bout d'une seringue pleine d'air. Peut-on enfoncer le piston jusqu'au bout ?", "Non, l'air enfermé résiste", ["Oui, facilement", "Oui, l'air disparaît"], "L'air se laisse un peu comprimer, mais il prend toujours de la place : il <strong>résiste</strong> et repousse le piston.", ['classe', [e('seringue', 50, 2.4)]], { n: 1 }],
  ["Un sac en plastique gonflé et bien fermé : quand on appuie dessus, il…", "résiste, car il est plein d'air", ["s'écrase tout de suite à plat", "se remplit d'eau"], "Le sac est plein d'<strong>air</strong> : l'air enfermé prend de la place et résiste quand on appuie.", ['maison', [e('leo', 50, 1.4)]]],
  ["Pour savoir dans quel sens souffle le vent, on regarde…", "un drapeau ou une manche à air", ["un thermomètre", "une balance"], "Le <strong>drapeau</strong> ou la manche à air se tournent dans le sens où va le vent.", ['plage', [e('parasol', 30, 1.6), e('voilier', 72, 1.2)]], { n: 1 }],
  ["L'air chaud…", "monte", ["descend", "reste toujours au sol"], "L'air chaud est plus léger que l'air froid : il <strong>monte</strong>. C'est pour ça qu'une montgolfière s'élève quand on chauffe l'air de son ballon.", ['ciel', [e('nuage', 50, 1.6, {}, 80)]], { n: 1 }],
  ["Les bulles d'une boisson gazeuse sont faites…", "d'un gaz", ["d'eau", "de sucre"], "Dans les boissons gazeuses, on a mis un <strong>gaz</strong> : il s'échappe en bulles quand on ouvre la bouteille.", ['cuisine', [e('table', 50, 2.4), e('bouteille', 40, 1.6, {}, 131), e('verre', 64, 1.6, {}, 131)]], { n: 1 }],
]);

/* ---------- Mouvements et énergie ---------- */
plusCE(B_MOUV, [
  ["Un objet qui ne bouge pas est…", "immobile", ["rapide", "en mouvement"], "Un objet qui ne bouge pas est <strong>immobile</strong>.", ['parc', [e('banc', 50, 2)]]],
  ["Pour aller plus vite à vélo, on…", "pédale plus vite", ["freine", "arrête de pédaler"], "Plus on <strong>pédale</strong> vite, plus les roues tournent vite.", ['route', [e('velo', 50, 1.6)]]],
  ["Pour arrêter un vélo, on utilise…", "les freins", ["la sonnette", "la selle"], "Les <strong>freins</strong> frottent sur la roue et la ralentissent.", ['route', [e('velo', 50, 1.6)]]],
  ["Une balle qui roule sur l'herbe finit par…", "s'arrêter", ["accélérer toute seule", "rouler pour toujours"], "L'herbe <strong>freine</strong> la balle : elle ralentit, puis s'arrête.", ['parc', [e('ballon', 50, 1.6)]]],
  ["Quand on lâche un objet, il…", "tombe vers le sol", ["monte au ciel", "reste en l'air"], "Les objets lâchés <strong>tombent</strong> vers le sol : ils sont attirés par la Terre.", ['maison', [e('leo', 40, 1.4), e('ballon', 60, 1.2, {}, 90)]]],
  ["Lequel va le plus vite ?", "un avion", ["un vélo", "un enfant qui marche"], "Un avion vole à plusieurs centaines de kilomètres par heure : c'est le plus <strong>rapide</strong> des trois.", ['rue', [e('avion', 75, 1, {}, 50), e('velo', 30, 1.3), e('tom', 55, 1.1)]]],
  ["Course de 50 m : Léo met 10 secondes, Lina met 12 secondes. Le plus rapide est…", "Léo", ["Lina", "aucun des deux"], "Pour la même distance, le plus rapide est celui qui met <strong>le moins de temps</strong> : Léo (10 s).", ['parc', [e('leo', 35, 1.4), e('lina', 65, 1.4)]], { n: 1 }],
  ["Sur une pente plus raide, une petite voiture descend…", "plus vite", ["moins vite", "pas du tout"], "Plus la pente est <strong>raide</strong>, plus la voiture prend de la vitesse.", ['maison', [e('planche', 50, 2), e('voiture', 38, .6, {}, 178)]], { n: 1 }],
  ["Une pile peut fournir de l'énergie pour…", "allumer une lampe ou faire tourner un petit moteur", ["faire pousser une plante", "faire geler l'eau"], "L'énergie électrique de la <strong>pile</strong> fait briller une lampe ou tourner un moteur.", ['classe', [e('pile', 40, 2), e('ampoule', 65, 2)]]],
  ["On remonte le ressort d'une petite voiture : on lui donne…", "de l'énergie", ["de l'eau", "de l'air"], "En remontant le ressort, on stocke de l'<strong>énergie</strong>, que la voiture utilise pour rouler.", ['maison', [e('voiture', 50, .9)]], { n: 1 }],
  ["Pour avancer, une voiture a besoin…", "d'énergie (de l'essence ou de l'électricité)", ["de peinture", "de musique"], "Le moteur a besoin d'<strong>énergie</strong> : de l'essence ou l'électricité d'une batterie.", ['route', [e('voiture', 50, .9)]]],
  ["Notre corps trouve l'énergie pour courir et jouer…", "dans la nourriture", ["dans les vêtements", "dans les chaussures"], "Les aliments donnent à notre corps l'<strong>énergie</strong> dont il a besoin pour bouger, grandir et réfléchir.", ['cuisine', [e('table', 50, 2.4), e('pain', 40, 1.4, {}, 131), e('pomme', 62, 1.4, {}, 131)]]],
  ["Le Soleil nous apporte…", "de la lumière et de la chaleur", ["de la pluie", "du bruit"], "Le Soleil nous envoie de la <strong>lumière</strong> et de la <strong>chaleur</strong> : c'est une source d'énergie.", ['jardin', [e('soleil', 70, 1.4, {}, 50), e('fleur', 30, 2)]]],
  ["Un mètre, c'est…", "100 centimètres", ["10 centimètres", "1 000 centimètres"], "1 mètre = <strong>100 centimètres</strong>. Une règle de 20 cm, c'est donc un cinquième de mètre.", ['classe', [e('metre', 50, 2)]], { n: 1 }],
  ["Combien de secondes y a-t-il dans une minute ?", 60, null, "1 minute = <strong>60 secondes</strong>.", ['classe', [e('chrono', 50, 2.4)]], { n: 1, u: 's', v: "Combien de secondes y a-t-il dans une minute ?" }],
  ["Un enfant fait 5 fois le tour d'une cour de 20 m. Quelle distance a-t-il parcourue ?", 100, null, "5 tours de 20 m : 5 × 20 = <strong>100 m</strong>.", ['parc', [e('garcon', 50, 1.4)]], { n: 1, u: 'm', v: "Un enfant fait 5 fois le tour d'une cour de 20 mètres. Quelle distance a-t-il parcourue, en mètres ?" }],
  ["On tire vers soi la corde attachée à un chariot. Le chariot…", "avance vers nous", ["s'éloigne", "s'envole"], "Quand on <strong>tire</strong>, l'objet vient vers nous ; quand on <strong>pousse</strong>, il s'éloigne.", ['parc', [e('leo', 35, 1.4), e('corde', 60, 1.4)]]],
  ["Une trottinette avance quand on…", "pousse le sol avec le pied", ["souffle dessus", "la regarde"], "En <strong>poussant</strong> le sol avec le pied, on met la trottinette en mouvement.", ['rue', [e('lina', 50, 1.4)]]],
]);

/* ---------- Le vivant et ses besoins ---------- */
plusCE(B_VIVANT, [
  ["Lequel est <strong>vivant</strong> ?", "un escargot", ["un caillou", "une voiture"], "L'escargot naît, mange, grandit, se reproduit et meurt : il est <strong>vivant</strong>.", ['jardin', [e('escargot', 22, 2), e('pierre', 52, 2), e('voiture', 82, .6)]]],
  ["Lequel est <strong>vivant</strong> ?", "une fleur", ["un ballon", "une pierre"], "La fleur pousse, a besoin d'eau et de lumière, fait des graines : elle est <strong>vivante</strong>.", ['jardin', [e('ballon', 22, 1.4), e('fleur', 52, 2), e('pierre', 82, 2)]]],
  ["Lequel n'est <strong>pas vivant</strong> ?", "un nuage", ["un chat", "un arbre"], "Le nuage bouge et change de forme, mais il ne naît pas, ne mange pas et ne se reproduit pas : il n'est <strong>pas vivant</strong>.", ['jardin', [e('chat', 25, 1.6), e('arbre', 55, 1.6), e('nuage', 82, 1.2, {}, 50)]]],
  ["Un être vivant finit toujours par…", "mourir", ["devenir une pierre", "rester pareil pour toujours"], "Tous les êtres vivants naissent, grandissent… et finissent par <strong>mourir</strong>.", ['foret', [e('arbre', 40, 1.6), e('feuilles', 70, 1.4, {}, 175)]], { n: 1 }],
  ["Pour fabriquer leur nourriture, les plantes vertes ont besoin…", "de la lumière du soleil", ["de la nuit", "du bruit"], "Les feuilles utilisent la <strong>lumière</strong>, l'eau et l'air pour fabriquer la nourriture de la plante.", ['maison', [e('plantePot', 50, 2.4)]], { n: 1 }],
  ["Une plante laissée longtemps dans le noir…", "jaunit et pousse mal", ["devient plus verte", "ne change pas"], "Sans <strong>lumière</strong>, la plante ne peut plus fabriquer sa nourriture : elle jaunit et s'affaiblit.", ['nuit', [e('plantePot', 50, 2.4)]], { n: 1 }],
  ["Pendant l'hiver, le hérisson <strong>hiberne</strong>. Cela veut dire qu'il…", "dort tout l'hiver dans un abri", ["part dans les pays chauds", "mange sans arrêt"], "Le hérisson <strong>hiberne</strong> : il dort tout l'hiver, caché sous des feuilles, et vit sur ses réserves.", ['neige', [e('herisson', 50, 2)]]],
  ["Les animaux se déplacent pour…", "chercher leur nourriture, fuir ou trouver un abri", ["rien, sans raison", "devenir des plantes"], "Se <strong>déplacer</strong> permet aux animaux de trouver à manger, d'échapper à un danger, de trouver un abri ou un partenaire.", ['foret', [e('biche', 50, 1.8)]]],
  ["Un bébé…", "est vivant : il respire, mange et grandit", ["n'est pas encore vivant", "est vivant seulement quand il parle"], "Le bébé <strong>respire</strong>, se nourrit, grandit : c'est un être vivant.", ['maison', [e('maman', 40, 1.3), e('bebe', 62, 1.3)]]],
  ["Les poissons respirent dans l'eau grâce à…", "leurs branchies", ["des poumons", "leurs nageoires"], "Les <strong>branchies</strong>, de chaque côté de la tête, prennent l'oxygène dissous dans l'eau.", ['mer', [e('poisson', 50, 2, {}, 140)]], { n: 1 }],
  ["En hiver, un pommier sans feuilles…", "est toujours vivant", ["est mort", "est devenu un objet"], "L'arbre se repose en hiver : il perd ses feuilles mais reste <strong>vivant</strong>, et ses bourgeons s'ouvriront au printemps.", ['neige', [e('pommier', 50, 1.8)]], { n: 1 }],
  ["Une plante prend l'eau du sol grâce…", "à ses racines", ["à ses fleurs", "à ses fruits"], "Les <strong>racines</strong> puisent l'eau et les sels minéraux du sol.", ['jardin', [e('plantePot', 50, 2.4)]]],
  ["Un œuf de poule fécondé et couvé donne…", "un poussin", ["une graine", "un caillou"], "La poule couve ses œufs pendant 21 jours ; dans l'œuf, un <strong>poussin</strong> se développe.", ['ferme', [e('poule', 40, 1.8), e('oeufs', 68, 1.6)]]],
  ["Le bois d'une table est…", "d'origine vivante : il vient d'un arbre", ["d'origine minérale, comme la pierre", "du plastique"], "Le bois vient des <strong>arbres</strong> : c'est une matière d'origine vivante (végétale).", ['maison', [e('table', 50, 2.6)]], { n: 1 }],
  ["Le sable et les cailloux sont…", "non vivants (des minéraux)", ["vivants", "d'origine animale"], "Le sable et les cailloux ne naissent pas, ne grandissent pas : ce sont des <strong>minéraux</strong>, non vivants.", ['plage', [e('tasSable', 35, 2), e('pierre', 70, 2)]], { n: 1 }],
  ["Les animaux et les plantes ont tous besoin…", "d'eau", ["de lumière électrique", "de jouets"], "Sans <strong>eau</strong>, aucun être vivant ne peut vivre.", ['jardin', [e('chien', 30, 1.6), e('fleur', 70, 2)]]],
  ["Pourquoi pose-t-on les plantes d'intérieur près d'une fenêtre ?", "Pour qu'elles aient de la lumière", ["Pour qu'elles voient dehors", "Pour qu'elles aient froid"], "Les plantes ont besoin de <strong>lumière</strong> pour fabriquer leur nourriture.", ['maison', [e('fenetre', 50, 2.2), e('plantePot', 50, 1.6, {}, 190)]]],
  ["Une graine est…", "vivante : elle peut germer", ["un petit caillou", "un objet en plastique"], "La graine contient une petite plante endormie : elle est <strong>vivante</strong> et peut germer.", ['jardin', [e('graine', 50, 2.4)]], { n: 1 }],
]);

/* ---------- Grandir et rester en bonne santé ---------- */
plusCE(B_SANTE, [
  ["Après avoir mangé des bonbons, il faut…", "se brosser les dents", ["boire un soda", "aller dormir tout de suite"], "Le sucre reste collé aux dents et nourrit les microbes qui font des caries : on se <strong>brosse les dents</strong>.", ['maison', [e('table', 50, 2.4), e('bonbons', 50, 1.8, {}, 131)]]],
  ["Un brossage de dents doit durer au moins…", "2 minutes", ["5 secondes", "1 heure"], "Il faut au moins <strong>2 minutes</strong> pour bien brosser toutes les dents, dessus, dedans et dehors.", ['maison', [e('brosseDents', 40, 2), e('reveil', 70, 1.6)]], { n: 1 }],
  ["Une <strong>carie</strong>, c'est…", "un trou dans une dent, causé par le sucre et les microbes", ["une dent qui pousse", "une dent très propre"], "Les microbes de la bouche transforment le sucre en acide, qui creuse la dent : c'est une <strong>carie</strong>.", ['maison', [e('dent', 50, 2.4)]], { n: 1 }],
  ["On va chez le dentiste…", "au moins une fois par an", ["jamais", "seulement quand on est adulte"], "Une visite <strong>chaque année</strong> permet de soigner une carie avant qu'elle fasse mal.", ['maison', [e('maman', 35, 1.3), e('dent', 65, 2)]]],
  ["Le <strong>petit-déjeuner</strong>…", "donne de l'énergie pour la matinée", ["ne sert à rien", "fait dormir"], "Le petit-déjeuner donne au corps l'<strong>énergie</strong> pour bien travailler et jouer le matin.", ['cuisine', [e('table', 50, 2.4), e('bol', 40, 1.6, {}, 131), e('pain', 62, 1.4, {}, 131)]]],
  ["Les fruits et les légumes apportent surtout…", "des vitamines", ["du sel", "de la graisse"], "Fruits et légumes apportent des <strong>vitamines</strong>, de l'eau et des fibres.", ['marche', [e('carotte', 30, 1.8), e('salade', 52, 1.6), e('pomme', 74, 1.6)]]],
  ["Lequel est un <strong>légume</strong> ?", "la carotte", ["la pomme", "le fromage"], "La <strong>carotte</strong> est un légume (c'est une racine). La pomme est un fruit ; le fromage vient du lait.", ['marche', [e('pomme', 25, 1.6), e('carotte', 52, 1.8), e('fromage', 78, 1.6)]]],
  ["Lequel est un <strong>fruit</strong> ?", "la pomme", ["la salade", "le pain"], "La <strong>pomme</strong> est un fruit : elle contient des pépins, les graines du pommier.", ['marche', [e('salade', 25, 1.6), e('pain', 52, 1.4), e('pomme', 78, 1.6)]]],
  ["Boire souvent des sodas très sucrés…", "est mauvais pour les dents et la santé", ["remplace l'eau", "rend les dents plus solides"], "Les sodas contiennent beaucoup de <strong>sucre</strong> : ils abîment les dents et font prendre du poids. La boisson indispensable, c'est l'eau.", ['cuisine', [e('table', 50, 2.4), e('bouteille', 42, 1.6, { c: '#7b3f00' }, 131), e('verre', 62, 1.6, {}, 131)]]],
  ["Quand on éternue, on met…", "son coude devant son nez et sa bouche", ["rien du tout", "sa main sur son voisin"], "Éternuer dans son <strong>coude</strong> évite d'envoyer des microbes sur les autres (et sur ses mains).", ['classe', [e('leo', 50, 1.4)]], { n: 1 }],
  ["Le sommeil sert…", "à reposer le corps et à grandir", ["à rien", "à avoir faim"], "Pendant le <strong>sommeil</strong>, le corps se repose, grandit, et le cerveau range ce qu'on a appris.", ['maison', [e('lit', 50, 2)]]],
  ["Pendant le sport, on boit…", "de l'eau", ["du soda", "rien"], "En bougeant, on transpire : il faut boire de l'<strong>eau</strong> pour remplacer celle qu'on perd.", ['parc', [e('garcon', 35, 1.4), e('ballon', 65, 1.4)]]],
  ["Pour protéger sa peau en plein soleil, on met…", "de la crème solaire et un chapeau", ["un manteau d'hiver", "rien du tout"], "Le soleil peut <strong>brûler</strong> la peau : crème solaire, chapeau, tee-shirt et ombre aux heures chaudes.", ['plage', [e('soleil', 80, 1.2, {}, 40), e('parasol', 40, 1.8)]]],
  ["Une <strong>dent définitive</strong> qu'on perd…", "ne repousse pas", ["repousse l'année suivante", "repousse toujours deux fois"], "Les dents de lait sont remplacées une seule fois : les dents <strong>définitives</strong> ne repoussent pas. Il faut en prendre soin !", ['maison', [e('dent', 50, 2.4)]], { n: 1 }],
  ["L'ensemble de nos os forme…", "le squelette", ["les muscles", "la peau"], "Nos os, plus de 200, forment le <strong>squelette</strong> : il soutient et protège le corps.", ['maison', [e('os', 50, 2.4)]], { n: 1 }],
  ["Les <strong>muscles</strong> servent à…", "faire bouger le corps", ["digérer seulement", "voir"], "Les <strong>muscles</strong> tirent sur les os et font bouger le corps.", ['parc', [e('garcon', 40, 1.4), e('ballon', 66, 1.4)]], { n: 1 }],
  ["Quand un enfant grandit, sa taille…", "augmente", ["diminue", "reste toujours pareille"], "Pendant la croissance, la taille <strong>augmente</strong> : on la mesure avec une toise ou un mètre.", ['maison', [e('leo', 40, 1.4), e('metre', 68, 1.8)]]],
  ["Quand on a de la <strong>fièvre</strong>, la température du corps est…", "plus haute que 38 °C", ["plus basse que 30 °C", "de 20 °C"], "Normalement, le corps est à environ 37 °C. Au-dessus de <strong>38 °C</strong>, on a de la fièvre.", ['maison', [e('lit', 50, 2), e('maman', 82, 1.2)]], { n: 1 }],
]);

/* ---------- Le cycle de vie ---------- */
plusCE(B_CYCLE, [
  ["Le petit de la vache s'appelle…", "le veau", ["le poulain", "l'agneau"], "Le petit de la vache est le <strong>veau</strong>.", ['ferme', [e('vache', 50, 1.8)]]],
  ["Le petit du cheval s'appelle…", "le poulain", ["le veau", "le chevreau"], "Le petit du cheval (et de la jument) est le <strong>poulain</strong>.", ['ferme', [e('cheval', 50, 1.8)]]],
  ["Le petit de la poule s'appelle…", "le poussin", ["le caneton", "le chaton"], "Le petit de la poule est le <strong>poussin</strong>.", ['ferme', [e('poule', 50, 2)]]],
  ["Le petit de la brebis s'appelle…", "l'agneau", ["le poulain", "le porcelet"], "Le petit de la brebis (et du bélier) est l'<strong>agneau</strong>.", ['ferme', [e('mouton', 50, 1.8)]]],
  ["Le petit de la cane s'appelle…", "le caneton", ["le poussin", "le lapereau"], "Le petit du canard est le <strong>caneton</strong>.", ['ferme', [e('mare', 50, 1.6), e('canard', 50, 1.6, {}, 175)]]],
  ["Avant de devenir papillon, la chenille s'enferme dans…", "une chrysalide", ["un nid", "une toile d'araignée"], "La chenille se transforme dans une <strong>chrysalide</strong> : c'est là qu'elle devient papillon.", ['jardin', [e('chenille', 50, 2.2)]], { n: 1 }],
  ["La grenouille pond ses œufs…", "dans l'eau", ["dans un nid d'oiseau", "dans la terre sèche"], "Les œufs de grenouille sont pondus dans l'<strong>eau</strong> : il en sort des têtards.", ['ferme', [e('mare', 50, 1.8), e('grenouille', 70, 1.6)]]],
  ["Le têtard respire…", "dans l'eau, comme un poisson", ["hors de l'eau, comme un chat", "il ne respire pas"], "Le têtard vit dans l'eau et respire avec des branchies, <strong>comme un poisson</strong>. La grenouille adulte respirera de l'air.", ['ferme', [e('mare', 50, 1.8), e('tetard', 50, 1.6, {}, 185)]], { n: 1 }],
  ["Le papillon pond…", "des œufs", ["des chenilles déjà grandes", "des graines"], "Le papillon pond des <strong>œufs</strong> sur les feuilles ; il en sortira de petites chenilles.", ['jardin', [e('papillon', 40, 2, {}, 100), e('fleur', 65, 2)]]],
  ["En grandissant, le chiot devient…", "un chien", ["un chat", "un loup"], "Le chiot est le petit du <strong>chien</strong> : il lui ressemble déjà, il grandit sans métamorphose.", ['jardin', [e('niche', 50, 2)]]],
  ["Un pépin de pomme est…", "une graine", ["une feuille", "une racine"], "Les pépins sont les <strong>graines</strong> du pommier : plantés, ils peuvent donner un nouvel arbre.", ['cuisine', [e('table', 50, 2.4), e('pommeCoupee', 50, 1.8, {}, 131)]]],
  ["Pour germer, une graine a besoin…", "d'eau et d'un peu de chaleur", ["de sel", "de bruit"], "Avec de l'<strong>eau</strong> et une température douce, la graine se réveille et germe.", ['jardin', [e('graine', 50, 2.4)]], { n: 1 }],
  ["Une jeune pousse se tourne vers…", "la lumière", ["le noir", "le sol"], "Les plantes poussent vers la <strong>lumière</strong>, dont elles ont besoin pour vivre.", ['maison', [e('fenetre', 30, 2), e('pousse', 66, 2)]], { n: 1 }],
  ["Le <strong>gland</strong> est la graine…", "du chêne", ["du pommier", "du sapin"], "Le gland est le fruit du <strong>chêne</strong> ; il contient sa graine.", ['foret', [e('arbre', 50, 1.8)]], { n: 1 }],
  ["Pour sortir de l'œuf, le poussin…", "casse la coquille avec son bec", ["ouvre une petite porte", "attend que la poule l'ouvre"], "Le poussin a une petite pointe sur le <strong>bec</strong> pour casser la coquille de l'intérieur.", ['ferme', [e('oeufs', 50, 2)]], { n: 1 }],
  ["Le chat est…", "vivipare", ["ovipare"], "Les chatons se développent dans le ventre de leur mère : le chat est <strong>vivipare</strong>.", ['maison', [e('chat', 50, 2)]], { n: 1 }],
  ["Le merle (un oiseau) est…", "ovipare", ["vivipare"], "Les oiseaux pondent des œufs : ils sont <strong>ovipares</strong>.", ['jardin', [e('arbre', 40, 1.8), e('oiseau', 70, 1.6, {}, 90)]], { n: 1 }],
  ["Les feuilles des arbres comme le chêne tombent…", "en automne", ["au printemps", "en été"], "En <strong>automne</strong>, les feuilles jaunissent et tombent ; les bourgeons repoussent au printemps.", ['foret', [e('arbre', 40, 1.8), e('feuilles', 70, 1.6, {}, 175)]]],
]);

/* ---------- Les chaînes alimentaires ---------- */
plusCE(B_CHAINE, [
  ["Le <strong>mouton</strong> est…", "herbivore", ["carnivore", "omnivore"], "Le mouton broute l'herbe : il est <strong>herbivore</strong>.", ['ferme', [e('mouton', 50, 1.8)]]],
  ["Le <strong>loup</strong> est…", "carnivore", ["herbivore", "omnivore"], "Le loup chasse d'autres animaux : il est <strong>carnivore</strong>.", ['foret', [e('loup', 50, 1.8)]]],
  ["Le <strong>cheval</strong> est…", "herbivore", ["carnivore", "omnivore"], "Le cheval mange de l'herbe, du foin, des céréales : il est <strong>herbivore</strong>.", ['ferme', [e('cheval', 50, 1.8)]]],
  ["Le <strong>cochon</strong> est…", "omnivore", ["herbivore", "carnivore"], "Le cochon mange de tout, plantes et petits animaux : il est <strong>omnivore</strong>.", ['ferme', [e('cochon', 50, 1.8)]], { n: 1 }],
  ["La <strong>chouette</strong> est…", "carnivore", ["herbivore", "omnivore"], "La chouette chasse la nuit des souris et des petits rongeurs : elle est <strong>carnivore</strong>.", ['nuit', [e('arbre', 40, 1.8), e('chouette', 62, 1.6, {}, 110)]]],
  ["L'<strong>ours brun</strong> mange des baies, du miel et des poissons. Il est…", "omnivore", ["herbivore", "carnivore"], "Des plantes (baies) et des animaux (poissons) : l'ours est <strong>omnivore</strong>.", ['foret', [e('ours', 50, 1.8)]], { n: 1 }],
  ["La <strong>girafe</strong> est…", "herbivore", ["carnivore", "omnivore"], "La girafe mange les feuilles en haut des arbres : elle est <strong>herbivore</strong>.", ['zoo', [e('girafe', 50, 1.8)]]],
  ["Complète la chaîne alimentaire (la flèche veut dire « est mangé par ») :<br><strong>herbe → ? → loup</strong>", "le mouton", ["le renard", "le poisson"], "L'herbe est mangée par le <strong>mouton</strong>, qui peut être mangé par le loup.", ['foret', [e('loup', 70, 1.6), e('buisson', 25, 1.6)]], { n: 1 }],
  ["Complète la chaîne alimentaire (la flèche veut dire « est mangé par ») :<br><strong>algues → petit poisson → ?</strong>", "le gros poisson", ["la vache", "la salade"], "Les petits poissons sont mangés par de plus <strong>gros poissons</strong>.", ['mer', [e('poisson', 50, 1.6, {}, 150)]]],
  ["Complète la chaîne alimentaire (la flèche veut dire « est mangé par ») :<br><strong>graines → ? → chat</strong>", "la souris", ["le lion", "la vache"], "La <strong>souris</strong> mange des graines, et le chat chasse les souris.", ['ferme', [e('grange', 40, 1.4), e('chat', 72, 1.6)]]],
  ["Complète la chaîne alimentaire (la flèche veut dire « est mangé par ») :<br><strong>herbe → vache → ?</strong>", "l'être humain", ["la salade", "la souris"], "La vache mange l'herbe, et l'<strong>être humain</strong> mange la viande de la vache (ou boit son lait).", ['ferme', [e('vache', 50, 1.8)]], { n: 1 }],
  ["Les plantes vertes…", "fabriquent leur propre nourriture", ["mangent des animaux", "mangent des cailloux"], "Avec la lumière, l'eau et l'air, les plantes <strong>fabriquent leur nourriture</strong> : c'est pour ça qu'elles sont au début des chaînes alimentaires.", ['jardin', [e('fleur', 40, 2), e('arbre', 72, 1.6)]], { n: 1 }],
  ["Les dents pointues du chat lui servent à…", "déchirer la viande", ["brouter l'herbe", "casser des noix"], "Les carnivores ont des dents <strong>pointues</strong> (les crocs) pour attraper et déchirer leurs proies.", ['maison', [e('chat', 50, 2)]], { n: 1 }],
  ["La vache a de grosses dents plates, qui lui servent à…", "écraser l'herbe", ["attraper des souris", "déchirer la viande"], "Les herbivores ont des dents <strong>plates</strong> pour broyer l'herbe longtemps.", ['ferme', [e('vache', 50, 1.8)]], { n: 1 }],
  ["Au potager, les escargots mangent les salades. Pour les protéger sans produit chimique, on peut accueillir…", "des hérissons", ["des pucerons", "des chenilles"], "Le <strong>hérisson</strong> mange les escargots : c'est un allié du jardinier.", ['jardin', [e('salade', 40, 1.6), e('escargot', 66, 1.6)]], { n: 1 }],
  ["Une chaîne alimentaire montre…", "qui mange qui", ["qui joue avec qui", "qui habite où"], "Une chaîne alimentaire montre <strong>qui mange qui</strong>, du végétal jusqu'au dernier animal.", ['foret', [e('lapin', 35, 1.6), e('renard', 68, 1.6)]]],
  ["Le <strong>ver de terre</strong> se nourrit…", "de feuilles mortes et de terre", ["de souris", "de poissons"], "Le ver de terre mange les feuilles mortes mêlées à la terre : il aide à les transformer en <strong>terreau</strong>.", ['jardin', [e('ver', 45, 2), e('feuilles', 70, 1.4, {}, 185)]], { n: 1 }],
  ["La <strong>coccinelle</strong> mange des pucerons. Elle est…", "carnivore", ["herbivore", "omnivore"], "Les pucerons sont de petits animaux : la coccinelle est <strong>carnivore</strong>.", ['jardin', [e('rosier', 45, 1.8), e('coccinelle', 70, 1.6)]], { n: 1 }],
]);

/* ---------- Les objets et le numérique ---------- */
plusCE(B_OBJETS, [
  ["À quoi sert un <strong>marteau</strong> ?", "à enfoncer des clous", ["à couper du papier", "à mesurer"], "Le <strong>marteau</strong> sert à taper sur les clous pour les enfoncer.", ['maison', [e('marteau', 50, 2.2)]]],
  ["À quoi sert une <strong>règle</strong> graduée ?", "à tracer des traits droits et à mesurer", ["à couper", "à coller"], "La règle sert à <strong>tracer</strong> des traits droits et à <strong>mesurer</strong> des longueurs.", ['classe', [e('pupitre', 50, 2.2), e('regle', 50, 1.6, {}, 150)]]],
  ["À quoi sert un <strong>réveil</strong> ?", "à sonner à l'heure choisie", ["à éclairer", "à chauffer"], "Le <strong>réveil</strong> indique l'heure et sonne au moment choisi.", ['maison', [e('reveil', 50, 2.2)]]],
  ["À quoi sert une <strong>pelle</strong> ?", "à creuser la terre ou le sable", ["à écrire", "à se laver"], "La <strong>pelle</strong> sert à creuser et à déplacer la terre, le sable, la neige.", ['jardin', [e('pelle', 50, 2.2)]]],
  ["À quoi sert un <strong>appareil photo</strong> ?", "à prendre des photos", ["à téléphoner", "à cuire"], "L'<strong>appareil photo</strong> enregistre des images.", ['parc', [e('appareilPhoto', 50, 2)]]],
  ["À quoi sert un <strong>réfrigérateur</strong> ?", "à garder les aliments au frais", ["à chauffer les plats", "à laver la vaisselle"], "Le froid du <strong>réfrigérateur</strong> conserve les aliments plus longtemps.", ['cuisine', [e('frigo', 50, 2)]]],
  ["À quoi sert une <strong>échelle</strong> ?", "à monter en hauteur", ["à couper du bois", "à mesurer"], "L'<strong>échelle</strong> permet de monter pour atteindre un endroit en hauteur.", ['jardin', [e('echelle', 50, 1.8)]]],
  ["Lequel est fabriqué par l'être humain ?", "une paire de ciseaux", ["un arbre", "un caillou"], "Les <strong>ciseaux</strong> sont un objet technique, fabriqué pour couper. L'arbre et le caillou sont naturels.", ['jardin', [e('ciseaux', 22, 1.8), e('arbre', 55, 1.6), e('pierre', 84, 2)]]],
  ["Lequel n'est <strong>pas</strong> fabriqué par l'être humain ?", "un rocher", ["une table", "un livre"], "Le <strong>rocher</strong> est naturel : personne ne l'a fabriqué.", ['montagne', [e('rocher', 25, 1.6), e('table', 58, 1.8), e('livre', 58, 1.2, {}, 131)]]],
  ["Les <strong>pédales</strong> d'un vélo servent à…", "faire tourner les roues avec les pieds", ["freiner", "éclairer la route"], "En appuyant sur les <strong>pédales</strong>, on fait tourner le pédalier, la chaîne… et la roue arrière.", ['route', [e('velo', 50, 1.6)]]],
  ["Une vitre de fenêtre est en…", "verre", ["bois", "tissu"], "La vitre est en <strong>verre</strong> : il laisse passer la lumière.", ['maison', [e('fenetre', 50, 2.2)]]],
  ["Une casserole est en métal parce que le métal…", "supporte la chaleur du feu", ["est mou", "fond tout de suite"], "Le métal <strong>résiste à la chaleur</strong> et la transmet bien aux aliments.", ['cuisine', [e('casserole', 50, 3)]], { n: 1 }],
  ["Un manteau d'hiver sert à…", "garder la chaleur du corps", ["refroidir", "faire de la lumière"], "Le manteau empêche la <strong>chaleur</strong> du corps de partir dans l'air froid.", ['neige', [e('manteau', 50, 2)]]],
  ["Sur un ordinateur, l'<strong>écran</strong> sert à…", "voir les images et le texte", ["écrire le texte", "imprimer"], "L'<strong>écran</strong> affiche ce que fait l'ordinateur ; on écrit avec le clavier.", ['classe', [e('ordinateur', 50, 2)]]],
  ["Pour aller sur Internet, un enfant…", "le fait avec un adulte", ["clique sur tout ce qu'il voit", "donne son adresse quand on la demande"], "Sur Internet, on est accompagné d'un <strong>adulte</strong>, qui aide à éviter les pièges.", ['maison', [e('tablette', 40, 2), e('maman', 70, 1.3)]]],
  ["Avant de mettre la photo d'un camarade sur Internet, il faut…", "lui demander son accord", ["ne rien lui dire", "la changer pour rire"], "Chacun a le droit de décider où l'on montre sa photo : on <strong>demande toujours l'accord</strong>.", ['parc', [e('appareilPhoto', 35, 1.8), e('lina', 68, 1.4)]], { n: 1 }],
  ["Un vieux jouet qui marche encore…", "peut être donné ou réparé", ["doit toujours être jeté", "devient dangereux"], "<strong>Donner</strong> ou <strong>réparer</strong> un objet évite de gaspiller et de faire des déchets.", ['maison', [e('boite', 50, 2)]], { n: 1 }],
  ["Une bouteille en plastique vide va…", "dans la poubelle de tri, pour être recyclée", ["dans la nature", "dans les toilettes"], "Le plastique se <strong>recycle</strong> : on le met dans la poubelle de tri.", ['cuisine', [e('bouteille', 50, 2.4)]]],
]);

/* ---------- Les circuits électriques ---------- */
plusCE(B_CIRCUIT, [
  ["Lequel fonctionne avec une <strong>pile</strong> ?", "une lampe de poche", ["un vélo", "un livre"], "La <strong>lampe de poche</strong> a une pile qui fournit l'électricité à son ampoule.", ['maison', [e('pile', 50, 2.4)]]],
  ["Les fils électriques sont entourés de plastique pour…", "protéger et empêcher de toucher le métal", ["les rendre jolis seulement", "faire passer le courant"], "Le plastique ne laisse pas passer le courant : c'est un <strong>isolant</strong> qui protège.", ['maison', [e('prise', 50, 2.4)]], { n: 1 }],
  ["Lequel laisse passer le courant électrique ?", "une clé en métal", ["une gomme", "un bout de bois"], "Les <strong>métaux</strong> laissent passer le courant : ce sont des conducteurs.", ['classe', [e('pile', 35, 2), e('ampoule', 65, 2)]], { n: 1 }],
  ["Lequel ne laisse <strong>pas</strong> passer le courant électrique ?", "une règle en plastique", ["un trombone en métal", "une pièce de monnaie"], "Le <strong>plastique</strong> ne laisse pas passer le courant : c'est un isolant.", ['classe', [e('pile', 35, 2), e('ampoule', 65, 2)]], { n: 1 }],
  ["Une ampoule allumée donne…", "de la lumière et un peu de chaleur", ["de l'eau", "du vent"], "L'ampoule transforme l'électricité en <strong>lumière</strong>, et un peu en chaleur.", ['maison', [e('ampoule', 50, 2.6, { n: true })]]],
  ["Quand la pile est usée, l'ampoule…", "s'éteint ou brille faiblement", ["brille plus fort", "change de couleur"], "Une pile usée ne fournit plus assez d'électricité : l'ampoule <strong>faiblit</strong> puis s'éteint.", ['classe', [e('pile', 35, 2), e('ampoule', 65, 2)]]],
  ["Une pile usagée se jette…", "dans un bac de collecte spécial", ["dans la poubelle de la cuisine", "dans la nature"], "Les piles contiennent des produits qui <strong>polluent</strong> : on les dépose dans un bac de collecte (au supermarché, à l'école…).", ['maison', [e('pile', 50, 2.4)]], { n: 1 }],
  ["L'interrupteur de la classe sert à…", "allumer et éteindre la lumière", ["ouvrir la porte", "chauffer la classe"], "L'<strong>interrupteur</strong> ferme le circuit (la lumière s'allume) ou l'ouvre (elle s'éteint).", ['classe', [e('tableauNoir', 50, 1.6)]]],
  ["Pour allumer une ampoule avec une pile, il faut relier…", "l'ampoule aux deux bornes de la pile", ["l'ampoule à une seule borne", "l'ampoule à une prise de la maison"], "Le courant doit faire une <strong>boucle</strong> : il sort par une borne, traverse l'ampoule et revient par l'autre.", ['classe', [e('pile', 35, 2), e('ampoule', 65, 2)]], { n: 1 }],
  ["Lequel a un petit moteur électrique ?", "une voiture télécommandée", ["un ballon", "une poupée en tissu"], "La voiture télécommandée a des <strong>piles</strong> et un moteur qui fait tourner ses roues.", ['maison', [e('voiture', 30, .8), e('ballon', 55, 1.3), e('poupee', 80, 1.3)]], { n: 1 }],
  ["Il ne faut jamais…", "mettre un objet dans une prise électrique", ["allumer une lampe de poche", "changer une pile avec un adulte"], "Le courant des <strong>prises</strong> peut tuer : on n'y met jamais ni doigt ni objet.", ['maison', [e('prise', 50, 2.4)]]],
  ["Les éclairs d'un orage sont…", "de l'électricité très dangereuse", ["de l'eau", "de la lumière sans danger"], "L'éclair est une énorme décharge d'<strong>électricité</strong> : pendant l'orage, on s'abrite dans un bâtiment.", ['ciel', [e('nuage', 50, 2, {}, 70)]], { n: 1 }],
]);

/* ---------- Les mécanismes ---------- */
plusCE(B_MECA, [
  ["Les <strong>roues</strong> servent à…", "faire rouler les objets facilement", ["couper", "éclairer"], "Grâce aux <strong>roues</strong>, on déplace des charges lourdes en les faisant rouler.", ['jardin', [e('brouette', 50, 2)]]],
  ["Une <strong>paire de ciseaux</strong> est faite de…", "deux leviers", ["deux roues", "une poulie"], "Chaque lame est un <strong>levier</strong> qui tourne autour de la vis du milieu.", ['classe', [e('ciseaux', 50, 2.4)]], { n: 1 }],
  ["Une <strong>grue</strong> soulève des charges très lourdes grâce…", "à des câbles et des poulies", ["à des ballons", "à des ressorts de lit"], "Les câbles passent dans des <strong>poulies</strong> : un moteur enroule le câble et la charge monte.", ['rue', [e('maison', 50, 1.4)]], { n: 1 }],
  ["Sur une balançoire à bascule, le point d'appui est…", "au milieu", ["au bout", "sous un siège"], "La planche tourne autour du <strong>point d'appui</strong>, placé au milieu.", ['parc', [e('bascule', 50, 2)]]],
  ["Une brouette permet de transporter…", "des charges lourdes plus facilement", ["seulement de l'eau", "des personnes très vite"], "La brouette est un <strong>levier</strong> avec une roue : on soulève facilement une lourde charge.", ['jardin', [e('brouette', 50, 2)]]],
  ["Pour casser une noix facilement, on utilise…", "un casse-noix", ["une règle", "une cuillère"], "Le <strong>casse-noix</strong> est un levier : il multiplie la force de la main.", ['cuisine', [e('table', 50, 2.4), e('bol', 50, 1.6, {}, 131)]]],
  ["Une grande roue dentée fait 1 tour. La petite roue, deux fois plus petite, qui s'engrène avec elle, fait…", "2 tours", ["1 tour", "un demi-tour"], "La petite roue a deux fois moins de dents : elle doit faire <strong>2 tours</strong> pendant que la grande en fait 1.", ['maison', [e('roueDentee', 40, 2.2), e('roueDentee', 70, 1.2)]], { n: 1 }],
  ["Pour remonter le seau d'un puits, on tourne…", "une manivelle", ["une pédale", "un interrupteur"], "La <strong>manivelle</strong> fait tourner le treuil, qui enroule la corde.", ['ferme', [e('seau', 50, 2)]], { n: 1 }],
  ["Une poignée de porte, un robinet, une clé dans une serrure : pour s'en servir, on les fait…", "tourner", ["glisser", "sauter"], "Ces objets <strong>tournent</strong> autour d'un axe.", ['maison', [e('porte', 50, 1.8)]]],
  ["Une <strong>pince à linge</strong> est…", "un levier", ["une roue", "une poulie"], "En appuyant au bout, on ouvre la pince : chaque branche est un <strong>levier</strong>.", ['jardin', [e('filLinge', 50, 2)]], { n: 1 }],
  ["Pour ouvrir une porte lourde en poussant le moins fort possible, on pousse…", "loin des gonds, du côté de la poignée", ["tout près des gonds", "au milieu du sol"], "Plus on pousse <strong>loin de l'axe</strong> (les gonds), moins il faut de force.", ['maison', [e('porte', 50, 1.8)]], { n: 1 }],
  ["Un tourniquet du parc…", "tourne autour d'un axe", ["avance en ligne droite", "monte et descend"], "Le tourniquet <strong>tourne</strong> autour de son axe, au centre.", ['parc', [e('tourniquet', 50, 2)]]],
]);

/* ---------- La sécurité à la maison ---------- */
plusCE(B_SECU, [
  ["On ne touche pas la porte d'un four chaud, parce que…", "on peut se brûler", ["elle est sale", "elle est fragile"], "Le four devient très <strong>chaud</strong> : on peut se brûler gravement.", ['cuisine', [e('cuisinier', 50, 1.3)]]],
  ["Pour sortir un plat chaud du four, un adulte prend…", "des gants de cuisine", ["ses doigts", "un torchon mouillé"], "Les <strong>gants de cuisine</strong> protègent de la chaleur. (Un tissu mouillé, lui, laisse passer la chaleur !)", ['cuisine', [e('casserole', 50, 2.6)]], { n: 1 }],
  ["On s'est un peu brûlé le doigt. On met la brûlure…", "sous l'eau froide", ["sous l'eau très chaude", "au soleil"], "L'<strong>eau froide</strong> pendant plusieurs minutes calme la brûlure. Ensuite, on prévient un adulte.", ['cuisine', [e('verreEau', 50, 2.2)]], { n: 1 }],
  ["Les allumettes et les briquets…", "ne sont pas des jouets", ["sont des jouets", "servent à éclairer la chambre"], "Le feu peut se propager très vite : allumettes et briquets <strong>ne sont pas des jouets</strong>.", ['maison', [e('table', 50, 2.4), e('bougie', 50, 1.6, {}, 131)]]],
  ["Il y a de la fumée dans la maison. Il faut…", "sortir vite et faire appeler les pompiers", ["se cacher sous le lit", "aller chercher ses jouets"], "On <strong>sort</strong> tout de suite, sans revenir chercher ses affaires, et on fait appeler le 18 ou le 112.", ['maison', [e('fenetre', 50, 2)]]],
  ["Dans une pièce pleine de fumée, on se déplace…", "à quatre pattes, près du sol", ["debout sur une chaise", "en courant les yeux fermés"], "La fumée monte : l'air est moins toxique <strong>près du sol</strong>.", ['maison', [e('porte', 50, 1.8)]], { n: 1 }],
  ["Les produits ménagers se rangent…", "en hauteur, hors de portée des enfants", ["par terre", "dans le frigo avec les jus"], "On les range <strong>en hauteur</strong> ou dans un placard fermé, pour que les petits ne puissent pas les attraper.", ['maison', [e('etagere', 50, 1.8)]]],
  ["On a avalé un produit dangereux par erreur. Il faut…", "prévenir tout de suite un adulte", ["attendre sans rien dire", "boire du soda"], "On prévient <strong>tout de suite</strong> un adulte, qui appellera le centre antipoison ou le 15.", ['maison', [e('flacon', 50, 2.2, { n: 'tete' })]]],
  ["Le casque à vélo sert à…", "protéger la tête en cas de chute", ["avoir chaud", "écouter de la musique"], "En cas de chute, le <strong>casque</strong> protège la tête.", ['route', [e('velo', 50, 1.6)]]],
  ["Pour traverser la rue, on passe…", "sur le passage piéton", ["n'importe où", "entre deux voitures garées"], "Sur le <strong>passage piéton</strong>, les conducteurs s'attendent à voir des piétons.", ['rue', [e('lina', 50, 1.4)]]],
  ["Avant de traverser, on regarde…", "à gauche, à droite, puis encore à gauche", ["seulement devant soi", "son téléphone"], "On regarde des <strong>deux côtés</strong>, et on traverse quand aucune voiture n'arrive.", ['rue', [e('leo', 50, 1.4)]]],
  ["Le feu des piétons est rouge. On…", "attend", ["traverse en courant", "traverse doucement"], "Feu <strong>rouge</strong> : on attend que le petit bonhomme passe au vert.", ['rue', [e('lina', 40, 1.4), e('voiture', 75, .7)]]],
  ["En voiture, un enfant doit…", "être attaché, dans un siège adapté", ["rester debout", "s'asseoir sans ceinture"], "La <strong>ceinture</strong> et le siège adapté protègent en cas de freinage brusque ou d'accident.", ['route', [e('voiture', 50, 1)]]],
  ["Au bord de la piscine, peut-on courir ?", "Non, on peut glisser et tomber", ["Oui, c'est plus rapide"], "Le sol mouillé <strong>glisse</strong> : on marche au bord du bassin.", ['piscine', [e('plongeoir', 60, 1.4)]]],
  ["Quand on appelle les secours, on dit…", "son nom, l'adresse et ce qui se passe", ["seulement « au secours », puis on raccroche", "rien du tout"], "Les secours ont besoin de savoir <strong>qui</strong> appelle, <strong>où</strong> venir et <strong>ce qui se passe</strong>. On raccroche seulement quand ils le disent.", ['maison', [e('telephone', 50, 2.2)]], { n: 1 }],
  ["Un chien qu'on ne connaît pas…", "on ne le caresse pas sans demander à son maître", ["on le caresse tout de suite", "on lui tire la queue"], "Un chien inconnu peut avoir peur et mordre : on <strong>demande d'abord</strong> à son maître.", ['rue', [e('chien', 50, 1.8)]]],
  ["Les personnes sourdes ou malentendantes peuvent appeler les secours par SMS au…", 114, null, "Le <strong>114</strong> reçoit les SMS d'urgence des personnes qui ne peuvent pas parler ou entendre au téléphone.", ['maison', [e('telephone', 50, 2.2)]], { n: 1, v: "Les personnes sourdes ou malentendantes peuvent appeler les secours par message, à quel numéro ?" }],
]);

/* ---------- La Terre et le Soleil ---------- */
plusCE(B_TERRE, [
  ["Le Soleil se couche…", "à l'ouest", ["à l'est", "au nord"], "Le Soleil se lève à l'est et se couche à l'<strong>ouest</strong>.", ['montagne', [e('soleil', 50, 1.4, {}, 150)]]],
  ["Vers midi, le Soleil est…", "au plus haut dans le ciel", ["caché sous la Terre", "tout près de l'horizon"], "Vers le milieu de la journée, le Soleil atteint sa position <strong>la plus haute</strong>.", ['jardin', [e('arbre', 40, 1.6)]]],
  ["En été, en France, les jours sont…", "plus longs que les nuits", ["plus courts que les nuits", "de 6 heures seulement"], "En été, le Soleil se lève tôt et se couche tard : les jours sont <strong>plus longs</strong> que les nuits.", ['plage', [e('parasol', 50, 1.8)]]],
  ["Combien y a-t-il de saisons dans une année ?", 4, null, "Printemps, été, automne, hiver : <strong>4</strong> saisons.", ['jardin', [e('pommier', 50, 1.8)]], { v: "Combien y a-t-il de saisons dans une année ?" }],
  ["Combien d'heures dure une journée entière (le jour et la nuit) ?", 24, null, "La Terre fait un tour sur elle-même en <strong>24 heures</strong>.", ['maison', [e('reveil', 50, 2.2)]], { n: 1, u: 'h', v: "Combien d'heures dure une journée entière, le jour et la nuit ?" }],
  ["La Terre a la forme…", "d'une boule", ["d'une assiette plate", "d'un cube"], "La Terre est une grosse <strong>boule</strong> : on le voit sur les photos prises depuis l'espace.", ['ciel', [e('nuage', 50, 1.6, {}, 80)]]],
  ["L'étoile la plus proche de la Terre est…", "le Soleil", ["la Lune", "Mars"], "Le <strong>Soleil</strong> est une étoile, et c'est la plus proche de nous. La Lune n'est pas une étoile, et Mars est une planète.", ['nuit', [e('maison', 50, 1.4)]], { n: 1 }],
  ["Au cours d'un mois, la forme éclairée de la Lune change : ce sont…", "les phases de la Lune", ["les saisons de la Lune", "les éclipses"], "Pleine lune, croissant… : ce sont les <strong>phases</strong> de la Lune.", ['nuit', [e('lune', 50, 1.6, {}, 70)]], { n: 1 }],
  ["Ton ombre se trouve…", "du côté opposé au Soleil", ["du côté du Soleil", "toujours devant toi"], "Ton corps arrête la lumière : l'ombre se forme <strong>de l'autre côté</strong> que le Soleil.", ['parc', [e('leo', 50, 1.4)]], { n: 1 }],
  ["Le matin, quand le Soleil est bas, ton ombre est…", "longue", ["courte", "absente"], "Soleil bas = ombre <strong>longue</strong> ; Soleil haut (midi) = ombre courte.", ['parc', [e('lina', 50, 1.4)]], { n: 1 }],
  ["La Terre tourne autour…", "du Soleil", ["de la Lune", "de Mars"], "La Terre fait le tour du <strong>Soleil</strong> en un an.", ['nuit', [e('lune', 70, 1.2, {}, 60)]]],
  ["Pour aller dans l'espace, les astronautes partent dans…", "une fusée", ["un avion", "un bateau"], "Seule une <strong>fusée</strong> est assez puissante pour quitter l'atmosphère.", ['ciel', [e('nuage', 40, 1.4, {}, 90)]]],
  ["Les étoiles, on les voit…", "la nuit", ["seulement à midi", "jamais"], "Les étoiles sont toujours là, mais le jour la lumière du Soleil les cache : on les voit <strong>la nuit</strong>.", ['rue', [e('maison', 50, 1.4)]]],
  ["Une année compte…", "12 mois", ["7 mois", "24 mois"], "De janvier à décembre : <strong>12 mois</strong>.", ['classe', [e('tableauNoir', 50, 1.6)]]],
  ["Combien de jours compte une semaine ?", 7, null, "Du lundi au dimanche : <strong>7 jours</strong>.", ['classe', [e('tableauNoir', 50, 1.6)]], { u: 'jours' }],
  ["On ne regarde jamais le Soleil directement, parce que…", "cela abîme les yeux", ["il est trop loin pour être vu", "cela fait éternuer"], "La lumière du Soleil est si forte qu'elle peut <strong>brûler les yeux</strong>, même avec des lunettes de soleil.", ['plage', [e('lunettesSoleil', 50, 2)]]],
]);

/* ============================================================
   MNEMOSCIENCES — LES SCHÉMAS À LA CRAIE (CM, 6e – 5e, 4e – 3e)
   Un schéma par notion, réutilisé pour les questions de la notion ; aucun ne porte de légende qui donnerait la réponse.
   SCHEMA_NOTION : pour chaque notion, le schéma par défaut, puis des règles [mot-clé de l'énoncé, schéma].
   ------------------------------------------------------------ */
const sch = (s, label, w = 380, h = 240) => svgArdoise(w, h, s, label);
const fleche = (x1, y1, x2, y2, c = CRAIE) => { const a = Math.atan2(y2 - y1, x2 - x1), p = (d) => `${(x2 - 10 * Math.cos(a + d)).toFixed(1)} ${(y2 - 10 * Math.sin(a + d)).toFixed(1)}`; return ligne(x1, y1, x2, y2, c, 3) + `<path d="M${x2} ${y2} L${p(0.45)} L${p(-0.45)} Z" fill="${c}"/>`; };
const rond = (x, y, r, c = CRAIE, f = 'none', w = 3) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" stroke="${c}" stroke-width="${w}"/>`;
const chemin = (d, c = CRAIE, w = 3, f = 'none') => `<path d="${d}" fill="${f}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const silhouette = (x, y, k = 1) => chemin(`M${x} ${y - 150 * k} m-18 0 a18 18 0 1 0 36 0 a18 18 0 1 0 -36 0 M${x - 34 * k} ${y - 112 * k} Q${x} ${y - 124 * k} ${x + 34 * k} ${y - 112 * k} L${x + 40 * k} ${y - 40 * k} M${x - 34 * k} ${y - 112 * k} L${x - 40 * k} ${y - 40 * k} M${x - 24 * k} ${y - 110 * k} L${x - 22 * k} ${y - 30 * k} L${x - 16 * k} ${y} M${x + 24 * k} ${y - 110 * k} L${x + 22 * k} ${y - 30 * k} L${x + 16 * k} ${y}`, CRAIE, 2.4);
const becher = (x, y, w = 60, h = 80, eau = 0.6, c = BLEU) => chemin(`M${x - w / 2} ${y - h} L${x - w / 2} ${y} L${x + w / 2} ${y} L${x + w / 2} ${y - h}`) + `<rect x="${x - w / 2 + 3}" y="${y - h * eau}" width="${w - 6}" height="${h * eau - 3}" fill="${c}" opacity=".45"/>`;

const SCHEMAS = {
  /* ---------- matière ---------- */
  familles: () => sch(chemin('M50 190 L50 120 L60 105 L60 90 L70 90 L70 105 L80 120 L80 190 Z', CRAIE) + chemin('M120 190 L130 120 L160 120 L170 190 Z', BLEU) + chemin('M205 190 L215 110 L245 110 L255 190 Z M205 150 L255 150', JAUNE) + `<ellipse cx="310" cy="175" rx="38" ry="16" fill="none" stroke="#c9a26b" stroke-width="3"/>` + chemin('M290 170 l40 0 M296 180 l30 0', '#c9a26b', 2), 'Des objets faits de matériaux différents'),
  aimant: () => sch(chemin('M120 70 L120 150 Q120 200 170 200 Q220 200 220 150 L220 70 L190 70 L190 150 Q190 172 170 172 Q150 172 150 150 L150 70 Z', ROUGE, 3, 'none') + `<rect x="120" y="60" width="30" height="14" fill="${CRAIE}"/><rect x="190" y="60" width="30" height="14" fill="${CRAIE}"/>` + chemin('M290 90 l0 60 q0 10 10 10 l10 0 q10 0 10 -10 l0 -50 q0 -8 -8 -8 l-4 0 q-8 0 -8 8 l0 40', CRAIE, 2.4) + rond(70, 150, 22, JAUNE) + txt(170, 228, '?', { taille: 18, gras: true, c: JAUNE }), 'Un aimant en fer à cheval, un trombone et une pièce'),
  testeur: () => sch(ligne(50, 70, 50, 105) + ligne(50, 145, 50, 200) + ligne(42, 105, 78, 105, CRAIE, 4) + ligne(50, 145, 70, 145, CRAIE, 8) + ligne(50, 70, 170, 70) + rond(190, 70, 18) + ligne(208, 70, 330, 70) + ligne(330, 70, 330, 200) + ligne(330, 200, 230, 200) + ligne(150, 200, 50, 200) + rond(230, 200, 5, JAUNE, JAUNE) + rond(150, 200, 5, JAUNE, JAUNE) + `<rect x="160" y="188" width="60" height="24" rx="4" fill="none" stroke="${JAUNE}" stroke-width="3" stroke-dasharray="6 4"/>` + txt(190, 232, 'objet à tester', { taille: 13, c: JAUNE }), 'Un circuit avec une pile, une lampe et un objet à tester entre deux pinces'),
  melanges: () => sch(becher(110, 200, 90, 120, 0.7, BLEU) + becher(270, 200, 90, 120, 0.7, BLEU) + `<rect x="230" y="178" width="80" height="19" fill="#c9a26b" opacity=".85"/>` + [240, 256, 272, 290].map((x) => rond(x, 160, 2, '#c9a26b', '#c9a26b', 1)).join(''), 'Deux verres : l\'un d\'aspect uniforme, l\'autre avec des grains au fond'),
  filtration: () => sch(chemin('M140 40 L240 40 L200 110 L200 140 L180 140 L180 110 Z', CRAIE) + chemin('M150 46 L230 46 L190 108 Z', JAUNE, 2) + `<rect x="160" y="50" width="60" height="10" fill="#c9a26b" opacity=".8"/>` + becher(190, 220, 90, 70, 0.4, BLEU) + chemin('M190 145 l0 8 M190 160 l0 8', BLEU, 3), 'Un entonnoir avec un filtre au-dessus d\'un récipient'),
  decantation: () => sch(becher(190, 210, 110, 160, 0.85, '#8fb4d8') + `<rect x="138" y="178" width="104" height="29" fill="#c9a26b" opacity=".9"/>` + [150, 175, 200, 225].map((x, i) => rond(x, 150 + (i % 2) * 10, 2.5, '#c9a26b', '#c9a26b', 1)).join(''), 'Un récipient d\'eau boueuse laissé au repos'),
  evaporation: () => sch(chemin('M110 120 Q190 150 270 120', CRAIE) + `<path d="M115 122 Q190 146 265 122 Z" fill="${BLEU}" opacity=".4"/>` + ligne(130, 135, 120, 200) + ligne(250, 135, 260, 200) + chemin('M170 200 Q178 170 190 182 Q196 160 206 184 Q214 172 212 200 Z', ROUGE, 2.4) + [150, 190, 230].map((x) => chemin(`M${x} 100 q-6 -10 0 -20 q6 -10 0 -20`, '#aeb6bf', 2.4)).join(''), 'Un récipient d\'eau salée chauffé : l\'eau part en vapeur'),
  energies: () => sch(`<circle cx="70" cy="70" r="26" fill="${JAUNE}"/>` + [0, 45, 90, 135, 180, 225, 270, 315].map((a) => ligne(70 + 32 * Math.cos(a * Math.PI / 180), 70 + 32 * Math.sin(a * Math.PI / 180), 70 + 44 * Math.cos(a * Math.PI / 180), 70 + 44 * Math.sin(a * Math.PI / 180), JAUNE, 3)).join('') + ligne(190, 200, 190, 90) + [-90, 30, 150].map((a) => ligne(190, 90, 190 + 46 * Math.cos(a * Math.PI / 180), 90 + 46 * Math.sin(a * Math.PI / 180), CRAIE, 4)).join('') + rond(190, 90, 5, CRAIE, CRAIE) + chemin('M250 200 L262 110 L300 110 L312 200 Z', CRAIE) + `<rect x="314" y="150" width="50" height="50" fill="${BLEU}" opacity=".5"/>` + chemin('M228 200 L248 200', BLEU, 4) + chemin('M30 200 L120 200 M150 200 L230 200', CRAIE, 2), 'Le soleil, une éolienne, un barrage'),
  fossiles: () => sch(chemin('M70 200 L100 60 L130 200 M80 150 L120 150 M88 110 L112 110 M100 60 L100 40', CRAIE) + chemin('M100 40 L150 60', CRAIE, 2) + `<rect x="160" y="150" width="40" height="50" rx="4" fill="none" stroke="${JAUNE}" stroke-width="3"/>` + ligne(160, 165, 200, 165, JAUNE, 2) + chemin('M240 200 L270 150 L300 170 L330 140 L360 200 Z', CRAIE, 3, '#2b2118') + chemin('M20 200 L370 200', CRAIE, 2), 'Un derrick de pétrole, un baril et un tas de charbon'),
  chaineEnergie: () => sch(`<rect x="20" y="90" width="90" height="60" rx="8" fill="none" stroke="${CRAIE}" stroke-width="3"/><rect x="145" y="90" width="90" height="60" rx="8" fill="none" stroke="${CRAIE}" stroke-width="3"/><rect x="270" y="90" width="90" height="60" rx="8" fill="none" stroke="${CRAIE}" stroke-width="3"/>` + fleche(112, 120, 142, 120, JAUNE) + fleche(237, 120, 267, 120, JAUNE) + `<rect x="55" y="104" width="20" height="34" fill="${CRAIE}"/>` + rond(190, 116, 14, JAUNE, JAUNE) + [0, 60, 120, 180, 240, 300].map((a) => ligne(315 + 14 * Math.cos(a * Math.PI / 180), 120 + 14 * Math.sin(a * Math.PI / 180), 315 + 24 * Math.cos(a * Math.PI / 180), 120 + 24 * Math.sin(a * Math.PI / 180), JAUNE, 3)).join(''), 'Trois cases reliées par des flèches : une pile, une ampoule, de la lumière'),
  signaux: () => sch(chemin('M60 200 L70 90 L90 90 L100 200 Z M64 140 L96 140', CRAIE) + chemin('M70 90 L80 70 L90 90', JAUNE) + chemin('M100 80 L160 60 M100 90 L160 100', JAUNE, 2) + chemin('M190 130 L210 130 L230 110 L230 170 L210 150 L190 150 Z', CRAIE) + [0, 1, 2].map((i) => chemin(`M${245 + i * 12} ${120 - i * 6} q10 20 0 40`, CRAIE, 2.4)).join('') + ligne(320, 200, 320, 110) + chemin('M300 200 L320 110 L340 200', CRAIE, 2) + [0, 1, 2].map((i) => chemin(`M${330 + i * 8} ${100 - i * 8} q12 -12 24 0`, BLEU, 2)).join(''), 'Un phare, un haut-parleur et une antenne'),
  trajectoires: () => sch([40, 70, 100, 130, 160].map((x) => rond(x, 70, 6, CRAIE, CRAIE)).join('') + rond(270, 110, 60, CRAIE, 'none', 1.5).replace('stroke-width="1.5"', 'stroke-width="1.5" stroke-dasharray="4 6"') + [0, 1, 2, 3, 4].map((i) => { const a = -Math.PI / 2 + i * 0.6; return rond(270 + 60 * Math.cos(a), 110 + 60 * Math.sin(a), 6, JAUNE, JAUNE); }).join('') + [0, 1, 2, 3, 4, 5].map((i) => { const t = i / 5; return rond(40 + t * 160, 210 - 140 * t * (1 - t) * 1.6, 6, ROSE, ROSE); }).join(''), 'Trois trajectoires : une droite, un cercle, une courbe'),
  /* ---------- vivant ---------- */
  groupes: () => sch(`<ellipse cx="190" cy="120" rx="170" ry="100" fill="none" stroke="${CRAIE}" stroke-width="3"/><ellipse cx="140" cy="125" rx="90" ry="65" fill="none" stroke="${JAUNE}" stroke-width="3"/><ellipse cx="270" cy="125" rx="60" ry="50" fill="none" stroke="${BLEU}" stroke-width="3"/>` + [[110, 110], [150, 140], [170, 100], [260, 115], [285, 140], [340, 70], [60, 190]].map(([x, y]) => rond(x, y, 6, CRAIE, CRAIE)).join(''), 'Des groupes emboîtés : des ensembles dans des ensembles'),
  digestif: () => sch(silhouette(190, 230, 1.3) + chemin('M190 52 L190 95 Q215 100 215 120 Q215 140 190 140 Q170 140 172 150 Q170 170 200 168 Q220 170 210 180 Q180 186 172 176 Q160 160 150 170 L150 200 Q190 210 228 200 L228 165', ROSE, 4), 'Le corps humain et le trajet des aliments, sans légende'),
  decompo: () => sch(`<rect x="0" y="120" width="380" height="120" fill="#5d4037" opacity=".55"/><rect x="0" y="120" width="380" height="30" fill="#3b2a20" opacity=".7"/>` + [[60, 112], [100, 116], [150, 110], [230, 114], [300, 112]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="14" ry="6" fill="#e67e22" opacity=".9"/>`).join('') + chemin('M80 190 q20 -14 40 0 q20 14 40 0', '#d98880', 7) + chemin('M280 120 L280 96 M262 96 Q280 70 298 96 Z', CRAIE, 3, '#c9a26b') + [200, 220, 240].map((x) => rond(x, 200, 3, CRAIE, CRAIE, 1)).join(''), 'Une coupe du sol : feuilles mortes, humus, ver de terre, champignon'),
  respiration: () => sch(silhouette(190, 230, 1.3) + chemin('M190 52 L190 88 M190 88 L172 100 M190 88 L208 100', CRAIE, 3) + `<path d="M150 98 Q140 140 152 170 Q172 176 180 160 L182 104 Q170 92 150 98 Z" fill="${ROSE}" opacity=".55" stroke="${ROSE}" stroke-width="2"/><path d="M230 98 Q240 140 228 170 Q208 176 200 160 L198 104 Q210 92 230 98 Z" fill="${ROSE}" opacity=".55" stroke="${ROSE}" stroke-width="2"/>` + `<path d="M196 140 q-12 -14 -4 -22 q8 -6 14 4 q6 -10 14 -4 q8 8 -4 22 l-10 12 Z" fill="${ROUGE}" opacity=".8"/>`, 'Le corps humain : les poumons et le cœur, sans légende'),
  circulation: () => sch(`<path d="M190 150 q-30 -36 -10 -54 q20 -14 28 8 q8 -22 28 -8 q20 18 -10 54 l-18 22 Z" fill="${ROUGE}" opacity=".85"/>` + chemin('M200 96 Q200 40 120 40 Q60 40 60 120 Q60 200 140 200 Q180 200 186 168', ROUGE, 4) + chemin('M214 168 Q220 200 260 200 Q330 200 330 120 Q330 40 260 40 Q216 40 214 96', BLEU, 4) + fleche(100, 44, 80, 50, ROUGE) + fleche(320, 160, 314, 176, BLEU), 'Le cœur et le circuit du sang, sans légende'),
  croissance: () => sch([[80, 0.7], [180, 0.95], [290, 1.25]].map(([x, k]) => silhouette(x, 220, k)).join('') + chemin('M30 225 L350 225', CRAIE, 2), 'Trois silhouettes de plus en plus grandes'),
  fossile: () => sch(`<rect x="0" y="40" width="380" height="50" fill="#c9a26b" opacity=".35"/><rect x="0" y="90" width="380" height="60" fill="#a0522d" opacity=".35"/><rect x="0" y="150" width="380" height="90" fill="#8d6e63" opacity=".4"/>` + chemin('M190 120 m-22 0 a22 22 0 1 0 44 0 a22 22 0 1 0 -44 0 M190 120 a14 14 0 1 1 -14 -10 a8 8 0 1 1 6 8', CRAIE, 2.4) + chemin('M90 190 l20 -10 l20 10 l20 -10 l20 10 M100 190 l0 -12 M120 184 l0 -12', CRAIE, 2), 'Des couches de roche avec des fossiles'),
  biodiv: () => sch(ligne(70, 200, 70, 120, '#c9a26b', 6) + rond(70, 100, 40, VERT, VERT, 2) + chemin('M150 200 L150 150 M150 150 q-10 -10 0 -20 q10 10 0 20', VERT) + rond(150, 128, 8, ROSE, ROSE) + chemin('M220 110 q10 -10 20 0 q10 -10 20 0', CRAIE, 2.4) + `<ellipse cx="300" cy="190" rx="16" ry="8" fill="${ROUGE}"/>` + chemin('M240 170 q10 -14 22 0 q10 -14 22 0', JAUNE, 2) + chemin('M20 200 L360 200', CRAIE, 2), 'Un arbre, une fleur, un oiseau, des insectes : la diversité du vivant'),
  /* ---------- technique et Terre ---------- */
  lampe: () => sch(`<rect x="60" y="100" width="180" height="50" rx="10" fill="none" stroke="${CRAIE}" stroke-width="3"/>` + chemin('M240 95 L290 75 L290 175 L240 155 Z', CRAIE) + rond(270, 125, 14, JAUNE, JAUNE) + `<rect x="80" y="110" width="50" height="30" fill="none" stroke="${JAUNE}" stroke-width="2.4"/><rect x="140" y="110" width="50" height="30" fill="none" stroke="${JAUNE}" stroke-width="2.4"/>` + `<rect x="200" y="88" width="20" height="12" fill="${ROSE}"/>`, 'Une lampe de poche ouverte : piles, interrupteur, ampoule'),
  blocs: () => sch([['quand le drapeau est cliqué', JAUNE, 40], ['répéter 4 fois', '#e6a23c', 85], ['avancer de 10', BLEU, 130], ['tourner de 90°', BLEU, 172]].map(([t, c, y], i) => `<rect x="${i >= 2 ? 90 : 60}" y="${y}" width="${t.length * 8 + 30}" height="34" rx="8" fill="${c}" opacity=".85"/>` + txt((i >= 2 ? 90 : 60) + 14, y + 18, t, { taille: 14, gras: true, ancre: 'start', c: '#1c2a22' })).join('') + `<rect x="60" y="119" width="22" height="90" fill="#e6a23c" opacity=".85"/>`, 'Des blocs de programme, comme dans Scratch'),
  orbite: () => sch(`<ellipse cx="190" cy="120" rx="150" ry="70" fill="none" stroke="${CRAIE}" stroke-width="2" stroke-dasharray="6 6"/>` + rond(190, 120, 26, JAUNE, JAUNE) + [[40, 120], [190, 50], [340, 120], [190, 190]].map(([x, y]) => rond(x, y, 12, BLEU, BLEU) + ligne(x - 6, y - 18, x + 6, y + 18, CRAIE, 2)).join(''), 'La Terre à quatre moments de son tour autour du Soleil, son axe penché'),
  volcan: () => sch(chemin('M40 200 L150 70 L170 70 L280 200', CRAIE, 3, '#4a3a30') + `<path d="M150 70 L170 70 L165 200 L155 200 Z" fill="${ROUGE}" opacity=".8"/><ellipse cx="160" cy="215" rx="70" ry="18" fill="${ROUGE}" opacity=".7"/>` + chemin('M150 70 Q130 50 140 30 Q160 20 175 35 Q195 25 200 45', '#aeb6bf', 3) + chemin('M170 75 Q220 110 240 160', ROUGE, 5), 'Un volcan en coupe : la lave monte et coule'),
  seisme: () => sch(`<rect x="0" y="80" width="380" height="160" fill="#8d6e63" opacity=".45"/>` + chemin('M180 80 L200 120 L185 160 L205 200 L190 240', CRAIE, 3) + rond(195, 170, 6, ROUGE, ROUGE) + [20, 40, 60].map((r) => rond(195, 170, r, ROUGE, 'none', 1.6)).join('') + chemin('M120 80 l10 -24 l14 0 l0 24 M250 80 l0 -30 l20 0 l0 30', CRAIE, 2.4), 'Un séisme : des ondes partent d\'un point en profondeur'),
  recyclage: () => sch([0, 120, 240].map((a) => `<g transform="rotate(${a} 190 120)">${chemin('M190 50 Q240 55 250 95', VERT, 6)}<path d="M246 105 L262 88 L238 86 Z" fill="${VERT}"/></g>`).join('') + [[100, JAUNE], [190, VERT], [280, BLEU]].map(([x, c]) => `<rect x="${x - 18}" y="190" width="36" height="36" rx="4" fill="${c}" opacity=".8"/>`).join(''), 'Le symbole du recyclage et des poubelles de tri'),
  reseau: () => sch([[60, 70], [60, 170], [320, 70], [320, 170]].map(([x, y]) => `<rect x="${x - 26}" y="${y - 20}" width="52" height="34" rx="3" fill="none" stroke="${CRAIE}" stroke-width="3"/>` + ligne(x - 14, y + 18, x + 14, y + 18, CRAIE, 3)).join('') + `<rect x="160" y="100" width="60" height="40" rx="6" fill="none" stroke="${JAUNE}" stroke-width="3"/>` + [[86, 70], [86, 170], [294, 70], [294, 170]].map(([x, y]) => ligne(x, y, x < 190 ? 160 : 220, 120, JAUNE, 2)).join('') + chemin('M170 60 Q170 30 200 34 Q214 14 236 30 Q262 28 258 54 Q256 66 236 66 L180 66 Q168 66 170 60 Z', CRAIE, 2.4) + ligne(190, 100, 200, 66, CRAIE, 2), 'Des ordinateurs reliés à une boîte, elle-même reliée au nuage d\'Internet'),
  climat: () => sch(rond(70, 60, 28, JAUNE, JAUNE) + rond(250, 170, 60, BLEU, BLEU) + `<circle cx="250" cy="170" r="78" fill="none" stroke="${CRAIE}" stroke-width="2" stroke-dasharray="5 5"/>` + fleche(95, 75, 205, 125, JAUNE) + fleche(110, 60, 220, 105, JAUNE) + chemin('M240 110 Q230 80 200 70 Q180 64 190 50', ROUGE, 3) + chemin('M190 50 L200 60', ROUGE, 3), 'Le Soleil chauffe la Terre ; une partie de la chaleur est retenue par l\'atmosphère'),
  meteo: () => sch(chemin('M80 110 Q70 80 100 76 Q110 50 140 64 Q170 56 172 86 Q194 92 180 112 Z', CRAIE, 3, '#5d6d7e') + [90, 110, 130, 150].map((x) => ligne(x, 122, x - 6, 140, BLEU, 3)).join('') + `<rect x="250" y="50" width="16" height="130" rx="8" fill="none" stroke="${CRAIE}" stroke-width="3"/>` + rond(258, 190, 14, ROUGE, ROUGE) + `<rect x="254" y="110" width="8" height="74" fill="${ROUGE}"/>` + chemin('M300 120 l40 -10 M300 136 l50 0 M300 152 l40 10', CRAIE, 2.4), 'Un nuage qui pleut, un thermomètre et du vent'),
};

/* ---------- à quelle question va quel schéma ---------- */
const PAS_DE_SCHEMA = [/Quand on inspire/, /Pour séparer le sable de l'eau/, /Comment récupérer le sel/, /Laquelle est une énergie/, /Laisser reposer de l'eau boueuse/, /Quel est le symbole|symbole normalisé/];
const SCHEMA_NOTION = {
  'Les matériaux et leurs propriétés': ['familles', [/aimant|attir|magnét/i, 'aimant'], [/conduct|courant|isolant|circuit|fils électriques/i, 'testeur']],
  'Les mélanges': ['melanges', [/en la filtrant/, 'filtration'], [/station d'épuration/, 'decantation']],
  'Les sources d\'énergie': ['energies', [/pétrole|charbon|fossile|nucléaire|uranium/i, 'fossiles']],
  'Décrire un mouvement': ['trajectoires'],
  'Les chaînes d\'énergie': ['chaineEnergie'],
  'Les signaux et l\'information': ['signaux'],
  'Classer les êtres vivants': ['groupes'],
  'La digestion': ['digestif'],
  'La décomposition': ['decompo', [/plastique/i, 'recyclage']],
  'Respiration et circulation': ['respiration', [/cœur|sang|artère|vaisseau|pouls|tabac/i, 'circulation']],
  'Puberté et reproduction': [null, [/puberté|voix|poils|seins|transpiration|rythme|corps devient capable/i, 'croissance']],
  'La biodiversité et l\'évolution': ['biodiv', [/fossile|éteint|dinosaure|évolution|descend|transformation des espèces/i, 'fossile']],
  'Analyser un objet technique': ['lampe'],
  'Algorithmes et programmation': ['blocs'],
  'La Terre : mouvements, séismes et volcans': ['orbite', [/volcan|lave|Auvergne/i, 'volcan'], [/séisme|tremblement|plaques|tsunami/i, 'seisme']],
  'Choisir un matériau, recycler': ['recyclage', [/vitre|câble|casserole|gourde/i, 'familles']],
  'Les réseaux informatiques': ['reseau'],
  'Ressources, risques et climat': ['climat', [/météo|Météo|vigilance|canicule|inondation|risques naturels|temps qu'il fait/i, 'meteo']],
};
function schemaPour(q, notion) {
  if (PAS_DE_SCHEMA.some((r) => r.test(q))) return null;
  const R = SCHEMA_NOTION[notion];
  if (!R) return null;
  const [defaut, ...regles] = R;
  const t = q.replace(/<[^>]+>/g, '');
  const r = regles.find(([re]) => re.test(t));
  const nom = r ? r[1] : defaut;
  return nom && SCHEMAS[nom] ? SCHEMAS[nom]() : null;
}
/* les quiz de cours : on cherche la notion d'après les mots de la question */
const NOTIONS_QUIZ = {
  'cm-matiere': ['Les matériaux et leurs propriétés', 'Les mélanges', 'Les sources d\'énergie', 'Décrire un mouvement', 'Les chaînes d\'énergie', 'Les signaux et l\'information'],
  'cm-vivant': ['Classer les êtres vivants', 'La digestion', 'La décomposition', 'Respiration et circulation', 'Puberté et reproduction', 'La biodiversité et l\'évolution'],
  'cm-technique': ['Analyser un objet technique', 'Algorithmes et programmation', 'La Terre : mouvements, séismes et volcans', 'Choisir un matériau, recycler', 'Les réseaux informatiques', 'Ressources, risques et climat'],
};
const MOTS_QUIZ = [
  [/sel « disparaît »|particules tomber/i, 'Les mélanges'], [/ligne suivie/i, 'Décrire un mouvement'],
  [/mamelles|colonne vertébrale/i, 'Classer les êtres vivants'], [/tuyau entre la bouche/i, 'La digestion'], [/matière morte/i, 'La décomposition'],
  [/corps devient capable/i, 'Puberté et reproduction'], [/diversité de tous|transformation des espèces/i, 'La biodiversité et l\'évolution'],
  [/instructions|répéter des|erreur dans un programme/i, 'Algorithmes et programmation'], [/roche fondue/i, 'La Terre : mouvements, séismes et volcans'],
  [/déchet/i, 'Choisir un matériau, recycler'], [/ordinateurs reliés|fournit des sites/i, 'Les réseaux informatiques'], [/temps qu'il fait|gaz rejeté/i, 'Ressources, risques et climat'],
  [/aimant|conducteur|verre est|plastique est|bois, le coton/i, 'Les matériaux et leurs propriétés'], [/mélange|dissout|filtr|décant/i, 'Les mélanges'], [/énergies|soleil, le vent|pétrole/i, 'Les sources d\'énergie'],
  [/trajectoire|mouvement à vitesse|ligne droite/i, 'Décrire un mouvement'], [/chaîne d'énergie|moteur électrique/i, 'Les chaînes d\'énergie'], [/signal|téléphone portable|son peut/i, 'Les signaux et l\'information'],
  [/classer|mammifères|plumes|insecte|vertébré/i, 'Classer les êtres vivants'], [/œsophage|nutriments/i, 'La digestion'], [/décompos|épluchures/i, 'La décomposition'],
  [/poumons|expirant|cœur|vaisseaux/i, 'Respiration et circulation'], [/puberté/i, 'Puberté et reproduction'], [/biodiversité|évolution/i, 'La biodiversité et l\'évolution'],
  [/fonction/i, 'Analyser un objet technique'], [/algorithme|boucle|bug/i, 'Algorithmes et programmation'], [/Terre|saisons|séisme|lave/i, 'La Terre : mouvements, séismes et volcans'],
  [/recycl|verre se/i, 'Choisir un matériau, recycler'], [/réseau|routeur|serveur/i, 'Les réseaux informatiques'], [/météo|dioxyde|risques/i, 'Ressources, risques et climat'],
];
function schemaQuiz(cle, q) {
  const t = q.replace(/<[^>]+>/g, ''), possibles = NOTIONS_QUIZ[cle];
  if (!possibles) return null;
  const m = MOTS_QUIZ.find(([re, n]) => possibles.includes(n) && re.test(t));
  return m ? schemaPour(q, m[1]) : null;
}

/* ---------- 6e – 5e et 4e – 3e ---------- */
Object.assign(SCHEMAS, {
  balanceEprouvette: () => sch(chemin('M50 200 L170 200 L160 170 L60 170 Z') + chemin('M70 166 L150 166', CRAIE, 4) + `<rect x="85" y="182" width="50" height="10" fill="${VERT}" opacity=".7"/>` + chemin('M250 60 L250 200 L290 200 L290 60 M240 200 L300 200', CRAIE) + `<rect x="253" y="110" width="34" height="88" fill="${BLEU}" opacity=".5"/>` + [80, 100, 120, 140, 160, 180].map((y) => ligne(250, y, 262, y, CRAIE, 1.6)).join(''), 'Une balance et une éprouvette graduée'),
  bougie: () => sch(`<rect x="170" y="130" width="40" height="80" fill="none" stroke="${CRAIE}" stroke-width="3"/>` + ligne(190, 130, 190, 118, CRAIE, 2) + `<path d="M190 70 Q176 96 184 112 Q190 120 196 112 Q204 96 190 70 Z" fill="${JAUNE}"/><path d="M190 90 Q184 104 188 112 Q192 114 194 108 Q196 100 190 90 Z" fill="${ROUGE}" opacity=".7"/>` + chemin('M120 40 L120 215 L260 215 L260 40', CRAIE, 2) + chemin('M200 60 q-6 -10 0 -20 q6 -10 0 -20', '#aeb6bf', 2), 'Une bougie qui brûle sous une cloche'),
  route: () => sch(chemin('M20 180 L360 180', CRAIE, 3) + [60, 120, 180, 240, 300].map((x) => ligne(x, 196, x + 26, 196, CRAIE, 2)).join('') + chemin('M60 176 L60 150 L80 140 L130 140 L150 156 L160 176 Z', JAUNE) + rond(80, 178, 10) + rond(140, 178, 10) + rond(290, 80, 26) + chemin('M290 80 L290 62 M290 80 L304 88', ROUGE) + `<rect x="284" y="46" width="12" height="6" fill="${CRAIE}"/>`, 'Une voiture sur une route et un chronomètre'),
  circuitPile: () => sch(ligne(60, 60, 60, 105) + ligne(60, 145, 60, 200) + ligne(52, 105, 88, 105, CRAIE, 4) + ligne(60, 145, 80, 145, CRAIE, 8) + ligne(60, 60, 320, 60) + ligne(320, 60, 320, 200) + ligne(320, 200, 60, 200) + rond(190, 60, 18, CRAIE, '#22352b') + ligne(178, 48, 202, 72, CRAIE, 2) + ligne(202, 48, 178, 72, CRAIE, 2) + rond(190, 200, 18, CRAIE, '#22352b') + ligne(178, 188, 202, 212, CRAIE, 2) + ligne(202, 188, 178, 212, CRAIE, 2), 'Un circuit avec une pile et deux lampes'),
  particules: () => sch([[20, 'solide'], [140, 'liquide'], [260, 'gaz']].map(([x, t], k) => `<rect x="${x}" y="60" width="100" height="130" fill="none" stroke="${CRAIE}" stroke-width="3"/>` + (k === 0 ? [0, 1, 2, 3, 4].flatMap((i) => [0, 1, 2, 3, 4].map((j) => rond(x + 14 + i * 18, 114 + j * 18, 7, JAUNE, JAUNE, 1))).join('') : k === 1 ? [[16, 176], [34, 172], [52, 178], [70, 172], [86, 176], [24, 158], [44, 154], [62, 160], [80, 152], [14, 140], [36, 136], [58, 140], [78, 136], [92, 158]].map(([a, b]) => rond(x + a, b, 7, BLEU, BLEU, 1)).join('') : [[20, 80], [70, 90], [40, 130], [85, 150], [25, 175], [60, 170]].map(([a, b]) => rond(x + a, b, 7, ROSE, ROSE, 1)).join(''))).join(''), 'Trois boîtes : des particules serrées et rangées, serrées en désordre, très éloignées'),
  del: () => sch(ligne(60, 60, 60, 105) + ligne(60, 145, 60, 200) + ligne(52, 105, 88, 105, CRAIE, 4) + ligne(60, 145, 80, 145, CRAIE, 8) + ligne(60, 60, 175, 60) + chemin('M175 44 L175 76 L205 60 Z', CRAIE, 3) + ligne(205, 44, 205, 76, CRAIE, 3) + chemin('M196 36 l12 -12 M206 40 l12 -12', JAUNE, 2) + ligne(205, 60, 320, 60) + ligne(320, 60, 320, 200) + ligne(320, 200, 60, 200), 'Un circuit avec une pile et une diode'),
  ombre: () => sch(rond(60, 110, 16, JAUNE, JAUNE) + [[200, 90], [200, 150]].map(([x, y]) => ligne(72, 110, 330, y === 90 ? 40 : 200, JAUNE, 1.6)).join('') + `<rect x="190" y="88" width="20" height="64" fill="${CRAIE}"/>` + ligne(330, 20, 330, 220, CRAIE, 4) + `<rect x="326" y="40" width="8" height="160" fill="#0d1520" opacity=".8"/>`, 'Une lampe, un objet opaque et son ombre sur un mur'),
  eclipse: () => sch(rond(60, 120, 34, JAUNE, JAUNE) + rond(200, 120, 10, '#aeb6bf', '#aeb6bf') + rond(320, 120, 34, BLEU, BLEU) + chemin('M70 86 L330 108 M70 154 L330 132', JAUNE, 1.4) + `<path d="M206 112 L320 104 L320 136 L206 128 Z" fill="#0d1520" opacity=".5"/>`, 'Le Soleil, la Lune et la Terre alignés'),
  cellule: () => sch(`<ellipse cx="110" cy="120" rx="80" ry="64" fill="none" stroke="${CRAIE}" stroke-width="3"/>` + rond(120, 112, 18, ROSE, ROSE, 2) + `<rect x="210" y="56" width="150" height="128" rx="6" fill="none" stroke="${VERT}" stroke-width="5"/><rect x="218" y="64" width="134" height="112" rx="4" fill="none" stroke="${CRAIE}" stroke-width="2"/>` + rond(300, 100, 16, ROSE, ROSE, 2) + [[240, 150], [262, 88], [330, 150], [250, 120]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="10" ry="6" fill="${VERT}"/>`).join(''), 'Deux cellules vues au microscope, sans légende'),
  fermentation: () => sch(chemin('M60 110 L60 200 L140 200 L140 110 Z') + `<rect x="62" y="130" width="76" height="68" fill="${CRAIE}" opacity=".7"/>` + chemin('M54 110 L146 110', CRAIE, 5) + `<path d="M220 200 Q210 150 260 140 Q310 130 340 160 Q352 200 330 200 Z" fill="#e6a23c" opacity=".85"/>` + [[255, 165], [285, 160], [310, 176], [270, 185], [300, 150], [240, 182]].map(([x, y]) => rond(x, y, 4, '#7a4a12', '#7a4a12', 1)).join(''), 'Un pot de yaourt et un pain gonflé de petites bulles'),
  photosynthese: () => sch(rond(60, 50, 24, JAUNE, JAUNE) + fleche(84, 64, 160, 100, JAUNE) + chemin('M190 210 L190 90') + chemin('M190 150 Q150 130 140 100 Q170 110 190 140 M190 120 Q230 100 250 70 Q220 80 190 110', VERT, 3, VERT) + chemin('M190 210 L170 236 M190 210 L190 238 M190 210 L212 236 M178 224 L166 232', '#c9a26b', 2.4) + `<rect x="0" y="210" width="380" height="30" fill="#5d4037" opacity=".5"/>` + fleche(300, 120, 250, 110, CRAIE) + fleche(240, 150, 300, 165, BLEU), 'Une plante éclairée par le Soleil, ses feuilles et ses racines'),
  prototype: () => sch(`<rect x="30" y="60" width="130" height="150" fill="none" stroke="${CRAIE}" stroke-width="3"/>` + [90, 110, 130, 150, 170].map((y) => ligne(45, y, 145, y, CRAIE, 1.4)).join('') + fleche(170, 135, 210, 135, JAUNE) + chemin('M240 170 L240 110 L290 90 L340 110 L340 170 L290 190 Z M240 110 L290 130 L340 110 M290 130 L290 190', JAUNE), 'Un cahier des charges puis un premier modèle en volume'),
  systeme: () => sch(rond(20, 120, 50, JAUNE, JAUNE) + [[90, 4, '#b2babb'], [115, 6, '#f5cba7'], [145, 7, BLEU], [172, 5, ROUGE], [215, 18, '#f0b27a'], [270, 15, '#f7dc6f'], [318, 10, '#aed6f1'], [354, 10, '#5d6d7e']].map(([x, r, c]) => rond(x, 120, r, c, c, 1)).join(''), 'Le Soleil et les planètes, sans leurs noms'),
  chaineInfo: () => sch([[20, 50], [140, 50], [260, 50], [20, 150], [140, 150], [260, 150]].map(([x, y]) => `<rect x="${x}" y="${y}" width="100" height="50" rx="8" fill="none" stroke="${y === 50 ? BLEU : JAUNE}" stroke-width="3"/>`).join('') + fleche(122, 75, 138, 75, BLEU) + fleche(242, 75, 258, 75, BLEU) + fleche(122, 175, 138, 175, JAUNE) + fleche(242, 175, 258, 175, JAUNE) + fleche(310, 102, 310, 148, CRAIE), 'Deux rangées de cases reliées par des flèches : la chaîne d\'information en haut, la chaîne d\'énergie en bas'),
  pont: () => sch(chemin('M20 180 L360 180', CRAIE, 4) + [40, 100, 160, 220, 280].map((x) => chemin(`M${x} 180 L${x + 30} 120 L${x + 60} 180`, JAUNE, 3)).join('') + ligne(70, 120, 310, 120, JAUNE, 3) + `<rect x="10" y="180" width="30" height="50" fill="${CRAIE}" opacity=".5"/><rect x="340" y="180" width="30" height="50" fill="${CRAIE}" opacity=".5"/>`, 'Un pont fait de triangles'),
  ordiCapteurs: () => sch(`<rect x="130" y="70" width="120" height="80" rx="6" fill="none" stroke="${CRAIE}" stroke-width="3"/>` + ligne(170, 150, 210, 150, CRAIE, 6) + `<rect x="150" y="160" width="80" height="14" fill="none" stroke="${CRAIE}" stroke-width="2"/>` + rond(50, 110, 20, BLEU) + rond(50, 110, 8, BLEU, BLEU) + fleche(72, 110, 128, 110, BLEU) + fleche(252, 110, 300, 110, JAUNE) + rond(330, 110, 24, JAUNE) + chemin('M318 110 L342 110 M330 98 L330 122', JAUNE, 3), 'Un ordinateur entre un capteur et un moteur'),
  molecules: () => sch([[90, 120, ROUGE], [60, 150, CRAIE], [120, 150, CRAIE]].map(([x, y, c]) => rond(x, y, 18, c, c, 1)).join('') + [[230, 130, ROUGE], [270, 130, '#555'], [310, 130, ROUGE]].map(([x, y, c]) => rond(x, y, 18, c, c, 1)).join(''), 'Deux modèles de molécules en boules'),
  ohm: () => sch(ligne(60, 60, 60, 105) + ligne(60, 145, 60, 200) + ligne(52, 105, 88, 105, CRAIE, 4) + ligne(60, 145, 80, 145, CRAIE, 8) + ligne(60, 60, 160, 60) + `<rect x="160" y="50" width="60" height="20" fill="none" stroke="${CRAIE}" stroke-width="3"/>` + ligne(220, 60, 320, 60) + ligne(320, 60, 320, 105) + rond(320, 125, 20, JAUNE) + ligne(306, 111, 334, 139, JAUNE, 2) + ligne(334, 111, 306, 139, JAUNE, 2) + ligne(320, 145, 320, 200) + ligne(320, 200, 60, 200) + ligne(170, 60, 170, 120, CRAIE, 2) + ligne(210, 60, 210, 120, CRAIE, 2) + rond(190, 130, 20, BLEU) + ligne(170, 120, 172, 125, CRAIE, 2), 'Un circuit avec une résistance et deux appareils de mesure, sans légende'),
  son: () => sch(chemin('M40 110 L60 110 L90 80 L90 160 L60 130 L40 130 Z') + [0, 1, 2, 3].map((i) => chemin(`M${110 + i * 22} ${100 - i * 8} q${14 + i * 4} ${20 + i * 8} 0 ${40 + i * 16}`, CRAIE, 2.4)).join('') + chemin('M280 40 L262 100 L282 100 L264 170', JAUNE, 4) + chemin('M300 190 Q320 170 340 190 Q360 200 350 210 L300 210 Q290 200 300 190', CRAIE, 2), 'Un haut-parleur qui émet un son, un éclair et un nuage'),
  atome: () => sch(rond(190, 120, 22, ROUGE, 'none') + [[182, 114, ROUGE], [196, 112, CRAIE], [188, 128, CRAIE], [200, 126, ROUGE]].map(([x, y, c]) => rond(x, y, 7, c, c, 1)).join('') + `<ellipse cx="190" cy="120" rx="120" ry="44" fill="none" stroke="${BLEU}" stroke-width="2"/><ellipse cx="190" cy="120" rx="120" ry="44" fill="none" stroke="${BLEU}" stroke-width="2" transform="rotate(60 190 120)"/><ellipse cx="190" cy="120" rx="120" ry="44" fill="none" stroke="${BLEU}" stroke-width="2" transform="rotate(-60 190 120)"/>` + [[310, 120], [130, 16], [130, 224]].map(([x, y]) => rond(x, y, 6, BLEU, BLEU)).join(''), 'Un atome : un noyau et des électrons autour'),
  ph: () => sch(`<defs><linearGradient id="gph" x1="0" x2="1"><stop offset="0" stop-color="#e74c3c"/><stop offset=".3" stop-color="#f1c40f"/><stop offset=".5" stop-color="#2ecc71"/><stop offset=".75" stop-color="#3498db"/><stop offset="1" stop-color="#8e44ad"/></linearGradient></defs><rect x="30" y="100" width="320" height="40" rx="6" fill="url(#gph)"/>` + [0, 7, 14].map((v) => txt(30 + v * 320 / 14, 170, String(v), { taille: 18, gras: true })).join('') + becher(120, 80, 40, 50, 0.6, JAUNE) + becher(260, 80, 40, 50, 0.6, BLEU), 'L\'échelle de pH de 0 à 14 et deux solutions'),
  forces: () => sch(rond(190, 230, 120, BLEU, BLEU) + rond(190, 60, 14, ROUGE, ROUGE) + ligne(190, 46, 194, 38, VERT, 3) + fleche(190, 78, 190, 120, JAUNE) + chemin('M300 60 l20 0 l0 40 l-6 0 l0 20 l-8 0 l0 -20 l-6 0 Z', CRAIE, 2), 'Une pomme attirée vers la Terre, et un dynamomètre'),
  chute: () => sch(chemin('M40 210 L40 40 L120 40', CRAIE, 3) + rond(150, 50, 14, ROUGE, ROUGE) + [90, 130, 175].map((y, i) => rond(150, y, 14, ROUGE, 'none', 1.6)).join('') + fleche(180, 60, 180, 190, JAUNE) + chemin('M20 210 L360 210', CRAIE, 2), 'Une balle lâchée d\'en haut : elle tombe de plus en plus vite'),
  plaques: () => sch(`<path d="M0 100 L200 100 L240 180 L0 180 Z" fill="#8d6e63" opacity=".6"/><path d="M200 100 L380 90 L380 170 L250 150 Z" fill="#5d4037" opacity=".7"/>` + chemin('M200 100 L240 180 M200 100 L380 90', CRAIE, 2) + fleche(90, 140, 150, 140, CRAIE) + fleche(340, 120, 290, 122, CRAIE) + `<path d="M0 180 L380 180 L380 240 L0 240 Z" fill="${ROUGE}" opacity=".35"/>` + chemin('M240 88 L250 60 L262 88', CRAIE, 2), 'Deux plaques qui se rapprochent : l\'une plonge sous l\'autre'),
  neurone: () => sch(rond(110, 120, 22, ROSE, 'none') + rond(110, 120, 7, ROSE, ROSE) + [0, 60, 120, 180, 240].map((a) => chemin(`M${110 + 22 * Math.cos(a * Math.PI / 180)} ${120 + 22 * Math.sin(a * Math.PI / 180)} l${20 * Math.cos(a * Math.PI / 180)} ${20 * Math.sin(a * Math.PI / 180)}`, ROSE, 2)).join('') + chemin('M132 120 L300 120', ROSE, 4) + chemin('M300 120 l20 -16 M300 120 l22 0 M300 120 l20 16', ROSE, 2.4) + [180, 220, 260].map((x) => fleche(x, 106, x + 26, 106, JAUNE)).join(''), 'Un neurone : le message nerveux circule le long de la cellule'),
  adn: () => sch(Array.from({ length: 13 }, (_, i) => { const y = 30 + i * 15, a = i * 0.6, x1 = 150 + 40 * Math.sin(a), x2 = 150 - 40 * Math.sin(a); return ligne(x1, y, x2, y, i % 2 ? BLEU : JAUNE, 3) + rond(x1, y, 4, ROSE, ROSE, 1) + rond(x2, y, 4, VERT, VERT, 1); }).join('') + `<g transform="translate(290 120)"><rect x="-30" y="-12" width="60" height="24" rx="12" fill="${ROSE}" transform="rotate(60)"/><rect x="-60" y="-12" width="120" height="24" rx="12" fill="${ROSE}" transform="rotate(-60)"/><rect x="-60" y="-12" width="120" height="24" rx="12" fill="${ROSE}" opacity=".85" transform="rotate(60)"/>` + rond(0, 0, 8, CRAIE, CRAIE, 1) + '</g>', 'La double hélice de l\'ADN et un chromosome'),
  arbreVie: () => sch(chemin('M190 220 L190 160 L120 110 L80 50 M120 110 L150 50 M190 160 L260 110 L230 50 M260 110 L310 50', VERT, 4) + [[80, 50], [150, 50], [230, 50], [310, 50]].map(([x, y]) => rond(x, y - 10, 9, CRAIE, CRAIE)).join(''), 'Un arbre de parenté : des espèces qui ont des ancêtres communs'),
  defenses: () => sch(rond(120, 120, 46, CRAIE, 'none') + rond(120, 120, 14, ROSE, ROSE) + chemin('M150 90 q20 -10 30 10', CRAIE, 2) + [[240, 80], [290, 120], [250, 170]].map(([x, y]) => `<rect x="${x - 16}" y="${y - 7}" width="32" height="14" rx="7" fill="${VERT}" opacity=".8"/>`).join('') + [[330, 60]].map(([x, y]) => rond(x, y, 10, ROUGE, 'none') + [0, 60, 120, 180, 240, 300].map((a) => ligne(x + 10 * Math.cos(a * Math.PI / 180), y + 10 * Math.sin(a * Math.PI / 180), x + 16 * Math.cos(a * Math.PI / 180), y + 16 * Math.sin(a * Math.PI / 180), ROUGE, 2)).join('')).join(''), 'Un globule blanc, des bactéries et un virus'),
  carte: () => sch(`<rect x="110" y="40" width="160" height="160" rx="14" fill="none" stroke="${CRAIE}" stroke-width="3"/>` + [0, 1, 2, 3, 4].flatMap((i) => [0, 1, 2, 3, 4].map((j) => `<rect x="${150 + i * 18}" y="${80 + j * 18}" width="8" height="8" fill="${(i + j) % 3 ? '#22352b' : ROUGE}" stroke="${CRAIE}" stroke-width="1"/>`)).join('') + rond(130, 120, 9, CRAIE) + rond(250, 120, 9, CRAIE) + txt(130, 150, 'A', { taille: 14, gras: true }) + txt(250, 150, 'B', { taille: 14, gras: true }), 'Une carte programmable avec ses petites lumières et deux boutons'),
  simulation: () => sch(`<rect x="60" y="40" width="260" height="150" rx="6" fill="none" stroke="${CRAIE}" stroke-width="3"/>` + chemin('M90 150 Q190 60 290 150', BLEU, 3) + [110, 150, 190, 230, 270].map((x) => ligne(x, 150 - (x === 190 ? 70 : x === 150 || x === 230 ? 50 : 20), x, 150, ROUGE, 2)).join('') + ligne(80, 150, 300, 150, CRAIE, 2) + ligne(170, 190, 210, 190, CRAIE, 6), 'Un écran d\'ordinateur qui simule un pont et ses efforts'),
  cyber: () => sch(chemin('M150 120 L150 92 Q150 64 190 64 Q230 64 230 92 L230 120', CRAIE, 6) + `<rect x="130" y="120" width="120" height="90" rx="10" fill="${JAUNE}" opacity=".85"/>` + rond(190, 160, 10, '#22352b', '#22352b'), 'Un cadenas : la protection des données'),
  organigramme: () => sch(`<ellipse cx="190" cy="30" rx="50" ry="16" fill="none" stroke="${CRAIE}" stroke-width="3"/>` + fleche(190, 46, 190, 66) + `<rect x="140" y="66" width="100" height="32" fill="none" stroke="${BLEU}" stroke-width="3"/>` + fleche(190, 98, 190, 116) + chemin('M190 116 L240 146 L190 176 L140 146 Z', JAUNE) + fleche(190, 176, 190, 200) + `<ellipse cx="190" cy="216" rx="50" ry="16" fill="none" stroke="${CRAIE}" stroke-width="3"/>` + chemin('M240 146 L300 146 L300 82 L244 82', JAUNE, 2) + chemin('M244 82 l8 -5 l0 10 Z', JAUNE, 2), 'Un organigramme : des formes reliées par des flèches, sans texte'),
});
Object.assign(SCHEMA_NOTION, {
  'Masse et volume': ['balanceEprouvette'],
  'Les transformations chimiques': ['bougie'],
  'La vitesse moyenne': ['route'],
  'Circuits en série et en dérivation': ['circuitPile'],
  'Le modèle particulaire': ['particules', [/molécule d'eau/i, 'molecules']],
  'Le courant électrique': ['del', [/conducteur|isolant|corps humain|bois sec/i, 'testeur']],
  'La lumière': ['ombre', [/éclipse|Lune|phases|Soleil met/i, 'eclipse']],
  'La cellule': ['cellule'],
  'Groupes emboîtés et parenté': ['groupes', [/arbre de parenté|chimpanzé|crocodile|proches parentes/i, 'arbreVie']],
  'Micro-organismes et production alimentaire': ['fermentation', [/engrais|agriculture/i, 'photosynthese']],
  'La Terre et le climat': ['meteo', [/courants marins|équateur|air chaud/i, 'climat']],
  'Le corps humain et l\'effort': ['respiration', [/cœur|sang|artère|fréquence cardiaque|récupération/i, 'circulation']],
  'La nutrition des plantes': ['photosynthese'],
  'Cahier des charges et prototype': ['prototype'],
  'Boucles et conditions': ['blocs'],
  'La Terre dans le système solaire': ['systeme', [/météo et climat|Lune n'a pas/i, 'meteo']],
  'Chaîne d\'énergie et chaîne d\'information': ['chaineInfo'],
  'Matériaux et structures': ['pont'],
  'L\'ordinateur, les capteurs et les actionneurs': ['ordiCapteurs'],
  'Atomes, molécules et combustions': ['bougie', [/molécule est formée|eau de chaux/i, 'molecules']],
  'Tension, intensité et loi d\'Ohm': ['ohm'],
  'Le son et la lumière': ['son', [/lumière blanche|lumière se propage/i, 'eclipse']],
  'L\'atome, les ions et le pH': ['atome', [/pH|acide|basique|dilue/i, 'ph']],
  'Forces, poids et masse': ['forces'],
  'Énergie et puissance': ['chute'],
  'Tectonique, volcans et séismes': ['plaques', [/éruption|volcan|lave/i, 'volcan'], [/foyer|sismographe|parasismique/i, 'seisme']],
  'Reproduction et hormones': [null, [/puberté/i, 'croissance']],
  'Le système nerveux': ['neurone'],
  'Chromosomes, ADN et gènes': ['adn'],
  'L\'évolution et la sélection naturelle': ['arbreVie', [/fossile/i, 'fossile']],
  'Microbes, défenses du corps et vaccination': ['defenses'],
  'Les enjeux planétaires': ['climat', [/énergies renouvelables|transition/i, 'energies'], [/biodiversité/i, 'biodiv']],
  'Les objets connectés': ['reseau'],
  'La simulation numérique': ['simulation'],
  'Variables, événements et capteurs': ['carte'],
  'Projet et développement durable': ['recyclage', [/prototype|planning|Gantt|cahier/i, 'prototype']],
  'Réseaux et cybersécurité': ['cyber', [/adresse IP|routage|DNS/i, 'reseau']],
  'Représentation fonctionnelle et algorithmes': ['organigramme', [/chaîne|ascenseur|portail|diagramme fonctionnel/i, 'chaineInfo']],
});
PAS_DE_SCHEMA.push(/d'électrons|nucléons, dont/, /cellule végétale a en plus|Qu'a une cellule végétale/, /La Terre est la … planète|Les planètes géantes gazeuses/, /symbole d'une lampe/);
Object.assign(NOTIONS_QUIZ, {
  '65-matiere': ['Masse et volume', 'Les transformations chimiques', 'La vitesse moyenne', 'Circuits en série et en dérivation', 'Le modèle particulaire', 'Le courant électrique', 'La lumière'],
  '65-vivant': ['La cellule', 'Groupes emboîtés et parenté', 'Micro-organismes et production alimentaire', 'La Terre et le climat', 'Le corps humain et l\'effort', 'La nutrition des plantes'],
  '65-technique': ['Cahier des charges et prototype', 'Boucles et conditions', 'La Terre dans le système solaire', 'Chaîne d\'énergie et chaîne d\'information', 'Matériaux et structures', 'L\'ordinateur, les capteurs et les actionneurs'],
  '43-matiere': ['Atomes, molécules et combustions', 'Tension, intensité et loi d\'Ohm', 'Le son et la lumière', 'L\'atome, les ions et le pH', 'Forces, poids et masse', 'Énergie et puissance'],
  '43-vivant': ['Tectonique, volcans et séismes', 'Reproduction et hormones', 'Le système nerveux', 'Chromosomes, ADN et gènes', 'L\'évolution et la sélection naturelle', 'Microbes, défenses du corps et vaccination', 'Les enjeux planétaires'],
  '43-technique': ['Les objets connectés', 'La simulation numérique', 'Variables, événements et capteurs', 'Projet et développement durable', 'Réseaux et cybersécurité', 'Représentation fonctionnelle et algorithmes'],
});
MOTS_QUIZ.push(
  [/masse|volume|mL|kg/i, 'Masse et volume'], [/transformation chimique|glace qui fond/i, 'Les transformations chimiques'], [/vitesse|km\/h/i, 'La vitesse moyenne'],
  [/série|dérivation|prises d'une maison|énergie peut-elle/i, 'Circuits en série et en dérivation'], [/particules|changement d'état/i, 'Le modèle particulaire'],
  [/courant va|diode/i, 'Le courant électrique'], [/lumière|éclipse|Soleil est une source/i, 'La lumière'],
  [/cellule|noyau|membrane|microscope|unicellulaire/i, 'La cellule'], [/groupes emboîtés|attributs|inclus/i, 'Groupes emboîtés et parenté'],
  [/fermentation|levure|pain gonfle/i, 'Micro-organismes et production alimentaire'], [/climat se calcule|aléa/i, 'La Terre et le climat'],
  [/effort|muscles|alvéoles/i, 'Le corps humain et l\'effort'], [/photosynthèse|stomates|sève/i, 'La nutrition des plantes'],
  [/cahier des charges|prototype/i, 'Cahier des charges et prototype'], [/condition|boucle|variable/i, 'Boucles et conditions'],
  [/vie est possible|planètes/i, 'La Terre dans le système solaire'], [/chaîne|capteur|actionneur|détecteur|moteur est/i, 'Chaîne d\'énergie et chaîne d\'information'],
  [/corde|pilier|triangle/i, 'Matériaux et structures'], [/processeur|mémoire|clavier|écran|octet/i, 'L\'ordinateur, les capteurs et les actionneurs'],
  [/molécule|feu|eau de chaux|atomes/i, 'Atomes, molécules et combustions'], [/tension|intensité|loi d'Ohm|série, les/i, 'Tension, intensité et loi d\'Ohm'],
  [/son|lumière est/i, 'Le son et la lumière'], [/noyau d'un atome|atome est|pH/i, 'L\'atome, les ions et le pH'],
  [/force|poids|g vaut/i, 'Forces, poids et masse'], [/énergie cinétique|puissance|E = /i, 'Énergie et puissance'],
  [/plaque|épicentre|subduction/i, 'Tectonique, volcans et séismes'], [/hormones|asexuée/i, 'Reproduction et hormones'],
  [/neurone|synapse/i, 'Le système nerveux'], [/chromosomes|gène|allèles|mitose|méiose/i, 'Chromosomes, ADN et gènes'],
  [/Darwin|mutation|sélection/i, 'L\'évolution et la sélection naturelle'], [/phagocytose|anticorps|antibiotiques|vaccin/i, 'Microbes, défenses du corps et vaccination'],
  [/développement durable/i, 'Les enjeux planétaires'], [/objet connecté|protocole|fibre/i, 'Les objets connectés'],
  [/simulation/i, 'La simulation numérique'], [/microcontrôleur|événement|téléverser/i, 'Variables, événements et capteurs'],
  [/piliers|écoconception|Gantt/i, 'Projet et développement durable'], [/adresse IP|IPv4|DNS|hameçonnage|RGPD/i, 'Réseaux et cybersécurité'],
  [/organigramme|Acquérir/i, 'Représentation fonctionnelle et algorithmes'],
);

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
    do { q = GEN[g](p); cle = `${q.enonce}|${q.rep}|${q.figure || ''}`; essai += 1; } while (vus.has(cle) && essai < 30);
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
  clearTimeout(minuteurSorcier);
  $('nat-character-stage').innerHTML = '';
  $('nat-character-stage').classList.remove('part');
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
  if (game.essais < 2) { showCharacter('bad'); retireSorcier(3000); }
}
/* Le sorcier se place sur le tableau, par-dessus la figure (thermomètre, schéma…). Après une erreur, le joueur
   doit la revoir pour réessayer : le sorcier s'en va donc tout seul au bout de quelques secondes, ou dès que
   le joueur touche une réponse ou une touche du clavier. */
let minuteurSorcier = null;
function retireSorcier(delai = 0) {
  clearTimeout(minuteurSorcier);
  minuteurSorcier = setTimeout(() => {
    const st = $('nat-character-stage');
    if (!st.firstChild || st.classList.contains('part')) return;
    st.classList.add('part');
    setTimeout(() => { if (st.classList.contains('part')) { st.innerHTML = ''; st.classList.remove('part'); } }, 400);
  }, delai);
}
document.addEventListener('pointerdown', (e) => { if (e.target.closest('#mm-zone') && !game.repondu) retireSorcier(); });
document.addEventListener('keydown', () => { if (!game.repondu && $('nat-character-stage')?.firstChild) retireSorcier(); });
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
  /* s'il y a une figure (souvent complétée par la correction), le sorcier la libère au bout de 4 secondes */
  if (q.figure || q.figureCorrection) retireSorcier(4000);
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
  clearTimeout(minuteurSorcier);
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
    /* v8 : hors connexion, Firestore garde une copie des scores sur l'appareil ; un score fait sans internet
       attend dans cette réserve et part tout seul quand la connexion revient. */
    db.enablePersistence({ synchronizeTabs: true }).catch((e) => console.warn('Mode hors connexion des scores', e.code));
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
      <span><b>Les sorciers encouragent le joueur</b> (option plutôt réservée aux enfants).<br>Après chaque réponse, un sorcier apparaît ; les prénoms servent à personnaliser ses encouragements (« Joseph, tu es un génie des sciences ! », « Ton papa Marc sera fier de toi ! »).</span></label>
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

/* v8 : HORS CONNEXION. Le « service worker » (sw.js) range une copie de l'application sur l'appareil
   à la première visite, puis la sert quand internet manque. */
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch((e) => console.warn('Hors connexion', e)));
}

/* ---------- MENU ☰ SUR SMARTPHONE (comme dans Mnemart) ----------
   Sur un petit écran, le bandeau du haut ne garde que la flèche de retour, la maison, le volume
   et le menu ☰ ; les autres icônes (plein écran, fiches, ambiance, aide, contact, compte, sortie)
   passent dans ce menu. Le menu est construit à partir des boutons du bandeau eux-mêmes : chaque
   entrée « appuie » sur le bouton d'origine, il n'y a donc qu'une seule logique pour chaque action.
   Sur ordinateur, rien ne change (le CSS cache le ☰ et laisse les icônes à leur place). */
(function menuSmartphone() {
  const centre = document.querySelector('#global-topbar .topbar-zone-center');
  if (!centre) return;
  const garder = ['global-back-button', 'global-home-button'];
  const ranges = [...centre.querySelectorAll('button.global-topbar-button')].filter((b) => !garder.includes(b.id));
  ranges.forEach((b) => b.classList.add('dans-le-menu'));
  const ouvrir = document.createElement('button');
  ouvrir.type = 'button'; ouvrir.id = 'hamburger-button'; ouvrir.className = 'global-topbar-button hamburger-button';
  ouvrir.textContent = '☰'; ouvrir.setAttribute('aria-label', 'Menu'); ouvrir.title = 'Menu';
  const volume = document.getElementById('global-volume-bars');
  if (volume) volume.after(ouvrir); else centre.appendChild(ouvrir);
  const menu = document.createElement('div');
  menu.id = 'hamburger-menu'; menu.className = 'hamburger-menu hidden'; menu.setAttribute('role', 'menu');
  document.getElementById('global-topbar').appendChild(menu);
  const fermer = () => menu.classList.add('hidden');
  /* les entrées sont refaites à chaque ouverture : un bouton caché à ce moment-là (par exemple
     « Quitter la session » quand personne n'est connecté) n'apparaît pas dans le menu */
  ouvrir.addEventListener('click', (ev) => {
    ev.stopPropagation();
    if (!menu.classList.contains('hidden')) { fermer(); return; }
    menu.innerHTML = '';
    ranges.filter((b) => !b.classList.contains('hidden') && b.style.display !== 'none').forEach((b) => {
      const it = document.createElement('button');
      it.type = 'button'; it.className = 'hamburger-item'; it.setAttribute('role', 'menuitem');
      it.innerHTML = `<span class="hamburger-icone">${b.textContent.trim()}</span>${b.getAttribute('aria-label') || b.title}`;
      /* stopPropagation : sinon ce clic remonterait jusqu'à la page et serait pris pour un « clic
         à l'extérieur », qui refermerait aussitôt le panneau qu'on vient d'ouvrir (ambiance…) */
      it.addEventListener('click', (e) => { e.stopPropagation(); fermer(); b.click(); });
      menu.appendChild(it);
    });
    menu.classList.remove('hidden');
  });
  document.addEventListener('click', (ev) => { if (!menu.contains(ev.target)) fermer(); });
  document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') fermer(); });
})();
