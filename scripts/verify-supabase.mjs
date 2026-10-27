import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.resolve(__dirname, '../.env.local')

console.log('\n======================================================')
console.log('🔍 VÉRIFICATION DE LA CONFIGURATION SUPABASE')
console.log('======================================================\n')

if (!fs.existsSync(envPath)) {
  console.error('❌ Le fichier .env.local est introuvable à la racine.')
  console.log('👉 Copiez .env.local.example vers .env.local et renseignez vos clés.')
  process.exit(1)
}

const envContent = fs.readFileSync(envPath, 'utf-8')
const env = {}
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=\s]+)\s*=\s*(.*)$/)
  if (match) {
    env[match[1].trim()] = match[2].trim().replace(/^['"](.*)['"]$/, '$1')
  }
})

const url = env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY

console.log(`📡 URL Supabase : ${url || 'NON DÉFINIE'}`)
console.log(`🔑 Anon Key     : ${anonKey ? anonKey.slice(0, 15) + '...' : 'NON DÉFINIE'}`)
console.log(`🛡️  Service Key  : ${serviceKey ? serviceKey.slice(0, 15) + '...' : 'NON DÉFINIE'}\n`)

if (!url || !anonKey || !serviceKey) {
  console.error('❌ Des variables sont manquantes dans .env.local')
  process.exit(1)
}

try {
  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })

  console.log('⏳ Test de connectivité au serveur Supabase...')
  const tables = ['profiles', 'entreprises', 'clients', 'factures', 'lignes_facture']
  let hasMissingTables = false

  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('count', { count: 'exact', head: true })
    if (error) {
      if (error.code === '42P01' || error.message?.includes('does not exist') || error.message?.includes('relation')) {
        console.warn(`⚠️  Table [${table}] : Non trouvée dans la base`)
        hasMissingTables = true
      } else {
        console.error(`❌ Table [${table}] : Erreur - ${error.message} (${error.code || 'code inconnu'})`)
        if (error.message?.includes('fetch failed') || error.message?.includes('ENOTFOUND')) {
          console.log('\n💡 Le nom de domaine Supabase est introuvable (ENOTFOUND).')
          console.log('👉 Causes possibles :')
          console.log('   1. Le projet Supabase est EN PAUSE (inactivité). Rendez-vous sur votre dashboard Supabase et cliquez sur "Restore project" :')
          console.log(`      https://supabase.com/dashboard/project/${url.replace('https://', '').replace('.supabase.co', '')}`)
          console.log('   2. Le projet a été supprimé ou l\'URL a changé.')
          process.exit(1)
        }
      }
    } else {
      console.log(`✅ Table [${table}] : Accessible`)
    }
  }

  if (hasMissingTables) {
    console.log('\n📋 Action requise :')
    console.log('Certaines tables ne sont pas encore créées.')
    console.log('Exécutez le script SQL complet `supabase-all-in-one.sql` dans l\'éditeur SQL Supabase :')
    console.log(`https://supabase.com/dashboard/project/${url.replace('https://', '').replace('.supabase.co', '')}/sql/new\n`)
  } else {
    console.log('\n🎉 Tout est parfaitement configuré et accessible dans Supabase !\n')
  }
} catch (err) {
  console.error('\n❌ Erreur inattendue :', err.message)
}
