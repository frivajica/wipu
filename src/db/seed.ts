import { db } from "./index";
import { currencies } from "./schema";

async function seed() {
  console.log("Seeding currencies...");

  await db
    .insert(currencies)
    .values([
      { code: "MXN", name: "Mexican Peso", symbol: "$", decimalPlaces: 2 },
      { code: "USD", name: "US Dollar", symbol: "$", decimalPlaces: 2 },
      { code: "EUR", name: "Euro", symbol: "€", decimalPlaces: 2 },
      { code: "GBP", name: "British Pound", symbol: "£", decimalPlaces: 2 },
      { code: "JPY", name: "Japanese Yen", symbol: "¥", decimalPlaces: 0 },
    ])
    .onConflictDoNothing();

  console.log("Currencies seeded successfully");
}

seed().catch(console.error);
