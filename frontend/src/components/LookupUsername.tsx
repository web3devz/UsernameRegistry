import { useState } from 'react'
import { useSuiClient } from '@mysten/dapp-kit'
import { PACKAGE_ID, objectUrl } from '../config/network'

interface UsernameFields {
  handle: string
  owner: string
}

export default function LookupUsername() {
  const client = useSuiClient()
  const [address, setAddress] = useState('')
  const [results, setResults] = useState<{ fields: UsernameFields; objectId: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)

  const lookup = async () => {
    if (!address.trim()) return
    setLoading(true)
    setError('')
    setResults([])
    setSearched(false)

    try {
      const res = await client.getOwnedObjects({
        owner: address.trim(),
        filter: { StructType: `${PACKAGE_ID}::registry::Username` },
        options: { showContent: true },
      })

      const found = res.data
        .filter((obj) => obj.data?.content?.dataType === 'moveObject')
        .map((obj) => ({
          fields: (obj.data!.content as { dataType: 'moveObject'; fields: unknown }).fields as UsernameFields,
          objectId: obj.data!.objectId ?? '',
        }))

      setResults(found)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Lookup failed.')
    } finally {
      setLoading(false)
      setSearched(true)
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2>Lookup by Address</h2>
        <p className="card-desc">Find all usernames owned by a wallet address.</p>
      </div>

      <div className="search-row">
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="0x wallet address..."
          onKeyDown={(e) => e.key === 'Enter' && lookup()}
        />
        <button className="btn-primary" onClick={lookup} disabled={loading}>
          {loading ? 'Looking up...' : 'Look Up'}
        </button>
      </div>

      {error && <p className="error">⚠ {error}</p>}

      {searched && !loading && results.length === 0 && !error && (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>No usernames found</h3>
          <p>This address doesn't own any on-chain usernames.</p>
        </div>
      )}

      {results.map(({ fields: f, objectId }) => (
        <div key={objectId} className="username-card" style={{ marginTop: '1rem' }}>
          <div className="username-card-left">
            <div className="username-avatar">{f.handle[0]?.toUpperCase()}</div>
            <div>
              <div className="username-handle"><span>@</span>{f.handle}</div>
              <div className="username-owner">{f.owner.slice(0, 12)}...{f.owner.slice(-10)}</div>
            </div>
          </div>
          <div className="username-meta">
            <div className="meta-chip">
              <span className="meta-chip-label">Object ID</span>
              <a href={objectUrl(objectId)} target="_blank" rel="noreferrer" className="meta-chip-value mono link">
                {objectId.slice(0, 10)}...{objectId.slice(-8)} ↗
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
