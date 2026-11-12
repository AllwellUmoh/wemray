-- Ray Academy course-card image migration for an existing database.
-- Run before deploying the image_url-aware catalogue code.

alter table academy_courses
  add column if not exists image_url text not null default '';

update academy_courses
set image_url = case slug
  when 'frontend-development' then '/images/academy-course-frontend.jpg'
  when 'backend-development' then '/images/academy-course-backend.jpg'
  when 'full-stack-development' then '/images/academy-course-fullstack.jpg'
  when 'product-design' then '/images/academy-course-product-design.jpg'
  when 'corporate-branding-design' then '/images/academy-course-branding.jpg'
  when 'social-media-management' then '/images/academy-course-social-media.jpg'
  when 'wordpress' then '/images/academy-course-wordpress.jpg'
  when 'data-analytics' then '/images/academy-course-data-analytics.jpg'
  else image_url
end,
updated_at = now()
where slug in (
  'frontend-development',
  'backend-development',
  'full-stack-development',
  'product-design',
  'corporate-branding-design',
  'social-media-management',
  'wordpress',
  'data-analytics'
);
