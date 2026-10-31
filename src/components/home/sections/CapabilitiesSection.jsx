
import ServiceCard from '../../services/ServiceCard';
import { capabilities } from '../../../data/services';

export default function CapabilitiesSection() {
  return (
    <section className="cap band" id="capabilities">
      <div className="stk">
        <div className="top">
          <div className="eb">Our services</div>
          <div className="navs">
            <button id="cPrev" aria-label="Previous"><svg className="arr" viewBox="0 0 24 24"><path d="M20 12H4M11 5l-7 7 7 7" /></svg></button>
            <button id="cNext" aria-label="Next"><svg className="arr" viewBox="0 0 24 24"><path d="M4 12h16M13 5l7 7-7 7" /></svg></button>
          </div>
        </div>
        <h2>Nine capabilities. One connected team.</h2>
        <div className="track" id="track">
          {capabilities.map((service, index) => (
            <ServiceCard key={service.slug} service={service} index={index} />
          ))}
          <i className="sp" />
        </div>
      </div>
    </section>
  );
}
