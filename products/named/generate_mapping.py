import os
import json
import re
import pandas as pd

# 1. กำหนดโฟลเดอร์ภาษาไทยเดิม และโฟลเดอร์ภาษาอังกฤษใหม่ที่รันเสร็จแล้ว
BACKUP_FOLDER = r"D:\kmart\products\named"
ENGLISH_FOLDER = r"D:\kmart\products"

DEPARTMENT_MAP = {
    "สำนักปลัด": "01palad",
    "กองคลัง": "02fin",
    "กองช่าง": "03eng",
    "กองการศึกษา": "04ed",
    "กองศึกษา": "04ed",
    "กองสวัสดิการสังคม": "05wel",
    "กองสาธารณสุข": "06ph"
}

products_database = []

# อ่านไฟล์จากโฟลเดอร์ภาษาไทยเดิม
for dirpath, dirnames, filenames in os.walk(BACKUP_FOLDER):
    folder_name = os.path.basename(dirpath)
    
    dept_code = "other"
    for dept_key, prefix in DEPARTMENT_MAP.items():
        if dept_key in folder_name:
            dept_code = prefix
            break
            
    for filename in filenames:
        name, ext = os.path.splitext(filename)
        if ext.lower() in ['.png', '.jpg', '.jpeg', '.gif', '.pdf', '.xlsx', '.docx']:
            
            display_name_th = name 
            
            # ค้นหาไฟล์ภาษาอังกฤษที่จับคู่กันในโฟลเดอร์ใหม่
            eng_dept_dir = os.path.join(ENGLISH_FOLDER, dept_code)
            matched_github_file = ""
            
            if os.path.exists(eng_dept_dir):
                eng_files = os.listdir(eng_dept_dir)
                # ดึงตัวเลขลำดับหน้าชื่อไฟล์มาจับคู่
                prefix_num = re.search(r'^\d+', name)
                if prefix_num:
                    num_str = prefix_num.group()
                    for ef in eng_files:
                        if ef.startswith(f"{dept_code}_{num_str}_") or ef.startswith(f"{dept_code}_{num_str}."):
                            matched_github_file = ef
                            break
            
            # หากหาไม่เจอ ให้ใช้รูปแบบประมาณการณ์
            if not matched_github_file:
                matched_github_file = f"{dept_code}_{name}{ext.lower()}"

            github_url = f"https://raw.githubusercontent.com/[USER]/[REPO]/main/products/{dept_code}/{matched_github_file}"

            products_database.append({
                "dept_code": dept_code,
                "name_th": display_name_th,
                "image_filename": matched_github_file,
                "image_url": github_url
            })

# บันทึกไฟล์
output_json = os.path.join(BACKUP_FOLDER, 'products_data.json')
output_excel = os.path.join(BACKUP_FOLDER, 'products_data.xlsx')

with open(output_json, 'w', encoding='utf-8') as f:
    json.dump(products_database, f, ensure_ascii=False, indent=4)

df = pd.DataFrame(products_database)
df.to_excel(output_excel, index=False)

print("\n--------------------------------------------------")
print("ทำรายการสำเร็จอย่างรวดเร็ว!")
print(f"บันทึกไฟล์เรียบร้อยที่: {BACKUP_FOLDER}")
print("--------------------------------------------------")