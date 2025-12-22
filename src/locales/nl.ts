/**
 * Dutch locale for HETT Configurator
 */

export const nl = {
  configurator: {
    // Step definitions
    steps: {
      daktype: {
        title: 'Daktype',
        description: 'Kies het materiaal voor uw overkapping',
      },
      goot: {
        title: 'Goot',
        description: 'Selecteer uw gootsysteem',
      },
      voorzijde: {
        title: 'Voorzijde',
        description: 'Wilt u de voorzijde afsluiten?',
      },
      zijwand_links: {
        title: 'Zijwand links',
        description: 'Kies de afwerking voor de linker zijde',
      },
      zijwand_rechts: {
        title: 'Zijwand rechts',
        description: 'Kies de afwerking voor de rechter zijde',
      },
      verlichting: {
        title: "Extra's",
        description: 'Verlichting toevoegen aan uw veranda',
      },
      overzicht: {
        title: 'Overzicht',
        description: 'Controleer uw configuratie',
      },
    },

    // Navigation & buttons
    navigation: {
      stepOf: 'Stap {current} van {total}',
      next: 'Verdergaan',
      back: 'Terug',
      add: 'Toevoegen',
      adding: 'Toevoegen...',
      edit: 'Bewerk',
      change: 'Wijzig',
    },

    // Selection summary
    selection: {
      title: 'Uw selectie',
      none: 'Geen',
      yes: 'Ja',
      no: 'Nee',
      yesLedSpots: 'Ja (LED spots)',
    },

    // Overview step
    overview: {
      completeTitle: 'Configuratie compleet!',
      completeDescription: 'Controleer hieronder uw gekozen opties en rond uw bestelling af.',
      priceOverview: 'Prijsoverzicht',
      basePrice: 'Basisprijs veranda',
      totalInclVat: 'Totaal (incl. BTW)',
      agreement: 'Ik heb de configuratie gecontroleerd en ga akkoord met de getoonde opties en prijs.',
    },

    // Visualization
    visualization: {
      previewPlaceholder: 'Preview visualisatie',
    },

    // Footer & info
    footer: {
      totalPriceInclVat: 'Totaalprijs incl. BTW',
      deliveryTime: '1-2 weken levertijd',
      warranty: '10 jaar garantie',
    },

    // Validation & errors
    validation: {
      fillRequiredFields: 'Vul alle verplichte velden in',
      errorOccurred: 'Er is een fout opgetreden. Probeer het opnieuw.',
    },

    // Option hints
    hints: {
      optionalStep: 'Deze stap is optioneel. Klik op "Verdergaan" om door te gaan zonder selectie.',
    },
  },
} as const;

export type NlLocale = typeof nl;
