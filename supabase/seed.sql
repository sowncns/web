insert into public.categories (name, slug) values
('CapCut', 'capcut'),
('Canva', 'canva'),
('AI Tools', 'ai-tools'),
('Streaming', 'streaming'),
('Office', 'office'),
('Game', 'game')
on conflict (slug) do nothing;

insert into public.products (category_id, name, slug, description, image_url, price, duration, warranty_policy, delivery_guide, is_active)
select c.id, 'CapCut Pro 1 tháng', 'capcut-pro-1-thang',
'Gói dịch vụ CapCut Pro hỗ trợ sử dụng các tính năng nâng cao theo chính sách hợp lệ.',
'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?q=80&w=1200&auto=format&fit=crop',
29000, '1 tháng', 'Bảo hành 30 ngày nếu lỗi do bên cung cấp.',
'Sau khi thanh toán và đơn hàng hoàn tất, tài khoản và mật khẩu sẽ hiển thị trong chi tiết đơn hàng.', true
from public.categories c where c.slug = 'capcut'
on conflict (slug) do nothing;

insert into public.products (category_id, name, slug, description, image_url, price, duration, warranty_policy, delivery_guide, is_active)
select c.id, 'Canva Pro 1 tháng', 'canva-pro-1-thang',
'Gói dịch vụ Canva Pro hỗ trợ thiết kế, template, tài nguyên nâng cao theo chính sách hợp lệ.',
'https://images.unsplash.com/photo-1609921212029-bb5a28e60960?q=80&w=1200&auto=format&fit=crop',
25000, '1 tháng', 'Bảo hành 30 ngày nếu lỗi do bên cung cấp.',
'Sau khi thanh toán và đơn hàng hoàn tất, tài khoản và mật khẩu sẽ hiển thị trong chi tiết đơn hàng.', true
from public.categories c where c.slug = 'canva'
on conflict (slug) do nothing;

insert into public.products (category_id, name, slug, description, image_url, price, duration, warranty_policy, delivery_guide, is_active)
select c.id, 'YouTube Premium 1 tháng', 'youtube-premium-1-thang',
'Gói YouTube Premium hỗ trợ trải nghiệm xem nội dung theo chính sách hợp lệ.',
'https://images.unsplash.com/photo-1611162616475-46b635cb6868?q=80&w=1200&auto=format&fit=crop',
39000, '1 tháng', 'Bảo hành theo thời hạn gói.',
'Khách nhận tài khoản và mật khẩu sau khi đơn hoàn tất.', true
from public.categories c where c.slug = 'streaming'
on conflict (slug) do nothing;

insert into public.products (category_id, name, slug, description, image_url, price, duration, warranty_policy, delivery_guide, is_active)
select c.id, 'Spotify Premium 1 tháng', 'spotify-premium-1-thang',
'Gói Spotify Premium hỗ trợ nghe nhạc theo chính sách hợp lệ.',
'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?q=80&w=1200&auto=format&fit=crop',
35000, '1 tháng', 'Bảo hành theo thời hạn gói.',
'Khách nhận tài khoản và mật khẩu sau khi đơn hoàn tất.', true
from public.categories c where c.slug = 'streaming'
on conflict (slug) do nothing;

insert into public.products (category_id, name, slug, description, image_url, price, duration, warranty_policy, delivery_guide, is_active)
select c.id, 'AI Tools hỗ trợ 1 tháng', 'ai-tools-ho-tro-1-thang',
'Gói AI Tools hỗ trợ sử dụng công cụ AI theo chính sách hợp lệ.',
'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1200&auto=format&fit=crop',
49000, '1 tháng', 'Bảo hành theo thời hạn gói.',
'Khách nhận tài khoản và mật khẩu sau khi đơn hoàn tất.', true
from public.categories c where c.slug = 'ai-tools'
on conflict (slug) do nothing;
