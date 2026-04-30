-- ==============================================================
-- SEED: 100 Users, 100 Stores (10 catégories), 3000 Items
-- Catégories: Restaurant, Shopping, Services, Santé, Éducation,
--             Auto, Immobilier, Beauté, Sport, Informatique
-- ==============================================================

DO $$
DECLARE
  prenom_lat TEXT[] := ARRAY[
    'Mohamed','Ahmed','Ali','Omar','Youssef','Ibrahim','Khaled','Sami','Rami','Tarek',
    'Fatma','Mariem','Sara','Aya','Nour','Leila','Hend','Salma','Dina','Rana'
  ];
  nom_lat    TEXT[] := ARRAY[
    'Ben Ali','Trabelsi','Mansouri','Gharbi','Jerbi','Sfaxi','Tounsi','Hamdi','Miled','Chaabani',
    'Bouazizi','Dabbabi','Ferchichi','Ayari','Mejri','Riahi','Jebali','Khelifi','Amamou','Dridi'
  ];

  -- 10 thèmes de magasins (mappés vers les 3 enums store_category)
  theme_names TEXT[] := ARRAY[
    'Restaurant','Shopping','Services','Santé','Éducation',
    'Auto','Immobilier','Beauté','Sport','Informatique'
  ];
  -- Mapping theme → store_category enum
  theme_to_cat TEXT[] := ARRAY[
    'RESTAURANT','RETAIL','SERVICE','SERVICE','SERVICE',
    'RETAIL','RETAIL','SERVICE','SERVICE','RETAIL'
  ];
  -- Mapping theme → item_type
  theme_to_type TEXT[] := ARRAY[
    'PRODUCT','PRODUCT','SERVICE','SERVICE','SERVICE',
    'PRODUCT','PRODUCT','SERVICE','SERVICE','PRODUCT'
  ];

  -- Store name prefixes per theme
  sname TEXT[][] := ARRAY[
    ARRAY['Resto Tounsi','Mat3am El Baraka','Cuisine Sfaxiya','Gourmet Medina','Dar El Mekla','El Kouzina','Ftour w 3cha','Mta3 Dar','Tajin House','Chef Tounsi'],
    ARRAY['Souk Modern','Boutik Medina','Hanout El 7ouma','Centre Achat','Bazar Tounsi','Mall Express','Market Plus','Shopping Jerbi','Dukkan 3asri','Galleria TN'],
    ARRAY['Khidmet Pro','Service Express','Isla7at 3amma','Fix It Tounsi','7aloul Sari3a','Multi Services','Khidma Mdhmouna','Pro Assist','Service 24/7','Khedma W Amena'],
    ARRAY['Clinique Nour','Centre Medical','Pharmacie Hayat','Sante Plus','Docteur 3ala Toul','Labo Analyses','Cabinet Tounsi','Ophtalmo Express','Dentiste Pro','Kinesitherapie TN'],
    ARRAY['Academie Najeh','Centre Drous','Prof Khoussoussi','Ecole Ibda3','Ta3lim Plus','Madrasa Online','Cours Express','Formation Pro','Maktaba Tounsi','Campus TN'],
    ARRAY['Garage Tounsi','Auto Service','Mekanik Express','Pneu Center','Car Wash Pro','Lavage Express','Pieces Auto TN','Carrosserie Pro','Vidange Express','Moto Service'],
    ARRAY['Dar Lil Bay3','Agence Saken','Immobilier TN','Kri w Bey3','Bureau Immo','Aker Tounsi','Sakan Jadid','Villa Express','Chikka Lil Kra','Terrain Plus'],
    ARRAY['Salon Zina','Beauty Center','Spa Hammam','Institut Jamel','Coiffure Stars','Nail Art TN','Barbershop Pro','Esthétique TN','Hair Studio','Soin Express'],
    ARRAY['Salle Fitness','Gym Tounsi','Club Sport','Yoga Center','CrossFit TN','Piscine Olympic','Dojo Martial','Tennis Academy','Football Club','Run Academy'],
    ARRAY['TechStore TN','Informatique Pro','PC Doctor','Phone Repair','Data Center','Web Agency','Dev Studio','IT Solutions','Cyber Cafe','Gaming Zone']
  ];

  -- Items per theme: [ar_name, lat_name] × 10 per theme
  -- Theme 1: Restaurant
  r1_ar TEXT[] := ARRAY['كسكسي بالعلوش','لبلابي صفاقسي','شوربة فريك','سلطة مشوية','بريك دنوني','شكشوكة بالمرقاز','كفتاجي','طاجين مرقة','مقرونة بالصلصة','ملاوي بالعسل'];
  r1_lt TEXT[] := ARRAY['Kosksi bel 3louch','Lablabi Sfaxsi','Chorba frik','Salata mechweya','Brik Dnouni','Chakchouka bel mergez','Kaftaji','Tajin mar9a','Magroun bel salsa','Mlawi bel 3sal'];
  -- Theme 2: Shopping
  r2_ar TEXT[] := ARRAY['جبة تونسية تقليدية','شاشية حمراء','زيت زيتون صفاقسي','تمر دقلة النور','حلي فضة جربي','فوطة حمام','سجادة قيروانية','هاريسة تونسية','عسل جبلي','صابون بلدي بالغار'];
  r2_lt TEXT[] := ARRAY['Jebba Tounsiya','Chachia 7amra','Zit Zitoun Sfaxsi','Tmar Deglet Nour','7elli Fadhdha Jerbi','Fouta 7ammam','Sejjada 9irwaniya','Harissa Tounsiya','3sal jebli','Saboun beldi bel ghar'];
  -- Theme 3: Services
  r3_ar TEXT[] := ARRAY['تنظيف منازل عميق','نقل أثاث','إصلاح تكييف','سباكة وتمديدات','دهان وديكور','تركيب أثاث','كهربائي منازل','تنظيف سجاد','حدائق وتنسيق','حراسة أمنية'];
  r3_lt TEXT[] := ARRAY['Tndhif manazil 3mi9','Na9l athath','Isla7 takyif','Sbekka w tamdidèt','Dhan w decor','Tarkib athath','Kahrabaji manazil','Tndhif sejjad','7adaye9 w tansi9','7irasa amniya'];
  -- Theme 4: Santé
  r4_ar TEXT[] := ARRAY['فحص عام شامل','تنظيف أسنان','فحص نظر','تحليل دم شامل','علاج طبيعي','جلسة علاج نفسي','أشعة سينية','فحص قلب','تلقيح أطفال','إستشارة تغذية'];
  r4_lt TEXT[] := ARRAY['Fa7s 3am chamel','Tndhif asnen','Fa7s nadhar','Ta7lil dam chamel','3ilaj tbi3i','Jalsa 3ilaj nafsi','Ach3a siniya','Fa7s 9alb','Tel9i7 atfal','Istichara taghdhiya'];
  -- Theme 5: Éducation
  r5_ar TEXT[] := ARRAY['دروس رياضيات باكالوريا','دروس فرنسية خصوصية','دروس إنجليزية محادثة','دروس فيزياء','تحضير مناظرة سيزيام','دروس عربية','دروس معلوماتية','تحفيظ قرآن','دروس موسيقى بيانو','دروس رسم وفنون'];
  r5_lt TEXT[] := ARRAY['Drous riadhiyat bac','Drous fransawiya khsoussiya','Drous ingliziya mo7adatha','Drous fiziya','Ta7dhir mounadhra siziam','Drous 3arabiya','Drous ma3loumatiya','Ta7fidh 9oran','Drous mousi9a piano','Drous rasm w fnoun'];
  -- Theme 6: Auto
  r6_ar TEXT[] := ARRAY['تغيير زيت محرك','تبديل فرامل','فحص تقني شامل','تغيير إطارات','غسيل سيارة كامل','تلميع وتشميع','تبديل بطارية','إصلاح مكيف سيارة','برمجة مفاتيح','تبديل فلتر هواء'];
  r6_lt TEXT[] := ARRAY['Taghyir zit mo7arrek','Tabdil framel','Fa7s ta9ni chamel','Taghyir itarat','Ghsil sayara kamel','Talmi3 w tachmia','Tabdil battariya','Isla7 mkayyef sayara','Barmjit mfati7','Tabdil filtr hawa'];
  -- Theme 7: Immobilier
  r7_ar TEXT[] := ARRAY['شقة للكراء وسط المدينة','منزل عربي للبيع','فيلا مع مسبح','أرض فلاحية','محل تجاري للكراء','مكتب مؤثث','ستوديو مفروش','دوبلاكس جديد','شقة أمام البحر','غرفة مفروشة للطلبة'];
  r7_lt TEXT[] := ARRAY['Cho99a lel kra west medina','Manzil 3arbi lel bay3','Villa m3a masba7','Ardh fla7iya','Ma7al tijari lel kra','Maktab moathath','Studio mafrouch','Duplax jdid','Cho99a 9oddem el b7ar','Ghorfa mafrou cha lel tlaba'];
  -- Theme 8: Beauté
  r8_ar TEXT[] := ARRAY['قص شعر رجالي كلاسيك','تسريحة عروسة تونسية','صبغة شعر أومبري','حمام تقليدي تونسي','مانيكير جل','ليزر إزالة شعر','تنظيف بشرة عميق','مساج استرخاء','تمديد رموش','علاج كيراتين'];
  r8_lt TEXT[] := ARRAY['9ass ch3ar rijali classic','Tasri7a 3roussa tounsiya','Sebgha ch3ar ombre','7ammam ta9lidi tounsi','Manikir gel','Laser izelet ch3ar','Tndhif bachra 3mi9','Massaj istirkha','Tamdid rmouch','3ilaj keratine'];
  -- Theme 9: Sport
  r9_ar TEXT[] := ARRAY['اشتراك شهري صالة رياضة','حصة يوغا','حصة كروس فيت','تدريب شخصي','دروس سباحة','دروس فنون قتالية','حصة بيلاتس','دروس تنس','اشتراك مسبح','حصة زومبا'];
  r9_lt TEXT[] := ARRAY['Ichtirak chahri salle sport','7issa yoga','7issa CrossFit','Tadrib chakhsi','Drous sba7a','Drous fnoun 9italiya','7issa Pilates','Drous tennis','Ichtirak masba7','7issa Zumba'];
  -- Theme 10: Informatique
  r10_ar TEXT[] := ARRAY['لابتوب HP ProBook','هاتف سامسونج A54','شاشة كمبيوتر 27 بوصة','طابعة ليزر','كاميرا مراقبة واي فاي','راوتر 4G','هارد ديسك خارجي 1TB','كيبورد ميكانيكي','ماوس قيمينق','سماعات بلوتوث'];
  r10_lt TEXT[] := ARRAY['Laptop HP ProBook','Hatif Samsung A54','Chacha PC 27 pouces','Tabe3a laser','Camera moura9ba WiFi','Router 4G','Hard disk khariji 1TB','Keyboard mikaniki','Mouse gaming','Sama3at Bluetooth'];

  -- Images par thème
  imgs TEXT[][] := ARRAY[
    ARRAY['https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400','https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400','https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400','https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400','https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400'],
    ARRAY['https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400','https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400','https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400','https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400','https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400'],
    ARRAY['https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400','https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400','https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400','https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400','https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400'],
    ARRAY['https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400','https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400','https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=400','https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=400','https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400'],
    ARRAY['https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400','https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400','https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=400','https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?w=400','https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=400'],
    ARRAY['https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400','https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400','https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=400','https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400','https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=400'],
    ARRAY['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400','https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400','https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400','https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400','https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400'],
    ARRAY['https://images.unsplash.com/photo-1560066984-138daaa0a1fd?w=400','https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400','https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=400','https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400','https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400'],
    ARRAY['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400','https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400','https://images.unsplash.com/photo-1576678927484-cc907957088c?w=400','https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400','https://images.unsplash.com/photo-1461896836934-bd45ba688f34?w=400'],
    ARRAY['https://images.unsplash.com/photo-1518770660439-4636190af475?w=400','https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400','https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400','https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400','https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400']
  ];

  villes TEXT[] := ARRAY[
    'Tunis','Sfax','Sousse','Gabes','Bizerte','Kairouan','Nabeul','Monastir','Gafsa','Sidi Bouzid',
    'Beja','Jendouba','Medenine','Tataouine','Kebili'
  ];
  villes_lat NUMERIC[] := ARRAY[
    36.8065,34.7397,35.8256,33.8816,37.2744,35.6781,36.4513,35.7643,34.4311,35.0381,
    36.7332,36.5011,33.3549,32.9211,33.7044
  ];
  villes_lon NUMERIC[] := ARRAY[
    10.1815,10.7597,10.6369,10.0982,9.8741,10.0963,10.7374,10.8113,8.7842,9.4850,
    9.1814,8.7758,10.5055,10.0920,8.9707
  ];

  price_units_product TEXT[] := ARRAY['unit','unit','unit','unit','unit'];
  price_units_service TEXT[] := ARRAY['session','hour','session','hour','session'];
  variants TEXT[] := ARRAY[
    '',' - Premium',' - Classique',' - Spécial',' - Promo',' - VIP',' - Express',' - Luxe',' - Familial',' - Économique',
    ' - XL',' - Mini',' - Pro',' - Standard',' - Deluxe',' - Gold',' - Silver',' - Bronze',' - Original',' - Nouveau',
    ' - Traditionnel',' - Moderne',' - Exclusif',' - Limited',' - Signature',' - Basic',' - Plus',' - Ultra',' - Mega',' - Super'
  ];

  i INT; j INT; t INT; jmod INT;
  user_uuid UUID; store_id_val INT;
  vIdx INT; cat TEXT; itype TEXT;
  n_ar TEXT; n_lt TEXT; img TEXT; punit TEXT; pr NUMERIC;
  slug_val TEXT; sn TEXT;
BEGIN

  RAISE NOTICE 'SEED START: 100 users, 100 stores, 3000 items (10 catégories)';

  FOR i IN 1..100 LOOP
    user_uuid := gen_random_uuid();
    t := 1 + ((i-1) % 10); -- theme 1..10
    vIdx := 1 + ((i-1) % array_length(villes,1));
    cat := theme_to_cat[t];
    itype := theme_to_type[t];

    -- Insert into auth.users first to satisfy foreign key constraint
    -- This assumes a basic auth.users table with at least an 'id' column.
    -- If your auth.users table has more required fields, you'll need to adjust this INSERT statement.
    BEGIN
      INSERT INTO auth.users (id, email, created_at, updated_at)
      VALUES (
        user_uuid,
        'seed.auth.user' || i || '@ro2ya.tn',
        NOW() - (random()*INTERVAL '180 days'), NOW()
      ) ON CONFLICT (id) DO NOTHING;
    EXCEPTION WHEN undefined_table THEN
      RAISE NOTICE 'Table auth.users not found. Skipping auth.users insert.';
    END;

    -- Insert user into public.users
    INSERT INTO public.users (id, email, full_name, role, avatar_url, city, phone, created_at, updated_at)
    VALUES (
      user_uuid,
      'seed.user' || i || '@ro2ya.tn',
      prenom_lat[1+((i-1) % 20)] || ' ' || nom_lat[1+((i-1) % 20)],
      'BUSINESS_OWNER',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=' || i,
      villes[vIdx],
      '+216 ' || (20000000 + i*97)::TEXT,
      NOW() - (random()*INTERVAL '180 days'), NOW()
    ) ON CONFLICT (id) DO NOTHING;

    -- Store name from theme
    sn := sname[t][1 + ((i-1)/10 % 10)];

    -- Insert store
    INSERT INTO public.stores (
      owner_id, name, description, category, status,
      address, city, latitude, longitude, phone, email,
      logo_url, banner_url, slug, created_at, updated_at
    ) VALUES (
      user_uuid,
      sn || ' ' || i,
      'متجر متخصص — جودة عالية وخدمة ممتازة — ' || theme_names[t],
      cat::store_category, 'ACTIVE'::store_status,
      (i*7)::TEXT || ' Rue ' || nom_lat[1+((i-1) % 20)],
      villes[vIdx],
      villes_lat[vIdx] + (random()*0.05-0.025),
      villes_lon[vIdx] + (random()*0.05-0.025),
      '+216 ' || (70000000 + i*83)::TEXT,
      'store' || i || '@ro2ya.tn',
      'https://api.dicebear.com/7.x/initials/svg?seed=store' || i,
      imgs[t][1 + ((i-1) % 5)],
      'store-' || i || '-' || t,
      NOW() - (random()*INTERVAL '90 days'), NOW()
    ) RETURNING id INTO store_id_val;

    -- 30 items per store (3000 total)
    FOR j IN 1..30 LOOP
      jmod := 1 + ((j-1) % 10); -- cycle through 10 base names
      -- Pick item name by theme
      CASE t
        WHEN 1 THEN n_ar:=r1_ar[jmod]; n_lt:=r1_lt[jmod];
        WHEN 2 THEN n_ar:=r2_ar[jmod]; n_lt:=r2_lt[jmod];
        WHEN 3 THEN n_ar:=r3_ar[jmod]; n_lt:=r3_lt[jmod];
        WHEN 4 THEN n_ar:=r4_ar[jmod]; n_lt:=r4_lt[jmod];
        WHEN 5 THEN n_ar:=r5_ar[jmod]; n_lt:=r5_lt[jmod];
        WHEN 6 THEN n_ar:=r6_ar[jmod]; n_lt:=r6_lt[jmod];
        WHEN 7 THEN n_ar:=r7_ar[jmod]; n_lt:=r7_lt[jmod];
        WHEN 8 THEN n_ar:=r8_ar[jmod]; n_lt:=r8_lt[jmod];
        WHEN 9 THEN n_ar:=r9_ar[jmod]; n_lt:=r9_lt[jmod];
        WHEN 10 THEN n_ar:=r10_ar[jmod]; n_lt:=r10_lt[jmod];
      END CASE;
      -- Add variant suffix to make names unique
      n_lt := n_lt || variants[j];
      n_ar := n_ar || variants[j];

      img := imgs[t][1 + ((j-1) % 5)];
      IF itype = 'SERVICE' THEN
        punit := price_units_service[1+((j-1) % 5)];
        pr := (RANDOM()*80+20)::NUMERIC(10,3);
      ELSE
        punit := 'unit';
        pr := (RANDOM()*200+5)::NUMERIC(10,3);
      END IF;

      slug_val := LOWER(REGEXP_REPLACE(n_lt,'[^a-zA-Z0-9]','-','g')) || '-' || store_id_val || '-' || j;

      INSERT INTO public.items (
        store_id, name, description, item_type, status,
        price, price_unit, main_image, stock_quantity,
        is_bookable, duration_minutes, slug,
        rating_average, total_reviews, view_count, order_count,
        created_at, updated_at
      ) VALUES (
        store_id_val,
        n_lt || ' (' || n_ar || ')',
        'جودة عالية — ' || n_ar || ' — ' || theme_names[t] || ' — سعر معقول',
        itype::item_type, 'AVAILABLE'::item_status,
        pr, punit, img,
        CASE WHEN itype='PRODUCT' THEN (RANDOM()*50+1)::INT ELSE NULL END,
        itype='SERVICE',
        CASE WHEN itype='SERVICE' THEN (ARRAY[30,45,60,90,120])[1+((j-1)%5)] ELSE NULL END,
        slug_val,
        ROUND((RANDOM()*1.5+3.5)::NUMERIC,1),
        (RANDOM()*200)::INT, (RANDOM()*1000)::INT, (RANDOM()*100)::INT,
        NOW()-(random()*INTERVAL '60 days'), NOW()
      );
    END LOOP;

    IF i % 10 = 0 THEN
      RAISE NOTICE 'Progress: %/100 stores créés', i;
    END IF;
  END LOOP;

  RAISE NOTICE 'SEED TERMINÉ: 100 users, 100 stores, 3000 items (10 catégories)';
END $$;
