import { useState, useEffect, useRef } from 'react'
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit'
import { Transaction } from '@mysten/sui/transactions'
import { PACKAGE_ID, REGISTRY_ID, txUrl } from '../config/network'

interface Props {
  onSuccess?: () => void
}

const enc = (s: string) => Array.from(new TextEncoder().encode(s))

export default function ClaimUsername({ onSuccess }: Props) {
  const account = useCurrentAccount()
  const client = useSuiClient()
  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction()

  const [handle, setHandle] = useState('')
  const [avail, setAvail] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')
  const [txDigest, setTxDigest] = useState('')
  const [error, setError] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (handle.length < 3) { setAvail('idle'); return }
    setAvail('checking')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await client.getObject({
          id: REGISTRY_ID,
          options: { showContent: true },
        })
        const content = res.data?.content
        if (content?.dataType !== 'moveObject') return
        const fields = content.fields as { handles?: { fields?: { contents?: { fields: { key: string } }[] } } }
        const contents = fields?.handles?.fields?.contents ?? []
        const taken = contents.some((c) => c.fields.key === handle.toLowerCase())
        setAvail(taken ? 'taken' : 'available')
      } catch {
        setAvail('idle')
      }
    }, 500)
  }, [handle, client])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setTxDigest('')
    if (!account) return
    if (handle.length < 3) { setError('Handle must be at least 3 characters.'); return }
    if (avail === 'taken') { setError('This handle is already taken.'); return }

    const tx = new Transaction()
    tx.moveCall({
      target: `${PACKAGE_ID}::registry::claim`,
      arguments: [
        tx.object(REGISTRY_ID),
        tx.pure.vector('u8', enc(handle.toLowerCase())),
      ],
    })

    signAndExecute(
      { transaction: tx },
      {
        onSuccess: (result) => {
          setTxDigest(result.digest)
          setHandle('')
          setAvail('idle')
          onSuccess?.()
        },
        onError: (err) => setError(err.message),
      }
    )
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2>Claim Your Username</h2>
        <p className="card-desc">
          Mint a unique on-chain username. It lives in your wallet as an owned object — permanent and censorship-resistant.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="form">
        <label>
          Username
          <div className="handle-input-wrap">
            <span className="handle-prefix">@</span>
            <input
              value={handle}
              onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              placeholder="yourname"
              minLength={3}
              maxLength={32}
              required
            />
          </div>
          {avail === 'checking' && <span className="avail-badge checking">⏳ Checking availability...</span>}
          {avail === 'available' && <span className="avail-badge available">✓ Available</span>}
          {avail === 'taken' && <span className="avail-badge taken">✗ Already taken</span>}
        </label>

        {error && <p className="error">⚠ {error}</p>}

        <button
          type="submit"
          className="btn-primary"
          disabled={isPending || avail === 'taken' || handle.length < 3}
        >
          {isPending ? 'Claiming...' : 'Claim Username'}
        </button>
      </form>

      {txDigest && (
        <div className="tx-success">
          <span>✅ Username claimed on-chain</span>
          <a href={txUrl(txDigest)} target="_blank" rel="noreferrer">View transaction ↗</a>
        </div>
      )}
    </div>
  )
}
