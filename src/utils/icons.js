import {
  Invoice01Icon,
  Restaurant01Icon,
  Coffee01Icon,
  Car01Icon,
  Hotel01Icon,
  ShoppingBag01Icon,
  Ticket01Icon,
  FlashIcon,
  InternetIcon,
  GiftIcon,
  Medicine01Icon,
  Shirt01Icon,
  GameController01Icon,
} from "@hugeicons/core-free-icons";

export const ICON_MAP = {
  general: Invoice01Icon,
  food: Restaurant01Icon,
  drink: Coffee01Icon,
  transport: Car01Icon,
  accommodation: Hotel01Icon,
  shopping: ShoppingBag01Icon,
  entertainment: Ticket01Icon,
  utilities: FlashIcon,
  internet: InternetIcon,
  gift: GiftIcon,
  health: Medicine01Icon,
  clothes: Shirt01Icon,
  gaming: GameController01Icon,
};

export const ICON_LIST = [
  { value: "general", label: "ทั่วไป / General", icon: Invoice01Icon },
  { value: "food", label: "อาหาร / Food", icon: Restaurant01Icon },
  { value: "drink", label: "เครื่องดื่ม / Drink", icon: Coffee01Icon },
  { value: "transport", label: "เดินทาง / Transport", icon: Car01Icon },
  { value: "accommodation", label: "ที่พัก / Hotel", icon: Hotel01Icon },
  { value: "shopping", label: "ช้อปปิ้ง / Shopping", icon: ShoppingBag01Icon },
  { value: "entertainment", label: "บันเทิง / Entertainment", icon: Ticket01Icon },
  { value: "utilities", label: "ค่าน้ำ-ค่าไฟ / Utilities", icon: FlashIcon },
  { value: "internet", label: "อินเทอร์เน็ต / Internet", icon: InternetIcon },
  { value: "gift", label: "ของขวัญ / Gift", icon: GiftIcon },
  { value: "health", label: "สุขภาพ / Health", icon: Medicine01Icon },
  { value: "clothes", label: "เสื้อผ้า / Clothes", icon: Shirt01Icon },
  { value: "gaming", label: "เกม / Gaming", icon: GameController01Icon },
];

export function getIcon(name) {
  return ICON_MAP[name] || Invoice01Icon;
}

export function getLocalizedIconLabel(item, lang) {
  if (!item || !item.label) return "";
  const parts = item.label.split(' / ');
  if (lang === 'en') {
    return parts[1] || parts[0];
  }
  return parts[0];
}

