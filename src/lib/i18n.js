export const LANGS = { ar: { dir: 'rtl', label: 'العربية' }, en: { dir: 'ltr', label: 'English' } }

const dict = {
  appTitle: { ar: 'سجل الدرجات', en: 'Grade register' },
  roleGrader: { ar: 'مصحّح', en: 'Grader' },
  roleMta: { ar: 'MTA', en: 'MTA' },
  graderTagline: { ar: 'ارفع كشف المسح، فلتر، وأدخل الدرجات', en: 'Upload the scan sheet, filter, enter grades' },
  mtaTagline: { ar: 'ارفع الملف المصحّح واقرأ درجات طلابك', en: 'Upload a graded file and read your students’ grades' },

  drop: { ar: 'اسحب ملف CSV أو Excel هنا', en: 'Drop a CSV or Excel file here' },
  browse: { ar: 'اختر ملفاً', en: 'Choose file' },
  loading: { ar: 'جارٍ القراءة…', en: 'Reading…' },
  rowsLoaded: { ar: 'سطر', en: 'rows' },
  changeFile: { ar: 'تغيير الملف', en: 'Change file' },
  missingCols: { ar: 'لم يتم العثور على أعمدة مطلوبة:', en: 'Missing required columns:' },
  noGradeCol: {
    ar: 'هذا الملف لا يحتوي عمود Grade. ارفع ملفاً تم تصديره من واجهة المصحّح.',
    en: 'This file has no Grade column. Upload a file exported from the grader view.',
  },

  filters: { ar: 'الفلاتر', en: 'Filters' },
  center: { ar: 'المعهد', en: 'Institute' },
  ct: { ar: 'المادة والمدرّس', en: 'Subject & teacher' },
  cohort: { ar: 'الشعبة', en: 'Cohort' },
  sessionName: { ar: 'الامتحان', en: 'Exam' },
  sessionType: { ar: 'نوع الجلسة', en: 'Session type' },
  scanDate: { ar: 'التاريخ', en: 'Date' },
  scannedBy: { ar: 'المساعد الماسح', en: 'Scanned by' },
  gender: { ar: 'الجنس', en: 'Gender' },
  all: { ar: 'الكل', en: 'All' },
  search: { ar: 'ابحث بالاسم أو الرقم', en: 'Search by name or id' },
  reset: { ar: 'مسح الفلاتر', en: 'Clear filters' },

  grader: { ar: 'اسم المصحّح', en: 'Grader name' },
  fillAll: { ar: 'تعبئة الظاهر بـ', en: 'Fill visible with' },
  apply: { ar: 'تطبيق', en: 'Apply' },
  clearGrades: { ar: 'مسح درجات الظاهر', en: 'Clear visible grades' },

  student: { ar: 'الطالب', en: 'Student' },
  studentId: { ar: 'الرقم', en: 'Id' },
  grade: { ar: 'الدرجة (من 100)', en: 'Grade (of 100)' },
  entered: { ar: 'مُدخلة', en: 'entered' },
  of: { ar: 'من', en: 'of' },
  average: { ar: 'المعدل', en: 'Average' },
  highest: { ar: 'أعلى', en: 'Highest' },
  lowest: { ar: 'أدنى', en: 'Lowest' },

  exportCsv: { ar: 'تصدير CSV', en: 'Export CSV' },
  exportXlsx: { ar: 'تصدير Excel', en: 'Export Excel' },
  exportHint: {
    ar: 'يُصدَّر السطر المفلتر فقط، مع عمود الدرجة.',
    en: 'Exports the filtered rows, with the grade column added.',
  },
  exportAll: { ar: 'تصدير كل الأسطر', en: 'Export all rows' },
  exportFiltered: { ar: 'تصدير المفلتر', en: 'Export filtered' },

  noRows: { ar: 'لا نتائج بهذه الفلاتر.', en: 'No rows match these filters.' },
  emptyGrade: { ar: 'بدون درجة', en: 'No grade' },
  savedLocally: { ar: 'الدرجات محفوظة في هذا المتصفح', en: 'Grades saved in this browser' },
  outOfRange: { ar: 'خارج المدى', en: 'Out of range' },
  gradedBy: { ar: 'المصحّح', en: 'Graded by' },
  distribution: { ar: 'توزيع الدرجات', en: 'Grade distribution' },
}

export function makeT(lang) {
  return (key) => (dict[key] ? dict[key][lang] ?? dict[key].en : key)
}
