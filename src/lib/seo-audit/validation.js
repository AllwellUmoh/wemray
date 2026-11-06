import { z } from 'zod';
import { CONSENT_VERSION } from './constants';
import { hashValue } from './crypto';

const auditSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, 'Enter your first name.')
    .max(60, 'That first name is too long.'),
  email: z.string().trim().email('Enter a valid email address.').max(254),
  url: z.string().trim().min(4, 'Enter the page URL.').max(2048),
  reportConsent: z.boolean().optional().default(true),
  marketingConsent: z.boolean().optional().default(false),
  website: z.string().optional().default(''),
});

export function parseAuditInput(input) {
  const result = auditSchema.safeParse(input);
  if (!result.success) {
    const fieldErrors = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0];
      if (field && !fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    return { success: false, fieldErrors };
  }

  const email = result.data.email.toLowerCase();
  const firstName = result.data.firstName.trim();

  return {
    success: true,
    data: {
      firstName,
      email,
      url: result.data.url,
      reportConsent: true,
      marketingConsent: Boolean(result.data.marketingConsent),
      website: result.data.website || '',
      consentVersion: CONSENT_VERSION,
      emailHash: hashValue(`email:${email}`),
      firstNameHash: hashValue(`first:${firstName.toLowerCase()}`),
    },
  };
}
