// Comprehensive Multilingual Dictionary for AgroPulse (English, Marathi, Hindi)

export const translations = {
  en: {
    // Brand & Header
    app_title: "AgroPulse",
    app_tagline: "Agricultural Supply Chain & Mandi Procurement Platform",
    apmc_badge: "APMC Mandi",
    verified: "Verified",

    // Roles
    farmer: "Farmer",
    buyer: "Buyer",
    operator: "Operator",

    // Navigation Tabs - Farmer
    nav_produce: "My Produce & Pricing",
    nav_incoming_bids: "Incoming Bids",
    nav_matching: "Buyer Matches",
    nav_freight: "Smart Freight",
    nav_tokens: "Digital Tokens",
    nav_payments: "Payment History",

    // Navigation Tabs - Buyer
    nav_marketplace: "Produce Marketplace",
    nav_my_bids: "My Purchase Orders",
    nav_buyer_payments: "Invoices & Payments",


    // Navigation Tabs - Operator
    nav_queue: "Live Queue Console",
    nav_scan: "Scan QR Pass",
    nav_counter: "Counter Intake",

    // Common
    nav_analytics: "Analytics",
    nav_ai_vision: "AI Vision Quality",

    // Produce Listing Wizard (Selling)
    selling_header_sub: "Produce Registration & Selling",
    selling_header_title: "List Harvest with AI Quality Assay",
    selling_header_desc: "Scan produce photos using Computer Vision to verify AGMARK standards and unlock top buyer bids.",
    btn_run_ai_scan: "Run AI Vision Quality Scan",
    
    hero_step1_badge: "STEP 1 IN SELLING: AI OPTICAL ASSAY",
    hero_verified_badge: "✓ VERIFIED CERTIFICATE ATTACHED",
    hero_ai_title: "AI Computer Vision Fruit & Quality Inspector",
    hero_ai_desc: "Snap or upload a photo of your produce. The AI auto-detects the fruit type (Apple, Banana, Tomato, Mango, Onion, etc.), checks skin blemishes, and certifies official AGMARK Grade.",
    btn_snap_upload_autofill: "Snap / Upload Photo to Auto-Fill",
    
    spec_title: "Lot Specifications & Price Details",
    select_crop_label: "Selected Crop / Fruit",
    variety_label: "Variety / Cultivar",
    location_label: "Village / Mandi Catchment",
    weight_label: "Total Weight (kg)",
    asking_rate_label: "Asking Rate (₹/kg)",
    lot_valuation_label: "Lot Valuation",
    quality_grade_label: "Quality Grade (AGMARK)",
    moisture_label: "Moisture Content (%)",
    notes_label: "Batch Handling & Quality Notes",
    btn_confirm_list: "Confirm & List Lot on Mandi Marketplace",
    btn_publishing: "Publishing Lot...",
    btn_view_matched: "View Matched Buyers →",

    // Pricing Valuation Card
    pricing_valuation_title: "Pricing Valuation",
    statistical_model: "Statistical Mandi Model",
    fair_market_band: "Fair Market Band",
    target_fair_value: "Target Fair Value",
    gov_msp: "Government MSP",
    mandi_7d_avg: "Mandi 7D Average",
    factor_adjustments: "Factor Adjustments",

    // Buyer Marketplace
    marketplace_sub: "Mandi Sourcing & Verified Lots",
    marketplace_title: "Farmer Produce Marketplace",
    marketplace_desc: "Procure direct farm lots verified with AI Computer Vision Optical Quality Assays and AGMARK certification.",
    search_placeholder: "Search crop, mandi, farmer...",
    all_crops: "All Produce",
    ai_certified_badge: "AI Certified",
    view_assay_cert: "View Assay Certificate",
    available_qty: "Available Quantity",
    asking_price: "Asking Price",
    valuation_band: "Valuation Band",
    btn_place_bid: "Place Purchase Order",

    // Optical Assay Modal
    optical_cert_title: "AI Optical Quality Certificate",
    optical_cert_sub: "AGMARK Standard Verification",
    certified_produce: "Certified Produce",
    quality_grade: "Quality Grade",
    ripeness_shelf_life: "Ripeness & Shelf-Life",
    moisture_ratio: "Moisture Ratio",
    optical_notes: "Optical Inspection Notes",
    btn_close: "Close",
    btn_bid_this_lot: "Order This Lot",


    // Incoming Bids View
    bids_sub: "Direct Sourcing Desk",
    bids_title: "Received Buyer Bids & Purchase Offers",
    bids_desc: "Direct procurement offers placed by verified agri-companies and food processors on your produce lots.",
    pending_offers: "Pending Offers",
    accepted_deals: "Accepted Deals",
    total_bids_value: "Total Bids Value",
    awaiting_confirmation: "Awaiting your confirmation",
    locked_rate: "Locked at guaranteed rate",
    across_lots: "Across active lots",
    btn_accept_deal: "Accept Bid & Lock Deal",
    btn_decline: "Decline / Cancel",
    btn_rate_buyer: "Rate Buyer",

    // Smart Freight
    freight_sub: "Kisan Logistics Pooling",
    freight_title: "Smart Freight & Truck Sharing",
    freight_desc: "Pool freight with nearby farmers to reduce transport costs by up to 55% with optimized pickup routes.",
    solo_cost: "Solo Truck Cost",
    pooled_fare: "Pooled Route Cost",
    est_savings: "Estimated Savings",
    book_freight: "Join Freight Pool",

    // Digital Tokens & Gate Pass
    tokens_sub: "APMC Mandi Ingress Pass",
    tokens_title: "Digital Mandi Tokens & Fast-Track Gate Passes",
    tokens_desc: "Skip long physical truck queues with verified QR appointment tokens and live queue notifications.",
    token_no: "Token No",
    assigned_counter: "Assigned Counter",
    est_wait: "Estimated Wait Time",
    btn_show_qr: "Show QR Gate Pass",

    // AI Scanner Modal
    scanner_title: "AI Computer Vision Fruit & Quality Inspector",
    scanner_sub: "Real-time produce identification, surface blemish analysis & AGMARK grading",
    tab_samples: "Verified Specimen Gallery",
    tab_upload: "Upload Produce Photo",
    tab_camera: "Live Camera Scanner",
    detecting_features: "Detecting Fruit Type & Optical Features...",
    surface_integrity: "Surface Integrity",
    color_uniformity: "Color Uniformity",
    size_symmetry: "Size Symmetry",
    inferred_moisture: "Inferred Moisture",
    btn_apply_grade: "Apply Detected Grade to Lot",

    // Language Selector
    language: "Language",
    english: "English",
    marathi: "मराठी",
    hindi: "हिंदी",

    // AI Real-Time Queue Detection & CCTV Vision
    queue_vision_title: "AI Real-Time Queue Detection & Mandi Gate CCTV",
    queue_vision_sub: "Computer vision vehicle detection, tractor count, queue density & smart weighbridge load balancing",
    queue_cctv_feeds: "APMC Mandi CCTV Cameras",
    detected_vehicles: "Detected Vehicles",
    queue_density: "Queue Density",
    congestion_status: "Congestion Status",
    smart_routing_title: "AI Weighbridge Load Balancing",
    btn_open_queue_vision: "Open AI Queue Vision Monitor",
    btn_cctv_scan: "Live CCTV Queue Detection",
    tractors_in_lane: "Tractors in Lane",
    trucks_in_lane: "Heavy Trucks",
    tempos_in_lane: "Pickups / Tempos",
    farmers_waiting: "Farmers Waiting",
    lane_distance: "Queue Length",
    btn_overflow_weighbridge: "Activate Overflow Weighbridge #4",
    btn_reroute_tractors: "Auto-Balance Counter Loads",

    // SMS & App Notifications
    nav_sms_alerts: "SMS & Notifications",
    nav_send_sms: "Send SMS Alert",
    notif_center_title: "Mandi Alerts & Push Notifications",
    notif_tab_all: "All Alerts",
    notif_tab_app: "In-App Push",
    notif_tab_sms: "SMS (DLT)",
    notif_tab_whatsapp: "WhatsApp",
    btn_send_custom_sms: "Dispatch SMS / App Alert",
    btn_mark_all_read: "Mark all read",
    no_notifications: "No notifications right now.",
    sms_dispatcher_title: "Send Instant SMS & App Notifications",
    sms_dispatcher_sub: "DLT-compliant telecom SMS, In-App push, and WhatsApp message gateway",
    label_channel: "Dispatch Channel",
    label_phone: "Recipient Mobile Number",
    label_template: "Notification Event / Template",
    label_custom_text: "Message Body / Content",
    btn_send_now: "Send Alert Now"
  },

  mr: {
    // Brand & Header
    app_title: "ॲग्रोपल्स (AgroPulse)",
    app_tagline: "कृषी पुरवठा साखळी आणि थेट बाजार समिती (APMC) खरेदी प्लॅटफॉर्म",
    apmc_badge: "बाजार समिती",
    verified: "प्रमाणित",

    // Roles
    farmer: "शेतकरी",
    buyer: "खरेदीदार / व्यापारी",
    operator: "मंडी ऑपरेटर",

    // Navigation Tabs - Farmer
    nav_produce: "माझे पीक व भाव",
    nav_incoming_bids: "आलेले खरेदी सौदे",
    nav_matching: "खरेदीदार शोध",
    nav_freight: "स्मार्ट वाहतूक शेअरिंग",
    nav_tokens: "डिजिटल टोकन",
    nav_payments: "पेमेंट इतिहास",

    // Navigation Tabs - Buyer
    nav_marketplace: "शेतमाल बाजारपेठ",
    nav_my_bids: "माझ्या खरेदी ऑर्डर्स",
    nav_buyer_payments: "बिले व देयके",


    // Navigation Tabs - Operator
    nav_queue: "थेट रांग व्यवस्थापन",
    nav_scan: "QR पास स्कॅन करा",
    nav_counter: "तोल व प्रतवारी केंद्र",

    // Common
    nav_analytics: "बाजार विश्लेषण",
    nav_ai_vision: "AI गुणवत्ता तपासणी",

    // Produce Listing Wizard (Selling)
    selling_header_sub: "शेतमाल नोंदणी व थेट विक्री",
    selling_header_title: "AI गुणवत्ता तपासणीसह शेतमाल विक्रीस काढा",
    selling_header_desc: "कम्प्युटर व्हिजन कॅमेऱ्याने फळे व पिकांची तपासणी करा, ऍगमार्क प्रत मिळवा आणि जास्तीत जास्त भाव मिळवा.",
    btn_run_ai_scan: "AI कॅमेऱ्याने गुणवत्ता तपासा",
    
    hero_step1_badge: "विक्रीची पायरी १: AI ऑप्टिकल तपासणी",
    hero_verified_badge: "✓ AI गुणवत्ता प्रमाणपत्र जोडले आहे",
    hero_ai_title: "AI कम्प्युटर व्हिजन फळ व पीक तपासणी प्रणाली",
    hero_ai_desc: "आपल्या पिकाचा फोटो अपलोड करा किंवा काढा. AI आपोआप फळाचा प्रकार (टोमॅटो, सफरचंद, आंबा, कांदा, केळी इ.) ओळखेल आणि अचूक ऍगमार्क दर्जा देईल.",
    btn_snap_upload_autofill: "फोटो काढून माहिती भरा",
    
    spec_title: "शेतमाल तपशील व अपेक्षित दर",
    select_crop_label: "पिकाचा / फळाचा प्रकार निवडा",
    variety_label: "वाण / जात",
    location_label: "गाव / बाजार समिती परिसर",
    weight_label: "एकूण वजन (किलो)",
    asking_rate_label: "अपेक्षित दर (₹/किलो)",
    lot_valuation_label: "एकूण मूल्य",
    quality_grade_label: "प्रतवारी / दर्जा (AGMARK)",
    moisture_label: "ओलावा प्रमाण (%)",
    notes_label: "शेतमाल हाताळणी व प्रतवारी नोंदी",
    btn_confirm_list: "शेतमाल बाजारात विक्रीसाठी नोंदवा",
    btn_publishing: "नोंदणी होत आहे...",
    btn_view_matched: "उपलब्ध खरेदीदार पहा →",

    // Pricing Valuation Card
    pricing_valuation_title: "बाजार भाव विश्लेषण",
    statistical_model: "मंडी दर अंदाज प्रणाली",
    fair_market_band: "योग्य बाजार भाव पट्टा",
    target_fair_value: "अपेक्षित रास्त दर",
    gov_msp: "शासकीय हमीभाव (MSP)",
    mandi_7d_avg: "बाजार समिती ७ दिवसांची सरासरी",
    factor_adjustments: "भाव परिणाम घटक",

    // Buyer Marketplace
    marketplace_sub: "बाजार समिती थेट खरेदी",
    marketplace_title: "शेतकरी शेतमाल बाजारपेठ",
    marketplace_desc: "AI संगणक तपासणी प्रमाणित आणि ऍगमार्क दर्जा असलेल्या थेट शेतमालाची विश्वासार्ह खरेदी करा.",
    search_placeholder: "पीक, गाव किंवा शेतकरी शोधा...",
    all_crops: "सर्व पिके / फळे",
    ai_certified_badge: "AI प्रमाणित",
    view_assay_cert: "गुणवत्ता प्रमाणपत्र पहा",
    available_qty: "उपलब्ध वजन",
    asking_price: "शेतकरी अपेक्षित दर",
    valuation_band: "बाजार दर पट्टा",
    btn_place_bid: "खरेदी बोली लावा",

    // Optical Assay Modal
    optical_cert_title: "AI ऑप्टिकल गुणवत्ता प्रमाणपत्र",
    optical_cert_sub: "ऍगमार्क (AGMARK) अधिकृत प्रतवारी",
    certified_produce: "प्रमाणित शेतमाल",
    quality_grade: "गुणवत्ता दर्जा",
    ripeness_shelf_life: "पक्वता व टिकण्याची क्षमता",
    moisture_ratio: "तपासलेला ओलावा",
    optical_notes: "कॅमेरा तपासणी निष्कर्ष",
    btn_close: "बंद करा",
    btn_bid_this_lot: "या लॉटवर खरेदी बोली लावा",

    // Incoming Bids View
    bids_sub: "थेट खरेदी सौदे कक्ष",
    bids_title: "व्यापाऱ्यांकडून आलेल्या खरेदी बोल्या व ऑफर्स",
    bids_desc: "आपल्या नोंदवलेल्या शेतमालावर नामांकित कंपन्या व व्यापाऱ्यांनी दिलेल्या थेट खरेदी ऑफर्स तपासा.",
    pending_offers: "प्रलंबित ऑफर्स",
    accepted_deals: "स्वीकारलेले सौदे",
    total_bids_value: "एकूण ऑफर्सचे मूल्य",
    awaiting_confirmation: "आपल्या मंजुरीची प्रतीक्षा",
    locked_rate: "हमी दरावर निश्चित",
    across_lots: "सक्रिय लॉट्सवर",
    btn_accept_deal: "ऑफर स्वीकारा व सौदा पक्का करा",
    btn_decline: "नाकारा / रद्द करा",
    btn_rate_buyer: "खरेदीदाराचे पुनरावलोकन करा",

    // Smart Freight
    freight_sub: "किसान स्मार्ट वाहतूक शेअरिंग",
    freight_title: "शेअरिंग ट्रान्सपोर्ट व वाहतूक खर्च बचत",
    freight_desc: "शेजारील शेतकऱ्यांसोबत वाहन शेअर करून वाहतूक खर्चात ५५% पर्यंत बचत करा.",
    solo_cost: "वैयक्तिक भाडे खर्च",
    pooled_fare: "एकत्रित शेअरिंग भाडे",
    est_savings: "होणारी एकूण बचत",
    book_freight: "वाहतूक ग्रुपमध्ये सामील व्हा",

    // Digital Tokens & Gate Pass
    tokens_sub: "बाजार समिती प्रवेश पास",
    tokens_title: "डिजिटल मंडी टोकन व फास्ट-ट्रॅक गेट पास",
    tokens_desc: "रांगेत उभे राहण्याऐवजी डिजिटल QR टोकन मिळवा आणि थेट तोल काट्यावर गाडी न्या.",
    token_no: "टोकन क्रमांक",
    assigned_counter: "नियुक्त तोल काटा",
    est_wait: "अपेक्षित प्रतीक्षा वेळ",
    btn_show_qr: "QR गेट पास दाखवा",

    // AI Scanner Modal
    scanner_title: "AI कम्प्युटर व्हिजन गुणवत्ता तपासणी",
    scanner_sub: "थेट फोटो स्कॅनिंग, डाग तपासणी आणि ऍगमार्क प्रतवारी प्रणाली",
    tab_samples: "प्रमाणित नमुने गॅलरी",
    tab_upload: "पिकाचा फोटो अपलोड करा",
    tab_camera: "लाईव्ह कॅमेरा स्कॅनर",
    detecting_features: "फळ आणि गुणवत्तेचे विश्लेषण सुरू आहे...",
    surface_integrity: "पृष्ठभाग स्वच्छता",
    color_uniformity: "रंग एकसारखेपणा",
    size_symmetry: "आकार सममिती",
    inferred_moisture: "अपेक्षित ओलावा",
    btn_apply_grade: "हा दर्जा लॉटवर लागू करा",

    // Language Selector
    language: "भाषा",
    english: "English",
    marathi: "मराठी",
    hindi: "हिंदी",

    // AI Real-Time Queue Detection & CCTV Vision
    queue_vision_title: "AI थेट रांग तपासणी व बाजार समिती CCTV",
    queue_vision_sub: "कम्प्युटर व्हिजनद्वारे वाहने, ट्रॅक्टर मोजणी, रांग घनता व तोल काटा भार संतुलन",
    queue_cctv_feeds: "बाजार समिती थेट CCTV कॅमेरे",
    detected_vehicles: "तपासलेली वाहने",
    queue_density: "रांग घनता (कंजेशन)",
    congestion_status: "रांगेची सद्यस्थिती",
    smart_routing_title: "AI तोल काटा लोड बॅलन्सिंग",
    btn_open_queue_vision: "AI थेट रांग मॉनिटर उघडा",
    btn_cctv_scan: "थेट CCTV रांग स्कॅन",
    tractors_in_lane: "रांगेतील ट्रॅक्टर",
    trucks_in_lane: "मोठे ट्रक",
    tempos_in_lane: "पिकअप / टेम्पो",
    farmers_waiting: "प्रतीक्षारत शेतकरी",
    lane_distance: "रांगेची लांबी",
    btn_overflow_weighbridge: "अतिरिक्त तोल काटा क्र. ४ सुरू करा",
    btn_reroute_tractors: "तोल काटा भार स्वयंचलित संतुलित करा",

    // SMS & App Notifications
    nav_sms_alerts: "SMS व सूचना",
    nav_send_sms: "SMS पाठवा",
    notif_center_title: "मंडी सूचना व पुश नोटिफिकेशन्स",
    notif_tab_all: "सर्व सूचना",
    notif_tab_app: "ॲप नोटिफिकेशन्स",
    notif_tab_sms: "SMS (मोबाईल मेसेज)",
    notif_tab_whatsapp: "व्हॉट्सॲप",
    btn_send_custom_sms: "SMS / ॲप सूचना पाठवा",
    btn_mark_all_read: "सर्व वाचल्याचे चिन्हांकित करा",
    no_notifications: "सध्या कोणतीही सूचना नाही.",
    sms_dispatcher_title: "त्वरित SMS व ॲप सूचना पाठवा",
    sms_dispatcher_sub: "शासकीय DLT प्रमाणित SMS, ॲप पुश आणि व्हॉट्सॲप मेसेजिंग प्रणाली",
    label_channel: "माध्यम निवडा",
    label_phone: "प्राप्तकर्त्याचा मोबाईल क्रमांक",
    label_template: "मेसेजचा प्रकार / टेम्पलेट",
    label_custom_text: "मेसेज मजकूर",
    btn_send_now: "आत्ताच सूचना पाठवा"
  },

  hi: {
    // Brand & Header
    app_title: "एग्रोपल्स (AgroPulse)",
    app_tagline: "कृषि आपूर्ति श्रृंखला और प्रत्यक्ष मंडी (APMC) खरीद मंच",
    apmc_badge: "कृषि उपज मंडी",
    verified: "सत्यापित",

    // Roles
    farmer: "किसान",
    buyer: "खरीदार / व्यापारी",
    operator: "मंडी ऑपरेटर",

    // Navigation Tabs - Farmer
    nav_produce: "मेरी फसल और भाव",
    nav_incoming_bids: "प्राप्त बोलियां",
    nav_matching: "खरीदार खोज",
    nav_freight: "स्मार्ट माल ढुलाई",
    nav_tokens: "डिजिटल टोकन",
    nav_payments: "भुगतान इतिहास",

    // Navigation Tabs - Buyer
    nav_marketplace: "उपज मंडी बाजार",
    nav_my_bids: "मेरी बोलियां",
    nav_buyer_payments: "चालान व भुगतान",

    // Navigation Tabs - Operator
    nav_queue: "लाइव कतार प्रबंधन",
    nav_scan: "QR पास स्कैन करें",
    nav_counter: "तौल व गुणवत्ता केंद्र",

    // Common
    nav_analytics: "मंडी विश्लेषण",
    nav_ai_vision: "AI गुणवत्ता जांच",

    // Produce Listing Wizard (Selling)
    selling_header_sub: "उपज पंजीकरण और प्रत्यक्ष बिक्री",
    selling_header_title: "AI गुणवत्ता जांच के साथ फसल बिक्री के लिए लगाएं",
    selling_header_desc: "कंप्यूटर विजन कैमरे से फलों और फसलों की जांच करें, एगमार्क ग्रेड पाएं और अधिकतम मूल्य प्राप्त करें।",
    btn_run_ai_scan: "AI कैमरे से गुणवत्ता जांचें",
    
    hero_step1_badge: "बिक्री का पहला चरण: AI ऑप्टिकल जांच",
    hero_verified_badge: "✓ AI गुणवत्ता प्रमाणपत्र संलग्न है",
    hero_ai_title: "AI कंप्यूटर विजन फल व फसल जांच प्रणाली",
    hero_ai_desc: "अपनी उपज की फोटो अपलोड करें या खींचें। AI अपने आप फल के प्रकार (टमाटर, सेब, आम, प्याज, केला आदि) को पहचानेगा और सटीक एगमार्क ग्रेड देगा।",
    btn_snap_upload_autofill: "फोटो खींचकर विवरण भरें",
    
    spec_title: "उपज विवरण व अपेक्षित मूल्य",
    select_crop_label: "फसल / फल का प्रकार चुनें",
    variety_label: "किस्म / प्रजाति",
    location_label: "गांव / मंडी क्षेत्र",
    weight_label: "कुल वजन (किग्रा)",
    asking_rate_label: "अपेक्षित दर (₹/किग्रा)",
    lot_valuation_label: "कुल मूल्य",
    quality_grade_label: "गुणवत्ता ग्रेड (AGMARK)",
    moisture_label: "नमी की मात्रा (%)",
    notes_label: "फसल रखरखाव व गुणवत्ता विवरण",
    btn_confirm_list: "मंडी में बिक्री हेतु दर्ज करें",
    btn_publishing: "पंजीकरण जारी है...",
    btn_view_matched: "उपलब्ध खरीदार देखें →",

    // Pricing Valuation Card
    pricing_valuation_title: "मंडी भाव मूल्यांकन",
    statistical_model: "मंडी सांख्यिकीय मूल्य मॉडल",
    fair_market_band: "उचित बाजार मूल्य दायरा",
    target_fair_value: "अपेक्षित उचित दर",
    gov_msp: "सरकारी न्यूनतम समर्थन मूल्य (MSP)",
    mandi_7d_avg: "मंडी 7-दिवसीय औसत",
    factor_adjustments: "मूल्य प्रभाव कारक",

    // Buyer Marketplace
    marketplace_sub: "मंडी प्रत्यक्ष खरीद",
    marketplace_title: "किसान उपज मंडी बाजार",
    marketplace_desc: "AI कंप्यूटर विजन प्रमाणित और एगमार्क ग्रेड युक्त सीधी किसान उपज की सुरक्षित खरीद करें।",
    search_placeholder: "फसल, मंडी या किसान का नाम खोजें...",
    all_crops: "सभी फसलें / फल",
    ai_certified_badge: "AI प्रमाणित",
    view_assay_cert: "गुणवत्ता प्रमाणपत्र देखें",
    available_qty: "उपलब्ध मात्रा",
    asking_price: "किसान अपेक्षित दर",
    valuation_band: "बाजार दर दायरा",
    btn_place_bid: "खरीद बोली लगाएं",

    // Optical Assay Modal
    optical_cert_title: "AI ऑप्टिकल गुणवत्ता प्रमाणपत्र",
    optical_cert_sub: "एगमार्क (AGMARK) आधिकारिक ग्रेडिंग",
    certified_produce: "प्रमाणित उपज",
    quality_grade: "गुणवत्ता ग्रेड",
    ripeness_shelf_life: "परिपक्वता व शेल्फ लाइफ",
    moisture_ratio: "परीक्षण की गई नमी",
    optical_notes: "कैमरा जांच निष्कर्ष",
    btn_close: "बंद करें",
    btn_bid_this_lot: "इस लॉट पर बोली लगाएं",

    // Incoming Bids View
    bids_sub: "प्रत्यक्ष खरीद डेस्क",
    bids_title: "व्यापारियों से प्राप्त खरीद बोलियां व प्रस्ताव",
    bids_desc: "अपनी सूचीबद्ध उपज पर प्रमुख कृषि कंपनियों और व्यापारियों द्वारा दी गई सीधी खरीद बोलियों की समीक्षा करें।",
    pending_offers: "लंबित प्रस्ताव",
    accepted_deals: "स्वीकृत सौदे",
    total_bids_value: "कुल बोलियों का मूल्य",
    awaiting_confirmation: "आपकी स्वीकृति की प्रतीक्षा में",
    locked_rate: "गारंटीशुदा दर पर सुरक्षित",
    across_lots: "सक्रिय लॉट्स पर",
    btn_accept_deal: "प्रस्ताव स्वीकारें व सौदा पक्का करें",
    btn_decline: "अस्वीकार / रद्द करें",
    btn_rate_buyer: "खरीदार की समीक्षा करें",

    // Smart Freight
    freight_sub: "किसान स्मार्ट ढुलाई पूलिंग",
    freight_title: "स्मार्ट फ्रेट व साझा वाहन ढुलाई",
    freight_desc: "आस-पास के किसानों के साथ वाहन साझा कर परिवहन खर्च में 55% तक की बचत करें।",
    solo_cost: "व्यक्तिगत वाहन लागत",
    pooled_fare: "साझा रूट लागत",
    est_savings: "अनुमानित कुल बचत",
    book_freight: "ढुलाई समूह से जुड़ें",

    // Digital Tokens & Gate Pass
    tokens_sub: "मंडी प्रवेश पास",
    tokens_title: "डिजिटल मंडी टोकन व फास्ट-ट्रैक गेट पास",
    tokens_desc: "ट्रक कतारों में लगने के बजाय डिजिटल QR टोकन पाएं और सीधे समय पर प्रवेश करें।",
    token_no: "टोकन संख्या",
    assigned_counter: "आवंटित तौल कांटा",
    est_wait: "अनुमानित प्रतीक्षा समय",
    btn_show_qr: "QR गेट पास दिखाएं",

    // AI Scanner Modal
    scanner_title: "AI कंप्यूटर विजन गुणवत्ता निरीक्षक",
    scanner_sub: "लाइव फोटो स्कैनिंग, सतह दाग विश्लेषण और एगमार्क ग्रेडिंग",
    tab_samples: "प्रमाणित नमूना गैलरी",
    tab_upload: "फसल की फोटो अपलोड करें",
    tab_camera: "लाइव कैमरा स्कैनर",
    detecting_features: "फल और गुणवत्ता की जांच जारी है...",
    surface_integrity: "सतह स्वच्छता",
    color_uniformity: "रंग एकरूपता",
    size_symmetry: "आकार समरूपता",
    inferred_moisture: "अनुमानित नमी",
    btn_apply_grade: "यह ग्रेड लॉट पर लागू करें",

    // Language Selector
    language: "भाषा",
    english: "English",
    marathi: "मराठी",
    hindi: "हिंदी",

    // AI Real-Time Queue Detection & CCTV Vision
    queue_vision_title: "AI रियल-टाइम कतार पहचान व मंडी CCTV",
    queue_vision_sub: "कंप्यूटर विजन वाहन पहचान, ट्रैक्टर गणना, कतार घनत्व और स्मार्ट तौल कांटा लोड बैलेंसिंग",
    queue_cctv_feeds: "मंडी लाइव CCTV कैमरे",
    detected_vehicles: "पहचाने गए वाहन",
    queue_density: "कतार घनत्व",
    congestion_status: "कतार स्थिति",
    smart_routing_title: "AI तौल कांटा लोड बैलेंसिंग",
    btn_open_queue_vision: "AI कतार विजन मॉनिटर खोलें",
    btn_cctv_scan: "लाइव CCTV कतार जांच",
    tractors_in_lane: "लेन में ट्रैक्टर",
    trucks_in_lane: "भारी ट्रक",
    tempos_in_lane: "पिकअप / टेम्पो",
    farmers_waiting: "प्रतीक्षारत किसान",
    lane_distance: "कतार की लंबाई",
    btn_overflow_weighbridge: "अतिरिक्त तौल कांटा #4 सक्रिय करें",
    btn_reroute_tractors: "कांटा लोड स्वचालित संतुलित करें",

    // SMS & App Notifications
    nav_sms_alerts: "SMS व सूचनाएं",
    nav_send_sms: "SMS भेजें",
    notif_center_title: "मंडी अलर्ट व ऐप नोटिफिकेशन",
    notif_tab_all: "सभी अलर्ट",
    notif_tab_app: "ऐप नोटिफिकेशन",
    notif_tab_sms: "SMS (मोबाइल संदेश)",
    notif_tab_whatsapp: "व्हाट्सएप",
    btn_send_custom_sms: "SMS / ऐप अलर्ट भेजें",
    btn_mark_all_read: "सभी को पढ़ा हुआ चिह्नित करें",
    no_notifications: "फिलहाल कोई सूचना नहीं है।",
    sms_dispatcher_title: "त्वरित SMS व ऐप नोटिफिकेशन भेजें",
    sms_dispatcher_sub: "सरकारी DLT प्रमाणित SMS, ऐप पुश व व्हाट्सएप संदेश प्रणाली",
    label_channel: "माध्यम चुनें",
    label_phone: "प्राप्तकर्ता मोबाइल नंबर",
    label_template: "संदेश का प्रकार / टेम्पलेट",
    label_custom_text: "संदेश का विवरण",
    btn_send_now: "अभी अलर्ट भेजें"
  }
};

