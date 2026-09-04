import { Router, type IRouter } from "express";
import { OFFICIAL_PRODUCT_CATALOG } from "../business-logic";

const router: IRouter = Router();

export const STORE_CATALOG_METADATA = [
  {
    id: 1,
    title: "Baggy Jogger",
    category: "jogger",
    price: 2900,
    badge: "BESTSELLER",
    inStock: true,
    isOneOfOne: false,
    stockCount: 15,
    sizes: ["M", "L", "XL"],
    colors: ["Black", "Grey"],
  },
  {
    id: 2,
    title: "Thrifted Gymshark T-Shirt",
    category: "tshirt",
    price: 2000,
    badge: "THRIFT 1 OF 1",
    inStock: true,
    isOneOfOne: true,
    stockCount: 1,
    sizes: ["S"],
    colors: ["Onyx Black"],
  },
  {
    id: 3,
    title: "Vintage Hard Rock Cafe Tee",
    category: "tshirt",
    price: 2400,
    badge: "ARCHIVE 1 OF 1",
    inStock: true,
    isOneOfOne: true,
    stockCount: 1,
    sizes: ["M"],
    colors: ["Navy Blue"],
  },
  {
    id: 4,
    title: "The Finalflash Street Set",
    category: "bundle",
    price: 4300,
    badge: "SAVE 600 DA",
    inStock: true,
    isOneOfOne: false,
    stockCount: 3,
    sizes: ["Set Customizer"],
    colors: ["Black Set", "Grey Set"],
  },
  {
    id: 5,
    title: "Carhartt Vintage Baggy Pants",
    category: "pants",
    price: 4500,
    badge: "ARCHIVE 1 OF 1",
    inStock: true,
    isOneOfOne: true,
    stockCount: 1,
    sizes: ["W32-34"],
    colors: ["Duck Brown"],
  },
  {
    id: 6,
    title: "Converse All Star High 1990s",
    category: "shoes",
    price: 5200,
    badge: "VINTAGE 9.5/10",
    inStock: true,
    isOneOfOne: true,
    stockCount: 1,
    sizes: ["EU 42"],
    colors: ["Optical White"],
  },
];

router.get("/products", (_req, res) => {
  res.json(STORE_CATALOG_METADATA);
});

router.get("/products/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const item = STORE_CATALOG_METADATA.find((p) => p.id === id);
  if (!item) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json(item);
});

export default router;
