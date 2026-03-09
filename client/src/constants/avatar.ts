import { 
  adventurer,
  adventurerNeutral,
  avataaars,
  avataaarsNeutral,
  bigEars,
  bigEarsNeutral,
  bigSmile,
  bottts,
  botttsNeutral,
  croodles,
  croodlesNeutral,
  funEmoji,
  icons,
  identicon,
  initials,
  lorelei,
  loreleiNeutral,
  micah,
  miniavs,
  notionists,
  notionistsNeutral,
  openPeeps,
  personas,
  pixelArt,
  pixelArtNeutral,
  rings,
  shapes,
  thumbs,
} from "@dicebear/collection";

export const STYLE_URL_MAP: Record<string, string> = {
  adventurer: "adventurer",
  adventurerNeutral: "adventurer-neutral",
  avataaars: "avataaars",
  avataaarsNeutral: "avataaars-neutral",
  bigEars: "big-ears",
  bigEarsNeutral: "big-ears-neutral",
  bigSmile: "big-smile",
  bottts: "bottts",
  botttsNeutral: "bottts-neutral",
  croodles: "croodles",
  croodlesNeutral: "croodles-neutral",
  funEmoji: "fun-emoji",
  icons: "icons",
  identicon: "identicon",
  initials: "initials",
  lorelei: "lorelei",
  loreleiNeutral: "lorelei-neutral",
  micah: "micah",
  miniavs: "miniavs",
  notionists: "notionists",
  notionistsNeutral: "notionists-neutral",
  openPeeps: "open-peeps",
  personas: "personas",
  pixelArt: "pixel-art",
  pixelArtNeutral: "pixel-art-neutral",
  rings: "rings",
  shapes: "shapes",
  thumbs: "thumbs"
};

export interface StyleFilters {
  hairColors: string[];
  eyeTypes: string[];
  mouthTypes: string[];
  accessories: string[];
  clothingTypes: string[];
  hasGlasses: boolean;
  hasHat: boolean;
  hasBeard: boolean;
}

export const AVATAR_STYLES = {
  adventurer: {
    id: 'adventurer',
    name: "Приключенец",
    style: adventurer,
    description: "Классический стиль приключений",
    urlKey: STYLE_URL_MAP.adventurer,
    filters: {
      hairColors: ["blonde", "brown", "black", "red", "gray"],
      eyeTypes: ["default", "happy", "wink", "surprised"],
      mouthTypes: ["smile", "open", "sad", "surprised"],
      accessories: ["glasses", "hat", "earrings"],
      clothingTypes: ["shirt", "hoodie", "jacket"],
      hasGlasses: true,
      hasHat: true,
      hasBeard: true
    }
  },
  adventurerNeutral: {
    id: 'adventurerNeutral',
    name: "Приключенец (нейтральный)",
    style: adventurerNeutral,
    description: "Нейтральная версия приключенца",
    urlKey: STYLE_URL_MAP.adventurerNeutral,
    filters: {
      hairColors: ["blonde", "brown", "black", "red", "gray"],
      eyeTypes: ["default", "happy", "wink", "surprised"],
      mouthTypes: ["smile", "open", "sad", "surprised"],
      accessories: ["glasses", "hat", "earrings"],
      clothingTypes: ["shirt", "hoodie", "jacket"],
      hasGlasses: true,
      hasHat: true,
      hasBeard: true
    }
  },
  avataaars: {
    id: 'avataaars',
    name: "Аватаары",
    style: avataaars,
    description: "Популярный стиль с множеством вариаций",
    urlKey: STYLE_URL_MAP.avataaars,
    filters: {
      hairColors: ["blonde", "brown", "black", "red", "gray", "blue", "pink"],
      eyeTypes: ["default", "happy", "wink", "surprised", "cute"],
      mouthTypes: ["smile", "open", "sad", "surprised", "tongue"],
      accessories: ["glasses", "sunglasses", "hat", "earrings"],
      clothingTypes: ["shirt", "hoodie", "jacket", "dress"],
      hasGlasses: true,
      hasHat: true,
      hasBeard: true
    }
  },
  avataaarsNeutral: {
    id: 'avataaarsNeutral',
    name: "Аватаары (нейтральный)",
    style: avataaarsNeutral,
    description: "Нейтральные аватаары",
    urlKey: STYLE_URL_MAP.avataaarsNeutral,
    filters: {
      hairColors: ["blonde", "brown", "black", "red", "gray"],
      eyeTypes: ["default", "happy", "wink", "surprised"],
      mouthTypes: ["smile", "open", "sad", "surprised"],
      accessories: ["glasses", "hat"],
      clothingTypes: ["shirt", "hoodie", "jacket"],
      hasGlasses: true,
      hasHat: true,
      hasBeard: true
    }
  },
  bigEars: {
    id: 'bigEars',
    name: "Большие уши",
    style: bigEars,
    description: "Милые персонажи с большими ушами",
    urlKey: STYLE_URL_MAP.bigEars,
    filters: {
      hairColors: ["blonde", "brown", "black", "red", "gray"],
      eyeTypes: ["default", "happy", "wink"],
      mouthTypes: ["smile", "open", "sad"],
      accessories: ["glasses", "hat"],
      clothingTypes: ["shirt"],
      hasGlasses: true,
      hasHat: true,
      hasBeard: false
    }
  },
  bigEarsNeutral: {
    id: 'bigEarsNeutral',
    name: "Большие уши (нейтральный)",
    style: bigEarsNeutral,
    description: "Нейтральные персонажи с большими ушами",
    urlKey: STYLE_URL_MAP.bigEarsNeutral,
    filters: {
      hairColors: ["blonde", "brown", "black", "gray"],
      eyeTypes: ["default", "happy"],
      mouthTypes: ["smile", "sad"],
      accessories: ["glasses"],
      clothingTypes: ["shirt"],
      hasGlasses: true,
      hasHat: false,
      hasBeard: false
    }
  },
  bigSmile: {
    id: 'bigSmile',
    name: "Большая улыбка",
    style: bigSmile,
    description: "Весёлые персонажи с улыбками",
    urlKey: STYLE_URL_MAP.bigSmile,
    filters: {
      hairColors: ["blonde", "brown", "black"],
      eyeTypes: ["default", "happy"],
      mouthTypes: ["smile", "bigSmile"],
      accessories: ["glasses"],
      clothingTypes: ["shirt"],
      hasGlasses: true,
      hasHat: false,
      hasBeard: false
    }
  },
  bottts: {
    id: 'bottts',
    name: "Роботы",
    style: bottts,
    description: "Роботизированные аватары",
    urlKey: STYLE_URL_MAP.bottts,
    filters: {
      hairColors: [],
      eyeTypes: ["default", "robot", "led"],
      mouthTypes: ["default", "robot"],
      accessories: ["antenna", "glasses"],
      clothingTypes: [],
      hasGlasses: true,
      hasHat: true,
      hasBeard: false
    }
  },
  botttsNeutral: {
    id: 'botttsNeutral',
    name: "Роботы (нейтральный)",
    style: botttsNeutral,
    description: "Нейтральные роботы",
    urlKey: STYLE_URL_MAP.botttsNeutral,
    filters: {
      hairColors: [],
      eyeTypes: ["default", "robot"],
      mouthTypes: ["default"],
      accessories: ["antenna"],
      clothingTypes: [],
      hasGlasses: true,
      hasHat: false,
      hasBeard: false
    }
  },
  croodles: {
    id: 'croodles',
    name: "Крудельс",
    style: croodles,
    description: "Забавные каракульные персонажи",
    urlKey: STYLE_URL_MAP.croodles,
    filters: {
      hairColors: ["blonde", "brown", "black", "red"],
      eyeTypes: ["default", "happy", "wink"],
      mouthTypes: ["smile", "open", "sad"],
      accessories: ["glasses", "hat"],
      clothingTypes: ["shirt"],
      hasGlasses: true,
      hasHat: true,
      hasBeard: true
    }
  },
  croodlesNeutral: {
    id: 'croodlesNeutral',
    name: "Крудельс (нейтральный)",
    style: croodlesNeutral,
    description: "Нейтральные каракульные персонажи",
    urlKey: STYLE_URL_MAP.croodlesNeutral,
    filters: {
      hairColors: ["blonde", "brown", "black"],
      eyeTypes: ["default", "happy"],
      mouthTypes: ["smile", "sad"],
      accessories: ["glasses"],
      clothingTypes: ["shirt"],
      hasGlasses: true,
      hasHat: false,
      hasBeard: false
    }
  },
  funEmoji: {
    id: 'funEmoji',
    name: "Весёлые эмодзи",
    style: funEmoji,
    description: "Разнообразные смайлики",
    urlKey: STYLE_URL_MAP.funEmoji,
    filters: {
      hairColors: [],
      eyeTypes: ["default", "happy", "wink", "surprised"],
      mouthTypes: ["smile", "open", "sad", "surprised", "tongue"],
      accessories: ["glasses"],
      clothingTypes: [],
      hasGlasses: true,
      hasHat: false,
      hasBeard: false
    }
  },
  icons: {
    id: 'icons',
    name: "Иконки",
    style: icons,
    description: "Набор различных иконок",
    urlKey: STYLE_URL_MAP.icons,
    filters: {
      hairColors: [],
      eyeTypes: [],
      mouthTypes: [],
      accessories: [],
      clothingTypes: [],
      hasGlasses: false,
      hasHat: false,
      hasBeard: false
    }
  },
  identicon: {
    id: 'identicon',
    name: "Идентикон",
    style: identicon,
    description: "Уникальные идентификаторы на основе seed",
    urlKey: STYLE_URL_MAP.identicon,
    filters: {
      hairColors: [],
      eyeTypes: [],
      mouthTypes: [],
      accessories: [],
      clothingTypes: [],
      hasGlasses: false,
      hasHat: false,
      hasBeard: false
    }
  },
  initials: {
    id: 'initials',
    name: "Инициалы",
    style: initials,
    description: "Аватары из инициалов",
    urlKey: STYLE_URL_MAP.initials,
    filters: {
      hairColors: [],
      eyeTypes: [],
      mouthTypes: [],
      accessories: [],
      clothingTypes: [],
      hasGlasses: false,
      hasHat: false,
      hasBeard: false
    }
  },
  lorelei: {
    id: 'lorelei',
    name: "Лорелей",
    style: lorelei,
    description: "Стилизованные человеческие аватары",
    urlKey: STYLE_URL_MAP.lorelei,
    filters: {
      hairColors: ["blonde", "brown", "black", "red", "blue", "pink", "purple"],
      eyeTypes: ["default", "happy", "wink", "surprised", "cute"],
      mouthTypes: ["smile", "open", "sad", "surprised", "tongue"],
      accessories: ["glasses", "sunglasses", "hat", "earrings"],
      clothingTypes: ["shirt", "hoodie", "jacket", "dress"],
      hasGlasses: true,
      hasHat: true,
      hasBeard: true
    }
  },
  loreleiNeutral: {
    id: 'loreleiNeutral',
    name: "Лорелей (нейтральный)",
    style: loreleiNeutral,
    description: "Нейтральные стилизованные аватары",
    urlKey: STYLE_URL_MAP.loreleiNeutral,
    filters: {
      hairColors: ["blonde", "brown", "black", "red", "gray"],
      eyeTypes: ["default", "happy", "wink", "surprised"],
      mouthTypes: ["smile", "open", "sad", "surprised"],
      accessories: ["glasses", "hat"],
      clothingTypes: ["shirt", "hoodie", "jacket"],
      hasGlasses: true,
      hasHat: true,
      hasBeard: true
    }
  },
  micah: {
    id: 'micah',
    name: "Майка",
    style: micah,
    description: "Уникальные персонажи в стиле Майки",
    urlKey: STYLE_URL_MAP.micah,
    filters: {
      hairColors: ["blonde", "brown", "black", "red", "blue", "pink"],
      eyeTypes: ["default", "happy", "wink", "surprised"],
      mouthTypes: ["smile", "open", "sad", "surprised"],
      accessories: ["glasses", "hat", "earrings"],
      clothingTypes: ["shirt", "hoodie", "jacket"],
      hasGlasses: true,
      hasHat: true,
      hasBeard: true
    }
  },
  miniavs: {
    id: 'miniavs',
    name: "Мини-аватары",
    style: miniavs,
    description: "Маленькие детализированные аватары",
    urlKey: STYLE_URL_MAP.miniavs,
    filters: {
      hairColors: ["blonde", "brown", "black", "red", "gray"],
      eyeTypes: ["default", "happy", "wink"],
      mouthTypes: ["smile", "open", "sad"],
      accessories: ["glasses", "hat"],
      clothingTypes: ["shirt", "hoodie"],
      hasGlasses: true,
      hasHat: true,
      hasBeard: false
    }
  },
  notionists: {
    id: 'notionists',
    name: "Ноушионисты",
    style: notionists,
    description: "Стиль вдохновленный Notion",
    urlKey: STYLE_URL_MAP.notionists,
    filters: {
      hairColors: ["blonde", "brown", "black", "red", "blue", "purple"],
      eyeTypes: ["default", "happy", "wink", "surprised"],
      mouthTypes: ["smile", "open", "sad", "surprised"],
      accessories: ["glasses", "hat", "earrings"],
      clothingTypes: ["shirt", "hoodie", "jacket"],
      hasGlasses: true,
      hasHat: true,
      hasBeard: true
    }
  },
  notionistsNeutral: {
    id: 'notionistsNeutral',
    name: "Ноушионисты (нейтральный)",
    style: notionistsNeutral,
    description: "Нейтральная версия стиля Notion",
    urlKey: STYLE_URL_MAP.notionistsNeutral,
    filters: {
      hairColors: ["blonde", "brown", "black", "red", "gray"],
      eyeTypes: ["default", "happy", "wink"],
      mouthTypes: ["smile", "open", "sad"],
      accessories: ["glasses", "hat"],
      clothingTypes: ["shirt", "hoodie"],
      hasGlasses: true,
      hasHat: true,
      hasBeard: false
    }
  },
  openPeeps: {
    id: 'openPeeps',
    name: "Open Peeps",
    style: openPeeps,
    description: "Открытые персонажи из библиотеки Peeps",
    urlKey: STYLE_URL_MAP.openPeeps,
    filters: {
      hairColors: ["blonde", "brown", "black", "red", "blue", "pink", "purple"],
      eyeTypes: ["default", "happy", "wink", "surprised", "cute"],
      mouthTypes: ["smile", "open", "sad", "surprised", "tongue"],
      accessories: ["glasses", "sunglasses", "hat", "earrings"],
      clothingTypes: ["shirt", "hoodie", "jacket", "dress"],
      hasGlasses: true,
      hasHat: true,
      hasBeard: true
    }
  },
  personas: {
    id: 'personas',
    name: "Персонажи",
    style: personas,
    description: "Различные человеческие персонажи",
    urlKey: STYLE_URL_MAP.personas,
    filters: {
      hairColors: ["blonde", "brown", "black", "red", "gray", "blue"],
      eyeTypes: ["default", "happy", "wink", "surprised"],
      mouthTypes: ["smile", "open", "sad", "surprised"],
      accessories: ["glasses", "hat", "earrings"],
      clothingTypes: ["shirt", "hoodie", "jacket", "dress"],
      hasGlasses: true,
      hasHat: true,
      hasBeard: true
    }
  },
  pixelArt: {
    id: 'pixelArt',
    name: "Пиксель-арт",
    style: pixelArt,
    description: "Пиксельные аватары",
    urlKey: STYLE_URL_MAP.pixelArt,
    filters: {
      hairColors: ["blonde", "brown", "black", "red", "blue", "green"],
      eyeTypes: ["default", "happy", "wink"],
      mouthTypes: ["smile", "open", "sad"],
      accessories: ["glasses", "hat"],
      clothingTypes: ["shirt"],
      hasGlasses: true,
      hasHat: true,
      hasBeard: false
    }
  },
  pixelArtNeutral: {
    id: 'pixelArtNeutral',
    name: "Пиксель-арт (нейтральный)",
    style: pixelArtNeutral,
    description: "Нейтральные пиксельные аватары",
    urlKey: STYLE_URL_MAP.pixelArtNeutral,
    filters: {
      hairColors: ["blonde", "brown", "black", "red", "gray"],
      eyeTypes: ["default", "happy"],
      mouthTypes: ["smile", "sad"],
      accessories: ["glasses"],
      clothingTypes: ["shirt"],
      hasGlasses: true,
      hasHat: false,
      hasBeard: false
    }
  },
  rings: {
    id: 'rings',
    name: "Кольца",
    style: rings,
    description: "Геометрические аватары из колец",
    urlKey: STYLE_URL_MAP.rings,
    filters: {
      hairColors: [],
      eyeTypes: [],
      mouthTypes: [],
      accessories: [],
      clothingTypes: [],
      hasGlasses: false,
      hasHat: false,
      hasBeard: false
    }
  },
  shapes: {
    id: 'shapes',
    name: "Фигуры",
    style: shapes,
    description: "Аватары из геометрических фигур",
    urlKey: STYLE_URL_MAP.shapes,
    filters: {
      hairColors: [],
      eyeTypes: [],
      mouthTypes: [],
      accessories: [],
      clothingTypes: [],
      hasGlasses: false,
      hasHat: false,
      hasBeard: false
    }
  },
  thumbs: {
    id: 'thumbs',
    name: "Большие пальцы",
    style: thumbs,
    description: "Милые персонажи с большими пальцами",
    urlKey: STYLE_URL_MAP.thumbs,
    filters: {
      hairColors: ["blonde", "brown", "black", "red"],
      eyeTypes: ["default", "happy", "wink"],
      mouthTypes: ["smile", "open", "sad"],
      accessories: ["glasses", "hat"],
      clothingTypes: ["shirt"],
      hasGlasses: true,
      hasHat: true,
      hasBeard: false
    }
  }
} as const;

export const AVATAR_STYLES_LIST = Object.values(AVATAR_STYLES);

export type AvatarStyleId = keyof typeof AVATAR_STYLES;