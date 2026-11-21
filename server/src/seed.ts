import { categories, locations, users, wasteRecords } from "./data/demo.js";

console.log("Synthetic seed data ready:");
console.log(`${users.length} users, ${locations.length} locations, ${categories.length} categories, ${wasteRecords.length} waste records`);
console.log("Use Prisma migrations to persist this shape in PostgreSQL.");
