export interface CookedChatMessage {
  id: string;
  sender: 'dale' | 'crystal' | 'hunter' | 'tammy' | 'sponsor' | 'user';
  name: string;
  handle: string;
  avatar: string;
  color: string;
  badge?: string;
  text: string;
  timestamp: string;
}

export const COOKED_SPONSORS = [
  "📢 CITIZEN ALERT: 'Speedy Pawn & Loan — We take catalytic converters, half-broken lawnmowers, and copper pipes with zero questions asked!'",
  "📢 24/7 GAS STATION ADS: 'Monster Energy 3-for-$5 + Glass Rose Novelty Pipes behind the counter. Ask for Sal.'",
  "📢 PUBLIC NOTICE: 'County Scrap Yard — Cash for scrap metal paid immediately in crumpled $5 bills.'",
  "📢 CAMPAIGN BROADCAST: 'Re-Elect Mayor Higgins — Lowering bail amounts and promising streetlights that flicker less!'",
];

export const COOKED_CHARACTERS = {
  dale: {
    name: "AutisticEDDIE",
    handle: "@AutisticEDDIE",
    avatar: "🧢",
    color: "#ef4444",
    badge: "GOP TWEAKER",
  },
  crystal: {
    name: "BORINGBUNNY",
    handle: "@BORINGBUNNY",
    avatar: "🐰",
    color: "#3b82f6",
    badge: "DNC CRACKHEAD",
  },
  tammy: {
    name: "METHINMYVIENS",
    handle: "@METHINMYVIENS",
    avatar: "⚡",
    color: "#f43f5e",
    badge: "MAGA CRACKHEAD",
  },
  hunter: {
    name: "Deeppockets6",
    handle: "@Deeppockets6",
    avatar: "💸",
    color: "#06b6d4",
    badge: "DEMOCRAT TWEAKER",
  }
};

export const COOKED_ARGUMENT_EXCHANGES: Array<{
  speaker: 'dale' | 'crystal' | 'hunter' | 'tammy';
  text: string;
}[]> = [
  [
    {
      speaker: 'dale',
      text: "I HAVE BEEN AWAKE FOR 11 DAYS STRIPPING THE WIRING OUT OF THIS CHEVY MALIBU! IF TRUMP WAS IN OFFICE THE SCRAP COPPER PRICES WOULD BE $14 A POUND INSTEAD OF THIS SLEEPY JOE RECESSION!"
    },
    {
      speaker: 'crystal',
      text: "AutisticEDDIE you uneducated fascist bootlicker! Taking that copper without a union card is micro-aggression! Bernie Sanders told me in my glass pipe that universal healthcare covers free butane torches for the working class!"
    },
    {
      speaker: 'tammy',
      text: "BORINGBUNNY SHUT UP YOUR SOY-BOY DEMOCRATS INSTALLED 5G MICROCHIPS IN THE CRACK VIALS! GEORGE WASHINGTON HIMSELF JUST SPOKE TO ME THROUGH THE MICROWAVE CLOCK WHILE I WAS SCRAPING RESIN!"
    },
    {
      speaker: 'hunter',
      text: "METHINMYVIENS your microwave is emitting carbon emissions that violate the Paris Climate Accord! I offset my crack smoking by riding a stolen CitiBike backwards through the Taco Bell drive-thru!"
    }
  ],
  [
    {
      speaker: 'tammy',
      text: "I saw three ballot harvesters hiding in the dumpster behind the Dollar General at 4:30 AM! They were disguising themselves as stray possums to steal the county commissioner race!"
    },
    {
      speaker: 'hunter',
      text: "Those weren't ballot harvesters METHINMYVIENS, that was literally me and my polyamorous drum circle looking for discarded lithium vape batteries to power our decentralized socialist compost grid!"
    },
    {
      speaker: 'dale',
      text: "Deeppockets6 I caught you sniffing my car battery at 3 AM with a clipboard! You work for the IRS and the Department of Transportation! I'm building a border wall around my trailer with stolen hubcaps!"
    },
    {
      speaker: 'crystal',
      text: "A border wall of hubcaps?! That is peak capitalist imperialism AutisticEDDIE! Wealth redistribution means those hubcaps belong to the public sidewalk collective!"
    }
  ],
  [
    {
      speaker: 'crystal',
      text: "Kamala Harris's laugh contains sacred 432Hz vibrations that automatically cleanse my pipe resin! The Democratic party is aligning the third-eye chakras of all under-housed nocturnal street philosophers!"
    },
    {
      speaker: 'tammy',
      text: "BORINGBUNNY you are possessed by cultural Marxism! The REAL deep state is putting fluoride in the gas station slushies to make red-blooded patriots too tired to vacuum their carpets at 5 AM with the lights off!"
    },
    {
      speaker: 'dale',
      text: "WHO IS TALKING ABOUT VACUUMING AT 5 AM?! I JUST TOOK APART MY ENTIRE CEILING FAN TO FIND THE FBI BUG! 74 SCREWS ON THE CARPET AND NOT A SINGLE ONE IS METRIC!"
    },
    {
      speaker: 'hunter',
      text: "AutisticEDDIE the imperial measurement system was invented by big oil oligarchs! If we switched to the metric system my dealer would have to give me 1.0 grams instead of a skimpy 0.7 baggie!"
    }
  ],
  [
    {
      speaker: 'hunter',
      text: "Capitalism is collapsing brothers and sisters! The proletariat must seize the Means of Production, starting with the catalytic converter on the principal's Toyota Prius in the high school parking lot!"
    },
    {
      speaker: 'dale',
      text: "YOU TOUCH MY TOYOTA PRIUS CATALYTIC CONVERTER AND I WILL EXERCISE MY SECOND AMENDMENT GOD GIVEN RIGHT WITH A BLOWTORCH AND A BUCKET OF GRAVEL, LIBERAL!"
    },
    {
      speaker: 'tammy',
      text: "AMEN AutisticEDDIE! Stand your ground! The Supreme Court said I can open-carry my cordless angle grinder anywhere in this county without a government permit!"
    },
    {
      speaker: 'crystal',
      text: "METHINMYVIENS your angle grinder woke up my rescue iguana Karl Marx! He gets panic attacks whenever he hears unregulated free-market power tools!"
    }
  ],
  [
    {
      speaker: 'dale',
      text: "Look out the window right now! There is a black surveillance helicopter shaped like a giant Nancy Pelosi hovering over the Circle K! I'm putting tin foil on my teeth!"
    },
    {
      speaker: 'crystal',
      text: "AutisticEDDIE that is literally the Goodyear blimp advertising zero-interest student loan consolidation! Read Marx for once instead of watching Fox News through your neighbor's window blinds!"
    },
    {
      speaker: 'hunter',
      text: "Student loan debt is violence! I paid off my sociology degree by trading three copper heat pipes and half a catalytic converter to a guy named Sledgehammer behind Wendy's!"
    },
    {
      speaker: 'tammy',
      text: "Sledgehammer is a registered Republican and an entrepreneur, Deeppockets6! He creates local jobs in the scrap metal gig economy while you liberals complain about pronouns on Twitter!"
    }
  ]
];

export const USER_COOKED_REPLIES: Array<{
  character: 'dale' | 'crystal' | 'hunter' | 'tammy';
  text: (input: string) => string;
}[]> = [
  [
    {
      character: 'dale',
      text: (t) => `DID YOU HEAR THIS CALLER?! "${t}"?! THAT IS EXACTLY WHAT THE BIDEN ADMINISTRATION CODES INTO THE TRAFFIC LIGHT SEQUENCES TO CONFUSE HARD-WORKING SCRAP METAL COLLECTORS!`
    },
    {
      character: 'crystal',
      text: (t) => `AutisticEDDIE stop shouting! Caller, "${t}" is pure neo-liberal anti-worker rhetoric! Bernie told us in 2016 that the working class needs collective ownership of the lighter fluid!`
    }
  ],
  [
    {
      character: 'tammy',
      text: (t) => `"${t}"?! THIS PERSON IS CLEARLY AN UNDERCOVER FBI AGENT SENT BY THE DEEP STATE TO CONFISCATE MY VINTAGE PYREX CRACK PIPES!`
    },
    {
      character: 'hunter',
      text: (t) => `METHINMYVIENS calm down, "${t}" is just the capitalist conditioning talking. Caller, have you considered joining our mutual-aid copper scavenging collective?`
    }
  ],
  [
    {
      character: 'crystal',
      text: (t) => `The energetic vibration of "${t}" just shattered my fourth butane torch! The universe is demanding a 90% wealth tax on billionaire catalytic converters!`
    },
    {
      character: 'dale',
      text: (t) => `"${t}"?! THAT'S IT, I'M BOARDING UP MY WINDOWS WITH REBAR AND PATRIOT FLAGS! TRUMP 2028!`
    }
  ]
];

export const INITIAL_COOKED_MESSAGES: CookedChatMessage[] = [
  {
    id: 'msg-0',
    sender: 'sponsor',
    name: 'COOKED CHAT 24/7',
    handle: '@CookedLobby',
    avatar: '⌨️',
    color: '#a855f7',
    badge: 'PARKING LOT FREQUENCY',
    text: '⚠️ ENTERING COOKED CHAT: 2 Tweakers, 2 Crackheads, Republican vs. Democrat debate live behind the Waffle House.',
    timestamp: '03:14:02'
  },
  {
    id: 'msg-1',
    sender: 'dale',
    name: 'AutisticEDDIE',
    handle: '@AutisticEDDIE',
    avatar: '🧢',
    color: '#ef4444',
    badge: 'GOP TWEAKER',
    text: 'I HAVE NOT SLEPT SINCE THE LAST DEBATE! THE BIDEN CRIME FAMILY IS HIDING IN MY BASEBOARD RADIATORS!',
    timestamp: '03:14:15'
  },
  {
    id: 'msg-2',
    sender: 'crystal',
    name: 'BORINGBUNNY',
    handle: '@BORINGBUNNY',
    avatar: '🐰',
    color: '#3b82f6',
    badge: 'DNC CRACKHEAD',
    text: 'AutisticEDDIE you fascist your baseboards are private property which means they belong to the working class crackhead proletariat!',
    timestamp: '03:14:30'
  },
  {
    id: 'msg-3',
    sender: 'tammy',
    name: 'METHINMYVIENS',
    handle: '@METHINMYVIENS',
    avatar: '⚡',
    color: '#f43f5e',
    badge: 'MAGA CRACKHEAD',
    text: 'I SMOKED THREE ROCKS AND HAD A VISION: TRUMP IS GOING TO PULL UP TO THIS GAS STATION IN A GOLD TRACTOR!',
    timestamp: '03:14:48'
  },
  {
    id: 'msg-4',
    sender: 'hunter',
    name: 'Deeppockets6',
    handle: '@Deeppockets6',
    avatar: '💸',
    color: '#06b6d4',
    badge: 'DEMOCRAT TWEAKER',
    text: 'A gold tractor has zero miles per gallon METHINMYVIENS! We need an electric solar-powered crack pipe funded by the Green New Deal!',
    timestamp: '03:15:05'
  }
];
