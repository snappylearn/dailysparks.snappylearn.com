import { db } from "../server/db";
import { terms, type InsertTerm } from "@shared/schema";

const termsData: InsertTerm[] = [
  {
    title: "Term 1",
    description: "First academic term covering foundational topics",
    order: 1,
  },
  {
    title: "Term 2", 
    description: "Second academic term with intermediate topics",
    order: 2,
  },
  {
    title: "Term 3",
    description: "Third academic term with advanced and review topics", 
    order: 3,
  }
];

export async function seedTerms(): Promise<void> {
  console.log("Starting to seed terms...");
  
  try {
    // Insert terms
    const insertedTerms = await db.insert(terms).values(termsData).returning();
    console.log(`Successfully seeded ${insertedTerms.length} terms`);
    
    for (const term of insertedTerms) {
      console.log(`Added term: ${term.title} (${term.id})`);
    }
    
  } catch (error) {
    console.error("Error seeding terms:", error);
    throw error;
  }
}

// Run the seeding if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedTerms()
    .then(() => {
      console.log("Terms seeding completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Terms seeding failed:", error);
      process.exit(1);
    });
}