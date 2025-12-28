
export type LanguageCode = 'EN' | 'TR' | 'DE' | 'FR' | 'PL' | 'AR';

export interface Language {
  heroTag: string;
  heroTitle1: string;
  heroTitle2: string;
  heroDesc: string;
  heroDisclaimer: string;
  startBtn: string;
  methodBtn: string;
  navCapture: string;
  navAnalysis: string;
  navReport: string;
  secureStream: string;
  medicalGrade: string;
  scalpTopography: string;
  scannerDescription: string;
  processing: string;
  leadTitle: string;
  leadDesc: string;
  leadBtn: string;
  dashboardTitle: string;
  dashboardSub: string;
  showcaseTitle1: string;
  showcaseDesc1: string;
  showcaseTitle2: string;
  showcaseDesc2: string;
  showcaseTitle3: string;
  showcaseDesc3: string;
  transformationTitle: string;
  transformationDesc: string;
  beforeLabel: string;
  afterLabel: string;
  common: {
    back: string;
    search: string;
    clear: string;
    view: string;
    loading: string;
  };
  blog: {
    title: string;
    latest: string;
    readTime: string;
    searchPlaceholder: string;
    backToArticles: string;
    ctaTitle: string;
    ctaDesc: string;
    ctaBtn: string;
  };
  directory: {
    title: string;
    subtitle: string;
    filters: string;
    location: string;
    budget: string;
    technique: string;
    amenities: string;
    reset: string;
    noResults: string;
    verified: string;
    from: string;
    findClinics: string;
  };
  clinic: {
    book: string;
    startingFrom: string;
    verifiedPartner: string;
    topRated: string;
    accredited: string;
    tabs: {
      overview: string;
      team: string;
      technique: string;
      packages: string;
      reviews: string;
    };
  };
  dashboard: {
    reportId: string;
    privateReport: string;
    visualEstimate: string;
    notMedical: string;
    norwood: string;
    donor: string;
    grafts: string;
    visualProjection: string;
    download: string;
    clinicConnect: string;
    clinicConnectDesc: string;
    unlockSharing: string;
    securityBadge: string;
    dataRetention: string;
  };
  footer: {
    patients: string;
    partners: string;
    compliance: string;
    contact: string;
    disclaimerTitle: string;
    disclaimerText: string;
    rights: string;
  };
  preScan: {
    title: string;
    desc: string;
    lightingTitle: string;
    lightingDesc: string;
    hairlineTitle: string;
    hairlineDesc: string;
    movementTitle: string;
    movementDesc: string;
    automationTitle: string;
    automationDesc: string;
    cameraError: string;
    startBtn: string;
    cancelBtn: string;
    legalTitle: string;
    legalDesc: string;
    consentProcessing: string;
    consentNotMedical: string;
    consentPrivacy: string;
    continueBtn: string;
  };
  scannerSteps: {
    frontLabel: string;
    frontInstruction: string;
    frontSpeak: string;
    leftLabel: string;
    leftInstruction: string;
    leftSpeak: string;
    rightLabel: string;
    rightInstruction: string;
    rightSpeak: string;
    topLabel: string;
    topInstruction: string;
    topSpeak: string;
    donorLabel: string;
    donorInstruction: string;
    donorSpeak: string;
    macroLabel: string;
    macroInstruction: string;
    macroSpeak: string;
    count3: string;
    count2: string;
    count1: string;
    captured: string;
  };
}

export const translations: Record<LanguageCode, Language> = {
  EN: {
    heroTag: 'AI-Powered Visual Assessment',
    heroTitle1: 'Visualize possibilities.',
    heroTitle2: 'Explore the future.',
    heroDesc: 'Explore potential outcomes with our AI. Our system analyzes the visual patterns in your photos to suggest a preliminary, indicative hair restoration design.',
    heroDisclaimer: 'Visual, non-medical preview. Not medical advice.',
    startBtn: 'Get Your Free Analysis',
    methodBtn: 'How it Works',
    navCapture: 'UPLOAD',
    navAnalysis: 'PROCESSING',
    navReport: 'PREVIEW',
    secureStream: 'Secure Image Upload',
    medicalGrade: 'High-definition',
    scalpTopography: 'visual analysis.',
    scannerDescription: 'Follow the on-screen guide to capture clear photos. Our AI looks for visible scalp patterns to suggest a design.',
    processing: 'Analyzing Images',
    leadTitle: 'Your Preview is Ready',
    leadDesc: 'Unlock your AI-generated visualization and indicative summary based on the photos you provided.',
    leadBtn: 'SEE MY PREVIEW',
    dashboardTitle: 'Hair Visualization',
    dashboardSub: 'ESTIMATION SUMMARY',
    showcaseTitle1: 'AI Facial Scan',
    showcaseDesc1: 'Scans your facial features from photos to suggest a visually balanced hairline design.',
    showcaseTitle2: 'Visual Estimation',
    showcaseDesc2: 'Provides a preliminary graft count estimate based on the visible open areas in your photo.',
    showcaseTitle3: 'Instant Simulation',
    showcaseDesc3: 'Generates an AI-created "After" visualization to help you explore potential results.',
    transformationTitle: 'Visualize Potential',
    transformationDesc: 'Toggle between your current photo and the AI-generated visualization.',
    beforeLabel: 'ORIGINAL',
    afterLabel: 'AI PREVIEW',
    common: {
      back: "Back",
      search: "Search",
      clear: "Clear",
      view: "View",
      loading: "Loading..."
    },
    blog: {
      title: "Knowledge Hub",
      latest: "Latest Articles",
      readTime: "read",
      searchPlaceholder: "Search knowledge base...",
      backToArticles: "Back to Articles",
      ctaTitle: "Curious about your own case?",
      ctaDesc: "Get a free AI analysis and personalized estimate based on the medical standards discussed.",
      ctaBtn: "Start Free Analysis"
    },
    directory: {
      title: "Centers of Excellence",
      subtitle: "Verified Partner Clinics",
      filters: "Filters",
      location: "Location",
      budget: "Pricing",
      technique: "Technique",
      amenities: "Amenities",
      reset: "Reset Filters",
      noResults: "No clinics found matching your criteria.",
      verified: "Verified",
      from: "From",
      findClinics: "Find Clinics Now"
    },
    clinic: {
      book: "Book Consultation",
      startingFrom: "Starting from",
      verifiedPartner: "Verified Partner",
      topRated: "Top Rated",
      accredited: "Accredited",
      tabs: {
        overview: "Overview",
        team: "Medical Team",
        technique: "Technique",
        packages: "Packages",
        reviews: "Reviews"
      }
    },
    dashboard: {
      reportId: "Report ID",
      privateReport: "Private Report",
      visualEstimate: "Visual Estimate",
      notMedical: "Not Medical Advice",
      norwood: "Norwood Scale",
      donor: "Donor Rating",
      grafts: "Est. Grafts",
      visualProjection: "Visual Projection",
      download: "Download PDF",
      clinicConnect: "Get Quotes from Top Surgeons",
      clinicConnectDesc: "Share your anonymized visual report with our verified network to get precise price quotes.",
      unlockSharing: "Unlock Sharing",
      securityBadge: "HIPAA Aligned Security",
      dataRetention: "Data stored temporarily for analysis."
    },
    footer: {
      patients: "Patients",
      partners: "Partners",
      compliance: "Compliance",
      contact: "Contact",
      disclaimerTitle: "Important Disclaimer",
      disclaimerText: "This is a visual, non-medical tool designed to help you visualize potential results. It does not provide a medical diagnosis, treatment plan, or guaranteed outcome. Always consult with a certified physician.",
      rights: "All rights reserved."
    },
    preScan: {
      title: "Before We Start",
      desc: "To ensure the most accurate AI analysis, please follow these guidelines.",
      lightingTitle: "Good Lighting",
      lightingDesc: "Make sure you are in a well-lit area. Avoid strong backlighting.",
      hairlineTitle: "Reveal Hairline",
      hairlineDesc: "Pull your hair back completely. Remove glasses or hats.",
      movementTitle: "Move Slowly",
      movementDesc: "We will guide you via voice. Move slowly to align guides.",
      automationTitle: "Automatic Scan",
      automationDesc: "No need to tap. The AI captures automatically when focused.",
      cameraError: "Camera access is required to perform the AI analysis. Please enable camera permissions in your browser settings.",
      startBtn: "Enable Camera & Start",
      cancelBtn: "Cancel",
      legalTitle: "Data Processing Consent",
      legalDesc: "Before we analyze your photos, please confirm you understand how your data is used.",
      consentProcessing: "I consent to the processing of my images for visual analysis.",
      consentNotMedical: "I understand this is a simulation, NOT a medical diagnosis.",
      consentPrivacy: "I agree to the Privacy Policy (Data is encrypted & minimized).",
      continueBtn: "Confirm & Continue"
    },
    scannerSteps: {
        frontLabel: 'Front View',
        frontInstruction: 'Look directly at the camera',
        frontSpeak: 'Please look directly at the camera and hold still.',
        leftLabel: 'Right Profile',
        leftInstruction: 'Turn head slowly to LEFT',
        leftSpeak: 'Slowly turn your head to the left until the indicator turns green.',
        rightLabel: 'Left Profile',
        rightInstruction: 'Turn head slowly to RIGHT',
        rightSpeak: 'Now, slowly turn your head to the right.',
        topLabel: 'Top View',
        topInstruction: 'Lower chin to chest',
        topSpeak: 'Lower your chin to your chest so we can see the top of your head.',
        donorLabel: 'Donor Area',
        donorInstruction: 'Turn around. Hold phone behind head.',
        donorSpeak: 'Turn around and hold the camera behind your head to capture the donor area.',
        macroLabel: 'Macro Detail',
        macroInstruction: 'Bring camera close (5cm) to hairline',
        macroSpeak: 'Bring the camera very close to your hairline for macro analysis.',
        count3: 'Three',
        count2: 'Two',
        count1: 'One',
        captured: 'Captured'
    }
  },
  TR: {
    heroTag: 'Yapay Zeka Destekli Görsel Analiz',
    heroTitle1: 'Olasılıkları görün.',
    heroTitle2: 'Geleceği keşfedin.',
    heroDesc: 'Yapay zeka ile potansiyel sonuçları keşfedin. Sistemimiz, fotoğraflarınızdaki görsel desenleri analiz ederek ön bilgi amaçlı bir saç tasarımı önerir.',
    heroDisclaimer: 'Görsel, tıbbi olmayan ön izleme. Tıbbi tavsiye değildir.',
    startBtn: 'Ücretsiz Analizini Al',
    methodBtn: 'Nasıl Çalışır?',
    navCapture: 'YÜKLEME',
    navAnalysis: 'İŞLENİYOR',
    navReport: 'ÖNİZLEME',
    secureStream: 'Güvenli Fotoğraf Yükleme',
    medicalGrade: 'Yüksek çözünürlüklü',
    scalpTopography: 'görsel analiz.',
    scannerDescription: 'Net fotoğraflar çekmek için rehberi izleyin. Yapay zeka, bir tasarım önermek için görünür kafa derisi desenlerini arar.',
    processing: 'Görüntüler Analiz Ediliyor',
    leadTitle: 'Önizlemeniz Hazır',
    leadDesc: 'Sağladığınız fotoğraflara dayalı yapay zeka görselleştirmenizi ve tahmini özetinizi kilidini açarak görün.',
    leadBtn: 'ÖNİZLEMEYİ GÖR',
    dashboardTitle: 'Saç Görselleştirme',
    dashboardSub: 'TAHMİN ÖZETİ',
    showcaseTitle1: 'AI Yüz Taraması',
    showcaseDesc1: 'Görsel olarak dengeli bir saç çizgisi önermek için fotoğraflardan yüz hatlarınızı tarar.',
    showcaseTitle2: 'Görsel Tahmin',
    showcaseDesc2: 'Fotoğrafınızdaki görünen açık alanlara dayanarak ön bir greft sayısı tahmini sağlar.',
    showcaseTitle3: 'Anlık Simülasyon',
    showcaseDesc3: 'Potansiyel sonuçları keşfetmenize yardımcı olmak için yapay zeka tarafından oluşturulmuş bir "Sonrası" görselleştirmesi üretir.',
    transformationTitle: 'Potansiyeli Görün',
    transformationDesc: 'Mevcut fotoğrafınız ile yapay zeka tarafından oluşturulan görselleştirme arasında geçiş yapın.',
    beforeLabel: 'ORİJİNAL',
    afterLabel: 'AI ÖNİZLEME',
    common: {
      back: "Geri",
      search: "Ara",
      clear: "Temizle",
      view: "Görüntüle",
      loading: "Yükleniyor..."
    },
    blog: {
      title: "Bilgi Merkezi",
      latest: "Son Makaleler",
      readTime: "okuma",
      searchPlaceholder: "Bilgi bankasında ara...",
      backToArticles: "Makalelere Dön",
      ctaTitle: "Kendi durumunuzu merak mı ediyorsunuz?",
      ctaDesc: "Tartışılan tıbbi standartlara dayalı ücretsiz bir AI analizi ve kişiselleştirilmiş tahmin alın.",
      ctaBtn: "Ücretsiz Analizi Başlat"
    },
    directory: {
      title: "Mükemmeliyet Merkezleri",
      subtitle: "Onaylı Partner Klinikler",
      filters: "Filtreler",
      location: "Konum",
      budget: "Fiyatlandırma",
      technique: "Teknik",
      amenities: "Hizmetler",
      reset: "Filtreleri Sıfırla",
      noResults: "Kriterlerinize uygun klinik bulunamadı.",
      verified: "Onaylı",
      from: "Başlangıç",
      findClinics: "Klinik Bul"
    },
    clinic: {
      book: "Randevu Al",
      startingFrom: "Başlangıç Fiyatı",
      verifiedPartner: "Onaylı Partner",
      topRated: "En İyi Puan",
      accredited: "Akredite",
      tabs: {
        overview: "Genel Bakış",
        team: "Medikal Ekip",
        technique: "Teknik",
        packages: "Paketler",
        reviews: "Yorumlar"
      }
    },
    dashboard: {
      reportId: "Rapor ID",
      privateReport: "Özel Rapor",
      visualEstimate: "Görsel Tahmin",
      notMedical: "Tıbbi Tavsiye Değildir",
      norwood: "Norwood Ölçeği",
      donor: "Donör Derecesi",
      grafts: "Tahmini Greft",
      visualProjection: "Görsel Projeksiyon",
      download: "PDF İndir",
      clinicConnect: "En İyi Cerrahlardan Teklif Alın",
      clinicConnectDesc: "Anonim görsel raporunuzu onaylı ağımızla paylaşarak kesin fiyat teklifleri alın.",
      unlockSharing: "Paylaşımı Aç",
      securityBadge: "KVKK Uyumlu Güvenlik",
      dataRetention: "Veriler analiz için geçici saklanır."
    },
    footer: {
      patients: "Hastalar",
      partners: "Partnerler",
      compliance: "Uyumluluk",
      contact: "İletişim",
      disclaimerTitle: "Önemli Yasal Uyarı",
      disclaimerText: "Bu, potansiyel sonuçları görselleştirmenize yardımcı olmak için tasarlanmış görsel, tıbbi olmayan bir araçtır. Tıbbi teşhis, tedavi planı veya garantili sonuç sağlamaz. Her zaman sertifikalı bir hekime danışın.",
      rights: "Tüm hakları saklıdır."
    },
    preScan: {
      title: "Başlamadan Önce",
      desc: "En doğru AI analizi için lütfen aşağıdaki yönergeleri izleyin.",
      lightingTitle: "İyi Işıklandırma",
      lightingDesc: "İyi aydınlatılmış bir alanda olduğunuzdan emin olun. Ters ışıktan kaçının.",
      hairlineTitle: "Saç Çizgisini Açın",
      hairlineDesc: "Saçınızı tamamen geriye çekin. Gözlük veya şapkayı çıkarın.",
      movementTitle: "Yavaş Hareket Edin",
      movementDesc: "Sizi sesli olarak yönlendireceğiz. Kılavuzları hizalamak için yavaş hareket edin.",
      automationTitle: "Otomatik Tarama",
      automationDesc: "Dokunmanıza gerek yok. AI odaklandığında otomatik olarak çeker.",
      cameraError: "AI analizini gerçekleştirmek için kamera erişimi gereklidir. Lütfen tarayıcı ayarlarınızdan kamera izinlerini etkinleştirin.",
      startBtn: "Kamerayı Aç ve Başla",
      cancelBtn: "İptal",
      legalTitle: "Veri İşleme Onayı",
      legalDesc: "Analize başlamadan önce, verilerinizin nasıl kullanılacağını anladığınızı onaylayın.",
      consentProcessing: "Görüntülerimin görsel analiz için işlenmesini onaylıyorum.",
      consentNotMedical: "Bunun bir tıbbi teşhis DEĞİL, simülasyon olduğunu anlıyorum.",
      consentPrivacy: "Gizlilik Politikasını kabul ediyorum (Şifreli veri & minimum kayıt).",
      continueBtn: "Onayla ve Devam Et"
    },
    scannerSteps: {
        frontLabel: 'Ön Profil',
        frontInstruction: 'Doğrudan kameraya bakın',
        frontSpeak: 'Lütfen doğrudan kameraya bakın ve sabit durun.',
        leftLabel: 'Sağ Profil',
        leftInstruction: 'Başınızı yavaşça SOLA çevirin',
        leftSpeak: 'Gösterge yeşil olana kadar başınızı yavaşça sola çevirin.',
        rightLabel: 'Sol Profil',
        rightInstruction: 'Başınızı yavaşça SAĞA çevirin',
        rightSpeak: 'Şimdi başınızı yavaşça sağa doğru çevirin.',
        topLabel: 'Tepe Bölgesi',
        topInstruction: 'Çenenizi göğsünüze indirin',
        topSpeak: 'Tepe bölgesini görebilmemiz için çenenizi göğsünüze yaslayın.',
        donorLabel: 'Donör Bölge',
        donorInstruction: 'Arkanızı dönün. Telefonu ensenize tutun.',
        donorSpeak: 'Arkanızı dönün ve donör bölgeyi çekmek için telefonu başınızın arkasına tutun.',
        macroLabel: 'Makro Detay',
        macroInstruction: 'Kamerayı saç çizgisine çok yaklaştırın (5cm)',
        macroSpeak: 'Kamerayı saç çizginize çok yaklaştırarak net bir görüntü alın.',
        count3: 'Üç',
        count2: 'İki',
        count1: 'Bir',
        captured: 'Çekildi'
    }
  },
  DE: {
    heroTag: 'KI-gestützte visuelle Bewertung',
    heroTitle1: 'Möglichkeiten sehen.',
    heroTitle2: 'Zukunft erkunden.',
    heroDesc: 'Erkunden Sie potenzielle Ergebnisse mit KI. Unser System analysiert die visuellen Muster in Ihren Fotos, um ein unverbindliches Design vorzuschlagen.',
    heroDisclaimer: 'Visuelle, nicht-medizinische Vorschau. Kein medizinischer Rat.',
    startBtn: 'Kostenlose Analyse erhalten',
    methodBtn: 'Wie es funktioniert',
    navCapture: 'UPLOAD',
    navAnalysis: 'VERARBEITUNG',
    navReport: 'VORSCHAU',
    secureStream: 'Sicherer Bild-Upload',
    medicalGrade: 'Hochauflösende',
    scalpTopography: 'visuelle Analyse.',
    scannerDescription: 'Folgen Sie der Anleitung für klare Fotos. Unsere KI sucht nach sichtbaren Mustern, um ein Design vorzuschlagen.',
    processing: 'Bilder werden analysiert',
    leadTitle: 'Ihre Vorschau ist bereit',
    leadDesc: 'Schalten Sie Ihre KI-generierte Visualisierung und die auf Ihren Fotos basierende Zusammenfassung frei.',
    leadBtn: 'VORSCHAU ANSEHEN',
    dashboardTitle: 'Haar-Visualisierung',
    dashboardSub: 'SCHÄTZUNGS-ZUSAMMENFASSUNG',
    showcaseTitle1: 'KI-Gesichtsscan',
    showcaseDesc1: 'Scannt Ihre Gesichtszüge anhand von Fotos, um ein visuell ausgewogenes Haarlijn-Design vorzuschlagen.',
    showcaseTitle2: 'Visuelle Schätzung',
    showcaseDesc2: 'Liefert eine vorläufige Schätzung der Transplantatanzahl basierend auf den sichtbaren offenen Bereichen in Ihrem Foto.',
    showcaseTitle3: 'Sofortige Simulation',
    showcaseDesc3: 'Erstellt eine KI-generierte "Nachher"-Visualisierung, um Ihnen bei der Erkundung möglicher Ergebnisse zu helfen.',
    transformationTitle: 'Potenzial visualisieren',
    transformationDesc: 'Wechseln Sie zwischen Ihrem aktuellen Foto und der KI-generierten Visualisierung.',
    beforeLabel: 'ORIGINAL',
    afterLabel: 'KI-VORSCHAU',
    common: {
      back: "Zurück",
      search: "Suche",
      clear: "Löschen",
      view: "Ansehen",
      loading: "Laden..."
    },
    blog: {
      title: "Wissensdatenbank",
      latest: "Neueste Artikel",
      readTime: "Lesezeit",
      searchPlaceholder: "Wissensdatenbank durchsuchen...",
      backToArticles: "Zurück zu Artikeln",
      ctaTitle: "Neugierig auf Ihren Fall?",
      ctaDesc: "Erhalten Sie eine kostenlose KI-Analyse und eine personalisierte Schätzung basierend auf medizinischen Standards.",
      ctaBtn: "Kostenlose Analyse starten"
    },
    directory: {
      title: "Exzellenzzentren",
      subtitle: "Verifizierte Partnerkliniken",
      filters: "Filter",
      location: "Standort",
      budget: "Preisgestaltung",
      technique: "Technik",
      amenities: "Ausstattung",
      reset: "Filter zurücksetzen",
      noResults: "Keine Kliniken gefunden.",
      verified: "Verifiziert",
      from: "Ab",
      findClinics: "Kliniken finden"
    },
    clinic: {
      book: "Beratung buchen",
      startingFrom: "Ab",
      verifiedPartner: "Verifizierter Partner",
      topRated: "Bestbewertet",
      accredited: "Akkreditiert",
      tabs: {
        overview: "Übersicht",
        team: "Ärzteteam",
        technique: "Technik",
        packages: "Pakete",
        reviews: "Bewertungen"
      }
    },
    dashboard: {
      reportId: "Berichts-ID",
      privateReport: "Privater Bericht",
      visualEstimate: "Visuelle Schätzung",
      notMedical: "Kein medizinischer Rat",
      norwood: "Norwood-Skala",
      donor: "Spenderbewertung",
      grafts: "Geschätzte Grafts",
      visualProjection: "Visuelle Projektion",
      download: "PDF Herunterladen",
      clinicConnect: "Angebote von Top-Chirurgen",
      clinicConnectDesc: "Teilen Sie Ihren anonymisierten Bericht mit unserem verifizierten Netzwerk für genaue Angebote.",
      unlockSharing: "Teilen freischalten",
      securityBadge: "DSGVO-konforme Sicherheit",
      dataRetention: "Daten temporär gespeichert."
    },
    footer: {
      patients: "Patienten",
      partners: "Partner",
      compliance: "Compliance",
      contact: "Kontakt",
      disclaimerTitle: "Wichtiger Haftungsausschluss",
      disclaimerText: "Dies ist ein visuelles, nicht-medizinisches Tool zur Visualisierung potenzieller Ergebnisse. Es stellt keine medizinische Diagnose, keinen Behandlungsplan und kein garantiertes Ergebnis dar. Konsultieren Sie immer einen zertifizierten Arzt.",
      rights: "Alle Rechte vorbehalten."
    },
    preScan: {
      title: "Bevor wir beginnen",
      desc: "Für die genaueste KI-Analyse befolgen Sie bitte diese Richtlinien.",
      lightingTitle: "Gute Beleuchtung",
      lightingDesc: "Sorgen Sie für eine gut beleuchtete Umgebung. Vermeiden Sie starkes Gegenlicht.",
      hairlineTitle: "Haaransatz zeigen",
      hairlineDesc: "Ziehen Sie Ihr Haar vollständig zurück. Brille oder Mützen abnehmen.",
      movementTitle: "Langsam bewegen",
      movementDesc: "Wir führen Sie per Sprache. Bewegen Sie sich langsam, um die Hilfslinien auszurichten.",
      automationTitle: "Automatischer Scan",
      automationDesc: "Kein Tippen nötig. Die KI nimmt automatisch auf, wenn fokussiert.",
      cameraError: "Kamerazugriff ist für die KI-Analyse erforderlich. Bitte aktivieren Sie die Kameraberechtigungen in Ihren Browsereinstellungen.",
      startBtn: "Kamera aktivieren & Starten",
      cancelBtn: "Abbrechen",
      legalTitle: "Einwilligung zur Datenverarbeitung",
      legalDesc: "Bitte bestätigen Sie vor der Analyse, dass Sie die Datennutzung verstehen.",
      consentProcessing: "Ich stimme der Verarbeitung meiner Bilder zur visuellen Analyse zu.",
      consentNotMedical: "Ich verstehe, dass dies KEINE medizinische Diagnose ist.",
      consentPrivacy: "Ich stimme der Datenschutzrichtlinie zu.",
      continueBtn: "Bestätigen & Weiter"
    },
    scannerSteps: {
        frontLabel: 'Vorderansicht',
        frontInstruction: 'Schauen Sie direkt in die Kamera',
        frontSpeak: 'Bitte schauen Sie direkt in die Kamera und halten Sie still.',
        leftLabel: 'Rechtes Profil',
        leftInstruction: 'Kopf langsam nach LINKS drehen',
        leftSpeak: 'Drehen Sie Ihren Kopf langsam nach links.',
        rightLabel: 'Linkes Profil',
        rightInstruction: 'Kopf langsam nach RECHTS drehen',
        rightSpeak: 'Drehen Sie Ihren Kopf langsam nach rechts.',
        topLabel: 'Draufsicht',
        topInstruction: 'Kinn zur Brust senken',
        topSpeak: 'Senken Sie Ihr Kinn zur Brust, damit wir den Oberkopf sehen können.',
        donorLabel: 'Spenderbereich',
        donorInstruction: 'Umdrehen. Kamera hinter den Kopf halten.',
        donorSpeak: 'Drehen Sie sich um und halten Sie die Kamera hinter Ihren Kopf.',
        macroLabel: 'Makro-Detail',
        macroInstruction: 'Kamera sehr nah (5cm) an den Haaransatz',
        macroSpeak: 'Bringen Sie die Kamera sehr nah an Ihren Haaransatz.',
        count3: 'Drei',
        count2: 'Zwei',
        count1: 'Eins',
        captured: 'Erfasst'
    }
  },
  FR: {
    heroTag: 'Évaluation Visuelle par IA',
    heroTitle1: 'Visualisez les possibles.',
    heroTitle2: 'Explorez l\'avenir.',
    heroDesc: 'Explorez les résultats potentiels avec notre IA. Notre système analyse les motifs visuels de vos photos pour suggérer un design indicatif.',
    heroDisclaimer: 'Aperçu visuel non médical. Pas un avis médical.',
    startBtn: 'Obtenez votre analyse gratuite',
    methodBtn: 'Comment ça marche',
    navCapture: 'UPLOAD',
    navAnalysis: 'TRAITEMENT',
    navReport: 'APERÇU',
    secureStream: 'Upload sécurisé d\'images',
    medicalGrade: 'Haute définition',
    scalpTopography: 'analyse visuelle.',
    scannerDescription: 'Suivez le guide pour des photos claires. Notre IA cherche des motifs visibles pour suggérer un design.',
    processing: 'Analyse des images',
    leadTitle: 'Votre aperçu est prêt',
    leadDesc: 'Débloquez votre visualisation générée par IA et le résumé indicatif basé sur vos photos.',
    leadBtn: 'VOIR MON APERÇU',
    dashboardTitle: 'Visualisation Capillaire',
    dashboardSub: 'RÉSUMÉ ESTIMATIF',
    showcaseTitle1: 'Scan Facial IA',
    showcaseDesc1: 'Scanne vos traits faciaux à partir de photos pour suggérer une ligne capillaire visuellement équilibrée.',
    showcaseTitle2: 'Estimation Visuelle',
    showcaseDesc2: 'Fournit une estimation préliminaire du nombre de greffons basée sur les zones dégarnies visibles sur votre photo.',
    showcaseTitle3: 'Simulation Instantanée',
    showcaseDesc3: 'Génère une visualisation "Après" créée par l\'IA pour vous aider à explorer les résultats potentiels.',
    transformationTitle: 'Visualisez le potentiel',
    transformationDesc: 'Basculez entre votre photo actuelle et la visualisation générée par l\'IA.',
    beforeLabel: 'ORIGINAL',
    afterLabel: 'APERÇU IA',
    common: {
      back: "Retour",
      search: "Rechercher",
      clear: "Effacer",
      view: "Voir",
      loading: "Chargement..."
    },
    blog: {
      title: "Centre de Connaissances",
      latest: "Derniers Articles",
      readTime: "lecture",
      searchPlaceholder: "Rechercher...",
      backToArticles: "Retour aux articles",
      ctaTitle: "Curieux de votre cas ?",
      ctaDesc: "Obtenez une analyse IA gratuite et une estimation personnalisée.",
      ctaBtn: "Démarrer l'analyse gratuite"
    },
    directory: {
      title: "Centres d'Excellence",
      subtitle: "Cliniques Partenaires Vérifiées",
      filters: "Filtres",
      location: "Emplacement",
      budget: "Prix",
      technique: "Technique",
      amenities: "Services",
      reset: "Réinitialiser",
      noResults: "Aucune clinique trouvée.",
      verified: "Vérifié",
      from: "À partir de",
      findClinics: "Trouver des cliniques"
    },
    clinic: {
      book: "Réserver une consultation",
      startingFrom: "À partir de",
      verifiedPartner: "Partenaire Vérifié",
      topRated: "Mieux Noté",
      accredited: "Accrédité",
      tabs: {
        overview: "Aperçu",
        team: "Équipe Médicale",
        technique: "Technique",
        packages: "Forfaits",
        reviews: "Avis"
      }
    },
    dashboard: {
      reportId: "ID Rapport",
      privateReport: "Rapport Privé",
      visualEstimate: "Estimation Visuelle",
      notMedical: "Pas un avis médical",
      norwood: "Échelle Norwood",
      donor: "Note Donneur",
      grafts: "Greffons Est.",
      visualProjection: "Projection Visuelle",
      download: "Télécharger PDF",
      clinicConnect: "Devis des Meilleurs Chirurgiens",
      clinicConnectDesc: "Partagez votre rapport anonymisé avec notre réseau pour des devis précis.",
      unlockSharing: "Débloquer le partage",
      securityBadge: "Sécurité RGPD",
      dataRetention: "Données stockées temporairement."
    },
    footer: {
      patients: "Patients",
      partners: "Partenaires",
      compliance: "Conformité",
      contact: "Contact",
      disclaimerTitle: "Avis Important",
      disclaimerText: "Ceci est un outil visuel non médical. Il ne fournit pas de diagnostic médical ni de garantie de résultat. Consultez toujours un médecin certifié.",
      rights: "Tous droits réservés."
    },
    preScan: {
      title: "Avant de commencer",
      desc: "Pour assurer l'analyse IA la plus précise, veuillez suivre ces directives.",
      lightingTitle: "Bon éclairage",
      lightingDesc: "Assurez-vous d'être dans un endroit bien éclairé. Évitez le contre-jour fort.",
      hairlineTitle: "Révéler la ligne capillaire",
      hairlineDesc: "Tirez vos cheveux complètement en arrière. Enlevez lunettes ou chapeaux.",
      movementTitle: "Bougez lentement",
      movementDesc: "Nous vous guiderons par la voix. Bougez lentement pour aligner les guides.",
      automationTitle: "Scan automatique",
      automationDesc: "Pas besoin d'appuyer. L'IA capture automatiquement une fois la mise au point faite.",
      cameraError: "L'accès à la caméra est requis pour l'analyse IA. Veuillez activer les permissions de caméra dans les paramètres de votre navigateur.",
      startBtn: "Activer la caméra & Commencer",
      cancelBtn: "Annuler",
      legalTitle: "Consentement",
      legalDesc: "Veuillez confirmer que vous comprenez comment vos données sont utilisées.",
      consentProcessing: "Je consens au traitement de mes images.",
      consentNotMedical: "Je comprends qu'il ne s'agit PAS d'un diagnostic médical.",
      consentPrivacy: "J'accepte la politique de confidentialité.",
      continueBtn: "Confirmer & Continuer"
    },
    scannerSteps: {
        frontLabel: 'Vue de Face',
        frontInstruction: 'Regardez directement la caméra',
        frontSpeak: 'Regardez directement la caméra et ne bougez pas.',
        leftLabel: 'Profil Droit',
        leftInstruction: 'Tournez la tête lentement vers la GAUCHE',
        leftSpeak: 'Tournez lentement la tête vers la gauche.',
        rightLabel: 'Profil Gauche',
        rightInstruction: 'Tournez la tête lentement vers la DROITE',
        rightSpeak: 'Tournez lentement la tête vers la droite.',
        topLabel: 'Vue de Dessus',
        topInstruction: 'Baissez le menton vers la poitrine',
        topSpeak: 'Baissez votre menton vers votre poitrine pour voir le dessus.',
        donorLabel: 'Zone Donneuse',
        donorInstruction: 'Retournez-vous. Tenez le téléphone derrière la tête.',
        donorSpeak: 'Retournez-vous et tenez la caméra derrière votre tête.',
        macroLabel: 'Détail Macro',
        macroInstruction: 'Approchez la caméra (5cm) de la ligne frontale',
        macroSpeak: 'Approchez la caméra très près de votre ligne capillaire.',
        count3: 'Trois',
        count2: 'Deux',
        count1: 'Un',
        captured: 'Capturé'
    }
  },
  PL: {
    heroTag: 'Wizualna Ocena Oparta na AI',
    heroTitle1: 'Zobacz możliwości.',
    heroTitle2: 'Odkryj przyszłość.',
    heroDesc: 'Odkryj potencjalne rezultaty dzięki AI. Nasz system analizuje wzorce wizualne na zdjęciach, aby zasugerować wstępny projekt.',
    heroDisclaimer: 'Wizualny podgląd, nie medyczny. Nie stanowi porady medycznej.',
    startBtn: 'Uzyskaj darmową analizę',
    methodBtn: 'Jak to działa',
    navCapture: 'PRZEŚLIJ',
    navAnalysis: 'PRZETWARZANIE',
    navReport: 'PODGLĄD',
    secureStream: 'Bezpieczne Przesyłanie',
    medicalGrade: 'Wysoka rozdzielczość',
    scalpTopography: 'analiza wizualna.',
    scannerDescription: 'Postępuj zgodnie z instrukcjami, aby zrobić wyraźne zdjęcia. Nasze AI szuka widocznych wzorców, aby zasugerować projekt.',
    processing: 'Analiza obrazu',
    leadTitle: 'Twój podgląd jest gotowy',
    leadDesc: 'Odblokuj wizualizację wygenerowaną przez AI i szacunkowe podsumowanie na podstawie Twoich zdjęć.',
    leadBtn: 'ZOBACZ PODGLĄD',
    dashboardTitle: 'Wizualizacja Włosów',
    dashboardSub: 'PODSUMOWANIE SZACUNKOWE',
    showcaseTitle1: 'Skan Twarzy AI',
    showcaseDesc1: 'Skanuje rysy twarzy ze zdjęć, aby zasugerować wizualnie zrównoważoną linię włosów.',
    showcaseTitle2: 'Szacowanie Wizualne',
    showcaseDesc2: 'Zapewnia wstępne oszacowanie liczby graftów na podstawie widocznych obszarów na zdjęciu.',
    showcaseTitle3: 'Natychmiastowa Symulacja',
    showcaseDesc3: 'Generuje stworzoną przez AI wizualizację "Po", aby pomóc Ci zbadać potencjalne rezultaty.',
    transformationTitle: 'Wizualizuj Potencjał',
    transformationDesc: 'Przełączaj między obecnym zdjęciem a wizualizacją wygenerowaną przez AI.',
    beforeLabel: 'ORYGINAŁ',
    afterLabel: 'PODGLĄD AI',
    common: {
      back: "Wstecz",
      search: "Szukaj",
      clear: "Wyczyść",
      view: "Widok",
      loading: "Ładowanie..."
    },
    blog: {
      title: "Centrum Wiedzy",
      latest: "Najnowsze Artykuły",
      readTime: "czytania",
      searchPlaceholder: "Przeszukaj bazę wiedzy...",
      backToArticles: "Powrót do artykułów",
      ctaTitle: "Ciekawy swojego przypadku?",
      ctaDesc: "Uzyskaj darmową analizę AI i spersonalizowaną wycenę.",
      ctaBtn: "Rozpocznij analizę"
    },
    directory: {
      title: "Centra Doskonałości",
      subtitle: "Zweryfikowane Kliniki Partnerskie",
      filters: "Filtry",
      location: "Lokalizacja",
      budget: "Cena",
      technique: "Technika",
      amenities: "Udogodnienia",
      reset: "Resetuj Filtry",
      noResults: "Nie znaleziono klinik.",
      verified: "Zweryfikowana",
      from: "Od",
      findClinics: "Znajdź Kliniki"
    },
    clinic: {
      book: "Umów Konsultację",
      startingFrom: "Cena od",
      verifiedPartner: "Zweryfikowany Partner",
      topRated: "Najwyżej Oceniane",
      accredited: "Akredytowane",
      tabs: {
        overview: "Przegląd",
        team: "Zespół Medyczny",
        technique: "Technika",
        packages: "Pakiety",
        reviews: "Opinie"
      }
    },
    dashboard: {
      reportId: "ID Raportu",
      privateReport: "Prywatny Raport",
      visualEstimate: "Szacunek Wizualny",
      notMedical: "To nie porada medyczna",
      norwood: "Skala Norwooda",
      donor: "Ocena Dawcy",
      grafts: "Szac. Grafty",
      visualProjection: "Projekcja Wizualna",
      download: "Pobierz PDF",
      clinicConnect: "Oferty od Najlepszych Chirurgów",
      clinicConnectDesc: "Udostępnij zanonimizowany raport, aby otrzymać dokładne wyceny.",
      unlockSharing: "Odblokuj Udostępnianie",
      securityBadge: "Zgodność z RODO",
      dataRetention: "Dane przechowywane tymczasowo."
    },
    footer: {
      patients: "Pacjenci",
      partners: "Partnerzy",
      compliance: "Zgodność",
      contact: "Kontakt",
      disclaimerTitle: "Ważne Zastrzeżenie",
      disclaimerText: "To wizualne narzędzie niemedyczne. Nie stanowi diagnozy medycznej ani gwarancji wyników. Zawsze konsultuj się z lekarzem.",
      rights: "Wszelkie prawa zastrzeżone."
    },
    preScan: {
      title: "Zanim zaczniemy",
      desc: "Aby zapewnić najdokładniejszą analizę AI, postępuj zgodnie z tymi wytycznymi.",
      lightingTitle: "Dobre oświetlenie",
      lightingDesc: "Upewnij się, że jesteś w dobrze oświetlonym miejscu. Unikaj silnego światła w tle.",
      hairlineTitle: "Odsłoń linię włosów",
      hairlineDesc: "Odciągnij włosy całkowicie do tyłu. Zdejmij okulary lub czapkę.",
      movementTitle: "Poruszaj się powoli",
      movementDesc: "Będziemy Cię prowadzić głosowo. Poruszaj się powoli, aby wyrównać wskaźniki.",
      automationTitle: "Automatyczny skan",
      automationDesc: "Nie musisz klikać. AI automatycznie zrobi zdjęcie po ustawieniu ostrości.",
      cameraError: "Dostęp do kamery jest wymagany do analizy AI. Włącz uprawnienia kamery w ustawieniach przeglądarki.",
      startBtn: "Włącz kamerę i Start",
      cancelBtn: "Anuluj",
      legalTitle: "Zgoda na przetwarzanie",
      legalDesc: "Potwierdź, że rozumiesz, jak wykorzystywane są Twoje dane.",
      consentProcessing: "Wyrażam zgodę na przetwarzanie obrazu.",
      consentNotMedical: "Rozumiem, że to NIE jest diagnoza medyczna.",
      consentPrivacy: "Akceptuję Politykę Prywatności.",
      continueBtn: "Zatwierdź i Kontynuuj"
    },
    scannerSteps: {
        frontLabel: 'Widok z Przodu',
        frontInstruction: 'Patrz prosto w kamerę',
        frontSpeak: 'Proszę patrzeć prosto w kamerę i nie ruszać się.',
        leftLabel: 'Prawy Profil',
        leftInstruction: 'Obróć głowę powoli w LEWO',
        leftSpeak: 'Powoli obróć głowę w lewo.',
        rightLabel: 'Lewy Profil',
        rightInstruction: 'Obróć głowę powoli w PRAWO',
        rightSpeak: 'Teraz powoli obróć głowę w prawo.',
        topLabel: 'Widok z Góry',
        topInstruction: 'Opuszcz podbródek do klatki piersiowej',
        topSpeak: 'Opuść podbródek do klatki piersiowej, abyśmy widzieli czubek głowy.',
        donorLabel: 'Obszar Dawczy',
        donorInstruction: 'Odwróć się. Trzymaj telefon z tyłu głowy.',
        donorSpeak: 'Odwróć się i trzymaj kamerę z tyłu głowy.',
        macroLabel: 'Zbliżenie Makro',
        macroInstruction: 'Zbliż kamerę (5cm) do linii włosów',
        macroSpeak: 'Zbliż kamerę bardzo blisko do linii włosów.',
        count3: 'Trzy',
        count2: 'Dwa',
        count1: 'Jeden',
        captured: 'Zrobione'
    }
  },
  AR: {
    heroTag: 'تقييم بصري بالذكاء الاصطناعي',
    heroTitle1: 'تخيل الاحتمالات.',
    heroTitle2: 'استكشف المستقبل.',
    heroDesc: 'استكشف النتائج المحتملة باستخدام الذكاء الاصطناعي. يقوم نظامنا بتحليل الأنماط المرئية في صورك لاقتراح تصميم أولي.',
    heroDisclaimer: 'معاينة بصرية غير طبية. ليست نصيحة طبية.',
    startBtn: 'احصل على تحليلك المجاني',
    methodBtn: 'كيف يعمل',
    navCapture: 'رفع',
    navAnalysis: 'معالجة',
    navReport: 'معاينة',
    secureStream: 'رفع صور آمن',
    medicalGrade: 'عالي الدقة',
    scalpTopography: 'تحليل بصري.',
    scannerDescription: 'اتبع الدليل لالتقاط صور واضحة. يبحث الذكاء الاصطناعي عن الأنماط الظاهرة لاقتراح تصميم.',
    processing: 'جاري تحليل الصور',
    leadTitle: 'المعاينة جاهزة',
    leadDesc: 'افتح التصور الذي أنشأه الذكاء الاصطناعي والملخص التقديري بناءً على الصور التي قدمتها.',
    leadBtn: 'شاهد المعاينة',
    dashboardTitle: 'تخيل الشعر',
    dashboardSub: 'ملخص تقديري',
    showcaseTitle1: 'مسح الوجه بالذكاء الاصطناعي',
    showcaseDesc1: 'يقوم بمسح ملامح وجهك من الصور لاقتراح تصميم خط شعر متوازن بصريًا.',
    showcaseTitle2: 'تقدير مرئي',
    showcaseDesc2: 'يوفر تقديرًا أوليًا لعدد البصيلات بناءً على المناطق المكشوفة الظاهرة في صورتك.',
    showcaseTitle3: 'محاكاة فورية',
    showcaseDesc3: 'يولد تصورًا لـ "ما بعد" تم إنشاؤه بواسطة الذكاء الاصطناعي لمساعدتك على استكشاف النتائج المحتملة.',
    transformationTitle: 'تخيل الإمكانيات',
    transformationDesc: 'بدّل بين صورتك الحالية والتصور الذي أنشأه الذكاء الاصطناعي.',
    beforeLabel: 'الأصل',
    afterLabel: 'معاينة AI',
    common: {
      back: "عودة",
      search: "بحث",
      clear: "مسح",
      view: "عرض",
      loading: "جار التحميل..."
    },
    blog: {
      title: "مركز المعرفة",
      latest: "أحدث المقالات",
      readTime: "قراءة",
      searchPlaceholder: "البحث في قاعدة المعرفة...",
      backToArticles: "العودة للمقالات",
      ctaTitle: "هل لديك فضول حول حالتك؟",
      ctaDesc: "احصل على تحليل مجاني بالذكاء الاصطناعي وتقدير مخصص.",
      ctaBtn: "ابدأ التحليل المجاني"
    },
    directory: {
      title: "مراكز التميز",
      subtitle: "عيادات شريكة معتمدة",
      filters: "تصفية",
      location: "الموقع",
      budget: "التسعير",
      technique: "التقنية",
      amenities: "المرافق",
      reset: "إعادة تعيين",
      noResults: "لم يتم العثور على عيادات.",
      verified: "مؤكد",
      from: "من",
      findClinics: "اعثر على عيادات"
    },
    clinic: {
      book: "حجز استشارة",
      startingFrom: "يبدأ من",
      verifiedPartner: "شريك معتمد",
      topRated: "الأعلى تقييماً",
      accredited: "معتمد",
      tabs: {
        overview: "نظرة عامة",
        team: "الفريق الطبي",
        technique: "التقنية",
        packages: "الباقات",
        reviews: "التقييمات"
      }
    },
    dashboard: {
      reportId: "رقم التقرير",
      privateReport: "تقرير خاص",
      visualEstimate: "تقدير بصري",
      notMedical: "ليست نصيحة طبية",
      norwood: "مقياس نوروود",
      donor: "تصنيف المانح",
      grafts: "عدد البصيلات",
      visualProjection: "إسقاط بصري",
      download: "تحميل PDF",
      clinicConnect: "عروض من أفضل الجراحين",
      clinicConnectDesc: "شارك تقريرك المجهول مع شبكتنا المعتمدة للحصول على عروض دقيقة.",
      unlockSharing: "فتح المشاركة",
      securityBadge: "أمن متوافق مع HIPAA",
      dataRetention: "يتم تخزين البيانات مؤقتًا."
    },
    footer: {
      patients: "المرضى",
      partners: "الشركاء",
      compliance: "الامتثال",
      contact: "اتصال",
      disclaimerTitle: "إخلاء مسؤولية هام",
      disclaimerText: "هذه أداة بصرية غير طبية للمساعدة في تصور النتائج. لا تقدم تشخيصًا طبيًا أو ضمانًا للنتائج. استشر طبيبًا معتمدًا دائمًا.",
      rights: "جميع الحقوق محفوظة."
    },
    preScan: {
      title: "قبل أن نبدأ",
      desc: "لضمان أدق تحليل للذكاء الاصطناعي، يرجى اتباع هذه الإرشادات.",
      lightingTitle: "إضاءة جيدة",
      lightingDesc: "تأكد من وجودك في منطقة مضاءة جيدًا. تجنب الإضاءة الخلفية القوية.",
      hairlineTitle: "كشف خط الشعر",
      hairlineDesc: "اسحب شعرك للخلف تمامًا. انزع النظارات أو القبعات.",
      movementTitle: "تحرك ببطء",
      movementDesc: "سنرشدك عبر الصوت. تحرك ببطء لمحاذاة الأدلة.",
      automationTitle: "مسح تلقائي",
      automationDesc: "لا حاجة للنقر. يلتقط الذكاء الاصطناعي الصور تلقائيًا عند التركيز.",
      cameraError: "الوصول إلى الكاميرا مطلوب لإجراء تحليل الذكاء الاصطناعي. يرجى تمكين أذونات الكاميرا في إعدادات المتصفح.",
      startBtn: "تفعيل الكاميرا والبدء",
      cancelBtn: "إلغاء",
      legalTitle: "الموافقة على معالجة البيانات",
      legalDesc: "قبل أن نحلل صورك، يرجى تأكيد فهمك لكيفية استخدام بياناتك.",
      consentProcessing: "أوافق على معالجة صوري للتحليل البصري.",
      consentNotMedical: "أفهم أن هذا محاكاة، وليس تشخيصًا طبيًا.",
      consentPrivacy: "أوافق على سياسة الخصوصية.",
      continueBtn: "تأكيد ومتابعة"
    },
    scannerSteps: {
        frontLabel: 'منظر أمامي',
        frontInstruction: 'انظر مباشرة إلى الكاميرا',
        frontSpeak: 'الرجاء النظر مباشرة إلى الكاميرا والثبات.',
        leftLabel: 'الجانب الأيمن',
        leftInstruction: 'أدر رأسك ببطء لليسار',
        leftSpeak: 'أدر رأسك ببطء إلى اليسار.',
        rightLabel: 'الجانب الأيسر',
        rightInstruction: 'أدر رأسك ببطء لليمين',
        rightSpeak: 'الآن، أدر رأسك ببطء إلى اليمين.',
        topLabel: 'منظر علوي',
        topInstruction: 'اخفض ذقنك للصدر',
        topSpeak: 'اخفض ذقنك إلى صدرك لرؤية أعلى الرأس.',
        donorLabel: 'المنطقة المانحة',
        donorInstruction: 'استدر. احمل الهاتف خلف الرأس.',
        donorSpeak: 'استدر واحمل الكاميرا خلف رأسك لتصوير المنطقة المانحة.',
        macroLabel: 'تفاصيل دقيقة',
        macroInstruction: 'قرب الكاميرا (5 سم) من خط الشعر',
        macroSpeak: 'قرب الكاميرا جداً من خط الشعر.',
        count3: 'ثلاثة',
        count2: 'اثنان',
        count1: 'واحد',
        captured: 'تم الالتقاط'
    }
  }
};
