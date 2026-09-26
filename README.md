# BARKHO — متجر Print-on-Demand

موقع ثابت (HTML/CSS/JS) + Netlify Functions للدفع والربط مع Printful، بنفس أسلوب موقع Babylon Pizza (Netlify + Supabase).

## هيكل المشروع

```
index.html                          الصفحة الرئيسية: هيرو + شبكة المنتجات + سلة الشراء
success.html / cancel.html          صفحات ما بعد الدفع
styles.css                          كل التصميم (الألوان، الخطوط، التخطيط)
script.js                           منطق الواجهة: عرض المنتجات، السلة (محفوظة في localStorage)، فتح نافذة اختيار المقاس
products.js                         مصدر واحد للمنتجات والأسعار ومعرفات Printful — تُستخدم من الواجهة ومن الدوال الخلفية معاً
netlify/functions/create-checkout-session.js   ينشئ جلسة دفع Stripe (يحسب السعر من products.js وليس مما يرسله المتصفح)
netlify/functions/stripe-webhook.js            عند نجاح الدفع: ينشئ طلب تصنيع في Printful ويسجل الطلب في Supabase
supabase-schema.sql                 جدول orders لتتبع الطلبات
.env.example                        قائمة المتغيرات البيئية المطلوبة
```

## خطوات الإعداد

### 1. الدومين والاستضافة
- اشترِ الدومين (barkho.com أو ما يعادله).
- ادفع هذا المجلد كموقع جديد على Netlify (نفس طريقة Babylon Pizza): اسحب المجلد على app.netlify.com، أو اربطه بمستودع Git.
- بعد النشر، اربط الدومين من إعدادات الموقع في Netlify.

### 2. Stripe
- أنشئ حساب على stripe.com، فعّل وضع الاختبار (Test mode) أولاً.
- من Developers > API keys خذ الـ Secret key وضعه في `STRIPE_SECRET_KEY`.
- بعد أول نشر، أضف Webhook endpoint في Stripe: الرابط هو
  `https://YOUR-DOMAIN/.netlify/functions/stripe-webhook`
  اختر الحدث `checkout.session.completed`، وخذ الـ Signing secret وضعه في `STRIPE_WEBHOOK_SECRET`.

### 3. Supabase
- أنشئ مشروع جديد (أو استخدم مشروعاً منفصلاً عن Babylon Pizza حتى لا تختلط البيانات).
- شغّل محتوى `supabase-schema.sql` في SQL Editor لإنشاء جدول `orders`.
- من Settings > API خذ `SUPABASE_URL` و`service_role key` (وليس الـ anon key، لأن الدالة الخلفية تحتاج صلاحية الكتابة الكاملة).

### 4. Printful
- افتح حساب على printful.com، أنشئ متجراً (Store)، واختر "Manual order platform / API" كطريقة الربط (لا تحتاج Shopify).
- من Settings > Stores خذ الـ Store ID، ومن developers.printful.com أنشئ Private Token.
- ارفع تصاميمك الحقيقية وأنشئ المنتجات في Printful، ثم من صفحة كل متغيّر (variant) — مقاس/لون — انسخ الـ Variant ID.
- **مهم:** افتح `products.js` واستبدل كل `printfulVariantId: 0` بالرقم الحقيقي المطابق لكل مقاس. الطلب لن يُرسل لـ Printful لأي مقاس تُرك بقيمة 0 (سترى تحذيراً في سجلات الدالة).

### 5. متغيرات البيئة
انسخ كل القيم من `.env.example` إلى Netlify: Site configuration > Environment variables، ثم أعد نشر الموقع (Trigger deploy) حتى تُقرأ القيم الجديدة.

## ملاحظة أمان مهمة
دالة `create-checkout-session.js` تحسب السعر دائماً من `products.js` على الخادم، وتتجاهل أي سعر قد يُرسل من المتصفح — هذا يمنع أي شخص من التلاعب بالسعر عبر أدوات المطوّر في المتصفح.

## طلبات Printful تُترك كمسودة (Draft) عمداً
دالة الـ webhook لا تضيف `"confirm": true` عند إنشاء الطلب في Printful، فتبقى الطلبات في حالة "مسودة" حتى تراجعها وتؤكدها يدوياً من لوحة Printful. بعد ما تتأكد إن كل الـ Variant IDs صحيحة وشغّالة بثقة، تقدر تضيف `"confirm": true` في `stripe-webhook.js` ليصبح التأكيد تلقائياً.

## أشياء منطقي تضيفها لاحقاً
- صفحة إدارة بسيطة (شبيهة بلوحة Babylon Pizza) تعرض جدول `orders` من Supabase مباشرة بدل النظر فيه من SQL Editor.
- نقل كتالوج المنتجات من `products.js` إلى جدول في Supabase إذا صار عندك عدد كبير من التصاميم وتحتاج تعديلها بدون نشر كود جديد.
- Vipps كوسيلة دفع إضافية بعد ما تسجل نشاطك التجاري رسمياً في النرويج (enkeltpersonforetak أو AS).
