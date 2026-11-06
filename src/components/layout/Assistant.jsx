'use client';

import { useEffect, useRef, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';
import AppLink from '../ui/AppLink';
import { createSession, openingMessage, respond } from '../../lib/assistant';

const NUDGE_KEY = 'wemray.assistant.nudge';
let seq = 0;
const uid = () => `m${(seq += 1)}`;

export default function Assistant() {
  const pathname = usePathname();
  const session = useRef(createSession());
  const timers = useRef([]);
  const inputRef = useRef(null);
  const messagesRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chips, setChips] = useState([]);
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState('');
  const [nudge, setNudge] = useState(false);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const later = (fn, delay) => {
    const timer = setTimeout(fn, delay);
    timers.current.push(timer);
    return timer;
  };

  const deliver = (reply) => {
    const list = reply.messages.filter(Boolean);
    let at = 0;
    list.forEach((message, index) => {
      at += 420 + Math.min(1100, message.text.length * 10) + (index ? 260 : 0);
      const last = index === list.length - 1;
      later(() => {
        setMessages((current) => [
          ...current,
          {
            id: uid(),
            who: 'bot',
            text: message.text,
            items: message.items,
            links: last ? reply.links : undefined,
          },
        ]);
      }, at);
    });
    later(() => {
      setBusy(false);
      setChips(reply.chips || []);
    }, at + 140);
  };

  const greet = () => {
    setBusy(true);
    later(() => {
      setMessages([{ id: uid(), who: 'bot', text: openingMessage(pathname) }]);
      setBusy(false);
      setChips(['What do you do?', 'Start a project', 'Ray Academy', 'Talk to a human']);
    }, 520);
  };

  const toggle = () => {
    const next = !open;
    setOpen(next);
    setNudge(false);
    if (next && !messages.length) greet();
  };

  const reset = () => {
    clearTimers();
    session.current = createSession();
    setMessages([]);
    setChips([]);
    setInput('');
    setBusy(false);
    greet();
  };

  const send = (value) => {
    const text = String(value || '').trim();
    if (!text || busy) return;
    const reply = respond(session.current, text);
    setInput('');
    setChips([]);
    setBusy(true);
    setMessages((current) => [...current, { id: uid(), who: 'me', text }]);
    deliver(reply);
  };

  useEffect(() => {
    document.body.classList.toggle('ast-open', open);
    document.getElementById('astFab')?.setAttribute('aria-expanded', String(open));
    if (!open) return undefined;
    const timer = setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 320);
    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => () => clearTimers(), []);

  useEffect(() => {
    if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages, busy, chips]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (sessionStorage.getItem(NUDGE_KEY)) return undefined;
    const timer = setTimeout(() => {
      setNudge((current) => {
        if (current) return current;
        sessionStorage.setItem(NUDGE_KEY, '1');
        return true;
      });
    }, 9000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="ast" id="ast">
      {nudge && !open && (
        <button className="ast-nudge" type="button" onClick={toggle}>
          <span>Need a hand? I can point you the right way.</span>
          <i aria-hidden="true">×</i>
        </button>
      )}

      <button
        className="ast-fab"
        id="astFab"
        type="button"
        aria-label="Chat with Ray, the Wemray assistant"
        aria-expanded={open}
        aria-controls="astPanel"
        onClick={toggle}
      >
        <MessageCircle className="ast-chat" size={30} strokeWidth={2} aria-hidden="true" />
        <span className="ast-x">
          <svg
            className="ico"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </span>
        <i className="ast-dot" />
      </button>

      <section className="ast-panel" id="astPanel" role="dialog" aria-label="Wemray assistant">
        <header>
          <span className="ast-av">
            <img src="/logo.png" alt="" />
          </span>
          <div>
            <b>Ray</b>
            <small>
              <i />
              Wemray assistant · online
            </small>
          </div>
          <div className="ast-tools">
            <button type="button" onClick={reset} aria-label="Start a new conversation" title="New chat">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 12a9 9 0 1 0 3-6.7" />
                <path d="M3 4v5h5" />
              </svg>
            </button>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close chat">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </header>

        <div className="ast-msgs" id="astMsgs" aria-live="polite" ref={messagesRef}>
          {messages.map((message) => (
            <div className={`am ${message.who}`} key={message.id}>
              {message.text ? <p>{message.text}</p> : null}
              {message.items ? (
                <ul className="amlist">
                  {message.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
              {message.links ? (
                <div className="al">
                  {message.links.map(([label, href]) => (
                    <AppLink href={href} key={label}>
                      {label}
                    </AppLink>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
          {busy && (
            <div className="am bot ty">
              <p>
                <i />
                <i />
                <i />
              </p>
            </div>
          )}
        </div>

        {!busy && chips.length > 0 && (
          <div className="ast-chips" id="astChips">
            {chips.map((chip) => (
              <button type="button" key={chip} onClick={() => send(chip)}>
                {chip}
              </button>
            ))}
          </div>
        )}

        <form
          className="ast-form"
          id="astForm"
          autoComplete="off"
          onSubmit={(event) => {
            event.preventDefault();
            send(input);
          }}
        >
          <input
            id="astIn"
            ref={inputRef}
            type="text"
            placeholder="Ask me anything..."
            aria-label="Your message"
            maxLength={240}
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
          <button type="submit" aria-label="Send" disabled={busy || !input.trim()}>
            <svg
              className="ico"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M22 2 11 13" />
              <path d="M22 2 15 22l-4-9-9-4z" />
            </svg>
          </button>
        </form>
      </section>
    </div>
  );
}