/**
 * karakter2Renderer.js - Bağımsız 2.5D Karakter 2 İskeletsel Render Orkestratörü
 * Bu dosya modüler mimariye ayrılmıştır:
 * - public/js/renderers/k2/k2Fx.js    : Partikül, Ayak İzi, Sigara & Duman FX
 * - public/js/renderers/k2/k2Limbs.js : Kollar, Eller, Bacaklar & Oturma Pozları
 * - public/js/renderers/k2/k2Torso.js : Gövde, Streetwear T-Shirt, Elbise/Etek & Kedi Kostümü
 * - public/js/renderers/k2/k2Head.js  : Kafa, Saç Modelleri, Sakallar & İfadeler
 */

/**
 * karakter2Renderer.js - Bütünsel 8-Yönlü İzometrik Karakter Motoru (Karakter 2)
 * 
 * MODEL: 'karakter_2'
 * 
 * YENİ MİMARİ & GELİŞTİRMELER:
 * 1. 8 Yönlü Bütünsel İzometrik Tasarım (3D Hissiyatı):
 *    - Karakter parçalanmış çubuklar/kemikler yerine yöne göre 3D derinlik kazanan bir bütün olarak çizilir.
 *    - Sağa/sola ve 4 çapraza (down-right, down-left, up-right, up-left) dönüldüğünde gövde ve omuzlar kafayla
 *      birlikte 3/4 izometrik açıya döner; kafa asla gövdeden bağımsız ters dönmez!
 * 2. Karakter 1 Tarzı Zıt Fazlı Yürüyüş Sarkacı (Counter-Phase Swing):
 *    - Sol bacak öne adım attığında sağ kol öne, sol kol arkaya salınır.
 *    - Sağ bacak öne adım attığında sol kol öne, sağ kol arkaya salınır.
 *    - Kollar hareket yönü ekseninde (ileri-geri) doğal bir sarkaç açısıyla salınır.
 * 3. Derinlik Katmanlaması (Far / Near Layering):
 *    - Yana ve çapraza bakarken arka kol ve arka bacak gövdenin arkasında (Far layer) adımlar.
 *    - Ön kol ve ön bacak gövdenin önünde (Near layer) adımlar; kopuk çizgiler tamamen yok edilmiştir.
 * 4. Sempatik & Canlı Dinamikler (Chibi-Streetwear):
 *    - Adım atarken kalça ve gövdede tatlı bir dikey yaylanma (bounce).
 *    - Canlı göz kırpma (blinking) mikro-animasyonu.
 *    - Pofuduk kargo jogger, düşük omuzlu oversize streetwear t-shirt ve chunky platform sneaker silueti.
 */

(function (global) {
    'use strict';

    class Karakter2Renderer {
        static spriteSheetImage = null;
        static spriteAtlasData = null;
        static playerMotionStates = new Map();
        static footstepParticles = [];
        static k2AshParticles = [];
        static groundCracks = [];

        /**
         * 4. ADIM: Oyuncu Hareket, Dönüş ve İniş Dinamikleri Motoru
         * (Inertia Smoothing, Turn Smoothing & Landing Cushion)
         */

        static loadSpriteSheet(imageSrc, atlasJson = null) {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
                Karakter2Renderer.spriteSheetImage = img;
                Karakter2Renderer.spriteAtlasData = atlasJson;
            };
            img.src = imageSrc;
        }

        /**
         * Zemin Yumuşak Elips Gölgesi (İniş Yaylanması ve Adım Şokuna Göre Esner)
         */

        static drawSkeletalAvatar(ctx, pX, pY, p, facing = 'down', isSitting = false, legSwing = 0, playerWalkCycle = 0, isMoving = false, isPreview = false, legFilter = 'all') {
            facing = (typeof normalize8WayFacing === 'function') ? normalize8WayFacing(facing) : (facing || 'down');
            const outfitId = (p && (p.outfit || p.color)) || '';
            const shirtId = (p && (p.shirt || p.color)) || '';
            const pantsId = (p && p.pants) || '';
            const shoesId = (p && p.shoes) || '';

            const isK2CyberDress = (outfitId === 'dress_k2_cyber_street' || shirtId === 'dress_k2_cyber_street');
            const isK2GothDress = (outfitId === 'dress_k2_goth_grunge' || shirtId === 'dress_k2_goth_grunge');
            const isK2CyberCrop = (shirtId === 'top_k2_cyber_crop' || shirtId === 'tshirts_top_k2_cyber_crop');
            const isK2GrungeOversize = (shirtId === 'top_k2_grunge_oversize' || shirtId === 'tshirts_top_k2_grunge_oversize');
            const isK2PastelHoodie = (shirtId === 'top_k2_pastel_hoodie' || shirtId === 'tshirts_top_k2_pastel_hoodie');
            const isK2UrbanHoodie = (shirtId === 'top_k2_urban_hoodie' || shirtId === 'tshirts_top_k2_urban_hoodie' || shirtId === 'top_k2_hoodie' || shirtId === 'tshirts_top_k2_hoodie');

            const isK2CargoMini = (pantsId === 'pants_k2_cargo_mini' || pantsId === 'pants_pants_k2_cargo_mini');
            const isK2FlaredJeans = (pantsId === 'pants_k2_flared_jeans' || pantsId === 'pants_pants_k2_flared_jeans');
            const isK2GothFishnet = (pantsId === 'pants_k2_goth_fishnet' || pantsId === 'pants_pants_k2_goth_fishnet');
            const isK2ParachuteCargo = (pantsId === 'pants_k2_parachute_cargo' || pantsId === 'pants_pants_k2_parachute_cargo');
            const isK2WideLegDenim = (pantsId === 'pants_k2_wide_leg_denim' || pantsId === 'pants_pants_k2_wide_leg_denim');
            const isK2LowRiseFlare = (pantsId === 'pants_k2_low_rise_flare' || pantsId === 'pants_pants_k2_low_rise_flare');
            const isK2LeatherCargo = (pantsId === 'pants_k2_leather_cargo' || pantsId === 'pants_pants_k2_leather_cargo');
            const isK2GothBoots = (shoesId === 'shoes_k2_goth_boots' || shoesId === 'shoes_shoes_k2_goth_boots');
            const isK2HighSneakers = (shoesId === 'shoes_k2_high_sneakers' || shoesId === 'shoes_shoes_k2_high_sneakers');
            const isK2NbRunner = (shoesId === 'shoes_k2_nb_runner' || shoesId === 'shoes_shoes_k2_nb_runner');

            const isK2Tuxedo = (outfitId === 'outfit_k2_tuxedo' || outfitId === 'outfits_outfit_k2_tuxedo');
            const isK2Overcoat = (outfitId === 'outfit_k2_street_overcoat' || outfitId === 'outfits_outfit_k2_street_overcoat');
            const isK2ScarletGala = (outfitId === 'dress_k2_scarlet_gala' || outfitId === 'outfits_dress_k2_scarlet_gala');
            const isK2KpopRebel = (outfitId === 'outfit_k2_kpop_rebel' || outfitId === 'outfits_outfit_k2_kpop_rebel');
            const isK2TechwearBomber = (outfitId === 'outfit_k2_techwear_bomber' || outfitId === 'outfits_outfit_k2_techwear_bomber');
            const isK2CyberChic = (outfitId === 'outfit_k2_cyber_chic' || outfitId === 'outfits_outfit_k2_cyber_chic');

            const isK2Gentleman = (outfitId === 'outfit_c2_gentleman' || outfitId === 'outfits_outfit_c2_gentleman');
            const isK2StreetCool = (outfitId === 'outfit_c2_street_cool' || outfitId === 'outfits_outfit_c2_street_cool');
            const isK2CasualPolo = (outfitId === 'outfit_c2_casual_polo' || outfitId === 'outfits_outfit_c2_casual_polo');
            const isK2FemmeChic = (outfitId === 'outfit_c2_femme_chic' || outfitId === 'outfits_outfit_c2_femme_chic');

            const isK2Y2KCrop = (shirtId === 'top_k2_y2k_butterfly_crop' || shirtId === 'tshirts_top_k2_y2k_butterfly_crop' || shirtId === 'top_k2_y2k_crop' || shirtId === 'tshirts_top_k2_y2k_crop');
            const isK2BoxyTee = (shirtId === 'top_k2_boxy_street_tee' || shirtId === 'tshirts_top_k2_boxy_street_tee' || shirtId === 'top_k2_boxy_tee' || shirtId === 'tshirts_top_k2_boxy_tee');
            const isK2CorsetBustier = (shirtId === 'top_k2_corset_bustier' || shirtId === 'tshirts_top_k2_corset_bustier');
            const isK2AsymmCutout = (shirtId === 'top_k2_asymmetric_cutout' || shirtId === 'tshirts_top_k2_asymmetric_cutout' || shirtId === 'top_k2_asymm_cutout' || shirtId === 'tshirts_top_k2_asymm_cutout');

            const isK2CatCostume = (outfitId === 'outfit_k2_cat' || outfitId === 'outfits_outfit_k2_cat' || (p && (p.costume === 'costume_cat' || p.costume === 'outfit_k2_cat')));
            const customOutfitCol = (p && ((p.outfitColor && p.outfitColor !== 'original' && p.outfitColor !== 'none') ? p.outfitColor : ((p.costumeColor && p.costumeColor !== 'original' && p.costumeColor !== 'none') ? p.costumeColor : null))) || null;
            const customShirtCol = (p && p.shirtColor && p.shirtColor !== 'original' && p.shirtColor !== 'none') ? p.shirtColor : null;
            const customPantsCol = (p && p.pantsColor && p.pantsColor !== 'original' && p.pantsColor !== 'none') ? p.pantsColor : null;

            const isDress = isK2CyberDress || isK2GothDress || isK2ScarletGala || (typeof outfitId === 'string' && outfitId.startsWith('dress_'));
            const isSkirt = isDress || isK2CargoMini || isK2KpopRebel || isK2CyberChic || (typeof outfitId === 'string' && outfitId.startsWith('skirt_'));
            const isSelf = !p || 
                (typeof window !== 'undefined' && (p === window.previewAvatar || (typeof previewAvatar !== 'undefined' && p === previewAvatar) || (typeof myAvatar !== 'undefined' && p === myAvatar) || (typeof dressingAvatar !== 'undefined' && p === dressingAvatar))) ||
                (typeof window !== 'undefined' && (window.myId && p.id === window.myId));
            const selfGender = isSelf ? ((typeof getPlayerGender === 'function') ? getPlayerGender(p) : (typeof window !== 'undefined' ? (window.myGender || window.selectedGender) : null)) : null;

            const pGender = (p && (p.gender || (p.avatar && p.avatar.gender))) || selfGender;
            const pIsFemale = (p && (p.isFemale !== undefined ? p.isFemale : (p.avatar && p.avatar.isFemale !== undefined ? p.avatar.isFemale : undefined)));

            const isExplicitMale = pGender === 'male' || pIsFemale === false;
            let isFemale = false;
            if (isExplicitMale) {
                isFemale = false;
            } else if (pGender === 'female' || pIsFemale === true) {
                isFemale = true;
            } else if (typeof isFemaleAvatar === 'function') {
                isFemale = isFemaleAvatar(p, p.color, p.hat, p.shoes);
            } else {
                isFemale = isDress || isSkirt || isK2FlaredJeans || isK2GothFishnet || isK2CyberCrop || isK2GrungeOversize || isK2PastelHoodie || isK2Y2KCrop || isK2CorsetBustier || isK2AsymmCutout || isK2LowRiseFlare || isK2ParachuteCargo || isK2WideLegDenim || isK2LeatherCargo;
            }
            const isBarefoot = (shoesId === 'none' || !shoesId);
            const skinColor = p.skinColor || "#ffd1a4";

            // Yöne Göre Simetri & Aynalama (Sol yönler kusursuz ayna)
            const isLeft = (facing === 'left' || facing === 'down-left' || facing === 'up-left');
            let effFacing = facing;
            if (facing === 'left') effFacing = 'right';
            else if (facing === 'down-left') effFacing = 'down-right';
            else if (facing === 'up-left') effFacing = 'up-right';

            const isProfile = (effFacing === 'right');
            const isBack = (effFacing === 'up' || effFacing === 'up-right');

            // Renkler
            const rawShirt = (p.shirt || p.color || '');
            const isReflectorVest = (typeof rawShirt === 'string' && rawShirt.includes('vest_reflector_'));
            let reflectorVestId = isReflectorVest ? (rawShirt.match(/vest_reflector_[a-z]+/)?.[0] || 'vest_reflector_yellow') : null;

            const isCyberTee = (p.shirt === 'k2_cyber_street' || p.color === 'k2_cyber_street');
            const isGraffitiTee = (p.shirt === 'k2_graffiti_oversize' || p.color === 'k2_graffiti_oversize');
            let teeColor = isReflectorVest ? reflectorVestId : (isGraffitiTee ? '#18181b' : (isCyberTee ? '#0f172a' : ((p.shirt && (p.shirt.startsWith('#') || p.shirt.startsWith('vest_reflector_'))) ? p.shirt : ((p.color && (p.color.startsWith('#') || String(p.color).startsWith('vest_reflector_'))) ? p.color : '#1e293b'))));
            let teeAccent = isGraffitiTee ? '#ec4899' : (isCyberTee ? '#0ea5e9' : '#38bdf8');

            if (isK2Tuxedo) {
                teeColor = '#18181b';
                teeAccent = '#ffffff';
            } else if (isK2Overcoat) {
                teeColor = '#27272a';
                teeAccent = '#18181b';
            } else if (isK2TechwearBomber) {
                teeColor = '#18181b';
                teeAccent = '#f97316';
            } else if (isK2CyberChic) {
                teeColor = '#c084fc';
                teeAccent = '#e2e8f0';
            } else if (isK2KpopRebel) {
                teeColor = '#18181b';
                teeAccent = '#3b82f6';
            } else if (isK2ScarletGala) {
                teeColor = '#dc2626';
                teeAccent = '#facc15';
            } else if (isK2Gentleman) {
                teeColor = '#334155';
                teeAccent = '#f8fafc';
            } else if (isK2StreetCool) {
                teeColor = '#0f766e';
                teeAccent = '#ffffff';
            } else if (isK2CasualPolo) {
                teeColor = '#1e3a8a';
                teeAccent = '#ffffff';
            } else if (isK2FemmeChic) {
                teeColor = '#ec4899';
                teeAccent = '#ffffff';
            } else if (isK2CyberDress) {
                teeColor = '#0ea5e9';
                teeAccent = '#ec4899';
            } else if (isK2GothDress) {
                teeColor = '#581c87';
                teeAccent = '#cbd5e1';
            } else if (isK2CyberCrop) {
                teeColor = '#06b6d4';
                teeAccent = '#f43f5e';
            } else if (isK2GrungeOversize) {
                teeColor = '#4c1d95';
                teeAccent = '#cbd5e1';
            } else if (isK2PastelHoodie) {
                teeColor = '#f472b6';
                teeAccent = '#ffffff';
            } else if (isK2Y2KCrop) {
                teeColor = '#ffffff';
                teeAccent = '#ec4899';
            } else if (isK2BoxyTee) {
                teeColor = '#18181b';
                teeAccent = '#f8fafc';
            } else if (isK2CorsetBustier) {
                teeColor = '#f8fafc';
                teeAccent = '#cbd5e1';
            } else if (isK2AsymmCutout) {
                teeColor = '#0f172a';
                teeAccent = '#38bdf8';
            }

            if (customOutfitCol) {
                teeColor = customOutfitCol;
            } else if (customShirtCol) {
                teeColor = customShirtCol;
            }

            const isK2Pants = (pantsId === 'pants_k2_tactical_jogger');
            const isSkaterPants = (pantsId === 'pants_k2_skater_cargo');
            let cargoColor = isSkaterPants ? '#3f3f46' : (isK2Pants ? '#1e293b' : ((p.pants && p.pants.startsWith('#')) ? p.pants : ((p.pants === 'pants_classic_cargo_olive') ? '#4d5d3b' : ((p.pants === 'pants_classic_jeans') ? '#2563eb' : ((p.pants === 'pants_classic_beige') ? '#d4b996' : '#334155')))));
            let pocketColor = isSkaterPants ? '#27272a' : (isK2Pants ? '#0f172a' : '#1e293b');
            if (isK2CatCostume) {
                const catCol = (customOutfitCol && customOutfitCol.startsWith('#')) ? customOutfitCol : ((p && p.color && p.color.startsWith('#')) ? p.color : '#232326');
                teeColor = catCol;
                cargoColor = catCol;
                pocketColor = catCol;
            }
            let strapColor = isSkaterPants ? '#ec4899' : (isK2Pants ? '#0ea5e9' : '#f59e0b');

            if (isK2Tuxedo) {
                cargoColor = '#18181b';
                pocketColor = '#111827';
                strapColor = '#27272a';
            } else if (isK2Overcoat) {
                cargoColor = '#27272a';
                pocketColor = '#18181b';
                strapColor = '#3f3f46';
            } else if (isK2Gentleman) {
                cargoColor = '#1e293b';
                pocketColor = '#0f172a';
                strapColor = '#334155';
            } else if (isK2StreetCool) {
                cargoColor = '#1d4ed8';
                pocketColor = '#1e40af';
                strapColor = '#0ea5e9';
            } else if (isK2CasualPolo) {
                cargoColor = '#d4b996';
                pocketColor = '#c5a078';
                strapColor = '#a8825c';
            } else if (isK2FemmeChic) {
                cargoColor = '#db2777';
                pocketColor = '#be185d';
                strapColor = '#f472b6';
            } else if (isK2ParachuteCargo) {
                cargoColor = '#d4b996';
                pocketColor = '#c5a078';
                strapColor = '#475569';
            } else if (isK2WideLegDenim) {
                cargoColor = '#0284c7';
                pocketColor = '#0369a1';
                strapColor = '#f59e0b';
            } else if (isK2LowRiseFlare) {
                cargoColor = '#1e293b';
                pocketColor = '#0f172a';
                strapColor = '#cbd5e1';
            } else if (isK2LeatherCargo) {
                cargoColor = '#18181b';
                pocketColor = '#09090b';
                strapColor = '#e2e8f0';
            } else if (isK2TechwearBomber) {
                cargoColor = '#1f2937';
                pocketColor = '#111827';
                strapColor = '#f97316';
            } else if (isK2CyberChic) {
                cargoColor = '#1e1b4b';
                pocketColor = '#0f172a';
                strapColor = '#c084fc';
            } else if (isK2FlaredJeans) {
                cargoColor = '#1d4ed8';
                pocketColor = '#1e40af';
                strapColor = '#f59e0b';
            } else if (isK2GothFishnet) {
                cargoColor = '#18181b';
                pocketColor = '#09090b';
                strapColor = '#cbd5e1';
            } else if (isK2CargoMini) {
                cargoColor = '#1e293b';
                pocketColor = '#0f172a';
                strapColor = '#0ea5e9';
            }

            if (customOutfitCol) {
                cargoColor = customOutfitCol;
            } else if (customPantsCol) {
                cargoColor = customPantsCol;
            }

            const isK2Shoes = (shoesId === 'shoes_k2_chunky_sneaker');
            const isSkateShoes = (shoesId === 'shoes_k2_skate_pro');
            let customShoesCol = (p && p.shoesColor && p.shoesColor !== 'original') ? p.shoesColor : null;
            let resolvedHighSneakerCol = customShoesCol;
            if (resolvedHighSneakerCol === 'red') resolvedHighSneakerCol = '#dc2626';
            else if (resolvedHighSneakerCol === 'navy') resolvedHighSneakerCol = '#1e3a8a';
            else if (resolvedHighSneakerCol === 'black') resolvedHighSneakerCol = '#18181b';
            const highSneakerAccent = resolvedHighSneakerCol || '#dc2626';
            let resolvedRunnerCol = customShoesCol;
            if (resolvedRunnerCol === 'grey') resolvedRunnerCol = '#64748b';
            else if (resolvedRunnerCol === 'navy') resolvedRunnerCol = '#1e3a8a';
            else if (resolvedRunnerCol === 'green') resolvedRunnerCol = '#166534';
            else if (resolvedRunnerCol === 'black') resolvedRunnerCol = '#18181b';
            const runnerAccent = resolvedRunnerCol || '#64748b';
            const sneakerColor = customShoesCol || (isK2Tuxedo ? '#09090b' : (isK2Overcoat ? '#18181b' : (isK2Gentleman ? '#0f172a' : (isK2CyberChic ? '#09090b' : (isK2TechwearBomber ? '#111827' : ((isSkateShoes || isK2Shoes) ? '#f8fafc' : (isK2GothBoots ? '#09090b' : '#ffffff')))))));

            const isBackFacing = (facing === 'up' || facing === 'up-right' || facing === 'up-left');
            const heldItem = p.heldItem || (p.hasTea ? 'cay' : 'none');
            const isFloorSitting = (p && p.action === 'sit_floor');
            if (isFloorSitting) isSitting = true;
            const isSkateboarding = (heldItem === 'k2_skateboard') && !isSitting && !isFloorSitting;
            const isWearingInvisCostume = !!(p && (p.outfit === 'costume_invisibility' || p.outfit === 'outfit_invisibility' || p.costume === 'costume_invisibility' || (p.invisibilityExpiresAt && p.invisibilityExpiresAt > Date.now())));
            const watchId = (p && p.watch) || 'none';

            const hasHeldItem = (heldItem && heldItem !== 'none');
            const isBackAccessory = (heldItem === 'sirtcantasi' || heldItem === 'gitar' || heldItem === 'baglama');
            const isHandHeldItem = hasHeldItem && !isBackAccessory && (heldItem !== 'sigara') && !isSkateboarding;
            const drawItemUnder = (isBackFacing || (heldItem === 'sirtcantasi')) && !isSkateboarding;

            // 1. Zıt Fazlı Yürüyüş ve Salınım Dinamikleri
            const now = Date.now();
            const cycle = playerWalkCycle || 0;
            let armSwing = 0;
            let legSwingAngle = 0;
            let legStep = 0;
            let bounceY = 0;
            let upperBodyLean = 0;
            let leanY = 0;
            const isSprinting = !!(p && p.isSprinting);

            // Dinamik Eylemsizlik, Dönüş Yumuşatması ve İniş Yaylanması (8-Way Dynamics Engine)
            const pId = p.id || p.socketId || p.name || 'player';
            const dynamics = isPreview
                ? { motionWeight: (isMoving ? 1.0 : 0.0), turnScaleX: 1.0, turnScaleY: 1.0, turnTilt: 0.0, landingCushionY: 0.0, landingSquashScaleY: 1.0, stateRef: null }
                : this.getPlayerMotionDynamics(pId, isMoving, facing, isLeft, now);
            const motionWeight = dynamics.motionWeight;
            const turnScaleX = dynamics.turnScaleX;
            const turnScaleY = dynamics.turnScaleY || 1.0;
            const turnTilt = dynamics.turnTilt;
            const landingCushionY = dynamics.landingCushionY;
            const landingSquashScaleY = dynamics.landingSquashScaleY;
            const mState = dynamics.stateRef;

            // Adım basma süspansiyonu (Step Touchdown Cushion: her iki adımda ayak yere bastığında minik süspansiyon)
            const walkStepCushion = (!isSitting && isMoving) ? (Math.pow(Math.sin(cycle), 2) * 0.45 * motionWeight) : 0;
            const totalCushionY = landingCushionY + walkStepCushion;

            if (isSitting) {
                armSwing = 0;
                legSwingAngle = 0;
                legStep = 0;
                bounceY = 0;
                upperBodyLean = 0;
                leanY = 0;
            } else if (isPreview) {
                armSwing = isHandHeldItem ? 0 : (Math.sin(now / 400) * 0.16);
                legSwingAngle = Math.sin(now / 400) * 0.08;
                bounceY = Math.abs(Math.sin(now / 400)) * 0.5;
                if (effFacing === 'right' || effFacing === 'down-right') {
                    upperBodyLean = Math.sin(now / 400) * 0.015;
                }
            } else {
                // Yürüyüş bileşenleri (Zıt fazlı sarkaç salınımı & Koşma Dinamikleri)
                const isSprinting = !!p.isSprinting;
                const walkArmSwing = isHandHeldItem ? 0 : (Math.sin(cycle) * (isSprinting ? 0.58 : 0.44));
                const walkLegSwing = Math.sin(cycle) * (isSprinting ? 0.48 : 0.38);
                const walkLegStep = Math.sin(cycle) * (isSprinting ? 3.6 : 2.8);
                const walkBounceY = Math.abs(Math.sin(cycle * 2)) * (isSprinting ? 1.75 : 1.3);

                let targetWalkLean = 0;
                let targetLeanY = 0;
                if (effFacing === 'right') {
                    // Koşarken ~4.0° - 4.6° öne aerodinamik eğim, yürürken ~2.2° - 2.6°
                    targetWalkLean = (isSprinting ? 0.070 : 0.038) + Math.sin(cycle * 2) * (isSprinting ? 0.012 : 0.008);
                } else if (effFacing === 'down-right') {
                    targetWalkLean = (isSprinting ? 0.046 : 0.026) + Math.sin(cycle * 2) * (isSprinting ? 0.008 : 0.005);
                    targetLeanY = isSprinting ? 0.55 : 0.3;
                } else if (effFacing === 'up-right') {
                    targetWalkLean = (isSprinting ? 0.038 : 0.022) + Math.sin(cycle * 2) * (isSprinting ? 0.007 : 0.005);
                    targetLeanY = isSprinting ? -0.55 : -0.3;
                } else if (effFacing === 'down') {
                    targetLeanY = isSprinting ? 0.95 : 0.55; // Kameraya doğru dinamik hücum
                } else if (effFacing === 'up') {
                    targetLeanY = isSprinting ? -0.80 : -0.45; // İleri doğru hücum
                }

                // 8 Yönlü Açı & Eğim Slerp Yumuşatması (Smooth Directional Lean Transition)
                let activeWalkLean = targetWalkLean;
                let activeLeanY = targetLeanY;
                if (mState) {
                    const dt = Math.min(100, Math.max(1, now - (mState.lastTime || now)));
                    if (mState.smoothWalkLean === undefined) mState.smoothWalkLean = targetWalkLean;
                    if (mState.smoothLeanY === undefined) mState.smoothLeanY = targetLeanY;

                    const leanBlend = Math.min(1.0, dt / 85); // 85ms ipeksi açı geçişi
                    mState.smoothWalkLean += (targetWalkLean - mState.smoothWalkLean) * leanBlend;
                    mState.smoothLeanY += (targetLeanY - mState.smoothLeanY) * leanBlend;

                    activeWalkLean = mState.smoothWalkLean;
                    activeLeanY = mState.smoothLeanY;
                }

                // Duruş / Bekleme bileşenleri (Doğal nefes mikro-salınımı)
                const idleArmSwing = isHandHeldItem ? 0 : (Math.sin(now / 650) * 0.04);
                const idleBounceY = Math.sin(now / 650) * 0.4;
                const idleLean = Math.sin(now / 650) * 0.004;

                // İpeksi Geçiş (Inertia Blend: 0.0 duruş <-> 1.0 tam hareket) + İniş/Adım Yaylanması
                armSwing = walkArmSwing * motionWeight + idleArmSwing * (1.0 - motionWeight);
                legSwingAngle = walkLegSwing * motionWeight;
                legStep = walkLegStep * motionWeight;
                bounceY = walkBounceY * motionWeight + idleBounceY * (1.0 - motionWeight) + totalCushionY;
                upperBodyLean = activeWalkLean * motionWeight + idleLean * (1.0 - motionWeight);
                leanY = activeLeanY * motionWeight;
            }

            // 4. ADIM: Zeminle Etkileşim & Adım Tozu (Footstep Surface Interaction)
            if (!isPreview && !isSitting && isMoving) {
                const stepCycle = Math.floor(cycle / Math.PI);
                if (mState && mState.lastStepCycle !== undefined && mState.lastStepCycle !== stepCycle) {
                    const isLeftFoot = (stepCycle % 2 === 0);
                    const groundX = (p && p.x !== undefined) ? p.x : pX;
                    const groundY = (p && p.y !== undefined) ? p.y : pY;
                    Karakter2Renderer.spawnFootstepParticle(groundX, groundY, facing, isLeftFoot, !!p.isSprinting);
                }
                if (mState) mState.lastStepCycle = stepCycle;
            }

            // 2. ADIM: "Farkındalık" ve Bekleme Mikro-Hareketleri (Idle Look-Around & Breathing)
            const charSeed = (p.id ? String(p.id).charCodeAt(0) : 0) + (p.name ? p.name.length * 89 : 137);
            const lookSeed = charSeed * 197;
            const lookInterval = 12000 + (lookSeed % 4000); // 12-16 sn bekleme ritmi
            const lookTime = (now + lookSeed) % lookInterval;
            let lookShiftX = 0;
            let lookShiftY = 0;
            let breathChestScaleX = 1.0;
            const isAfk = (p.action === 'afk');
            let sleepHeadNod = 0;

            if (isAfk) {
                // AFK Uyuklama Modülasyonu: Yavaş ve derin nefes alma + hafif öne düşen baş
                breathChestScaleX = 1.0 + (Math.sin(now / 950) * 0.024);
                sleepHeadNod = (Math.sin(now / 1100) * 0.5 + 0.5) * 1.8; // 0px - 1.8px yavaşça baş sallanması
            } else if (!isMoving && !isSitting) {
                // Nefes alıp verirken göğüs mikro-esnemesi (~2.6 saniyelik doğal döngü)
                const breathPhase = Math.sin(now / 420);
                breathChestScaleX = 1.0 + (breathPhase * 0.018); // %1.8 göğüs genişlemesi (0.35px)

                // Etrafa bakınma penceresi (1.6 saniye sürer)
                if (lookTime > lookInterval - 1600) {
                    const dt = lookTime - (lookInterval - 1600);
                    const lookCycleIdx = Math.floor((now + lookSeed) / lookInterval);
                    const lookDir = (lookCycleIdx % 2 === 0) ? 1 : -1;

                    let gazeT = 0;
                    if (dt < 400) {
                        gazeT = Math.sin((dt / 400) * (Math.PI / 2));
                    } else if (dt < 1200) {
                        gazeT = 1.0;
                    } else {
                        gazeT = Math.cos(((dt - 1200) / 400) * (Math.PI / 2));
                    }

                    lookShiftX = lookDir * gazeT * 0.75; // Maksimum 0.75px yana kayma
                    lookShiftY = -gazeT * 0.22; // Hafif meraklı yukarı bakış (-0.22px)
                }
            }

            // Canlı & Organik Göz Kırpma (Blinking) - 20 ile 30 saniye arasında değişken + Çift Kırpma (Double-Blink)
            const baseMin = isPreview ? 8000 : 20000;
            const baseRange = isPreview ? 4000 : 10000;
            const blinkInterval = baseMin + (charSeed % baseRange); // 20.0s - 30.0s arasında karaktere özel doğal ritim
            const blinkLocalTime = (now + charSeed * 173) % blinkInterval;

            // Her 4 döngüden birinde sevimli Çift Kırpma (Double-Blink: kırp - aç - kırp)
            const isDoubleBlinkCycle = (Math.floor((now + charSeed * 173) / blinkInterval) % 4 === 0);

            let blinkProgress = 0; // 0.0 (tam açık) -> 1.0 (tam kapalı)
            if (isAfk) {
                blinkProgress = 0; // AFK iken mahmur uykulu yarı açık ağır göz kapağı devrede
            } else if (isDoubleBlinkCycle) {
                // Çift kırpma (toplam 320ms)
                if (blinkLocalTime > blinkInterval - 320) {
                    const dt = blinkLocalTime - (blinkInterval - 320);
                    if (dt < 110) {
                        blinkProgress = Math.sin((dt / 110) * Math.PI);
                    } else if (dt < 200) {
                        blinkProgress = 0; // İki kırpma arası minik açılma
                    } else {
                        blinkProgress = Math.sin(((dt - 200) / 120) * Math.PI);
                    }
                }
            } else {
                // Standart yumuşak tek kırpma (130ms)
                if (blinkLocalTime > blinkInterval - 130) {
                    const dt = blinkLocalTime - (blinkInterval - 130);
                    blinkProgress = Math.sin((dt / 130) * Math.PI);
                }
            }

            // 3. ADIM: Canlı Konuşma & Chat Ağız Hareketi (Talking Mouth Animation)
            let isTalking = false;
            if (p.isSpeaking || p.isChatTalking) {
                isTalking = true;
            } else if (p.previewTalking || p.isTalking) {
                isTalking = true;
            } else if (p.lastChatTime && (now - p.lastChatTime < (p.lastChatDuration || 2800))) {
                isTalking = true;
            } else if (typeof activeChatBubbles !== 'undefined') {
                const k1 = p.id;
                const k2 = p.socketId;
                const k3 = pId;
                const k4 = (typeof myId !== 'undefined' && (p === (typeof myAvatar !== 'undefined' ? myAvatar : null) || p.id === myId) ? myId : null);
                const bubbles = (k1 && activeChatBubbles[k1]) || (k2 && activeChatBubbles[k2]) || (k3 && activeChatBubbles[k3]) || (k4 && activeChatBubbles[k4]);
                if (bubbles && bubbles.length > 0) {
                    const lastBubble = bubbles[bubbles.length - 1];
                    if (lastBubble) {
                        const bubbleCreatedAt = lastBubble.createdAt || lastBubble._seenAt || now;
                        if (!lastBubble._seenAt) lastBubble._seenAt = now;
                        const bubbleAge = now - bubbleCreatedAt;
                        const talkDuration = Math.min(4200, Math.max(1800, (lastBubble.text ? lastBubble.text.length * 75 : 2200)));
                        if (bubbleAge < talkDuration) {
                            isTalking = true;
                        }
                    }
                }
                if (!isTalking && p.name) {
                    for (const bId in activeChatBubbles) {
                        const blist = activeChatBubbles[bId];
                        if (blist && blist.length > 0) {
                            const lb = blist[blist.length - 1];
                            if (lb && lb.name === p.name) {
                                const bCreatedAt = lb.createdAt || lb._seenAt || now;
                                if (now - bCreatedAt < 2800) {
                                    isTalking = true;
                                    break;
                                }
                            }
                        }
                    }
                }
            }

            // Sigara Durumu: Karakter 2 Özel Sokak Stili Sigara Motoru (15s Periyot & Sıralı Devir Daim A/B Dumanı)
            const smokeState = (heldItem === 'sigara') ? this.getKarakter2SmokingState(p, isPreview, pX, pY, effFacing, isLeft) : null;

            // 2. Arka Plandaki El Eşyaları (Sırt Çantası, Gitar vb.)
            if (drawItemUnder && heldItem && heldItem !== 'none' && heldItem !== 'sigara') {
                const heldItemFn = (typeof drawHeldItem === 'function' ? drawHeldItem : (typeof window !== 'undefined' ? window.drawHeldItem : null));
                if (typeof heldItemFn === 'function') {
                    ctx.save();
                    ctx.translate(pX, pY);
                    const K2_SCALE = 1.11;
                    const GROUND_Y = 21.5;
                    ctx.translate(0, GROUND_Y);
                    ctx.scale(K2_SCALE, K2_SCALE);
                    ctx.translate(0, -GROUND_Y);
                    heldItemFn(ctx, 0, 0, heldItem, isPreview, facing, false, 'classic_2', p);
                    ctx.restore();
                }
            }

            // 4. 8 YÖNLÜ İZOMETRİK AVATAR ÇİZİMİ (Derinlik Katmanlaması)
            ctx.save();
            ctx.translate(pX, pY);

            // Zemin seviyesi (ayak tabanı y=21.5) etrafında %11 karizmatik streetwear boyutlandırması
            // 4. ADIM: Ani Dönüş Yumuşatması (turnScaleX + turnTilt) ve İniş Yaylanması (landingSquashScaleY)
            const K2_SCALE = 1.11;
            const GROUND_Y = 21.5;
            ctx.translate(0, GROUND_Y);
            ctx.scale((isLeft ? -K2_SCALE : K2_SCALE) * turnScaleX, K2_SCALE * landingSquashScaleY * turnScaleY);
            if (turnTilt !== 0) ctx.rotate(turnTilt);
            ctx.translate(0, -GROUND_Y);

            // 4.1 Zemin Gölgesi (İniş yaylanması ile esner)
            this.drawGroundShadow(ctx, isMoving, bounceY, totalCushionY);

            // 4.2 Yöne Göre Omuz ve Bacak Koordinatları Hesabı
            let farArm = null;
            let nearArm = null;
            let farLeg = null;
            let nearLeg = null;

            if (isSitting) {
                // Oturma Pozisyonu (3D İzometrik Derinliğe Göre Kollar)
                if (effFacing === 'down-right') {
                    // 3/4 Sağ-Aşağı Oturuş:
                    // Ön kol (sağ kol / ekran solu) uyluk üzerine doğal dökülür
                    // Arka kol (sol kol / ekran sağı) uzak omuzdan koltuk minderine/uyluğa uzanır
                    const nearShoulderX = isFemale ? -6.0 : -7.0;
                    const farShoulderX = isFemale ? 5.2 : 6.2;
                    nearArm = { x: nearShoulderX, y: -4.5, angle: 0.32, isFar: false, handPose: 'default' };
                    farArm = { x: farShoulderX, y: -6.0, angle: 0.18, isFar: true, handPose: 'default' };
                } else if (effFacing === 'right') {
                    // Profil Oturuş
                    nearArm = { x: 1.2, y: -4.5, angle: 0.35, isFar: false, handPose: 'default' };
                    farArm = { x: -1.8, y: -5.5, angle: 0.20, isFar: true, handPose: 'default' };
                } else {
                    // Tam Öne Oturuş: İki kol yanlarda bacaklara doğru dengeli durur
                    const shoulderDist = isFemale ? 7.2 : 8.4;
                    nearArm = [
                        { x: -shoulderDist, y: -4.2, angle: 0.16, isFar: false, handPose: 'default' },
                        { x: shoulderDist, y: -4.2, angle: -0.16, isFar: false, handPose: 'default' }
                    ];
                }
            } else if (effFacing === 'down') {
                // Tam Öne (Güney)
                const shoulderDist = isFemale ? 7.6 : 9.5;
                const restArmAngle = isFemale ? 0.08 : 0;
                nearArm = [
                    { x: -shoulderDist, y: -6.0 + bounceY, angle: -armSwing * 0.7 + restArmAngle, isFar: false, handPose: 'default' },
                    { x: shoulderDist, y: -6.0 + bounceY, angle: armSwing * 0.7 - restArmAngle, isFar: false, handPose: 'default' }
                ];
                farLeg = { x: -4.4, y: 7.0 + bounceY - legStep * 0.5, angle: 0 };
                nearLeg = { x: 4.4, y: 7.0 + bounceY + legStep * 0.5, angle: 0 };

            } else if (effFacing === 'down-right') {
                // 3/4 Sağ İleri (Güney-Doğu) - Doğru 3D Perspektif Katmanlaması:
                // Kameraya bakan ön taraf ekranın soludur (Sağ kol ve sağ bacak önde!)
                const nearShoulderX = isFemale ? -6.2 : -7.2;
                const farShoulderX = isFemale ? 5.4 : 6.4;
                nearArm = { x: nearShoulderX, y: -5.0 + bounceY, angle: armSwing * 0.9, isFar: false, handPose: 'default' };
                farArm = { x: farShoulderX, y: -7.0 + bounceY, angle: -armSwing * 0.9, isFar: true, handPose: 'default' };
                nearLeg = { x: -3.8, y: 7.0 + bounceY + legStep * 0.3, angle: -legSwingAngle * 0.75 };
                farLeg = { x: 3.2, y: 7.0 + bounceY - legStep * 0.3, angle: legSwingAngle * 0.75 };

            } else if (effFacing === 'right') {
                // Sağ Profil (Doğu)
                const farShoulderX = isFemale ? -1.8 : -2.2;
                const nearShoulderX = isFemale ? 1.2 : 1.6;
                farArm = { x: farShoulderX, y: -6.2 + bounceY, angle: -armSwing * 1.15, isFar: true, handPose: 'default' };
                nearArm = { x: nearShoulderX, y: -5.8 + bounceY, angle: armSwing * 1.15, isFar: false, handPose: 'default' };
                farLeg = { x: -1.8, y: 7.0 + bounceY, angle: legSwingAngle * 1.05 };
                nearLeg = { x: 1.2, y: 7.0 + bounceY, angle: -legSwingAngle * 1.05 };

            } else if (effFacing === 'up-right') {
                // 3/4 Sağ Geri (Kuzey-Doğu)
                const farShoulderX = isFemale ? -5.8 : -6.8;
                const nearShoulderX = isFemale ? 4.8 : 5.5;
                farArm = { x: farShoulderX, y: -6.5 + bounceY, angle: armSwing * 0.8, isFar: true, handPose: 'default' };
                nearArm = { x: nearShoulderX, y: -6.2 + bounceY, angle: -armSwing * 0.8, isFar: true, handPose: 'default' };
                farLeg = { x: -3.8, y: 7.0 + bounceY + legStep * 0.3, angle: -legSwingAngle * 0.7 };
                nearLeg = { x: 3.2, y: 7.0 + bounceY - legStep * 0.3, angle: legSwingAngle * 0.7 };

            } else {
                // Tam Arka (Kuzey) - Erkek Karakter 2 A-Stance Duruşu
                const shoulderDist = isFemale ? 7.6 : 9.5;
                const restArmAngle = isFemale ? 0.08 : (!isMoving ? 0.05 : 0);
                const maleStanceAngle = (!isFemale && !isMoving) ? 0.05 : 0;
                farArm = { x: shoulderDist, y: -6.0 + bounceY, angle: armSwing * 0.7 - restArmAngle, isFar: true, handPose: 'default' };
                nearArm = { x: -shoulderDist, y: -6.0 + bounceY, angle: -armSwing * 0.7 + restArmAngle, isFar: true, handPose: 'default' };
                farLeg = { x: -4.4, y: 7.0 + bounceY + legStep * 0.5, angle: -maleStanceAngle };
                nearLeg = { x: 4.4, y: 7.0 + bounceY - legStep * 0.5, angle: maleStanceAngle };
            }

            // Sigara Tutan Kolun Ayrıştırılması (Katman 8'de Kafanın Önünde Çizilir)
            let cigArm = null;
            let lighterArmShoulder = null;
            const isBackView = (effFacing === 'up' || effFacing === 'up-right');
            if (smokeState && heldItem === 'sigara') {
                if (Array.isArray(nearArm)) {
                    cigArm = nearArm[0]; // Tam önde sağ kol (ekran solu x: -9.5)
                    if (smokeState.isLighting) {
                        lighterArmShoulder = { x: nearArm[1].x, y: nearArm[1].y };
                        nearArm = null; // Zippo yakarken sol kol Katman 6'da değil, Zippo kolu olarak Katman 8'de çizilir!
                    } else {
                        nearArm = nearArm[1]; // Sol kol Katman 6'da normal salınır
                    }
                } else if (nearArm) {
                    cigArm = nearArm;
                    if (!isBackView) nearArm = null; // Katman 6'da çizilmez; Katman 8'de kafanın/çenenin önünde çizilecek!
                    if (smokeState.isLighting && farArm) {
                        lighterArmShoulder = { x: farArm.x, y: farArm.y };
                        farArm = null; // Zippo yakarken sol kol Katman 1'de değil, Zippo kolu olarak Katman 8'de çizilir!
                    }
                }

                // 4. ADIM: Boştaki Kolun Sokak Duruşu: Ayaktayken boştaki el kargo pantolon cebine girer! (Yalnızca Zippo yakılmıyorken)
                if (!isMoving && !isSitting && !smokeState.isLighting && !isFemale) {
                    if (effFacing === 'down' && nearArm) {
                        nearArm.angle = -0.28; // Sol kol kargo cebine doğru içe bükük
                        nearArm.handPose = 'pocket';
                    } else if (effFacing === 'down-right' && farArm) {
                        farArm.angle = 0.30;
                        farArm.handPose = 'pocket';
                    } else if (effFacing === 'right' && farArm) {
                        farArm.angle = 0.25;
                        farArm.handPose = 'pocket';
                    }
                }
            }



            const PIVOT_HIP_Y = 5.5 + bounceY;
            const isSleeveless = isDress || isK2CyberCrop || isK2Y2KCrop || isK2CorsetBustier || isK2AsymmCutout;

            // KATMAN 0.5: K2 Kedi Kostümü Sallanan Kuyruk (Önden / Yan Bakışta Sırtın Arkasından Çıkar)
            if (isK2CatCostume && !isBack) {
                this.drawCatTail(ctx, effFacing, isBack, isSitting, isMoving, now, cycle, customOutfitCol || teeColor);
            }

            // KATMAN 1: Arka Kol (Far Arm - Gövdenin Arkasında Salınır)
            if (farArm) {
                ctx.save();
                if (upperBodyLean !== 0 || leanY !== 0) {
                    ctx.translate(0, PIVOT_HIP_Y + leanY);
                    ctx.rotate(upperBodyLean);
                    ctx.translate(0, -PIVOT_HIP_Y);
                }
                if (Array.isArray(farArm)) {
                    for (let i = 0; i < farArm.length; i++) {
                        const a = farArm[i];
                        this.drawStreetwearArm(ctx, a.x, a.y, a.angle, teeColor, teeAccent, skinColor, isCyberTee, true, a.handPose, null, effFacing, isGraffitiTee, isFemale, isDress, isK2CyberDress, isK2GothDress, isSleeveless, watchId, isK2TechwearBomber, isK2CyberChic, isK2Tuxedo, isK2Overcoat, isK2CatCostume, isK2UrbanHoodie);
                    }
                } else {
                    this.drawStreetwearArm(ctx, farArm.x, farArm.y, farArm.angle, teeColor, teeAccent, skinColor, isCyberTee, true, farArm.handPose, null, effFacing, isGraffitiTee, isFemale, isDress, isK2CyberDress, isK2GothDress, isSleeveless, watchId, isK2TechwearBomber, isK2CyberChic, isK2Tuxedo, isK2Overcoat, isK2CatCostume, isK2UrbanHoodie);
                }
                ctx.restore();
            }

            // KATMAN 2: Bacaklar & Ayakkabılar
            if (isSitting) {
                this.drawSittingCargoLegs(ctx, effFacing, cargoColor, sneakerColor, isK2Shoes, skinColor, isFemale, isSkaterPants, isSkateShoes, isK2HighSneakers, highSneakerAccent, isK2NbRunner, runnerAccent, isSkirt, isK2GothBoots, isK2GothFishnet, isK2GothDress, isK2CyberDress, isK2CyberChic, isBarefoot);
            } else {
                // Arka Bacak (Far Leg)
                if (farLeg && (legFilter === 'all' || legFilter === 'far')) {
                    this.drawCargoLegAndShoe(ctx, farLeg.x, farLeg.y, cargoColor, pocketColor, strapColor, sneakerColor, isK2Shoes, effFacing, true, farLeg.angle || 0, isSkaterPants, isSkateShoes, isSkirt, skinColor, isK2CyberDress, isK2GothDress, isK2FlaredJeans, isK2GothFishnet, isK2GothBoots, isK2TechwearBomber, isK2CyberChic, isK2Tuxedo, isK2Overcoat, isK2ParachuteCargo, isK2WideLegDenim, isK2LowRiseFlare, isK2LeatherCargo, isK2CatCostume, isK2UrbanHoodie, isK2HighSneakers, highSneakerAccent, isK2NbRunner, runnerAccent, isBarefoot);
                }
            }

            // KATMAN 3 & 4: Pelvis ve Oversize Streetwear Tişört / Elbise Eteği ve Torso
            ctx.save();
            if (upperBodyLean !== 0 || leanY !== 0) {
                ctx.translate(0, PIVOT_HIP_Y + leanY);
                ctx.rotate(upperBodyLean);
                ctx.translate(0, -PIVOT_HIP_Y);
            }
            // KATMAN 3: Taktik Kargo Pantolon Bel / Elbise Eteği (Pelvis)
            if (isSkirt) {
                this.drawDressSkirt(ctx, 5.5 + bounceY, effFacing, isK2CyberDress, isK2GothDress, teeColor, isK2CargoMini, isK2ScarletGala, isK2KpopRebel, isK2CyberChic);
            } else {
                this.drawCargoPelvis(ctx, 5.5 + bounceY, cargoColor, pocketColor, strapColor, effFacing, isFemale, isSkaterPants, isK2CargoMini, isK2ScarletGala, isK2KpopRebel, isK2CyberChic, isK2ParachuteCargo, isK2WideLegDenim, isK2LowRiseFlare, isK2LeatherCargo);
            }

            // KATMAN 4: Oversize Streetwear Tişört / Elbise Üstü (Torso)
            this.drawStreetwearTorso(ctx, 0 + bounceY, teeColor, teeAccent, isCyberTee, effFacing, isFemale, breathChestScaleX, isGraffitiTee, isDress, isK2CyberDress, isK2GothDress, isK2CyberCrop, isK2GrungeOversize, isK2PastelHoodie, skinColor, isK2Tuxedo, isK2Overcoat, isK2ScarletGala, isK2KpopRebel, isK2TechwearBomber, isK2CyberChic, isK2Y2KCrop, isK2BoxyTee, isK2CorsetBustier, isK2AsymmCutout, isK2CatCostume, isK2UrbanHoodie);
            ctx.restore();

            // KATMAN 4.5: K2 Kedi Kostümü Sallanan Kuyruk (Arkadan Bakışta Pelvisin Üstünde / Ön Plana Çıkar)
            if (isK2CatCostume && isBack) {
                this.drawCatTail(ctx, effFacing, isBack, isSitting, isMoving, now, cycle, customOutfitCol || teeColor);
            }

            // KATMAN 5: Ön Bacak (Near Leg)
            if (!isSitting && nearLeg && (legFilter === 'all' || legFilter === 'near')) {
                this.drawCargoLegAndShoe(ctx, nearLeg.x, nearLeg.y, cargoColor, pocketColor, strapColor, sneakerColor, isK2Shoes, effFacing, false, nearLeg.angle || 0, isSkaterPants, isSkateShoes, isSkirt, skinColor, isK2CyberDress, isK2GothDress, isK2FlaredJeans, isK2GothFishnet, isK2GothBoots, isK2TechwearBomber, isK2CyberChic, isK2Tuxedo, isK2Overcoat, isK2ParachuteCargo, isK2WideLegDenim, isK2LowRiseFlare, isK2LeatherCargo, isK2CatCostume, isK2UrbanHoodie, isK2HighSneakers, highSneakerAccent, isK2NbRunner, runnerAccent, isBarefoot);
            }

            // KATMAN 6: Ön Kol (Near Arm - Gövdenin Önünde Salınır)
            if (nearArm) {
                ctx.save();
                if (upperBodyLean !== 0 || leanY !== 0) {
                    ctx.translate(0, PIVOT_HIP_Y + leanY);
                    ctx.rotate(upperBodyLean);
                    ctx.translate(0, -PIVOT_HIP_Y);
                }
                if (Array.isArray(nearArm)) {
                    for (let i = 0; i < nearArm.length; i++) {
                        const a = nearArm[i];
                        this.drawStreetwearArm(ctx, a.x, a.y, a.angle, teeColor, teeAccent, skinColor, isCyberTee, false, a.handPose, smokeState, effFacing, isGraffitiTee, isFemale, isDress, isK2CyberDress, isK2GothDress, isSleeveless, watchId, isK2TechwearBomber, isK2CyberChic, isK2Tuxedo, isK2Overcoat, isK2CatCostume, isK2UrbanHoodie);
                    }
                } else {
                    this.drawStreetwearArm(ctx, nearArm.x, nearArm.y, nearArm.angle, teeColor, teeAccent, skinColor, isCyberTee, false, nearArm.handPose, smokeState, effFacing, isGraffitiTee, isFemale, isDress, isK2CyberDress, isK2GothDress, isSleeveless, watchId, isK2TechwearBomber, isK2CyberChic, isK2Tuxedo, isK2Overcoat, isK2CatCostume, isK2UrbanHoodie);
                }
                ctx.restore();
            }

            // KATMAN 7: Kafa, Saç ve Canlı Yüz
            ctx.save();
            const headTurnOffset = (!isMoving ? (lookShiftX * 0.018) : 0);
            const sleepHeadAngle = isAfk ? ((Math.sin(now / 1150) * 0.5 + 0.5) * 0.035) : 0;
            const smokeHeadTilt = smokeState ? ((smokeState.headNodAngle || 0) + (smokeState.headTiltUp || 0)) : 0;
            if (upperBodyLean !== 0 || leanY !== 0 || headTurnOffset !== 0 || sleepHeadAngle !== 0 || smokeHeadTilt !== 0) {
                ctx.translate(0, PIVOT_HIP_Y + leanY);
                ctx.rotate(upperBodyLean + headTurnOffset + sleepHeadAngle + smokeHeadTilt);
                ctx.translate(0, -PIVOT_HIP_Y);
            }
            const headY = -17.0 + bounceY * 0.7 + sleepHeadNod;
            this.drawStreetwearHead(ctx, 0, headY, p, effFacing, isBack, isProfile, skinColor, blinkProgress, lookShiftX, lookShiftY, isTalking, teeColor, teeAccent, isGraffitiTee, isCyberTee, smokeState);
            ctx.restore();

            // KATMAN 8: Sigara Tutan Kol & El (Kafanın, Çenenin ve Boynun Önünde Çizilir - Asla İçine Girmez)
            if (cigArm && smokeState && heldItem === 'sigara' && !isBackView) {
                ctx.save();
                if (upperBodyLean !== 0 || leanY !== 0) {
                    ctx.translate(0, PIVOT_HIP_Y + leanY);
                    ctx.rotate(upperBodyLean);
                    ctx.translate(0, -PIVOT_HIP_Y);
                }
                const mouthLocalX = (effFacing === 'right' ? 5.6 : (effFacing === 'down-right' ? 1.8 : 0));
                const mouthLocalY = -17.0 + bounceY * 0.7 + sleepHeadNod + 2.3;
                Karakter2Renderer.drawStreetwearSmokingArm(
                    ctx, cigArm.x, cigArm.y, mouthLocalX, mouthLocalY,
                    smokeState.liftProgress, teeColor, teeAccent, skinColor,
                    isCyberTee, isGraffitiTee, effFacing, smokeState, isSitting, isMoving,
                    lighterArmShoulder, isSprinting
                );
                ctx.restore();
            }

            ctx.restore();

            // 5. Ön Plandaki El Eşyaları (Gövdenin önünde tutulan bardak, kadeh vb.)
            if (!drawItemUnder && heldItem && heldItem !== 'none' && heldItem !== 'sigara') {
                const heldItemFn = (typeof drawHeldItem === 'function' ? drawHeldItem : (typeof window !== 'undefined' ? window.drawHeldItem : null));
                if (typeof heldItemFn === 'function') {
                    ctx.save();
                    ctx.translate(pX, pY);
                    const K2_SCALE = 1.11;
                    const GROUND_Y = 21.5;
                    ctx.translate(0, GROUND_Y);
                    ctx.scale(K2_SCALE, K2_SCALE);
                    ctx.translate(0, -GROUND_Y);
                    heldItemFn(ctx, 0, 0, heldItem, isPreview, facing, false, 'classic_2', p);
                    ctx.restore();
                }
            }

            // 6. Alkış Kıvılcım & Çak Vuruş Efekti ✨
            if (p.action === 'clap') {
                const clapPulse = Math.abs(Math.sin(Date.now() / 95));
                if (clapPulse < 0.28) {
                    ctx.save();
                    ctx.strokeStyle = "rgba(250, 204, 21, 0.85)";
                    ctx.lineWidth = 1.4;
                    ctx.beginPath();
                    ctx.arc(pX, pY - 2.5, 5.2, 0, Math.PI * 2);
                    ctx.stroke();

                    ctx.fillStyle = "#facc15";
                    ctx.font = "bold 13px sans-serif";
                    ctx.textAlign = "center";
                    ctx.fillText("✨", pX, pY - 9);
                    ctx.restore();
                }
            }

            // 7. Dans Eden Notalar (♪ ♫)
            if (p.action === 'dance') {
                const noteY = pY - 49 - ((Date.now() / 45) % 15);
                const noteXOffset = Math.sin(Date.now() / 190) * 8;
                ctx.save();
                ctx.fillStyle = "#ec4899";
                ctx.font = "bold 13px sans-serif";
                ctx.fillText("♪ ♫", pX + 8 + noteXOffset, noteY);
                ctx.restore();
            }

            // 7.5 AFK Uyku / Uyuklama Süzülen Zzz Efekti 💤
            if (isAfk) {
                Karakter2Renderer.drawAfkSleepBubbles(ctx, pX, pY);
            }

            // 8. Karakter 2 Özel Duman Üfleme (Option A: Duman Halkaları / Option B: Hacimli Bulut)
            if (smokeState && smokeState.isExhaling) {
                Karakter2Renderer.drawK2ExhaleSmoke(ctx, pX, pY, effFacing, isLeft, smokeState, bounceY, isMoving, p, isPreview, isSprinting);
            }
            // Havada süzülen bağımsız dünya duman parçacıklarını güncelle ve çiz
            Karakter2Renderer.updateAndDrawSmokeParticles(ctx, pX, pY, p, effFacing, isPreview);

            // 8.5. Kül Çırpma Zerrecikleri (Ash Particles)
            Karakter2Renderer.updateAndDrawAshParticles(ctx);


        }

        /**
         * 9. ADIM: AFK / Uyuklama Süzülen Zzz Efekti (Pastel Blue Floating Dream Bubbles)
         */

        static draw(ctx, pX, pY, p, facing, isSitting, legSwing, playerWalkCycle, isMoving, isPreview, legFilter = 'all') {
            return this.drawSkeletalAvatar(ctx, pX, pY, p, facing, isSitting, legSwing, playerWalkCycle, isMoving, isPreview, legFilter);
        }
    }

        function attachK2Module(mod) {
        if (!mod) return;
        Object.getOwnPropertyNames(mod).forEach(name => {
            if (name !== "length" && name !== "name" && name !== "prototype") {
                Karakter2Renderer[name] = mod[name];
            }
        });
    }

    if (global.__k2Modules && Array.isArray(global.__k2Modules)) {
        global.__k2Modules.forEach(attachK2Module);
    }

    if (typeof module !== "undefined" && module.exports) {
        try {
            attachK2Module(require("./k2/k2Fx"));
            attachK2Module(require("./k2/k2Limbs"));
            attachK2Module(require("./k2/k2Torso"));
            attachK2Module(require("./k2/k2Head"));
        } catch (_) {}
        module.exports = Karakter2Renderer;
    }

    global.Karakter2Renderer = Karakter2Renderer;
    global.drawSkeletalAvatar = function (ctx, pX, pY, p, facing, isSitting, legSwing, playerWalkCycle, isMoving, isPreview, legFilter) {
        return Karakter2Renderer.drawSkeletalAvatar(ctx, pX, pY, p, facing, isSitting, legSwing, playerWalkCycle, isMoving, isPreview, legFilter);
    };
    global.getSurfaceType = function (x, y) {
        return Karakter2Renderer.getSurfaceType(x, y);
    };

    // Konsoldan veya test butonlarından Karakter 2 anında duman tetikleme
    global.triggerK2SmokeAnimation = function (targetPlayer, withLighter = false) {
        let p = targetPlayer || (typeof myAvatar !== 'undefined' ? myAvatar : null);
        if (!p) return;
        p.heldItem = 'sigara';
        p._k2SmokeAnimStart = Date.now();
        p._k2SmokePuffIndex = (p._k2SmokePuffIndex || 0) + 1;
        p._k2NextSmokeTime = Date.now() + 30000;
        p._k2AshSpawned = false;
        p._k2AudioZippoOpen = false;
        p._k2AudioZippoStrike = false;
        p._k2AudioZippoClose = false;
        p._k2AudioInhale = false;
        p._k2AudioExhale = false;
        p._k2SpawnedSmokePuffs = null;
        if (withLighter || !p._k2CigLit) {
            p._k2UseLighter = true;
            p._k2CigLit = false;
        }
    };

    // Genel triggerSmokeAnimation fonksiyonunu Karakter 2 desteğiyle genişlet
    const prevTriggerSmoke = global.triggerSmokeAnimation;
    global.triggerSmokeAnimation = function (targetPlayer, withLighter = false) {
        let p = targetPlayer || (typeof myAvatar !== 'undefined' ? myAvatar : null);
        if (p && (p.model === 'karakter_2' || (p.model && p.model.includes('karakter_2')))) {
            global.triggerK2SmokeAnimation(p, withLighter);
            return;
        }
        if (typeof prevTriggerSmoke === 'function') {
            prevTriggerSmoke(targetPlayer);
        } else if (p) {
            global.triggerK2SmokeAnimation(p, withLighter);
        }
    };

})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));

