const fs = require('fs');
const path = require('path');

const divisionMap = [
    { folder: '01palad', jsonFile: 'products_01pl.json' },
    { folder: '02fin', jsonFile: 'products_02fin.json' },
    { folder: '03eng', jsonFile: 'products_03eng.json' },
    { folder: '04ed', jsonFile: 'products_04ed.json' },
    { folder: '05wel', jsonFile: 'products_05wel.json' },
    { folder: '06ph', jsonFile: 'products_06ph.json' },
    { folder: '06ph_fr', jsonFile: 'products_06ph_fr.json' }
];

console.log('🚀 กำลังเริ่มสแกนจับคู่รูปภาพทุกนามสกุล (.jpg, .png, .wdp, .jxr) เข้ากับไฟล์ JSON...\n');

let totalUpdated = 0;

divisionMap.forEach(({ folder, jsonFile }) => {
    const folderPath = path.join(__dirname, 'products', folder);
    const jsonPath = path.join(__dirname, jsonFile);

    if (!fs.existsSync(folderPath) || !fs.existsSync(jsonPath)) {
        console.log(`⚠️ ไม่พบโฟลเดอร์หรือไฟล์ JSON: ${folder} / ${jsonFile}`);
        return;
    }

    // สแกนไฟล์ภาพจริงทุกนามสกุลที่พบในโปรเจกต์
    const realImages = fs.readdirSync(folderPath).filter(file => 
        /\.(jpg|jpeg|png|webp|wdp|jxr)$/i.test(file)
    );

    const rawData = fs.readFileSync(jsonPath, 'utf8');
    let items = JSON.parse(rawData);

    items = items.map((item, index) => {
        let matchedImage = null;
        const itemId = item.id || item.item_id;

        // 1. ค้นหาไฟล์ภาพจาก ID พัสดุ (เช่น 01pl_01, 04ed_01, 06ph_fr_01)
        if (itemId) {
            const cleanId = String(itemId).toLowerCase();
            matchedImage = realImages.find(img => {
                const imgLower = img.toLowerCase();
                return imgLower.startsWith(cleanId + '_') || imgLower.startsWith(cleanId + '.');
            });
        }

        // 2. ถ้าหาด้วย ID ไม่พบ ให้ลองค้นหาด้วยชื่อไฟล์เดิม (ตัดนามสกุลออก)
        if (!matchedImage && item.image) {
            const baseName = path.basename(item.image, path.extname(item.image)).toLowerCase();
            matchedImage = realImages.find(img => 
                path.basename(img, path.extname(img)).toLowerCase() === baseName
            );
        }

        // 3. ถ้ายังไม่เจอ ให้แมปตามลำดับ Index ของไฟล์ภาพจริงที่มีอยู่
        if (!matchedImage && realImages[index]) {
            matchedImage = realImages[index];
        }

        if (matchedImage) {
            const relativePath = `products/${folder}/${matchedImage}`;
            item.image = relativePath;
            item.image_url = relativePath;
            totalUpdated++;
        }
        return item;
    });

    fs.writeFileSync(jsonPath, JSON.stringify(items, null, 2), 'utf8');
    console.log(`  ✅ อัปเดต ${jsonFile} เรียบร้อยแล้ว (${items.length} รายการ)`);
});

console.log(`\n🎉 แมปปิ้งรูปภาพสำเร็จทั้งหมด ${totalUpdated} รายการ!`);