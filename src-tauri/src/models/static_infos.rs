use std::collections::HashMap;



/// Base locale de définitions manuelles, accessibles même sans base de données
pub fn produits() -> HashMap<&'static str, &'static str> {
    HashMap::from([
        ("agave", "L’agave est une plante dont la sève est utilisée comme édulcorant naturel, à indice glycémique modéré."),
        ("ail noir", "L’ail noir est de l’ail blanc vieilli. Il a un goût doux et umami, riche en antioxydants."),
        ("argousier", "L’argousier est une baie très riche en vitamine C, antioxydants et oméga-7."),
        ("baobab", "Le baobab est riche en vitamine C et participe au bon fonctionnement immunitaire."),
        ("camerise", "La camerise est une baie riche en vitamine C, fibres et antioxydants, proche du bleuet."),
        ("chaga", "Le chaga est un champignon médicinal québécois aux propriétés antioxydantes et antivirales."),
        ("chanvre", "Le chanvre est riche en oméga-3/6 et se consomme en graines ou huile (non adaptée à la cuisson)."),
        ("chia", "Les graines de chia sont riches en oméga-3, fibres et antioxydants. Elles deviennent gélatineuses dans l’eau."),
        ("collagène", "Le collagène marin soutient les tissus conjonctifs (peau, os, tendons)."),
        ("kefir", "Le kéfir est une boisson fermentée riche en probiotiques, bonne pour le microbiote."),
        ("kombucha", "Le kombucha est un thé fermenté acidulé, bon pour l’intestin et riche en vitamines."),
        ("tempeh", "Le tempeh est un aliment fermenté à base de soja, riche en protéines végétales."),
        ("tofu", "Le tofu est un aliment à base de lait de soja caillé, riche en protéines et fer."),
        ("levain", "Le levain est une culture naturelle de levure et bactéries utilisée pour faire lever le pain."),
        ("topinambour", "Le topinambour en poudre est riche en fibres, fer et prébiotiques."),
        ("guayusa", "Le guayusa est un thé riche en caféine, utilisé comme énergisant naturel en Amérique du Sud."),
        ("goji", "Les baies de goji sont riches en antioxydants, acides aminés et vitamines B et C."),
        ("propolis", "La propolis est une substance produite par les abeilles, utilisée pour ses effets antimicrobiens et cicatrisants."),
        ("miso", "Le miso est une pâte fermentée japonaise à base de soja, riche en enzymes digestives."),
        ("chia", "Les graines de chia absorbent l’eau et sont riches en fibres, oméga-3 et antioxydants."),
        ("kombucha", "Le kombucha est une boisson fermentée à base de thé, aux propriétés probiotiques."),
        ("chanvre", "Les graines de chanvre sont riches en protéines et acides gras oméga-3 et 6."),
        ("levain", "Le levain permet une fermentation naturelle du pain grâce à des bactéries lactiques."),
        ("tempeh", "Le tempeh est un aliment fermenté à base de soja, riche en protéines et facile à cuisiner."),
        ("miel", "Le miel est un édulcorant naturel produit par les abeilles, aux propriétés antibactériennes et antioxydantes."),
        ("kamut", "Le kamut est une ancienne variété de blé riche en protéines et minéraux."),
        ("erythritol", "L’érythritol est un édulcorant naturel faible en calories, bien toléré par l’organisme."),
        ("stevia", "La stévia est un édulcorant végétal sans calorie, utilisé comme alternative au sucre."),
        ("soba", "Le soba est une nouille japonaise à base de sarrasin, riche en protéines et sans gluten."),
        ("kefir", "Le kéfir est une boisson fermentée à base de lait ou d’eau, riche en probiotiques et bénéfique pour la flore intestinale."),
        ("maca", "La maca est une racine des Andes, connue pour ses effets stimulants sur l’énergie et la fertilité."),
        ("moringa", "Le moringa est une plante très riche en vitamines et minéraux, aux propriétés antioxydantes et anti-inflammatoires."),
        ("manuka", "Le miel de Manuka, produit en Nouvelle-Zélande, est reconnu pour ses propriétés antimicrobiennes puissantes."),
        ("lin", "Les graines de lin sont riches en oméga-3 et fibres. Elles doivent être moulues pour libérer leurs bienfaits."),
        ("matcha", "Le matcha est une poudre de thé vert japonais riche en antioxydants, utilisée pour ses effets énergisants."),
        ("lampe de sel", "Une lampe de sel est une lampe décorative faite de sel de l’Himalaya, réputée pour ses bienfaits apaisants."),
        ("topinambour", "Le topinambour est une racine riche en prébiotiques et en fer, bénéfique pour le transit et l’immunité."),
        ("chocolat cru", "Le chocolat cru est fabriqué sans cuisson haute, conservant ainsi ses antioxydants naturels."),
        ("spiruline", "La spiruline est une algue bleu-vert extrêmement riche en protéines, fer et antioxydants."),
        ("épeautre", "L’épeautre est une céréale ancienne, riche en protéines et en acides aminés essentiels."),
        ("fauxmage", "Le fauxmage est un substitut végétal du fromage, souvent à base de noix ou de graines."),
        ("chimichurri", "Le chimichurri est une sauce argentine au piment, utilisée comme marinade ou condiment."),
        ("farine maltée", "La farine maltée est issue des drêches de bière, riche en fibres et au goût torréfié."),
        ("inuline", "L’inuline est une fibre prébiotique bénéfique pour la digestion et le microbiote."),
        ("houmous", "Le houmous est une tartinade méditerranéenne à base de pois chiches et de tahini."),
        ("souchet", "Le souchet, ou amande de terre, est une source de fibres et d’énergie à la saveur sucrée."),
        ("vital câlin", "Vital Câlin est une poudre de riz fermenté riche en probiotiques et enzymes digestives."),
        ("red fife", "Le Red Fife est une variété ancienne de blé rouge, prisée pour ses qualités nutritionnelles."),
        ("xylitol", "Le xylitol est un édulcorant naturel extrait du bouleau, sans sucre et bon pour les dents."),
        ("yerba maté", "Le yerba maté est une infusion sud-américaine riche en caféine et antioxydants."),
        ("tzatziki", "Le tzatziki est une sauce grecque fraîche à base de yogourt, concombre et ail."),
        ("sucre de coco", "Le sucre de coco est un édulcorant naturel issu de la sève des fleurs de cocotier, à faible indice glycémique."),
        ("sucre de panela", "La panela est un sucre non raffiné d’Amérique latine, riche en nutriments contrairement au sucre blanc."),
        ("sans gluten", "Un produit sans gluten ne contient pas de blé, seigle ou orge, idéal pour les personnes cœliaques."),
        ("sans OGM", "Un produit sans OGM n’utilise aucun ingrédient génétiquement modifié, selon les normes bio."),
        ("sans aspartame", "Un produit sans aspartame n'utilise pas cet édulcorant controversé, souvent remplacé par stévia ou xylitol."),
        ("sans allergènes", "Un produit sans allergènes exclut les 10 allergènes alimentaires majeurs comme le gluten, le lait ou les arachides."),
        ("kéto", "Le régime kéto est basé sur une alimentation riche en lipides et très faible en glucides pour induire la cétose."),
        ("végétalien", "Un aliment végétalien ne contient aucun produit d'origine animale, incluant œufs, lait et miel."),
        ("végétarien", "Un aliment végétarien ne contient pas de viande ni poisson, mais peut inclure œufs ou produits laitiers."),
        ("microbiote", "Le microbiote intestinal désigne l’ensemble des micro-organismes bénéfiques présents dans l’intestin."),
        ("écocert", "Ecocert est un label qui garantit que les produits respectent des normes écologiques strictes."),
        ("biologique", "Un produit biologique est cultivé sans pesticides de synthèse, OGM ni engrais chimiques."),
        ("équitable", "Le commerce équitable vise à mieux rémunérer les producteurs dans les pays en développement."),
        ("chocolat cru", "Le chocolat cru est fait à partir de fèves non torréfiées, conservant tous leurs nutriments."),
        ("lampe de sel", "Une lampe de sel diffuse une lumière douce et est censée réduire le stress et améliorer le sommeil."),
        ("germination", "La germination est le processus par lequel une graine devient une jeune pousse, riche en nutriments."),
        ("germoir", "Un germoir est un récipient conçu pour faire germer des graines à la maison."),
        ("pousses", "Les micropousses sont de jeunes pousses de légumes ou herbes très concentrées en nutriments."),
        ("seitan", "Le seitan est une pâte riche en protéines, fabriquée à partir de gluten de blé. C’est un substitut de viande populaire chez les végétariens."),
        ("graines à germer", "Les graines à germer se cultivent dans un germoir et offrent un concentré de vitamines et enzymes."),
        ("argousier", "L’argousier est une baie riche en vitamine C, cultivée pour ses bienfaits antioxydants."),
        ("biodégradable", "Un produit biodégradable se décompose naturellement sans polluer l’environnement."),
        ("biologique", "Un produit biologique est cultivé sans pesticides chimiques ni OGM."),
        ("camerise", "La camerise est une baie nordique riche en antioxydants, proche du bleuet."),
        ("casher", "Un aliment casher respecte les lois alimentaires juives traditionnelles."),
        ("chia", "Les graines de chia sont riches en fibres et oméga-3, utiles pour la digestion."),
        ("chimichurri", "Le chimichurri est une sauce argentine à base de persil, ail et vinaigre."),
        ("cire d’abeille", "La cire d’abeille est utilisée en cosmétique, bougies et emballages réutilisables."),
        ("collagène", "Le collagène est une protéine essentielle pour la peau, les articulations et les os."),
        ("faible en glucides", "Un produit faible en glucides contient peu de sucres et convient aux régimes cétogènes."),
        ("faible en gluten", "Contient moins de gluten, adapté aux personnes sensibles (mais pas cœliaques)."),
        ("fauxmage", "Le fauxmage est une alternative végétalienne au fromage, souvent à base de noix."),
        ("fodmaps", "Les FODMAPs sont des sucres fermentescibles pouvant causer des troubles digestifs."),
        ("germination", "La germination transforme les graines en jeunes pousses riches en nutriments."),
        ("germoir", "Un germoir est un récipient pour faire germer des graines à la maison."),
        ("graines à germer", "Les graines à germer permettent de cultiver facilement des pousses comestibles."),
        ("herbe de blé", "L’herbe de blé est une jeune pousse détoxifiante riche en chlorophylle et vitamines."),
        ("reishi", "Le reishi est un champignon médicinal reconnu pour ses effets relaxants et immunostimulants."),
        ("ashwagandha", "L’ashwagandha est une plante adaptogène utilisée pour réduire le stress et soutenir l’énergie."),
        ("curcuma", "Le curcuma est une racine aux propriétés anti-inflammatoires, souvent utilisée en cuisine et en santé."),
        ("hydromel", "L’hydromel est une boisson fermentée à base de miel, consommée depuis l’Antiquité."),
        ("amarante", "L’amarante est une pseudo-céréale riche en protéines, sans gluten."),
        ("cresson", "Le cresson est une plante aquatique très riche en vitamines A, C et K."),
        ("katsuobushi", "Le katsuobushi est du poisson séché et fermenté, utilisé dans la cuisine japonaise."),
        ("tamarin", "Le tamarin est un fruit tropical au goût acidulé, utilisé comme condiment ou laxatif doux."),
        ("caroube", "La caroube est une alternative au cacao, naturellement sucrée et sans caféine."),
        ("shiso", "Le shiso est une herbe aromatique japonaise au goût unique, utilisée en garniture ou en infusion."),
        ("non pasteurisé", "Un produit non pasteurisé n’a pas été chauffé, ce qui conserve ses bactéries bénéfiques et enzymes actives."),
    ])
}

pub fn routes() -> HashMap<String, String> {
    let mut map = HashMap::new();
    map.insert("Route 1000".to_string(), "Cette route est prévue pour le **lundi** 1999 est pour pick up.".to_string());
    map.insert("Route 2000".to_string(), "Cette route est prévue pour le **mardi** 2999 est pour pick up.".to_string());
    map.insert("Route 3000".to_string(), "Cette route est prévue pour le **mercredi** 3999 est pour pick up.".to_string());
    map.insert("Route 4000".to_string(), "Cette route est prévue pour le **jeudi** 4999 est pour pick up.".to_string());
    map.insert("Route 5000".to_string(), "Cette route est prévue pour le **vendredi** 5999 est pour pick up.".to_string());
    map
}


pub fn succes() -> HashMap<String, String> {
    let mut map = HashMap::new();
    map.insert("premier appel".to_string(), "Faire une première vente.".to_string());
    map.insert("appels en rafale".to_string(), "Réaliser 10 ventes dans la même journée.".to_string());
    map.insert("100% hit".to_string(), "Effectuer 5 ventes réussies.".to_string());
    map.insert("semaine active".to_string(), "Vendre au moins une fois pendant 5 jours consécutifs.".to_string());
    map.insert("maître télévendeur".to_string(), "Atteindre un total de 100 ventes.".to_string());
    map.insert("agent assidu".to_string(), "Vendre 3 jours dans la même semaine.".to_string());
    map.insert("trente appels".to_string(), "Atteindre 30 ventes cumulées.".to_string());
    map.insert("journée difficile".to_string(), "Aucune vente réussie dans la journée.".to_string());
    map.insert("le destin".to_string(), "Vendre à un client déjà refusé une fois avant.".to_string());
    map.insert("série de feu".to_string(), "Vendre 5 jours consécutifs.".to_string());
    map.insert("combo".to_string(), "3 ventes Hit d’affilée sans échec.".to_string());
    map
}

pub fn sanitize(text: &str) -> String {
    text
        .to_lowercase()
        .replace(['?', '.', '!', ',', ';', ':', '\n', '\r'], "") 
        .replace("’", "'")  
        .replace("é", "e")
        .replace("è", "e")
        .replace("ê", "e")
        .replace("à", "a")
        .replace("ç", "c")
}

pub fn chercher_reponse_statique(message: &str) -> Option<String> {

   

    let msg = sanitize(message);   

    let lower = msg.to_lowercase();
         
    let words: Vec<&str> = msg.split_whitespace().collect();
    
    let phrases_courtoisie = [
        ("bonjour", "👋 Bonjour à toi aussi ! Comment puis-je t’aider ?"),
        ("salut", "👋 Salut ! Dis-moi ce que tu veux savoir."),
        ("ça va", "😊 Je suis un bot, donc toujours au top ! Et toi ?"),
        ("merci beaucoup", "🙏 C’est toujours un plaisir d’aider."),
        ("merci", "🙏 Avec plaisir !"),
        ("au revoir", "👋 À bientôt !"),
        ("bye", "👋 Bye bye !"),
        ("hello", "👋 Hello ! Tu veux un renseignement ?"),
    ];

    

    for (mot, reponse) in phrases_courtoisie.iter() {
        if lower.contains(mot) {
            return Some(reponse.to_string());
        }
    }

    
    let relances = [
        ("peux-tu m'aider", "Bien sûr ! Tu veux des infos sur un produit, un événement, une route, une vente ?"),
        ("tu peux m’aider", "Avec plaisir ! Tu cherches quelque chose en particulier ? Produit, vente, événement, route ?"),
        ("aide moi", "Je suis là pour ça ! Tu as besoin d'aide sur un sujet précis ?"),
        ("oui", "Oui mais... sur quoi exactement ? Je ne lis pas encore dans les pensées 😄"),
        ("non", "Pas de souci ! Si je peux faire autre chose, n’hésite pas."),
        ("je sais pas", "Pas de problème. Tu veux que je te parle d’un produit, d’un événement ou d’une route peut-être ?"),
    ];

    for (mot, reponse) in relances.iter() {
        if lower.contains(mot) {
            return Some(reponse.to_string());
        }
    }

   
    let jours = [("lundi", "1000 à 1999 (1999 = pickup)"),
                 ("mardi", "2000 à 2999"),
                 ("mercredi", "3000 à 3999"),
                 ("jeudi", "4000 à 4999"),
                 ("vendredi", "5000 à 5999")];

    for (jour, plage) in &jours {
        if words.contains(jour) {
            return Some(format!("🛣️ Les routes du **{}** vont de {}.", jour, plage));
        }
    }

    if msg.contains("routes") && msg.contains("quelles") {
        return Some("🛣️ Répartition des routes :\n\
                     • Lundi : 1000-1999\n\
                     • Mardi : 2000-2999\n\
                     • Mercredi : 3000-3999\n\
                     • Jeudi : 4000-4999\n\
                     • Vendredi : 5000-5999".to_string());
    }

    
    for (nom, desc) in produits() {
        let cle = sanitize(&nom); 
        if words.contains(&cle.as_str()) {
            return Some(format!("📦 **{}**\n\n{}", nom, desc));
        }
    }

    if msg.contains("comment debloquer") && msg.contains("combo") {
        return Some("🏆 **Combo**\n\n3 ventes Hit d’affilée sans échec.".to_string());
    }
        
    for (nom, desc) in succes() {
        let cle = sanitize(&nom); 
        if msg.contains(&cle) {
            return Some(format!("🏆 **{}**\n\n{}", nom, desc));
        }
    }

    for (nom, desc) in routes() {
        let cle = sanitize(&nom);               
        if msg.contains(&cle) {
            return Some(format!("🛣️ **{}**\n\n{}", nom, desc));
        }
    }

    let lower = msg.to_lowercase();

    if lower.contains("bonjour") || lower.contains("salut") || lower.contains("yo") {
        return Some("👋 Bonjour à toi aussi ! Comment puis-je t’aider ?".to_string());
    }
    if lower.contains("bonjour")
        || lower.contains("salut")
        || lower.contains("yo")
        || lower.contains("coucou")
        || lower.contains("hello")
        || lower.contains("hey")
        || lower.contains("ça va")
        || lower.contains("comment tu vas")
        || lower.contains("tu vas bien")
    {
        return Some("👋 Bonjour ! Je vais très bien, et toi ? Comment puis-je t’assister aujourd’hui ?".to_string());
    }

    if lower.contains("blague") {
        let blagues = [
            "Pourquoi les devs aiment le café ? Parce que c’est le Java de la vie ☕",
            "Je suis un bot, donc mes blagues sont codées en dur ! 🤖",
            "Pourquoi le bot a été licencié ? Il manquait d’émotion… 😅",
        ];
        return Some(blagues[rand::random::<usize>() % blagues.len()].to_string());
    }

    if lower.contains("fatigué")
        || lower.contains("épuisé")
        || lower.contains("difficile")
        || lower.contains("compliqué")
        || lower.contains("marre")
        || lower.contains("j’y arrive pas")
        || lower.contains("je suis à bout")
        || lower.contains("j’en peux plus")
    {
        let boosts = [
            "🌱 Respire un bon coup, tu fais de ton mieux et c’est déjà énorme.",
            "🫶 Chaque jour compte, même les petits pas sont des avancées.",
            "☀️ Ce que tu fais a de la valeur. Prends soin de toi aussi.",
            "💚 Tu aides des gens chaque jour. Garde confiance, tu n’es pas seul(e).",
            "🌿 Même un arbre robuste a besoin de repos. Courage, ça ira mieux bientôt.",
        ];
        return Some(boosts[rand::random::<usize>() % boosts.len()].to_string());
    }

    if lower.contains("motive moi") || lower.contains("motivation") || lower.contains("besoin de force") {
        let boosts = [
            "💪 Tu es capable de grandes choses, même dans les journées plus grises.",
            "🔋 Garde le cap, l’impact que tu as est réel, même s’il ne se voit pas tout de suite.",
            "🌟 Ta bienveillance et ton travail font une vraie différence chaque jour.",
        ];
        return Some(boosts[rand::random::<usize>() % boosts.len()].to_string());
    }

    None
}


