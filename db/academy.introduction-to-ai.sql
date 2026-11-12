-- Add Introduction to AI to an existing Ray Academy database.
-- Idempotent: can be applied again to refresh the course and its curriculum.

insert into academy_tracks (key, label, description, sort_order)
values (
  'ai',
  'Artificial Intelligence',
  'AI literacy and practical ways to use AI tools responsibly at work.',
  5
)
on conflict (key) do update
set label = excluded.label,
    description = excluded.description,
    sort_order = excluded.sort_order;

insert into academy_courses
  (slug, number, title, track_key, formats, delivery, duration, classes, certificate,
   description, outcome, price_kobo, icon, image_url, sort_order)
values (
  'introduction-to-ai', '09', 'Introduction to AI', 'ai',
  '{Online}', '{Weekday,Weekend}',
  '8 weeks', '2 classes/week · 2 hrs each', 'Certificate of completion',
  'Understand the foundations of artificial intelligence and learn to use today’s AI tools for practical work with confidence and care.',
  'Leave with a practical prompt toolkit and a documented AI-assisted workflow, plus the judgment to check outputs for accuracy, privacy and bias.',
  18000000, 'monitor', '/images/academy-course-introduction-to-ai.jpg', 9
)
on conflict (slug) do update
set number = excluded.number,
    title = excluded.title,
    track_key = excluded.track_key,
    formats = excluded.formats,
    delivery = excluded.delivery,
    duration = excluded.duration,
    classes = excluded.classes,
    certificate = excluded.certificate,
    description = excluded.description,
    outcome = excluded.outcome,
    price_kobo = excluded.price_kobo,
    icon = excluded.icon,
    image_url = excluded.image_url,
    is_active = true,
    sort_order = excluded.sort_order,
    updated_at = now();

with module_data (number, title, summary, topics, sort_order) as (
  values
    ('01', 'AI Foundations',
     'What artificial intelligence means, how it differs from automation, and where it already appears in everyday tools.',
     '["Artificial intelligence, machine learning and generative AI","Common AI capabilities and limitations","How AI systems use data","Recognising AI in everyday products"]'::jsonb, 1),
    ('02', 'Exploring AI Tools',
     'Get familiar with common generative AI tools and choose the right one for a practical task.',
     '["Text and image assistants","Choosing a tool for the task","How generative models produce responses","Privacy checks before sharing information"]'::jsonb, 2),
    ('03', 'Prompting & Clear Instructions',
     'Write useful prompts by giving AI tools context, clear constraints and a specific output to work toward.',
     '["Context, role and task","Adding examples and constraints","Specifying an output format","Reviewing and refining responses"]'::jsonb, 3),
    ('04', 'AI for Everyday Work',
     'Apply AI tools to common writing, research, planning and productivity tasks while keeping human judgment in the loop.',
     '["Brainstorming and outlining","Summarising and drafting","Research with source verification","Building a repeatable AI-assisted workflow"]'::jsonb, 4),
    ('05', 'Responsible Use & Evaluation',
     'Spot unreliable outputs and use AI with care around personal data, bias and high-impact decisions.',
     '["Hallucinations and fact checking","Bias and fairness","Privacy and sensitive information","Copyright and human review"]'::jsonb, 5),
    ('06', 'Practical AI Project',
     'Bring the course together in a small project that solves a real task with a documented, human-reviewed AI workflow.',
     '["Define a practical problem","Select an appropriate tool","Design and test prompts","Present the workflow, results and safeguards"]'::jsonb, 6)
)
insert into academy_course_modules (course_id, number, title, summary, topics, sort_order)
select c.id, m.number, m.title, m.summary, m.topics, m.sort_order
from academy_courses c
cross join module_data m
where c.slug = 'introduction-to-ai'
on conflict (course_id, number) do update
set title = excluded.title,
    summary = excluded.summary,
    topics = excluded.topics,
    sort_order = excluded.sort_order;
