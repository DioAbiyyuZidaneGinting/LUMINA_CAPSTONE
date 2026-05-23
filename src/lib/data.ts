export interface Product {
  id: number | string;
  name: string;
  price: number;
  category: string;
  images: string[];
  inStock?: boolean;
  in_stock?: boolean;
  stock?: number;
}

export const PRODUCTS: Product[] = [
  // PRIA
  {
    id: 1,
    name: "Kemeja Oxford Klasik",
    price: 129,
    category: "Pakaian Pria",
    images: [
      "https://i.pinimg.com/1200x/a1/6e/a2/a16ea27659bf9ae6af66440422c74b8b.jpg",
    ],
    inStock: true,
  },
  {
    id: 2,
    name: "Blazer Wol Premium",
    price: 399,
    category: "Pakaian Pria",
    images: [
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400",
    ],
    inStock: true,
  },
  {
    id: 3,
    name: "Jaket Denim Vintage",
    price: 149,
    category: "Pakaian Pria",
    images: ["https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400"],
    inStock: true,
  },
  {
    id: 4,
    name: "Sweater Rajut Pria",
    price: 119,
    category: "Pakaian Pria",
    images: [
      "https://images.unsplash.com/photo-1516826957135-700ede19c6ce?w=400",
    ],
    inStock: true,
  },
  {
    id: 5,
    name: "Setelan Jas Elegan",
    price: 599,
    category: "Pakaian Pria",
    images: [
      "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=400",
    ],
    inStock: true,
  },
  {
    id: 6,
    name: "Mantel Musim Dingin",
    price: 299,
    category: "Pakaian Pria",
    images: [
      "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400",
    ],
    inStock: false,
  },
  {
    id: 7,
    name: "Kemeja Kasual Linen",
    price: 89,
    category: "Pakaian Pria",
    images: ["https://images.unsplash.com/photo-1559582798-678dfc71cee4?w=400"],
    inStock: true,
  },
  {
    id: 8,
    name: "Kaos Basic Katun",
    price: 39,
    category: "Pakaian Pria",
    images: [
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=400",
    ],
    inStock: true,
  },
  {
    id: 9,
    name: "Jaket Kulit Premium",
    price: 449,
    category: "Pakaian Pria",
    images: [
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=400",
    ],
    inStock: true,
  },

  // WANITA
  {
    id: 10,
    name: "Sweater Kasmir Lembut",
    price: 249,
    category: "Pakaian Wanita",
    images: [
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400",
    ],
    inStock: true,
  },
  {
    id: 11,
    name: "Gaun Malam Sutra",
    price: 329,
    category: "Pakaian Wanita",
    images: [
      "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400",
    ],
    inStock: true,
  },
  {
    id: 12,
    name: "Blus Putih Elegan",
    price: 99,
    category: "Pakaian Wanita",
    images: [
      "https://images.unsplash.com/photo-1515347619252-8d282cb4ce98?w=400",
    ],
    inStock: true,
  },
  {
    id: 13,
    name: "Rok Plisket Midi",
    price: 119,
    category: "Pakaian Wanita",
    images: ["https://images.unsplash.com/photo-1554412933-514a83d2f3c8?w=400"],
    inStock: true,
  },
  {
    id: 14,
    name: "Jaket Biker Kulit",
    price: 289,
    category: "Pakaian Wanita",
    images: [
      "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=400",
    ],
    inStock: false,
  },
  {
    id: 15,
    name: "Mantel Panjang Klasik",
    price: 359,
    category: "Pakaian Wanita",
    images: [
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400",
    ],
    inStock: true,
  },
  {
    id: 16,
    name: "Gaun Musim Panas",
    price: 149,
    category: "Pakaian Wanita",
    images: ["https://images.unsplash.com/photo-1550639525-c97d455acf70?w=400"],
    inStock: true,
  },
  {
    id: 17,
    name: "Kardigan Wol Rajut",
    price: 179,
    category: "Pakaian Wanita",
    images: [
      "https://images.unsplash.com/photo-1502716115624-b565eab5a4ad?w=400",
    ],
    inStock: true,
  },
  {
    id: 18,
    name: "Kaos Santai V-Neck",
    price: 45,
    category: "Pakaian Wanita",
    images: [
      "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=400",
    ],
    inStock: true,
  },

  // AKSESORIS
  {
    id: 19,
    name: "Dompet Kulit Minimalis",
    price: 89,
    category: "Aksesoris",
    images: [
      "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400",
    ],
    inStock: true,
  },
  {
    id: 20,
    name: "Koleksi Syal Sutra",
    price: 159,
    category: "Aksesoris",
    images: [
      "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400",
    ],
    inStock: false,
  },
  {
    id: 21,
    name: "Kacamata Hitam Desainer",
    price: 199,
    category: "Aksesoris",
    images: [
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400",
    ],
    inStock: true,
  },
  {
    id: 22,
    name: "Jam Tangan Kronograf",
    price: 499,
    category: "Aksesoris",
    images: [
      "https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=400",
    ],
    inStock: true,
  },
  {
    id: 23,
    name: "Sabuk Kulit Asli",
    price: 79,
    category: "Aksesoris",
    images: [
      "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=400",
    ],
    inStock: true,
  },
  {
    id: 24,
    name: "Sepatu Sneakers Kasual",
    price: 219,
    category: "Aksesoris",
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"],
    inStock: true,
  },
  {
    id: 25,
    name: "Tas Ransel Kanvas",
    price: 149,
    category: "Aksesoris",
    images: [
      "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=400",
    ],
    inStock: true,
  },
  {
    id: 26,
    name: "Topi Fedora Klasik",
    price: 69,
    category: "Aksesoris",
    images: [
      "https://images.unsplash.com/photo-1599643478524-fb66f4568e21?w=400",
    ],
    inStock: true,
  },
  {
    id: 27,
    name: "Kalung Liontin Perak",
    price: 129,
    category: "Aksesoris",
    images: [
      "https://images.unsplash.com/photo-1515562141207-7a48cf7ce815?w=400",
    ],
    inStock: true,
  },
];

export const CATEGORIES = [
  {
    name: "Baju",
    slug: "baju",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200",
  },

  {
    name: "Celana",
    slug: "celana",
    image:
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=1200",
  },

  {
    name: "Sepatu",
    slug: "sepatu",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200",
  },

  {
    name: "Tas",
    slug: "tas",
    image:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1200",
  },

  {
    name: "Tali Pinggang",
    slug: "tali-pinggang",
    image:
      "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=1200",
  },

  {
    name: "Sandal",
    slug: "sandal",
    image:
      "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=1200",
  },

  {
    name: "Topi",
    slug: "topi",
    image:
      "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=1200",
  },
];
