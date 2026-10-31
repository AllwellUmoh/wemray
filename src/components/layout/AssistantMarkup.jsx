import { MessageCircle } from 'lucide-react';

export default function AssistantMarkup() {
  return (
    <div className="ast" id="ast">
      <button className="ast-fab" id="astFab" type="button" aria-label="Chat with the Wemray assistant" aria-expanded="false" aria-controls="astPanel"><MessageCircle className="ast-chat" size={30} strokeWidth={2} aria-hidden="true" /><span className="ast-x"><svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg></span><i className="ast-dot" /></button>
      <section className="ast-panel" id="astPanel" role="dialog" aria-label="Wemray assistant">
        <header><span className="ast-av"><img data-logo src="/logo.png" alt=""  /></span><div><b>Wemray Assistant</b><small><i />Online</small></div><button type="button" id="astClose" aria-label="Close chat"><svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg></button></header>
        <div className="ast-msgs" id="astMsgs" aria-live="polite" />
        <div className="ast-chips" id="astChips" />
        <form className="ast-form" id="astForm" autoComplete="off"><input id="astIn" type="text" placeholder="Type your question..." aria-label="Your message" maxLength={200} /><button type="submit" aria-label="Send"><svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4z" /></svg></button></form>
      </section>
    </div>
    
  );
}
