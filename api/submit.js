export default async function handler(req, res) {
  // Vérifie que la méthode est POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  // Données reçues du formulaire
  const formData = req.body;

  // Récupère les variables d’environnement
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY;

  // Sécurité : vérifie que les variables existent
  if (!SUPABASE_URL || !SUPABASE_API_KEY) {
    return res.status(500).json({ error: 'Variables d’environnement manquantes' });
  }

  try {
    // Envoie des données à la table Supabase
    const response = await fetch(`${SUPABASE_URL}/rest/v1/campus_formulaire`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_API_KEY,
        'Authorization': `Bearer ${SUPABASE_API_KEY}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(formData)
    });

    // Gestion des erreurs de réponse Supabase
    if (!response.ok) {
      const error = await response.json();
      console.error('Erreur Supabase:', error);
      return res.status(500).json({ success: false, error });
    }

    // Succès : renvoie les données insérées
    const data = await response.json();
    return res.status(200).json({ success: true, data });

  } catch (error) {
    console.error('Erreur serveur:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
