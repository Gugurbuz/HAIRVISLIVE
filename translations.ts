
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
    startBtn: 'Start Visual Preview',
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
      cancelBtn: "Cancel"
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
    startBtn: 'Görsel Önizlemeyi Başlat',
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
      cancelBtn: "İptal"
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
    startBtn: 'Visuelle Vorschau starten',
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
      cancelBtn: "Abbrechen"
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
    startBtn: 'Lancer l\'aperçu visuel',
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
      cancelBtn: "Annuler"
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
    startBtn: 'Rozpocznij Podgląd',
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
      cancelBtn: "Anuluj"
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
    startBtn: 'ابدأ المعاينة المرئية',
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
      cancelBtn: "إلغاء"
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
