import { Link } from 'react-router-dom';
import AppLink from './AppLink';

const ALIASES = {
  primary: 'pur',
  accent: 'lav',
  outline: 'line',
  secondary: 'navy',
  subtle: 'soft',
  light: 'white',
  dark: 'navy',
  filter: 'filter',
};

export function Arrow() {
  return (
    <svg className="arr" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

export default function Button({
  children,
  variant = 'primary',
  size,
  to,
  href,
  type,
  className = '',
  arrow = false,
  block = false,
  iconOnly = false,
  pill = false,
  active,
  ...rest
}) {
  const tone = ALIASES[variant] || variant;
  const classes = [
    'btn',
    tone,
    size ? `btn-${size}` : '',
    block ? 'btn-block' : '',
    iconOnly ? 'btn-icon' : '',
    pill ? 'btn-pill' : '',
    active === true ? 'on' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {children}
      {arrow ? <Arrow /> : null}
    </>
  );

  const pressed = active === undefined ? {} : { 'aria-pressed': String(active) };

  if (to) {
    return (
      <Link className={classes} to={to} {...rest}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <AppLink className={classes} href={href} {...rest}>
        {content}
      </AppLink>
    );
  }

  return (
    <button className={classes} type={type || 'button'} {...pressed} {...rest}>
      {content}
    </button>
  );
}
