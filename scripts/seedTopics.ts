import { db } from "../server/db";
import { topics, subjects, levels } from "../shared/schema";
import { eq, and } from "drizzle-orm";

// KCSE Topics data based on syllabus research
const KCSE_TOPICS = {
  // Mathematics topics by form level
  Mathematics: {
    "Form 1": {
      term1: [
        { title: "Natural Numbers", description: "Place values, rounding off, operations with natural numbers", summaryContent: "Understanding the basic number system and operations" },
        { title: "Factors and Multiples", description: "Divisibility tests, GCD, HCF, LCM", summaryContent: "Finding factors, multiples, and their applications" },
        { title: "Integers", description: "Operations with positive and negative numbers", summaryContent: "Working with signed numbers and their properties" },
        { title: "Fractions", description: "Operations with fractions, equivalent fractions", summaryContent: "Understanding and manipulating fractional numbers" },
        { title: "Decimals", description: "Decimal operations, conversions", summaryContent: "Working with decimal numbers and place value" },
        { title: "Squares and Square Roots", description: "Perfect squares, square roots, estimation", summaryContent: "Understanding square numbers and their roots" },
        { title: "Algebraic Expressions", description: "Variables, terms, coefficients, simplification", summaryContent: "Introduction to algebra and symbolic representation" }
      ],
      term2: [
        { title: "Rates, Ratio and Proportion", description: "Understanding relationships between quantities", summaryContent: "Comparing quantities and solving proportion problems" },
        { title: "Percentages", description: "Converting between fractions, decimals, and percentages", summaryContent: "Working with percentages in real-life situations" },
        { title: "Commercial Arithmetic", description: "Profit, loss, simple interest, discount", summaryContent: "Business mathematics and financial calculations" },
        { title: "Length and Perimeter", description: "Units of length, perimeter calculations", summaryContent: "Measuring and calculating distances and boundaries" },
        { title: "Area", description: "Area of rectangles, squares, triangles", summaryContent: "Calculating space covered by 2D shapes" },
        { title: "Volume and Capacity", description: "Volume of cubes, cuboids, capacity units", summaryContent: "Measuring space occupied by 3D objects" },
        { title: "Mass, Density and Weight", description: "Units of mass, density calculations", summaryContent: "Understanding physical properties of matter" }
      ],
      term3: [
        { title: "Time", description: "Time calculations, 12-hour and 24-hour formats", summaryContent: "Working with time measurements and conversions" },
        { title: "Linear Equations", description: "Solving simple equations, substitution", summaryContent: "Finding unknown values in algebraic equations" },
        { title: "Coordinates and Graphs", description: "Plotting points, reading graphs", summaryContent: "Representing data and relationships graphically" },
        { title: "Angles and Plane Figures", description: "Types of angles, angle measurements", summaryContent: "Understanding geometric shapes and angle properties" },
        { title: "Geometric Constructions", description: "Using compass and ruler for constructions", summaryContent: "Creating accurate geometric figures" },
        { title: "Scale Drawing", description: "Maps, plans, scale factors", summaryContent: "Representing real objects in reduced or enlarged form" },
        { title: "Common Solids", description: "Properties of 3D shapes", summaryContent: "Understanding three-dimensional geometric objects" }
      ]
    },
    "Form 2": {
      term1: [
        { title: "Cubes and Cube Roots", description: "Perfect cubes, cube root calculations", summaryContent: "Understanding cubic numbers and their roots" },
        { title: "Reciprocals", description: "Finding reciprocals, operations with reciprocals", summaryContent: "Working with multiplicative inverses" },
        { title: "Indices", description: "Laws of indices, simplification", summaryContent: "Understanding powers and their manipulation" },
        { title: "Logarithms", description: "Introduction to logarithms, basic operations", summaryContent: "Understanding logarithmic functions and calculations" },
        { title: "Equations of Straight Lines", description: "Gradient, y-intercept, linear equations", summaryContent: "Understanding linear relationships and their graphs" },
        { title: "Linear Inequalities", description: "Solving and graphing inequalities", summaryContent: "Working with mathematical statements of comparison" }
      ],
      term2: [
        { title: "Quadratic Expressions", description: "Expanding, factoring quadratic expressions", summaryContent: "Understanding second-degree algebraic expressions" },
        { title: "Trigonometry I", description: "Sine, cosine, tangent ratios", summaryContent: "Introduction to trigonometric ratios and calculations" },
        { title: "Rotation", description: "Rotating shapes about a point", summaryContent: "Understanding transformation through rotation" },
        { title: "Enlargement", description: "Scale factors, center of enlargement", summaryContent: "Understanding transformation through enlargement" },
        { title: "Statistics I", description: "Data collection, frequency tables, averages", summaryContent: "Basic statistical concepts and data analysis" }
      ],
      term3: [
        { title: "Vectors", description: "Vector representation, addition, subtraction", summaryContent: "Understanding quantities with magnitude and direction" },
        { title: "Surface Area", description: "Surface area of prisms, cylinders, pyramids", summaryContent: "Calculating the area of 3D object surfaces" },
        { title: "Volume of Solids", description: "Volume of prisms, cylinders, pyramids, spheres", summaryContent: "Calculating space occupied by various 3D shapes" },
        { title: "Reflection", description: "Reflecting shapes in lines", summaryContent: "Understanding transformation through reflection" },
        { title: "Translation", description: "Moving shapes using vectors", summaryContent: "Understanding transformation through translation" }
      ]
    },
    "Form 3": {
      term1: [
        { title: "Quadratic Equations", description: "Solving quadratic equations by various methods", summaryContent: "Finding solutions to second-degree equations" },
        { title: "Trigonometry II", description: "Sine and cosine rules, area of triangles", summaryContent: "Advanced trigonometric calculations and applications" },
        { title: "Surds", description: "Simplifying surds, operations with surds", summaryContent: "Working with irrational square roots" },
        { title: "Matrices", description: "Matrix operations, determinants", summaryContent: "Understanding rectangular arrays of numbers" }
      ],
      term2: [
        { title: "Formulae and Variations", description: "Direct and inverse variation, formulas", summaryContent: "Understanding mathematical relationships and formulas" },
        { title: "Binomial Expansions", description: "Expanding expressions using binomial theorem", summaryContent: "Expanding powers of binomial expressions" },
        { title: "Probability", description: "Basic probability, combined events", summaryContent: "Understanding likelihood and chance" },
        { title: "Compound Proportions", description: "Complex proportion problems", summaryContent: "Advanced proportion and ratio calculations" }
      ],
      term3: [
        { title: "Circle Geometry", description: "Properties of circles, circle theorems", summaryContent: "Understanding geometric properties of circles" },
        { title: "Similar Figures", description: "Similar triangles, area and volume ratios", summaryContent: "Understanding proportional geometric figures" },
        { title: "Earth as a Sphere", description: "Longitude, latitude, time zones", summaryContent: "Understanding Earth's coordinate system" }
      ]
    },
    "Form 4": {
      term1: [
        { title: "Matrices and Transformations", description: "Matrix transformations, inverse matrices", summaryContent: "Using matrices to represent geometric transformations" },
        { title: "Statistics II", description: "Standard deviation, correlation, regression", summaryContent: "Advanced statistical analysis and relationships" },
        { title: "Loci", description: "Path of points satisfying given conditions", summaryContent: "Understanding sets of points with specific properties" }
      ],
      term2: [
        { title: "Trigonometry III", description: "Trigonometric identities, equations", summaryContent: "Advanced trigonometric relationships and problem solving" },
        { title: "Three Dimensional Geometry", description: "3D coordinates, distances, angles", summaryContent: "Understanding geometry in three-dimensional space" },
        { title: "Longitudes and Latitudes", description: "Great circles, distances on Earth", summaryContent: "Calculating distances and positions on Earth's surface" }
      ],
      term3: [
        { title: "Linear Programming", description: "Optimization problems, graphical methods", summaryContent: "Finding optimal solutions under constraints" },
        { title: "Differentiation", description: "Rates of change, derivatives", summaryContent: "Understanding instantaneous rates of change" },
        { title: "Integration", description: "Area under curves, antiderivatives", summaryContent: "Finding areas and reversing differentiation" },
        { title: "Area Approximation", description: "Numerical methods for finding areas", summaryContent: "Estimating areas using geometric approximations" }
      ]
    }
  },

  // Physics topics by form level
  Physics: {
    "Form 1": {
      term1: [
        { title: "Introduction to Physics", description: "What is physics, measurements, units", summaryContent: "Understanding the scope and nature of physics" },
        { title: "Length and Time", description: "Measuring length and time, units, instruments", summaryContent: "Fundamental measurements in physics" },
        { title: "Mass and Density", description: "Measuring mass, density calculations", summaryContent: "Understanding matter and its properties" }
      ],
      term2: [
        { title: "Force", description: "Types of forces, effects of forces", summaryContent: "Understanding forces and their effects on objects" },
        { title: "Pressure", description: "Pressure in solids, liquids, and gases", summaryContent: "Understanding pressure and its applications" },
        { title: "Particulate Nature of Matter", description: "States of matter, kinetic theory", summaryContent: "Understanding the structure of matter" }
      ],
      term3: [
        { title: "Thermal Expansion", description: "Expansion of solids, liquids, and gases", summaryContent: "Understanding how materials change with temperature" },
        { title: "Heat Transfer", description: "Conduction, convection, radiation", summaryContent: "Understanding how heat moves between objects" },
        { title: "Light", description: "Sources of light, reflection, refraction", summaryContent: "Understanding light and its behavior" }
      ]
    },
    "Form 2": {
      term1: [
        { title: "Waves", description: "Properties of waves, wave types", summaryContent: "Understanding wave motion and characteristics" },
        { title: "Sound", description: "Production, transmission, properties of sound", summaryContent: "Understanding sound waves and acoustics" },
        { title: "Magnetism", description: "Magnetic materials, magnetic fields", summaryContent: "Understanding magnetic forces and fields" }
      ],
      term2: [
        { title: "Static Electricity", description: "Electric charges, electric fields", summaryContent: "Understanding stationary electric charges" },
        { title: "Current Electricity", description: "Electric current, circuits, resistance", summaryContent: "Understanding moving electric charges" },
        { title: "Electromagnetic Induction", description: "Induced EMF, generators, transformers", summaryContent: "Understanding electricity and magnetism relationship" }
      ],
      term3: [
        { title: "Rectilinear Motion", description: "Motion in a straight line, equations of motion", summaryContent: "Understanding motion along straight paths" },
        { title: "Newton's Laws of Motion", description: "Three laws of motion and applications", summaryContent: "Understanding fundamental laws governing motion" }
      ]
    },
    "Form 3": {
      term1: [
        { title: "Linear Motion", description: "Velocity, acceleration, motion graphs", summaryContent: "Advanced study of motion in straight lines" },
        { title: "Friction", description: "Types of friction, applications", summaryContent: "Understanding resistance to motion" },
        { title: "Circular Motion", description: "Centripetal force, circular motion", summaryContent: "Understanding motion in circular paths" }
      ],
      term2: [
        { title: "Gravitation", description: "Gravitational force, weight, satellites", summaryContent: "Understanding gravitational attraction" },
        { title: "Work, Energy and Power", description: "Work done, forms of energy, power", summaryContent: "Understanding energy transformations and work" },
        { title: "Momentum", description: "Linear momentum, collisions", summaryContent: "Understanding momentum conservation" }
      ],
      term3: [
        { title: "Simple Harmonic Motion", description: "Oscillations, pendulums, springs", summaryContent: "Understanding periodic motion" },
        { title: "Mechanical Waves", description: "Wave properties, interference", summaryContent: "Understanding wave behavior and interactions" }
      ]
    },
    "Form 4": {
      term1: [
        { title: "Electric Fields", description: "Electric field strength, potential", summaryContent: "Understanding electric force fields" },
        { title: "Capacitance", description: "Capacitors, energy storage", summaryContent: "Understanding electric charge storage" },
        { title: "Electronics", description: "Diodes, transistors, logic gates", summaryContent: "Understanding electronic components and circuits" }
      ],
      term2: [
        { title: "Radioactivity", description: "Nuclear decay, half-life, applications", summaryContent: "Understanding nuclear physics and radioactivity" },
        { title: "Thermionic Emission", description: "Electron emission, cathode ray tube", summaryContent: "Understanding electron emission from heated surfaces" },
        { title: "X-rays", description: "Production and properties of X-rays", summaryContent: "Understanding high-energy electromagnetic radiation" }
      ],
      term3: [
        { title: "Optical Instruments", description: "Microscopes, telescopes, cameras", summaryContent: "Understanding devices that manipulate light" },
        { title: "Atomic Physics", description: "Atomic structure, energy levels", summaryContent: "Understanding the structure of atoms" },
        { title: "Nuclear Physics", description: "Nuclear reactions, fission, fusion", summaryContent: "Understanding nuclear processes and applications" }
      ]
    }
  },

  // Chemistry topics by form level  
  Chemistry: {
    "Form 1": {
      term1: [
        { title: "Introduction to Chemistry", description: "What is chemistry, importance, careers", summaryContent: "Understanding the scope and applications of chemistry" },
        { title: "Laboratory Safety", description: "Safety rules, first aid, laboratory apparatus", summaryContent: "Working safely in the chemistry laboratory" },
        { title: "Collection and Identification of Gases", description: "Methods of gas collection, gas tests", summaryContent: "Techniques for handling and identifying gases" }
      ],
      term2: [
        { title: "Water and Hydrogen", description: "Properties of water, hydrogen preparation", summaryContent: "Understanding water and hydrogen gas" },
        { title: "Air and Combustion", description: "Composition of air, burning process", summaryContent: "Understanding air composition and combustion reactions" },
        { title: "Classification of Substances", description: "Elements, compounds, mixtures", summaryContent: "Understanding different types of matter" }
      ],
      term3: [
        { title: "Atomic Structure", description: "Atoms, electrons, protons, neutrons", summaryContent: "Understanding the structure of atoms" },
        { title: "Radioactivity", description: "Radioactive elements, nuclear reactions", summaryContent: "Understanding nuclear decay and radiation" },
        { title: "The Periodic Table", description: "Arrangement of elements, periodic trends", summaryContent: "Understanding element organization and properties" }
      ]
    },
    "Form 2": {
      term1: [
        { title: "Chemical Bonding", description: "Ionic, covalent, metallic bonding", summaryContent: "Understanding how atoms combine" },
        { title: "Formulae and Naming", description: "Chemical formulae, nomenclature", summaryContent: "Writing and naming chemical compounds" },
        { title: "Chemical Equations", description: "Balancing equations, types of reactions", summaryContent: "Representing chemical reactions symbolically" }
      ],
      term2: [
        { title: "Mass and Chemical Equations", description: "Mole concept, stoichiometry", summaryContent: "Quantitative aspects of chemical reactions" },
        { title: "Acids, Bases and Salts", description: "Properties, preparation, uses", summaryContent: "Understanding acidic and basic substances" },
        { title: "Qualitative Analysis", description: "Testing for ions, flame tests", summaryContent: "Identifying substances through chemical tests" }
      ],
      term3: [
        { title: "Metals", description: "Properties, extraction, uses of metals", summaryContent: "Understanding metallic elements and their applications" },
        { title: "Non-metals", description: "Properties and uses of non-metals", summaryContent: "Understanding non-metallic elements" },
        { title: "Carbon and its Compounds", description: "Allotropes of carbon, organic compounds", summaryContent: "Understanding carbon chemistry" }
      ]
    },
    "Form 3": {
      term1: [
        { title: "Hydrogen and Water", description: "Industrial preparation, uses", summaryContent: "Understanding hydrogen production and applications" },
        { title: "Oxygen", description: "Preparation, properties, uses", summaryContent: "Understanding oxygen and its importance" },
        { title: "Burning and Fuels", description: "Combustion, types of fuels", summaryContent: "Understanding combustion processes and fuels" }
      ],
      term2: [
        { title: "Nitrogen and Ammonia", description: "Nitrogen cycle, ammonia production", summaryContent: "Understanding nitrogen chemistry and applications" },
        { title: "Sulphur and its Compounds", description: "Properties, sulphuric acid production", summaryContent: "Understanding sulphur chemistry" },
        { title: "Chlorine", description: "Preparation, properties, uses", summaryContent: "Understanding chlorine and its compounds" }
      ],
      term3: [
        { title: "Carbon Dioxide", description: "Preparation, properties, uses", summaryContent: "Understanding carbon dioxide chemistry" },
        { title: "Organic Chemistry I", description: "Hydrocarbons, alkanes, alkenes", summaryContent: "Introduction to organic compounds" },
        { title: "Alcohols", description: "Properties, preparation, uses", summaryContent: "Understanding alcohol compounds" }
      ]
    },
    "Form 4": {
      term1: [
        { title: "Rate of Reaction", description: "Factors affecting reaction rates", summaryContent: "Understanding how fast reactions occur" },
        { title: "Equilibrium", description: "Dynamic equilibrium, Le Chatelier's principle", summaryContent: "Understanding reversible reactions" },
        { title: "Electrochemistry", description: "Electrolysis, electrochemical cells", summaryContent: "Understanding electricity and chemical reactions" }
      ],
      term2: [
        { title: "Energy Changes", description: "Enthalpy, thermochemistry", summaryContent: "Understanding energy in chemical reactions" },
        { title: "Organic Chemistry II", description: "Polymers, natural products", summaryContent: "Advanced organic chemistry topics" },
        { title: "Radioactivity and Nuclear Chemistry", description: "Nuclear reactions, applications", summaryContent: "Understanding nuclear chemistry" }
      ],
      term3: [
        { title: "Industrial Processes", description: "Haber process, contact process", summaryContent: "Understanding chemical industry processes" },
        { title: "Environmental Chemistry", description: "Pollution, green chemistry", summaryContent: "Understanding chemistry and environment" },
        { title: "Analytical Chemistry", description: "Quantitative analysis techniques", summaryContent: "Understanding chemical analysis methods" }
      ]
    }
  },

  // Biology topics by form level
  Biology: {
    "Form 1": {
      term1: [
        { title: "Introduction to Biology", description: "What is biology, branches, importance", summaryContent: "Understanding the study of life" },
        { title: "Characteristics of Living Things", description: "Life processes, classification", summaryContent: "Understanding what makes something alive" },
        { title: "Classification of Living Things", description: "Taxonomy, kingdoms, species", summaryContent: "Understanding how organisms are grouped" }
      ],
      term2: [
        { title: "Cell Structure and Function", description: "Plant and animal cells, organelles", summaryContent: "Understanding the basic unit of life" },
        { title: "Nutrition in Plants", description: "Photosynthesis, mineral nutrition", summaryContent: "Understanding how plants make food" },
        { title: "Nutrition in Animals", description: "Feeding, digestion, food tests", summaryContent: "Understanding how animals obtain nutrients" }
      ],
      term3: [
        { title: "Transport in Plants", description: "Water transport, transpiration", summaryContent: "Understanding movement of materials in plants" },
        { title: "Transport in Animals", description: "Blood circulation, lymphatic system", summaryContent: "Understanding circulation in animals" },
        { title: "Respiration", description: "Aerobic and anaerobic respiration", summaryContent: "Understanding how organisms release energy" }
      ]
    },
    "Form 2": {
      term1: [
        { title: "Gaseous Exchange", description: "Breathing, gas exchange in plants and animals", summaryContent: "Understanding oxygen and carbon dioxide exchange" },
        { title: "Excretion", description: "Waste removal in plants and animals", summaryContent: "Understanding waste product elimination" },
        { title: "Regulation", description: "Homeostasis, nervous system", summaryContent: "Understanding body control mechanisms" }
      ],
      term2: [
        { title: "Reproduction in Plants", description: "Sexual and asexual reproduction", summaryContent: "Understanding plant reproduction methods" },
        { title: "Reproduction in Animals", description: "Sexual reproduction, development", summaryContent: "Understanding animal reproduction" },
        { title: "Growth and Development", description: "Growth patterns, factors affecting growth", summaryContent: "Understanding how organisms grow and develop" }
      ],
      term3: [
        { title: "Response to Environment", description: "Tropisms, taxes, reflexes", summaryContent: "Understanding how organisms respond to stimuli" },
        { title: "Support and Movement", description: "Skeletal systems, locomotion", summaryContent: "Understanding support structures and movement" },
        { title: "Coordination", description: "Nervous and hormonal coordination", summaryContent: "Understanding body coordination systems" }
      ]
    },
    "Form 3": {
      term1: [
        { title: "Genetics", description: "Heredity, genes, chromosomes", summaryContent: "Understanding inheritance of traits" },
        { title: "Variation", description: "Types of variation, sources", summaryContent: "Understanding differences among organisms" },
        { title: "Evolution", description: "Theories of evolution, evidence", summaryContent: "Understanding how species change over time" }
      ],
      term2: [
        { title: "Classification of Plants", description: "Plant kingdom classification", summaryContent: "Understanding plant diversity and classification" },
        { title: "Classification of Animals", description: "Animal kingdom classification", summaryContent: "Understanding animal diversity and classification" },
        { title: "Ecology", description: "Ecosystems, food chains, energy flow", summaryContent: "Understanding organism-environment relationships" }
      ],
      term3: [
        { title: "Human Impact on Environment", description: "Pollution, conservation", summaryContent: "Understanding human effects on the environment" },
        { title: "Biotechnology", description: "Applications of biology in technology", summaryContent: "Understanding practical applications of biology" },
        { title: "Disease and Immunity", description: "Pathogens, immune system", summaryContent: "Understanding disease and body defense mechanisms" }
      ]
    },
    "Form 4": {
      term1: [
        { title: "Advanced Genetics", description: "DNA, RNA, protein synthesis", summaryContent: "Understanding molecular genetics" },
        { title: "Cell Division", description: "Mitosis, meiosis, significance", summaryContent: "Understanding how cells reproduce" },
        { title: "Mutations", description: "Types of mutations, effects", summaryContent: "Understanding genetic changes" }
      ],
      term2: [
        { title: "Biotechnology Applications", description: "Genetic engineering, cloning", summaryContent: "Understanding modern biological techniques" },
        { title: "Human Evolution", description: "Human origins, evolutionary evidence", summaryContent: "Understanding human evolutionary history" },
        { title: "Behavior", description: "Animal behavior, adaptation", summaryContent: "Understanding organism behavior patterns" }
      ],
      term3: [
        { title: "Conservation Biology", description: "Biodiversity conservation strategies", summaryContent: "Understanding species and habitat protection" },
        { title: "Environmental Management", description: "Sustainable resource use", summaryContent: "Understanding environmental stewardship" },
        { title: "Applied Biology", description: "Biology in medicine, agriculture", summaryContent: "Understanding practical applications of biological knowledge" }
      ]
    }
  },

  // English topics by form level
  English: {
    "Form 1": {
      term1: [
        { title: "Introduction to Literature", description: "What is literature, types of literature", summaryContent: "Understanding literary works and their importance" },
        { title: "Poetry Basics", description: "Elements of poetry, rhyme, rhythm", summaryContent: "Understanding poetic devices and structure" },
        { title: "Grammar Fundamentals", description: "Parts of speech, sentence structure", summaryContent: "Understanding basic grammar rules" }
      ],
      term2: [
        { title: "Short Stories", description: "Elements of short stories, analysis", summaryContent: "Understanding narrative fiction techniques" },
        { title: "Writing Skills", description: "Paragraph writing, essay structure", summaryContent: "Developing written communication skills" },
        { title: "Vocabulary Development", description: "Word formation, synonyms, antonyms", summaryContent: "Expanding vocabulary and word usage" }
      ],
      term3: [
        { title: "Oral Literature", description: "Folktales, proverbs, riddles", summaryContent: "Understanding traditional oral forms" },
        { title: "Reading Comprehension", description: "Reading strategies, text analysis", summaryContent: "Developing reading and understanding skills" },
        { title: "Creative Writing", description: "Descriptive and narrative writing", summaryContent: "Expressing ideas creatively through writing" }
      ]
    },
    "Form 2": {
      term1: [
        { title: "Drama Basics", description: "Elements of drama, play analysis", summaryContent: "Understanding theatrical works" },
        { title: "Advanced Grammar", description: "Tenses, voice, reported speech", summaryContent: "Mastering complex grammar structures" },
        { title: "Literary Devices", description: "Metaphor, simile, symbolism", summaryContent: "Understanding figurative language" }
      ],
      term2: [
        { title: "Novel Study", description: "Novel analysis, character development", summaryContent: "Understanding long narrative fiction" },
        { title: "Formal Writing", description: "Business letters, reports", summaryContent: "Writing for formal purposes" },
        { title: "Speech and Presentation", description: "Public speaking, oral presentation", summaryContent: "Developing oral communication skills" }
      ],
      term3: [
        { title: "Poetry Analysis", description: "Poetic themes, interpretation", summaryContent: "Analyzing and interpreting poems" },
        { title: "Research Skills", description: "Information gathering, citation", summaryContent: "Conducting academic research" },
        { title: "Critical Thinking", description: "Analysis, evaluation, argument", summaryContent: "Developing analytical thinking skills" }
      ]
    },
    "Form 3": {
      term1: [
        { title: "Set Book Analysis", description: "Detailed study of prescribed texts", summaryContent: "In-depth analysis of literature texts" },
        { title: "Essay Writing", description: "Argumentative and expository essays", summaryContent: "Advanced essay composition skills" },
        { title: "Language and Style", description: "Author's style, language use", summaryContent: "Understanding literary style and technique" }
      ],
      term2: [
        { title: "Comparative Literature", description: "Comparing texts, themes", summaryContent: "Analyzing relationships between texts" },
        { title: "Media Literacy", description: "Understanding media messages", summaryContent: "Critical analysis of media content" },
        { title: "Advanced Vocabulary", description: "Literary terms, academic vocabulary", summaryContent: "Expanding advanced vocabulary" }
      ],
      term3: [
        { title: "Exam Preparation", description: "KCSE format, exam techniques", summaryContent: "Preparing for national examinations" },
        { title: "Creative Expression", description: "Original creative writing", summaryContent: "Developing personal creative voice" },
        { title: "Literary Criticism", description: "Evaluating and critiquing literature", summaryContent: "Developing critical evaluation skills" }
      ]
    },
    "Form 4": {
      term1: [
        { title: "Advanced Set Book Study", description: "Complex analysis of prescribed texts", summaryContent: "Sophisticated literary analysis skills" },
        { title: "Composition Mastery", description: "Advanced composition techniques", summaryContent: "Mastering various writing forms" },
        { title: "Literary Theory", description: "Approaches to literary analysis", summaryContent: "Understanding different critical perspectives" }
      ],
      term2: [
        { title: "Exam Strategies", description: "Time management, question analysis", summaryContent: "Optimizing examination performance" },
        { title: "Portfolio Development", description: "Collecting and refining work", summaryContent: "Demonstrating learning progress" },
        { title: "Peer Review", description: "Evaluating and improving work", summaryContent: "Collaborative learning and improvement" }
      ],
      term3: [
        { title: "Revision and Practice", description: "Comprehensive review, past papers", summaryContent: "Final preparation for examinations" },
        { title: "Language Mastery", description: "Perfect grammar, style", summaryContent: "Achieving language proficiency" },
        { title: "Literary Appreciation", description: "Understanding literature's value", summaryContent: "Developing lifelong appreciation for literature" }
      ]
    }
  },

  // Kiswahili topics by form level
  Kiswahili: {
    "Form 1": {
      term1: [
        { title: "Utangulizi wa Kiswahili", description: "Historia ya lugha ya Kiswahili", summaryContent: "Kuelewa chanzo na ukuaji wa Kiswahili" },
        { title: "Sarufi za Msingi", description: "Nomino, vivumishi, vitenzi", summaryContent: "Kujua misingi ya sarufi ya Kiswahili" },
        { title: "Mazungumzo", description: "Mazungumzo ya kila siku", summaryContent: "Kuongea kwa Kiswahili sanifu" }
      ],
      term2: [
        { title: "Hadithi Fupi", description: "Uchambuzi wa hadithi fupi", summaryContent: "Kuelewa mbinu za uandishi wa hadithi" },
        { title: "Uandishi", description: "Uandishi wa barua na insha", summaryContent: "Kuandika kwa lugha sanifu" },
        { title: "Utamaduni", description: "Desturi na mila za Kiafrika", summaryContent: "Kuelewa utamaduni wa Kiafrika" }
      ],
      term3: [
        { title: "Mashairi", description: "Aina za mashairi na uchambuzi", summaryContent: "Kuelewa sanaa ya ushairi" },
        { title: "Fasihi Simulizi", description: "Hadithi za jadi, methali, vitendawili", summaryContent: "Kuelewa fasihi ya asili" },
        { title: "Utayarishaji wa Mitihani", description: "Mbinu za kujibu mitihani", summaryContent: "Kujiandaa kwa mtihani wa KCSE" }
      ]
    },
    "Form 2": {
      term1: [
        { title: "Sarufi za Hali ya Juu", description: "Viunganishi, vishazi", summaryContent: "Kuongeza ujuzi wa sarufi" },
        { title: "Tamthilia", description: "Uchambuzi wa tamthilia", summaryContent: "Kuelewa sanaa ya mchezo" },
        { title: "Uandishi wa Kifasihi", description: "Uandishi wa kielelezo na kibunifu", summaryContent: "Kuongeza ustadi wa uandishi" }
      ],
      term2: [
        { title: "Riwaya", description: "Uchambuzi wa riwaya", summaryContent: "Kuelewa muundo wa riwaya" },
        { title: "Lugha na Mazingira", description: "Athari za mazingira kwenye lugha", summaryContent: "Kuhusisha lugha na mazingira" },
        { title: "Fani za Lugha", description: "Fonolojia, mofolojia, sintaksia", summaryContent: "Kujua fani za kisayansi za lugha" }
      ],
      term3: [
        { title: "Uchambuzi wa Kimaudhui", description: "Maudhui na ujumbe wa fasihi", summaryContent: "Kuelewa ujumbe wa kazi za fasihi" },
        { title: "Ufundishaji wa Lugha", description: "Njia za kufundisha Kiswahili", summaryContent: "Mbinu za ufundishaji wa lugha" },
        { title: "Utafiti", description: "Mbinu za utafiti wa kilugha", summaryContent: "Kufanya utafiti katika fasihi" }
      ]
    },
    "Form 3": {
      term1: [
        { title: "Vitabu vya Kusoma", description: "Uchambuzi wa kina wa vitabu vilivyochaguliwa", summaryContent: "Kuchambua vitabu vya mtaala" },
        { title: "Insha za Hali ya Juu", description: "Insha za mjadala na ufafanuzi", summaryContent: "Kuandika kwa ustadi mkuu" },
        { title: "Uongozi wa Mazungumzo", description: "Uongozi na ushiriki katika mazungumzo", summaryContent: "Kuongoza mazungumzo kwa ustadi" }
      ],
      term2: [
        { title: "Fasihi Linganishi", description: "Kulinganisha kazi mbalimbali za fasihi", summaryContent: "Kuona uhusiano kati ya kazi za fasihi" },
        { title: "Lugha ya Vyombo vya Habari", description: "Uchambuzi wa lugha ya magazeti na redio", summaryContent: "Kuelewa lugha ya vyombo vya habari" },
        { title: "Msamiati wa Hali ya Juu", description: "Maneno ya kitaaluma na ya fasihi", summaryContent: "Kuongeza hazina ya maneno" }
      ],
      term3: [
        { title: "Maandalizi ya Mtihani", description: "Mikakati ya mtihani wa KCSE", summaryContent: "Kujiandaa vizuri kwa mtihani mkuu" },
        { title: "Ubunifu wa Fasihi", description: "Kutunga fasihi ya asili", summaryContent: "Kuongeza ubunifu wa kiutunzi" },
        { title: "Uchambuzi wa Kihakiki", description: "Kutathmini na kuhakiki fasihi", summaryContent: "Kuongeza ujuzi wa uhakiki" }
      ]
    },
    "Form 4": {
      term1: [
        { title: "Uchambuzi wa Kina wa Vitabu", description: "Uchambuzi wa kina wa vitabu vilivyochaguliwa", summaryContent: "Uchambuzi wa hali ya juu wa fasihi" },
        { title: "Ustadi wa Uandishi", description: "Mbinu za hali ya juu za uandishi", summaryContent: "Kufikia ustadi mkuu wa uandishi" },
        { title: "Nadharia za Fasihi", description: "Mbinu mbalimbali za uchambuzi wa fasihi", summaryContent: "Kuelewa mitazamo ya kihakiki" }
      ],
      term2: [
        { title: "Mikakati ya Mtihani", description: "Usimamizi wa wakati na uchambuzi wa maswali", summaryContent: "Kuboresha utendaji katika mitihani" },
        { title: "Ukusanyaji wa Kazi", description: "Kukusanya na kuboresha kazi", summaryContent: "Kuonyesha maendeleo ya kujifunza" },
        { title: "Uhakiki wa Wenzako", description: "Kutathmini na kuboresha kazi", summaryContent: "Kujifunza kwa ushirikiano" }
      ],
      term3: [
        { title: "Marudio na Mazoezi", description: "Mapitio ya kina, mitihani ya zamani", summaryContent: "Maandalizi ya mwisho kwa mtihani" },
        { title: "Ustadi wa Lugha", description: "Sarufi kamili, mtindo", summaryContent: "Kufikia uongozi wa lugha" },
        { title: "Uthamini wa Fasihi", description: "Kuelewa thamani ya fasihi", summaryContent: "Kuongeza upendo wa fasihi maishani" }
      ]
    }
  }
};

async function seedTopics() {
  try {
    console.log("Starting to seed topics...");
    
    // Get all subjects and levels
    const allSubjects = await db.select().from(subjects);
    const allLevels = await db.select().from(levels);
    
    for (const subject of allSubjects) {
      console.log(`Processing subject: ${subject.name}`);
      
      const subjectTopics = KCSE_TOPICS[subject.name as keyof typeof KCSE_TOPICS];
      if (!subjectTopics) {
        console.log(`No topics defined for ${subject.name}, skipping...`);
        continue;
      }
      
      for (const level of allLevels) {
        if (level.examinationSystemId !== subject.examinationSystemId) continue;
        
        console.log(`Processing level: ${level.title}`);
        
        const levelTopics = subjectTopics[level.title as keyof typeof subjectTopics];
        if (!levelTopics) {
          console.log(`No topics defined for ${subject.name} ${level.title}, skipping...`);
          continue;
        }
        
        let order = 1;
        for (const [termKey, termTopics] of Object.entries(levelTopics)) {
          for (const topic of termTopics) {
            // Check if topic already exists
            const existingTopic = await db.select()
              .from(topics)
              .where(
                and(
                  eq(topics.subjectId, subject.id),
                  eq(topics.levelId, level.id),
                  eq(topics.title, topic.title),
                  eq(topics.term, termKey)
                )
              );
            
            if (existingTopic.length === 0) {
              await db.insert(topics).values({
                subjectId: subject.id,
                levelId: level.id,
                title: topic.title,
                description: topic.description,
                summaryContent: topic.summaryContent,
                term: termKey,
                order: order++
              });
              console.log(`Added topic: ${topic.title} (${subject.name} - ${level.title} - ${termKey})`);
            } else {
              console.log(`Topic already exists: ${topic.title}`);
            }
          }
        }
      }
    }
    
    console.log("Topics seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding topics:", error);
    throw error;
  }
}

// Run the seeding if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedTopics()
    .then(() => {
      console.log("Seeding completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seeding failed:", error);
      process.exit(1);
    });
}

export { seedTopics };