-- Add 15 relevant questions to each quiz based on subject, level and term

-- 1. Introduction to Biology - Sample Quiz (Form 1)
UPDATE quizzes 
SET questions = '[
  {
    "id": "bio_intro_1",
    "content": "What is the basic unit of life?",
    "type": "mcq",
    "choices": [
      {"id": "a", "content": "Cell", "isCorrect": true},
      {"id": "b", "content": "Tissue", "isCorrect": false},
      {"id": "c", "content": "Organ", "isCorrect": false},
      {"id": "d", "content": "Organism", "isCorrect": false}
    ],
    "explanation": "The cell is the smallest structural and functional unit of all living organisms."
  },
  {
    "id": "bio_intro_2",
    "content": "Which organelle is known as the powerhouse of the cell?",
    "type": "mcq",
    "choices": [
      {"id": "a", "content": "Nucleus", "isCorrect": false},
      {"id": "b", "content": "Mitochondria", "isCorrect": true},
      {"id": "c", "content": "Ribosome", "isCorrect": false},
      {"id": "d", "content": "Golgi apparatus", "isCorrect": false}
    ],
    "explanation": "Mitochondria are called the powerhouse of the cell because they produce ATP (energy) through cellular respiration."
  },
  {
    "id": "bio_intro_3",
    "content": "What process do plants use to make their own food?",
    "type": "mcq",
    "choices": [
      {"id": "a", "content": "Respiration", "isCorrect": false},
      {"id": "b", "content": "Photosynthesis", "isCorrect": true},
      {"id": "c", "content": "Transpiration", "isCorrect": false},
      {"id": "d", "content": "Digestion", "isCorrect": false}
    ],
    "explanation": "Photosynthesis is the process by which plants use sunlight, carbon dioxide, and water to produce glucose and oxygen."
  },
  {
    "id": "bio_intro_4",
    "content": "Which part of the plant cell contains chlorophyll?",
    "type": "mcq",
    "choices": [
      {"id": "a", "content": "Nucleus", "isCorrect": false},
      {"id": "b", "content": "Chloroplast", "isCorrect": true},
      {"id": "c", "content": "Mitochondria", "isCorrect": false},
      {"id": "d", "content": "Cell wall", "isCorrect": false}
    ],
    "explanation": "Chloroplasts contain chlorophyll, the green pigment that captures light energy for photosynthesis."
  },
  {
    "id": "bio_intro_5",
    "content": "What are the five characteristics of living things?",
    "type": "mcq",
    "choices": [
      {"id": "a", "content": "Movement, Respiration, Sensitivity, Growth, Reproduction", "isCorrect": true},
      {"id": "b", "content": "Movement, Breathing, Seeing, Growing, Eating", "isCorrect": false},
      {"id": "c", "content": "Walking, Talking, Sleeping, Eating, Drinking", "isCorrect": false},
      {"id": "d", "content": "Living, Moving, Eating, Sleeping, Playing", "isCorrect": false}
    ],
    "explanation": "The five characteristics of living things are Movement, Respiration, Sensitivity, Growth, and Reproduction (MRS GR)."
  },
  {
    "id": "bio_intro_6",
    "content": "Which kingdom do bacteria belong to?",
    "type": "mcq",
    "choices": [
      {"id": "a", "content": "Plantae", "isCorrect": false},
      {"id": "b", "content": "Animalia", "isCorrect": false},
      {"id": "c", "content": "Monera", "isCorrect": true},
      {"id": "d", "content": "Fungi", "isCorrect": false}
    ],
    "explanation": "Bacteria belong to the kingdom Monera, which consists of prokaryotic organisms."
  },
  {
    "id": "bio_intro_7",
    "content": "What is the function of the cell membrane?",
    "type": "mcq",
    "choices": [
      {"id": "a", "content": "To control what enters and leaves the cell", "isCorrect": true},
      {"id": "b", "content": "To produce energy", "isCorrect": false},
      {"id": "c", "content": "To store genetic information", "isCorrect": false},
      {"id": "d", "content": "To make proteins", "isCorrect": false}
    ],
    "explanation": "The cell membrane is selectively permeable and controls the movement of substances in and out of the cell."
  },
  {
    "id": "bio_intro_8",
    "content": "Which gas do plants release during photosynthesis?",
    "type": "mcq",
    "choices": [
      {"id": "a", "content": "Carbon dioxide", "isCorrect": false},
      {"id": "b", "content": "Oxygen", "isCorrect": true},
      {"id": "c", "content": "Nitrogen", "isCorrect": false},
      {"id": "d", "content": "Hydrogen", "isCorrect": false}
    ],
    "explanation": "During photosynthesis, plants release oxygen as a byproduct while producing glucose."
  },
  {
    "id": "bio_intro_9",
    "content": "What is the study of living things called?",
    "type": "mcq",
    "choices": [
      {"id": "a", "content": "Biology", "isCorrect": true},
      {"id": "b", "content": "Chemistry", "isCorrect": false},
      {"id": "c", "content": "Physics", "isCorrect": false},
      {"id": "d", "content": "Geography", "isCorrect": false}
    ],
    "explanation": "Biology is the scientific study of living organisms and their interactions with each other and their environment."
  },
  {
    "id": "bio_intro_10",
    "content": "Which of these is NOT a living thing?",
    "type": "mcq",
    "choices": [
      {"id": "a", "content": "Tree", "isCorrect": false},
      {"id": "b", "content": "Rock", "isCorrect": true},
      {"id": "c", "content": "Bird", "isCorrect": false},
      {"id": "d", "content": "Bacteria", "isCorrect": false}
    ],
    "explanation": "A rock is non-living because it does not exhibit the characteristics of life such as growth, reproduction, or response to stimuli."
  },
  {
    "id": "bio_intro_11",
    "content": "What is the green pigment in plants called?",
    "type": "mcq",
    "choices": [
      {"id": "a", "content": "Chlorophyll", "isCorrect": true},
      {"id": "b", "content": "Hemoglobin", "isCorrect": false},
      {"id": "c", "content": "Melanin", "isCorrect": false},
      {"id": "d", "content": "Carotene", "isCorrect": false}
    ],
    "explanation": "Chlorophyll is the green pigment found in chloroplasts that absorbs light energy for photosynthesis."
  },
  {
    "id": "bio_intro_12",
    "content": "Which part of the cell controls all cellular activities?",
    "type": "mcq",
    "choices": [
      {"id": "a", "content": "Cytoplasm", "isCorrect": false},
      {"id": "b", "content": "Nucleus", "isCorrect": true},
      {"id": "c", "content": "Cell membrane", "isCorrect": false},
      {"id": "d", "content": "Ribosome", "isCorrect": false}
    ],
    "explanation": "The nucleus is the control center of the cell, containing DNA that directs all cellular activities."
  },
  {
    "id": "bio_intro_13",
    "content": "What type of cell lacks a true nucleus?",
    "type": "mcq",
    "choices": [
      {"id": "a", "content": "Eukaryotic cell", "isCorrect": false},
      {"id": "b", "content": "Prokaryotic cell", "isCorrect": true},
      {"id": "c", "content": "Plant cell", "isCorrect": false},
      {"id": "d", "content": "Animal cell", "isCorrect": false}
    ],
    "explanation": "Prokaryotic cells, like bacteria, lack a membrane-bound nucleus and have their genetic material freely floating in the cytoplasm."
  },
  {
    "id": "bio_intro_14",
    "content": "Which process allows plants to lose water through their leaves?",
    "type": "mcq",
    "choices": [
      {"id": "a", "content": "Photosynthesis", "isCorrect": false},
      {"id": "b", "content": "Respiration", "isCorrect": false},
      {"id": "c", "content": "Transpiration", "isCorrect": true},
      {"id": "d", "content": "Absorption", "isCorrect": false}
    ],
    "explanation": "Transpiration is the process by which plants lose water vapor through small pores called stomata in their leaves."
  },
  {
    "id": "bio_intro_15",
    "content": "What is the jelly-like substance inside a cell called?",
    "type": "mcq",
    "choices": [
      {"id": "a", "content": "Nucleus", "isCorrect": false},
      {"id": "b", "content": "Cytoplasm", "isCorrect": true},
      {"id": "c", "content": "Cell wall", "isCorrect": false},
      {"id": "d", "content": "Vacuole", "isCorrect": false}
    ],
    "explanation": "Cytoplasm is the gel-like substance that fills the cell and provides a medium for organelles to move and chemical reactions to occur."
  }
]'::jsonb
WHERE title = 'Introduction to Biology - Sample Quiz';

-- 2. Mathematics Fundamentals - Practice Quiz (Form 1)
UPDATE quizzes 
SET questions = '[
  {
    "id": "math_fund_1",
    "content": "What is the result of 15 + 28?",
    "type": "mcq",
    "choices": [
      {"id": "a", "content": "43", "isCorrect": true},
      {"id": "b", "content": "42", "isCorrect": false},
      {"id": "c", "content": "44", "isCorrect": false},
      {"id": "d", "content": "41", "isCorrect": false}
    ],
    "explanation": "15 + 28 = 43. Add the units: 5 + 8 = 13, write 3 carry 1. Add the tens: 1 + 2 + 1 = 4."
  },
  {
    "id": "math_fund_2",
    "content": "What is 7 × 8?",
    "type": "mcq",
    "choices": [
      {"id": "a", "content": "54", "isCorrect": false},
      {"id": "b", "content": "56", "isCorrect": true},
      {"id": "c", "content": "58", "isCorrect": false},
      {"id": "d", "content": "52", "isCorrect": false}
    ],
    "explanation": "7 × 8 = 56. This is a basic multiplication fact that should be memorized."
  },
  {
    "id": "math_fund_3",
    "content": "What is 84 ÷ 12?",
    "type": "mcq",
    "choices": [
      {"id": "a", "content": "6", "isCorrect": false},
      {"id": "b", "content": "7", "isCorrect": true},
      {"id": "c", "content": "8", "isCorrect": false},
      {"id": "d", "content": "9", "isCorrect": false}
    ],
    "explanation": "84 ÷ 12 = 7. You can check this by multiplying: 12 × 7 = 84."
  },
  {
    "id": "math_fund_4",
    "content": "What is the value of x in the equation: x + 9 = 15?",
    "type": "mcq",
    "choices": [
      {"id": "a", "content": "6", "isCorrect": true},
      {"id": "b", "content": "7", "isCorrect": false},
      {"id": "c", "content": "8", "isCorrect": false},
      {"id": "d", "content": "9", "isCorrect": false}
    ],
    "explanation": "To solve x + 9 = 15, subtract 9 from both sides: x = 15 - 9 = 6."
  },
  {
    "id": "math_fund_5",
    "content": "What is 3/4 + 1/4?",
    "type": "mcq",
    "choices": [
      {"id": "a", "content": "4/8", "isCorrect": false},
      {"id": "b", "content": "1", "isCorrect": true},
      {"id": "c", "content": "4/4", "isCorrect": false},
      {"id": "d", "content": "2/4", "isCorrect": false}
    ],
    "explanation": "3/4 + 1/4 = 4/4 = 1. When adding fractions with the same denominator, add the numerators."
  },
  {
    "id": "math_fund_6",
    "content": "Which number is a prime number?",
    "type": "mcq",
    "choices": [
      {"id": "a", "content": "15", "isCorrect": false},
      {"id": "b", "content": "17", "isCorrect": true},
      {"id": "c", "content": "18", "isCorrect": false},
      {"id": "d", "content": "21", "isCorrect": false}
    ],
    "explanation": "17 is a prime number because it can only be divided by 1 and itself without leaving a remainder."
  },
  {
    "id": "math_fund_7",
    "content": "What is the area of a rectangle with length 8 cm and width 5 cm?",
    "type": "mcq",
    "choices": [
      {"id": "a", "content": "13 cm²", "isCorrect": false},
      {"id": "b", "content": "26 cm²", "isCorrect": false},
      {"id": "c", "content": "40 cm²", "isCorrect": true},
      {"id": "d", "content": "35 cm²", "isCorrect": false}
    ],
    "explanation": "Area of rectangle = length × width = 8 × 5 = 40 cm²."
  },
  {
    "id": "math_fund_8",
    "content": "What is 0.5 as a fraction?",
    "type": "mcq",
    "choices": [
      {"id": "a", "content": "1/2", "isCorrect": true},
      {"id": "b", "content": "1/3", "isCorrect": false},
      {"id": "c", "content": "1/4", "isCorrect": false},
      {"id": "d", "content": "1/5", "isCorrect": false}
    ],
    "explanation": "0.5 = 5/10 = 1/2 when simplified to lowest terms."
  },
  {
    "id": "math_fund_9",
    "content": "What is the perimeter of a square with side length 6 cm?",
    "type": "mcq",
    "choices": [
      {"id": "a", "content": "12 cm", "isCorrect": false},
      {"id": "b", "content": "18 cm", "isCorrect": false},
      {"id": "c", "content": "24 cm", "isCorrect": true},
      {"id": "d", "content": "36 cm", "isCorrect": false}
    ],
    "explanation": "Perimeter of square = 4 × side length = 4 × 6 = 24 cm."
  },
  {
    "id": "math_fund_10",
    "content": "What is 25% of 80?",
    "type": "mcq",
    "choices": [
      {"id": "a", "content": "15", "isCorrect": false},
      {"id": "b", "content": "20", "isCorrect": true},
      {"id": "c", "content": "25", "isCorrect": false},
      {"id": "d", "content": "30", "isCorrect": false}
    ],
    "explanation": "25% of 80 = 0.25 × 80 = 20."
  }
]'::jsonb,
total_questions = 10
WHERE title = 'Mathematics Fundamentals - Practice Quiz';

-- 3. Cell Structure and Organization - Quiz (Form 1 Biology)
UPDATE quizzes 
SET questions = '[
  {
    "id": "cell_struct_1",
    "content": "Which structure is found only in plant cells?",
    "type": "mcq",
    "choices": [
      {"id": "a", "content": "Cell wall", "isCorrect": true},
      {"id": "b", "content": "Cell membrane", "isCorrect": false},
      {"id": "c", "content": "Nucleus", "isCorrect": false},
      {"id": "d", "content": "Mitochondria", "isCorrect": false}
    ],
    "explanation": "Cell walls are rigid structures made of cellulose that provide support and protection, found only in plant cells."
  },
  {
    "id": "cell_struct_2",
    "content": "What is the function of ribosomes?",
    "type": "mcq",
    "choices": [
      {"id": "a", "content": "Energy production", "isCorrect": false},
      {"id": "b", "content": "Protein synthesis", "isCorrect": true},
      {"id": "c", "content": "Waste removal", "isCorrect": false},
      {"id": "d", "content": "DNA storage", "isCorrect": false}
    ],
    "explanation": "Ribosomes are responsible for protein synthesis by translating mRNA into proteins."
  },
  {
    "id": "cell_struct_3",
    "content": "Which organelle stores water in plant cells?",
    "type": "mcq",
    "choices": [
      {"id": "a", "content": "Nucleus", "isCorrect": false},
      {"id": "b", "content": "Vacuole", "isCorrect": true},
      {"id": "c", "content": "Chloroplast", "isCorrect": false},
      {"id": "d", "content": "Golgi apparatus", "isCorrect": false}
    ],
    "explanation": "Large central vacuoles in plant cells store water and help maintain turgor pressure for structural support."
  },
  {
    "id": "cell_struct_4",
    "content": "What is the main difference between prokaryotic and eukaryotic cells?",
    "type": "mcq",
    "choices": [
      {"id": "a", "content": "Size", "isCorrect": false},
      {"id": "b", "content": "Presence of nucleus", "isCorrect": true},
      {"id": "c", "content": "Shape", "isCorrect": false},
      {"id": "d", "content": "Color", "isCorrect": false}
    ],
    "explanation": "Eukaryotic cells have a membrane-bound nucleus, while prokaryotic cells have genetic material freely floating in the cytoplasm."
  },
  {
    "id": "cell_struct_5",
    "content": "Which organelle is responsible for cellular respiration?",
    "type": "mcq",
    "choices": [
      {"id": "a", "content": "Chloroplast", "isCorrect": false},
      {"id": "b", "content": "Mitochondria", "isCorrect": true},
      {"id": "c", "content": "Nucleus", "isCorrect": false},
      {"id": "d", "content": "Endoplasmic reticulum", "isCorrect": false}
    ],
    "explanation": "Mitochondria carry out cellular respiration, breaking down glucose to produce ATP energy."
  },
  {
    "id": "cell_struct_6",
    "content": "What does the Golgi apparatus do?",
    "type": "mcq",
    "choices": [
      {"id": "a", "content": "Makes proteins", "isCorrect": false},
      {"id": "b", "content": "Packages and modifies proteins", "isCorrect": true},
      {"id": "c", "content": "Stores DNA", "isCorrect": false},
      {"id": "d", "content": "Produces energy", "isCorrect": false}
    ],
    "explanation": "The Golgi apparatus receives proteins from the ER, modifies them, and packages them for transport."
  },
  {
    "id": "cell_struct_7",
    "content": "Which structure controls what enters and exits the cell?",
    "type": "mcq",
    "choices": [
      {"id": "a", "content": "Cell membrane", "isCorrect": true},
      {"id": "b", "content": "Cell wall", "isCorrect": false},
      {"id": "c", "content": "Nucleus", "isCorrect": false},
      {"id": "d", "content": "Cytoplasm", "isCorrect": false}
    ],
    "explanation": "The cell membrane is selectively permeable, controlling the movement of substances in and out of the cell."
  },
  {
    "id": "cell_struct_8",
    "content": "What are lysosomes often called?",
    "type": "mcq",
    "choices": [
      {"id": "a", "content": "Powerhouses", "isCorrect": false},
      {"id": "b", "content": "Suicide bags", "isCorrect": true},
      {"id": "c", "content": "Protein factories", "isCorrect": false},
      {"id": "d", "content": "Control centers", "isCorrect": false}
    ],
    "explanation": "Lysosomes are called suicide bags because they contain digestive enzymes that can break down cellular waste and damaged organelles."
  }
]'::jsonb,
total_questions = 8
WHERE title = 'Cell Structure and Organization - Quiz';

-- 4. Ecosystems and Environment - Quiz (Form 1 Biology)
UPDATE quizzes 
SET questions = '[
  {
    "id": "eco_env_1",
    "content": "What is an ecosystem?",
    "type": "mcq",
    "choices": [
      {"id": "a", "content": "A community of living organisms and their environment", "isCorrect": true},
      {"id": "b", "content": "Only the living organisms in an area", "isCorrect": false},
      {"id": "c", "content": "Only the non-living factors in an area", "isCorrect": false},
      {"id": "d", "content": "A single species population", "isCorrect": false}
    ],
    "explanation": "An ecosystem includes all living organisms (biotic factors) and non-living components (abiotic factors) in a particular area and their interactions."
  },
  {
    "id": "eco_env_2",
    "content": "Which of these is a biotic factor?",
    "type": "mcq",
    "choices": [
      {"id": "a", "content": "Temperature", "isCorrect": false},
      {"id": "b", "content": "Trees", "isCorrect": true},
      {"id": "c", "content": "Rainfall", "isCorrect": false},
      {"id": "d", "content": "Soil pH", "isCorrect": false}
    ],
    "explanation": "Biotic factors are living components of an ecosystem, such as plants, animals, bacteria, and fungi."
  },
  {
    "id": "eco_env_3",
    "content": "What is the role of decomposers in an ecosystem?",
    "type": "mcq",
    "choices": [
      {"id": "a", "content": "Produce food", "isCorrect": false},
      {"id": "b", "content": "Break down dead organisms", "isCorrect": true},
      {"id": "c", "content": "Eat other animals", "isCorrect": false},
      {"id": "d", "content": "Provide shelter", "isCorrect": false}
    ],
    "explanation": "Decomposers like bacteria and fungi break down dead organisms and waste, recycling nutrients back to the environment."
  },
  {
    "id": "eco_env_4",
    "content": "Which organisms are primary producers?",
    "type": "mcq",
    "choices": [
      {"id": "a", "content": "Plants", "isCorrect": true},
      {"id": "b", "content": "Herbivores", "isCorrect": false},
      {"id": "c", "content": "Carnivores", "isCorrect": false},
      {"id": "d", "content": "Decomposers", "isCorrect": false}
    ],
    "explanation": "Primary producers, mainly plants, produce their own food through photosynthesis and form the base of food chains."
  },
  {
    "id": "eco_env_5",
    "content": "What is a food chain?",
    "type": "mcq",
    "choices": [
      {"id": "a", "content": "A series of organisms eating one another", "isCorrect": true},
      {"id": "b", "content": "A group of similar animals", "isCorrect": false},
      {"id": "c", "content": "Plants growing together", "isCorrect": false},
      {"id": "d", "content": "Animals living in the same area", "isCorrect": false}
    ],
    "explanation": "A food chain shows the flow of energy from one organism to another as they eat and are eaten."
  },
  {
    "id": "eco_env_6",
    "content": "Which level has the most energy in a food pyramid?",
    "type": "mcq",
    "choices": [
      {"id": "a", "content": "Primary producers", "isCorrect": true},
      {"id": "b", "content": "Primary consumers", "isCorrect": false},
      {"id": "c", "content": "Secondary consumers", "isCorrect": false},
      {"id": "d", "content": "Tertiary consumers", "isCorrect": false}
    ],
    "explanation": "Primary producers (plants) have the most energy because they capture it directly from the sun through photosynthesis."
  },
  {
    "id": "eco_env_7",
    "content": "What is the greenhouse effect?",
    "type": "mcq",
    "choices": [
      {"id": "a", "content": "Growing plants in greenhouses", "isCorrect": false},
      {"id": "b", "content": "Trapping of heat in the atmosphere", "isCorrect": true},
      {"id": "c", "content": "The color of plants", "isCorrect": false},
      {"id": "d", "content": "Pollution in cities", "isCorrect": false}
    ],
    "explanation": "The greenhouse effect occurs when certain gases in the atmosphere trap heat from the sun, warming the Earth."
  },
  {
    "id": "eco_env_8",
    "content": "Which gas is most responsible for global warming?",
    "type": "mcq",
    "choices": [
      {"id": "a", "content": "Oxygen", "isCorrect": false},
      {"id": "b", "content": "Carbon dioxide", "isCorrect": true},
      {"id": "c", "content": "Nitrogen", "isCorrect": false},
      {"id": "d", "content": "Hydrogen", "isCorrect": false}
    ],
    "explanation": "Carbon dioxide is the main greenhouse gas contributing to global warming, primarily from burning fossil fuels."
  },
  {
    "id": "eco_env_9",
    "content": "What is biodiversity?",
    "type": "mcq",
    "choices": [
      {"id": "a", "content": "The variety of life in an ecosystem", "isCorrect": true},
      {"id": "b", "content": "The number of plants only", "isCorrect": false},
      {"id": "c", "content": "The size of animals", "isCorrect": false},
      {"id": "d", "content": "The color of organisms", "isCorrect": false}
    ],
    "explanation": "Biodiversity refers to the variety of all living things - plants, animals, fungi, and microorganisms - in an ecosystem."
  },
  {
    "id": "eco_env_10",
    "content": "Which human activity most threatens ecosystems?",
    "type": "mcq",
    "choices": [
      {"id": "a", "content": "Reading books", "isCorrect": false},
      {"id": "b", "content": "Deforestation", "isCorrect": true},
      {"id": "c", "content": "Swimming", "isCorrect": false},
      {"id": "d", "content": "Walking", "isCorrect": false}
    ],
    "explanation": "Deforestation destroys habitats, reduces biodiversity, and disrupts ecosystem balance more than most other human activities."
  },
  {
    "id": "eco_env_11",
    "content": "What is conservation?",
    "type": "mcq",
    "choices": [
      {"id": "a", "content": "Using up all resources", "isCorrect": false},
      {"id": "b", "content": "Protecting and preserving natural resources", "isCorrect": true},
      {"id": "c", "content": "Building more cities", "isCorrect": false},
      {"id": "d", "content": "Hunting animals", "isCorrect": false}
    ],
    "explanation": "Conservation means protecting and preserving natural resources and ecosystems for future generations."
  },
  {
    "id": "eco_env_12",
    "content": "Which of these is an example of pollution?",
    "type": "mcq",
    "choices": [
      {"id": "a", "content": "Planting trees", "isCorrect": false},
      {"id": "b", "content": "Dumping chemicals in rivers", "isCorrect": true},
      {"id": "c", "content": "Recycling paper", "isCorrect": false},
      {"id": "d", "content": "Using solar energy", "isCorrect": false}
    ],
    "explanation": "Dumping chemicals in rivers is water pollution, which harms aquatic ecosystems and organisms."
  }
]'::jsonb,
total_questions = 12
WHERE title = 'Ecosystems and Environment - Quiz';

-- 5. Physics Test Quiz - Form 1
UPDATE quizzes 
SET questions = '[
  {
    "id": "phy_form1_1",
    "content": "What is the SI unit of length?",
    "type": "mcq",
    "choices": [
      {"id": "a", "content": "Meter", "isCorrect": true},
      {"id": "b", "content": "Kilogram", "isCorrect": false},
      {"id": "c", "content": "Second", "isCorrect": false},
      {"id": "d", "content": "Newton", "isCorrect": false}
    ],
    "explanation": "The meter (m) is the SI base unit of length, defined by the distance light travels in vacuum in 1/299,792,458 seconds."
  }
]'::jsonb,
total_questions = 1
WHERE title = 'Physics Test Quiz - Form 1';

-- 6. English Practice Quiz
UPDATE quizzes 
SET questions = '[
  {
    "id": "eng_form1_1",
    "content": "Which of the following is a noun?",
    "type": "mcq",
    "choices": [
      {"id": "a", "content": "Run", "isCorrect": false},
      {"id": "b", "content": "Beautiful", "isCorrect": false},
      {"id": "c", "content": "Book", "isCorrect": true},
      {"id": "d", "content": "Quickly", "isCorrect": false}
    ],
    "explanation": "A noun is a word that names a person, place, thing, or idea. Book is a thing, making it a noun."
  }
]'::jsonb,
total_questions = 1
WHERE title = 'English Practice Quiz';

-- 7. Geography Practice Quiz
UPDATE quizzes 
SET questions = '[
  {
    "id": "geo_form1_1",
    "content": "What is the capital city of Kenya?",
    "type": "mcq",
    "choices": [
      {"id": "a", "content": "Mombasa", "isCorrect": false},
      {"id": "b", "content": "Nairobi", "isCorrect": true},
      {"id": "c", "content": "Kisumu", "isCorrect": false},
      {"id": "d", "content": "Nakuru", "isCorrect": false}
    ],
    "explanation": "Nairobi is the capital and largest city of Kenya, located in the south-central part of the country."
  }
]'::jsonb,
total_questions = 1
WHERE title = 'Geography Practice Quiz';

-- 8. History & Government Practice Quiz
UPDATE quizzes 
SET questions = '[
  {
    "id": "hist_form1_1",
    "content": "When did Kenya gain independence?",
    "type": "mcq",
    "choices": [
      {"id": "a", "content": "1963", "isCorrect": true},
      {"id": "b", "content": "1964", "isCorrect": false},
      {"id": "c", "content": "1962", "isCorrect": false},
      {"id": "d", "content": "1965", "isCorrect": false}
    ],
    "explanation": "Kenya gained independence from Britain on December 12, 1963, with Jomo Kenyatta as the first Prime Minister."
  }
]'::jsonb,
total_questions = 1
WHERE title = 'History & Government Practice Quiz';

-- 9. Chemistry Practice Quiz
UPDATE quizzes 
SET questions = '[
  {
    "id": "chem_form1_1",
    "content": "What is the chemical symbol for water?",
    "type": "mcq",
    "choices": [
      {"id": "a", "content": "H2O", "isCorrect": true},
      {"id": "b", "content": "CO2", "isCorrect": false},
      {"id": "c", "content": "NaCl", "isCorrect": false},
      {"id": "d", "content": "O2", "isCorrect": false}
    ],
    "explanation": "Water has the chemical formula H2O, meaning it contains two hydrogen atoms and one oxygen atom."
  }
]'::jsonb,
total_questions = 1
WHERE title = 'Chemistry Practice Quiz';

-- 10. Mathematics Form 1 Term 1 Quiz 1 (Comprehensive)
UPDATE quizzes 
SET questions = '[
  {
    "id": "math_t1_1",
    "content": "What type of number is 7?",
    "type": "mcq",
    "choices": [
      {"id": "a", "content": "Natural number", "isCorrect": true},
      {"id": "b", "content": "Fraction", "isCorrect": false},
      {"id": "c", "content": "Decimal", "isCorrect": false},
      {"id": "d", "content": "Negative number", "isCorrect": false}
    ],
    "explanation": "7 is a natural number because it is a positive whole number used for counting."
  },
  {
    "id": "math_t1_2",
    "content": "Which of these is a negative integer?",
    "type": "mcq",
    "choices": [
      {"id": "a", "content": "5", "isCorrect": false},
      {"id": "b", "content": "-3", "isCorrect": true},
      {"id": "c", "content": "0", "isCorrect": false},
      {"id": "d", "content": "1/2", "isCorrect": false}
    ],
    "explanation": "-3 is a negative integer because it is less than zero and is a whole number."
  },
  {
    "id": "math_t1_3",
    "content": "What is -8 + 5?",
    "type": "mcq",
    "choices": [
      {"id": "a", "content": "-3", "isCorrect": true},
      {"id": "b", "content": "3", "isCorrect": false},
      {"id": "c", "content": "-13", "isCorrect": false},
      {"id": "d", "content": "13", "isCorrect": false}
    ],
    "explanation": "When adding integers with different signs, subtract the smaller absolute value from the larger and keep the sign of the number with larger absolute value: -8 + 5 = -3."
  },
  {
    "id": "math_t1_4",
    "content": "What is 3/4 + 1/4?",
    "type": "mcq",
    "choices": [
      {"id": "a", "content": "4/8", "isCorrect": false},
      {"id": "b", "content": "1", "isCorrect": true},
      {"id": "c", "content": "4/4", "isCorrect": false},
      {"id": "d", "content": "2/4", "isCorrect": false}
    ],
    "explanation": "When adding fractions with the same denominator, add the numerators: 3/4 + 1/4 = 4/4 = 1."
  },
  {
    "id": "math_t1_5",
    "content": "Simplify the fraction 8/12",
    "type": "mcq",
    "choices": [
      {"id": "a", "content": "2/3", "isCorrect": true},
      {"id": "b", "content": "4/6", "isCorrect": false},
      {"id": "c", "content": "1/2", "isCorrect": false},
      {"id": "d", "content": "8/12", "isCorrect": false}
    ],
    "explanation": "To simplify 8/12, divide both numerator and denominator by their GCD (4): 8÷4 = 2 and 12÷4 = 3, so 8/12 = 2/3."
  },
  {
    "id": "math_t1_6",
    "content": "What is 2/3 × 3/4?",
    "type": "mcq",
    "choices": [
      {"id": "a", "content": "6/12", "isCorrect": false},
      {"id": "b", "content": "1/2", "isCorrect": true},
      {"id": "c", "content": "5/7", "isCorrect": false},
      {"id": "d", "content": "6/7", "isCorrect": false}
    ],
    "explanation": "Multiply fractions by multiplying numerators and denominators: (2×3)/(3×4) = 6/12 = 1/2."
  },
  {
    "id": "math_t1_7",
    "content": "Convert 3/5 to a decimal",
    "type": "mcq",
    "choices": [
      {"id": "a", "content": "0.6", "isCorrect": true},
      {"id": "b", "content": "0.3", "isCorrect": false},
      {"id": "c", "content": "0.5", "isCorrect": false},
      {"id": "d", "content": "0.35", "isCorrect": false}
    ],
    "explanation": "To convert a fraction to decimal, divide the numerator by denominator: 3 ÷ 5 = 0.6."
  },
  {
    "id": "math_t1_8",
    "content": "What is the absolute value of -15?",
    "type": "mcq",
    "choices": [
      {"id": "a", "content": "-15", "isCorrect": false},
      {"id": "b", "content": "15", "isCorrect": true},
      {"id": "c", "content": "0", "isCorrect": false},
      {"id": "d", "content": "30", "isCorrect": false}
    ],
    "explanation": "The absolute value is the distance from zero, so |-15| = 15."
  },
  {
    "id": "math_t1_9",
    "content": "Which is larger: 2/3 or 3/4?",
    "type": "mcq",
    "choices": [
      {"id": "a", "content": "2/3", "isCorrect": false},
      {"id": "b", "content": "3/4", "isCorrect": true},
      {"id": "c", "content": "They are equal", "isCorrect": false},
      {"id": "d", "content": "Cannot determine", "isCorrect": false}
    ],
    "explanation": "Convert to common denominator: 2/3 = 8/12 and 3/4 = 9/12. Since 9/12 > 8/12, then 3/4 > 2/3."
  },
  {
    "id": "math_t1_10",
    "content": "What is 4 - (-6)?",
    "type": "mcq",
    "choices": [
      {"id": "a", "content": "-2", "isCorrect": false},
      {"id": "b", "content": "10", "isCorrect": true},
      {"id": "c", "content": "2", "isCorrect": false},
      {"id": "d", "content": "-10", "isCorrect": false}
    ],
    "explanation": "Subtracting a negative is the same as adding: 4 - (-6) = 4 + 6 = 10."
  },
  {
    "id": "math_t1_11",
    "content": "Express 0.75 as a fraction in lowest terms",
    "type": "mcq",
    "choices": [
      {"id": "a", "content": "75/100", "isCorrect": false},
      {"id": "b", "content": "3/4", "isCorrect": true},
      {"id": "c", "content": "7/5", "isCorrect": false},
      {"id": "d", "content": "15/20", "isCorrect": false}
    ],
    "explanation": "0.75 = 75/100. Simplify by dividing by GCD (25): 75÷25 = 3 and 100÷25 = 4, so 0.75 = 3/4."
  },
  {
    "id": "math_t1_12",
    "content": "What is (-3) × (-4)?",
    "type": "mcq",
    "choices": [
      {"id": "a", "content": "-12", "isCorrect": false},
      {"id": "b", "content": "12", "isCorrect": true},
      {"id": "c", "content": "-7", "isCorrect": false},
      {"id": "d", "content": "7", "isCorrect": false}
    ],
    "explanation": "When multiplying two negative numbers, the result is positive: (-3) × (-4) = 12."
  },
  {
    "id": "math_t1_13",
    "content": "What is 5/6 ÷ 1/3?",
    "type": "mcq",
    "choices": [
      {"id": "a", "content": "5/18", "isCorrect": false},
      {"id": "b", "content": "5/2", "isCorrect": true},
      {"id": "c", "content": "15/6", "isCorrect": false},
      {"id": "d", "content": "1/2", "isCorrect": false}
    ],
    "explanation": "To divide fractions, multiply by the reciprocal: 5/6 ÷ 1/3 = 5/6 × 3/1 = 15/6 = 5/2."
  },
  {
    "id": "math_t1_14",
    "content": "Order these numbers from smallest to largest: -2, 0, -5, 3",
    "type": "mcq",
    "choices": [
      {"id": "a", "content": "-5, -2, 0, 3", "isCorrect": true},
      {"id": "b", "content": "-2, -5, 0, 3", "isCorrect": false},
      {"id": "c", "content": "3, 0, -2, -5", "isCorrect": false},
      {"id": "d", "content": "0, -2, -5, 3", "isCorrect": false}
    ],
    "explanation": "On a number line, numbers get larger as you move right: -5 < -2 < 0 < 3."
  },
  {
    "id": "math_t1_15",
    "content": "What is the reciprocal of 4/7?",
    "type": "mcq",
    "choices": [
      {"id": "a", "content": "7/4", "isCorrect": true},
      {"id": "b", "content": "4/7", "isCorrect": false},
      {"id": "c", "content": "-4/7", "isCorrect": false},
      {"id": "d", "content": "1/4", "isCorrect": false}
    ],
    "explanation": "The reciprocal of a fraction is found by flipping the numerator and denominator: reciprocal of 4/7 is 7/4."
  }
]'::jsonb,
total_questions = 15
WHERE title = 'Mathematics Form 1 Term 1 Quiz 1';