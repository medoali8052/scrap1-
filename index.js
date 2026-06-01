const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json()); // عشان نفهم البيانات اللي جاية بصيغة JSON

// المتغيرات دي هنخفيها في إعدادات السيرفر عشان الأمان
const TIKWM_API_KEY = process.env.TIKWM_API_KEY; 
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

app.get('/', (req, res) => {
    res.send("🚀 السيرفر يعمل بنجاح! جاهز لاستقبال الطلبات.");
});

// المسار اللي هنشغله عشان يسحب الصور ويبعتها لـ n8n
app.post('/fetch-and-send', async (req, res) => {
    // هتبعت الكلمة البحثية أو الرابط في الطلب
    const { keywords } = req.body; 

    try {
        console.log("⏳ جاري جلب البيانات من TikWM...");
        
        // 1. الاتصال بـ TikWM API (الجزء الخاص بـ Search Photo)
        // ملحوظة: راجع الـ Docs لو محتاج تغير البارامترات (keywords, cursor, size)
        const tikwmResponse = await axios.post('https://tikwmapi.com/api/search/user', { // استبدل الرابط بالمسار الدقيق للـ search photo من الدوكيومنتيشن
            keywords: keywords,
            count: 10
        }, {
            headers: {
                'Authorization': `Bearer ${TIKWM_API_KEY}` // وضع الـ API Key
            }
        });

        const photosData = tikwmResponse.data;

        console.log("✅ تم جلب البيانات، جاري الإرسال إلى n8n...");

        // 2. إرسال البيانات اللي جبناها لـ n8n
        const n8nResponse = await axios.post(N8N_WEBHOOK_URL, {
            event: "tiktok_photo_search",
            search_query: keywords,
            data: photosData
        });

        // 3. رد السيرفر بنجاح العملية
        res.json({ 
            status: "success", 
            message: "تم سحب الصور وإرسالها إلى n8n بنجاح! 🚀",
            n8n_status: n8nResponse.status 
        });

    } catch (error) {
        console.error("❌ حدث خطأ:", error.message);
        res.status(500).json({ status: "error", error: error.message });
    }
});

// Hugging Face Spaces بيشغل التطبيقات أوتوماتيك على بورت 7860
const PORT = process.env.PORT || 7860; 
app.listen(PORT, () => {
    console.log(`✅ السيرفر شغال على بورت ${PORT}`);
});
