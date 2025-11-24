import { NavItem, Product, Project, NewsItem } from './types';

export const NAV_ITEMS: NavItem[] = [
  { label: 'Producten', path: '/producten' },
  { label: 'Projecten', path: '/projecten' },
  { label: 'Montage', path: '/downloads' },
  { label: 'Zakelijk', path: '/dealers' },
  { label: 'Contact', path: '/contact' },
];

export const TOP_BAR_USPS = [
  "Op maat gemaakt tot op de mm",
  "Levering door heel Nederland & België",
  "Achteraf betalen mogelijk",
  "Beoordeeld met een 9.2"
];

export const USP_LIST = [
  {
    title: 'Hoge Isolatiewaarde',
    description: 'Maximale thermische efficiëntie met hoogwaardige PIR-isolatiekernen.',
    icon: 'ShieldCheck'
  },
  {
    title: 'Condensvrij',
    description: 'Speciale dampdichte verbindingen voorkomen vochtproblemen in tuinkamers.',
    icon: 'Droplets'
  },
  {
    title: 'Snelle Levering',
    description: 'Direct uit eigen voorraad leverbaar door heel de Benelux.',
    icon: 'Truck'
  },
  {
    title: 'Groothandelsprijzen',
    description: 'Directe inkoopvoordelen en staffelkortingen voor geregistreerde dealers.',
    icon: 'TrendingUp'
  }
];

export const PRODUCTS: Product[] = [
  {
    id: 'k-roc-ks1000-rh',
    title: 'K-Roc KS1000 RH gevelpaneel',
    category: 'gevel',
    shortDescription: 'Geïsoleerde gevelpanelen met steenwol isolatiekern en onzichtbare bevestiging.',
    description: 'K-Roc KS1000 RH gevelpanelen omvat het assortiment geïsoleerde gevelpanelen met een steenwol isolatiekern. Het gevelpaneelsysteem met onzichtbare bevestiging is verkrijgbaar in 5 afzonderlijke profileringen. De panelen kunnen in de lengte of breedte (verticaal of horizontaal) worden toepast. Door de kern van steenwol is het paneel uitermate geschikt voor toepassingen waarbij hoge eisen worden gesteld aan brandweerstand.',
    imageUrl: '/product-kroc.jpg',
    specs: {
      thickness: ['60mm', '80mm', '100mm', '120mm', '150mm'],
      uValue: 'Brandgedrag A2-s1,d0',
      width: '1000mm',
      coating: 'Diverse profileringen'
    },
    isNew: true
  }
];

export const PROJECTS: Project[] = [
  {
    id: 'prj-1',
    title: 'Luxe Tuinkamer Utrecht',
    category: 'Tuinkamer',
    imageUrl: 'https://picsum.photos/800/600?random=10',
    description: 'Volledig geïsoleerde tuinkamer met 80mm dakpanelen. De klant wenste een ruimte die het hele jaar door te gebruiken is als thuiskantoor.',
    location: 'Utrecht, Nederland',
    usedProductIds: ['dak-eco-plus', 'wand-prof-rib'],
    images: [
        'https://picsum.photos/800/600?random=10',
        'https://picsum.photos/800/600?random=50',
        'https://picsum.photos/800/600?random=51'
    ]
  },
  {
    id: 'prj-2',
    title: 'Veranda Vrijstaand',
    category: 'Veranda',
    imageUrl: 'https://picsum.photos/800/600?random=11',
    description: 'Vrijstaande overkapping met antraciet afwerking en geïntegreerde LED-verlichting.',
    location: 'Eindhoven, Nederland',
    usedProductIds: ['dak-eco-plus', 'acc-profielen'],
    images: [
        'https://picsum.photos/800/600?random=11',
        'https://picsum.photos/800/600?random=52'
    ]
  },
  {
    id: 'prj-3',
    title: 'Horeca Overkapping',
    category: 'Zakelijk',
    imageUrl: 'https://picsum.photos/800/600?random=12',
    description: 'Grootschalige terrasoverkapping voor restaurant. Voorzien van extra geluidsisolerende panelen.',
    location: 'Antwerpen, België',
    usedProductIds: ['dak-eco-plus'],
    images: [
        'https://picsum.photos/800/600?random=12',
        'https://picsum.photos/800/600?random=53'
    ]
  },
  {
    id: 'prj-4',
    title: 'Moderne Carport',
    category: 'Carport',
    imageUrl: 'https://picsum.photos/800/600?random=13',
    description: 'Strakke dubbele carport met vlakke wandpanelen voor een minimalistische look.',
    location: 'Breda, Nederland',
    usedProductIds: ['wand-prof-rib'],
    images: [
        'https://picsum.photos/800/600?random=13'
    ]
  }
];

export const NEWS_ITEMS: NewsItem[] = [
  {
    id: 'tips-perfecte-veranda',
    title: '5 tips voor het bouwen van de perfecte veranda',
    excerpt: 'Waar moet je op letten bij het plaatsen van een veranda? Van fundering tot dakbedekking: wij zetten de belangrijkste aandachtspunten op een rij.',
    content: `
      <p>Een veranda is een prachtige toevoeging aan je huis, maar een goede voorbereiding is het halve werk. In dit artikel delen we vijf onmisbare tips voor een succesvol project.</p>
      <h3>1. De juiste fundering</h3>
      <p>Alles begint bij de basis. Zorg voor een stabiele ondergrond, bijvoorbeeld met betonpoeren, om verzakking te voorkomen. Dit is cruciaal voor de levensduur van je constructie.</p>
      <h3>2. Kies het juiste materiaal</h3>
      <p>Hout heeft charme, maar aluminium is onderhoudsarm. Onze sandwichpanelen passen perfect op beide constructies en zorgen direct voor isolatie en een strak plafond.</p>
      <h3>3. Denk aan de waterafvoer</h3>
      <p>Niets is vervelender dan lekkage. Zorg voor voldoende afschot (minimaal 5 graden) en een goede gotenset. Onze profielen zijn hier speciaal voor ontworpen.</p>
      <h3>4. Lichtinval</h3>
      <p>Wil je veel licht? Combineer dichte panelen met een lichtstraat of glazen schuifwanden. Zo behoud je het buitengevoel, ook als het dak dicht is.</p>
      <h3>5. Vergunning checken</h3>
      <p>In veel gevallen mag je vergunningsvrij bouwen in de achtertuin, maar check altijd even de regels in jouw gemeente via het omgevingsloket.</p>
    `,
    date: '10 April 2024',
    author: 'Lisa van HETT',
    category: 'Tips & Tricks',
    imageUrl: 'https://picsum.photos/800/600?random=90',
    readTime: '4 min lezen'
  },
  {
    id: 'binnenkijken-tuinkamer',
    title: 'Binnenkijken bij: De tuinkamer van familie De Vries',
    excerpt: 'Laat je inspireren door dit prachtige project in Utrecht. Een lichte tuinkamer met zwarte profielen en onze hoogwaardige isolatiepanelen.',
    content: `
      <p>Vandaag nemen we een kijkje bij familie De Vries in Utrecht. Zij transformeerden hun terrasoverkapping tot een volwaardige tuinkamer die het hele jaar door gebruikt kan worden.</p>
      <p>"We wilden een plek waar we ook in de herfst lekker kunnen zitten," vertelt Jan de Vries. "De keuze viel op de geïsoleerde sandwichpanelen van HETT vanwege de strakke afwerking."</p>
      <h3>Strak design</h3>
      <p>Er is gekozen voor panelen met een antraciet buitenkant en een witte binnenkant. Dit zorgt voor een moderne uitstraling aan de buitenzijde, maar houdt het binnen licht en ruimtelijk.</p>
      <h3>Comfort</h3>
      <p>Dankzij de hoge isolatiewaarde blijft het in de zomer koel en houdt het in de winter de warmte van de heater goed vast. "Het is echt een verlengstuk van onze woonkamer geworden."</p>
    `,
    date: '28 Maart 2024',
    author: 'Redactie',
    category: 'Inspiratie',
    imageUrl: 'https://picsum.photos/800/600?random=91',
    readTime: '3 min lezen'
  },
  {
    id: 'zelf-monteren-advies',
    title: 'Zelf monteren of laten doen? De voor- en nadelen',
    excerpt: 'Twijfel je of je zelf aan de slag gaat met onze sandwichpanelen? We helpen je bij de keuze met een eerlijk overzicht van de klus.',
    content: `
      <p>Onze sandwichpanelen zijn ontworpen voor eenvoudige montage. Toch twijfelen veel mensen: doe ik het zelf of schakel ik een vakman in? Wij zetten de overwegingen op een rij.</p>
      <h3>Zelf doen: De voordelen</h3>
      <p>Het grootste voordeel is natuurlijk de kostenbesparing. Je betaalt geen arbeidsloon. Daarnaast geeft het enorm veel voldoening om je eigen overkapping te bouwen. Met onze montagehandleidingen is het voor een handige doe-het-zelver goed te doen.</p>
      <h3>Laten doen: De voordelen</h3>
      <p>Een vakman heeft het gereedschap en de ervaring. Het gaat vaak sneller en je hebt garantie op de montage. HETT werkt samen met diverse montagepartners door het hele land.</p>
      <h3>Ons advies</h3>
      <p>Ben je handig en heb je hulp van een vriend? Dan is zelf doen een prima optie. Heb je twee linkerhanden of weinig tijd? Vraag dan via ons een offerte aan voor montage.</p>
    `,
    date: '15 Maart 2024',
    author: 'Mark de Vries',
    category: 'Advies',
    imageUrl: 'https://picsum.photos/800/600?random=92',
    readTime: '5 min lezen'
  }
];