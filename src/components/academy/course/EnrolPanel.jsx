import EnrolForm from './EnrolForm';

export default function EnrolPanel({ course }) {
  return (
    <div className="en-panel">
      <EnrolForm course={course} />
      <div className="en-help">
        <h3>Prefer to talk first?</h3>
        <p>
          Questions about the schedule, the fee, or whether this course fits your level? The academy team replies
          within one working day.
        </p>
        <ul>
          <li>
            <span>Email</span>
            <a href="mailto:hello@wemray.com?subject=Ray%20Academy%20enquiry">hello@wemray.com</a>
          </li>
          <li>
            <span>Phone</span>
            <a href="tel:+2348139934328">0813 993 4328</a>
          </li>
        </ul>
      </div>
    </div>
  );
}
