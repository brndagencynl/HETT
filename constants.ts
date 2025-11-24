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
    category: 'wand',
    shortDescription: 'Geïsoleerde gevelpanelen met steenwol kern en onzichtbare bevestiging.',
    description: 'K-Roc KS1000 RH gevelpanelen omvat het assortiment geïsoleerde gevelpanelen met een steenwol isolatiekern. Het gevelpaneelsysteem met onzichtbare bevestiging is verkrijgbaar in 5 afzonderlijke profileringen. De panelen kunnen in de lengte of breedte (verticaal of horizontaal) worden toepast. Door de kern van steenwol is het paneel uitermate geschikt voor toepassingen waarbij hoge eisen worden gesteld aan brandweerstand.',
    imageUrl: 'https://picsum.photos/1000/800?random=150', // Placeholder for the uploaded image
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
    id: 'introductie-eco-plus',
    title: 'Introductie HETT Dakpaneel Eco+: De nieuwe standaard',
    excerpt: 'Ontdek onze nieuwste innovatie op het gebied van thermische isolatie voor tuinkamers.',
    content: `
      <p>Met trots introduceren wij het HETT Dakpaneel Eco+. Dit nieuwe paneel is het resultaat van jarenlang onderzoek naar de optimale balans tussen gewicht, isolatiewaarde en installatiegemak.</p>
      <h3>Waarom Eco+?</h3>
      <p>De eisen voor woninguitbreidingen worden steeds strenger. Waar vroeger een eenvoudige overkapping volstond, willen mensen nu een volwaardige tuinkamer die het hele jaar door te gebruiken is. Isolatie is daarbij de sleutel.</p>
      <p>Het Eco+ paneel heeft een vernieuwde PIR-schuim kern die 15% beter isoleert dan de standaard marktconform panelen, zonder dikker te zijn.</p>
      <h3>Beschikbaarheid</h3>
      <p>Het nieuwe paneel is per direct leverbaar in diktes van 40mm tot 120mm en is standaard verkrijgbaar in RAL 9010 en RAL 7016.</p>
    `,
    date: '12 Maart 2024',
    author: 'Mark de Vries',
    category: 'Productnieuws',
    imageUrl: 'https://picsum.photos/800/600?random=80',
    readTime: '3 min lezen'
  },
  {
    id: 'dealer-dag-2024',
    title: 'Terugblik: Succesvolle HETT Dealer Dag 2024',
    excerpt: 'Meer dan 150 montagepartners kwamen samen in Eindhoven voor productdemo’s en netwerken.',
    content: `
      <p>Afgelopen vrijdag was ons magazijn in Eindhoven het decor voor de jaarlijkse HETT Dealer Dag. Het was een dag vol inspiratie, nieuwe connecties en natuurlijk: sandwichpanelen.</p>
      <p>We hebben laten zien hoe onze nieuwe zaagstraat werkt, waardoor we nu nog sneller maatwerk kunnen leveren. Daarnaast was er veel aandacht voor de nieuwe montagesystemen die installatietijd op de bouwplaats drastisch verminderen.</p>
      <p>Kon je er niet bij zijn? Bekijk de aftermovie op onze social media kanalen.</p>
    `,
    date: '28 Februari 2024',
    author: 'Sarah Jansen',
    category: 'Events',
    imageUrl: 'https://picsum.photos/800/600?random=81',
    readTime: '2 min lezen'
  },
  {
    id: 'prijzen-update',
    title: 'Marktupdate: Grondstofprijzen stabiliseren',
    excerpt: 'Goed nieuws voor de bouwsector: de prijzen voor staal en isolatiemateriaal zijn stabiel.',
    content: `
      <p>Na een periode van hevige fluctuaties zien we eindelijk rust op de grondstoffenmarkt. Dit betekent dat wij onze prijzen voor het komende kwartaal kunnen vastzetten.</p>
      <p>Voor u als dealer betekent dit meer zekerheid in uw offertes naar eindklanten. Wij verwachten dat deze stabiliteit de komende maanden zal aanhouden, wat gunstig is voor de start van het buitenseizoen.</p>
      <p>Bekijk de actuele prijslijsten in de dealer portal.</p>
    `,
    date: '15 Januari 2024',
    author: 'Finance Team',
    category: 'Zakelijk',
    imageUrl: 'https://picsum.photos/800/600?random=82',
    readTime: '4 min lezen'
  }
];