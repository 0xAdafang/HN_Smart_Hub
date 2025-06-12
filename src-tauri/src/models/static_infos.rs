use std::collections::HashMap;

/// Base locale de définitions manuelles, accessibles même sans base de données
pub fn get_static_knowledge() -> HashMap<&'static str, &'static str> {
    HashMap::from([
        ("fodmap", "Le FODMAP est un ensemble de sucres à chaîne courte, fermentescibles, pouvant causer des troubles digestifs."),
        ("aspartame", "L’aspartame est un édulcorant artificiel sans calorie, utilisé pour remplacer le sucre."),
        ("seitan", "Le seitan est une pâte faite à base de gluten de blé, riche en protéines et pauvre en graisses."),
        ("agave", "L'agave est un sucre naturel extrait d'une plante mexicaine, souvent utilisé comme alternative au miel."),
        ("quinoa", "Le quinoa est une pseudo-céréale riche en protéines et sans gluten."),
        ("gluten", "Le gluten est une protéine présente dans le blé, l’orge et le seigle."),
    ])
}
