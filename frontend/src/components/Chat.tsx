import { useState, useEffect, useRef } from 'react'
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit'
import { PACKAGE_ID } from '../config/network'

interface Message {
  id: string
  from: string        // wallet address
  fromName: string    // username or short address
  text: string
  ts: number
}

interface Conversation {
  id: string          // sorted pair of addresses: "addr1::addr2"
  peerAddress: string
  peerName: string
  messages: Message[]
}

const STORAGE_KEY = 'ur_chats_v1'

function loadConvos(): Conversation[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') } catch { return [] }
}
function saveConvos(c: Conversation[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(c))
}
function convId(a: string, b: string) {
  return [a, b].sort().join('::')
}
function shortAddr(addr: string) {
  return addr.slice(0, 6) + '...' + addr.slice(-4)
}

export default function Chat() {
  const account = useCurrentAccount()
  const client = useSuiClient()
  const myAddress = account?.address ?? ''

  const [convos, setConvos] = useState<Conversation[]>(loadConvos)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [newTarget, setNewTarget] = useState('')
  const [resolving, setResolving] = useState(false)
  const [resolveError, setResolveError] = useState('')
  const [myName, setMyName] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Resolve own username once
  useEffect(() => {
    if (!myAddress) return
    resolveUsername(myAddress).then(setMyName)
  }, [myAddress])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeId, convos])

  const activeConvo = convos.find((c) => c.id === activeId) ?? null

  async function resolveUsername(address: string): Promise<string> {
    try {
      const res = await client.getOwnedObjects({
        owner: address,
        filter: { StructType: `${PACKAGE_ID}::registry::Username` },
        options: { showContent: true },
      })
      const obj = res.data?.[0]
      if (!obj?.data) return shortAddr(address)
      const content = obj.data.content
      if (content?.dataType !== 'moveObject') return shortAddr(address)
      const fields = content.fields as { handle: string }
      return '@' + fields.handle
    } catch {
      return shortAddr(address)
    }
  }

  // Resolve a username handle → owner address via ClaimEvents
  async function resolveHandleToAddress(handle: string): Promise<string | null> {
    try {
      const res = await client.queryEvents({
        query: { MoveEventType: `${PACKAGE_ID}::registry::ClaimEvent` },
        limit: 50,
      })
      const h = handle.toLowerCase().replace(/^@/, '')
      for (const ev of res.data) {
        const p = ev.parsedJson as { handle?: string; owner?: string }
        if (p?.handle?.toLowerCase() === h && p.owner) return p.owner
      }
      return null
    } catch {
      return null
    }
  }

  const startChat = async () => {
    const raw = newTarget.trim()
    if (!raw || !myAddress) return
    setResolving(true)
    setResolveError('')

    let peerAddress = raw
    let peerName = ''

    // If it looks like a username (not 0x address), resolve it
    if (!raw.startsWith('0x')) {
      const addr = await resolveHandleToAddress(raw)
      if (!addr) {
        setResolveError(`Username "${raw}" not found on-chain.`)
        setResolving(false)
        return
      }
      peerAddress = addr
      peerName = '@' + raw.replace(/^@/, '')
    } else {
      peerName = await resolveUsername(raw)
    }

    if (peerAddress.toLowerCase() === myAddress.toLowerCase()) {
      setResolveError("You can't chat with yourself.")
      setResolving(false)
      return
    }

    const id = convId(myAddress, peerAddress)
    const existing = convos.find((c) => c.id === id)
    if (!existing) {
      const updated = [...convos, { id, peerAddress, peerName, messages: [] }]
      setConvos(updated)
      saveConvos(updated)
    }
    setActiveId(id)
    setNewTarget('')
    setResolving(false)
  }

  const sendMessage = () => {
    if (!input.trim() || !activeConvo || !myAddress) return
    const msg: Message = {
      id: crypto.randomUUID(),
      from: myAddress,
      fromName: myName || shortAddr(myAddress),
      text: input.trim(),
      ts: Date.now(),
    }
    const updated = convos.map((c) =>
      c.id === activeConvo.id ? { ...c, messages: [...c.messages, msg] } : c
    )
    setConvos(updated)
    saveConvos(updated)
    setInput('')
  }

  const deleteConvo = (id: string) => {
    const updated = convos.filter((c) => c.id !== id)
    setConvos(updated)
    saveConvos(updated)
    if (activeId === id) setActiveId(null)
  }

  return (
    <div className="chat-shell">
      {/* Sidebar */}
      <aside className="chat-sidebar">
        <div className="chat-sidebar-header">
          <span className="chat-sidebar-title">Messages</span>
        </div>

        {/* New chat input */}
        <div className="chat-new">
          <input
            value={newTarget}
            onChange={(e) => setNewTarget(e.target.value)}
            placeholder="@username or 0x address..."
            onKeyDown={(e) => e.key === 'Enter' && startChat()}
          />
          <button className="btn-primary chat-new-btn" onClick={startChat} disabled={resolving}>
            {resolving ? '...' : '+'}
          </button>
        </div>
        {resolveError && <p className="chat-resolve-error">⚠ {resolveError}</p>}

        {/* Conversation list */}
        <div className="chat-convo-list">
          {convos.length === 0 && (
            <p className="chat-empty-hint">Start a conversation by entering a username or address above.</p>
          )}
          {convos.map((c) => {
            const last = c.messages[c.messages.length - 1]
            return (
              <div
                key={c.id}
                className={`chat-convo-item ${activeId === c.id ? 'active' : ''}`}
                onClick={() => setActiveId(c.id)}
              >
                <div className="chat-convo-avatar">{c.peerName[1]?.toUpperCase() ?? '?'}</div>
                <div className="chat-convo-info">
                  <div className="chat-convo-name">{c.peerName}</div>
                  <div className="chat-convo-preview">{last ? last.text : 'No messages yet'}</div>
                </div>
                <button
                  className="chat-convo-delete"
                  onClick={(e) => { e.stopPropagation(); deleteConvo(c.id) }}
                  title="Delete conversation"
                >×</button>
              </div>
            )
          })}
        </div>
      </aside>

      {/* Main chat area */}
      <div className="chat-main">
        {!activeConvo ? (
          <div className="chat-placeholder">
            <div className="chat-placeholder-icon">💬</div>
            <p>Select a conversation or start a new one</p>
          </div>
        ) : (
          <>
            <div className="chat-topbar">
              <div className="chat-topbar-avatar">{activeConvo.peerName[1]?.toUpperCase() ?? '?'}</div>
              <div>
                <div className="chat-topbar-name">{activeConvo.peerName}</div>
                <div className="chat-topbar-addr">{shortAddr(activeConvo.peerAddress)}</div>
              </div>
            </div>

            <div className="chat-messages">
              {activeConvo.messages.length === 0 && (
                <div className="chat-no-messages">No messages yet. Say hi 👋</div>
              )}
              {activeConvo.messages.map((msg) => {
                const isMe = msg.from.toLowerCase() === myAddress.toLowerCase()
                return (
                  <div key={msg.id} className={`chat-bubble-wrap ${isMe ? 'me' : 'them'}`}>
                    {!isMe && <div className="chat-bubble-name">{msg.fromName}</div>}
                    <div className={`chat-bubble ${isMe ? 'me' : 'them'}`}>{msg.text}</div>
                    <div className="chat-bubble-time">
                      {new Date(msg.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-row">
              <input
                className="chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Message ${activeConvo.peerName}...`}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              />
              <button
                className="btn-primary chat-send-btn"
                onClick={sendMessage}
                disabled={!input.trim()}
              >
                Send ↑
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
