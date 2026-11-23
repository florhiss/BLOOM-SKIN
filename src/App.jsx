
import { useState } from 'react'
import './App.css'
import Routine from'./Routine'
import Journal from'./Journal'

const products = [
  { name: 'Gel nettoyant doux', type: 'Nettoyant', description: 'Nettoie délicatement la peau.', icon: '🫧' },
  { name: 'Sérum vitamine C', type: 'Sérum', description: 'Aide à illuminer le teint.', icon: '🍊' },
  { name: 'Crème hydratante', type: 'Hydratant', description: 'Aide à maintenir l’hydratation.', icon: '🌸' },
  { name: 'Protection solaire SPF 50', type: 'Protection', description: 'Protège la peau des UV.', icon: '☀️' },
  { name: 'Sérum niacinamide', type: 'Sérum', description: 'Aide à améliorer l’apparence du teint.', icon: '💧' },
  { name: 'Masque hydratant', type: 'Masque', description: 'Un moment de douceur pour ta peau.', icon: '🧖🏽‍♀️' },
]

const skinTypes = [
  { name: 'Peau sèche', icon: '🌵', text: 'Privilégie les soins hydratants et les textures nourrissantes.' },
  { name: 'Peau grasse', icon: '✨', text: 'Privilégie les textures légères et non comédogènes.' },
  { name: 'Peau mixte', icon: '🌷', text: 'Adapte les soins aux différentes zones de ton visage.' },
  { name: 'Peau sensible', icon: '🩷', text: 'Choisis des soins doux et introduis les produits progressivement.' },
  { name: 'Peau normale', icon: '🌼', text: 'Entretiens l’équilibre de ta peau avec une routine simple.' },
]

const routines = {
  Matin: [
    'Nettoyer délicatement le visage',
    'Appliquer un sérum adapté',
    'Hydrater la peau',
    'Appliquer une protection solaire SPF 30 à 50',
  ],
  Soir: [
    'Démaquiller si nécessaire',
    'Nettoyer le visage',
    'Appliquer un soin adapté',
    'Hydrater la peau',
  ],
}

function App() {
  const [page, setPage] = useState('Accueil')
  const [skin, setSkin] = useState('Peau mixte')
  const [routine, setRoutine] = useState('Matin')
  const [checked, setChecked] = useState([])
  const [search, setSearch] = useState('')
  const [journal, setJournal] = useState('')
  const [entries, setEntries] = useState([])

  const navItems = ['Accueil', 'Routines', 'Types de peau', 'Produits', 'Mon suivi']

  const toggleTask = (task) => {
    setChecked(prev =>
      prev.includes(task)
        ? prev.filter(item => item !== task)
        : [...prev, task]
    )
  }

  const addEntry = () => {
    if (journal.trim()) {
      setEntries(prev => [journal.trim(), ...prev])
      setJournal('')
    }
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(search.toLowerCase()) ||
    product.type.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="app">
      <header className="navbar">
        <div className="brand">
          <span className="brand-icon">🌸</span>
          <span>Bloom <b>Skin</b></span>
        </div>

        <nav>
          {navItems.map(item => (
            <button
              key={item}
              className={page === item ? 'nav-link active' : 'nav-link'}
              onClick={() => setPage(item)}
            >
              {item}
            </button>
          ))}
        </nav>
      </header>

      <main>
        {page === 'Accueil' && (
          <>
            <section className="hero">
              <div className="hero-text">
                <span className="eyebrow">✿ YOUR BEAUTY, YOUR RULES ✿</span>
                <h1>Prends soin de ta peau,<br />
                  <span>fais fleurir ta beauté.</span>
                </h1>
                <p>
                  Bienvenue dans ton petit univers skincare.
                  Découvre les soins, crée ta routine et apprends
                  à aimer ta peau chaque jour.
                </p>
                <button className="primary-btn" onClick={() => setPage('Routines')}>
                  Découvrir ma routine ✨
                </button>
              </div>
              <div className="hero-art">
                <div className="flower">🌷</div>
                <div className="art-card">
                  <span>YOUR DAILY</span>
                  <strong>GLOW</strong>
                  <span>STARTS HERE ♡</span>
                </div>
                <span className="sparkle">✦</span>
              </div>
            </section>

            <section className="welcome">
              <h2>Bienvenue chez Bloom Skin ♡</h2>
              <p>Chaque peau est différente. La tienne mérite une attention particulière.</p>
            </section>

            <section className="feature-grid">
              {[
                ['🌸', 'Ma routine', 'Organise tes soins quotidiens.', 'Routines'],
                ['🧴', 'Mes produits', 'Découvre les indispensables.', 'Produits'],
                ['💗', 'Mon suivi', 'Note tes progrès et tes ressentis.', 'Mon suivi'],
              ].map(([icon, title, description, target]) => (
                <button className="feature-card" key={title} onClick={() => setPage(target)}>
                  <span>{icon}</span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                  <b>Découvrir →</b>
                </button>
              ))}
            </section>
          </>
        )}

        {page === 'Routines' && <Routine />}
        {false  && page === 'Routines'  &&(
          <section className="content-section">
            <span className="eyebrow">YOUR DAILY SELF-CARE</span>
            <h1>Ma routine skincare 🌷</h1>
            <p>Prends quelques minutes pour chouchouter ta peau.</p>

            <div className="tabs">
              {['Matin', 'Soir'].map(item => (
                <button
                  key={item}
                  className={routine === item ? 'tab selected' : 'tab'}
                  onClick={() => setRoutine(item)}
                >
                  {item === 'Matin' ? '☀️' : '🌙'} {item}
                </button>
              ))}
            </div>

            <div className="routine-card">
              <h2>Routine du {routine.toLowerCase()}</h2>
              <p>Coche chaque étape au fur et à mesure.</p>
              {routines[routine].map((task, index) => (
                <label className="task" key={task}>
                  <input
                    type="checkbox"
                    checked={checked.includes(task)}
                    onChange={() => toggleTask(task)}
                  />
                  <span className="step-number">{index + 1}</span>
                  <span>{task}</span>
                </label>
              ))}
              <p className="progress">
                {routines[routine].filter(task => checked.includes(task)).length}
                {' / '}{routines[routine].length} étapes terminées 💗
              </p>
            </div>
          </section>
        )}

        {page === 'Types de peau' && (
          <section className="content-section">
            <span className="eyebrow">GET TO KNOW YOUR SKIN</span>
            <h1>Quel est ton type de peau ?</h1>
            <p>Choisis ton type de peau pour découvrir quelques conseils.</p>

            <div className="skin-grid">
              {skinTypes.map(item => (
                <button
                  className={skin === item.name ? 'skin-card chosen' : 'skin-card'}
                  key={item.name}
                  onClick={() => setSkin(item.name)}
                >
                  <span>{item.icon}</span>
                  <h3>{item.name}</h3>
                  <p>{item.text}</p>
                </button>
              ))}
            </div>

            <div className="skin-result">
              <h3>Ton choix : {skin} 💗</h3>
              <p>{skinTypes.find(item => item.name === skin)?.text}</p>
            </div>
          </section>
        )}

        {page === 'Produits' && (
          <section className="content-section">
            <span className="eyebrow">YOUR SKINCARE COLLECTION</span>
            <h1>Les essentiels skincare 🧴</h1>
            <p>Découvre les produits et leur rôle dans une routine.</p>

            <input
              className="search-input"
              placeholder="Rechercher un produit..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />

            <div className="product-grid">
              {filteredProducts.map(product => (
                <article className="product-card" key={product.name}>
                  <div className="product-icon">{product.icon}</div>
                  <span className="product-type">{product.type}</span>
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                </article>
              ))}
              {filteredProducts.length === 0 && (
                <p>Aucun produit trouvé 🌸</p>
              )}
            </div>
          </section>
        )}

{page === 'Mon suivi' && <Journal />}
{false && page === 'Mon suivi' && (
          <section className="content-section">
            <span className="eyebrow">MY SKIN JOURNAL</span>
            <h1>Mon évolution 💗</h1>
            <p>Un petit journal pour noter comment ta peau se sent.</p>

            <div className="journal-card">
              <h2>Comment va ta peau aujourd'hui ?</h2>
              <textarea
                placeholder="Exemple : Ma peau est douce aujourd'hui..."
                value={journal}
                onChange={e => setJournal(e.target.value)}
              />
              <button className="primary-btn" onClick={addEntry}>
                Enregistrer mon humeur ♡
              </button>
            </div>

            <div className="entries">
              <h2>Mon journal</h2>
              {entries.length === 0
                ? <p>Ton journal est encore vide. Écris ta première note ! 🌷</p>
                : entries.map((entry, index) => (
                    <article className="entry" key={index}>
                      <span>🌸</span>
                      <p>{entry}</p>
                    </article>
                  ))
              }
            </div>
          </section>
        )}
      </main>

      <footer>
        <span>🌸 Bloom Skin</span>
        <p>Made with love for your skin ♡</p>
        <small>Une peau unique, une beauté naturelle.</small>
      </footer>
    </div>
  )
}

export default App
