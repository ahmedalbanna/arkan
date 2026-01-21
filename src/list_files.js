const fs = require('fs');
const path = require('path');

/**
 * دالة مُتكررة (Recursive) لسرد الملفات والمجلدات.
 * @param {string} currentPath - المسار الحالي الذي يتم فحصه.
 */
function listAllFiles(currentPath) {
    try {
        // قراءة محتويات المجلد الحالي (ملفات ومجلدات)
        const items = fs.readdirSync(currentPath, { withFileTypes: true });

        // طباعة اسم المجلد الحالي
        console.log(`\n--- folder: ${currentPath} ---`);

        let filesFound = false;

        items.forEach(item => {
            const fullPath = path.join(currentPath, item.name);

            if (item.isDirectory()) {
                // إذا كان مجلد، استدعاء الدالة بشكل متكرر للمجلد الداخلي
                listAllFiles(fullPath);
            } else if (item.isFile()) {
                // إذا كان ملف، طباعة اسمه
                console.log(`  [file] ${item.name}`);
                filesFound = true;
            }
            // تجاهل الروابط الرمزية (symlinks) والعناصر الأخرى
        });

        // هذا الجزء اختياري: يمكن استخدامه للإشارة إلى عدم وجود ملفات في مجلد معين
        // if (!filesFound && items.length > 0) {
        //     console.log("  (لا توجد ملفات مباشرة في هذا المجلد)");
        // }

    } catch (err) {
        // التعامل مع أخطاء الأذونات أو عدم وجود المسار
        console.error(`\nError accessing path${currentPath}: ${err.message}`);
    }
}

// تحديد المسار الأولي ليكون المسار الحالي الذي تم تشغيل السكريبت منه
const startPath = process.cwd();

console.log(`Start searching for files from the path: ${startPath}`);

// استدعاء الدالة لبدء العملية
listAllFiles(startPath);

console.log("\n--- Search completed---");
