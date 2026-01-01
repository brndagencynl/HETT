/**
 * Dutch locale for HETT Configurator
 */

export const nl = {
  configurator: {
    // Step definitions - in exact order
    steps: {
      color: {
        title: 'Kleur profiel',
        description: 'Kies de kleur van uw aluminium profielen',
      },
      daktype: {
        title: 'Daktype',
        description: 'Kies het materiaal voor uw overkapping',
      },
      goot: {
        title: 'Goot',
        description: 'Selecteer uw gootsysteem',
      },
      zijwand_links: {
        title: 'Zijwand links',
        description: 'Kies de afwerking voor de linker zijde',
      },
      zijwand_rechts: {
        title: 'Zijwand rechts',
        description: 'Kies de afwerking voor de rechter zijde',
      },
      voorzijde: {
        title: 'Voorzijde',
        description: 'Wilt u de voorzijde afsluiten?',
      },
      verlichting: {
        title: "Extra's",
        description: 'Verlichting toevoegen aan uw veranda',
      },
      overzicht: {
        title: 'Overzicht',
        description: 'Controleer uw configuratie',
      },
      // Legacy alias
      kleur: {
        title: 'Kleur profiel',
        description: 'Kies de kleur van uw aluminium profielen',
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
      close: 'Sluiten',
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

  // Generic labels & CTAs used across the shop
  common: {
    cta: {
      addToCart: 'In winkelwagen',
      configureNow: 'Stel samen',
      changeConfiguration: 'Configuratie wijzigen',
      requestQuote: 'Direct offerte aanvragen',
      goBack: 'Terug',
      viewProducts: 'Bekijk onze producten',
      startShopping: 'Begin met winkelen',
      checkout: 'Afrekenen',
      continueShopping: 'Verder winkelen',
    },
    labels: {
      subtotalInclVat: 'Subtotaal (incl. BTW)',
      totalInclVat: 'Totaal (incl. BTW)',
      vatIncluded: 'Incl. BTW',
      startingFromPrice: 'Vanaf prijs',
      inStock: 'Op voorraad',
      warranty10Years: '10 Jaar garantie',
      quantity: 'Aantal',
      deliveryTime: 'Levertijd',
      specifications: 'Specificaties',
    },
  },

  // Configurator-related copy (non-veranda specific)
  config: {
    productConfigurator: {
      title: 'Samenstellen',
      priceNote: 'Excl. montage',
      sizeLabel: 'Afmeting',
      colorLabel: 'Kleur Profielen',
      roofLabel: 'Dakbedekking',
      quantityLabel: 'Aantal',
      meta: 'Levertijd 1-2 weken • Gratis verzending vanaf € 2.500,00',
    },
    sandwich: {
      heading: 'Stel samen',
      subheading: 'Kies uw opties en afmetingen.',
      price: {
        productTotal: 'Product totaal',
        optionsTotal: 'Opties totaal',
        total: 'Totaal',
      },
      select: {
        placeholder: 'Maak een keuze...',
      },
      validation: {
        requiredField: 'Verplicht veld',
        selectAllRequired: 'Selecteer a.u.b. alle verplichte opties',
      },
      buttons: {
        updateInCart: 'Update in winkelwagen',
      },
    },
  },

  // Product detail page (PDP)
  pdp: {
    generic: {
      notFound: 'Product niet gevonden',
      backToCategory: 'Terug naar {category}',
    },
    veranda: {
      config: {
        heading: 'Product configuratie',
        description:
          'Stel uw overkapping volledig op maat samen in onze 3D configurator. Kies uw afmetingen, kleuren en accessoires.',
        priceLabel: 'Vanaf prijs',
        savedTitle: 'Configuratie opgeslagen',
        savedText:
          'Uw keuzes zijn bewaard. Klik op configureren om te bestellen of aan te passen.',
        infoPriceInsight: 'Direct inzicht in de prijs',
        infoFreeQuote: 'Vrijblijvende offerte per mail',
      },
      directOrder: {
        heading: 'Bestellen',
        description:
          'Bestel dit product direct uit onze voorraad. Snelle levering gegarandeerd.',
        priceLabel: 'Incl. BTW',
      },
    },
    delivery: {
      title: 'Levering & montage',
      text:
        'Wij leveren met eigen transport door de Benelux. Elk pakket is compleet en voorzien van een duidelijke montagehandleiding. Montage door ons team is optioneel (op aanvraag).',
      leadTimeLabel: 'Gemiddelde levertijd',
      leadTimeValue: '10 werkdagen',
    },
  },

  // Cart drawer & cart-related UI
  cart: {
    drawer: {
      title: 'Winkelwagen',
      itemsSuffix: 'items',
      emptyTitle: 'Je winkelwagen is momenteel leeg!',
      emptyCta: 'Begin met winkelen',
      configRequired: 'Configuratie vereist',
      quantityLabel: 'Aantal',
      subtotalInclVat: 'Subtotaal (incl. BTW)',
      ctaCheckout: 'Afrekenen',
      ctaContinueShopping: 'Verder winkelen',
    },
  },

  // Validation & inline error messages
  validation: {
    configurator: {
      fillRequiredFields: 'Vul alle verplichte velden in',
      errorOccurred: 'Er is een fout opgetreden. Probeer het opnieuw.',
    },
    sandwich: {
      requiredField: 'Verplicht veld',
      selectAllRequired: 'Selecteer a.u.b. alle verplichte opties',
    },
  },

  // Toasts / alerts / feedback messages
  toast: {
    product: {
      addedToCart: 'Product toegevoegd aan winkelwagen!',
    },
    configurator: {
      requestSent: 'Bedankt! Uw aanvraag is verstuurd.',
    },
    quote: {
      requestSent:
        'Uw offerteaanvraag is succesvol verzonden! We nemen binnen 24 uur contact op.',
    },
    cart: {
      missingConfig: 'Kies eerst je opties in de configurator before adding to cart.',
      incompleteConfig: 'Configuratie incompleet: {errors}',
    },
  },
} as const;

export type NlLocale = typeof nl;
