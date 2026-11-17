import { z } from 'zod';
import { RAYNOVATION_TRACKS } from '../../data/raynovation-tracks';

const yesNo = z.enum(['Yes', 'No']);
const phoneNumber = z
  .string()
  .trim()
  .min(7, 'Enter a phone number we can reach you on.')
  .max(32, 'That phone number is too long.')
  .regex(/^[+()\-\s\d.]+$/, 'Use digits, spaces, +, parentheses, dots, or hyphens only.')
  .refine((value) => {
    const digits = value.replace(/\D/g, '').length;
    return digits >= 7 && digits <= 15;
  }, 'Enter a valid phone number.');

const requiredText = (label, max = 120) =>
  z.string().trim().min(1, `Enter your ${label}.`).max(max, `Your ${label} is too long.`);

const occupations = [
  'Employed - I am working for a company',
  'Self-Employed - I have my own business, working for myself',
  'Unemployed/Job searching - not working, currently looking for a job',
  'Temporary Job - I have a part-time job',
  'NYSC Corps Member - I am a serving corps member',
  'Student - I am currently in school',
];

const qualifications = [
  'Masters',
  'Bachelors',
  'HND',
  'OND',
  'WASSC',
  'First School Leaving Certificate',
  'None',
];

const workExperiences = ['Worked Before', 'Currently Working', 'Not Worked Before'];
const trackKeys = RAYNOVATION_TRACKS.map((track) => track.key);

function isValidDateOfBirth(value) {
  const date = new Date(`${value}T00:00:00.000Z`);
  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value &&
    value <= new Date().toISOString().slice(0, 10)
  );
}

function countWords(value) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

export const raynovationApplicationSchema = z
  .object({
    firstName: requiredText('first name', 80),
    lastName: requiredText('last name', 80),
    email: z.string().trim().toLowerCase().email('Enter a valid email address.').max(254),
    phone: phoneNumber,
    whatsappSameAsPhone: z.boolean(),
    whatsappNumber: z.string().trim().max(32).optional().default(''),
    dateOfBirth: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter your date of birth.')
      .refine(isValidDateOfBirth, 'Enter a valid date of birth that is not in the future.'),
    sex: z.enum(['Female', 'Male', 'Prefer not to say']),
    hasDisability: yesNo,
    address: requiredText('street address', 240),
    city: requiredText('city', 100),
    state: requiredText('state', 100),
    country: requiredText('country', 100),
    occupation: z.enum(occupations),
    qualification: z.enum(qualifications),
    workExperience: z.enum(workExperiences),
    computerKnowledge: yesNo,
    trackKey: z.enum(trackKeys),
    hasLaptop: yesNo,
    hasSmartphone: yesNo,
    availableForSessions: yesNo,
    hasGuarantor: yesNo,
    motivation: z
      .string()
      .trim()
      .min(1, 'Tell us why you want to take part.')
      .max(1200, 'Please keep your answer under 50 words.')
      .refine((value) => countWords(value) <= 50, 'Please keep your answer to 50 words or fewer.'),
    consent: z.literal(true, { error: 'Please confirm your application details.' }),
    website: z.string().max(200).optional().default(''),
  })
  .superRefine((data, context) => {
    if (!data.whatsappSameAsPhone) {
      const digits = data.whatsappNumber.replace(/\D/g, '').length;
      if (digits < 7 || digits > 15) {
        context.addIssue({
          code: 'custom',
          path: ['whatsappNumber'],
          message: 'Enter a valid WhatsApp number, or select the same number as your phone.',
        });
      }
    }
  });

export function parseRaynovationApplication(input) {
  const result = raynovationApplicationSchema.safeParse(input);
  if (result.success) return { success: true, data: result.data };

  const fieldErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (field && !fieldErrors[field]) fieldErrors[field] = issue.message;
  }

  return { success: false, fieldErrors };
}

export function applicationBoolean(value) {
  return value === 'Yes';
}
