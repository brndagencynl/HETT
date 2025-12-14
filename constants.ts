
import { NavItem, Product, Project, NewsItem } from './types';

export const NAV_ITEMS: NavItem[] = [
  { label: 'Overkappingen', path: '/categorie/overkappingen' },
  { label: 'Sandwichpanelen', path: '/categorie/sandwichpanelen' },
  { label: 'Profielen', path: '/categorie/profielen' },
  { label: 'Accessoires', path: '/categorie/accessoires' },
  { label: 'Projecten', path: '/projecten' },
  { label: 'Contact', path: '/contact' },
];

export const TOP_BAR_USPS = [
  "Gratis levering vanaf €2500",
  "Showroom in Eindhoven",
  "Achteraf betalen mogelijk",
  "Beoordeeld met een 9.2"
];

export const USP_LIST = [
  {
    title: 'Hoge Kwaliteit Aluminium',
    description: 'Duits geverifieerd T6-aluminium voor maximale sterkte en levensduur.',
    icon: 'ShieldCheck'
  },
  {
    title: 'Eenvoudige Montage',
    description: 'Slimme bouwpakketten met voorgeboorde profielen en duidelijke handleiding.',
    icon: 'PenTool'
  },
  {
    title: 'Snelle Levering',
    description: 'Uit eigen voorraad geleverd binnen 1-2 weken in de hele Benelux.',
    icon: 'Truck'
  },
  {
    title: '5 Jaar Garantie',
    description: 'Volledige fabrieksgarantie op constructie en kleurvastheid.',
    icon: 'CheckCircle2'
  }
];

export const PRODUCTS: Product[] = [
  {
    id: 'veranda-306-250-opaal',
    title: 'Aluminium overkapping 3.06 x 2.5 m – Hittewerend',
    category: 'Overkappingen',
    price: 839,
    shortDescription: 'Hittewerend polycarbonaat dak voor optimaal comfort.',
    description: 'Complete aluminium terrasoverkapping inclusief hittewerend opaal polycarbonaat dakbedekking. Eenvoudig te monteren en onderhoudsvrij.',
    imageUrl: 'https://images.unsplash.com/photo-1628624747186-a941c476b7ef?q=80&w=2070&auto=format&fit=crop',
    specs: {
      'Materiaal': 'Aluminium T6-6063',
      'Dak': 'Polycarbonaat Opaal (Hittewerend)',
      'Afmeting': '306 x 250 cm'
    },
    options: {
      sizes: ['306x250cm'],
      colors: ['Antraciet (RAL7016)']
    },
    isBestseller: true
  },
  {
    id: 'veranda-306-250-helder',
    title: 'Aluminium overkapping 3.06 x 2.5 m – Helder',
    category: 'Overkappingen',
    price: 839,
    shortDescription: 'Helder polycarbonaat dak voor maximale lichtinval.',
    description: 'Geniet van maximaal licht met deze aluminium overkapping voorzien van helder polycarbonaat dakplaten.',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop',
    specs: {
      'Materiaal': 'Aluminium T6-6063',
      'Dak': 'Polycarbonaat Helder',
      'Afmeting': '306 x 250 cm'
    },
    options: {
      sizes: ['306x250cm'],
      colors: ['Antraciet (RAL7016)']
    }
  },
  {
    id: 'veranda-606-350-opaal',
    title: 'Aluminium overkapping 6.06 x 3.5 m – Hittewerend',
    category: 'Overkappingen',
    price: 1949,
    shortDescription: 'Grote overkapping met hittewerend dak.',
    description: 'Ruime terrasoverkapping van ruim 6 meter breed. Voorzien van 3 staanders en hittewerend dak.',
    imageUrl: 'https://images.unsplash.com/photo-1595846519845-68e298c2edd8?q=80&w=1960&auto=format&fit=crop',
    specs: {
      'Materiaal': 'Aluminium T6-6063',
      'Dak': 'Polycarbonaat Opaal',
      'Afmeting': '606 x 350 cm'
    },
    options: {
      sizes: ['606x350cm'],
      colors: ['Antraciet (RAL7016)']
    }
  },
  {
    id: 'veranda-306-250-glas',
    title: 'Aluminium overkapping 3.06 x 2.5 m – Glazen dak',
    category: 'Overkappingen',
    price: 1159,
    shortDescription: 'Luxe uitvoering met 44.2 veiligheidsglas.',
    description: 'Voor de ultieme luxe uitstraling en maximale transparantie kiest u voor een glazen dak.',
    imageUrl: 'https://images.unsplash.com/photo-1510627489930-0c1b0bfb6785?q=80&w=2000&auto=format&fit=crop',
    specs: {
      'Materiaal': 'Aluminium T6-6063',
      'Dak': 'Veiligheidsglas 44.2',
      'Afmeting': '306 x 250 cm'
    },
    options: {
      sizes: ['306x250cm'],
      colors: ['Antraciet (RAL7016)']
    }
  },
  {
    id: 'veranda-premium',
    title: 'HETT Premium Veranda',
    category: 'Overkappingen',
    price: 1895,
    shortDescription: 'Luxe aluminium overkapping met versterkte goot en staanders.',
    description: 'De HETT Premium Veranda is ons meest gekozen model. Uitgevoerd in hoogwaardig gepoedercoat aluminium en standaard voorzien van een versterkte goot, waardoor een vrije overspanning tot 7 meter mogelijk is op slechts 2 staanders. Keuze uit glazen of polycarbonaat dakbedekking.',
    imageUrl: 'https://picsum.photos/800/600?random=101',
    specs: {
      'Materiaal': 'Aluminium T6-6063',
      'Staanders': '110x110mm',
      'Goot': 'Versterkt profiel (XS-type)',
      'Dakbelasting': '110kg/m²',
      'Kleuren': ['Antraciet (RAL7016)', 'Zwart (RAL9005)', 'Wit (RAL9010)']
    },
    options: {
      colors: ['Antraciet', 'Zwart', 'Wit'],
      sizes: ['300x250cm', '400x300cm', '500x350cm', '600x400cm'],
      roofTypes: ['Polycarbonaat Opaal', 'Polycarbonaat Helder', 'Glas 44.2']
    },
    isBestseller: true
  },
  {
    id: 'veranda-basic',
    title: 'HETT Basic Veranda',
    category: 'Overkappingen',
    price: 1250,
    shortDescription: 'Betaalbare kwaliteit. De perfecte instap overkapping voor elke tuin.',
    description: 'Geniet van het buitenleven met de HETT Basic. Een slank vormgegeven overkapping die eenvoudig zelf te monteren is. Inclusief alle bevestigingsmaterialen en regenwaterafvoer.',
    imageUrl: 'https://picsum.photos/800/600?random=102',
    specs: {
      'Materiaal': 'Aluminium',
      'Staanders': '90x90mm',
      'Dak': 'Polycarbonaat 16mm',
    },
    options: {
      colors: ['Antraciet', 'Wit'],
      sizes: ['300x250cm', '400x300cm'],
      roofTypes: ['Polycarbonaat Opaal']
    }
  },
  {
    id: 'eco-dakpaneel',
    title: 'HETT Eco+ Dakpaneel',
    category: 'Sandwichpanelen',
    price: 45,
    shortDescription: 'Hoogwaardig geïsoleerd dakpaneel met trapezium profiel.',
    description: 'Het HETT Eco+ dakpaneel is de standaard voor geïsoleerde daken. Voorzien van een trapezium buitenplaat en een stucco witte interieurzijde. Uitstekende isolatiewaarde en overspanning.',
    imageUrl: 'https://images.unsplash.com/photo-1595846519845-68e298c2edd8?q=80&w=1960&auto=format&fit=crop',
    specs: {
      'Werkende breedte': '1000mm',
      'Isolatiekern': 'PIR (brandvertragend)',
      'Brandklasse': 'B-s2,d0',
      'Coating': '25µm Polyester'
    },
    options: {
      colors: ['Antraciet (RAL7016)', 'Zwart (RAL9005)'],
      sizes: ['40mm', '60mm', '80mm', '100mm'],
    },
    isBestseller: true
  },
  {
    id: 'wandpaneel-microrib',
    title: 'HETT Wandpaneel Microrib',
    category: 'Sandwichpanelen',
    price: 52,
    shortDescription: 'Strak wandpaneel met blinde bevestiging voor een naadloze gevel.',
    description: 'Geef uw project een moderne uitstraling met onze Microrib wandpanelen. Dankzij de blinde bevestiging zijn er geen schroeven zichtbaar. Hoge isolatiewaarde en beschikbaar in diverse kleuren.',
    imageUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1931&auto=format&fit=crop',
    specs: {
      'Werkende breedte': '1000mm',
      'Bevestiging': 'Blind (verborgen)',
      'Isolatie': 'PIR',
      'Profiel': 'Microrib'
    },
    options: {
        colors: ['Antraciet', 'Zwart', 'Wit', 'Zilver'],
        sizes: ['60mm', '80mm', '100mm']
    },
    isNew: true
  },
  {
    id: 'led-set',
    title: 'LED Verlichting Set',
    category: 'Accessoires',
    price: 129,
    shortDescription: 'Dimbare LED spots voor in de liggers.',
    description: 'Set van 6 dimbare LED inbouwspots incl. afstandsbediening en transformator. Plug & Play.',
    imageUrl: 'https://picsum.photos/800/600?random=104',
    specs: {
      'Aantal': '6 spots',
      'Kleur': 'Warm wit (2700K)',
      'Bediening': 'Afstandsbediening'
    },
    options: {
        colors: ['RVS', 'Zwart'],
        sizes: ['Standaard']
    }
  }
];

export const PROJECTS: Project[] = [
  {
    id: 'prj-1',
    title: 'Luxe Tuinkamer Utrecht',
    category: 'Tuinkamer',
    imageUrl: 'https://picsum.photos/800/600?random=10',
    description: 'Volledig geïsoleerde tuinkamer met glazen schuifwanden rondom. De klant wenste een ruimte die het hele jaar door te gebruiken is.',
    location: 'Utrecht, Nederland',
    usedProductIds: ['veranda-premium'],
    images: [
        'https://picsum.photos/800/600?random=10',
        'https://picsum.photos/800/600?random=50',
        'https://picsum.photos/800/600?random=51'
    ]
  },
  {
    id: 'prj-2',
    title: 'Vrijstaande Overkapping',
    category: 'Veranda',
    imageUrl: 'https://picsum.photos/800/600?random=11',
    description: 'Vrijstaande overkapping met antraciet afwerking en geïntegreerde LED-verlichting achterin de tuin.',
    location: 'Eindhoven, Nederland',
    images: [
        'https://picsum.photos/800/600?random=11',
        'https://picsum.photos/800/600?random=52'
    ]
  },
  {
    id: 'prj-3',
    title: 'Zwarte Veranda met Glas',
    category: 'Veranda',
    imageUrl: 'https://picsum.photos/800/600?random=12',
    description: 'Strakke matzwarte overkapping met helder glazen dak voor maximale lichtinval in de woning.',
    location: 'Antwerpen, België',
    images: [
        'https://picsum.photos/800/600?random=12',
        'https://picsum.photos/800/600?random=53'
    ]
  }
];

export const NEWS_ITEMS: NewsItem[] = [
  {
    id: 'tips-montage',
    title: '5 tips voor het monteren van je veranda',
    excerpt: 'Zelf aan de slag? Lees onze experts tips voor een waterpas en lekvrij resultaat.',
    content: '...',
    date: '12 Mei 2024',
    author: 'Team HETT',
    category: 'Montage',
    imageUrl: 'https://picsum.photos/800/600?random=90',
    readTime: '4 min lezen'
  }
];
