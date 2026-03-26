import { useCurrentAccount, useSuiClientQuery, useSignAndExecuteTransaction } from '@mysten/dapp-kit'
import { Transaction } from '@mysten/sui/transactions'
import { PACKAGE_ID, REGISTRY_ID, objectUrl, txUrl } from '../config/network'
import { useState } from 'react'

interface UsernameFields {
  handle: string
  owner: string
}

interface Props {
  onClaim?: () => void
}

export default function MyUsername({ onClaim }: Props) {
  const account = useCurrentAccount()
  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction()
  const [txDigest, setTxDigest] = useState('')
  const [error, setError] = useState('')

  const { data, isPending: loading, error: queryError, refetch } = useSuiClientQuery('getOwnedObjects', {
    owner: account?.address ?? '',
    filter: { StructType: `${PACKAGE_ID}::registry::Username` },
    options: { showContent: true },
  })

  if (loading) return <div className="status-box">Loading your username...</div>
  if (queryError) return <div className="status-box error">Error: {queryError.message}</div>

  const usernames = data?.data ?? []

  if (usernames.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🏷️</div>
        <h3>No username claimed</h3>
        <p>You don't own an on-chain username yet.</p>
        <button className="btn-primary" style={{ marginTop: '1.5rem' }} onClick={onClaim}>
          Claim a Username →
        </button>
      </div>
    )
  }

  const handleRelease = (objectId: string, handle: string) => {
    if (!confirm(`Release @${handle}? This cannot be undone.`)) return
    setError('')
    setTxDigest('')

    const tx = new Transaction()
    tx.moveCall({
      target: `${PACKAGE_ID}::registry::release`,
      arguments: [
        tx.object(REGISTRY_ID),
        tx.object(objectId),
      ],
    })

    signAndExecute(
      { transaction: tx },
      {
        onSuccess: (result) => { setTxDigest(result.digest); refetch() },
        onError: (err) => setError(err.message),
      }
    )
  }

  return (
    <div>
      {usernames.map((obj) => {
        const content = obj.data?.content
        if (content?.dataType !== 'moveObject') return null
        const f = content.fields as unknown as UsernameFields
        const objId = obj.data?.objectId ?? ''

        return (
          <div key={objId} className="card">
            <div className="my-username-display">
              <div className="my-username-big">@{f.handle}</div>
              <p className="my-username-sub">You own this username on-chain</p>
              <div className="my-username-actions">
                <a href={objectUrl(objId)} target="_blank" rel="noreferrer" className="btn-ghost">
                  View on Explorer ↗
                </a>
                <button
                  className="btn-danger"
                  onClick={() => handleRelease(objId, f.handle)}
                  disabled={isPending}
                >
                  {isPending ? 'Releasing...' : 'Release Username'}
                </button>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              <div className="meta-chip">
                <span className="meta-chip-label">Owner</span>
                <span className="meta-chip-value mono">{f.owner.slice(0, 10)}...{f.owner.slice(-8)}</span>
              </div>
              <div className="meta-chip">
                <span className="meta-chip-label">Object ID</span>
                <a href={objectUrl(objId)} target="_blank" rel="noreferrer" className="meta-chip-value mono link">
                  {objId.slice(0, 10)}...{objId.slice(-8)} ↗
                </a>
              </div>
            </div>
          </div>
        )
      })}

      {error && <p className="error" style={{ marginTop: '0.5rem' }}>⚠ {error}</p>}
      {txDigest && (
        <div className="tx-success">
          <span>✅ Username released</span>
          <a href={txUrl(txDigest)} target="_blank" rel="noreferrer">View transaction ↗</a>
        </div>
      )}
      <button onClick={() => refetch()} className="btn-ghost">↻ Refresh</button>
    </div>
  )
}
