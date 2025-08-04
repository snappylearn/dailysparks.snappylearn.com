import { db } from "../server/db";
import { examinationSystems, levels, subjects } from "@shared/schema";

async function seedData() {
  console.log("Seeding examination systems and levels...");

  try {
    // Create KCSE examination system
    const [kcseSystem] = await db.insert(examinationSystems)
      .values({
        name: "Kenya Certificate of Secondary Education",
        code: "KCSE",
        description: "The national secondary school leaving examination in Kenya",
        country: "Kenya",
        isActive: true,
      })
      .onConflictDoNothing()
      .returning();

    // Create IGCSE examination system
    const [igcseSystem] = await db.insert(examinationSystems)
      .values({
        name: "International General Certificate of Secondary Education",
        code: "IGCSE",
        description: "International qualification for secondary school students",
        country: "International",
        isActive: true,
      })
      .onConflictDoNothing()
      .returning();

    // Create KPSEA examination system
    const [kpseaSystem] = await db.insert(examinationSystems)
      .values({
        name: "Kenya Primary School Education Assessment",
        code: "KPSEA",
        description: "Primary school assessment system in Kenya",
        country: "Kenya",
        isActive: true,
      })
      .onConflictDoNothing()
      .returning();

    console.log("Created examination systems");

    // Get examination systems to create levels
    const systems = await db.select().from(examinationSystems);
    const kcse = systems.find(s => s.code === "KCSE");
    const igcse = systems.find(s => s.code === "IGCSE");
    const kpsea = systems.find(s => s.code === "KPSEA");

    if (kcse) {
      // Create KCSE levels (Form 1-4)
      await db.insert(levels)
        .values([
          {
            title: "Form 1",
            description: "First year of secondary education",
            examinationSystemId: kcse.id,
            order: 1,
            isActive: true,
          },
          {
            title: "Form 2",
            description: "Second year of secondary education",
            examinationSystemId: kcse.id,
            order: 2,
            isActive: true,
          },
          {
            title: "Form 3",
            description: "Third year of secondary education",
            examinationSystemId: kcse.id,
            order: 3,
            isActive: true,
          },
          {
            title: "Form 4",
            description: "Final year of secondary education",
            examinationSystemId: kcse.id,
            order: 4,
            isActive: true,
          },
        ])
        .onConflictDoNothing();
    }

    if (igcse) {
      // Create IGCSE levels (Year 9-11)
      await db.insert(levels)
        .values([
          {
            title: "Year 9",
            description: "First year of IGCSE preparation",
            examinationSystemId: igcse.id,
            order: 1,
            isActive: true,
          },
          {
            title: "Year 10",
            description: "Second year of IGCSE preparation",
            examinationSystemId: igcse.id,
            order: 2,
            isActive: true,
          },
          {
            title: "Year 11",
            description: "IGCSE examination year",
            examinationSystemId: igcse.id,
            order: 3,
            isActive: true,
          },
        ])
        .onConflictDoNothing();
    }

    if (kpsea) {
      // Create KPSEA levels (Grade 1-8)
      await db.insert(levels)
        .values([
          {
            title: "Grade 1",
            description: "First grade of primary education",
            examinationSystemId: kpsea.id,
            order: 1,
            isActive: true,
          },
          {
            title: "Grade 2",
            description: "Second grade of primary education",
            examinationSystemId: kpsea.id,
            order: 2,
            isActive: true,
          },
          {
            title: "Grade 3",
            description: "Third grade of primary education",
            examinationSystemId: kpsea.id,
            order: 3,
            isActive: true,
          },
          {
            title: "Grade 4",
            description: "Fourth grade of primary education",
            examinationSystemId: kpsea.id,
            order: 4,
            isActive: true,
          },
          {
            title: "Grade 5",
            description: "Fifth grade of primary education",
            examinationSystemId: kpsea.id,
            order: 5,
            isActive: true,
          },
          {
            title: "Grade 6",
            description: "Sixth grade of primary education",
            examinationSystemId: kpsea.id,
            order: 6,
            isActive: true,
          },
          {
            title: "Grade 7",
            description: "Seventh grade of primary education",
            examinationSystemId: kpsea.id,
            order: 7,
            isActive: true,
          },
          {
            title: "Grade 8",
            description: "Final grade of primary education",
            examinationSystemId: kpsea.id,
            order: 8,
            isActive: true,
          },
        ])
        .onConflictDoNothing();
    }

    console.log("Created levels for all examination systems");

    // Create some basic subjects for KCSE
    if (kcse) {
      await db.insert(subjects)
        .values([
          {
            name: "Mathematics",
            code: "MATH",
            examinationSystemId: kcse.id,
            icon: "calculator",
            color: "#3B82F6",
          },
          {
            name: "English",
            code: "ENG",
            examinationSystemId: kcse.id,
            icon: "book",
            color: "#10B981",
          },
          {
            name: "Kiswahili",
            code: "KISW",
            examinationSystemId: kcse.id,
            icon: "globe",
            color: "#F59E0B",
          },
          {
            name: "Biology",
            code: "BIO",
            examinationSystemId: kcse.id,
            icon: "leaf",
            color: "#059669",
          },
          {
            name: "Physics",
            code: "PHY",
            examinationSystemId: kcse.id,
            icon: "atom",
            color: "#7C3AED",
          },
          {
            name: "Chemistry",
            code: "CHEM",
            examinationSystemId: kcse.id,
            icon: "flask",
            color: "#DC2626",
          },
        ])
        .onConflictDoNothing();
    }

    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding data:", error);
    throw error;
  }
}

// Run the seed function
seedData().catch(console.error);