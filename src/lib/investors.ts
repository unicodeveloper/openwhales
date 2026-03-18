export interface Investor {
  name: string;
  fund: string;
  title: string;
  slug: string;
}

export const INVESTORS: Investor[] = [
  // =====================================================
  // ACTIVIST INVESTORS (18)
  // =====================================================
  { name: "Bill Ackman", fund: "Pershing Square Capital Management", title: "CEO & Portfolio Manager", slug: "bill-ackman" },
  { name: "Carl Icahn", fund: "Icahn Enterprises", title: "Chairman", slug: "carl-icahn" },
  { name: "Dan Loeb", fund: "Third Point LLC", title: "CEO & CIO", slug: "dan-loeb" },
  { name: "David Einhorn", fund: "Greenlight Capital", title: "President", slug: "david-einhorn" },
  { name: "Nelson Peltz", fund: "Trian Fund Management", title: "CEO & Founding Partner", slug: "nelson-peltz" },
  { name: "Paul Singer", fund: "Elliott Management", title: "Founder & Co-CEO", slug: "paul-singer" },
  { name: "Jeff Smith", fund: "Starboard Value", title: "CEO & CIO", slug: "jeff-smith" },
  { name: "Barry Rosenstein", fund: "JANA Partners", title: "Managing Partner", slug: "barry-rosenstein" },
  { name: "Keith Meister", fund: "Corvex Management", title: "Managing Partner", slug: "keith-meister" },
  { name: "Ryan Cohen", fund: "RC Ventures", title: "Founder", slug: "ryan-cohen" },
  { name: "Boaz Weinstein", fund: "Saba Capital Management", title: "Founder & CIO", slug: "boaz-weinstein" },
  { name: "Scott Ferguson", fund: "Sachem Head Capital Management", title: "Managing Partner", slug: "scott-ferguson" },
  { name: "Mason Morfit", fund: "ValueAct Capital", title: "CEO", slug: "mason-morfit" },
  { name: "Jesse Cohn", fund: "Elliott Management", title: "Managing Partner", slug: "jesse-cohn" },
  { name: "Chris Hohn", fund: "TCI Fund Management", title: "Founder & Managing Partner", slug: "chris-hohn" },
  { name: "Christer Gardell", fund: "Cevian Capital", title: "Co-Founder & Managing Partner", slug: "christer-gardell" },
  { name: "Cliff Robbins", fund: "Blue Harbour Group", title: "Founder & CEO", slug: "cliff-robbins" },
  { name: "Jonathan Litt", fund: "Land & Buildings Investment Management", title: "Founder & CIO", slug: "jonathan-litt" },

  // =====================================================
  // LEGENDARY VALUE INVESTORS (16)
  // =====================================================
  { name: "Warren Buffett", fund: "Berkshire Hathaway", title: "Chairman & CEO", slug: "warren-buffett" },
  { name: "Charlie Munger", fund: "Berkshire Hathaway", title: "Vice Chairman (Legacy)", slug: "charlie-munger" },
  { name: "Seth Klarman", fund: "Baupost Group", title: "CEO", slug: "seth-klarman" },
  { name: "Howard Marks", fund: "Oaktree Capital Management", title: "Co-Chairman", slug: "howard-marks" },
  { name: "Joel Greenblatt", fund: "Gotham Asset Management", title: "Managing Principal", slug: "joel-greenblatt" },
  { name: "Mohnish Pabrai", fund: "Pabrai Investment Funds", title: "Managing Partner", slug: "mohnish-pabrai" },
  { name: "Li Lu", fund: "Himalaya Capital Management", title: "Founder & Chairman", slug: "li-lu" },
  { name: "Bill Nygren", fund: "Oakmark Funds / Harris Associates", title: "Portfolio Manager", slug: "bill-nygren" },
  { name: "Mason Hawkins", fund: "Longleaf Partners / Southeastern Asset Management", title: "Chairman & CEO", slug: "mason-hawkins" },
  { name: "Bruce Berkowitz", fund: "Fairholme Capital Management", title: "Founder & CIO", slug: "bruce-berkowitz" },
  { name: "Tom Gayner", fund: "Markel Group", title: "Chairman & CEO", slug: "tom-gayner" },
  { name: "Christopher Bloomstran", fund: "Semper Augustus Investments", title: "President & CIO", slug: "christopher-bloomstran" },
  { name: "Guy Spier", fund: "Aquamarine Capital Management", title: "Managing Partner", slug: "guy-spier" },
  { name: "Whitney Tilson", fund: "Empire Financial Research", title: "Founder", slug: "whitney-tilson" },
  { name: "John Rogers", fund: "Ariel Investments", title: "Founder, Chairman & Co-CEO", slug: "john-rogers" },
  { name: "Charles Bobrinskoy", fund: "Ariel Investments", title: "Vice Chairman", slug: "charles-bobrinskoy" },

  // =====================================================
  // HEDGE FUND TITANS (23)
  // =====================================================
  { name: "Ray Dalio", fund: "Bridgewater Associates", title: "Founder", slug: "ray-dalio" },
  { name: "Ken Griffin", fund: "Citadel", title: "Founder & CEO", slug: "ken-griffin" },
  { name: "Steve Cohen", fund: "Point72 Asset Management", title: "Chairman & CEO", slug: "steve-cohen" },
  { name: "Jim Simons", fund: "Renaissance Technologies", title: "Founder (Legacy)", slug: "jim-simons" },
  { name: "George Soros", fund: "Soros Fund Management", title: "Founder", slug: "george-soros" },
  { name: "Stanley Druckenmiller", fund: "Duquesne Family Office", title: "Chairman & CEO", slug: "stanley-druckenmiller" },
  { name: "David Tepper", fund: "Appaloosa Management", title: "Founder & President", slug: "david-tepper" },
  { name: "Chase Coleman", fund: "Tiger Global Management", title: "Founder & Chairman", slug: "chase-coleman" },
  { name: "Philippe Laffont", fund: "Coatue Management", title: "Founder & CIO", slug: "philippe-laffont" },
  { name: "Andreas Halvorsen", fund: "Viking Global Investors", title: "Co-Founder & CIO", slug: "andreas-halvorsen" },
  { name: "Daniel Sundheim", fund: "D1 Capital Partners", title: "Founder & CIO", slug: "daniel-sundheim" },
  { name: "John Paulson", fund: "Paulson & Co.", title: "President", slug: "john-paulson" },
  { name: "Michael Burry", fund: "Scion Asset Management", title: "Founder & Portfolio Manager", slug: "michael-burry" },
  { name: "Bill Gross", fund: "PIMCO (Legacy)", title: "Co-Founder", slug: "bill-gross" },
  { name: "Leon Cooperman", fund: "Omega Advisors", title: "Chairman & CEO", slug: "leon-cooperman" },
  { name: "Eddie Lampert", fund: "ESL Investments", title: "Chairman & CEO", slug: "eddie-lampert" },
  { name: "Bill Miller", fund: "Miller Value Partners", title: "Chairman & CIO", slug: "bill-miller" },
  { name: "Stephen Mandel", fund: "Lone Pine Capital", title: "Founder", slug: "stephen-mandel" },
  { name: "Larry Robbins", fund: "Glenview Capital Management", title: "Founder & CEO", slug: "larry-robbins" },
  { name: "Israel Englander", fund: "Millennium Management", title: "Founder & CEO", slug: "israel-englander" },
  { name: "Bobby Jain", fund: "Jain Global", title: "Founder & CIO", slug: "bobby-jain" },
  { name: "Dmitry Balyasny", fund: "Balyasny Asset Management", title: "Founder & CIO", slug: "dmitry-balyasny" },
  { name: "Dan Och", fund: "Sculptor Capital Management", title: "Founder", slug: "dan-och" },

  // =====================================================
  // GROWTH / TECH INVESTORS (8)
  // =====================================================
  { name: "Cathie Wood", fund: "ARK Invest", title: "CEO & CIO", slug: "cathie-wood" },
  { name: "Brad Gerstner", fund: "Altimeter Capital", title: "Founder & CEO", slug: "brad-gerstner" },
  { name: "Lee Ainslie", fund: "Maverick Capital", title: "Managing Partner", slug: "lee-ainslie" },
  { name: "Pat Dorsey", fund: "Dorsey Asset Management", title: "Founder", slug: "pat-dorsey" },
  { name: "Dennis Hong", fund: "ShawSpring Partners", title: "Founder & Managing Partner", slug: "dennis-hong" },
  { name: "Glen Kacher", fund: "Light Street Capital", title: "Founder & CIO", slug: "glen-kacher" },
  { name: "Alex Sacerdote", fund: "Whale Rock Capital Management", title: "Founder & CIO", slug: "alex-sacerdote" },
  { name: "Will Danoff", fund: "Fidelity Contrafund", title: "Portfolio Manager", slug: "will-danoff" },

  // =====================================================
  // QUANT / SYSTEMATIC FUND MANAGERS (5)
  // =====================================================
  { name: "John Overdeck", fund: "Two Sigma Investments", title: "Co-Founder & Co-Chairman", slug: "john-overdeck" },
  { name: "David Siegel", fund: "Two Sigma Investments", title: "Co-Founder & Co-Chairman", slug: "david-siegel" },
  { name: "Cliff Asness", fund: "AQR Capital Management", title: "Founder & CIO", slug: "cliff-asness" },
  { name: "Peter Brown", fund: "Renaissance Technologies", title: "CEO", slug: "peter-brown" },
  { name: "David Shaw", fund: "D.E. Shaw & Co.", title: "Founder", slug: "david-shaw" },

  // =====================================================
  // GLOBAL MACRO INVESTORS (6)
  // =====================================================
  { name: "Paul Tudor Jones", fund: "Tudor Investment Corp.", title: "Founder & CIO", slug: "paul-tudor-jones" },
  { name: "Alan Howard", fund: "Brevan Howard Asset Management", title: "Co-Founder", slug: "alan-howard" },
  { name: "Louis Bacon", fund: "Moore Capital Management", title: "Founder", slug: "louis-bacon" },
  { name: "Bruce Kovner", fund: "Caxton Associates", title: "Founder & Chairman", slug: "bruce-kovner" },
  { name: "Michael Platt", fund: "BlueCrest Capital Management", title: "Founder", slug: "michael-platt" },
  { name: "John Henry", fund: "John W. Henry & Company", title: "Founder", slug: "john-henry" },

  // =====================================================
  // PRIVATE EQUITY CROSSOVER / ALTERNATIVE ASSET MANAGERS (8)
  // =====================================================
  { name: "Stephen Schwarzman", fund: "Blackstone", title: "Chairman, CEO & Co-Founder", slug: "stephen-schwarzman" },
  { name: "Henry Kravis", fund: "KKR", title: "Co-Founder & Co-Executive Chairman", slug: "henry-kravis" },
  { name: "Marc Rowan", fund: "Apollo Global Management", title: "CEO", slug: "marc-rowan" },
  { name: "David Bonderman", fund: "TPG Capital", title: "Founding Partner", slug: "david-bonderman" },
  { name: "Jim Coulter", fund: "TPG Capital", title: "Co-Founder & Executive Chairman", slug: "jim-coulter" },
  { name: "Orlando Bravo", fund: "Thoma Bravo", title: "Managing Partner", slug: "orlando-bravo" },
  { name: "Robert Smith", fund: "Vista Equity Partners", title: "Founder, Chairman & CEO", slug: "robert-smith" },
  { name: "David Rubenstein", fund: "The Carlyle Group", title: "Co-Founder & Co-Chairman", slug: "david-rubenstein" },

  // =====================================================
  // ESG / IMPACT INVESTORS (3)
  // =====================================================
  { name: "Al Gore", fund: "Generation Investment Management", title: "Co-Founder & Chairman", slug: "al-gore" },
  { name: "Nancy Pfund", fund: "DBL Partners", title: "Founder & Managing Partner", slug: "nancy-pfund" },
  { name: "Larry Fink", fund: "BlackRock", title: "Chairman & CEO", slug: "larry-fink" },

  // =====================================================
  // CORPORATE INSIDERS / NOTABLE CEOs (22)
  // =====================================================
  { name: "Elon Musk", fund: "Tesla / SpaceX / xAI", title: "CEO", slug: "elon-musk" },
  { name: "Jamie Dimon", fund: "JPMorgan Chase", title: "Chairman & CEO", slug: "jamie-dimon" },
  { name: "Tim Cook", fund: "Apple", title: "CEO", slug: "tim-cook" },
  { name: "Satya Nadella", fund: "Microsoft", title: "Chairman & CEO", slug: "satya-nadella" },
  { name: "Mark Zuckerberg", fund: "Meta Platforms", title: "Chairman & CEO", slug: "mark-zuckerberg" },
  { name: "Jensen Huang", fund: "NVIDIA", title: "Founder & CEO", slug: "jensen-huang" },
  { name: "Andy Jassy", fund: "Amazon", title: "President & CEO", slug: "andy-jassy" },
  { name: "Sundar Pichai", fund: "Alphabet / Google", title: "CEO", slug: "sundar-pichai" },
  { name: "Lisa Su", fund: "AMD", title: "Chair & CEO", slug: "lisa-su" },
  { name: "Brian Moynihan", fund: "Bank of America", title: "Chairman & CEO", slug: "brian-moynihan" },
  { name: "Reed Hastings", fund: "Netflix", title: "Co-Founder & Executive Chairman", slug: "reed-hastings" },
  { name: "Hock Tan", fund: "Broadcom", title: "President & CEO", slug: "hock-tan" },
  { name: "Bob Iger", fund: "The Walt Disney Company", title: "CEO", slug: "bob-iger" },
  { name: "David Solomon", fund: "Goldman Sachs", title: "Chairman & CEO", slug: "david-solomon" },
  { name: "Mary Barra", fund: "General Motors", title: "Chair & CEO", slug: "mary-barra" },
  { name: "Doug McMillon", fund: "Walmart", title: "President & CEO", slug: "doug-mcmillon" },
  { name: "Jane Fraser", fund: "Citigroup", title: "CEO", slug: "jane-fraser" },
  { name: "Safra Catz", fund: "Oracle", title: "CEO", slug: "safra-catz" },
  { name: "Pat Gelsinger", fund: "Intel (Former)", title: "Former CEO", slug: "pat-gelsinger" },
  { name: "Brian Niccol", fund: "Starbucks", title: "Chairman & CEO", slug: "brian-niccol" },
  { name: "Arvind Krishna", fund: "IBM", title: "Chairman & CEO", slug: "arvind-krishna" },
  { name: "Larry Ellison", fund: "Oracle", title: "Co-Founder & CTO", slug: "larry-ellison" },

  // =====================================================
  // ADDITIONAL NOTABLE FUND MANAGERS (17)
  // =====================================================
  { name: "Terry Smith", fund: "Fundsmith", title: "Founder & CEO", slug: "terry-smith" },
  { name: "David Abrams", fund: "Abrams Capital Management", title: "Managing Member", slug: "david-abrams" },
  { name: "Thomas Russo", fund: "Gardner Russo & Quinn", title: "Managing Member", slug: "thomas-russo" },
  { name: "Prem Watsa", fund: "Fairfax Financial Holdings", title: "Chairman & CEO", slug: "prem-watsa" },
  { name: "Mario Gabelli", fund: "GAMCO Investors", title: "Chairman & CEO", slug: "mario-gabelli" },
  { name: "Jeffrey Gundlach", fund: "DoubleLine Capital", title: "Founder & CEO", slug: "jeffrey-gundlach" },
  { name: "Glenn Greenberg", fund: "Brave Warrior Advisors", title: "Co-Founder & Managing Director", slug: "glenn-greenberg" },
  { name: "Boykin Curry", fund: "Eagle Capital Management", title: "Managing Partner", slug: "boykin-curry" },
  { name: "Robert Karr", fund: "Joho Capital", title: "Founder & Managing Partner", slug: "robert-karr" },
  { name: "Peter Lynch", fund: "Fidelity Magellan Fund (Legacy)", title: "Former Manager", slug: "peter-lynch" },
  { name: "Ron Baron", fund: "Baron Capital Group", title: "Founder, Chairman & CEO", slug: "ron-baron" },
  { name: "Chuck Akre", fund: "Akre Capital Management", title: "Founder & Chairman", slug: "chuck-akre" },
  { name: "Chris Davis", fund: "Davis Advisors", title: "Chairman", slug: "chris-davis" },
  { name: "Bill Miller IV", fund: "Miller Value Partners", title: "CIO", slug: "bill-miller-iv" },

  // =====================================================
  // EMERGING & MID-TIER MANAGERS (6)
  // =====================================================
  { name: "Todd Barker", fund: "Freestone Grove Partners", title: "Co-Founder", slug: "todd-barker" },
  { name: "Agata Dornan", fund: "Chepstow Lane", title: "Founder", slug: "agata-dornan" },
  { name: "Anand Parekh", fund: "Aravt Global", title: "Founder & CIO", slug: "anand-parekh" },
  { name: "Samantha Greenberg", fund: "Margate Capital", title: "Founder & CIO", slug: "samantha-greenberg" },
  { name: "Michael Rockefeller", fund: "Woodline Partners", title: "Co-Founder & Co-CIO", slug: "michael-rockefeller" },
  { name: "Karl Kroeker", fund: "Woodline Partners", title: "Co-Founder & Co-CIO", slug: "karl-kroeker" },
];

export function findInvestorBySlug(slug: string): Investor | undefined {
  return INVESTORS.find((i) => i.slug === slug);
}
