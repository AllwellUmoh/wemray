export default function SectionHeading({
  eyebrow,
  title,
  lead,
  className = '',
  as: Heading = 'h2',
}) {
  return (
    <div className={['sh', className].filter(Boolean).join(' ')}>
      {eyebrow ? (
        <p className="ab-eb">
          <i />
          {eyebrow}
        </p>
      ) : null}
      <Heading>{title}</Heading>
      {lead ? <p className="ab-lead">{lead}</p> : null}
    </div>
  );
}
