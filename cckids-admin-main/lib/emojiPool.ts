export type CategoryEmojiInfo = {
  name: string;
  emoji: string;
};

/**
 * 100 adet BENZERSİZ emoji.
 * - key: backend'in ileride göndereceği string anahtar (şimdilik biz belirliyoruz)
 * - name: okunabilir isim
 * - emoji: UI’da gösterilecek emoji
 *
 * Not: Hiçbir emoji tekrar ETMEZ.
 */
export const CATEGORY_EMOJI_POOL: Record<string, CategoryEmojiInfo> = {
  kids_bed: { name: "Çocuk Yatağı", emoji: "🛏️" },
  bunk_bed: { name: "Ranza", emoji: "🛌" },
  baby_crib: { name: "Beşik", emoji: "👶" },
  kids_sofa: { name: "Çocuk Koltuğu", emoji: "🛋️" },
  kids_chair: { name: "Çocuk Sandalyesi", emoji: "🪑" },
  kids_table: { name: "Çocuk Masası", emoji: "🪵" },
  wardrobe: { name: "Gardırop", emoji: "👕" },
  coat_rack: { name: "Askılık", emoji: "🧥" },
  shoe_rack: { name: "Ayakkabılık", emoji: "👟" },
  storage_cabinet: { name: "Dolap", emoji: "🗄️" },

  bookcase: { name: "Kitaplık", emoji: "📚" },
  reading_corner: { name: "Okuma Köşesi", emoji: "📖" },
  study_corner: { name: "Çalışma Köşesi", emoji: "✏️" },
  art_corner: { name: "Sanat Köşesi", emoji: "🎨" },
  crayons: { name: "Boya Kalemleri", emoji: "🖍️" },
  paint_brush: { name: "Fırça", emoji: "🖌️" },
  ruler: { name: "Cetvel", emoji: "📏" },
  set_square: { name: "Gönye", emoji: "📐" },
  lab_corner: { name: "Deney Köşesi", emoji: "🧪" },
  microscope: { name: "Mikroskop", emoji: "🔬" },

  telescope: { name: "Teleskop", emoji: "🔭" },
  music_corner: { name: "Müzik Köşesi", emoji: "🎵" },
  notes: { name: "Notalar", emoji: "🎶" },
  drum: { name: "Davul", emoji: "🥁" },
  piano: { name: "Piyano", emoji: "🎹" },
  guitar: { name: "Gitar", emoji: "🎸" },
  trumpet: { name: "Trompet", emoji: "🎺" },
  maracas: { name: "Marakas", emoji: "🪇" },
  theater: { name: "Drama", emoji: "🎭" },
  circus: { name: "Gösteri", emoji: "🎪" },

  carousel: { name: "Atlıkarınca", emoji: "🎠" },
  slide: { name: "Kaydırak", emoji: "🛝" },
  rollercoaster: { name: "Eğlence", emoji: "🎢" },
  castle: { name: "Şato Oyun", emoji: "🏰" },
  playhouse: { name: "Oyun Evi", emoji: "🏠" },
  school: { name: "Sınıf", emoji: "🏫" },
  train: { name: "Tren Oyunu", emoji: "🚂" },
  car: { name: "Araba Oyunu", emoji: "🚗" },
  bus: { name: "Servis", emoji: "🚌" },
  rocket: { name: "Uzay Tema", emoji: "🚀" },

  rainbow: { name: "Gökkuşağı", emoji: "🌈" },
  star: { name: "Yıldız", emoji: "⭐" },
  moon: { name: "Ay", emoji: "🌙" },
  sun: { name: "Güneş", emoji: "☀️" },
  cloud: { name: "Bulut", emoji: "☁️" },
  partly_cloudy: { name: "Parçalı Bulut", emoji: "🌤️" },
  rain: { name: "Yağmur", emoji: "🌧️" },
  snow: { name: "Kar", emoji: "❄️" },
  fire: { name: "Sıcak Tema", emoji: "🔥" },
  droplet: { name: "Su", emoji: "💧" },

  bubbles: { name: "Köpük", emoji: "🫧" },
  soap: { name: "Sabun", emoji: "🧼" },
  sponge: { name: "Sünger", emoji: "🧽" },
  lotion: { name: "Hijyen", emoji: "🧴" },
  broom: { name: "Temizlik", emoji: "🧹" },
  basket: { name: "Sepet", emoji: "🧺" },
  box: { name: "Kutu", emoji: "📦" },
  folder: { name: "Dosyalık", emoji: "🗂️" },
  label: { name: "Etiket", emoji: "🏷️" },
  lock: { name: "Kilit", emoji: "🔐" },

  door: { name: "Kapı", emoji: "🚪" },
  shield: { name: "Güvenlik", emoji: "🛡️" },
  bandage: { name: "İlk Yardım", emoji: "🩹" },
  stethoscope: { name: "Sağlık", emoji: "🩺" },
  faucet: { name: "Musluk", emoji: "🚰" },
  apple: { name: "Elma", emoji: "🍎" },
  banana: { name: "Muz", emoji: "🍌" },
  strawberry: { name: "Çilek", emoji: "🍓" },
  grapes: { name: "Üzüm", emoji: "🍇" },
  carrot: { name: "Havuç", emoji: "🥕" },

  broccoli: { name: "Brokoli", emoji: "🥦" },
  bread: { name: "Ekmek", emoji: "🍞" },
  cheese: { name: "Peynir", emoji: "🧀" },
  milk: { name: "Süt", emoji: "🥛" },
  honey: { name: "Bal", emoji: "🍯" },
  cookie: { name: "Kurabiye", emoji: "🍪" },
  chocolate: { name: "Çikolata", emoji: "🍫" },
  lollipop: { name: "Lolipop", emoji: "🍭" },
  candy: { name: "Şeker", emoji: "🍬" },
  cake: { name: "Pasta", emoji: "🎂" },

  balloon: { name: "Balon", emoji: "🎈" },
  gift: { name: "Hediye", emoji: "🎁" },
  ribbon: { name: "Kurdele", emoji: "🎀" },
  kite: { name: "Uçurtma", emoji: "🪁" },
  soccer: { name: "Futbol", emoji: "⚽" },
  basketball: { name: "Basketbol", emoji: "🏀" },
  football: { name: "Amerikan Futbolu", emoji: "🏈" },
  tennis: { name: "Tenis", emoji: "🎾" },
  volleyball: { name: "Voleybol", emoji: "🏐" },
  bowling: { name: "Bowling", emoji: "🎳" },

  nazar: { name: "Nazar Boncuğu", emoji: "🧿" },
  thread: { name: "İp", emoji: "🧵" },
  needle: { name: "İğne", emoji: "🪡" },
  yarn: { name: "Yün", emoji: "🧶" },
  safety_pin: { name: "Çengelli İğne", emoji: "🧷" },
  magic_wand: { name: "Sihir Değneği", emoji: "🪄" },
  pinata: { name: "Pinata", emoji: "🪅" },
  confetti_ball: { name: "Konfeti", emoji: "🎊" },
  party_popper: { name: "Parti", emoji: "🎉" },
  loudspeaker: { name: "Duyuru", emoji: "📣" },

  bell: { name: "Zil", emoji: "🔔" },
  traffic_light: { name: "Trafik Işığı", emoji: "🚦" },
  warning: { name: "Uyarı", emoji: "⚠️" },
  thermometer: { name: "Termometre", emoji: "🌡️" },
  trash: { name: "Çöp Kutusu", emoji: "🗑️" },
  world: { name: "Dünya", emoji: "🌍" },
  tree: { name: "Ağaç", emoji: "🌳" },
  flower: { name: "Çiçek", emoji: "🌻" },
  beach: { name: "Kum Havuzu", emoji: "🏖️" },
  bear: { name: "Ayıcık Tema", emoji: "🐻" },
  lion: { name: "Aslan Tema", emoji: "🦁" },
  crown: { name: "Taç Tema", emoji: "👑" },
  pirate: { name: "Korsan Tema", emoji: "🏴‍☠️" },
};

/**
 * resolveCategoryEmoji:
 * - key map'te varsa => pool emoji
 * - key map'te yok ama kullanıcı/BE gerçek emoji göndermişse => key'i direkt bas
 * - yoksa => fallback
 */
export function resolveCategoryEmoji(key?: string | null, fallback = "✨"): string {
  const k = (key ?? "").trim();
  if (!k) return fallback;

  const hit = CATEGORY_EMOJI_POOL[k];
  if (hit?.emoji) return hit.emoji;

  // Basit "emoji gibi" kontrol: ASCII değilse ve kısa ise olduğu gibi döndür
  const isProbablyEmoji = /[^\x00-\x7F]/.test(k) && k.length <= 8;
  if (isProbablyEmoji) return k;

  return fallback;
}

export function resolveCategoryEmojiInfo(key?: string | null): CategoryEmojiInfo | null {
  const k = (key ?? "").trim();
  if (!k) return null;
  return CATEGORY_EMOJI_POOL[k] ?? null;
}