const fs = require('fs');
const path = require('path');

const DATABASE_URL = "https://kmart-cf668-default-rtdb.asia-southeast1.firebasedatabase.app/";

const jsonFiles = [
    'products_01pl.json',
    'products_02fin.json',
    'products_03eng.json',
    'products_04ed.json',
    'products_05wel.json',
    'products_06ph.json',
    'products_06ph_fr.json'
];

let materialsObject = {};

jsonFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf8');
        const items = JSON.parse(raw);
        
        items.forEach((item, index) => {
            const rawId = item.id || item.item_id || `${file.replace('.json','')}_${index}`;
            const cleanId = String(rawId).replace(/[.#$/[\]]/g, "_");

            // บันทึกฟิลด์ให้รองรับทั้งโครงสร้าง id/name และ item_id/item_name
            materialsObject[cleanId] = {
                id: cleanId,
                item_id: cleanId,
                name: item.name || item.item_name || '',
                item_name: item.name || item.item_name || '',
                division: item.division || '',
                quantity: Number(item.quantity ?? item.stock_remaining ?? 0),
                stock_remaining: Number(item.quantity ?? item.stock_remaining ?? 0),
                unit: item.unit || '',
                price: Number(item.price ?? item.price_unit_coin ?? 0),
                price_unit_coin: Number(item.price ?? item.price_unit_coin ?? 0),
                image: item.image || item.image_url || '',
                image_url: item.image || item.image_url || ''
            };
        });
    }
});

console.log(`📦 รวมข้อมูลสำเร็จเตรียมอัปโหลด: ${Object.keys(materialsObject).length} รายการ`);

fetch(`${DATABASE_URL}materials.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(materialsObject)
})
.then(res => res.json())
.then(data => {
    console.log('🚀 อัปโหลดข้อมูลชุดสมบูรณ์ขึ้น Firebase Realtime Database เรียบร้อยแล้ว!');
})
.catch(err => {
    console.error('❌ เกิดข้อผิดพลาดในการอัปโหลด:', err);
});