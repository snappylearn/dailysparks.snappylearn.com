import { db } from "../server/db";
import { topics, terms, subjects, levels, examinationSystems, type InsertTopic } from "@shared/schema";
import { eq } from "drizzle-orm";

// Define Form 1 Biology topics with proper academic structure
const form1BiologyTopics = {
  term1: [
    {
      title: "Introduction to Biology",
      description: "What is biology? Branches of biology and their importance",
      summaryContent: "Understanding biology as the study of living organisms and its various branches"
    },
    {
      title: "Characteristics of Living Things",
      description: "Seven characteristics that define living organisms",
      summaryContent: "Nutrition, respiration, excretion, growth, reproduction, irritability, and movement"
    },
    {
      title: "Classification I",
      description: "Need for classification and taxonomic hierarchy",
      summaryContent: "Kingdom, Phylum, Class, Order, Family, Genus, Species classification system"
    },
    {
      title: "Cell Structure and Organization",
      description: "Basic unit of life - cell structure and components",
      summaryContent: "Cell membrane, cytoplasm, nucleus, and organelles in plant and animal cells"
    },
    {
      title: "Nutrition I - Modes of Nutrition",
      description: "Different ways organisms obtain nutrients",
      summaryContent: "Autotrophic and heterotrophic nutrition, photosynthesis basics"
    },
    {
      title: "Nutrition II - Human Nutrition",
      description: "Human digestive system and nutrition requirements",
      summaryContent: "Balanced diet, digestive system structure and function"
    },
    {
      title: "Nutrition III - Plant Nutrition",
      description: "How plants make and obtain food",
      summaryContent: "Photosynthesis process, factors affecting photosynthesis"
    }
  ],
  term2: [
    {
      title: "Respiration I - Gaseous Exchange",
      description: "How organisms exchange gases with environment",
      summaryContent: "Breathing mechanisms in humans, plants, and other organisms"
    },
    {
      title: "Respiration II - Cellular Respiration",
      description: "How cells release energy from food",
      summaryContent: "Aerobic and anaerobic respiration, ATP production"
    },
    {
      title: "Transport I - Transport in Plants",
      description: "How materials move in plants",
      summaryContent: "Xylem and phloem transport, transpiration"
    },
    {
      title: "Transport II - Transport in Animals",
      description: "Circulatory systems in animals",
      summaryContent: "Human circulatory system, blood composition and functions"
    },
    {
      title: "Excretion",
      description: "Removal of waste products from organisms",
      summaryContent: "Human excretory system, kidney structure and function"
    },
    {
      title: "Coordination I - Nervous System",
      description: "How organisms respond to stimuli",
      summaryContent: "Human nervous system, reflex actions, sense organs"
    },
    {
      title: "Coordination II - Hormonal Control",
      description: "Chemical coordination in organisms",
      summaryContent: "Endocrine system, major hormones and their functions"
    }
  ],
  term3: [
    {
      title: "Reproduction I - Asexual Reproduction",
      description: "Reproduction without gametes",
      summaryContent: "Binary fission, budding, fragmentation, vegetative propagation"
    },
    {
      title: "Reproduction II - Sexual Reproduction",
      description: "Reproduction involving gametes",
      summaryContent: "Human reproductive system, flower structure and pollination"
    },
    {
      title: "Growth and Development",
      description: "How organisms grow and develop",
      summaryContent: "Growth patterns, development stages, factors affecting growth"
    },
    {
      title: "Classification II - Five Kingdoms",
      description: "Detailed study of the five kingdoms of life",
      summaryContent: "Monera, Protista, Fungi, Plantae, Animalia characteristics"
    },
    {
      title: "Ecology I - Ecosystems",
      description: "Interactions between organisms and environment",
      summaryContent: "Food chains, food webs, energy flow in ecosystems"
    },
    {
      title: "Ecology II - Conservation",
      description: "Protecting our environment and biodiversity",
      summaryContent: "Environmental pollution, conservation methods, sustainable development"
    }
  ]
};

// Define Form 1 Mathematics topics
const form1MathematicsTopics = {
  term1: [
    {
      title: "Natural Numbers",
      description: "Place values, rounding off, operations with natural numbers",
      summaryContent: "Understanding the basic number system and operations"
    },
    {
      title: "Factors and Multiples",
      description: "Finding factors, multiples, HCF and LCM",
      summaryContent: "Prime factorization, greatest common factor, least common multiple"
    },
    {
      title: "Integers",
      description: "Positive and negative whole numbers",
      summaryContent: "Operations with integers, number line representation"
    },
    {
      title: "Fractions",
      description: "Parts of a whole, operations with fractions",
      summaryContent: "Proper, improper, mixed fractions, addition, subtraction, multiplication, division"
    },
    {
      title: "Decimals",
      description: "Decimal numbers and operations",
      summaryContent: "Place value in decimals, operations with decimal numbers"
    },
    {
      title: "Squares and Square Roots",
      description: "Perfect squares and finding square roots",
      summaryContent: "Properties of squares, methods of finding square roots"
    },
    {
      title: "Algebraic Expressions",
      description: "Introduction to algebra and basic expressions",
      summaryContent: "Variables, constants, terms, like and unlike terms"
    }
  ],
  term2: [
    {
      title: "Rates, Ratio and Proportion",
      description: "Comparing quantities and rates",
      summaryContent: "Direct and inverse proportion, solving proportion problems"
    },
    {
      title: "Percentages",
      description: "Parts per hundred and percentage calculations",
      summaryContent: "Converting between fractions, decimals and percentages"
    },
    {
      title: "Commercial Arithmetic",
      description: "Money calculations and business mathematics",
      summaryContent: "Profit and loss, simple interest, commission"
    },
    {
      title: "Length and Perimeter",
      description: "Measuring distances and perimeters",
      summaryContent: "Units of length, perimeter of polygons"
    },
    {
      title: "Area",
      description: "Measuring surface area of shapes",
      summaryContent: "Area of rectangles, squares, triangles, circles"
    },
    {
      title: "Volume and Capacity",
      description: "Three-dimensional measurements",
      summaryContent: "Volume of cubes, cuboids, cylinders; capacity units"
    },
    {
      title: "Mass, Density and Weight",
      description: "Measuring matter and its properties",
      summaryContent: "Units of mass, density calculations, weight vs mass"
    }
  ],
  term3: [
    {
      title: "Time",
      description: "Time calculations and conversions",
      summaryContent: "12-hour and 24-hour systems, time zones, speed-time-distance"
    },
    {
      title: "Linear Equations",
      description: "Solving equations with one variable",
      summaryContent: "Simple linear equations, word problems"
    },
    {
      title: "Coordinates and Graphs",
      description: "Plotting points and reading graphs",
      summaryContent: "Cartesian plane, coordinates, simple graphs"
    },
    {
      title: "Angles and Plane Figures",
      description: "Types of angles and geometric shapes",
      summaryContent: "Acute, obtuse, right angles; triangles, quadrilaterals"
    },
    {
      title: "Geometric Constructions",
      description: "Drawing geometric figures accurately",
      summaryContent: "Using compass and ruler for constructions"
    },
    {
      title: "Scale Drawing",
      description: "Drawing to scale and interpreting scaled drawings",
      summaryContent: "Ratios in drawings, map reading"
    },
    {
      title: "Common Solids",
      description: "Three-dimensional shapes and their properties",
      summaryContent: "Cubes, cuboids, cylinders, cones, spheres"
    }
  ]
};

export async function seedTopicsNew(): Promise<void> {
  console.log("Starting to seed Form 1 topics with new structure...");
  
  try {
    // Get required references
    const [kcseSystem] = await db.select().from(examinationSystems).where(eq(examinationSystems.name, "Kenya Certificate of Secondary Education"));
    if (!kcseSystem) throw new Error("KCSE system not found");

    const [form1Level] = await db.select().from(levels).where(eq(levels.title, "Form 1"));
    if (!form1Level) throw new Error("Form 1 level not found");

    const allSubjects = await db.select().from(subjects);
    const biologySubject = allSubjects.find(s => s.name === "Biology");
    const mathSubject = allSubjects.find(s => s.name === "Mathematics");
    
    if (!biologySubject || !mathSubject) {
      throw new Error("Required subjects not found");
    }

    const allTerms = await db.select().from(terms);
    const term1 = allTerms.find(t => t.title === "Term 1");
    const term2 = allTerms.find(t => t.title === "Term 2"); 
    const term3 = allTerms.find(t => t.title === "Term 3");

    if (!term1 || !term2 || !term3) {
      throw new Error("Terms not found");
    }

    // Prepare topics data
    const topicsToInsert: InsertTopic[] = [];

    // Add Biology topics
    form1BiologyTopics.term1.forEach((topic, index) => {
      topicsToInsert.push({
        examinationSystemId: kcseSystem.id,
        subjectId: biologySubject.id,
        levelId: form1Level.id,
        termId: term1.id,
        title: topic.title,
        description: topic.description,
        summaryContent: topic.summaryContent,
        order: index + 1
      });
    });

    form1BiologyTopics.term2.forEach((topic, index) => {
      topicsToInsert.push({
        examinationSystemId: kcseSystem.id,
        subjectId: biologySubject.id,
        levelId: form1Level.id,
        termId: term2.id,
        title: topic.title,
        description: topic.description,
        summaryContent: topic.summaryContent,
        order: index + 1
      });
    });

    form1BiologyTopics.term3.forEach((topic, index) => {
      topicsToInsert.push({
        examinationSystemId: kcseSystem.id,
        subjectId: biologySubject.id,
        levelId: form1Level.id,
        termId: term3.id,
        title: topic.title,
        description: topic.description,
        summaryContent: topic.summaryContent,
        order: index + 1
      });
    });

    // Add Mathematics topics
    form1MathematicsTopics.term1.forEach((topic, index) => {
      topicsToInsert.push({
        examinationSystemId: kcseSystem.id,
        subjectId: mathSubject.id,
        levelId: form1Level.id,
        termId: term1.id,
        title: topic.title,
        description: topic.description, 
        summaryContent: topic.summaryContent,
        order: index + 1
      });
    });

    form1MathematicsTopics.term2.forEach((topic, index) => {
      topicsToInsert.push({
        examinationSystemId: kcseSystem.id,
        subjectId: mathSubject.id,
        levelId: form1Level.id,
        termId: term2.id,
        title: topic.title,
        description: topic.description,
        summaryContent: topic.summaryContent,
        order: index + 1
      });
    });

    form1MathematicsTopics.term3.forEach((topic, index) => {
      topicsToInsert.push({
        examinationSystemId: kcseSystem.id,
        subjectId: mathSubject.id,
        levelId: form1Level.id,
        termId: term3.id,
        title: topic.title,
        description: topic.description,
        summaryContent: topic.summaryContent,
        order: index + 1
      });
    });

    console.log(`Prepared ${topicsToInsert.length} topics for insertion`);

    // Insert all topics
    const insertedTopics = await db.insert(topics).values(topicsToInsert).returning();
    
    console.log(`Successfully inserted ${insertedTopics.length} topics`);
    
    // Log inserted topics by subject and term
    const biologyTopics = insertedTopics.filter(t => t.subjectId === biologySubject.id);
    const mathTopics = insertedTopics.filter(t => t.subjectId === mathSubject.id);
    
    console.log(`\nBiology Topics: ${biologyTopics.length}`);
    console.log(`Mathematics Topics: ${mathTopics.length}`);
    
  } catch (error) {
    console.error("Error seeding topics:", error);
    throw error;
  }
}

// Run the seeding if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedTopicsNew()
    .then(() => {
      console.log("Form 1 topics seeding completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Form 1 topics seeding failed:", error);
      process.exit(1);
    });
}