-- ============================================================
-- Ray Academy — seed data (idempotent)
--   psql "$DATABASE_URL" -f db/academy.seed.sql
-- Safe to re-run: courses/modules/tracks are upserted, and
-- coupon redemption counts are never reset.
-- ============================================================

-- Tracks ------------------------------------------------------
insert into academy_tracks (key, label, description, sort_order) values
  ('sw', 'Software Development', 'Frontend, backend and full-stack engineering for people who want to build products.', 1),
  ('ds', 'Design & Creative Skills', 'Product design and brand systems for people who shape how work looks and feels.', 2),
  ('dm', 'Marketing & Website Management', 'Content, channels and business websites for people who run digital presence.', 3),
  ('da', 'Data Analytics', 'Cleaning, analysis and reporting for people who turn data into decisions.', 4),
  ('ai', 'Artificial Intelligence', 'AI literacy and practical ways to use AI tools responsibly at work.', 5)
on conflict (key) do update
  set label = excluded.label,
      description = excluded.description,
      sort_order = excluded.sort_order;

-- Courses -----------------------------------------------------
-- prices are real amounts in kobo (1 NGN = 100 kobo)
insert into academy_courses
  (slug, number, title, track_key, formats, delivery, duration, classes, certificate,
   description, outcome, price_kobo, icon, image_url, sort_order)
values
  (
    'frontend-development', '01', 'Frontend Development', 'sw',
    '{Online}', '{Weekday,Weekend}',
    '14 weeks', '3 classes/week · 2 hrs each', 'Certificate of completion',
    'Build responsive interfaces with modern HTML, CSS, JavaScript, and component-driven workflows.',
    'Leave with three shipped interfaces, a component library you wrote yourself, and the ability to take a design file and turn it into a working, responsive site.',
    30000000, 'monitor', '/images/academy-course-frontend.jpg', 1
  ),
  (
    'backend-development', '02', 'Backend Development', 'sw',
    '{Online}', '{Weekday}',
    '14 weeks', '3 classes/week · 2 hrs each', 'Certificate of completion',
    'Design APIs, model data, and build the server-side foundations behind reliable applications.',
    'Leave with a documented REST API, a normalised database schema, and an understanding of authentication, deployment and how production systems fail.',
    32000000, 'server', '/images/academy-course-backend.jpg', 2
  ),
  (
    'full-stack-development', '03', 'Full-Stack Development', 'sw',
    '{Online}', '{Weekday,Weekend}',
    '20 weeks', '3 classes/week · 2 hrs each', 'Certificate of completion',
    'Connect frontend and backend skills to plan, build, and ship complete working products.',
    'Leave with a complete deployed product — frontend, API, database and payment flow — plus the ability to scope and estimate work for a client.',
    48000000, 'layers', '/images/academy-course-fullstack.jpg', 3
  ),
  (
    'product-design', '04', 'Product Design', 'ds',
    '{Online}', '{Weekday,Weekend}',
    '12 weeks', '3 classes/week · 2 hrs each', 'Certificate of completion',
    'Research user needs, shape clear journeys, and create interfaces that are easy to use.',
    'Leave with a full case study: research notes, user flows, wireframes, a high-fidelity prototype and a design system you can defend in a portfolio review.',
    28000000, 'pen', '/images/academy-course-product-design.jpg', 4
  ),
  (
    'corporate-branding-design', '05', 'Corporate Branding & Design', 'ds',
    '{Online}', '{Weekday,Weekend}',
    '10 weeks', '3 classes/week · 2 hrs each', 'Certificate of completion',
    'Develop practical brand systems, visual guidelines, and corporate design assets.',
    'Leave with a complete brand identity kit — logo system, type and colour rules, stationery, templates and a brand guideline document.',
    24000000, 'palette', '/images/academy-course-branding.jpg', 5
  ),
  (
    'social-media-management', '06', 'Social Media Management', 'dm',
    '{Online}', '{Weekday,Weekend}',
    '8 weeks', '3 classes/week · 2 hrs each', 'Certificate of completion',
    'Plan content, manage channels, and measure the performance of social media work.',
    'Leave with a 90-day content calendar, a channel playbook, and a reporting template tied to real business numbers rather than vanity metrics.',
    18000000, 'share', '/images/academy-course-social-media.jpg', 6
  ),
  (
    'wordpress', '07', 'WordPress', 'dm',
    '{Online}', '{Weekday,Weekend}',
    '8 weeks', '3 classes/week · 2 hrs each', 'Certificate of completion',
    'Build and manage practical business websites with structured content and dependable publishing workflows.',
    'Leave with a live business website — pages, blog, forms, SEO basics, backups and a handover document so the owner can publish without you.',
    19000000, 'globe', '/images/academy-course-wordpress.jpg', 7
  ),
  (
    'data-analytics', '08', 'Data Analytics', 'da',
    '{Online}', '{Weekday}',
    '12 weeks', '3 classes/week · 2 hrs each', 'Certificate of completion',
    'Clean, analyse, and present data so teams can make decisions with confidence.',
    'Leave with a dashboard built from real data, a documented cleaning process, and the habit of writing findings a non-technical manager can act on.',
    30000000, 'chart', '/images/academy-course-data-analytics.jpg', 8
  ),
  (
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
      sort_order = excluded.sort_order,
      updated_at = now();

-- Modules -----------------------------------------------------
-- Rebuilt per course so re-running never duplicates rows.
create temporary table module_data (
  course_slug text,
  number text,
  title text,
  summary text,
  topics jsonb,
  sort_order int
) on commit drop;

insert into module_data (course_slug, number, title, summary, topics, sort_order)
values
  -- Frontend Development
  ('frontend-development', '01', 'Foundations of the Web',
   'How browsers work, and how to write clean, semantic HTML and CSS that holds up.',
   '["How the browser renders a page","Semantic HTML and document structure","Box model, flexbox and grid","Responsive units and media queries"]'::jsonb, 1),
  ('frontend-development', '02', 'JavaScript Fundamentals',
   'Variables, functions, arrays and objects — the parts you use every single day.',
   '["Types, scope and closures","Array methods: map, filter, reduce","DOM selection and events","Debugging in the browser dev tools"]'::jsonb, 2),
  ('frontend-development', '03', 'Components That Scale',
   'Thinking in components, managing state, and keeping a codebase readable.',
   '["Component composition","Props, state and re-rendering","Reusable UI patterns","Styling strategies for teams"]'::jsonb, 3),
  ('frontend-development', '04', 'Working With Real Data',
   'Fetching from APIs, handling loading and error states, and validating input.',
   '["Fetch and async/await","Loading, empty and error states","Form validation","Working with JSON APIs"]'::jsonb, 4),
  ('frontend-development', '05', 'Accessibility & Performance',
   'Making interfaces usable by everyone, and fast enough to keep them.',
   '["Keyboard and screen-reader access","Colour contrast and focus states","Image and font loading","Measuring with Lighthouse"]'::jsonb, 5),
  ('frontend-development', '06', 'Ship It',
   'Version control, build tooling, and getting your work live.',
   '["Git branching and pull requests","Build and bundling basics","Deploying a static site","Writing a project README"]'::jsonb, 6),

  -- Backend Development
  ('backend-development', '01', 'The Server Model',
   'What happens between an HTTP request and a response, in detail.',
   '["HTTP methods, status codes and headers","Routing and middleware","Environment configuration","Logging"]'::jsonb, 1),
  ('backend-development', '02', 'Data Modelling',
   'Designing relational schemas that survive real usage.',
   '["Tables, keys and relationships","Normalisation vs. denormalisation","Migrations","Indexes and query plans"]'::jsonb, 2),
  ('backend-development', '03', 'Building APIs',
   'Designing endpoints other developers can use without asking you questions.',
   '["REST conventions","Input validation","Pagination and filtering","Error responses that make sense"]'::jsonb, 3),
  ('backend-development', '04', 'Auth & Security',
   'Sessions, tokens, hashing and the mistakes that leak user data.',
   '["Password hashing and salting","Session vs. token auth","Authorisation rules","Rate limiting and abuse prevention"]'::jsonb, 4),
  ('backend-development', '05', 'Jobs, Queues & Email',
   'Doing slow work without making the user wait.',
   '["Background jobs","Transactional email","Retries and idempotency","Webhooks"]'::jsonb, 5),
  ('backend-development', '06', 'Deploy & Operate',
   'Getting it running somewhere reliable, and knowing when it breaks.',
   '["Servers, containers and managed platforms","Environment variables and secrets","Backups and restores","Basic monitoring"]'::jsonb, 6),

  -- Full-Stack Development
  ('full-stack-development', '01', 'Product Thinking',
   'Turning a fuzzy request into a scoped, buildable plan.',
   '["Writing user stories","Mapping screens and data","Choosing what to cut","Estimating honestly"]'::jsonb, 1),
  ('full-stack-development', '02', 'Frontend in Context',
   'Building the interface against real data and real constraints.',
   '["Component architecture","Client-side state","Server-rendered vs. client-rendered","Form handling"]'::jsonb, 2),
  ('full-stack-development', '03', 'Backend & Data',
   'The API and database your frontend actually needs.',
   '["Schema design for the feature","Endpoint design","Validation and error handling","Seeding and testing data"]'::jsonb, 3),
  ('full-stack-development', '04', 'Accounts & Access',
   'Sign-up, sign-in, roles and permissions across the whole stack.',
   '["Auth flows end to end","Session handling","Role-based access","Protecting routes and endpoints"]'::jsonb, 4),
  ('full-stack-development', '05', 'Payments',
   'Taking money safely, using the pattern this site itself uses.',
   '["Server-side amount calculation","Hosted checkout vs. inline","Webhooks as the source of truth","Records, receipts and reconciliation"]'::jsonb, 5),
  ('full-stack-development', '06', 'Testing & Deployment',
   'Confidence before you push, and a clean release after.',
   '["Unit and integration tests","Test data and fixtures","CI basics","Monitoring a live product"]'::jsonb, 6),

  -- Product Design
  ('product-design', '01', 'Design Foundations',
   'Layout, hierarchy, type and colour, taught through critique rather than theory.',
   '["Grids, spacing and rhythm","Type scales and pairing","Colour and contrast","Visual hierarchy"]'::jsonb, 1),
  ('product-design', '02', 'Research & Empathy',
   'Finding out what users actually need before drawing anything.',
   '["Writing interview questions","Running a short user interview","Synthesising findings","Personas vs. real people"]'::jsonb, 2),
  ('product-design', '03', 'Information Architecture',
   'Structuring content so people can find things without thinking.',
   '["Sitemaps and flows","Card sorting","Navigation patterns","Edge cases and empty states"]'::jsonb, 3),
  ('product-design', '04', 'Interface Design',
   'Turning structure into screens that feel obvious to use.',
   '["Wireframes to high fidelity","Component thinking","Forms and feedback","Prototyping interactions"]'::jsonb, 4),
  ('product-design', '05', 'Design Systems',
   'Building a set of rules your teammates will actually follow.',
   '["Tokens and variables","Component libraries","Documentation","Handoff to developers"]'::jsonb, 5),
  ('product-design', '06', 'Portfolio & Critique',
   'Presenting the work, and defending the decisions behind it.',
   '["Case study structure","Showing process without noise","Presenting in a review","Receiving and using critique"]'::jsonb, 6),

  -- Corporate Branding & Design
  ('corporate-branding-design', '01', 'Brand Strategy',
   'What the brand stands for, written down before anyone opens a design tool.',
   '["Positioning and audience","Brand attributes","Competitive review","Writing a brand brief"]'::jsonb, 1),
  ('corporate-branding-design', '02', 'Identity Fundamentals',
   'Marks, type and colour as a system rather than a set of separate files.',
   '["Logo types and construction","Type selection and licensing","Colour systems","Clear space and usage rules"]'::jsonb, 2),
  ('corporate-branding-design', '03', 'Applied Identity',
   'Where the brand lands in the real world.',
   '["Stationery and print basics","Signage and large format","Social and digital assets","Merchandise and event materials"]'::jsonb, 3),
  ('corporate-branding-design', '04', 'Brand Guidelines',
   'A document a third party can design from without calling you.',
   '["Structure and sections","Do and don''t examples","Asset naming and handover","Versioning"]'::jsonb, 4),
  ('corporate-branding-design', '05', 'Production Skills',
   'Files, exports and print-ready output that does not come back rejected.',
   '["Vector vs. raster","Bleed, trim and CMYK","Export presets","Preparing files for a printer"]'::jsonb, 5),
  ('corporate-branding-design', '06', 'Client Presentation',
   'Selling the work without discounting it.',
   '["Structuring the reveal","Explaining the reasoning","Handling requested changes","Closing and handover"]'::jsonb, 6),

  -- Social Media Management
  ('social-media-management', '01', 'Channel Strategy',
   'Choosing where to show up, and why.',
   '["Platform strengths and audiences","Setting goals that are measurable","Audience research","Competitor review"]'::jsonb, 1),
  ('social-media-management', '02', 'Content Planning',
   'A calendar that survives a busy week.',
   '["Pillars and content types","Building a 90-day calendar","Batching and scheduling","Repurposing one idea"]'::jsonb, 2),
  ('social-media-management', '03', 'Writing & Visuals',
   'Copy and images that stop the scroll without shouting.',
   '["Hooks and opening lines","Captions and calls to action","Simple visuals in Canva-class tools","Consistency without repetition"]'::jsonb, 3),
  ('social-media-management', '04', 'Community & Response',
   'Handling comments, complaints and DMs like a professional.',
   '["Response tone and templates","Handling complaints","Moderation and escalation","Building a FAQ bank"]'::jsonb, 4),
  ('social-media-management', '05', 'Paid Basics',
   'A small budget spent properly beats a big budget spent blindly.',
   '["Campaign structure","Audience targeting","Creative testing","Budgeting and pacing"]'::jsonb, 5),
  ('social-media-management', '06', 'Measurement & Reporting',
   'Proving the work did something.',
   '["Metrics that matter","Building a monthly report","Reading insights without fooling yourself","Presenting to a client"]'::jsonb, 6),

  -- WordPress
  ('wordpress', '01', 'WordPress Foundations',
   'Hosting, installation and the dashboard, explained properly once.',
   '["Domains, hosting and DNS","Installing WordPress","The dashboard tour","Users and roles"]'::jsonb, 1),
  ('wordpress', '02', 'Pages, Posts & Media',
   'Getting content in cleanly and keeping it findable.',
   '["Pages vs. posts","The block editor","Media library and image sizes","Categories and tags"]'::jsonb, 2),
  ('wordpress', '03', 'Themes & Customisation',
   'Choosing and configuring a theme without breaking it.',
   '["Evaluating a theme","The customiser","Menus and widgets","Child themes"]'::jsonb, 3),
  ('wordpress', '04', 'Forms & Business Pages',
   'The pages a business actually needs to function.',
   '["Contact forms and email delivery","Service and pricing pages","Testimonials and case studies","Thank-you and legal pages"]'::jsonb, 4),
  ('wordpress', '05', 'SEO & Performance',
   'Being found, and loading fast enough to keep the visit.',
   '["Titles, meta descriptions and slugs","Sitemaps and indexing","Image compression and caching","Core Web Vitals basics"]'::jsonb, 5),
  ('wordpress', '06', 'Maintenance & Handover',
   'Keeping the site alive after launch.',
   '["Updates and staging","Backups and restores","Security basics","Writing a handover guide"]'::jsonb, 6),

  -- Data Analytics
  ('data-analytics', '01', 'Analytics Foundations',
   'The questions worth asking, and the data you need to answer them.',
   '["Types of analytics","Framing a business question","Data sources and collection","Data quality problems"]'::jsonb, 1),
  ('data-analytics', '02', 'Spreadsheet Power Skills',
   'Excel and Sheets taken well past the basics.',
   '["Lookup functions","Pivot tables","Cleaning messy data","Conditional formatting and validation"]'::jsonb, 2),
  ('data-analytics', '03', 'SQL for Analysis',
   'Querying databases directly, the way analysts actually work.',
   '["Select, where and order by","Joins","Aggregation and grouping","Subqueries and CTEs"]'::jsonb, 3),
  ('data-analytics', '04', 'Statistics Without Fear',
   'Enough statistics to avoid drawing the wrong conclusion.',
   '["Averages and distributions","Correlation vs. causation","Sampling and bias","Presenting uncertainty"]'::jsonb, 4),
  ('data-analytics', '05', 'Dashboards',
   'Building one page a manager can read in thirty seconds.',
   '["Choosing the right chart","Layout and hierarchy","Filters and interactivity","Connecting a live data source"]'::jsonb, 5),
  ('data-analytics', '06', 'Insight & Storytelling',
   'Writing the finding so the decision actually changes.',
   '["Structuring a report","Headlines that say something","Recommending an action","Presenting to non-technical stakeholders"]'::jsonb, 6),

  -- Introduction to AI
  ('introduction-to-ai', '01', 'AI Foundations',
   'What artificial intelligence means, how it differs from automation, and where it already appears in everyday tools.',
   '["Artificial intelligence, machine learning and generative AI","Common AI capabilities and limitations","How AI systems use data","Recognising AI in everyday products"]'::jsonb, 1),
  ('introduction-to-ai', '02', 'Exploring AI Tools',
   'Get familiar with common generative AI tools and choose the right one for a practical task.',
   '["Text and image assistants","Choosing a tool for the task","How generative models produce responses","Privacy checks before sharing information"]'::jsonb, 2),
  ('introduction-to-ai', '03', 'Prompting & Clear Instructions',
   'Write useful prompts by giving AI tools context, clear constraints and a specific output to work toward.',
   '["Context, role and task","Adding examples and constraints","Specifying an output format","Reviewing and refining responses"]'::jsonb, 3),
  ('introduction-to-ai', '04', 'AI for Everyday Work',
   'Apply AI tools to common writing, research, planning and productivity tasks while keeping human judgment in the loop.',
   '["Brainstorming and outlining","Summarising and drafting","Research with source verification","Building a repeatable AI-assisted workflow"]'::jsonb, 4),
  ('introduction-to-ai', '05', 'Responsible Use & Evaluation',
   'Spot unreliable outputs and use AI with care around personal data, bias and high-impact decisions.',
   '["Hallucinations and fact checking","Bias and fairness","Privacy and sensitive information","Copyright and human review"]'::jsonb, 5),
  ('introduction-to-ai', '06', 'Practical AI Project',
   'Bring the course together in a small project that solves a real task with a documented, human-reviewed AI workflow.',
   '["Define a practical problem","Select an appropriate tool","Design and test prompts","Present the workflow, results and safeguards"]'::jsonb, 6);

delete from academy_course_modules
where course_id in (select id from academy_courses where slug in (select distinct course_slug from module_data));

insert into academy_course_modules (course_id, number, title, summary, topics, sort_order)
select c.id, m.number, m.title, m.summary, m.topics, m.sort_order
from module_data m
join academy_courses c on c.slug = m.course_slug
order by m.course_slug, m.sort_order;

-- Coupons -----------------------------------------------------
-- Single global code. Unlimited redemptions, no expiry.
insert into academy_coupons (code, label, percent_off, max_redemptions, course_slug, expires_at, is_active)
values ('WEMRAY25', 'Wemray 25% off', 25, null, null, null, true)
on conflict (code) do update
  set label = excluded.label,
      percent_off = excluded.percent_off,
      is_active = excluded.is_active;
